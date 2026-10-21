<?php
if ( ! defined( 'MYCRED_WOO_VERSION' ) ) exit;

if ( ! class_exists( 'myCred_WooCommerce_Module' ) ) :
    class myCred_WooCommerce_Module extends myCRED_Module {

        function __construct( $type = MYCRED_DEFAULT_TYPE_KEY ) {

            parent::__construct( 'myCred_WooCommerce_Module', array(
                'module_name' => MYCRED_WOO_KEY,
                'option_id'   => 'mycred_pref_woo',
                'defaults'    => mycred_get_addon_defaults( 'woocommerce' ),
                'labels'      => array(
                    'menu'        => __( 'WooCommerce', 'mycred' ),
                    'page_title'  => __( 'WooCommerce', 'mycred' ),
                    'page_header' => __( 'WooCommerce', 'mycred' )
                ),
                'screen_id'   => MYCRED_WOO_SLUG,
                'register'    => true,
                'menu_pos'    => 90,
                'main_menu'   => true
            ), $type );

        }

        /**
         * Module Pre Init
         * @since 1.0
         * @version 1.2
         */
        public function module_pre_init() {

            add_action( 'before_woocommerce_init', array( $this, 'gamification_hpos_compatibility' ) );

        }

         /**
         * Woocommerce Compability
         *
         * @since   1.0
         * @version 1.0
         */
        public function gamification_hpos_compatibility() {

            if ( class_exists( \Automattic\WooCommerce\Utilities\FeaturesUtil::class ) ) {
                \Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'custom_order_tables', __FILE__, true );
            }

        }

        /**
         * Module Init
         * @since 1.0
         * @version 1.0.3
         */
        public function module_init() {
            add_action( 'rest_api_init', array( $this, 'register_woocommerce_rest_routes' ) );
            add_filter( 'admin_body_class', array( $this, 'admin_body_class' ) );
            add_action( 'admin_head', array( $this, 'admin_page_styles' ) );
        }

        /**
         * Whether the current admin screen is the WooCommerce settings page.
         * Submenu under mycred-main uses screen id mycred-main_page_mycred-woocommerce.
         */
        private function is_woocommerce_settings_screen( $screen = null ) {
            if ( ! $screen && function_exists( 'get_current_screen' ) ) {
                $screen = get_current_screen();
            }

            $current_page = isset( $_GET['page'] ) ? sanitize_key( wp_unslash( $_GET['page'] ) ) : '';

            if ( $current_page === $this->screen_id ) {
                return true;
            }

            if ( $screen ) {
                $main_menu_screen_id = defined( 'MYCRED_MAIN_SLUG' )
                    ? MYCRED_MAIN_SLUG . '_page_' . $this->screen_id
                    : 'mycred-main_page_' . $this->screen_id;

                if ( $screen->id === $main_menu_screen_id || $screen->id === $this->screen_id ) {
                    return true;
                }
            }

            return false;
        }

        public function admin_body_class( $classes ) {
            if ( $this->is_woocommerce_settings_screen() ) {
                $classes .= ' mycred-woocommerce-settings-page';
            }
            return $classes;
        }

        public function admin_page_styles() {
            if ( ! $this->is_woocommerce_settings_screen() ) {
                return;
            }
            echo '<style>
                #screen-meta-links,
                .wrap h1,
                .wp-heading-inline,
                .mycred-ui-info-btn,
                .notice-info,
                .update-nag,
                #wpfooter,
                .page-title-action { display: none !important; }
                body.mycred-woocommerce-settings-page,
                body.mycred-woocommerce-settings-page #wpcontent,
                body.mycred-woocommerce-settings-page #wpbody,
                body.mycred-woocommerce-settings-page #wpbody-content,
                body.mycred-woocommerce-settings-page #wpfooter {
                    background: #F8F6FF !important;
                }
                body.mycred-woocommerce-settings-page #wpbody-content { padding-bottom: 0; }
                body.mycred-woocommerce-settings-page #myCRED-wrap,
                body.mycred-woocommerce-settings-page.mycred-admin-page #myCRED-wrap,
                body.mycred-woocommerce-settings-page .wrap {
                    background: transparent !important;
                    padding: 0 !important;
                    margin: 0 !important;
                    box-shadow: none !important;
                    border-radius: 0 !important;
                    width: 100% !important;
                    max-width: none !important;
                    border: none !important;
                }
                body.mycred-woocommerce-settings-page .mycred-page-header {
                    background: #ffffff !important;
                    position: relative;
                    z-index: 10;
                }
                body.mycred-woocommerce-settings-page #mycred-woocommerce-settings-root {
                    width: 100%;
                    max-width: 100%;
                    box-sizing: border-box;
                    margin-left: -20px;
                    margin-right: 20px;
                    background: #F8F6FF;
                    font-family: "Figtree", "Inter", sans-serif !important;
                }
            </style>';
        }

        public function register_woocommerce_rest_routes() {
            register_rest_route( 'mycred/v1', '/woocommerce/' . $this->mycred_type, array(
                'methods'             => 'GET',
                'callback'            => array( $this, 'get_woocommerce_settings_rest' ),
                'permission_callback' => function() {
                    return current_user_can( $this->core->edit_creds_cap() );
                },
            ) );
        }

        public function get_woocommerce_settings_rest() {
            ob_start();
            settings_fields( $this->settings_name );
            $settings_nonce = ob_get_clean();

            $reward_setting = isset( $this->woocommerce['reward'] ) ? $this->woocommerce['reward'] : array( 'types' => array(), 'status' => array() );
            $point_types = mycred_get_types();
            $order_statuses  = apply_filters( 'mycred_woocommerce_reward_order_statuses', array( 'wc-processing' => 'Processing',  'wc-completed' => 'Completed') );

            $formatted_point_types = array();
            foreach ( $point_types as $id => $label ) {
                $formatted_point_types[] = array(
                    'id'    => $id,
                    'label' => $label,
                    'name'  => $this->field_name( array( 'reward', 'types', $id ) ),
                );
            }

            $formatted_order_statuses = array();
            foreach ( $order_statuses as $id => $label ) {
                $formatted_order_statuses[] = array(
                    'id'    => $id,
                    'label' => $label,
                );
            }

            $upsells = array();
            if ( function_exists( 'mycred_build_plus_addon_upsell_tabs' ) && defined( 'MYCRED_SHOW_PREMIUM_ADDONS' ) && MYCRED_SHOW_PREMIUM_ADDONS ) {
                $upsells = mycred_build_plus_addon_upsell_tabs( 'woocommerce' );
            }

            return new WP_REST_Response( array(
                'reward_setting'    => $reward_setting,
                'point_types'       => $formatted_point_types,
                'order_statuses'    => $formatted_order_statuses,
                'settings_nonce'    => $settings_nonce,
                'upsells'           => $upsells,
                'status_field_name' => $this->field_name( array( 'reward', 'status' ) ) . '[]',
            ), 200 );
        }

        /**
         * WooCommerce menu callback
         * @since 1.0
         * @version 1.0
         */
        public function admin_page() {

            wp_enqueue_style( 'mycred-bootstrap-grid' );

            $bundle_path = myCRED_ROOT_DIR . 'addons/build/woocommerce-settings.bundle.js';
            $bundle_url  = plugins_url( 'addons/build/woocommerce-settings.bundle.js', myCRED_THIS );

            if ( file_exists( $bundle_path ) ) {
                wp_enqueue_script(
                    'mycred-woocommerce-settings-react',
                    $bundle_url,
                    array( 'wp-element', 'wp-i18n', 'wp-components', 'jquery' ),
                    filemtime( $bundle_path ),
                    true
                );

                $api_url = rest_url( 'mycred/v1/woocommerce/' . $this->mycred_type );
                wp_localize_script( 'mycred-woocommerce-settings-react', 'mycredWooCommerceSettings', array(
                    'apiUrl'      => $api_url,
                    'apiNonce'    => wp_create_nonce( 'wp_rest' ),
                    'pointType'   => $this->mycred_type,
                    'optionId'    => $this->option_id,
                    'isProActive' => class_exists( 'MyCRED_Toolkit_Core_Pro' ) || ( function_exists( 'is_plugin_active' ) && is_plugin_active( 'mycred-toolkit-pro/mycred-toolkit-pro.php' ) ),
                    'proPromoImageUrl' => plugins_url( 'assets/images/test.png', myCRED_THIS ),
                ) );
            }

            mycred_render_admin_header();
            echo '<div class="wrap" id="myCRED-wrap" style="width: 100% !important; max-width: none !important; margin: 0 !important; padding: 0 !important; border-radius: 0 !important; background: transparent !important; box-shadow: none !important; border: none !important;">';
            echo '<div id="mycred-woocommerce-settings-root"></div>';

            // Add legacy hooks so PRO addons can still inject their HTML
            echo '<div id="mycred-legacy-form-wrap" style="display:none;">';
            do_action( 'mycred_after_woocommerce_prefs', $this );
            echo '</div>';

            echo '</div>';

        }

        /**
         * Save Settings
         * @since 0.1
         * @version 1.2
         */
        public function sanitize_settings( $data ) {

            $new_data = array();
            $new_data['reward']['types']  = mycred_sanitize_array( $data['reward']['types'] );
            $new_data['reward']['status'] = mycred_sanitize_array( $data['reward']['status'] );

            return apply_filters( 'mycred_woocommerce_sanitize_settings', $new_data, $data, $this );

        }

    }
endif;

if ( ! function_exists( 'mycred_load_woo_addon' ) ) :
    function mycred_load_woo_addon( $modules, $point_types ) {

        $modules['solo']['woocommerce'] = new myCred_WooCommerce_Module();
        $modules['solo']['woocommerce']->load();
        return $modules;

    }
endif;
add_filter( 'mycred_load_modules', 'mycred_load_woo_addon', 10, 2 );
