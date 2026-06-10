<?php
if ( ! class_exists( 'myCRED_Loyalty_Widget_Page' ) ) :
    class myCRED_Loyalty_Widget_Page {
        
        private static $_instance = null;
        
        public static function instance() {
            if ( is_null( self::$_instance ) ) {
                self::$_instance = new self();
            }
            return self::$_instance;
        }
        
        public function __construct() {
            add_action( 'admin_menu', array( $this, 'add_menu_page' ) );
            add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_scripts' ) );
            
            // Include API class
            require_once plugin_dir_path( __FILE__ ) . 'api/class-mycred-loyalty-widget-api.php';
            require_once plugin_dir_path( __FILE__ ) . 'class-mycred-loyalty-widget-frontend.php';
        }

        public function add_menu_page() {
            mycred_add_main_submenu( 
                __( 'Loyalty Widget', 'mycred' ),
                __( 'Loyalty Widget', 'mycred' ),
                'manage_options', 
                'mycred-loyalty-widget',
                array( $this, 'render_page' )
            );
        }

        public function enqueue_scripts( $hook ) {
            if ( 'mycred_page_mycred-loyalty-widget' !== $hook ) {
                return;
            }

            $build_file = plugin_dir_path( __FILE__ ) . 'build/index.bundle.js';
            $build_url  = plugin_dir_url( __FILE__ ) . 'build/index.bundle.js';
            
            $is_toolkit_pro_active = false;
            $active_plugins = (array) get_option( 'active_plugins', array() );
            if ( in_array( 'mycred-toolkit-pro/mycred-toolkit-pro.php', $active_plugins, true ) ) {
                if( file_exists( WP_PLUGIN_DIR . '/mycred-toolkit-pro/includes/mycred-toolkit-plan-check.php' ) ) {
                    $is_toolkit_pro_active = true;    
                }
            }

            if ( file_exists( $build_file ) ) {
                $asset_file = include( plugin_dir_path( __FILE__ ) . 'build/index.bundle.asset.php' );
                
                wp_enqueue_script(
                    'mycred-loyalty-widget-script',
                    $build_url,
                    $asset_file['dependencies'],
                    $asset_file['version'],
                    true
                );

                $settings = get_option( 'mycred_loyalty_widget_settings', array() );

                // Get active myCred hooks
                $active_hooks = array();
                if ( function_exists( 'mycred_get_types' ) ) {
                    $types = mycred_get_types();
                    foreach ( $types as $type => $label ) {
                        $hook_prefs = get_option( 'mycred_pref_hooks' . ( $type !== 'mycred_default' ? '_' . $type : '' ) );
                        if ( ! empty( $hook_prefs['active'] ) ) {
                            // Instantiate hooks module to get details
                            $hooks_module = new myCRED_Hooks_Module( $type );
                            $installed = $hooks_module->get();
                            $mycred = mycred( $type );
                            
                            foreach ( $hook_prefs['active'] as $hook_id ) {
                                if ( isset( $installed[ $hook_id ] ) ) {
                                    $raw_title = $installed[ $hook_id ]['title'];
                                    $raw_desc  = $installed[ $hook_id ]['description'];

                                    $amount = isset( $hook_prefs['hook_prefs'][ $hook_id ] ) ? $this->get_hook_amount( $hook_prefs['hook_prefs'][ $hook_id ] ) : 0;

                                    $active_hooks[] = array(
                                        'id'               => $hook_id,
                                        'point_type'       => $type,
                                        'type_label'       => $label,
                                        'category'         => $this->get_hook_category( $hook_id ),
                                        'title'            => $mycred->template_tags_general( $raw_title ),
                                        'description'      => $mycred->template_tags_general( $raw_desc ),
                                        'raw_title'        => $raw_title,
                                        'amount'           => $amount,
                                        'formatted_amount' => $mycred->format_creds( $amount ),
                                    );
                                }
                            }
                        }
                    }
                }

                // Get available pages for redirects
                $pages = get_pages( array(
                    'post_status' => 'publish',
                    'sort_column' => 'post_title',
                    'hierarchical' => 0
                ) );

                $available_pages = array();
                if ( ! empty( $pages ) ) {
                    foreach ( $pages as $page ) {
                        $available_pages[] = array(
                            'id'    => $page->ID,
                            'title' => $page->post_title,
                            'url'   => get_permalink( $page->ID )
                        );
                    }
                }


                wp_localize_script( 'mycred-loyalty-widget-script', 'mycredLoyaltyWidgetData', array(
                    'rest_url' => esc_url_raw( rest_url() ),
                    'nonce'    => wp_create_nonce( 'wp_rest' ),
                    'is_toolkit_pro_active' => $is_toolkit_pro_active,
                    'settings' => $settings,
                    'available_pages' => $available_pages,
                    'active_hooks' => $active_hooks,
                    'assets_url' => plugin_dir_url( __FILE__ ) . 'src/assets/widget-icon/'
                ) );
                
                wp_enqueue_style( 'wp-components' );
                wp_enqueue_media();
            }
        }

        private function get_hook_amount( $prefs ) {
            if ( ! is_array( $prefs ) ) {
                return is_numeric( $prefs ) ? $prefs : 0;
            }
            
            if ( isset( $prefs['creds'] ) && ! is_array( $prefs['creds'] ) ) {
                return $prefs['creds'];
            }
            if ( isset( $prefs['amount'] ) && ! is_array( $prefs['amount'] ) ) {
                return $prefs['amount'];
            }
            
            foreach ( $prefs as $key => $value ) {
                if ( is_array( $value ) ) {
                    if ( isset( $value['creds'] ) && ! is_array( $value['creds'] ) ) {
                        return $value['creds'];
                    }
                    if ( isset( $value['amount'] ) && ! is_array( $value['amount'] ) ) {
                        return $value['amount'];
                    }
                }
            }
            
            if ( isset( $prefs['creds'] ) && is_array( $prefs['creds'] ) ) {
                foreach ( $prefs['creds'] as $val ) {
                    if ( is_numeric( $val ) && $val > 0 ) return $val;
                }
            }

            return 0;
        }

        private function get_hook_category( $hook_id ) {
            $hook_id = strtolower( $hook_id );
            if ( strpos( $hook_id, 'woocommerce' ) !== false ) return 'woocommerce';
            if ( strpos( $hook_id, 'buddypress' ) !== false || strpos( $hook_id, 'bp_' ) === 0 ) return 'buddypress';
            if ( strpos( $hook_id, 'bbpress' ) !== false || strpos( $hook_id, 'forum' ) !== false ) return 'forum';
            return 'wordpress';
        }

        public function render_page() {
            echo '<div id="mycred-loyalty-widget" style="margin-left:-20px"></div>';
        }
        
    }
    
    myCRED_Loyalty_Widget_Page::instance();
    
endif;
