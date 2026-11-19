<?php
namespace MG_Blocks;

if ( ! defined('ABSPATH') ) exit;

if ( ! class_exists('myCRED_content_sale_count') ) :
    class myCRED_content_sale_count {

        public function __construct() {
            add_action('wp_ajax_mycred_update_sales_count', array( $this, 'mycred_update_sales_count' ));

            wp_register_script(
                'mycred-content-sale-count', 
                plugins_url('index.js', __FILE__), 
                array( 
                    'wp-blocks', 
                    'wp-element', 
                    'wp-components', 
                    'wp-block-editor', 
                    'wp-rich-text',
                    'jquery'
                ),
                null,
                true // Load script in footer
            );

            wp_localize_script(
                'mycred-content-sale-count',
                'mycredContentSaleCountData',
                array(
                    'nonce' => wp_create_nonce( 'mycred-content-sale-count' ),
                )
            );

            register_block_type( 
                __DIR__, 
                array( 'render_callback' => array( $this, 'render_block' ) )
            );
        }

        public function mycred_update_sales_count() {

            check_ajax_referer( 'mycred-content-sale-count', 'token' );

            $post_id = isset( $_POST['post_id'] ) ? absint( $_POST['post_id'] ) : 0;
            if ( $post_id < 1 || ! current_user_can( 'read_post', $post_id ) ) {
                wp_die();
            }

            echo esc_html( mycred_get_content_sales_count( $post_id ) );
            wp_die();
        }



        public function render_block($attributes, $content) {
            $wrapper = '';
            if ( isset( $attributes['wrapper'] ) && function_exists( 'mycred_sanitize_sellcontent_wrapper_tag' ) ) {
                $wrapper = mycred_sanitize_sellcontent_wrapper_tag( $attributes['wrapper'] );
            }
            $post_id = isset( $attributes['postID'] ) ? absint( $attributes['postID'] ) : 0;

            $sales_count = mycred_get_content_sales_count( $post_id );

            $output = '';

            if ( $wrapper !== '' ) {
                $output .= '<' . $wrapper . ' class="mycred-sell-this-sales-count">';
            }

            $output .= esc_html( $sales_count );

            if ( $wrapper !== '' ) {
                $output .= '</' . $wrapper . '>';
            }

            return $output;
        }
    }
endif;

new myCRED_content_sale_count();
