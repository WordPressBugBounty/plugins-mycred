<?php
if ( ! defined( 'myCRED_VERSION' ) ) exit;

/**
 * myCRED_REST_Hooks class
 * Handles AJAX requests for hook management.
 */
class myCRED_REST_Hooks {

    public function __construct() {
        add_action( 'wp_ajax_mycred_get_hooks_json', array( $this, 'get_hooks_json' ) );
        add_action( 'wp_ajax_mycred_toggle_hook',    array( $this, 'toggle_hook' ) );
        add_action( 'wp_ajax_mycred_save_hook',      array( $this, 'save_hook_prefs' ) );
    }

    /**
     * Build the full hooks option key for a point type.
     *
     * @param string $ctype Point type key.
     * @return string
     */
    private function get_option_key( $ctype ) {
        $option_id = apply_filters( 'mycred_option_id', 'mycred_pref_hooks' );

        if ( $ctype !== MYCRED_DEFAULT_TYPE_KEY ) {
            $option_id .= '_' . $ctype;
        }

        return $option_id;
    }

    /**
     * Resolve a hook instance prefs array (defaults applied).
     *
     * @param myCRED_Hooks_Module $hooks_module Hooks module.
     * @param array               $callback     Hook callback definition.
     * @return array
     */
    private function get_hook_prefs( $hooks_module, $callback ) {
        if ( ! is_array( $callback ) || empty( $callback[0] ) || ! class_exists( $callback[0] ) ) {
            return array();
        }

        $class = $callback[0];
        $hook  = new $class(
            isset( $hooks_module->hook_prefs ) ? $hooks_module->hook_prefs : array(),
            $hooks_module->mycred_type
        );

        return ( isset( $hook->prefs ) && is_array( $hook->prefs ) ) ? $hook->prefs : array();
    }

    /**
     * Build a compact summary of configured hook values for list/grid cards.
     *
     * @param array  $prefs   Hook preferences.
     * @param object $core    myCRED core for the point type.
     * @param string $hook_id Hook id.
     * @return array[]
     */
    private function build_hook_summary( $prefs, $core, $hook_id = '' ) {
        $items = array();

        if ( ! is_array( $prefs ) || ! is_object( $core ) ) {
            return $items;
        }

        // Single-instance hooks: top-level creds.
        if ( array_key_exists( 'creds', $prefs ) && ! is_array( $prefs['creds'] ) ) {
            $items[] = array(
                'label' => $core->plural(),
                'value' => $core->format_creds( $prefs['creds'] ),
            );

            if ( ! empty( $prefs['limit'] ) && function_exists( 'mycred_translate_limit_code' ) ) {
                $limit = mycred_translate_limit_code( $prefs['limit'], $hook_id, $core );
                if ( $limit !== '' ) {
                    $items[] = array(
                        'label' => __( 'Limit', 'mycred' ),
                        'value' => $limit,
                    );
                }
            }

            return $items;
        }

        // Multi-instance hooks: nested objects with creds (e.g. comments, content).
        foreach ( $prefs as $key => $instance ) {
            if ( 'limits' === $key || ! is_array( $instance ) ) {
                continue;
            }

            if ( ! array_key_exists( 'creds', $instance ) || is_array( $instance['creds'] ) ) {
                continue;
            }

            $items[] = array(
                'label' => ucwords( str_replace( array( '-', '_' ), ' ', (string) $key ) ),
                'value' => $core->format_creds( $instance['creds'] ),
            );
        }

        return $items;
    }

    /**
     * Get All Hooks as JSON
     */
    public function get_hooks_json() {
        check_ajax_referer( 'mycred-hooks-nonce', 'token' );

        if ( ! current_user_can( 'manage_options' ) ) {
            wp_send_json_error( 'Access Denied' );
        }

        $ctype = isset($_POST['ctype']) ? sanitize_key($_POST['ctype']) : MYCRED_DEFAULT_TYPE_KEY;

        // Initialize the Hooks Module for the specific point type
        $hooks_module = new myCRED_Hooks_Module( $ctype );
        $installed    = $hooks_module->get();
        $active       = $hooks_module->active;

        $hooks = array();
        foreach ( $installed as $key => $data ) {
            // Buffer the preferences HTML output
            ob_start();
            $hooks_module->call( 'preferences', $data['callback'] );
            $prefs_html = ob_get_clean();

            $prefs   = $this->get_hook_prefs( $hooks_module, $data['callback'] );
            $summary = $this->build_hook_summary( $prefs, $hooks_module->core, $key );

            $hooks[] = array(
                'id'            => $key,
                'title'         => $hooks_module->core->template_tags_general( $data['title'] ),
                'description'   => $hooks_module->core->template_tags_general( $data['description'] ),
                'documentation' => isset( $data['documentation'] ) ? $data['documentation'] : '',
                'active'        => in_array( $key, $active ),
                'prefs_html'    => $prefs_html,
                'summary'       => $summary,
                'callback'      => $data['callback']
            );
        }

        wp_send_json_success( array(
            'hooks'       => $hooks,
            'point_type'  => $ctype,
            'option_id'   => $this->get_option_key( $ctype )
        ) );
    }

    /**
     * Toggle Hook Status
     */
    public function toggle_hook() {
        check_ajax_referer( 'mycred-hooks-nonce', 'token' );

        if ( ! current_user_can( 'manage_options' ) ) {
            wp_send_json_error( 'Access Denied' );
        }

        $ctype   = isset($_POST['ctype']) ? sanitize_key($_POST['ctype']) : MYCRED_DEFAULT_TYPE_KEY;
        $hook_id = isset($_POST['hook_id']) ? sanitize_key($_POST['hook_id']) : '';
        $activate = isset($_POST['activate']) ? (bool)$_POST['activate'] : false;

        if ( empty($hook_id) ) wp_send_json_error( 'Invalid Hook ID' );

        $hooks_module = new myCRED_Hooks_Module( $ctype );
        $active       = $hooks_module->active;

        if ( $activate && ! in_array( $hook_id, $active ) ) {
            $active[] = $hook_id;
        } elseif ( ! $activate && in_array( $hook_id, $active ) ) {
            $active = array_diff( $active, array( $hook_id ) );
        }

        $hooks_module->active = array_values( array_unique( $active ) );

        $option_id = $this->get_option_key( $ctype );

        $hooks_update = apply_filters( 'mycred_before_hooks_activation_save', $hooks_module, $option_id );

        mycred_update_option( $option_id, array(
            'active'     => $hooks_update->active,
            'installed'  => $hooks_module->get(),
            'hook_prefs' => $hooks_update->hook_prefs
        ) );

        wp_send_json_success( array( 'active' => $hooks_update->active ) );
    }

    /**
     * Save Hook Preferences
     */
    public function save_hook_prefs() {
        check_ajax_referer( 'mycred-hooks-nonce', 'token' );

        if ( ! current_user_can( 'manage_options' ) ) {
            wp_send_json_error( 'Access Denied' );
        }

        $ctype   = isset($_POST['ctype']) ? sanitize_key($_POST['ctype']) : MYCRED_DEFAULT_TYPE_KEY;
        $hook_id = isset($_POST['hook_id']) ? sanitize_key($_POST['hook_id']) : '';

        if ( empty($hook_id) ) wp_send_json_error( 'Invalid Hook ID' );

        $hooks_module = new myCRED_Hooks_Module( $ctype );
        $installed    = $hooks_module->get();

        if ( ! array_key_exists( $hook_id, $installed ) ) wp_send_json_error( 'Hook no longer available' );

        $option_key = $this->get_option_key( $ctype );

        // The form inputs use bracket notation: mycred_pref_hooks[hook_prefs][registration][creds]
        // PHP auto-decodes these into nested arrays in $_POST.
        // Extract just the sub-array for this hook.
        $hook_prefs_post = array();
        if ( isset( $_POST[ $option_key ]['hook_prefs'][ $hook_id ] ) ) {
            // phpcs:ignore WordPress.Security.ValidatedSanitizedInput
            $hook_prefs_post = $_POST[ $option_key ]['hook_prefs'][ $hook_id ];
        } elseif ( isset( $_POST['mycred_pref_hooks']['hook_prefs'][ $hook_id ] ) ) {
            // fallback for default type
            // phpcs:ignore WordPress.Security.ValidatedSanitizedInput
            $hook_prefs_post = $_POST['mycred_pref_hooks']['hook_prefs'][ $hook_id ];
        }

        // Use the hook's own sanitization method
        $hook_callback = $installed[ $hook_id ]['callback'];
        $new_settings  = $hooks_module->call( 'sanitise_preferences', $hook_callback, $hook_prefs_post );

        $hooks_module->hook_prefs[ $hook_id ] = $new_settings;

        $hooks_update = apply_filters( 'mycred_before_hooks_save', $hooks_module, $option_key, $hook_id );

        mycred_update_option( $option_key, array(
            'active'     => $hooks_update->active,
            'installed'  => $installed,
            'hook_prefs' => $hooks_update->hook_prefs
        ) );

        wp_send_json_success( 'Settings Saved' );
    }
}

new myCRED_REST_Hooks();
