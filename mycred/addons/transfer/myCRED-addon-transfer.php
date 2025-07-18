<?php
/**
 * Addon: Transfer
 * Addon URI: http://codex.mycred.me/chapter-iii/transfers/
 * Version: 1.6
 */
if ( ! defined( 'myCRED_VERSION' ) ) exit;

define( 'myCRED_TRANSFER_VERSION', '1.6' );
define( 'myCRED_TRANSFER',         __FILE__ );
define( 'myCRED_TRANSFER_DIR',     myCRED_ADDONS_DIR . 'transfer/' );

require_once myCRED_TRANSFER_DIR . 'includes/mycred-transfer-functions.php';
require_once myCRED_TRANSFER_DIR . 'includes/mycred-transfer-object.php';
require_once myCRED_TRANSFER_DIR . 'includes/mycred-transfer-shortcodes.php';
require_once myCRED_TRANSFER_DIR . 'includes/mycred-transfer-widgets.php';

/**
 * myCRED_Transfer_Module class
 * Manages this add-on by hooking into myCRED where needed. Regsiters our custom shortcode and widget
 * along with scripts and styles needed. Also adds settings to the myCRED settings page.
 * @since 0.1
 * @version 1.3.1
 */
if ( ! class_exists( 'myCRED_Transfer_Module' ) ) :
	class myCRED_Transfer_Module extends myCRED_Module {

		/**
		 * Construct
		 */
		function __construct() {

			parent::__construct( 'myCRED_Transfer_Module', array(
				'module_name' => 'transfers',
				'defaults'    => mycred_get_addon_defaults( 'transfers' ),
				'register'    => false,
				'add_to_core' => true
			) );

		}

		/**
		 * Init
		 * @since 0.1
		 * @version 1.0.1
		 */
		public function module_init() {

			add_filter( 'mycred_get_email_events',     array( $this, 'email_notice_instance' ), 10, 2 );
			add_filter( 'mycred_email_before_send',    array( $this, 'email_notices' ), 50, 2 );
			add_filter( 'mycred_parse_log_entry',      array( $this, 'render_message' ), 20, 2 );

			// Register Scripts & Styles
			add_action( 'mycred_front_enqueue',        array( $this, 'register_script' ), 30 );

			// Register Shortcode
			add_shortcode( MYCRED_SLUG . '_transfer',  'mycred_transfer_render' );

			// Potentially load script
			add_action( 'wp_footer',                   array( $this, 'maybe_load_script' ) );

			// Ajax Calls
			add_action( 'wp_ajax_mycred-new-transfer', array( $this, 'ajax_call_transfer' ) );

			if ( isset( $this->transfers['autofill'] ) && $this->transfers['autofill'] ?? null != 'none' )
				add_action( 'wp_ajax_mycred-autocomplete', array( $this, 'ajax_call_autocomplete' ) );


		}

		/**
		 * Register Widgets
		 * @since 1.7.6
		 * @version 1.0
		 */
		public function render_message( $content = '', $log = NULL ) {

			if ( ! isset( $log->data ) ) return $content;

			$data = (array) maybe_unserialize( $log->data );

			return mycred_transfer_render_message( $content, $data );

		}

		/**
		 * Register Widgets
		 * @since 0.1
		 * @version 1.0
		 */
		public function module_widgets_init() {

			register_widget( 'myCRED_Widget_Transfer' );

		}

		/**
		 * Enqueue Front
		 * @since 0.1
		 * @version 1.1
		 */
		public function register_script() {

			// Register script
			wp_register_script(
				'mycred-transfer',
				plugins_url( 'assets/js/mycred-transfer.js', myCRED_TRANSFER ),
				array( 'jquery', 'jquery-ui-autocomplete' ),
				'1.7'
			);

			//Register style
			wp_register_style( 
				'mycred-transfer',
				plugins_url( 'css/transfer.css', myCRED_TRANSFER ) 
			);

		}

		/**
		 * Front Footer
		 * @filter 'mycred_transfer_messages'
		 * @since 0.1
		 * @version 1.2.2
		 */
		public function maybe_load_script() {

			global $mycred_do_transfer, $mycred_transfer;

			if ( $mycred_do_transfer !== true ) return;

			// Autofill CSS
			wp_enqueue_style( 'mycred-transfer' );
			$style = apply_filters( 'mycred_transfer_autofill_css', '.ui-autocomplete { position: absolute; z-index: 1000; cursor: default; padding: 0; margin-top: 2px; list-style: none; background-color: #ffffff; border: 1px solid #ccc; -webkit-box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2); -moz-box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2); box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2); } .ui-autocomplete > li { padding: 3px 20px; } .ui-autocomplete > li:hover { background-color: #DDD; cursor: pointer; } .ui-autocomplete > li.ui-state-focus { background-color: #DDD; } .ui-helper-hidden-accessible { display: none; }', $this );
			wp_add_inline_style( 'mycred-transfer', $style );

			// Prep Script
			$base     = array(
				'ajaxurl'   => admin_url( 'admin-ajax.php' ),
				'user_id'   => get_current_user_id(),
				'working'   => esc_attr__( 'Processing...', 'mycred' ),
				'token'     => wp_create_nonce( 'mycred-autocomplete' ),
				'reload'    => $this->transfers['reload'],
				'autofill'  => $this->transfers['autofill']
			);

			$insufficient_fund_errors = array();

            foreach ( $mycred_transfer->settings['types'] as $type ) {
             
                $mycred = mycred( $type );
                $insufficient_fund_errors[ $type ] = $mycred->template_tags_general( $mycred_transfer->settings['errors']['low'] );
            
            }

			// Messages
			$messages = apply_filters( 'mycred_transfer_messages', array(
				'completed' => esc_attr__( 'Transaction completed.', 'mycred' ),
				'error_1'   => esc_attr__( 'Security token could not be verified. Please contact your site administrator!', 'mycred' ),
				'error_2'   => esc_attr__( 'Communications error. Please try again later.', 'mycred' ),
				'error_3'   => esc_attr__( 'Recipient not found. Please try again.', 'mycred' ),
				'error_4'   => esc_attr__( 'Transaction declined by recipient.', 'mycred' ),
				'error_5'   => esc_attr__( 'Incorrect amount. Please try again.', 'mycred' ),
				'error_6'   => esc_attr__( 'This myCRED Add-on has not yet been setup! No transfers are allowed until this has been done!', 'mycred' ),
				'error_7'   => $insufficient_fund_errors,
				'error_8'   => esc_attr__( 'Transfer Limit exceeded.', 'mycred' ),
				'error_9'   => esc_attr__( 'Communications error. Please try again later.', 'mycred' ),
				'error_10'  => esc_attr__( 'The selected point type can not be transferred.', 'mycred' ),
				'error_11'  => esc_attr__( 'Selected recipient ain\'t allowed by admin.', 'mycred' ),
			) );
			
			wp_localize_script(
				'mycred-transfer',
				'myCREDTransfer',
				array_merge_recursive( $base, $messages )
			);

			wp_enqueue_script( 'mycred-transfer' ); 

		}

		/**
		 * AJAX Autocomplete
		 * @since 0.1
		 * @version 1.2.1
		 */
		public function ajax_call_autocomplete() {

			// Security
			check_ajax_referer( 'mycred-autocomplete' , 'token' );

			if ( ! is_user_logged_in() ) die;

			$results = array();
			$user_id = get_current_user_id();
			$string  = isset( $_REQUEST['string']['term'] ) ? sanitize_key( $_REQUEST['string']['term'] ) : '';

			// Let other play
			do_action( 'mycred_transfer_autofill_find', $this->transfers, $this->core );

			global $wpdb;

			// Query
			$select     = sanitize_text_field( $this->transfers['autofill'] );
			$blog_users = $wpdb->get_results( $wpdb->prepare( "SELECT {$select}, ID FROM {$wpdb->users} WHERE ID != %d AND {$select} LIKE %s;", $user_id, '%' . $string . '%' ), 'ARRAY_N' );

			if ( $wpdb->num_rows > 0 ) {

				foreach ( $blog_users as $hit ) {

					if ( $this->core->exclude_user( $hit[1] ) ) continue;
					$results[] = $hit[0];

				}

			}

			$results = apply_filters( 'mycred_transfer_users_list' , $results, $user_id, $this->transfers['autofill'] );

			wp_send_json( $results );

		}

		/**
		 * AJAX Transfer Creds
		 * @since 0.1
		 * @version 1.8
		 */
		 public function ajax_call_transfer() {

		    if ( ! is_user_logged_in() ) {
		        wp_send_json_error( 'not_logged_in' );
		    }

		    // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotValidated, WordPress.Security.ValidatedSanitizedInput.MissingUnslash, WordPress.Security.ValidatedSanitizedInput.InputNotSanitized 
		    parse_str( $_POST['form'], $post );

		    $post = mycred_sanitize_array( $post );

		    // ✅ Validate amount against signed allowed values
		    $transfer = $post['mycred_new_transfer'];



		    if ( isset( $transfer['allowed_amounts']  ) ) {

		        $encoded_payload     = $transfer['allowed_amounts'];

		        $received_signature  = $transfer['signature'];

		        $submitted_amount    = floatval( $transfer['amount'] );

		        $secret_key          = 'e3dA9p!7uGv#sT6jR@zQ2LfNc0MbWx8y';
		        $expected_signature  = hash_hmac( 'sha256', $encoded_payload, $secret_key );


		        if ( ! hash_equals( $expected_signature, $received_signature ) ) {

		            wp_send_json_error( 'error_signature_mismatch' );
		        }

		        $allowed_amounts = json_decode( base64_decode( $encoded_payload ) );
		        $allow_any_amount = false;
				if ( empty( $allowed_amounts ) || (count($allowed_amounts) === 1 && !$allowed_amounts[0]) ) {
				    $allow_any_amount = true;
				}

				if ( ! $allow_any_amount ) {
				    if ( ! is_array( $allowed_amounts ) || ! in_array( $submitted_amount, array_map( 'floatval', $allowed_amounts ), true ) ) {
				        wp_send_json_error( 'error_amount_not_allowed' );
				    }
				}
		    }
		    else {
		    	
		        wp_send_json_error( 'error_missing_signature' );
		    }

		    // Continue transfer after validation
		    $request = mycred_new_transfer( $transfer, $post );

		    if ( ! is_array( $request ) ) {
		        wp_send_json_error( $request );
		    }

		    wp_send_json_success( $request );
		}

		/**
		 * Settings Page
		 * @since 0.1
		 * @version 1.5
		 */
		public function after_general_settings( $mycred = NULL ) {

			// Settings
			$settings  = $this->transfers;

			if ( ! array_key_exists( 'message', $settings ) )
				$settings['message'] = 0;

			// Limits
			$limit     = isset($settings['limit']['limit']) ? $settings['limit']['limit'] : '';
			$limits    = mycred_get_transfer_limits( $settings );

			// Autofill by
			$autofill = isset($settings['autofill']) ? $settings['autofill'] : null;
			$autofills = mycred_get_transfer_autofill_by( $settings );

			$yes_no    = array(
				1 => __( 'Yes', 'mycred' ),
				0 => __( 'No', 'mycred' )
			);

			if ( ! is_array( $settings ) ) {
    		    $settings = array(); 
            }

			if ( ! isset( $settings['types'] ) ) {
				$settings['types'] = isset($this->default_prefs['types']) ? $this->default_prefs['types'] : array();
			}

?>
<div class="mycred-ui-accordion">
	<div class="mycred-ui-accordion-header">
        <h4 class="mycred-ui-accordion-header-title">
            <span class="dashicons dashicons-update-alt static mycred-ui-accordion-header-icon"></span>
            <label><?php esc_html_e( 'Transfers', 'mycred' ); ?></label>
        </h4>
        <div class="mycred-ui-accordion-header-actions hide-if-no-js">
            <button type="button" aria-expanded="true">
                <span class="mycred-ui-toggle-indicator" aria-hidden="true"></span>
            </button>
        </div>
    </div>
	<div class="body mycred-ui-accordion-body" style="display:none;">

		<h3><?php esc_html_e( 'Features', 'mycred' ); ?></h3>
		<div class="row">
			<div class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
				<div class="form-group">
					<label for="mycred-transfer-type"><?php esc_html_e( 'Point Types', 'mycred' ); ?></label>

					<?php if ( count( $this->point_types ) > 1 ) : ?>

					<?php mycred_types_select_from_checkboxes( 'mycred_pref_core[transfers][types][]', 'mycred-transfer-type', $settings['types'] ); ?>

					<?php else : ?>

					<p class="form-control-static"><?php echo esc_html( $this->core->plural() ); ?></p>
					<input type="hidden" name="mycred_pref_core[transfers][types][]" value="<?php echo esc_attr( MYCRED_DEFAULT_TYPE_KEY ); ?>" />

					<?php endif; ?>

				</div>
			</div>
			<div class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
				<div class="form-group">
					<label for="<?php echo esc_attr( $this->field_id( 'reload' ) ); ?>"><?php esc_html_e( 'Reload', 'mycred' ); ?></label>
					<select name="<?php echo esc_attr( $this->field_name( 'reload' ) ); ?>" id="<?php echo esc_attr( $this->field_id( 'reload' ) ); ?>" class="form-control">
	<?php

				foreach ( $yes_no as $value => $label ) {
					$reload_value = isset($settings['reload']) ? $settings['reload'] : '';
					echo '<option value="' . esc_attr( $value ) . '" ' . selected( $reload_value, $value ) . '>' . esc_html( $label ) . '</option>';
				}

	?>
					</select>
					<p><span class="description"><?php esc_html_e( 'Should the page reload once a transfer has been completed?', 'mycred' ); ?></span></p>
				</div>
			</div>
			<div class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
				<div class="form-group">
					<label for="<?php echo esc_attr( $this->field_id( 'message' ) ); ?>"><?php esc_html_e( 'Message Length', 'mycred' ); ?></label>
					<input type="text" name="<?php echo esc_attr( $this->field_name( 'message' ) ); ?>" id="<?php echo esc_attr( $this->field_id( 'message' ) ); ?>" class="form-control" value="<?php echo esc_attr( absint( $settings['message'] ) ); ?>" />
					<p><span class="description"><?php esc_html_e( 'The maximum length of messages users can attach to a transfer. Use zero to disable.', 'mycred' ); ?></span></p>
				</div>
			</div>
			<div class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
				<div class="form-group">
					<label for="<?php echo esc_attr( $this->field_id( 'autofill' ) ); ?>"><?php esc_html_e( 'Autofill Recipient', 'mycred' ); ?></label>
					<select name="<?php echo esc_attr( $this->field_name( 'autofill' ) ); ?>" id="<?php echo esc_attr( $this->field_id( 'autofill' ) ); ?>" class="form-control">
	<?php

				foreach ( $autofills as $key => $label ) {
					echo '<option value="' . esc_attr( $key ) . '"';
					if ( $autofill == $key ) echo ' selected="selected"';
					echo '>' . esc_html( $label ) . '</option>';
				}

	?>
					</select>
					<p><span class="description"><?php esc_html_e( 'Select what user details recipients should be autofilled by.', 'mycred' ); ?></span></p>
				</div>
			</div>
		</div>
		<div class="row">
			<div class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
				<div class="form-group">
					<label for="<?php echo esc_attr( $this->field_id( array( 'limit' => 'none' ) ) ); ?>"><?php esc_html_e( 'Limits', 'mycred' ); ?></label>
	<?php

				// Loop though limits
				if ( ! empty( $limits ) ) {
					foreach ( $limits as $key => $description ) {

	?>
					<div class="radio"><label for="<?php echo esc_attr( $this->field_id( array( 'limit' => $key ) ) ); ?>"><input type="radio" name="<?php echo esc_attr( $this->field_name( array( 'limit' => 'limit' ) ) ); ?>" id="<?php echo esc_attr( $this->field_id( array( 'limit' => $key ) ) ); ?>" <?php checked( $limit, $key ); ?> value="<?php echo esc_attr( $key ); ?>" /> <?php echo esc_html( $description ); ?></label></div>
	<?php

					}
				}

	?>
				</div>
			</div>
			<div class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
				<div class="form-group">
					<label for="<?php echo esc_attr( $this->field_id( array( 'limit' => 'amount' ) ) ); ?>"><?php esc_html_e( 'Limit Amount', 'mycred' ); ?></label>
					<input type="text" name="<?php echo esc_attr( $this->field_name( array( 'limit' => 'amount' ) ) ); ?>" id="<?php echo esc_attr( $this->field_id( array( 'limit' => 'amount' ) ) ); ?>" class="form-control" value="<?php echo esc_attr( $this->core->number( isset($settings['limit']['amount']) ? $settings['limit']['amount'] : '' ) ); ?>" />
				</div>
			</div>
			<div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
				<div class="form-group">
					<label for="<?php echo esc_attr( $this->field_id( array( 'templates' => 'button' ) ) ); ?>"><?php esc_html_e( 'Default Button Label', 'mycred' ); ?></label>
					<input type="text" name="<?php echo esc_attr( $this->field_name( array( 'templates' => 'button' ) ) ); ?>" id="<?php echo esc_attr( $this->field_id( array( 'templates' => 'button' ) ) ); ?>" class="form-control" value="<?php echo esc_attr( isset($settings['templates']['button']) ? $settings['templates']['button'] : '' ); ?>" />
					<p><span class="description"><?php esc_html_e( 'The default transfer button label. You can override this in the shortcode or widget if needed.', 'mycred' ); ?></span></p>
				</div>
			</div>
		</div>

		<h3><?php esc_html_e( 'Log Templates', 'mycred' ); ?></h3>
		<div class="row">
			<div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
				<div class="form-group">
					<label for="<?php echo esc_attr( $this->field_id( array( 'logs' => 'sending' ) ) ); ?>"><?php esc_html_e( 'Log template for sending', 'mycred' ); ?></label>
					<input type="text" name="<?php echo esc_attr( $this->field_name( array( 'logs' => 'sending' ) ) ); ?>" id="<?php echo esc_attr( $this->field_id( array( 'logs' => 'sending' ) ) ); ?>" class="form-control" value="<?php echo esc_attr( isset($settings['logs']['sending']) ? $settings['logs']['sending'] : '' ); ?>" />
					<p><span class="description"><?php echo wp_kses_post( $this->core->available_template_tags( array( 'general', 'user' ) , '%transfer_message%' ) ); ?></span></p>
				</div>
			</div>
			<div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
				<div class="form-group">
					<label for="<?php echo esc_attr( $this->field_id( array( 'logs' => 'receiving' ) ) ); ?>"><?php esc_html_e( 'Log template for receiving', 'mycred' ); ?></label>
					<input type="text" name="<?php echo esc_attr( $this->field_name( array( 'logs' => 'receiving' ) ) ); ?>" id="<?php echo esc_attr( $this->field_id( array( 'logs' => 'receiving' ) ) ); ?>" class="form-control" value="<?php echo esc_attr( isset($settings['logs']['receiving']) ? $settings['logs']['receiving'] : '' ); ?>" />
					<p><span class="description"><?php echo wp_kses_post( $this->core->available_template_tags( array( 'general', 'user' ), '%transfer_message%' ) ); ?></span></p>
				</div>
			</div>
		</div>

		<h3><?php esc_html_e( 'Warning Messages', 'mycred' ); ?></h3>
		<div class="row">
			<div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
				<div class="form-group">
					<label for="<?php echo esc_attr( $this->field_id( array( 'errors' => 'low' ) ) ); ?>"><?php esc_html_e( 'Insufficient Funds Warning', 'mycred' ); ?></label>
					<input type="text" name="<?php echo esc_attr( $this->field_name( array( 'errors' => 'low' ) ) ); ?>" id="<?php echo esc_attr( $this->field_id( array( 'errors' => 'low' ) ) ); ?>" value="<?php echo esc_attr( isset($settings['errors']['low']) ? $settings['errors']['low'] : '' ); ?>" class="form-control" />
					<p><span class="description"><?php esc_html_e( 'Message to show the user if they try to send more then they can afford.', 'mycred' ); ?></span></p>
				</div>
			</div>
			<div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
				<div class="form-group">
					<label for="mycred-transfer-log-receiving"><?php esc_html_e( 'Limit Reached Warning', 'mycred' ); ?></label>
					<input type="text" name="<?php echo esc_attr( $this->field_name( array( 'errors' => 'over' ) ) ); ?>" id="<?php echo esc_attr( $this->field_id( array( 'errors' => 'over' ) ) ); ?>" value="<?php echo esc_attr( isset($settings['errors']['over']) ? $settings['errors']['over'] : '' ); ?>" class="form-control" />
					<p><span class="description"><?php esc_html_e( 'Message to show the user once they reach their transfer limit. Ignored if no limits are enforced.', 'mycred' ); ?></span></p>
				</div>
			</div>
		</div>
		<div class="row">
			<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
				<h3><?php esc_html_e( 'Visitors Template', 'mycred' ); ?></h3>
				<p><span class="description"><?php esc_html_e( 'The template to use when the transfer shortcode or widget is viewed by someone who is not logged in.', 'mycred' ); ?></span></p>
	<?php

				$login_content = isset($settings['templates']['login']) ? $settings['templates']['login'] : '';
				wp_editor(
				    $login_content,
				    $this->field_id(array('templates' => 'login')),
				    array(
				        'textarea_name' => esc_attr($this->field_name(array('templates' => 'login'))),
				        'textarea_rows' => 10
				    )
				);

	?>
			</div>
		</div>
		<div class="row">
			<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
				<h3><?php esc_html_e( 'Limit Template', 'mycred' ); ?></h3>
				<p><span class="description"><?php esc_html_e( 'The template to use if you select to show the transfer limit in the transfer shortcode or widget. Ignored if there is no limit enforced.', 'mycred' ); ?></span></p>
	<?php

				$limit_content = isset($settings['templates']['limit']) ? $settings['templates']['limit'] : '';
				wp_editor(
				    $limit_content, 
				    $this->field_id(array('templates' => 'limit')), 
				    array(
				        'textarea_name' => esc_attr($this->field_name(array('templates' => 'limit'))),
				        'textarea_rows' => 10
				    )
				);
				echo '<p>' . wp_kses_post( $this->core->available_template_tags( array( 'general' ), '%limit% %left%' ) ) . '</p>';

	?>
			</div>
		</div>
		<div class="row">
			<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
				<h3><?php esc_html_e( 'Balance Template', 'mycred' ); ?></h3>
				<p><span class="description"><?php esc_html_e( 'The template to use if you select to show the users balance in the transfer shortcode or widget. Ignored if balances are not shown.', 'mycred' ); ?></span></p>
	<?php

				$balance_content = isset($settings['templates']['balance']) ? $settings['templates']['balance'] : '';
				wp_editor(
				    $balance_content,
				    $this->field_id(array('templates' => 'balance')),
				    array(
				        'textarea_name' => esc_attr($this->field_name(array('templates' => 'balance'))),
				        'textarea_rows' => 10
				    )
				);

				echo '<p>' . wp_kses_post( $this->core->available_template_tags( array( 'general' ), '%balance%' ) ) . '</p>';

	?>
			</div>
		</div>
		<?php if ( MYCRED_SHOW_PREMIUM_ADDONS ) : ?>
		<hr />
		<div class="row">
			<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
				<p><strong>Tip:</strong> <?php printf( 'The %s add-on allows you charge a fee for creating transfers or put transfers on hold.', sprintf( '<a href="http://mycred.me/store/transfer-plus/" target="_blank">%s</a>', 'Transfer Plus' ) ); ?></p>
			</div>
		</div>
		<?php endif; ?>

	</div>
</div>
<?php

		}

		/**
		 * Sanitize & Save Settings
		 * @since 0.1
		 * @version 1.4
		 */
		public function sanitize_extra_settings( $new_data, $data, $general ) {

			$new_data['transfers']['types']                = $data['transfers']['types'];
			$new_data['transfers']['reload']               = isset($data['transfers']['reload']) ? absint( $data['transfers']['reload'] ) : '';
			$new_data['transfers']['message']              = absint( $data['transfers']['message'] );
			$new_data['transfers']['autofill']             = sanitize_text_field( $data['transfers']['autofill'] );

			$new_data['transfers']['limit']['limit']       = isset($data['transfers']['limit']['limit']) ? sanitize_text_field( $data['transfers']['limit']['limit'] ) : '';
			$new_data['transfers']['limit']['amount']      = absint( $data['transfers']['limit']['amount'] );
			$new_data['transfers']['templates']['button']  = sanitize_text_field( $data['transfers']['templates']['button'] ) ?? null;

			$new_data['transfers']['logs']['sending']      = wp_kses_post( $data['transfers']['logs']['sending'] );
			$new_data['transfers']['logs']['receiving']    = wp_kses_post( $data['transfers']['logs']['receiving'] );

			$new_data['transfers']['errors']['low']        = sanitize_text_field( $data['transfers']['errors']['low'] );
			$new_data['transfers']['errors']['over']       = sanitize_text_field( $data['transfers']['errors']['over'] );

			$new_data['transfers']['templates']['login']   = wp_kses_post( $data['transfers']['templates']['login'] );
			$new_data['transfers']['templates']['limit']   = wp_kses_post( $data['transfers']['templates']['limit'] );
			$new_data['transfers']['templates']['balance'] = wp_kses_post( $data['transfers']['templates']['balance'] );

			return $new_data;

		}

		/**
		 * Get Recipient
		 * @since 1.3.2
		 * @version 1.2.1
		 */
		public function get_recipient( $to = '' ) {

			$recipient_id = false;
			if ( ! empty( $to ) ) {

				// A numeric ID has been provided that we need to validate
				if ( is_numeric( $to ) ) {

					$user = get_userdata( $to );
					if ( isset( $user->ID ) )
						$recipient_id = $user->ID;

				}

				// A username has been provided
				elseif ( $this->transfers['autofill'] == 'user_login' ) {

					$user = get_user_by( 'login', $to );
					if ( isset( $user->ID ) )
						$recipient_id = $user->ID;

				}

				// An email address has been provided
				elseif ( $this->transfers['autofill'] == 'user_email' ) {

					$user = get_user_by( 'email', $to );
					if ( isset( $user->ID ) )
						$recipient_id = $user->ID;

				}

			}

			return apply_filters( 'mycred_transfer_get_recipient', $recipient_id, $to, $this );

		}

		/**
		 * Add Email Notice Instance
		 * @since 1.5.4
		 * @version 1.0
		 */
		public function email_notice_instance( $events, $request ) {

			if ( $request['ref'] == 'transfer' ) {

				if ( $request['amount'] < 0 )
					$events[] = 'transfer|negative';

				elseif ( $request['amount'] > 0 )
					$events[] = 'transfer|positive';

			}

			return $events;

		}

		/**
		 * Support for Email Notices
		 * @since 1.1
		 * @version 1.1
		 */
		public function email_notices( $data ) {

			if ( $data['request']['ref'] == 'transfer' ) {
				$message = $data['message'];
				if ( $data['request']['ref_id'] == get_current_user_id() )
					$data['message'] = $this->core->template_tags_user( $message, false, wp_get_current_user() );
				else
					$data['message'] = $this->core->template_tags_user( $message, $data['request']['ref_id'] );
			}

			return $data;

		}

	}
endif;

/**
 * Load Transfer Module
 * @since 1.7
 * @version 1.0
 */
if ( ! function_exists( 'mycred_load_transfer_addon' ) ) :
	function mycred_load_transfer_addon( $modules, $point_types ) {

		$modules['solo']['transfer'] = new myCRED_Transfer_Module();
		$modules['solo']['transfer']->load();

		return $modules;

	}
endif;
add_filter( 'mycred_load_modules', 'mycred_load_transfer_addon', 110, 2 );
