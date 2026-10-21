<?php
/**
 * Addon: AI Assistant (Experiment)
 * Version: 1.0.2
 * Description: Integrates WordPress 7.0 AI Core features with the myCred points system.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! class_exists( 'myCRED_AI' ) ) :
	class myCRED_AI {

		// Addon Version
		public $version             = '1.0.2';

		// Instance
		protected static $_instance = NULL;

		/**
		 * Setup Instance
		 * @since 1.0
		 * @version 1.0
		 */
		public static function instance() {
			if ( is_null( self::$_instance ) ) {
				self::$_instance = new self();
			}
			return self::$_instance;
		}

		/**
		 * Not allowed
		 */
		public function __clone() { _doing_it_wrong( __FUNCTION__, 'Cheatin&#8217; huh?', '1.0' ); }

		/**
		 * Not allowed
		 */
		public function __wakeup() { _doing_it_wrong( __FUNCTION__, 'Cheatin&#8217; huh?', '1.0' ); }

		/**
		 * Construct
		 * @since 1.0
		 * @version 1.0
		 */
		public function __construct() {
			$this->define_constants();
			$this->includes();
		}

		/**
		 * Define Constants
		 * @since 1.0
		 * @version 1.0
		 */
		public function define_constants() {
			if ( ! defined( 'MYCRED_AI_VERSION' ) ) {
				define( 'MYCRED_AI_VERSION', $this->version );
			}
			if ( ! defined( 'MYCRED_AI_PLUGIN_FILE' ) ) {
				define( 'MYCRED_AI_PLUGIN_FILE', __FILE__ );
			}
			if ( ! defined( 'MYCRED_AI_ROOT_DIR' ) ) {
				define( 'MYCRED_AI_ROOT_DIR', plugin_dir_path( MYCRED_AI_PLUGIN_FILE ) );
			}
			if ( ! defined( 'MYCRED_AI_ASSISTANT_DIR' ) ) {
				define( 'MYCRED_AI_ASSISTANT_DIR', MYCRED_AI_ROOT_DIR . 'assistant/' );
			}
			if ( ! defined( 'MYCRED_AI_ONBOARDING_AI_DIR' ) ) {
				define( 'MYCRED_AI_ONBOARDING_AI_DIR', MYCRED_AI_ROOT_DIR . 'onboarding-ai/' );
			}
			if ( ! defined( 'MYCRED_AI_ONBOARDING_MANUAL_DIR' ) ) {
				define( 'MYCRED_AI_ONBOARDING_MANUAL_DIR', MYCRED_AI_ROOT_DIR . 'onboarding-manual/' );
			}
			if ( ! defined( 'MYCRED_AI_MIDDLEWARE_DIR' ) ) {
				define( 'MYCRED_AI_MIDDLEWARE_DIR', MYCRED_AI_ROOT_DIR . 'middleware/' );
			}
			if ( ! defined( 'MYCRED_AI_ASSETS_URL' ) ) {
				define( 'MYCRED_AI_ASSETS_URL', plugins_url( 'assistant/assets/', MYCRED_AI_PLUGIN_FILE ) );
			}
			if ( ! defined( 'MYCRED_AI_MIDDLEWARE_BASE_URL' ) ) {
				define( 'MYCRED_AI_MIDDLEWARE_BASE_URL', 'https://ai-api.wpexperts.io/' );
			}
		}

		/**
		 * Includes and Core Initialization
		 * @since 1.0
		 * @version 1.0
		 */
		public function includes() {
			require_once MYCRED_AI_MIDDLEWARE_DIR . 'class-mycred-ai-middleware-client.php';
			require_once MYCRED_AI_ONBOARDING_AI_DIR . 'class-mycred-ai-onboarding.php';

			if ( ! function_exists( 'mycred_is_installed' ) || ! mycred_is_installed() ) {
				return;
			}

			require_once MYCRED_AI_ASSISTANT_DIR . 'class-mycred-ai-abilities.php';
			require_once MYCRED_AI_ASSISTANT_DIR . 'class-mycred-ai-admin.php';
		}
	}

	return myCRED_AI::instance();
endif;
