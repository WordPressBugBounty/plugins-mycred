<?php
if ( ! defined( 'MYCRED_PURCHASE' ) ) exit;

/**
 * myCRED_buyCRED_Module class
 * @since 0.1
 * @version 1.4.1
 */
if ( ! class_exists( 'myCRED_buyCRED_Module' ) ) :
	class myCRED_buyCRED_Module extends myCRED_Module {

		public $purchase_log = '';

		/**
		 * Construct
		 */
		function __construct( $type = MYCRED_DEFAULT_TYPE_KEY ) {

			parent::__construct( 'myCRED_BuyCRED_Module', array(
				'module_name' => 'gateways',
				'option_id'   => 'mycred_pref_buycreds',
				'defaults'    => array(
					'installed'     => array(),
					'active'        => array(),
					'gateway_prefs' => array()
				),
				'labels'      => array(
					'menu'        => __( 'buyCred Gateways', 'mycred' ),
					'page_title'  => __( 'buyCred Gateways', 'mycred' ),
					'page_header' => __( 'buyCred Gateways', 'mycred' )
				),
				'screen_id'   => MYCRED_SLUG . '-gateways',
				'accordion'   => true,
				'add_to_core' => true,
				'menu_pos'    => 70,
				'main_menu'   => true
			), $type );

			$this->mycred_type = MYCRED_DEFAULT_TYPE_KEY;

		}

		/**
		 * Load
		 * @version 1.0.2
		 */
		public function load() {

			add_filter( 'mycred_parse_log_entry',      array( $this, 'render_gift_tags' ), 10, 2 );

			add_action( 'mycred_init',                 array( $this, 'module_init' ), $this->menu_pos );
			add_action( 'wp_loaded',                   array( $this, 'module_run' ) );

			add_action( 'mycred_register_assets',      array( $this, 'register_assets' ) );
			add_action( 'mycred_front_enqueue_footer', array( $this, 'enqueue_footer' ) );

			add_action( 'mycred_admin_init',           array( $this, 'module_admin_init' ), $this->menu_pos );
			add_action( 'mycred_admin_init',           array( $this, 'register_settings' ), $this->menu_pos+1 );
			add_action( 'mycred_add_menu',             array( $this, 'add_menu' ), $this->menu_pos );
			add_action( 'mycred_add_menu',             array( $this, 'add_to_menu' ), $this->menu_pos+1 );

			add_action( 'mycred_after_core_prefs',     array( $this, 'after_general_settings' ) );
			add_filter( 'mycred_save_core_prefs',      array( $this, 'sanitize_extra_settings' ), 90, 3 );

			add_action( 'pre_get_comments',             array( $this, 'hide_buycred_transactions' ) );

			add_action( 'rest_api_init',               array( $this, 'register_buycred_gateways_rest_routes' ) );
			add_action( 'admin_enqueue_scripts',       array( $this, 'enqueue_react_gateways_scripts' ) );

			add_filter( 'mycred_central_banking_ignore', array( $this, 'ignore_central_banking_for_buycred' ) );

		}

		/**
		 * Ignore Central Banking for buyCred
		 * buyCred real-money purchases should not be blocked if the central bank has no funds.
		 */
		public function ignore_central_banking_for_buycred( $ignored ) {
			if ( ! is_array( $ignored ) ) {
				$ignored = array();
			}
			$gateways = buycred_get_installed_gateways();
			if ( ! empty( $gateways ) ) {
				foreach ( $gateways as $gateway_id => $gateway ) {
					$safe_id = str_replace( array( ' ', '-' ), '_', $gateway_id );
					$ignored[] = 'buy_creds_with_' . $safe_id;
				}
			}
			return $ignored;
		}

		/**
		 * Init
		 * Register shortcodes.
		 * @since 0.1
		 * @version 1.4
		 */
		public function module_init() {

			// Add shortcodes first
			add_shortcode( MYCRED_SLUG . '_buy',      'mycred_render_buy_points' );
			add_shortcode( MYCRED_SLUG . '_buy_form', 'mycred_render_buy_form_points' );

			$this->setup_instance();

			$this->current_user_id = get_current_user_id();

		}

		/**
		 * Register Assets
		 * @since 1.8
		 * @version 1.0
		 */
		public function register_assets() {

			wp_register_style( 'buycred-checkout', plugins_url( 'assets/css/checkout.css', MYCRED_PURCHASE ), array(), MYCRED_PURCHASE_VERSION, 'all' );
			wp_register_script( 'buycred-checkout', plugins_url( 'assets/js/checkout.js', MYCRED_PURCHASE ), array( 'jquery' ), MYCRED_PURCHASE_VERSION, 'all' );

		}

		/**
		 * Setup Purchase Instance
		 * @since 1.8
		 * @version 1.0
		 */
		public function setup_instance() {

			global $buycred_instance;

			$buycred_instance             = new StdClass();
			$buycred_instance->settings   = mycred_get_buycred_settings();
			$buycred_instance->active     = array();
			$buycred_instance->gateway_id = false;
			$buycred_instance->checkout   = false;
			$buycred_instance->cancelled  = false;
			$buycred_instance->error      = false;
			$buycred_instance->gateway    = false;

		}

		/**
		 * Get Payment Gateways
		 * Retreivs all available payment gateways that can be used to buyCRED
		 * @since 0.1
		 * @version 1.1.1
		 */
		public function get() {

		    $installed = mycred_get_buycred_gateways();

		    // Ensure all gateways have 'external' and 'custom_rate' keys
		    if ( ! empty( $installed ) ) {
		        foreach ( $installed as $id => $settings ) {

		            if ( ! array_key_exists( 'external', $settings ) )
		                $installed[ $id ]['external'] = true;

		            if ( ! array_key_exists( 'custom_rate', $settings ) )
		                $installed[ $id ]['custom_rate'] = false;
		        }
		    }

		 

		    return $installed;
		}

		/**
		 * Run
		 * Runs a gateway if requested.
		 * @since 1.7
		 * @version 1.0
		 */
		public function module_run() {

			global $buycred_instance;

			// Prep
			$installed = $this->get();

			// Make sure we have installed gateways.
			if ( empty( $installed ) ) return;

			// We only want to deal with active gateways
			foreach ( $installed as $id => $data ) {
				if ( $this->is_active( $id ) )
					$buycred_instance->active[ $id ] = $data;
			}

			if ( empty( $buycred_instance->active ) ) return;

			/**
			 * Step 1 - Look for returns
			 * Runs though all active payment gateways and lets them decide if this is the
			 * user returning after a remote purchase. Each gateway should know what to look
			 * for to determen if they are responsible for handling the return.
			 */
			foreach ( $buycred_instance->active as $id => $data ) {

				if ( $data['external'] === true )
					$this->call( 'returning', $buycred_instance->active[ $id ]['callback'] );

			}

			/**
			 * Step 2 - Check for gateway calls
			 * Checks to see if a gateway should be loaded.
			 */
			$buycred_instance->gateway_id = mycred_get_requested_gateway_id();
			$buycred_instance->checkout   = false;
			$buycred_instance->is_ajax    = ( isset( $_REQUEST['ajax'] ) && $_REQUEST['ajax'] == 1 ) ? true : false;

			do_action( 'mycred_pre_process_buycred' );

			// If we have a valid gateway ID and the gateway is active, lets run that gateway.
			if ( $buycred_instance->gateway_id !== false && array_key_exists( $buycred_instance->gateway_id, $buycred_instance->active ) ) {

				// Construct Gateway
				$buycred_instance->gateway = buycred_gateway( $buycred_instance->gateway_id );

				// Check payment processing
				if ( isset( $_REQUEST['mycred_call'] ) ) {

					$buycred_instance->gateway->process();

					do_action( 'mycred_buycred_process',               $buycred_instance->gateway_id, $this->gateway_prefs );
					do_action( "mycred_buycred_process_{$buycred_instance->gateway_id}", $this->gateway_prefs );

				}

				add_action( 'template_redirect',    array( $this, 'process_new_request' ) );
				add_filter( 'template_include',     array( $this, 'checkout_page' ) );

			}

		}

		/**
		 * Process New Request
		 * @since 1.8
		 * @version 1.0
		 */
		public function process_new_request() {

			global $buycred_instance, $buycred_sale;

			if ( $buycred_instance->checkout === false && isset( $_REQUEST['mycred_buy'] ) )
				$buycred_instance->checkout = true;

			if ( $buycred_instance->checkout ) {

				$buycred_sale = true;

				if ( $buycred_instance->gateway->valid_request() ) {

					if ( $buycred_instance->is_ajax )
						$buycred_instance->gateway->ajax_buy();

					do_action( 'mycred_buycred_buy', $buycred_instance->gateway_id, $this->gateway_prefs );
					do_action( "mycred_buycred_buy_{$buycred_instance->gateway_id}", $this->gateway_prefs );

				}
				else {

					if ( ! empty( $buycred_instance->gateway->errors ) ) {
						$buycred_instance->checkout = false;

						if ( $buycred_instance->is_ajax )
							die( json_encode( array( 'validationFail' => true , 'errors' => $buycred_instance->gateway->errors ) ) );
						else
					    {
					        foreach( $buycred_instance->gateway->errors as $error )
					        {
					            global $wp;
					            echo "
					            <script>
					                alert('" . esc_js( $error ) . "');
					                location.replace( '" . esc_js( home_url( $wp->request ) ) . "' );
					            </script>
					            ";
					        }
					    }
					}

				}

			}

		}

		/**
		 * Checkout Page
		 * @since 1.8
		 * @version 1.0
		 */
		public function checkout_page( $template ) {

			global $buycred_instance;

			if ( $buycred_instance->checkout ) {

				return MYCRED_BUYCRED_TEMPLATES_DIR . 'buycred-checkout.php';
				$override = mycred_locate_template( 'buycred-checkout.php', MYCRED_SLUG, MYCRED_BUYCRED_TEMPLATES_DIR );
				if ( ! $override )
					$template = $override;

			}

			return $template;

		}

		/**
		 * Enqueue Footer
		 * @since 1.8
		 * @version 1.0
		 */
		public function enqueue_footer() {

			global $buycred_instance, $buycred_sale;

			$settings = mycred_get_buycred_settings();

			if ( $buycred_sale ) {

				wp_enqueue_style( 'buycred-checkout' );

				wp_localize_script(
					'buycred-checkout',
					'buyCRED',
					apply_filters( 'mycred_buycred_checkout_js', array(
						'ajaxurl'     => get_site_url(),
						'token'       => wp_create_nonce( 'mycred-buy-creds' ),
						'checkout'    => $settings['checkout'],
						'redirecting' => esc_js( esc_attr__( 'Redirecting', 'mycred' ) ),
						'error'       => 'communications error'
					), $this )
				);
				wp_enqueue_script( 'buycred-checkout' );

				if ( $settings['checkout'] != 'page' ) {
					echo '
<div id="cancel-checkout-wrapper"><a href="javascript:void(0);">X</a></div>
<div id="buycred-checkout-wrapper">
	<div class="checkout-inside">
		<div class="checkout-wrapper">

			<div id="checkout-box">

				<form method="post" action="" id="buycred-checkout-form">
					<div class="loading-indicator"></div>
				</form>

			</div>

		</div>
	</div>
</div>';
				}

			}

		}

		/**
		 * Admin Init
		 * @since 1.5
		 * @version 1.1
		 */
		public function module_admin_init() {

			add_action( 'mycred_user_edit_after_balances', array( $this, 'exchange_rates_user_screen' ), 30 );

			add_action( 'personal_options_update',         array( $this, 'save_manual_exchange_rates' ), 30 );
			add_action( 'edit_user_profile_update',        array( $this, 'save_manual_exchange_rates' ), 30 );

			// Prep
			$installed = mycred_get_buycred_gateways();

			// Make sure we have installed gateways.
			if ( empty( $installed ) ) return;

			/**
			 * Admin Init
			 * Runs though all installed gateways to allow admin inits.
			 */
			foreach ( $installed as $id => $data )
				$this->call( 'admin_init', $installed[ $id ]['callback'] );

		}

		/**
		 * Add to General Settings
		 * @since 0.1
		 * @version 1.2
		 */
		public function after_general_settings( $mycred = NULL ) {

			// Reset while on this screen so we can use $this->field_id() and $this->field_name()
			$this->module_name = 'buy_creds';
			$this->option_id   = '';

			$uses_buddypress   = class_exists( 'BuddyPress' );

			$settings          = mycred_get_buycred_settings();

?>
<div class="mycred-ui-accordion">
	<div class="mycred-ui-accordion-header">
        <h4 class="mycred-ui-accordion-header-title">
            <span class="dashicons dashicons-mycred-buycred static mycred-ui-accordion-header-icon"></span>
            <label><strong>buy</strong>CRED</label>
        </h4>
        <div class="mycred-ui-accordion-header-actions hide-if-no-js">
            <button type="button" aria-expanded="true">
                <span class="mycred-ui-toggle-indicator" aria-hidden="true"></span>
            </button>
        </div>
    </div>
	<div class="body mycred-ui-accordion-body" style="display:none;">

		<div class="row">
			<div class="col-lg-8 col-md-8 col-sm-12 col-xs-12">
				<h3><?php esc_html_e( 'Sale Setup', 'mycred' ); ?></h3>
	<?php

				foreach ( $this->point_types as $type_id => $label ) {

					$mycred     = mycred( $type_id );
					$sale_setup = mycred_get_buycred_sale_setup( $type_id );

	?>
				<div class="row">
					<div class="col-lg-3 col-md-3 col-sm-12 col-xs-12">

						<div class="form-group">
							<label for="buycred-type-<?php echo esc_attr( $type_id ); ?>-enabled"><?php echo esc_html( $mycred->plural() ); ?></label>
							<div class="checkbox" style="padding-top: 4px;">
								<label for="buycred-type-<?php echo esc_attr( $type_id ); ?>-enabled"><input type="checkbox" name="mycred_pref_core[buy_creds][types][<?php echo esc_attr( $type_id ); ?>][enabled]" id="buycred-type-<?php echo esc_attr( $type_id ); ?>-enabled"<?php if ( in_array( $type_id, $settings['types'] ) ) echo ' checked="checked"'; ?> value="<?php echo esc_attr( $type_id ); ?>" /> <?php esc_html_e( 'Enable', 'mycred' ); ?></label>
							</div>
						</div>

					</div>
					<div class="col-lg-3 col-md-3 col-sm-12 col-xs-12">

						<div class="form-group">
							<label for="buycred-type-<?php echo esc_attr( $type_id ); ?>-min"><?php esc_html_e( 'Minimum Amount', 'mycred' ); ?></label>
							<input type="text" name="mycred_pref_core[buy_creds][types][<?php echo esc_attr( $type_id ); ?>][min]" id="buycred-type-<?php echo esc_attr( $type_id ); ?>-min" class="form-control" placeholder="<?php echo esc_attr( $mycred->get_lowest_value() ); ?>" value="<?php echo esc_attr( $sale_setup['min'] ); ?>" />
						</div>

					</div>
					<div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">

						<div class="form-group">
							<label for="buycred-type-<?php echo esc_attr( $type_id ); ?>-max"><?php esc_html_e( 'Maximum', 'mycred' ); ?></label>
							<div class="row">
								<div class="col-lg-6 col-md-6 col-sm-6 col-xs-6">
									<input type="text" name="mycred_pref_core[buy_creds][types][<?php echo esc_attr( $type_id ); ?>][max]" id="buycred-type-<?php echo esc_attr( $type_id ); ?>-max" class="form-control" placeholder="<?php esc_attr_e( 'No limit', 'mycred' ); ?>" value="<?php echo esc_attr( $sale_setup['max'] ); ?>" />
								</div>
								<div class="col-lg-6 col-md-6 col-sm-6 col-xs-6">
									<?php mycred_purchase_limit_dropdown( 'mycred_pref_core[buy_creds][types][' . $type_id . '][time]', 'buycred-type-' . $type_id . '-time', $sale_setup['time'] ); ?>
								</div>
							</div>
						</div>

					</div>
				</div>
	<?php

				}

	?>
				
				<div class="form-group">
					<div class="checkbox">
						<label for="<?php echo esc_attr( $this->field_id( 'custom_log' ) ); ?>"><input type="checkbox" name="<?php echo esc_attr( $this->field_name( 'custom_log' ) ); ?>" id="<?php echo esc_attr( $this->field_id( 'custom_log' ) ); ?>"<?php checked( $settings['custom_log'], 1 ); ?> value="1" /> <?php echo esc_html( $this->core->template_tags_general( __( 'Create a dedicated log for purchases.', 'mycred' ) ) ); ?></label>
					</div>
				</div>
				<hr />
			</div>
			<div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
				<h3><?php esc_html_e( 'Checkout', 'mycred' ); ?></h3>

				<div class="form-group">
					<div class="row">
						<div class="col-lg-6 col-md-6 col-sm-6 col-xs-6 text-center">
							<label for="<?php echo esc_attr( $this->field_id( 'checkout-full' ) ); ?>">
								<img src="<?php echo esc_url( plugins_url( 'assets/images/checkout-full.png', MYCRED_PURCHASE ) ); ?>" alt="" style="max-width: 100%; height: auto;" />
								
							</label>
							<input type="radio" name="<?php echo esc_attr( $this->field_name( 'checkout' ) ); ?>"<?php checked( $settings['checkout'], 'page' ); ?> id="<?php echo esc_attr( $this->field_id( 'checkout-full' ) ); ?>" value="page" /> Full Page
						</div>
						<div class="col-lg-6 col-md-6 col-sm-6 col-xs-6 text-center">
							<label for="<?php echo esc_attr( $this->field_id( 'checkout-popup' ) ); ?>">
								<img src="<?php echo esc_url( plugins_url( 'assets/images/checkout-popup.png', MYCRED_PURCHASE ) ); ?>" alt="" style="max-width: 100%; height: auto;" />
							</label>
							<input type="radio" name="<?php echo esc_attr( $this->field_name( 'checkout' ) ); ?>"<?php checked( $settings['checkout'], 'popup' ); ?> id="<?php echo esc_attr( $this->field_id( 'checkout-popup' ) ); ?>" value="popup" /> Popup
						</div>
					</div>

				</div>

			</div>
		</div>

		<h3><?php esc_html_e( 'Redirects', 'mycred' ); ?></h3>
		<div class="row">
			<div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
				<div class="form-group">
					<p style="margin-top: 0;"><span class="description"><?php esc_html_e( 'Where should users be redirected to upon successfully completing a purchase. You can nominate a specific URL or a page.', 'mycred' ); ?></span></p>
				</div>
			</div>	
			<div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
				<div class="form-group">
					<p style="margin-top: 0;"><span class="description"><?php esc_html_e( 'Where should users be redirected to if they cancel a transaction. You can nominate a specific URL or a page.', 'mycred' ); ?></span></p>
				</div>
			</div>
			<div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
				<div class="form-group">
					<label for="<?php echo esc_attr( $this->field_id( array( 'thankyou' => 'page' ) ) ); ?>"><?php esc_html_e( 'Redirect to Page', 'mycred' ); ?></label>
				<?php
					// Thank you page dropdown
					$thankyou_args = array(
						'name'             => $this->field_name( array( 'thankyou' => 'page' ) ),
						'id'               => $this->field_id( array( 'thankyou' => 'page' ) ) . '-id',
						'selected'         => $settings['thankyou']['page'],
						'show_option_none' => __( 'Select', 'mycred' ),
						'class'            => 'form-control',
						'echo'             => 0
					);
					echo wp_kses( 
						wp_dropdown_pages( $thankyou_args ),
						array(
							'select' => array(
								'id' => array(),
								'name' => array(),
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
				<div class="form-group">
					<label for="<?php echo esc_attr( $this->field_id( array( 'thankyou' => 'custom' ) ) ); ?>"><?php esc_html_e( 'Redirect to URL', 'mycred' ); ?></label>
					<input type="text" name="<?php echo esc_attr( $this->field_name( array( 'thankyou' => 'custom' ) ) ); ?>" id="<?php echo esc_attr( $this->field_id( array( 'thankyou' => 'custom' ) ) ); ?>" placeholder="https://" class="form-control" value="<?php echo esc_attr( $settings['thankyou']['custom'] ); ?>" />
				</div>
				<?php if ( $uses_buddypress ) : ?>
				<p style="margin-top: 0;"><span class="description"><?php esc_html_e( 'You can use %profile% for the base URL of the users profile.', 'mycred' ); ?></span></p>
				<?php endif; ?>
			</div>

		
			<div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
				<div class="form-group">
					<label for="<?php echo esc_attr( $this->field_id( array( 'cancelled' => 'page' ) ) ); ?>"><?php esc_html_e( 'Redirect to Page', 'mycred' ); ?></label>
	<?php

				// Thank you page dropdown
				$thankyou_args = array(
					'name'             => $this->field_name( array( 'cancelled' => 'page' ) ),
					'id'               => $this->field_id( array( 'cancelled' => 'page' ) ) . '-id',
					'selected'         => $settings['cancelled']['page'],
					'show_option_none' => __( 'Select', 'mycred' ),
					'class'            => 'form-control',
					'echo'             => 0
				);
				echo wp_kses( 
					wp_dropdown_pages( $thankyou_args ),
					array(
						'select' => array(
							'id' => array(),
							'name' => array(),
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
				<div class="form-group">
					<label for="<?php echo esc_attr( $this->field_id( array( 'cancelled' => 'custom' ) ) ); ?>"><?php esc_html_e( 'Redirect to URL', 'mycred' ); ?></label>
					<input type="text" name="<?php echo esc_attr( $this->field_name( array( 'cancelled' => 'custom' ) ) ); ?>" id="<?php echo esc_attr( $this->field_id( array( 'cancelled' => 'custom' ) ) ); ?>" placeholder="https://" class="form-control" value="<?php echo esc_attr( $settings['cancelled']['custom'] ); ?>" />
				</div>
				<?php if ( $uses_buddypress ) : ?>
				<p style="margin-top: 0;"><span class="description"><?php esc_html_e( 'You can use %profile% for the base URL of the users profile.', 'mycred' ); ?></span></p>
				<?php endif; ?>

			</div>
		</div>

		<h3><?php esc_html_e( 'Templates', 'mycred' ); ?></h3>
		<div class="row">
			<div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">

				<div class="form-group">
					<label for="<?php echo esc_attr( $this->field_id( 'login' ) ); ?>"><?php esc_html_e( 'Login Message', 'mycred' ); ?></label>
					<input type="text" name="<?php echo esc_attr( $this->field_name( 'login' ) ); ?>" id="<?php echo esc_attr( $this->field_id( 'login' ) ); ?>" class="form-control" value="<?php echo esc_attr( $settings['login'] ); ?>" />
					<p><span class="description"><?php esc_html_e( 'Message to show in shortcodes when viewed by someone who is not logged in.', 'mycred' ); ?></span></p>
				</div>

			</div>
			<div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">

				<div class="form-group">
					<label for="<?php echo esc_attr( $this->field_id( 'log' ) ); ?>"><?php esc_html_e( 'Log Template', 'mycred' ); ?></label>
					<input type="text" name="<?php echo esc_attr( $this->field_name( 'log' ) ); ?>" id="<?php echo esc_attr( $this->field_id( 'log' ) ); ?>" class="form-control" placeholder="<?php esc_attr_e( 'Required', 'mycred' ); ?>" value="<?php echo esc_attr( $settings['log'] ); ?>" />
					<p><span class="description"><?php echo wp_kses_post( $this->core->available_template_tags( array( 'general' ), '%gateway%' ) ); ?></span></p>
				</div>

			</div>
		</div>

		<h3><?php esc_html_e( 'Gifting', 'mycred' ); ?></h3>
		<div class="row">
			<div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">

				<div class="form-group">
					<div class="checkbox">
						<label for="<?php echo esc_attr( $this->field_id( array( 'gifting' => 'members' ) ) ); ?>"><input type="checkbox" name="<?php echo esc_attr( $this->field_name( array( 'gifting' => 'members' ) ) ); ?>" id="<?php echo esc_attr( $this->field_id( array( 'gifting' => 'members' ) ) ); ?>"<?php checked( $settings['gifting']['members'], 1 ); ?> value="1" /> <?php echo wp_kses_post( $this->core->template_tags_general( __( 'Allow users to buy %_plural% for other users.', 'mycred' ) ) ); ?></label>
					</div>
					<div class="checkbox">
						<label for="<?php echo esc_attr( $this->field_id( array( 'gifting' => 'authors' ) ) ); ?>"><input type="checkbox" name="<?php echo esc_attr( $this->field_name( array( 'gifting' => 'authors' ) ) ); ?>" id="<?php echo esc_attr( $this->field_id( array( 'gifting' => 'authors' ) ) ); ?>"<?php checked( $settings['gifting']['authors'], 1 ); ?> value="1" /> <?php echo wp_kses_post( $this->core->template_tags_general( __( 'Allow users to buy %_plural% for content authors.', 'mycred' ) ) ); ?></label>
					</div>
				</div>

			</div>
			<div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">

				<div class="form-group">
					<label for="<?php echo esc_attr( $this->field_id( array( 'gifting' => 'log' ) ) ); ?>"><?php esc_html_e( 'Log Template', 'mycred' ); ?></label>
					<input type="text" name="<?php echo esc_attr( $this->field_name( array( 'gifting' => 'log' ) ) ); ?>" id="<?php echo esc_attr( $this->field_id( 'log' ) ); ?>" class="form-control" placeholder="<?php esc_attr_e( 'Required', 'mycred' ); ?>" value="<?php echo esc_attr( $settings['gifting']['log'] ); ?>" />
					<p><span class="description"><?php echo wp_kses_post( $this->core->available_template_tags( array( 'general', 'user' ) ) ); ?></span></p>
				</div>

			</div>
		</div>

		<h3 style="margin-bottom: 0;"><?php esc_html_e( 'Available Shortcodes', 'mycred' ); ?></h3>
		<div class="row">
			<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
				<p><a href="http://codex.mycred.me/shortcodes/mycred_buy/" target="_blank">[mycred_buy]</a>, <a href="http://codex.mycred.me/shortcodes/mycred_buy_form/" target="_blank">[mycred_buy_form]</a>, <a href="http://codex.mycred.me/shortcodes/mycred_buy_pending/" target="_blank">[mycred_buy_pending]</a></p>
			</div>
		</div>

	</div>
</div>
<?php

			$this->module_name = 'gateways';
			$this->option_id   = 'mycred_pref_buycreds';

		}

		/**
		 * Save Settings
		 * @since 0.1
		 * @version 1.2
		 */
		public function sanitize_extra_settings( $new_data, $data, $core ) {

			$point_types = array();

			if ( isset( $data['buy_creds']['types'] ) && ! empty( $data['buy_creds']['types'] ) ) {
				foreach ( $data['buy_creds']['types'] as $type_id => $setup ) {

					$type_id = sanitize_key( $type_id );
					if ( ! mycred_point_type_exists( $type_id ) ) continue;

					if ( isset( $setup['enabled'] ) ) 
						$point_types[]    = $type_id;

					$settings         = array();
					$settings['min']  = sanitize_text_field( $setup['min'] );
					$settings['max']  = sanitize_text_field( $setup['max'] );
					$settings['time'] = sanitize_key( $setup['time'] );

					$settings         = shortcode_atts( mycred_get_buycred_sale_setup( $type_id ), $settings );

					mycred_update_option( 'buycred-setup-' . $type_id, $settings );

				}
			}

			if ( empty( $point_types ) )
				$point_types[] = MYCRED_DEFAULT_TYPE_KEY;

			$new_data['buy_creds']['types']               = $point_types;

			$new_data['buy_creds']['checkout']            = sanitize_key( $data['buy_creds']['checkout'] );
			$new_data['buy_creds']['log']                 = sanitize_text_field( $data['buy_creds']['log'] );
			$new_data['buy_creds']['login']               = wp_kses_post( $data['buy_creds']['login'] );

			$new_data['buy_creds']['thankyou']['page']    = absint( $data['buy_creds']['thankyou']['page'] );
			$new_data['buy_creds']['thankyou']['custom']  = sanitize_text_field( $data['buy_creds']['thankyou']['custom'] );
			$new_data['buy_creds']['thankyou']['use']     = ( $new_data['buy_creds']['thankyou']['custom'] != '' ) ? 'custom' : 'page';

			$new_data['buy_creds']['cancelled']['page']   = absint( $data['buy_creds']['cancelled']['page'] );
			$new_data['buy_creds']['cancelled']['custom'] = sanitize_text_field( $data['buy_creds']['cancelled']['custom'] );
			$new_data['buy_creds']['cancelled']['use']    = ( $new_data['buy_creds']['cancelled']['custom'] != '' ) ? 'custom' : 'page';

			$new_data['buy_creds']['custom_log']          = ( ! isset( $data['buy_creds']['custom_log'] ) ) ? 0 : 1;

			$new_data['buy_creds']['gifting']['members']  = ( ! isset( $data['buy_creds']['gifting']['members'] ) ) ? 0 : 1;
			$new_data['buy_creds']['gifting']['authors']  = ( ! isset( $data['buy_creds']['gifting']['authors'] ) ) ? 0 : 1;
			$new_data['buy_creds']['gifting']['log']      = sanitize_text_field( $data['buy_creds']['gifting']['log'] );

			delete_option( 'mycred_buycred_reset' );

			return $new_data;

		}

		/**
		 * Render Gift Tags
		 * @since 1.4.1
		 * @version 1.0
		 */
		public function render_gift_tags( $content, $log ) {

			if ( substr( $log->ref, 0, 15 ) != 'buy_creds_with_' ) return $content;
			return $this->core->template_tags_user( $content, absint( $log->ref_id ) );

		}

		/**
		 * Add Admin Menu Item
		 * @since 0.1
		 * @version 1.2
		 */
		public function add_to_menu() {

			// In case we are using the Master Template feautre on multisites, and this is not the main
			// site in the network, bail.
			if ( mycred_override_settings() && ! mycred_is_main_site() ) return;

			// If we selected to insert a purchase log
			if ( isset( $this->core->buy_creds['custom_log'] ) && $this->core->buy_creds['custom_log'] ) {

				$pages       = array();
				$point_types = ( isset( $this->core->buy_creds['types'] ) && ! empty( $this->core->buy_creds['types'] ) ) ? $this->core->buy_creds['types'] : array( MYCRED_DEFAULT_TYPE_KEY );

				foreach ( $point_types as $type_id ) {

					$mycred    = mycred( $type_id );
					$menu_slug = ( $type_id != MYCRED_DEFAULT_TYPE_KEY ) ? MYCRED_SLUG . '_' . $type_id : MYCRED_SLUG;

					$pages[]   = add_submenu_page(
						$menu_slug,
						__( 'buyCRED Purchase Log', 'mycred' ),
						__( 'Purchase Log', 'mycred' ),
						$mycred->get_point_editor_capability(),
						MYCRED_SLUG . '-purchases-' . $type_id,
						array( $this, 'purchase_log_page' )
					);

				}

				foreach ( $pages as $page ) {

					add_action( 'admin_print_styles-' . $page, array( $this, 'settings_page_enqueue' ) );
					add_action( 'load-' . $page,               array( $this, 'screen_options' ) );

				}

				$this->purchase_log = $pages;

			}

		}

		/**
		 * Page Header
		 * @since 1.3
		 * @version 1.2
		 */
		public function settings_header() {

			wp_enqueue_style( 'mycred-bootstrap-grid' );

		}

		/**
		 * Payment Gateways Page
		 * @since 0.1
		 * @since 2.3 Added more gateways in tab `mycred_buycred_more_gateways_tab`
		 * @version 1.2.2
		 */
		public function admin_page() {

			// Security
			if ( ! $this->core->user_is_point_admin() ) wp_die( 'Access Denied' );

			mycred_render_admin_header();
?>
<div class="wrap" id="myCRED-wrap" style="width: 90% !important; max-width: 1440px !important; margin: 20px auto !important; padding: 0 !important; background: transparent !important; box-shadow: none !important; border: none !important;">
	<div id="mycred-buycred-gateways-root"></div>
</div>
<?php
		}

		/**
		 * Sanititze Settings
		 * @since 0.1
		 * @version 1.3.1
		 */
		public function sanitize_settings( $data ) {

			$data      = apply_filters( 'mycred_buycred_save_prefs', $data );
			$installed = $this->get();

			if ( empty( $installed ) ) return $data;

			$existing         = mycred_get_option( $this->option_id, array() );
			$existing_active  = ( ! empty( $existing['active'] ) && is_array( $existing['active'] ) ) ? array_map( 'strval', $existing['active'] ) : array();
			$existing_prefs   = ( ! empty( $existing['gateway_prefs'] ) && is_array( $existing['gateway_prefs'] ) ) ? $existing['gateway_prefs'] : array();
			$posted_pref_ids  = ( ! empty( $data['gateway_prefs'] ) && is_array( $data['gateway_prefs'] ) ) ? array_map( 'strval', array_keys( $data['gateway_prefs'] ) ) : array();
			$posted_active    = ( ! empty( $data['active'] ) && is_array( $data['active'] ) ) ? array_map( 'strval', $data['active'] ) : array();

			// Preserve prefs for gateways not included in this (often single-gateway) save.
			if ( ! isset( $data['gateway_prefs'] ) || ! is_array( $data['gateway_prefs'] ) ) {
				$data['gateway_prefs'] = array();
			}
			foreach ( $existing_prefs as $gateway_id => $prefs ) {
				$gateway_id = (string) $gateway_id;
				if ( ! array_key_exists( $gateway_id, $data['gateway_prefs'] ) ) {
					$data['gateway_prefs'][ $gateway_id ] = $prefs;
				}
			}

			foreach ( $installed as $gateway_id => $gateway ) {

				$gateway_id     = (string) $gateway_id;
				$submitted_data = ( ! empty( $data['gateway_prefs'] ) && array_key_exists( $gateway_id, $data['gateway_prefs'] ) ) ? $data['gateway_prefs'][ $gateway_id ] : false;

				// Only re-sanitise gateways that were actually posted this request.
				if ( in_array( $gateway_id, $posted_pref_ids, true ) && $submitted_data !== false )
					$data['gateway_prefs'][ $gateway_id ] = $this->call( 'sanitise_preferences', $installed[ $gateway_id ]['callback'], $submitted_data );

			}

			// Partial React detail saves only post one gateway's Enable checkbox — merge active list.
			$is_partial_save = ! empty( $posted_pref_ids ) && count( $posted_pref_ids ) < count( $installed );
			if ( $is_partial_save ) {
				$merged_active = $existing_active;
				foreach ( $posted_pref_ids as $gateway_id ) {
					$merged_active = array_values( array_diff( $merged_active, array( $gateway_id ) ) );
					if ( in_array( $gateway_id, $posted_active, true ) ) {
						$merged_active[] = $gateway_id;
					}
				}
				$data['active'] = array_values( array_unique( $merged_active ) );
			} elseif ( ! isset( $data['active'] ) || ! is_array( $data['active'] ) ) {
				$data['active'] = $existing_active;
			}

			return $data;

		}

		/**
		 * Purchase Log Screen Options
		 * @since 1.4
		 * @version 1.1
		 */
		public function screen_options() {

			if ( empty( $this->purchase_log ) ) return;

			$meta_key = 'mycred_payments_' . str_replace( MYCRED_SLUG . '-purchases-', '', ( isset( $_GET['page'] ) ? sanitize_key( wp_unslash( $_GET['page'] ) ) : '' ) );

			if ( isset( $_REQUEST['wp_screen_options']['option'] ) && isset( $_REQUEST['wp_screen_options']['value'] ) ) {
			
				if ( $_REQUEST['wp_screen_options']['option'] == $meta_key ) {
					$value = absint( $_REQUEST['wp_screen_options']['value'] );
					mycred_update_user_meta( $this->current_user_id, $meta_key, $value );
				}

			}

			$args = array(
				'label'   => __( 'Payments', 'mycred' ),
				'default' => 10,
				'option'  => $meta_key
			);
			add_screen_option( 'per_page', $args );

		}

		/**
		 * Purchase Log
		 * Render the dedicated admin screen where all point purchases are shown from the myCRED Log.
		 * This screen is added in for each point type that is set to be for sale.
		 * @since 1.4
		 * @version 1.5
		 */
		public function purchase_log_page() {

			$point_type           = str_replace( 'mycred-purchases-', '', ( isset( $_GET['page'] ) ? sanitize_key( $_GET['page'] ) : '' ) );
			$installed            = $this->get();

			$mycred               = $this->core;
			if ( $point_type != MYCRED_DEFAULT_TYPE_KEY && mycred_point_type_exists( $point_type ) )
				$mycred = mycred( $point_type );

			// Security (incase the user has setup different capabilities to manage this particular point type)
			if ( ! $mycred->user_is_point_editor() ) wp_die( 'Access Denied' );

			// Get references
			$references           = mycred_get_buycred_gateway_refs( $point_type );

			$search_args          = mycred_get_search_args();
			$filter_url           = admin_url( 'admin.php?page=' . MYCRED_SLUG . '-purchases-' . $point_type );

			$per_page             = mycred_get_user_meta( $this->current_user_id, 'mycred_payments_' . $point_type, '', true );
			if ( empty( $per_page ) || $per_page < 1 ) $per_page = 10;

			// Entries per page
			if ( ! array_key_exists( 'number', $search_args ) )
				$search_args['number'] = absint( $per_page );

			$search_args['ctype'] = $point_type;
			$search_args['ref']   = array(
				'ids'     => $references,
				'compare' => 'IN'
			);

			$log                  = new myCRED_Query_Log( $search_args );
			$log->headers         = apply_filters( 'mycred_buycred_log_columns', array(
				'column-gateway'     => __( 'Gateway', 'mycred' ),
				'column-username'    => __( 'Buyer', 'mycred' ),
				'column-date'        => __( 'Date', 'mycred' ),
				'column-amount'      => $mycred->plural(),
				'column-payed'       => __( 'Payed', 'mycred' ),
				'column-tranid'      => __( 'Transaction ID', 'mycred' )
			) );

?>
<div class="wrap list" id="myCRED-wrap">
	<h1><?php esc_html_e( 'Purchase Log', 'mycred' ); ?></h1>

	<form method="get" action="" name="mycred-buycred-form" id="posts-filter" novalidate>
		<input type="hidden" name="page" value="<?php echo esc_attr( sanitize_key( wp_unslash( $_GET['page'] ) ) ); ?>" />
<?php

			if ( array_key_exists( 's', $search_args ) )
				echo '<input type="hidden" name="s" value="' . esc_attr( $search_args['s'] ) . '" />';

			if ( isset( $_GET['ref'] ) )
				echo '<input type="hidden" name="show" value="' . esc_attr( sanitize_key( wp_unslash( $_GET['ref'] ) ) ) . '" />';

			if ( isset( $_GET['show'] ) )
				echo '<input type="hidden" name="show" value="' . esc_attr( sanitize_key( wp_unslash( $_GET['show'] ) ) ) . '" />';

			if ( array_key_exists( 'order', $search_args ) )
				echo '<input type="hidden" name="order" value="' . esc_attr( $search_args['order'] ) . '" />';

			if ( array_key_exists( 'paged', $search_args ) )
				echo '<input type="hidden" name="paged" value="' . esc_attr( $search_args['paged'] ) . '" />';

			?>
			<div class="mycred-log-navigation"><?php
				$log->filter_dates( esc_url( $filter_url ) );
				$log->search();
			?></div>

		<?php do_action( 'mycred_above_payment_log_table', $this ); ?>

		<div class="tablenav top">

			<?php $log->table_nav( 'top' ); ?>

		</div>
		<table class="wp-list-table widefat fixed striped users mycred-table" cellspacing="0">
			<thead>
				<tr>
<?php

			foreach ( $log->headers as $col_id => $col_title )
				echo '<th scope="col" id="' . esc_attr( str_replace( 'column-', '', $col_id ) ) . '" class="manage-column ' . esc_attr( $col_id ) . '">' . esc_html( $col_title ) . '</th>';

?>
				</tr>
			</thead>
			<tfoot>
				<tr>
<?php

			foreach ( $log->headers as $col_id => $col_title )
				echo '<th scope="col" class="manage-column ' . esc_attr( $col_id ) . '">' . esc_html( $col_title ) . '</th>';
?>
				</tr>
			</tfoot>
			<tbody id="the-list">
<?php

			// If we have results
			if ( $log->have_entries() ) {

				// Prep
				$date_format = get_option( 'date_format' ) . ' ' . get_option( 'time_format' );
				$entry_data  = '';
				$alt         = 0;

				// Loop results
				foreach ( $log->results as $log_entry ) {

					// Highlight alternate rows
					$alt   = $alt + 1;
					$class = '';
					$style = '';
					if ( $alt % 2 == 0 ) $class = ' alt';

					// Prep Sales data for use in columns
					$sales_data = $this->get_sales_data_from_log_data( $log_entry->data );
					list ( $buyer_id, $payer_id, $amount, $cost, $currency, $token, $other ) = $sales_data;

					// Default Currency
					if ( empty( $currency ) )
						$currency = 'USD';

					$gateway_name = str_replace( 'buy_creds_with_', '', $log_entry->ref );

					// Color rows based on if the transaction was made in Sandbox mode or using a gateway that no longer is used.
					if ( ! array_key_exists( str_replace( '_', '-', $gateway_name ), $installed ) )
						$style = ' style="color:silver;"';

					elseif ( ! $this->is_active( str_replace( '_', '-', $gateway_name ) ) )
						$style = ' style="color:gray;"';

					elseif ( substr( $log_entry->entry, 0, 4 ) == 'TEST' )
						$style = ' style="color:orange;"';

					echo '<tr class="myCRED-log-row' . esc_attr( $class ) . '" id="mycred-log-entry-' . esc_attr( $log_entry->id ) . '">';

					// Run though columns
					foreach ( $log->headers as $column_id => $column_name ) {

						echo '<td class="' . esc_attr( $column_id ) . '"' . wp_kses_post( $style ) . '>';

						switch ( $column_id ) {

							// Used gateway
							case 'column-gateway' :

								$gateway = str_replace( array( '-', '_' ), ' ', $gateway_name );
								echo esc_html( ucwords( $gateway ) );

							break;

							// Username Column
							case 'column-username' :

								$user = get_userdata( $log_entry->user_id );
								if ( $user === false )
									echo esc_html( 'ID: ' . $log_entry->user_id );
								else
									echo wp_kses_post( $user->display_name . ' <em><small>(ID: ' . $log_entry->user_id . ')</small></em>' );

							break;

							// Date & Time Column
							case 'column-date' :

								echo esc_html( date( $date_format, $log_entry->time ) );

							break;

							// Amount Column
							case 'column-amount' :

								echo esc_html( $mycred->format_creds( $log_entry->creds ) );

							break;

							// Amount Paid
							case 'column-payed' :

								$cost     = 'n/a';
								$currency = '';
								$data     = maybe_unserialize( $log_entry->data );
								if ( is_array( $data ) && array_key_exists( 'sales_data', $data ) ) {

									$sales_data = explode( '|', $data['sales_data'] );
									if ( count( $sales_data ) >= 5 ) {
										$cost     = $sales_data[3];
										$currency = $sales_data[4];
									}

								}

								if ( $cost === 'n/a' )
									echo 'n/a';

								else {

									$rendered_cost = apply_filters( 'mycred_buycred_display_cost', $cost . ' ' . $currency, $sales_data, $log_entry, $gateway_name );
									$rendered_cost = apply_filters( 'mycred_buycred_display_cost_' . $gateway_name, $rendered_cost, $sales_data, $log_entry );

									echo esc_html( $rendered_cost );

								}

							break;

							// Transaction ID
							case 'column-tranid' :

								$transaction_id = $log_entry->time . $log_entry->user_id;
								$saved_data     = maybe_unserialize( $log_entry->data );

								if ( isset( $saved_data['txn_id'] ) )
									$transaction_id = $saved_data['txn_id'];

								elseif ( isset( $saved_data['transaction_id'] ) )
									$transaction_id = $saved_data['transaction_id'];

								echo esc_html( $transaction_id );

							break;

							default :

								do_action( "mycred_payment_log_{$column_id}", $log_entry );
								do_action( "mycred_payment_log_{$column_id}_{$type}", $log_entry );

							break;

						}

						echo '</td>';

					}

					echo '</tr>';

				}

			}

			// No log entry
			else {

				echo '<tr><td colspan="' . esc_attr( count( $log->headers ) ) . '" class="no-entries">' . esc_html__( 'No purchases found', 'mycred' ) . '</td></tr>';

			}

?>
			</tbody>
		</table>
		<div class="tablenav bottom">

			<?php $log->table_nav( 'bottom' ); ?>

		</div>

		<?php do_action( 'mycred_below_payment_log_table', $this ); ?>

	</form>
</div>
<?php

		}

		/**
		 * Get Sales Data from Log Data
		 * @since 1.4
		 * @version 1.0.1
		 */
		public function get_sales_data_from_log_data( $log_data = '' ) {

			$defaults = array( '', '', '', '', '', '', '' );
			$log_data = maybe_unserialize( $log_data );

			$found_data = array();
			if ( is_array( $log_data ) && array_key_exists( 'sales_data', $log_data ) ) {
				if ( is_array( $log_data['sales_data'] ) )
					$found_data = $log_data['sales_data'];
				else
					$found_data = explode( '|', $log_data['sales_data'] );
			}
			elseif ( ! empty( $log_data ) && ! is_array( $log_data ) ) {
				$try = explode( '|', $log_data );
				if ( count( $try == 7 ) )
					$found_data = $log_data;
			}

			return wp_parse_args( $found_data, $defaults );

		}

		/**
		 * User Rates Admin Screen
		 * @since 1.5
		 * @version 1.0
		 */
		public function exchange_rates_user_screen( $user ) {

			// Make sure buyCRED is setup
			if ( ! isset( $this->core->buy_creds['types'] ) || empty( $this->core->buy_creds['types'] ) ) return;

			// Only visible to admins
			if ( ! mycred_is_admin() ) return;

			$mycred_types         = mycred_get_types( true );
			$point_types_for_sale = $this->core->buy_creds['types'];
			$installed            = $this->get();
			$available_options    = array();

			foreach ( $installed as $gateway_id => $prefs ) {

				// Gateway is not active or settings have not yet been saved
				if ( ! $this->is_active( $gateway_id ) || ! array_key_exists( $gateway_id, $this->gateway_prefs ) || ! $prefs['custom_rate'] ) continue;

				$gateway_prefs = $this->gateway_prefs[ $gateway_id ];

				// Need a currency
				if ( array_key_exists( 'currency', $gateway_prefs ) && $gateway_prefs['currency'] == '' ) continue;

				if ( ! array_key_exists( 'currency', $gateway_prefs ) )
					$gateway_prefs['currency'] = 'USD';

				$setup = array( 'name' => $prefs['title'], 'currency' => $gateway_prefs['currency'], 'types' => array() );

				foreach ( $mycred_types as $point_type_key => $label ) {

					$row = array( 'name' => $label, 'enabled' => false, 'excluded' => true, 'default' => 0, 'override' => false, 'custom' => '', 'before' => '' );

					if ( in_array( $point_type_key, $point_types_for_sale ) && array_key_exists( $point_type_key, $gateway_prefs['exchange'] ) ) {

						$row['enabled'] = true;

						$mycred = mycred( $point_type_key );

						if ( ! $mycred->exclude_user( $user->ID ) ) {

							$row['excluded'] = false;
							$row['default']  = $gateway_prefs['exchange'][ $point_type_key ];

							$row['before']   = $mycred->format_creds( 1 ) . ' = ';

							$saved_overrides = (array) mycred_get_user_meta( $user->ID, 'mycred_buycred_rates_' . $point_type_key, '', true );

							if ( ! empty( $saved_overrides ) && array_key_exists( $gateway_id, $saved_overrides ) ) {

								$row['override'] = true;
								$row['custom']   = $saved_overrides[ $gateway_id ];

							}

						}

					}

					$setup['types'][ $point_type_key ] = $row;

				}

				$available_options[ $gateway_id ] = $setup;

			}

			if ( empty( $available_options ) ) return;

?>
<p class="mycred-p"><?php esc_html_e( 'Users exchange rate when buying points.', 'mycred' ); ?></p>
<table class="form-table mycred-inline-table">
<?php

			foreach ( $available_options as $gateway_id => $setup ) :

?>
	<tr>
		<th scope="row"><?php echo esc_attr( $setup['name'] ); ?></th>
		<td>
			<fieldset id="mycred-buycred-list" class="buycred-list">
				<legend class="screen-reader-text"><span><?php esc_html_e( 'buyCRED Exchange Rates', 'mycred' ); ?></span></legend>
<?php

				foreach ( $setup['types'] as $type_id => $data ) {

					// This point type is not for sale
					if ( ! $data['enabled'] ) {

?>
					<div class="mycred-wrapper buycred-wrapper disabled-option color-option">
						<div><?php printf( esc_html_x( 'Buying %s', 'Points Name', 'mycred' ), esc_html( $data['name'] ) ); ?></div>
						<div class="balance-row">
							<div class="balance-view"><?php esc_html_e( 'Disabled', 'mycred' ); ?></div>
							<div class="balance-desc"><em><?php esc_html_e( 'This point type is not for sale.', 'mycred' ); ?></em></div>
						</div>
					</div>
<?php

					}

					// This user is excluded from this point type
					elseif ( $data['excluded'] ) {

?>
					<div class="mycred-wrapper buycred-wrapper excluded-option color-option">
						<div><?php printf( esc_html_x( 'Buying %s', 'Buying Points', 'mycred' ), esc_html( $data['name'] ) ); ?></div>
						<div class="balance-row">
							<div class="balance-view"><?php esc_html_e( 'Excluded', 'mycred' ); ?></div>
							<div class="balance-desc"><em><?php printf( esc_html_x( 'User can not buy %s', 'Points Name', 'mycred' ), esc_html( $data['name'] ) ); ?></em></div>
						</div>
					</div>
<?php

					}

					// Eligeble user
					else {

?>
					<div class="mycred-wrapper buycred-wrapper color-option selected">
						<div><?php printf( esc_html_x( 'Buying %s', 'Buying Points', 'mycred' ), esc_html( $data['name'] ) ); ?></div>
						<div class="balance-row">
							<div class="balance-view"><?php echo esc_html( $data['before'] ); ?><input type="text" name="mycred_adjust_users_buyrates[<?php echo esc_attr( $type_id ); ?>][<?php echo esc_attr( $gateway_id ); ?>]" placeholder="<?php echo esc_attr( $data['default'] ); ?>" value="<?php if ( $data['override'] ) echo esc_attr( $data['custom'] ); ?>" class="short" size="8" /><?php echo esc_html( ' ' . $setup['currency'] ); ?></div>
							<div class="balance-desc"><em><?php esc_html_e( 'Leave empty to use the default rate.', 'mycred' ); ?></em></div>
						</div>
					</div>
<?php

					}

				}

?>
			</fieldset>
		</td>
	</tr>
<?php

			endforeach;

?>
</table>
<hr />
<script type="text/javascript">
jQuery(function($) {

	$( '.buycred-wrapper label input.trigger-buycred' ).change(function(){

		if ( $(this).val().length > 0 )
			$(this).parent().parent().parent().addClass( 'selected' );

		else
			$(this).parent().parent().parent().removeClass( 'selected' );

	});

});
</script>
<?php

		}

		/**
		 * Save Override
		 * @since 1.5
		 * @version 1.2
		 */
		public function save_manual_exchange_rates( $user_id ) {

			if ( ! mycred_is_admin() ) return;

			if ( isset( $_POST['mycred_adjust_users_buyrates'] ) && is_array( $_POST['mycred_adjust_users_buyrates'] ) && ! empty( $_POST['mycred_adjust_users_buyrates'] ) ) {

				// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.MissingUnslash,WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
				foreach ( $_POST['mycred_adjust_users_buyrates'] as $ctype => $gateway ) {

					$ctype  = sanitize_key( $ctype );
					$mycred = mycred( $ctype );

					if ( ! $mycred->exclude_user( $user_id ) ) {

						$new_rates = array();
						foreach ( (array) $gateway as $gateway_id => $rate ) {

							if ( $rate == '' ) continue;

							if ( $rate != 1 && in_array( substr( $rate, 0, 1 ), array( '.', ',' ) ) )
								$rate = (float) '0' . $rate;

							$new_rates[ $gateway_id ] = $rate;

						}

						if ( ! empty( $new_rates ) )
							mycred_update_user_meta( $user_id, 'mycred_buycred_rates_' . $ctype, '', $new_rates );
						else
							mycred_delete_user_meta( $user_id, 'mycred_buycred_rates_' . $ctype );

					}

				}

			}

		}

		/**
		 * Hide Comments
		 * @since 1.8.9
		 * @version 1.0
		 */
		public function hide_buycred_transactions( $query ) {

		    if ( empty( $query->query_vars['type__in'] ) ) {

				if( ! empty( $query->query_vars['type__not_in'] ) && is_array( $query->query_vars['type__not_in'] ) ) {

					array_push( $query->query_vars['type__not_in'], 'buycred' );

				}
				else {
						
					$query->query_vars['type__not_in'] = array( 'buycred' );

				}

			}
		    
		}

		// React bundle enqueueing for buyCred Gateways page.
		public function enqueue_react_gateways_scripts() {

			$screen = get_current_screen();
			if ( ! $screen ) return;

			// Check multiple possible screen IDs (varies depending on whether buyCred is under myCRED main menu or submenus)
			$is_gateways_page = (
				strpos( $screen->id, 'mycred-gateways' ) !== false ||
				( isset( $_GET['page'] ) && sanitize_key( $_GET['page'] ) === MYCRED_SLUG . '-gateways' )
			);

			if ( ! $is_gateways_page ) return;

			$bundle_path = myCRED_ROOT_DIR . 'addons/build/buycred-gateways.bundle.js';
			$bundle_url  = plugins_url( 'addons/build/buycred-gateways.bundle.js', myCRED_THIS );

			if ( ! file_exists( $bundle_path ) ) return;

			wp_enqueue_editor();

			wp_enqueue_script(
				'mycred-buycred-gateways-react',
				$bundle_url,
				array( 'wp-element', 'editor', 'wp-util' ),
				filemtime( $bundle_path ),
				true
			);

			$api_url = rest_url( 'mycred/v1/buycred-gateways' );
			wp_localize_script( 'mycred-buycred-gateways-react', 'mycredBuycredGateways', array(
				'apiUrl'      => $api_url,
				'apiNonce'    => wp_create_nonce( 'wp_rest' ),
				'isProActive' => class_exists( 'MyCRED_Toolkit_Core_Pro' ) || ( function_exists( 'is_plugin_active' ) && is_plugin_active( 'mycred-toolkit-pro/mycred-toolkit-pro.php' ) ),
				'proPromoImageUrl' => plugins_url( 'assets/images/test.png', myCRED_THIS ),
			) );
		}

		// REST Routes for buyCred Gateways page data.
		public function register_buycred_gateways_rest_routes() {
			register_rest_route( 'mycred/v1', '/buycred-gateways', array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_buycred_gateways_rest' ),
				'permission_callback' => function() {
					return current_user_can( $this->core->edit_creds_cap() );
				},
			) );
		}

		public function get_buycred_gateways_rest() {
			$installed = $this->get();
			$gateways  = array();

			foreach ( $installed as $id => $data ) {
				// Capture preferences HTML via output buffering
				ob_start();
				$this->call( 'preferences', $data['callback'] );
				$prefs_html = ob_get_clean();

				$sandbox_mode = ( array_key_exists( $id, $this->gateway_prefs )
					&& array_key_exists( 'sandbox', $this->gateway_prefs[ $id ] )
					&& $this->gateway_prefs[ $id ]['sandbox'] === 1 ) ? true : false;

				$gateways[] = array(
					'id'               => $id,
					'title'            => $this->core->template_tags_general( $data['title'] ),
					'is_active'        => $this->is_active( $id ),
					'sandbox_mode'     => $sandbox_mode,
					'has_sandbox'      => ! empty( $data['sandbox'] ),
					'documentation_url'=> ! empty( $data['documentation'] ) ? $data['documentation'] : '',
					'preferences_html' => $prefs_html,
				);
			}

			// Build upsell tabs
			$more_gateways_tab = mycred_build_gateway_upsell_tabs( 'buycred', $installed );
			if ( function_exists( 'mycred_build_toolkit_free_gateway_upsell_tabs' ) ) {
				$more_gateways_tab = array_merge(
					mycred_build_toolkit_free_gateway_upsell_tabs( 'buycred', $installed ),
					$more_gateways_tab
				);
			}

			$upsell = array();
			foreach ( $more_gateways_tab as $gw ) {
				if ( isset( $gw['plugin'] ) && $gw['plugin'] !== '' ) {
					if ( ! function_exists( 'is_plugin_active' ) ) {
						require_once ABSPATH . 'wp-admin/includes/plugin.php';
					}
					if ( is_plugin_active( $gw['plugin'] ) ) continue;
				}
				$upsell[] = $gw;
			}

			// Settings nonce fields for the form
			ob_start();
			settings_fields( $this->settings_name );
			$nonce_html = ob_get_clean();

			return rest_ensure_response( array(
				'gateways'       => $gateways,
				'upsell_gateways'=> array_slice( $upsell, 0, 5 ),
				'more_gateways'  => array_slice( $upsell, 5 ),
				'settings_nonce' => $nonce_html,
				'settings_action'=> admin_url( 'options.php' ),
			) );
		}

	}
endif;

/**
 * Load buyCRED Module
 * @since 1.7
 * @version 1.0
 */
if ( ! function_exists( 'mycred_load_buycred_core_addon' ) ) :
	function mycred_load_buycred_core_addon( $modules, $point_types ) {

		$modules['solo']['buycred'] = new myCRED_buyCRED_Module();
		$modules['solo']['buycred']->load();

		return $modules;

	}
endif;
add_filter( 'mycred_load_modules', 'mycred_load_buycred_core_addon', 30, 2 );
