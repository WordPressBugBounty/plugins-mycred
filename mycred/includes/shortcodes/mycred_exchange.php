<?php
if ( ! defined( 'myCRED_VERSION' ) ) exit;

/**
 * myCRED Shortcode: mycred_exchange
 * This shortcode will return an exchange form allowing users to
 * exchange one point type for another.
 * @see http://codex.mycred.me/shortcodes/mycred_exchange/
 * @since 1.5
 * @version 1.1
 */
if ( ! function_exists( 'mycred_render_shortcode_exchange' ) ) :
	function mycred_render_shortcode_exchange( $atts, $content = '' ) {

		if ( ! is_user_logged_in() ) return $content;

		extract( shortcode_atts( array(
			'from'   => '',
			'to'     => '',
			'rate'   => 1,
			'min'    => 1,
			'button' => 'Exchange'
		), $atts, MYCRED_SLUG . '_exchange' ) );

		if ( $from == '' || $to == '' ) return '';

		if ( ! mycred_point_type_exists( $from ) || ! mycred_point_type_exists( $to ) ) return __( 'Point type not found.', 'mycred' );

		$user_id     = get_current_user_id();
		$mycred_from = mycred( $from );
		if ( $mycred_from->exclude_user( $user_id ) )
			return sprintf( apply_filters( 'excluded_from_msg', __( 'You are excluded from using %s.', 'mycred' ) ), $mycred_from->plural() );

		$balance     = $mycred_from->get_users_balance( $user_id, $from );
		if ( $balance < $mycred_from->number( $min ) )
			return apply_filters( 'check_balance_msg', __( 'Your balance is too low to use this feature', 'mycred' ) );

		$mycred_to   = mycred( $to );
		if ( $mycred_to->exclude_user( $user_id ) )
			return sprintf( apply_filters( 'excluded_to_msg', __( 'You are excluded from using %s.', 'mycred' ) ) , $mycred_to->plural() );

		global $mycred_exchange;

		$rate        = apply_filters( 'mycred_exchange_rate', $rate, $mycred_from, $mycred_to );
		$token       = mycred_create_token( array( $from, $to, $user_id, $rate, $min ) );

		ob_start();

?>
<div class="mycred-exchange">

	<?php echo wp_kses_post( $content ); ?>

	<?php if ( isset( $mycred_exchange['message'] ) ) : ?>
	<div class="alert alert-<?php if ( $mycred_exchange['success'] ) echo 'success'; else echo 'warning'; ?>"><?php echo esc_html( $mycred_exchange['message'] ); ?></div>
	<?php endif; ?>

	<form action="" method="post" class="form">
		<div class="row">
			<div class="col-lg-3 col-md-3 col-sm-12 col-xs-12 mycred-exchange-current-balance">
				<div class="form-group">
					<label><?php printf( esc_html__( 'Your current %s balance', 'mycred' ), esc_html( $mycred_from->singular() ) ); ?></label>
					<p class="form-control-static"><?php echo esc_html( $mycred_from->format_creds( $balance ) ); ?></p>
				</div>
			</div>
			<div class="col-lg-3 col-md-3 col-sm-12 col-xs-12 mycred-exchange-current-amount">
				<div class="form-group">
					<label for="mycred-exchange-amount"><?php esc_html_e( 'Amount', 'mycred' ); ?></label>
					<input type="text" size="20" placeholder="<?php printf( esc_attr__( 'Minimum %s', 'mycred' ), esc_attr( $mycred_from->format_creds( $min ) ) ); ?>" value="" class="form-control" id="mycred-exchange-amount" name="mycred_exchange[amount]" />
				</div>
			</div>
			<div class="col-lg-3 col-md-3 col-sm-12 col-xs-12 mycred-exchange-current-rate">
				<div class="form-group">
					<label><?php esc_html_e( 'Exchange Rate', 'mycred' ); ?></label>
					<p class="form-control-static"><?php printf( wp_kses_post( '1 %s = <span class="rate">%s</span> %s', 'mycred' ), esc_html( $mycred_from->singular() ), esc_html( $rate ), ( ( $rate == 1 ) ? esc_html( $mycred_to->singular() ) : esc_html( $mycred_to->plural() ) ) ); ?></p>
				</div>
			</div>
			<div class="col-lg-3 col-md-3 col-sm-12 col-xs-12 mycred-exchange-current-submit">
				<div class="form-group">
					<input type="submit" class="btn btn-primary btn-lg btn-block" value="<?php echo esc_attr( $button ); ?>" />
				</div>
			</div>
		</div>
		<input type="hidden" name="mycred_exchange[token]" value="<?php echo esc_attr( $token ); ?>" />
		<input type="hidden" name="mycred_exchange[nonce]" value="<?php echo esc_attr( wp_create_nonce( 'mycred-exchange' ) ); ?>" />
	</form>

</div>
<?php

		$output = ob_get_contents();
		ob_end_clean();

		return apply_filters( 'mycred_exchange_output', $output, $atts );

	}
endif;
add_shortcode( MYCRED_SLUG . '_exchange', 'mycred_render_shortcode_exchange' );

/**
 * Post that received the exchange form.
 */
if ( ! function_exists( 'mycred_exchange_current_post_id' ) ) :
	function mycred_exchange_current_post_id() {

		$post_id = 0;

		if ( isset( $_GET['p'] ) )
			$post_id = absint( wp_unslash( $_GET['p'] ) );

		if ( $post_id < 1 && isset( $_GET['page_id'] ) )
			$post_id = absint( wp_unslash( $_GET['page_id'] ) );

		if ( $post_id < 1 && ! empty( $_SERVER['REQUEST_URI'] ) ) {
			$path = wp_parse_url( wp_unslash( $_SERVER['REQUEST_URI'] ), PHP_URL_PATH );
			if ( is_string( $path ) && $path !== '' )
				$post_id = url_to_postid( home_url( $path ) );
		}

		return $post_id;

	}
endif;

/**
 * Rate and minimum from the shortcode saved on the post.
 */
if ( ! function_exists( 'mycred_exchange_terms_from_post' ) ) :
	function mycred_exchange_terms_from_post( $from, $to ) {

		$post = get_post( mycred_exchange_current_post_id() );
		if ( ! $post instanceof WP_Post ) return false;

		$pattern = get_shortcode_regex( array( MYCRED_SLUG . '_exchange' ) );
		if ( ! preg_match_all( '/' . $pattern . '/s', $post->post_content, $found, PREG_SET_ORDER ) ) return false;

		foreach ( $found as $shortcode ) {
			$atts = shortcode_parse_atts( isset( $shortcode[3] ) ? $shortcode[3] : '' );
			if ( ! is_array( $atts ) )
				$atts = array();

			$atts = shortcode_atts( array(
				'from' => '',
				'to'   => '',
				'rate' => 1,
				'min'  => 1,
			), $atts, MYCRED_SLUG . '_exchange' );

			if ( (string) $atts['from'] === (string) $from && (string) $atts['to'] === (string) $to ) {
				return array(
					'rate' => $atts['rate'],
					'min'  => $atts['min'],
				);
			}
		}

		return false;

	}
endif;

/**
 * Catch Exchange
 * Intercepts and executes exchange requests.
 * @since 1.5
 * @version 1.1
 */
if ( ! function_exists( 'mycred_catch_exchange_requests' ) ) :
	function mycred_catch_exchange_requests() {

		if ( ! isset( $_POST['mycred_exchange']['nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['mycred_exchange']['nonce'] ) ), 'mycred-exchange' ) ) return;

		$post_token  = isset( $_POST['mycred_exchange']['token'] ) ? sanitize_text_field( wp_unslash( $_POST['mycred_exchange']['token'] ) ) : false;

		// Decode token
		$token       = mycred_verify_token( $post_token, 5 );
		if ( $token === false ) return;

		global $mycred_exchange;
		list ( $from, $to ) = $token;

		// Check point types
		$types       = mycred_get_types();
		if ( ! array_key_exists( $from, $types ) || ! array_key_exists( $to, $types ) || $from === $to ) {
			$mycred_exchange = array(
				'success' => false,
				'message' => apply_filters( 'check_point_type_message', __( 'Point types not found.', 'mycred') )
			);
			return;
		}

		$terms = mycred_exchange_terms_from_post( $from, $to );
		if ( $terms === false ) {
			$mycred_exchange = array(
				'success' => false,
				'message' => __( 'Exchange could not be verified.', 'mycred' )
			);
			return;
		}

		$rate        = $terms['rate'];
		$min         = $terms['min'];
		$user_id     = get_current_user_id();

		// Check for exclusion
		$mycred_from = mycred( $from );
		if ( $mycred_from->exclude_user( $user_id ) ) {
			$mycred_exchange = array(
				'success' => false,
				'message' => sprintf( apply_filters( 'check_from_exclusion_message', __( 'You are excluded from using %s.', 'mycred' ) ), $mycred_from->plural() )
			);
			return;
		}

		// Check balance
		$balance     = $mycred_from->get_users_balance( $user_id, $from );
		if ( $balance < $mycred_from->number( $min ) ) {
			$mycred_exchange = array(
				'success' => false,
				'message' => apply_filters( 'check_balance_message', __( 'Your balance is too low to use this feature', 'mycred' ) )
			);
			return;
		}

		// Check for exclusion
		$mycred_to   = mycred( $to );
		$rate        = apply_filters( 'mycred_exchange_rate', $rate, $mycred_from, $mycred_to );
		if ( $mycred_to->exclude_user( $user_id ) ) {
			$mycred_exchange = array(
				'success' => false,
				'message' => sprintf( apply_filters( 'check_to_exclusion_message', __( 'You are excluded from using' . '%s.', 'mycred' ) ), $mycred_to->plural() )
			);
			return;
		}

		// Prep Amount
		$amount      = isset( $_POST['mycred_exchange']['amount'] ) ? abs( sanitize_text_field( wp_unslash( $_POST['mycred_exchange']['amount'] ) ) ) : 0;
		$amount      = $mycred_from->number( $amount );

		// Make sure we are sending more then minimum
		if ( $amount < $min ) {
			$mycred_exchange = array(
				'success' => false,
				'message' => sprintf( apply_filters( 'You must exchange at least', __( 'You must exchange at least %s!', 'mycred' ) ), $mycred_from->format_creds( $min ) )
			);
			return;
		}

		// Make sure we have enough points
		if ( $amount > $balance ) {
			$mycred_exchange = array(
				'success' => false,
				'message' => apply_filters( 'enough_point_message', __( 'Insufficient Funds. Please try a lower amount.', 'mycred' ) )
			);
			return;
		}

		// Let others decline
		$reply       = apply_filters( 'mycred_decline_exchange', false, compact( 'from', 'to', 'user_id', 'rate', 'min', 'amount' ) );
		if ( $reply === false ) {

			$mycred_from->add_creds(
				'exchange',
				$user_id,
				0-$amount,
				sprintf( __( 'Exchange from %s', 'mycred' ), $mycred_from->plural() ),
				0,
				array( 'from' => $from, 'rate' => $rate, 'min' => $min ),
				$from
			);

			$exchanged = $mycred_to->number( ( $amount * $rate ) );

			$mycred_to->add_creds(
				'exchange',
				$user_id,
				$exchanged,
				sprintf( __( 'Exchange to %s', 'mycred' ), $mycred_to->plural() ),
				0,
				array( 'to' => $to, 'rate' => $rate, 'min' => $min ),
				$to
			);

			$mycred_exchange = array(
				'success' => true,
				'message' => sprintf( apply_filters( 'successfully_exchange_message', __( 'You have successfully exchanged %s into %s.', 'mycred' ) ) , $mycred_from->format_creds( $amount ), $mycred_to->format_creds( $exchanged ) )
			);

		}
		else {

			$mycred_exchange = array(
				'success' => false,
				'message' => $reply
			);
			return;

		}

	}
endif;
add_action( 'mycred_init', 'mycred_catch_exchange_requests', 100 );
