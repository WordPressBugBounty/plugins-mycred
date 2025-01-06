<?php
/**
 * Addon: Birthday
 * Version: 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! class_exists( 'myCRED_Birthdays' ) ) :
	class myCRED_Birthdays {

		// Plugin Version
		public $version             = '1.0.0';

		// Instnace
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
		 * @since 1.0
		 * @version 1.0
		 */
		public function __clone() { _doing_it_wrong( __FUNCTION__, 'Cheatin&#8217; huh?', '1.0' ); }

		/**
		 * Not allowed
		 * @since 1.0
		 * @version 1.0
		 */
		public function __wakeup() { _doing_it_wrong( __FUNCTION__, 'Cheatin&#8217; huh?', '1.0' ); }

		/**
		 * Define
		 * @since 1.0
		 * @version 1.0
		 */
		private function define( $name, $value, $definable = true ) {
			if ( ! defined( $name ) )
				define( $name, $value );
		}

		/**
		 * Require File
		 * @since 1.0
		 * @version 1.0
		 */
		public function file( $required_file ) {
			if ( file_exists( $required_file ) )
				require_once $required_file;
		}

		/**
		 * Construct
		 * @since 1.0
		 * @version 1.0
		 */
		public function __construct() {

			$this->define_constants();

			add_filter( 'mycred_setup_hooks',    array( $this, 'register_hook' ) );
			add_action( 'mycred_all_references', array( $this, 'add_badge_support' ) );
			add_action( 'mycred_load_hooks',     array( $this, 'load_hooks' ) );

		}


		/**
		 * Define Constants
		 * @since 1.0
		 * @version 1.0
		 */
		public function define_constants() {

			$this->define( 'MYCRED_BP_COMPLIMENTS_VER',  $this->version );
			$this->define( 'MYCRED_BP_COMPLIMENTS_SLUG', 'mycred-birthdays' );
			$this->define( 'MYCRED_DEFAULT_TYPE_KEY',    'mycred_default' );
			$this->define( 'MYCRED_BIRTHDAY', __FILE__ );
			$this->define( 'MYCRED_BIRTHDAY_ROOT_DIR', plugin_dir_path( MYCRED_BIRTHDAY ) );
			$this->define( 'MYCRED_BIRTHDAY_INCLUDES_DIR', MYCRED_BIRTHDAY_ROOT_DIR . 'includes/' );

		}

		/**
		 * Includes
		 * @since 1.0
		 * @version 1.0
		 */
		public function includes() { }

		/**
		 * Register Hook
		 * @since 1.0
		 * @version 1.0
		 */
		public function register_hook( $installed ) {

			$installed['birthday'] = array(
				'title'         => __( '%plural% for Birthdays', 'mycred' ),
				'description'   => __( 'Reward users with points on their birthday', 'mycred' ),
				'documentation' => 'https://codex.mycred.me/hooks/birthdays/',
				'callback'      => array( 'myCRED_Birthday_Hook' )
			);

			return $installed;

		}

		/**
		 * Load Hook
		 * @since 1.0
		 * @version 1.0
		 */
		public function load_hooks() { 

			$this->file( MYCRED_BIRTHDAY_INCLUDES_DIR . 'mycred-birthday-hook.php' );

		}

		/**
		 * Add Badge Support
		 * @since 1.0
		 * @version 1.0
		 */
		public function add_badge_support( $references ) {

			$references['birthday'] = __( 'Birthday', 'mycred' );

			return $references;

		}

	}
	return myCRED_Birthdays::instance();
endif;