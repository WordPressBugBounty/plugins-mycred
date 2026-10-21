<?php
if ( ! defined( 'myCRED_VERSION' ) ) exit;

/**
 * myCRED_walkthrough class
 * Used when the plugin has been activated for the first time. Handles the walkthrough
 * wizard along with temporary admin menus.
 * @since 2.1
 * @version 1.0
 */
if ( ! class_exists( 'myCRED_walkthroug' ) ) :
	#[AllowDynamicProperties]
	class myCRED_walkthroug {

        /**
		 * Construct
		 */
		public function __construct() {

			$this->core = mycred();

			add_action( 'wp_loaded', array( $this, 'load' ) );
			
        }
        
        /**
		 * Load Class
		 * @since 1.7
		 * @version 1.0
		 */
		public function load() {

            $tour_js = myCRED_ROOT_DIR . 'assets/js/tourguide.min.js';
            $tour_ver = file_exists( $tour_js ) ? myCRED_VERSION . '.' . filemtime( $tour_js ) : myCRED_VERSION;
            wp_register_style( 'mycred-tourguide-style', plugins_url( 'assets/css/tourguide.css', myCRED_THIS ),    array(), myCRED_VERSION , 'all' );
            wp_register_script( 'mycred-tourguide-script', plugins_url( 'assets/js/tourguide.min.js', myCRED_THIS ), array( 'jquery' ), $tour_ver , true );

			$step = isset( $_GET['mycred_tour_guide'] ) ? intval($_GET['mycred_tour_guide']) : '';

			$redirect_url = '';

			if( $step == 1 ) {

				$redirect_url = admin_url('admin.php?page=mycred-settings&mycred_tour_guide=2');

			}
			else if( $step == 2 ) {

				$redirect_url = admin_url('admin.php?page=mycred&mycred_tour_guide=3');

			}
			else if( $step == 3 ) {

				$redirect_url = admin_url('admin.php?page=mycred-hooks&mycred_tour_guide=4');

			}
			else if( $step == 4 ){

				$redirect_url = admin_url('admin.php?page=mycred-addons&mycred_tour_guide=5');

			}
			
			wp_localize_script(
				'mycred-tourguide-script',
				'mycred_tour_guide',
				array(
					'step'         => $step,
					'redirect_url' => $redirect_url,
					'ajaxUrl'      => admin_url( 'admin-ajax.php' ),
					'nonce'        => wp_create_nonce( 'mycred-complete-tour-guide' ),
					'completed'    => function_exists( 'mycred_is_tour_guide_completed' ) ? (bool) mycred_is_tour_guide_completed() : false,
				)
			);

			wp_enqueue_script( 'mycred-tourguide-script' );
			wp_enqueue_style( 'mycred-tourguide-style' );

    	}

	}
endif;