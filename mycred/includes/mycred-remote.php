<?php
if ( ! defined( 'myCRED_VERSION' ) ) exit;

/**
 * myCRED Remote API
 * Allows execution of remote actions such as adding points, removing points,
 * transfering points between two users and balance checks.
 * @see http://codex.mycred.me/classes/mycred_remote/
 * @since 1.3
 * @version 1.0.1
 */
if ( ! class_exists( 'myCRED_Remote' ) ) :
	class myCRED_Remote {

		public $method;
		public $uri;
		public $request;
		public $host;
		public $format;
		public $user;
		public $recipient;
		public $reply = 'PROCESSING';

		public $core;
		public $key;

		/**
		 * Construct
		 */
		function __construct( $key = NULL ) {

			$this->handle_magic();

			$this->core   = mycred();
			$this->key    = $key;

			$this->method = isset( $_SERVER['REQUEST_METHOD'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_METHOD'] ) ) : '';
			$this->uri    = explode( '/', isset( $_SERVER['REQUEST_URI'] ) ? esc_url_raw( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '' );
			$this->format = '';

			$this->parse_call();
			$this->get_host_IP();

			// Let others play
			do_action_ref_array( 'mycred_remote', array( &$this ) );

		}

		/**
		 * Handle Magic Quotes
		 * @since 1.3
		 * @version 1.1
		 */
		public function handle_magic() {

			$process = array( &$_GET, &$_POST, &$_COOKIE, &$_REQUEST );

			foreach ( $process as $key => $val ) {
				foreach ( $val as $k => $v ) {
					unset( $process[ $key ][ $k ] );
					if ( is_array( $v ) ) {
						$process[ $key ][ stripslashes( $k ) ] = $v;
						$process[] = &$process[ $key ][ stripslashes( $k ) ];
					} else {
						$process[ $key ][ stripslashes( $k ) ] = stripslashes( $v );
					}
				}
			}

			unset( $process );

            
            // Let others play
            do_action_ref_array( 'mycred_remote_magic', array( &$this ) );
        }

		/**
		 * Set Headers
		 * @since 1.3
		 * @version 1.0
		 */
		public function set_headers() {

			header( 'Expires: ' . gmdate( 'D, d M Y H:i:s', mktime( 0, 0, 0, 1, 1, date( 'Y' ) ) - 604800 ) . ' GMT' ); 
			header( 'Last-Modified: ' . gmdate( 'D, d M Y H:i:s' ) . ' GMT' );
			header( 'Cache-Control: no-store, no-cache, must-revalidate' );
			header( 'Pragma: no-cache' );

			header_remove( 'x-powered-by' );
			header_remove( 'link' );
			header_remove( 'set-cookie' );

			// Let others play
			do_action( 'mycred_remote_headers', $this );

		}

		/**
		 * Parse Call
		 * @since 1.3
		 * @version 1.0
		 */
		public function parse_call() {

			$parameters = array();

			if ( isset( $_SERVER['QUERY_STRING'] ) )
				parse_str( sanitize_text_field( wp_unslash( $_SERVER['QUERY_STRING'] ) ), $parameters );

			$body         = file_get_contents( "php://input" );
			$content_type = false;
			if ( isset( $_SERVER['CONTENT_TYPE'] ) ) {
				$content_type = sanitize_text_field( wp_unslash( $_SERVER['CONTENT_TYPE'] ) );
			}

			switch ( $content_type ) {

				case 'application/json':

					$body_params = json_decode( $body );
					if ( $body_params ) {
						foreach ( $body_params as $param_name => $param_value ) {
							$parameters[ $param_name ] = sanitize_text_field( $param_value );
						}
					}
					$this->format = 'json';

				break;

				case 'application/x-www-form-urlencoded; charset=UTF-8' :
				case 'application/x-www-form-urlencoded':

					parse_str( $body, $vars );
					if ( ! empty( $vars ) ) {
						foreach ( $vars as $field => $value ) {
							$parameters[ $field ] = sanitize_text_field( $value );
						}
					}
					$this->format = 'html';

				break;
				default:

					$this->format = 'other';

				break;

			}

			$this->request = $parameters;

			if ( isset( $this->request['format'] ) )
				$this->format = $this->request['format'];

			elseif ( empty( $this->format ) )
				$this->format = 'unknown';

			// Let others play
			do_action_ref_array( 'mycred_remote_parse', array( &$this ) );

		}

		/**
		 * Get Host IP
		 * @since 1.3
		 * @version 1.0
		 */
		public function get_host_IP() {

			if ( isset( $_SERVER['HTTP_CLIENT_IP'] ) )
				$this->host = sanitize_text_field( wp_unslash( $_SERVER['HTTP_CLIENT_IP'] ) );

			elseif ( isset( $_SERVER['HTTP_X_FORWARDED_FOR'] ) )
				$this->host = sanitize_text_field( wp_unslash( $_SERVER['HTTP_X_FORWARDED_FOR'] ) );

			elseif ( isset( $_SERVER['HTTP_X_FORWARDED'] ) )
				$this->host = sanitize_text_field( wp_unslash( $_SERVER['HTTP_X_FORWARDED'] ) );

			elseif ( isset( $_SERVER['HTTP_FORWARDED_FOR'] ) )
				$this->host = sanitize_text_field( wp_unslash( $_SERVER['HTTP_FORWARDED_FOR'] ) );

			elseif ( isset( $_SERVER['HTTP_FORWARDED'] ) )
				$this->host = sanitize_text_field( wp_unslash( $_SERVER['HTTP_FORWARDED'] ) );

			elseif ( isset( $_SERVER['REMOTE_ADDR'] ) )
				$this->host = sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) );

			else
				$this->host = 'UNKNOWN';

			do_action_ref_array( 'mycred_remote_host_IP', array( &$this ) );

		}

		/**
		 * Validate Call
		 * @since 1.3
		 * @version 1.0
		 */
		public function validate_call() {

			// Let others play first
			do_action_ref_array( 'mycred_remote_validate', array( &$this ) );

			// Key has not been setup
			if ( $this->key === NULL )
				return 'ERROR: 99';

			// Empty Request
			if ( empty( $this->request ) )
				return 'ERROR: 101';

			// Missing action
			if ( ! isset( $this->request['action'] ) || empty( $this->request['action'] ) )
				return 'ERROR: 102';

			// Missing account
			elseif ( ! isset( $this->request['account'] ) || empty( $this->request['account'] ) )
				return 'ERROR: 103';

			// Missing token
			elseif ( ! isset( $this->request['token'] ) || empty( $this->request['token'] ) )
				return 'ERROR: 104';

			// Missing Host
			if ( ! isset( $this->request['host'] ) || empty( $this->request['host'] ) )
				return 'ERROR: 105';

			// Populate User and check if user exists
			$this->user = get_user_by( 'email', $this->request['account'] );
			if ( $this->user === false )
				return 'ERROR: 201';

			// Check for exclusion
			if ( $this->core->exclude_user( $this->user->ID ) )
				return 'ERROR: 202';

			// Action specific validations
			switch ( $this->request['action'] ) {

				// Add points
				case 'CREDIT' :

				// Pay (deduct)
				case 'DEBIT' :

					// Reference is required
					if ( ! isset( $this->request['ref'] ) || empty( $this->request['ref'] ) )
						return 'ERROR: 401';

					// Entry is required
					if ( ! isset( $this->request['entry'] ) || empty( $this->request['entry'] ) )
						return 'ERROR: 402';

					// Amount is required
					if ( ! isset( $this->request['amount'] ) || empty( $this->request['amount'] ) )
						return 'ERROR: 403';

					// Validate Token
					// ( host + acount + amount + api_key )
					$check = md5( $this->request['host'] . $this->request['action'] . $this->request['amount'] . $this->key );
					if ( $this->request['token'] != $check )
						return 'ERROR: 301';

				break;

				// Get balance
				case 'GET' :

					// Validate Token
					// ( host + action + api_key )
					$check = md5( $this->request['host'] . $this->request['action'] . $this->key );
					if ( $this->request['token'] != $check )
						return 'ERROR: 301';

				break;

				// Transfer
				case 'PAY' :

					// Reference is required
					if ( ! isset( $this->request['ref'] ) || empty( $this->request['ref'] ) )
						return 'ERROR: 501';

					// Entry is required
					if ( ! isset( $this->request['entry'] ) || empty( $this->request['entry'] ) )
						return 'ERROR: 502';

					// Amount is required
					if ( ! isset( $this->request['amount'] ) || empty( $this->request['amount'] ) )
						return 'ERROR: 503';

					// Make sure the recipient is set
					if ( ! isset( $this->request['to'] ) || empty( $this->request['to'] ) )
						return 'ERROR: 504';

					// Data is required
					if ( ! isset( $this->request['data'] ) || empty( $this->request['data'] ) )
						return 'ERROR: 505';

					// Validate Token
					// ( host + action + amount + from + to + api_key )
					$check = md5( $this->request['host'] . $this->request['action'] . $this->request['amount'] . $this->request['account'] . $this->request['to'] . $this->key );
					if ( $this->request['token'] != $check )
						return 'ERROR: 301';

					// Make sure recipient exists
					$this->recipient = get_user_by( 'email', $this->request['to'] );
					if ( $this->recipient === false )
						return 'ERROR: 506';

					// Can not pay yourself
					if ( $this->recipient->ID == $this->user->ID )
						return 'ERROR: 507';

					// Check for exclusion
					if ( $this->core->exclude_user( $this->recipient->ID ) )
						return 'ERROR: 508';

				break;

				// Default
				default :

					// Unsupported action
					return 'ERROR: 302';

				break;

			}

			return true;

		}

		/**
		 * Process
		 * @since 1.3
		 * @version 1.0
		 */
		public function process() {

			switch ( $this->request['action'] ) {

				// Add points
				case 'CREDIT' :

				// Pay (deduct)
				case 'DEBIT' :

					$ref_id = $data = $type = '';

					// Prep Reference ID
					if ( isset( $this->request['ref_id'] ) && ! empty( $this->request['ref_id'] ) )
						$ref_id = abs( $this->request['ref_id'] );

					// Prep Data
					if ( isset( $this->request['data'] ) && ! empty( $this->request['data'] ) )
						$data = unserialize($this->request['data'], array('allowed_classes' => false));

					// Prep Points Type
					if ( isset( $this->request['type'] ) && ! empty( $this->request['type'] ) )
						$type = sanitize_text_field( $this->request['type'] );
					else
						$type = $this->core->get_cred_id();

					// Prep Amount
					$amount = floatval( $this->request['amount'] );
					if ( $this->request['action'] == 'DEBIT' )
						$amount = 0-$amount;
					else
						$amount = abs( $amount );

					// Prevent Duplicate
					if ( ! empty( $data ) || ! empty( $ref_id ) ) {
						if ( $this->core->has_entry( $this->request['ref'], $ref_id, $this->user->ID, $data ) ) {
							$this->reply = 'DUPLICATE';
							return;
						}
					}

					// Check that user has enough points if we are charging
					if ( $this->request['action'] == 'DEBIT' ) {

						$balance     = $this->core->get_users_balance( $this->user->ID, $type );
						$min_balance = apply_filters( 'mycred_transfer_acc_limit', 0 );
						if ( $balance-$amount < $min_balance ) {
							$this->reply = 'DECLINED';
							return;
						}

					}

					// Add creds
					if ( $this->core->add_creds(
						$this->request['ref'],
						$this->user->ID,
						$amount,
						$this->request['entry'],
						$ref_id,
						$data,
						$type
					) ) {

						$this->reply = 'COMPLETED';

						// Let others play on success
						do_action( 'mycred_remote_action_' . $this->request['action'], $this );

					}
					else {
						$this->reply = 'FAILED';
					}

				break;

				// Get balance
				case 'GET' :

					// Prep Type
					if ( isset( $this->request['type'] ) && ! empty( $this->request['type'] ) )
						$type = sanitize_text_field( $this->request['type'] );
					else
						$type = $this->core->get_cred_id();

					// Get balance
					$balance     = $this->core->get_users_balance( $this->user->ID, $type );
					$this->reply = $this->core->format_number( $balance );

					// Let other splay
					do_action( 'mycred_remote_action_GET', $this );

				break;

				// Transfer
				case 'PAY' :

					// Amount
					$amount = $this->core->format_number( $this->request['amount'] );

					// Cred Type
					if ( isset( $this->request['type'] ) && ! empty( $this->request['type'] ) )
						$type = sanitize_text_field( $this->request['type'] );
					else
						$type = $this->core->get_cred_id();

					// Prevent Duplicate
					if ( $this->core->has_entry( $this->request['ref'], $this->recipient->ID, $this->user->ID, $this->request['data'] ) ) {
						$this->reply = 'DUPLICATE';
						return;
					}

					$balance = $this->core->get_users_balance( $this->user->ID, $type );

					// Check that user has enough points if we are charging
					$min_balance = apply_filters( 'mycred_transfer_acc_limit', 0 );
					if ( $balance-$amount < $min_balance ) {

						$this->reply = 'DECLINED';
						return;

					}

					// Deduct points first from sender
					if ( $this->core->add_creds(
						$this->request['ref'],
						$this->user->ID,
						0-$amount,
						$this->request['entry'],
						$this->recipient->ID,
						$this->request['data'],
						$type
					) ) {

						// Once we have successfully deducted, pay the recipient
						if ( $this->core->add_creds(
							$this->request['ref'],
							$this->recipient->ID,
							$amount,
							$this->request['entry'],
							$this->user->ID,
							$this->request['data'],
							$type
						) ) {

							$this->reply = 'COMPLETED';

							// Let others play
							do_action( 'mycred_remote_action_PAY', $this );

						}
						else {
							$this->reply = 'FAILED';
						}

					}
					else {
						$this->reply = 'FAILED';
					}

				break;

				// Default
				default :

					// Let others play
					do_action_ref_array( 'mycred_remote_process', array( &$this ) );
					do_action_ref_array( 'mycred_remote_process_' . $this->request['action'], array( &$this ) );

					// If reply is still empty we bail
					if ( empty( $this->reply ) )
						$this->reply = 'UNKNOWN';

				break;

			}

		}

	}
endif;

/**
 * Remote Init
 * @since 1.3
 * @version 1.0
 */
if ( ! function_exists( 'mycred_remote_init' ) ) :
	function mycred_remote_init() {

		if ( is_admin() && defined( 'DOING_AJAX' ) && DOING_AJAX ) return;

		$prefs = mycred_get_remote();
		if ( ! $prefs['enabled'] ) return;

		$uri   = explode( '/', isset( $_SERVER['REQUEST_URI'] ) ? esc_url_raw( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '' );
		if ( isset( $uri[1] ) && $uri[1] == $prefs['uri'] ) {

			// Load
			$remote = new myCRED_Remote( $prefs['key'] );
			$remote->set_headers();

			// Validate Call
			$valid = $remote->validate_call();

			// Request passed validation
			if ( $valid === true ) {
				// Run request
				$remote->process();
				die( esc_html( $remote->reply ) );
			}

			// Request failed validation
			else {
				$reply = ( ! $prefs['debug'] ) ? '' : $valid;
				die( esc_html( $reply ) );
			}

		}

	}
endif;
add_action( 'init', 'mycred_remote_init' );

/**
 * Remote API Settings Page
 * @since 1.3
 * @version 1.0
 */
if ( ! function_exists( 'mycred_remote_settings_page' ) ) :
	function mycred_remote_settings_page( $mycred_general ) {

		$settings   = mycred_get_remote();
		$key_length = strlen( $settings['key'] );

		$block            = '';
		$disabled_message = '';

		if ( ! get_option( 'permalink_structure' ) ) {
			$block            = ' disabled="disabled"';
			$disabled_message = __( 'This feature requires WordPress Permalinks to be setup and enabled!', 'mycred' );
		}

		elseif ( ! $settings['enabled'] )
			$disabled_message = __( 'Click Update Settings to load the Remote API settings.', 'mycred' );

?>

<div class="mycred-ui-accordion">
    <div class="mycred-ui-accordion-header">
        <h4 class="mycred-ui-accordion-header-title">
            <span class="dashicons dashicons-cloud mycred-ui-accordion-header-icon <?php if ( empty( $settings['key'] ) ) echo 'static'; else echo 'active'; ?>"></span>
            <label><?php esc_html_e( 'Remote Access', 'mycred' ); ?></label>
        </h4>
        <div class="mycred-ui-accordion-header-actions hide-if-no-js">
            <button type="button" aria-expanded="true">
                <span class="mycred-ui-toggle-indicator" aria-hidden="true"></span>
            </button>
        </div>
    </div>
	<div class="body mycred-ui-accordion-body" style="display:none;">
		<div class="row">
			<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
				<div class="mycred-toggle-wrapper">
                    <label for="myCRED-General-remote"><strong><?php esc_html_e( 'Enable', 'mycred' ); ?></strong></label>
                    <label class="mycred-toggle">
                        <input type="checkbox" name="mycred_pref_core[allow_remote]" id="myCRED-General-remote" value="1" <?php if ( $settings['enabled'] ) echo ' checked="checked"'; echo wp_kses_post( $block ); ?> />
                        <span class="slider round"></span>
                    </label> 
                </div>
			</div>
		</div>
		<hr class="mb-4">
		<div class="row">
			<div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
				<h3><?php esc_html_e( 'API Key', 'mycred' ); ?></h3>
				<div class="mycred-remote-key-wrapper">
					<div class="form-group">
						<label for="myCRED-remote-key"><?php esc_html_e( 'Key', 'mycred' ); ?></label>
						<input type="text" name="mycred_pref_core[remote][key]" id="myCRED-remote-key" value="<?php echo esc_attr( $settings['key'] ); ?>" placeholder="<?php esc_attr_e( '12, 16, 24 or 32 characters', 'mycred' ); ?>" class="form-control" />
						<p><?php esc_html_e( 'A minimum of 12 characters is required.', 'mycred' ); ?></p>
						<div style="color:<?php if ( $key_length == 0 ) echo 'gray'; elseif ( $key_length >= 12 ) echo 'green'; ?>">(<span id="mycred-length-counter"><?php echo esc_html( $key_length ); ?></span>)</span>
						</div>
					</div>
					<input type="button" id="mycred-generate-api-key" value="<?php esc_attr_e( 'Generate New Key', 'mycred' ); ?>" class="button button-large button-primary" />
				</div>
				<div class="m-alert m-alert-warning"><strong><?php esc_html_e( 'Warning!', 'mycred' ); ?></strong> <?php echo esc_html( $mycred_general->core->template_tags_general( __( 'Keep this key safe! Those you share this key with will be able to remotely deduct / add / transfer %plural%!', 'mycred' ) ) ); ?></div>
			</div>
			<div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
				<h3><?php esc_html_e( 'Incoming URI', 'mycred' ); ?></h3>
				<div class="form-group">
					<label for="myCRED-remote-uri"><?php esc_html_e( 'URI', 'mycred' ); ?></label>
					<div class="mycred-remote-uri-wrapper">
						<?php echo esc_url( site_url() . '/' ); ?> <input type="text" name="mycred_pref_core[remote][uri]" id="myCRED-remote-uri" value="<?php echo esc_attr( $settings['uri'] ); ?>" /> /
					</div>
					<p>The incoming call address. Remote calls made to any other URL will be ignored.</p>
				</div>
			</div>
		</div>
		<hr class="mb-4">
		<div class="row">
			<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
				<h3><?php esc_html_e( 'Debug Mode', 'mycred' ); ?></h3>
				<input type="checkbox" name="mycred_pref_core[remote][debug]" id="myCRED-remote-debug-mode"<?php if ( $settings['debug'] ) echo ' checked="checked"'; ?> value="1" /> <span class="description"><?php esc_html_e( 'Remember to disable when not used to prevent mischievous calls from learning about your setup!', 'mycred' ); ?></span>
			</div>
		</div>
		<?php do_action( 'mycred_after_remote_prefs', $mycred_general ); ?>
	</div>
</div>
<?php

	}
endif;
add_action( 'mycred_after_core_prefs', 'mycred_remote_settings_page' );

/**
 * Remote API Settings Save
 * @since 1.3
 * @version 1.0
 */
if ( ! function_exists( 'mycred_remote_save_settings' ) ) :
	function mycred_remote_save_settings( $new_data, $post, $mycred_general ) {

		$current    = mycred_get_remote();
		$new_remote = array();

		if ( isset( $post['allow_remote'] ) )
			$new_remote['enabled'] = 1;
		else
			$new_remote['enabled'] = 0;

		if ( isset( $post['remote']['key'] ) )
			$new_remote['key'] = sanitize_text_field( $post['remote']['key'] );
		else
			$new_remote['key'] = $current['key'];

		if ( isset( $post['remote']['uri'] ) )
			$new_remote['uri'] = sanitize_text_field( $post['remote']['uri'] );
		else
			$new_remote['uri'] = $current['uri'];

		if ( isset( $post['remote']['debug'] ) )
			$new_remote['debug'] = 1;
		else
			$new_remote['debug'] = 0;

		// Let others play
		$new_remote = apply_filters( 'mycred_remote_save_prefs', $new_remote, $current, $post, $mycred_general );
	
		update_option( 'mycred_pref_remote', $new_remote );
	
		return $new_data;

	}
endif;
add_filter( 'mycred_save_core_prefs', 'mycred_remote_save_settings', 10, 3 );
