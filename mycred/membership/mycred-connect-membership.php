<?php
/**
 * Class to connect mycred with membership
 * 
 * @since 1.0
 * @version 1.0
 */
// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
if ( ! class_exists( 'myCRED_Connect_Membership' ) ) :
    Class myCRED_Connect_Membership {
        /**
         * Construct
         */
        public function __construct() {
            add_action( 'admin_menu',        array( $this, 'mycred_treasures' ) );
            add_action( 'admin_menu',        array( $this, 'mycred_support' ) );
            add_action( 'admin_init',        array( $this, 'add_styles' ) );
            add_filter( 'admin_footer_text', array( $this, 'mycred_admin_footer_text') );
        }

        public function add_styles() {
            
            if( isset($_GET['page']) && $_GET['page'] == 'mycred-membership' ) {
                wp_enqueue_style( 'mycred-bootstrap-grid' );
            }

             elseif( isset($_GET['page']) && $_GET['page'] == 'mycred-treasures' ) {
                wp_enqueue_style( 'mycred-bootstrap-grid' );
            }

            elseif( isset($_GET['page']) && $_GET['page'] == 'mycred-support' ) {
                wp_enqueue_style( 'mycred-bootstrap-grid' );
            }         

        }

        public function mycred_admin_footer_text( $footer_text ) {
            
            global $typenow;

            if( isset($_GET['page']) && $_GET['page'] == 'mycred-support' ) {
                    $mycred_footer_text = sprintf( __( 'Thank you for being a <a href="%1$s" target="_blank">myCred </a>user! Please give your <a href="%2$s" target="_blank">%3$s</a> rating on WordPress.org', 'mycred' ),
                        'https://mycred.me',
                        'https://wordpress.org/support/plugin/mycred/reviews/?rate=5#new-post',
                        '&#9733;&#9733;&#9733;&#9733;&#9733;'
                    );
                  return str_replace( '</span>', '', $footer_text ) . ' | ' . $mycred_footer_text . '</span>';
            }
            else {
                return $footer_text;
            }
        }

         /**
         * Register membership menu
         */
        public function mycred_treasures() {
            mycred_add_main_submenu( 
                'Treasures', 
                'Treasures', 
                'manage_options', 
                'mycred-treasures',
                array( $this, 'mycred_treasures_callback' ) 
            );
        }

        /**
         * Register Help / Support menu
         */
        public function mycred_support() {
            mycred_add_main_submenu( 
                'Support', 
                'Support', 
                'manage_options', 
                'mycred-support',
                array( $this, 'mycred_support_callback' ) 
            );
        }

         public function mycred_support_callback() {
            wp_enqueue_script( 'mycred-support-react-app', plugins_url( 'assets/build/support.bundle.js', myCRED_THIS ), array( 'wp-element' ), myCRED_VERSION, true );
            
            wp_localize_script( 'mycred-support-react-app', 'mycredSupportData', array(
                'logReferences' => mycred_get_all_references(),
                'footerBgUrl'   => plugins_url( 'src/pages/About/icons/footer-bg.svg', myCRED_THIS ),
            ) );

            mycred_render_admin_header();
            ?>
            <div id="mycred-support-ui-root"></div>
            <?php
        }

        /**
         * Treasures menu callback
         */
        public function mycred_treasures_callback() {
            wp_enqueue_script( 'mycred-treasures-react-app', plugins_url( 'assets/build/treasures.bundle.js', myCRED_THIS ), array( 'wp-element' ), myCRED_VERSION, true );
            
            wp_localize_script( 'mycred-treasures-react-app', 'mycredTreasuresData', array(
                'assetsUrl'   => plugins_url( 'assets/images/treasures/', myCRED_THIS ),
                'footerBgUrl' => plugins_url( 'src/pages/About/icons/footer-bg.svg', myCRED_THIS ),
                'ctaBlockUrl' => plugins_url( 'src/pages/About/icons/cta-block.svg', myCRED_THIS ),
            ) );

            mycred_render_admin_header();
            ?>
            <div id="mycred-treasures-ui-root"></div>
            <?php
        }

    }
endif;
$myCRED_Connect_Membership = new myCRED_Connect_Membership();