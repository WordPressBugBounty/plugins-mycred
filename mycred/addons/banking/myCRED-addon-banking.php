<?php
if ( ! defined( 'myCRED_VERSION' ) ) exit;

/**
 * Addon: Banking
 * Addon URI: http://codex.mycred.me/chapter-iii/banking/
 * Version: 2.0
 */
define( 'myCRED_BANK',              __FILE__ );
define( 'myCRED_BANK_DIR',          myCRED_ADDONS_DIR . 'banking/' );
define( 'myCRED_BANK_ABSTRACT_DIR', myCRED_BANK_DIR . 'abstracts/' );
define( 'myCRED_BANK_INCLUDES_DIR', myCRED_BANK_DIR . 'includes/' );
define( 'myCRED_BANK_SERVICES_DIR', myCRED_BANK_DIR . 'services/' );

require_once myCRED_BANK_ABSTRACT_DIR . 'mycred-abstract-service.php';

require_once myCRED_BANK_INCLUDES_DIR . 'mycred-banking-functions.php';

require_once myCRED_BANK_SERVICES_DIR . 'mycred-service-central.php';
require_once myCRED_BANK_SERVICES_DIR . 'mycred-service-schedule-deposit.php';

/**
 * myCRED_Banking_Module class
 * @since 0.1
 * @version 2.0
 */
if ( ! class_exists( 'myCRED_Banking_Module' ) ) :
	class myCRED_Banking_Module extends myCRED_Module {

		/**
		 * Constructor
		 */
		public function __construct( $type = MYCRED_DEFAULT_TYPE_KEY ) {

			parent::__construct( 'myCRED_Banking_Module', array(
				'module_name' => 'banking',
				'option_id'   => 'mycred_pref_bank',
				'defaults'    => array(
					'active'        => array(),
					'services'      => array(),
					'service_prefs' => array()
				),
				'labels'      => array(
					'menu'        => __( 'Central Deposit', 'mycred' ),
					'page_title'  => __( 'Central Deposit', 'mycred' ),
					'page_header' => __( 'Central Deposit', 'mycred' )
				),
				'screen_id'   => MYCRED_SLUG . '-banking',
				'accordion'   => true,
				'menu_pos'    => 60
			), $type );

		}

		/**
		 * Load Services
		 * @since 1.2
		 * @version 1.0
		 */
		public function module_init() {

			if ( ! empty( $this->services ) ) {

				foreach ( $this->services as $key => $gdata ) {

					if ( $this->is_active( $key ) && isset( $gdata['callback'] ) ) {
						$this->call( 'run', $gdata['callback'] );
					}

				}

			}

			add_action( 'wp_ajax_run-mycred-bank-service', array( $this, 'ajax_handler' ) );
			add_action( 'rest_api_init', array( $this, 'register_banking_rest_routes' ) );

			// Ensure ajax search works even if central deposit is not active yet
			add_action( 'wp_ajax_get_bank_accounts_' . $this->mycred_type, function() {
				$this->call( 'get_bank_accounts', array( 'myCRED_Banking_Service_Central' ) );
			} );

		}

		/**
		 * Module Admin Init
		 * @since 1.7
		 * @version 1.0
		 */
		public function module_admin_init() {

			// User Override
			add_action( 'mycred_user_edit_after_' . $this->mycred_type, array( $this, 'banking_user_screen' ), 20 );

		}

		/**
		 * Call
		 * Either runs a given class method or function.
		 * @since 1.2
		 * @version 1.2
		 */
		public function call( $call, $callback, $return = NULL ) {

			// Class
			if ( is_array( $callback ) && class_exists( $callback[0] ) ) {

				$class = $callback[0];
				$methods = get_class_methods( $class );
				if ( in_array( $call, $methods ) ) {

					$new = new $class( ( isset( $this->service_prefs ) ) ? $this->service_prefs : array(), $this->mycred_type );
					return $new->$call( $return );

				}

			}

			// Function
			elseif ( ! is_array( $callback ) ) {

				if ( function_exists( $callback ) ) {

					if ( $return !== NULL )
						return call_user_func( $callback, $return, $this );
					else
						return call_user_func( $callback, $this );

				}

			}

			if ( $return !== NULL )
				return array();

		}

		/**
		 * Get Bank Services
		 * @since 1.2
		 * @version 1.0
		 */
		public function get( $save = false ) {

			// Savings
			$services['central'] = array(
				'title'        => __( 'General Settings', 'mycred' ),
				'description'  => $this->core->template_tags_general( __( 'Instead of creating %_plural% out of thin-air, all payouts are made from a nominated "Central Deposit" account. Any %_plural% a user spends or loses are deposited back into this account. If the central deposit runs out of %_plural%, no %_plural% will be paid out.', 'mycred' ) ),
				'cron'         => false,
				'icon'         => 'dashicons-bank',
				'callback'     => array( 'myCRED_Banking_Service_Central' )
			);

			$services['schedule_deposit'] = array(
				'title'        => __( 'Schedule Deposit', 'mycred' ),
				'description'  => __( 'The admin can schedule the points deposit to the central account automatically after the specified interval.', 'mycred' ),
				'cron'         => false,
				'icon'         => 'dashicons-bank',
				'callback'     => array( 'myCRED_Banking_Service_Schedule_Deposit' )
			);

			$services = apply_filters( 'mycred_setup_banking', $services );

			if ( $save === true && $this->core->user_is_point_admin() ) {
				$new_data = array(
					'active'        => $this->active,
					'services'      => $services,
					'service_prefs' => $this->service_prefs
				);

				mycred_update_option( $this->option_id, $new_data );
			}

			$this->services = $services;
			return $services;

		}

		/**
		 * Page Header
		 * @since 1.3
		 * @version 1.0
		 */
		public function settings_header() {

			wp_enqueue_style( 'mycred-bootstrap-grid' );
			wp_enqueue_style( 'mycred-select2-style' );
			wp_enqueue_style( MYCRED_SLUG . '-buttons' );
			
			$bundle_path = myCRED_ROOT_DIR . 'addons/build/banking-settings.bundle.js';
			$bundle_url  = plugins_url( 'addons/build/banking-settings.bundle.js', myCRED_THIS );

			if ( file_exists( $bundle_path ) ) {
				wp_enqueue_script(
					'mycred-banking-settings-react',
					$bundle_url,
					array( 'wp-element', 'wp-i18n', 'wp-components', 'jquery' ),
					filemtime( $bundle_path ),
					true
				);

				$api_url = rest_url( 'mycred/v1/banking/' . $this->mycred_type );
				wp_localize_script( 'mycred-banking-settings-react', 'mycredBankingSettings', array(
					'apiUrl'      => $api_url,
					'apiNonce'    => wp_create_nonce( 'wp_rest' ),
					'pointType'   => $this->mycred_type,
					'optionId'    => $this->option_id,
					'isProActive' => class_exists( 'MyCRED_Toolkit_Core_Pro' ) || ( function_exists( 'is_plugin_active' ) && is_plugin_active( 'mycred-toolkit-pro/mycred-toolkit-pro.php' ) ),
				) );
			}

		}

		public function register_banking_rest_routes() {
			register_rest_route( 'mycred/v1', '/banking/' . $this->mycred_type, array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_banking_settings_rest' ),
				'permission_callback' => function() {
					return current_user_can( $this->core->edit_creds_cap() );
				},
			) );
		}

		public function get_banking_settings_rest() {
			ob_start();
			settings_fields( $this->settings_name );
			$settings_nonce = ob_get_clean();

			$services = array();
			
			$installed_services = ( isset( $this->services ) && ! empty( $this->services ) ) ? $this->services : $this->get();

			if ( ! empty( $installed_services ) ) {
				foreach ( $installed_services as $id => $data ) {
					ob_start();
					$this->call( 'preferences', $data['callback'] );
					$preferences_html = ob_get_clean();

					$services[] = array(
						'id'               => $id,
						'title'            => $this->core->template_tags_general( $data['title'] ),
						'description'      => $this->core->template_tags_general( $data['description'] ),
						'icon'             => $data['icon'],
						'is_active'        => $this->is_active( $id ),
						'preferences_html' => $preferences_html,
					);
				}
			}

			return new WP_REST_Response( array(
				'services'       => $services,
				'settings_nonce' => $settings_nonce
			), 200 );
		}

		/**
		 * Admin Page
		 * @since 0.1
		 * @version 1.1
		 */
		public function admin_page() {

			// Security
			if ( ! $this->core->user_is_point_admin() ) wp_die( 'Access Denied' );

			mycred_render_admin_header();
			echo '<div class="wrap" id="myCRED-wrap" style="width: 90% !important; max-width: 1440px !important; margin: 20px auto !important; padding: 0 !important; background: transparent !important; box-shadow: none !important; border: none !important;">';
			echo '<div id="mycred-banking-settings-root"></div>';
			echo '</div>';
		}

		/**
		 * Sanititze Settings
		 * @since 1.2
		 * @version 1.1
		 */
		public function sanitize_settings( $post ) {

			// added do_action in 2.2.4
			$post        	      = apply_filters( 'mycred_banking_settings_save', $post, $this );
			
			$installed            = $this->get();

			// Construct new settings
			$new_post             = array();
			$new_post['services'] = $installed;

			if ( empty( $post['active'] ) || ! isset( $post['active'] ) )
				$post['active'] = array();

			$new_post['active']   = $post['active'];

			// Loop though all installed hooks
			if ( ! empty( $installed ) ) {
				foreach ( $installed as $key => $data ) {

					if ( isset( $data['callback'] ) && isset( $post['service_prefs'][ $key ] ) ) {

						// Old settings
						$old_settings = $post['service_prefs'][ $key ];

						// New settings
						$new_settings = $this->call( 'sanitise_preferences', $data['callback'], $old_settings );

						// If something went wrong use the old settings
						if ( empty( $new_settings ) || $new_settings === NULL || ! is_array( $new_settings ) )
							$new_post['service_prefs'][ $key ] = $old_settings;
						// Else we got ourselves new settings
						else
							$new_post['service_prefs'][ $key ] = $new_settings;

						// Handle de-activation
						if ( in_array( $key, (array) $this->active ) && ! in_array( $key, $new_post['active'] ) )
							$this->call( 'deactivate', $data['callback'], $new_post['service_prefs'][ $key ] );

						// Handle activation
						if ( ! in_array( $key, (array) $this->active ) && in_array( $key, $new_post['active'] ) )
							$this->call( 'activate', $data['callback'], $new_post['service_prefs'][ $key ] );

						// Next item

					}
				}
			}

			return $new_post;

		}

		/**
		 * User Screen
		 * @since 1.7
		 * @version 1.0
		 */
		public function banking_user_screen( $user ) {

			if ( ! empty( $this->services ) ) {

				foreach ( $this->services as $key => $gdata ) {

					if ( $this->is_active( $key ) && isset( $gdata['callback'] ) ) {
						$this->call( 'user_screen', $gdata['callback'], $user );
					}

				}

			}

		}

		/**
		 * Ajax Handler
		 * @since 1.7
		 * @version 1.0
		 */
		public function ajax_handler() {

			// Make sure this is an ajax call for this point type
			if ( isset( $_REQUEST['_token'] ) && wp_verify_nonce( sanitize_text_field( wp_unslash( $_REQUEST['_token'] ) ), 'run-mycred-bank-task' . $this->mycred_type ) ) {

				// Make sure ajax call is made by an admin
				if ( $this->core->user_is_point_admin() ) {

					// Get the service requesting to use this
					$service   = ( isset( $_POST['service'] ) ? sanitize_key( wp_unslash( $_POST['service'] ) ) : '' );
					$installed = $this->get();

					// If there is such a service, load it's ajax handler
					if ( array_key_exists( $service, $installed ) )
						$this->call( 'ajax_handler', $installed[ $service ]['callback'] );

				}

			}

		}

	}
endif;

/**
 * Load Banking Module
 * @since 1.2
 * @version 1.1
 */
if ( ! function_exists( 'mycred_load_banking_addon' ) ) :
	function mycred_load_banking_addon( $modules, $point_types ) {

		foreach ( $point_types as $type => $title ) {
			$modules['type'][ $type ]['banking'] = new myCRED_Banking_Module( $type );
			$modules['type'][ $type ]['banking']->load();
		}

		return $modules;

	}
endif;
add_filter( 'mycred_load_modules', 'mycred_load_banking_addon', 20, 2 );