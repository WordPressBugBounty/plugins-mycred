<?php
if ( ! defined( 'myCRED_VERSION' ) ) exit;

/**
 * Hook for affiliations
 * @since 1.4
 * @version 1.3.1
 */
if ( ! class_exists( 'myCRED_Hook_Affiliate' ) ) :
	class myCRED_Hook_Affiliate extends myCRED_Hook {

		public $ref_key  = '';
		public $limit_by = array();

		/**
		 * Construct
		 */
		function __construct( $hook_prefs, $type = MYCRED_DEFAULT_TYPE_KEY ) {

            $hook_defaults = array(
                'id'       => 'affiliate',
                'defaults' => array(
                    'visit'    => array(
                        'creds'    => 1,
                        'log'      => '%plural% for referring a visitor',
                        'limit'    => 1,
                        'limit_by' => 'total'
                    ),
                    'signup'    => array(
                        'creds'    => 10,
                        'log'      => '%plural% for referring a new member',
                        'limit'    => 1,
                        'limit_by' => 'total'
                    ),
                    'setup' => array(
                        'links'    => 'username',
                        'IP'       => 1
                    ),
                    'buddypress' => array(
                        'profile'  => 0,
                        'invite'   => 0,
                        'priority' => 10,
                        'title'    => __( 'Affiliate Program', 'mycred' ),
                        'desc'     => ''
                    )
                )
            );

            $hook_defaults = apply_filters( 'mycred_hook_referrals', $hook_defaults );

            parent::__construct( $hook_defaults , $hook_prefs, $type );

			// Let others play with the limit by
			$this->limit_by = apply_filters( 'mycred_affiliate_limit_by', array(
				'total' => __( 'Total', 'mycred' ),
				'daily' => __( 'Per Day', 'mycred' )
			), $this );

			// Let others play with the ref key
			$this->ref_key = apply_filters( 'mycred_affiliate_key', 'mref', $this );

			add_filter( 'mycred_parse_log_entry_signup_referral', array( $this, 'parse_log_entry' ), 10, 2 );
			add_action( 'wp_footer', 'copy_ref_link' );

			if ( function_exists( 'bp_get_members_invitations_allowed' ) && bp_get_members_invitations_allowed() && $this->prefs['buddypress']['invite'] )
				add_filter( 'bp_email_set_tokens', array( $this, 'set_mycred_referral_code' ), 10, 3 );

		}

		/**
		 * Run
		 * @since 1.4
		 * @version 1.2.1
		 */
		public function run() {

			// Insert into BuddyPress profile
			if ( function_exists( 'bp_is_active' ) && bp_is_active( 'xprofile' ) && $this->prefs['buddypress']['profile'] )
				add_action( 'bp_after_profile_loop_content', array( $this, 'buddypress_profile' ), $this->prefs['buddypress']['priority'] );

			// Hook into user activation
			if ( class_exists('pw_new_user_approve') )
				add_action( 'new_user_approve_user_approved', array( $this, 'verified_signup' ) );

			// Hook into user activation
			if ( function_exists( 'buddypress' ) )
				add_action( 'mycred_bp_user_activated', array( $this, 'verified_signup' ) );

			// Hook into user activation
			if ( class_exists('ARMember') )
				add_action( 'arm_after_add_new_user', array( $this, 'verified_signup' ), 10, 2 );

			// Register Shortcodes
			add_filter( 'mycred_affiliate_link_' . $this->mycred_type, array( $this, 'shortcode_affiliate_link' ), 10, 2 );
			add_filter( 'mycred_affiliate_id_' . $this->mycred_type,   array( $this, 'shortcode_affiliate_id' ), 10, 2 );

			add_filter( 'mycred_referral_keys', array( $this, 'add_key' ) );

			// Logged in users do not get points
			if ( is_user_logged_in() && apply_filters( 'mycred_affiliate_allow_members', false ) === false ) return;

			// Points for visits
			if ( $this->prefs['visit']['creds'] != 0 || $this->prefs['signup']['creds'] != 0 )
				add_action( 'mycred_referred_visit', array( $this, 'site_visits' ) );

			// Points for signups
			if ( $this->prefs['signup']['creds'] != 0 )
				add_action( 'mycred_referred_signup', array( $this, 'site_signup' ) );

		}

		/**
		 * Parse Log Entry
		 * Add support for user related template tags in signup referrals.
		 * @since 1.4
		 * @version 1.0
		 */
		public function parse_log_entry( $content, $entry ) {

			$user_id = absint( $entry->ref_id );
			return $this->core->template_tags_user( $content, $user_id );

		}

		/**
		 * Add Referral Key
		 * @since 1.5.3
		 * @version 1.0
		 */
		public function add_key( $keys ) {

			if ( ! isset( $_GET[ $this->ref_key ] ) || isset( $_COOKIE[ 'mycred_ref' . $this->mycred_type ] ) ) return $keys;

			if ( ! in_array( $this->ref_key, $keys ) )
				$keys[] = $this->ref_key;

			return $keys;

		}

		/**
		 * Shortcode: Affiliate Link
		 * Appends the current users affiliate link to either a given
		 * URL or if not set, the current URL. If user is not logged in,
		 * the set URL is returned. If this is not set, the shortcode
		 * will return an empty string.
		 * @since 1.4
		 * @version 1.1
		 */
		public function shortcode_affiliate_link( $content, $atts ) {

			extract( shortcode_atts( array(
				'url'     => 0,
				'user_id' => '',
				'post_id' => ''
			), $atts ) );

			if ( ! is_user_logged_in() && $user_id == '' )
				return $url;

			if ( $user_id == '' )
				$user_id = get_current_user_id();

			if ( $post_id != '' )
				$url = mycred_get_permalink( $post_id );

			return $this->get_ref_link( $user_id, $url );

		}

		/**
		 * Shortcode: Affiliate ID
		 * Returns the current users affiliate ID. Returns an empty
		 * string if the user is not logged in.
		 * @since 1.4
		 * @since 2.4.5 added @filter `mycred_affiliate_user_id`
		 * @version 1.1
		 */
		public function shortcode_affiliate_id( $content, $atts ) {

			extract( shortcode_atts( array(
				'user_id' => ''
			), $atts ) );

			if ( ! is_user_logged_in() && $user_id == '' )
				$ref_id = '';

			else {

				if ( $user_id == '' )
					$user_id = get_current_user_id();

				$ref_id = $this->get_ref_id( $user_id );

			}

			$ref_id = apply_filters( 'mycred_affiliate_user_id', $user_id );
			
			return apply_filters( 'mycred_affiliate_id', $ref_id, $atts, $this );

		}

		/**
		 * BuddyPress Profile
		 * @since 1.4
		 * @version 1.1
		 */
		public function buddypress_profile() {

			// Prep
			$output  = '';
			$user_id = bp_displayed_user_id();

			// Check for exclusion
			if ( $this->core->exclude_user( $user_id ) ) return;
			
			$users_ref_link = '';

			// If it is my profile or other members allowed to view eachothers profiles or if we are admins
			if ( bp_is_my_profile() || mycred_is_admin() ) {

				$users_ref_link = $this->get_ref_link( $user_id, home_url( '/' ) );

				$output .= '<div class="bp-widget mycred">';

				// Title if set
				if ( $this->prefs['buddypress']['title'] != '' )
					$output .= '<h4>' . $this->prefs['buddypress']['title'] . '</h4>';

				// Table
				$output .= '<table class="profile-fields">';
				$output .= sprintf( '<tr class="field_1 field_ref_link"><td class="label">%s</td><td><input type="text" value="%s" id="mref-link-buddypress-profile" readonly><button onclick="copy_to_clipBoard(this)">Copy</button></td></tr>', __( 'Link', 'mycred' ), $users_ref_link );

				// Show Visitor referral count
				if ( $this->prefs['visit']['creds'] != 0 )
					$output .= sprintf( '<tr class="field_2 field_ref_count_visit"><td class="label">%s</td><td>%s</td></tr>', __( 'Visitors Referred', 'mycred' ), mycred_count_ref_instances( 'visitor_referral', $user_id, $this->mycred_type ) );

				// Show Signup referral count
				if ( $this->prefs['signup']['creds'] != 0 )
					$output .= sprintf( '<tr class="field_3 field_ref_count_signup"><td class="label">%s</td><td>%s</td></tr>', __( 'Signups Referred', 'mycred' ), mycred_count_ref_instances( 'signup_referral', $user_id, $this->mycred_type ) );

				$output .= '</table>';

				// Description if set
				if ( ! empty( $this->prefs['buddypress']['desc'] ) )
					$output .= wpautop( wptexturize( $this->prefs['buddypress']['desc'] ) );

				$output .= '</div>';
			}

			$output = do_shortcode( $output );

			// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			echo apply_filters( 'mycred_affiliate_bp_profile', $output, $user_id, $users_ref_link, $this );

		}

		/**
		 * Visits
		 * @since 1.4
		 * @version 1.3.1
		 */
		public function site_visits() {

			// Required
			if ( ! isset( $_GET[ $this->ref_key ] ) || empty( $_GET[ $this->ref_key ] ) || isset( $_COOKIE[ 'mycred_ref' . $this->mycred_type ] ) ) return;

			// Attempt to get the user id based on the referral id
			$user_id = $this->get_user_id_from_ref_id( sanitize_text_field( wp_unslash( $_GET[ $this->ref_key ] ) ) );
			if ( $user_id !== NULL && ! is_user_logged_in() ) {

				// Attempt to get the users IP
				$remote_addr = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '';
				$IP = sanitize_key( apply_filters( 'mycred_affiliate_IP', $remote_addr, 'visit', $this ) );
				if ( $IP != '' && $IP != '0.0.0.0' ) {

					// If referral counts
					if ( $this->ref_counts( $user_id, $IP ) ) {

						if ( $this->core->has_entry( 'visitor_referral', time(), $user_id, $IP, $this->mycred_type ) ) return;

						// Award
						$this->core->add_creds(
							'visitor_referral',
							$user_id,
							$this->prefs['visit']['creds'],
							$this->prefs['visit']['log'],
							time(),
							$IP,
							$this->mycred_type
						);

					

						do_action( 'mycred_visitor_referral', $user_id, $IP, $this );

					}

					// Set cookies
					if ( ! headers_sent() ) {

						setcookie( 'mycred_ref' . $this->mycred_type, sanitize_text_field( wp_unslash( $_GET[ $this->ref_key ] ) ), apply_filters( 'mycred_affiliate_cookie', ( time()+3600*24 ), false, $this ), COOKIEPATH, COOKIE_DOMAIN );

						if ( get_option( 'users_can_register' ) && $this->prefs['signup']['creds'] > 0 )
							setcookie( 'signup_ref' . $this->mycred_type, sanitize_text_field( wp_unslash( $_GET[ $this->ref_key ] ) ), apply_filters( 'mycred_affiliate_cookie', ( time()+3600*24 ), true, $this ), COOKIEPATH, COOKIE_DOMAIN );

					}

				}

			}

		}

		/**
		 * Signups
		 * @since 1.4
		 * @version 1.2.1
		 */
		public function site_signup( $new_user_id ) {

			// Requirement
			$ref = false;
			$key = '';
			if ( isset( $_COOKIE[ 'signup_ref' . $this->mycred_type ] ) ) {
				$ref = sanitize_text_field( wp_unslash( $_COOKIE[ 'signup_ref' . $this->mycred_type ] ) );
				$key = 'signup_ref' . $this->mycred_type;
			}
			elseif ( isset( $_COOKIE[ 'mycred_ref' . $this->mycred_type ] ) ) {
				$ref = sanitize_text_field( wp_unslash( $_COOKIE[ 'mycred_ref' . $this->mycred_type ] ) );
				$key = 'mycred_ref' . $this->mycred_type;
			}

			if ( $ref === false ) return;

			// Attempt to get the user id based on the referrer
			$user_id = $this->get_user_id_from_ref_id( $ref );
			if ( $user_id === NULL ) {

				if ( ! headers_sent() )
					setcookie( $key, $ref, time()-3600, COOKIEPATH, COOKIE_DOMAIN );

				return;

			}

			// Delete Cookie
			if ( ! headers_sent() )
				setcookie( $key, $ref, time()-3600, COOKIEPATH, COOKIE_DOMAIN );

			// Attempt to get the users IP
			$remote_addr = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '';
			$IP = sanitize_key( apply_filters( 'mycred_affiliate_IP', $remote_addr, 'signup', $this ) );

			if ( $this->core->has_entry( 'signup_referral', $new_user_id, $user_id, $IP, $this->mycred_type ) ) return;


			if ( $IP != '' && $IP != '0.0.0.0' ) {

				if ( $this->core->has_entry( 'signup_referral', $new_user_id, $user_id, $IP, $this->mycred_type ) ) return;

				if ( $this->ref_counts( $user_id, $IP, 'signup' ) ) {

					// Award when users account gets activated
					if ( function_exists( 'buddypress' ) || class_exists( 'pw_new_user_approve' ) || class_exists( 'ARMember' ) ) {

						mycred_add_user_meta( $new_user_id, 'referred_by_', $this->mycred_type, $user_id, true );
						mycred_add_user_meta( $new_user_id, 'referred_by_IP_', $this->mycred_type, $IP, true );
						mycred_add_user_meta( $new_user_id, 'referred_by_type_', $this->mycred_type, $this->mycred_type, true );

					}
					// Award now
					else {

						$execute = apply_filters( 'mycred_signup_referral_execute_woo', true,  $user_id, $IP, $new_user_id , $this );

						if ( $this->core->has_entry( 'signup_referral', $new_user_id, $user_id, $IP, $this->mycred_type ) ) return;

	                    if ( $execute === true ) {
							$this->core->add_creds(
								'signup_referral',
								$user_id,
								$this->prefs['signup']['creds'],
								$this->prefs['signup']['log'],
								$new_user_id,
								$IP,
								$this->mycred_type
							);

						}

						do_action( 'mycred_signup_referral', $user_id, $IP, $new_user_id, $this );

					}

				}

			}

		}

		/**
		 * Verified Signup
		 * If signups need to be verified, award points now.
		 * @since 1.5
		 * @version 1.0
		 */
		public function verified_signup( $user_id, $post = array() ) {

			if( ! is_object($user_id) ) {
				$user_id = $user_id;
			}
			else {
				$user_id = $user_id->ID;
			}

			// Check if there is a referral
			$referred_by    = mycred_get_user_meta( $user_id, 'referred_by_', $this->mycred_type, true );
			$referred_by_IP = mycred_get_user_meta( $user_id, 'referred_by_IP_', $this->mycred_type, true );
			$referred_type  = mycred_get_user_meta( $user_id, 'referred_by_type_', $this->mycred_type, true );

			if ( $referred_by == '' || $referred_by_IP == '' || $this->mycred_type != $referred_type ) return;

			if ( $this->core->has_entry( 'signup_referral', $user_id, $referred_by, $referred_by_IP, $this->mycred_type ) ) return;

			// Award
			$this->core->add_creds(
				'signup_referral',
				$referred_by,
				$this->prefs['signup']['creds'],
				$this->prefs['signup']['log'],
				$user_id,
				$referred_by_IP,
				$this->mycred_type
			);

			do_action( 'mycred_signup_referral', $referred_by, $referred_by_IP, $user_id, $this );

			// Clean up
			mycred_delete_user_meta( $user_id, 'referred_by_', $this->mycred_type );
			mycred_delete_user_meta( $user_id, 'referred_by_IP_', $this->mycred_type );
			mycred_delete_user_meta( $user_id, 'referred_by_type_', $this->mycred_type );

		}

		/**
		 * Get Ref Link
		 * Returns a given users referral id with optional url appended.
		 * @since 1.4
		 * @version 1.0.1
		 */
		public function get_ref_link( $user_id = '', $url = '' ) {

			// User ID is required
			if ( empty( $user_id ) || $user_id === 0 ) return '';

			// Get Ref ID
			$ref_id = $this->get_ref_id( $user_id );
			if ( $ref_id === NULL ) return '';

			// Appent to specific URL
			if ( ! empty( $url ) )
				$link = add_query_arg( array( $this->ref_key => $ref_id ), $url );

			// Append to current URL
			else
				$link = add_query_arg( array( $this->ref_key => $ref_id ) );

			return apply_filters( 'mycred_affiliate_get_ref_link', esc_url( $link ), $user_id, $url, $this );

		}

		/**
		 * Get Ref ID
		 * Returns a given users referral ID.
		 * @since 1.4
		 * @since 2.3 Filter `mycred_affiliate_user_id` added
		 * @version 1.1
		 */
		public function get_ref_id( $user_id ) {

			$ref_id = NULL;

			// Link format
			switch ( $this->prefs['setup']['links'] ) {

				case 'username' :

					$user = get_userdata( $user_id );
					if ( isset( $user->user_login ) ) $ref_id = urlencode( $user->user_login );

				break;

				case 'numeric' :

					$id = mycred_get_user_meta( $user_id, 'mycred_affiliate_link', '', true );
					if ( ! is_numeric( $id ) ) {

						$counter = absint( get_option( 'mycred_affiliate_counter', 0 ) );
						$number  = $counter+1;

						mycred_update_option( 'mycred_affiliate_counter', $number );

						$number = apply_filters( 'mycred_affiliate_user_id', $number );

						mycred_update_user_meta( $user_id, 'mycred_affiliate_link', '', $number );

						$ref_id = $number;

					}
					else {

						$id = apply_filters( 'mycred_affiliate_user_id', $id );

						$ref_id = $id;
						
					}

				break;

			}

			return apply_filters( 'mycred_affiliate_get_ref_id', $ref_id, $user_id, $this );

		}

		/**
		 * Get User ID from Ref ID
		 * @since 1.4
		 * @since 2.3 @filter added `mycred_affiliate_by_user_id`
		 * @version 1.0.1
		 */
		public function get_user_id_from_ref_id( $string = '' ) {

			if( apply_filters( 'mycred_affiliate_by_user_id', false ) )
				return $string;

			global $wpdb;

			$user_id = NULL;

			switch ( $this->prefs['setup']['links'] ) {

				case 'username' :

					$ref_id  = sanitize_text_field( urldecode( $string ) );
					$user    = get_user_by( 'login', $ref_id );
					if ( isset( $user->ID ) )
						$user_id = $user->ID;

				break;

				case 'numeric' :

					$referral_id_key = mycred_get_meta_key( 'mycred_affiliate_link' );
					$ref_id          = absint( $string );
					$user_id         = $wpdb->get_var( $wpdb->prepare( "SELECT user_id FROM {$wpdb->usermeta} WHERE meta_key = %s AND meta_value = %d;", $referral_id_key, $ref_id ) );

				break;

			}

			// Make sure if the referring user is excluded we do not do anything
			if ( $user_id !== NULL && $this->core->exclude_user( $user_id ) )
				$user_id = NULL;

				
			return apply_filters( 'mycred_affiliate_get_user_id', $user_id, $string, $this );

		}

		/**
		 * Ref Counts
		 * Checks to see if this referral counts.
		 * @since 1.4
		 * @version 1.2.1
		 */
		public function ref_counts( $user_id, $IP = '', $instance = 'visit' ) {

			global $wpdb, $mycred_log_table;

			// Prep
			$reply = true;

			if ( $instance == 'signup' )
				$ref = 'signup_referral';
			else
				$ref = 'visitor_referral';

			// We start by enforcing the global IP rule
			if ( $this->prefs['setup']['IP'] > 0 ) {

				// Count the occurence of this IP
				$count = $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM {$mycred_log_table} WHERE ref = %s AND data = %s AND ctype = %s;", $ref, $IP, $this->mycred_type ) );

				if ( $count !== NULL && $count >= $this->prefs['setup']['IP'] )
					$reply = false;

			}

			// If reply is still true we check limit
			if ( $reply !== false && $this->over_hook_limit( $instance, $ref, $user_id ) )
				$reply = false;

			return apply_filters( 'mycred_affiliate_ref_counts', $reply, $this );

		}

		/**
		 * @since 2.5
		 * @version 1.0
		 */
		public function set_mycred_referral_code( $formatted_tokens, $tokens, $obj ) {

			if (
				$this->prefs['signup']['creds'] != 0 && 
				! empty( $obj->get('type') ) && 
				$obj->get('type') == 'bp-members-invitation' && 
				! empty( $formatted_tokens['inviter.id'] ) &&
				! empty( $formatted_tokens['invite.accept_url'] )
			) {

				$ref_id = $this->get_ref_id( $formatted_tokens['inviter.id'] );

				if ( ! empty( $ref_id ) ) 
					$formatted_tokens['invite.accept_url'] = esc_url( add_query_arg( 'mref', $ref_id, wp_specialchars_decode( $formatted_tokens['invite.accept_url'] ) ) );

			}

			return $formatted_tokens;

		}

		/**
		 * Preference for Affiliate Hook
		 * @since 1.4
		 * @version 1.1
		 */
		public function preferences() {

			$prefs = $this->prefs;

?>
<div class="hook-instance">
	<h3><?php esc_html_e( 'Referring Visitors', 'mycred' ); ?></h3>
	<div class="row">
		<div class="col-lg-2 col-md-6 col-sm-12 col-xs-12">
			<div class="form-group">
				<label for="<?php echo esc_attr( $this->field_id( array( 'visit' => 'creds' ) ) ); ?>"><?php echo esc_html( $this->core->plural() ); ?></label>
				<input type="text" name="<?php echo esc_attr( $this->field_name( array( 'visit' => 'creds' ) ) ); ?>" id="<?php echo esc_attr( $this->field_id( array( 'visit' => 'creds' ) ) ); ?>" value="<?php echo esc_attr( $this->core->number( $prefs['visit']['creds'] ) ); ?>" class="form-control" />
			</div>
		</div>
		<div class="col-lg-4 col-md-6 col-sm-12 col-xs-12">
			<div class="form-group">
				<label for="<?php echo esc_attr( $this->field_id( array( 'visit', 'limit' ) ) ); ?>"><?php esc_html_e( 'Limit', 'mycred' ); ?></label>
				<?php echo wp_kses(
						$this->hook_limit_setting( $this->field_name( array( 'visit', 'limit' ) ), $this->field_id( array( 'visit', 'limit' ) ), $prefs['visit']['limit'] ),
						array(
							'div' => array(
								'class' => array()
							),
							'input' => array(
								'type' => array(),
								'size' => array(),
								'class' => array(),
								'name' => array(),
								'id' => array(),
								'value' => array()
							),
							'select' => array(
								'name' => array(),
								'id' => array(),
								'class' => array()
							),
							'option' => array(
								'value' => array(),
								'selected' => array()
							)
						) 
					); 
				?>
			</div>
		</div>
		<div class="col-lg-6 col-md-12 col-sm-12 col-xs-12">
			<div class="form-group">
				<label for="<?php echo esc_attr( $this->field_id( array( 'visit' => 'log' ) ) ); ?>"><?php esc_html_e( 'Log template', 'mycred' ); ?></label>
				<input type="text" name="<?php echo esc_attr( $this->field_name( array( 'visit' => 'log' ) ) ); ?>" id="<?php echo esc_attr( $this->field_id( array( 'visit' => 'log' ) ) ); ?>" value="<?php echo esc_attr( $prefs['visit']['log'] ); ?>" class="form-control" />
				<span class="description"><?php echo wp_kses_post( $this->available_template_tags( array( 'general' ) ) ); ?></span>
			</div>
		</div>
	</div>
</div>
<div class="hook-instance">
	<h3><?php esc_html_e( 'Referring Signups', 'mycred' ); ?></h3>

	<?php if ( get_option( 'users_can_register' ) ) : ?>

	<div class="row">
		<div class="col-lg-2 col-md-6 col-sm-12 col-xs-12">
			<div class="form-group">
				<label for="<?php echo esc_attr( $this->field_id( array( 'signup' => 'creds' ) ) ); ?>"><?php echo esc_html( $this->core->plural() ); ?></label>
				<input type="text" name="<?php echo esc_attr( $this->field_name( array( 'signup' => 'creds' ) ) ); ?>" id="<?php echo esc_attr( $this->field_id( array( 'signup' => 'creds' ) ) ); ?>" value="<?php echo esc_attr( $this->core->number( $prefs['signup']['creds'] ) ); ?>" class="form-control" />
			</div>
		</div>
		<div class="col-lg-4 col-md-6 col-sm-12 col-xs-12">
			<div class="form-group">
				<label for="<?php echo esc_attr( $this->field_id( array( 'signup', 'limit' ) ) ); ?>"><?php esc_html_e( 'Limit', 'mycred' ); ?></label>
				<?php echo wp_kses(
						$this->hook_limit_setting( $this->field_name( array( 'signup', 'limit' ) ), $this->field_id( array( 'signup', 'limit' ) ), $prefs['signup']['limit'] ),
						array(
							'div' => array(
								'class' => array()
							),
							'input' => array(
								'type' => array(),
								'size' => array(),
								'class' => array(),
								'name' => array(),
								'id' => array(),
								'value' => array()
							),
							'select' => array(
								'name' => array(),
								'id' => array(),
								'class' => array()
							),
							'option' => array(
								'value' => array(),
								'selected' => array()
							)
						) 
					); 
				?>
			</div>
		</div>
		<div class="col-lg-6 col-md-12 col-sm-12 col-xs-12">
			<div class="form-group">
				<label for="<?php echo esc_attr( $this->field_id( array( 'signup' => 'log' ) ) ); ?>"><?php esc_html_e( 'Log template', 'mycred' ); ?></label>
				<input type="text" name="<?php echo esc_attr( $this->field_name( array( 'signup' => 'log' ) ) ); ?>" id="<?php echo esc_attr( $this->field_id( array( 'signup' => 'log' ) ) ); ?>" value="<?php echo esc_attr( $prefs['signup']['log'] ); ?>" class="form-control" />
				<span class="description"><?php echo wp_kses_post( $this->available_template_tags( array( 'general' ), '%user_name%' ) ); ?></span>
			</div>
		</div>
    </div>
	
	<?php do_action( 'mycred_after_referring_signups', $this, $prefs ); ?>

	<?php else : ?>

	<div class="row">
		<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
			<p>Registrations are disabled.</p>
			<input type="hidden" name="<?php echo esc_attr( $this->field_name( array( 'signup' => 'creds' ) ) ); ?>" value="<?php echo esc_attr( $this->defaults['signup']['creds'] ); ?>" />
			<input type="hidden" name="<?php echo esc_attr( $this->field_name( array( 'signup' => 'limit' ) ) ); ?>" value="<?php echo esc_attr( $this->defaults['signup']['limit'] ); ?>" />
			<input type="hidden" name="<?php echo esc_attr( $this->field_name( array( 'signup' => 'log' ) ) ); ?>" value="<?php echo esc_attr( $this->defaults['signup']['log'] ); ?>" />
		</div>
	</div>

	<?php endif; ?>

</div>
<div class="hook-instance">
	<h3><?php esc_html_e( 'Referral Links', 'mycred' ); ?></h3>
	<div class="row">
		<div class="col-lg-12 col-md-6 col-sm-12 col-xs-12">
			<div class="form-group">
				<label for="<?php echo esc_attr( $this->field_id( array( 'setup' => 'links' ) ) ); ?>-numeric"><input type="radio" name="<?php echo esc_attr( $this->field_name( array( 'setup' => 'links' ) ) ); ?>" id="<?php echo esc_attr( $this->field_id( array( 'setup' => 'links' ) ) ); ?>-numeric" <?php checked( $prefs['setup']['links'], 'numeric' ); ?> value="numeric" /> <?php esc_html_e( 'Assign numeric referral IDs to each user.', 'mycred' ); ?></label>
				<span class="description"><?php printf( '%s: %s', esc_html__( 'Example', 'mycred' ), esc_url( add_query_arg( array( $this->ref_key => 1 ), home_url( '/' ) ) ) ); ?></span>
			</div>
		</div>
		<div class="col-lg-12 col-md-6 col-sm-12 col-xs-12">
			<div class="form-group">
				<label for="<?php echo esc_attr( $this->field_id( array( 'setup' => 'links' ) ) ); ?>-username"><input type="radio" name="<?php echo esc_attr( $this->field_name( array( 'setup' => 'links' ) ) ); ?>" id="<?php echo esc_attr( $this->field_id( array( 'setup' => 'links' ) ) ); ?>-username" <?php checked( $prefs['setup']['links'], 'username' ); ?> value="username" /> <?php esc_html_e( 'Assign usernames as IDs for each user.', 'mycred' ); ?></label>
				<span class="description"><?php printf( '%s: %s', esc_html__( 'Example', 'mycred' ), esc_url( add_query_arg( array( $this->ref_key => 'john+doe' ), home_url( '/' ) ) ) ); ?></span>
			</div>
		</div>
	</div>
	<div class="row">
		<div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
			<div class="form-group">
				<label for="<?php echo esc_attr( $this->field_id( array( 'setup' => 'IP' ) ) ); ?>"><?php esc_html_e( 'IP Limit', 'mycred' ); ?></label>
				<input type="text" name="<?php echo esc_attr( $this->field_name( array( 'setup' => 'IP' ) ) ); ?>" id="<?php echo esc_attr( $this->field_id( array( 'setup' => 'IP' ) ) ); ?>" value="<?php echo absint( $prefs['setup']['IP'] ); ?>" class="form-control" />
				<span class="description"><?php echo wp_kses_post( $this->core->template_tags_general( __( 'The number of times each IP address grants %_plural%. Use zero for unlimited.', 'mycred' ) ) ); ?></span>
			</div>
		</div>
		<div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
			<div class="form-group">
				<label><?php esc_html_e( 'Available Shortcodes', 'mycred' ); ?></label>
				<p class="form-control-static"><a href="http://codex.mycred.me/shortcodes/mycred_affiliate_link/" target="_blank">[mycred_affiliate_link]</a> <a href="http://codex.mycred.me/shortcodes/mycred_affiliate_id/" target="_blank">[mycred_affiliate_id]</a></p>
			</div>
		</div>
	</div>
</div>

<?php if ( function_exists( 'bp_is_active' ) && bp_is_active( 'xprofile' ) ) : ?>
<div class="hook-instance">
	<h3><?php esc_html_e( 'BuddyPress Profile', 'mycred' ); ?></h3>
	<div class="row">
		<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
			<div class="form-group">
				<div class="checkbox">
					<label for="<?php echo esc_attr( $this->field_id( array( 'buddypress' => 'profile' ) ) ); ?>"><input type="checkbox" name="<?php echo esc_attr( $this->field_name( array( 'buddypress' => 'profile' ) ) ); ?>" id="<?php echo esc_attr( $this->field_id( array( 'buddypress' => 'profile' ) ) ); ?>"<?php checked( $prefs['buddypress']['profile'], 1 ); ?> value="1" /> <?php esc_html_e( 'Insert referral link in users profiles', 'mycred' ); ?></label>
				</div>
			</div>
		</div>
	</div>
	<?php if ( function_exists( 'bp_get_members_invitations_allowed' ) && bp_get_members_invitations_allowed() ) : ?>
	<div class="row">
		<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
			<div class="form-group">
				<div class="checkbox">
					<label for="<?php echo esc_attr( $this->field_id( array( 'buddypress' => 'invite' ) ) ); ?>"><input type="checkbox" name="<?php echo esc_attr( $this->field_name( array( 'buddypress' => 'invite' ) ) ); ?>" id="<?php echo esc_attr( $this->field_id( array( 'buddypress' => 'invite' ) ) ); ?>"<?php checked( $prefs['buddypress']['invite'], 1 ); ?> value="1" /> <?php esc_html_e( 'Insert referral code in invite link', 'mycred' ); ?></label>
				</div>
			</div>
		</div>
	</div>
	<?php endif; ?>
	<div class="row">
		<div class="col-lg-8 col-md-6 col-sm-12 col-xs-12">
			<div class="form-group">
				<label><?php esc_html_e( 'Title', 'mycred' ); ?></label><br />
				<input type="text" name="<?php echo esc_attr( $this->field_name( array( 'buddypress' => 'title' ) ) ); ?>" id="<?php echo esc_attr( $this->field_id( array( 'buddypress' => 'title' ) ) ); ?>" value="<?php echo esc_attr( $prefs['buddypress']['title'] ); ?>" class="form-control" />
				<span class="description"><?php esc_html_e( 'Leave empty to hide.', 'mycred' ); ?></span>
			</div>
		</div>
		<div class="col-lg-4 col-md-6 col-sm-12 col-xs-12">
			<div class="form-group">
				<label><?php esc_html_e( 'Profile Positioning', 'mycred' ); ?></label><br />
				<input type="text" name="<?php echo esc_attr( $this->field_name( array( 'buddypress' => 'priority' ) ) ); ?>" id="<?php echo esc_attr( $this->field_id( array( 'buddypress' => 'priority' ) ) ); ?>" value="<?php echo absint( $prefs['buddypress']['priority'] ); ?>" class="form-control" />
				<span class="description"><?php esc_html_e( 'You can move around the referral link on your users profile by changing the position. Increase to move up, decrease to move down.', 'mycred' ); ?></span>
			</div>
		</div>
	</div>
	<div class="row">
		<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
			<div class="form-group">
				<label for="<?php echo esc_attr( $this->field_id( array( 'buddypress' => 'desc' ) ) ); ?>"><?php esc_html_e( 'Description', 'mycred' ); ?></label>
				<span class="description"><?php esc_html_e( 'Optional description to insert under the link.', 'mycred' ); ?></span>
				<textarea name="<?php echo esc_attr( $this->field_name( array( 'buddypress' => 'desc' ) ) ); ?>" id="<?php echo esc_attr( $this->field_id( array( 'buddypress' => 'desc' ) ) ); ?>" class="form-control" rows="5" cols="30"><?php echo esc_attr( $prefs['buddypress']['desc'] ); ?></textarea>
			</div>
		</div>
	</div>
</div>
<?php else : ?>
<input type="hidden" name="<?php echo esc_attr( $this->field_name( array( 'buddypress' => 'profile' ) ) ); ?>" value="<?php echo esc_attr( $this->defaults['buddypress']['profile'] ); ?>" />
<input type="hidden" name="<?php echo esc_attr( $this->field_name( array( 'buddypress' => 'title' ) ) ); ?>" value="<?php echo esc_attr( $this->defaults['buddypress']['title'] ); ?>" />
<input type="hidden" name="<?php echo esc_attr( $this->field_name( array( 'buddypress' => 'desc' ) ) ); ?>" value="<?php echo esc_attr( $this->defaults['buddypress']['desc'] ); ?>" />
<input type="hidden" name="<?php echo esc_attr( $this->field_name( array( 'buddypress' => 'priority' ) ) ); ?>" value="<?php echo esc_attr( $this->defaults['buddypress']['priority'] ); ?>" />
<?php endif; ?>
<?php

			do_action( 'mycred_affiliate_prefs', $prefs, $this );

		}

		/**
		 * Sanitise Preference
		 * @since 1.4
		 * @version 1.1
		 */
		function sanitise_preferences( $data ) {

			$data['buddypress']['profile'] = ( isset( $data['buddypress']['profile'] ) ) ? $data['buddypress']['profile'] : 0;

			if ( isset( $data['visit']['limit'] ) && isset( $data['visit']['limit_by'] ) ) {
				$limit = sanitize_text_field( $data['visit']['limit'] );
				if ( $limit == '' ) $limit = 0;
				$data['visit']['limit'] = $limit . '/' . $data['visit']['limit_by'];
				unset( $data['visit']['limit_by'] );
			}

			if ( isset( $data['signup']['limit'] ) && isset( $data['signup']['limit_by'] ) ) {
				$limit = sanitize_text_field( $data['signup']['limit'] );
				if ( $limit == '' ) $limit = 0;
				$data['signup']['limit'] = $limit . '/' . $data['signup']['limit_by'];
				unset( $data['signup']['limit_by'] );
			}

			return apply_filters( 'mycred_affiliate_save_pref', $data );

		}

	}
endif;

/**
 * Load Referral Program
 * @since 1.5.3
 * @version 1.0
 */
if ( ! function_exists( 'mycred_load_referral_program' ) ) :
	function mycred_load_referral_program() {

		// BuddyPress: Hook into user activation
		if ( function_exists( 'buddypress' ) )
			add_action( 'bp_core_activated_user', 'mycred_detect_bp_user_activation' );

		// Logged in users do not get points
		if ( is_user_logged_in() && apply_filters( 'mycred_affiliate_allow_members', false ) === false ) return;

		// Points for visits
		add_action( 'template_redirect', 'mycred_detect_referred_visits' );
		add_action( 'login_init',        'mycred_detect_referred_visits' );

		// Points for signups
		add_action( 'user_register', 'mycred_detect_referred_signups' );

	}
endif;
add_action( 'mycred_init', 'mycred_load_referral_program', 90 );

/**
 * Detect Referred Visits
 * @since 1.5.3
 * @version 1.0.1
 */
if ( ! function_exists( 'mycred_detect_referred_visits' ) ) :
	function mycred_detect_referred_visits() {

		do_action( 'mycred_referred_visit' );

		$keys = apply_filters( 'mycred_referral_keys', array() );
		if ( ! empty( $keys ) ) {
			wp_redirect( remove_query_arg( $keys ), 301 );
			exit;
		}

	}
endif;

/**
 * Detect Referred Signups
 * @since 1.5.3
 * @version 1.0
 */
if ( ! function_exists( 'mycred_detect_referred_signups' ) ) :
	function mycred_detect_referred_signups( $new_user_id ) {

		do_action( 'mycred_referred_signup', $new_user_id );

	}
endif;

/**
 * Detect Referred BP User Activation
 * @since 1.5.3
 * @version 1.0
 */
if ( ! function_exists( 'mycred_detect_bp_user_activation' ) ) :
	function mycred_detect_bp_user_activation( $user_id ) {

		do_action( 'mycred_bp_user_activated', $user_id );

	}
endif;

if ( ! function_exists( 'copy_ref_link' ) ) :
	function copy_ref_link() {?>
		<script>
			function copy_to_clipBoard(btn) {
				var copyText = btn.previousSibling;
				copyText.select();
				document.execCommand("copy");
			}
		</script>
		<?php
	}
endif;