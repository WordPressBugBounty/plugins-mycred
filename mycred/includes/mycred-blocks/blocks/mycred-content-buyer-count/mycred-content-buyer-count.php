<?php
namespace MG_Blocks;

if ( ! defined('ABSPATH') ) exit;

if ( ! class_exists('myCRED_content_buyer_count') ) :
    class myCRED_content_buyer_count {

        public function __construct() {
            wp_register_script(
                'mycred-content-buyer-count', 
                plugins_url('index.js', __FILE__), 
                array( 
                    'wp-blocks', 
                    'wp-element', 
                    'wp-components', 
                    'wp-block-editor', 
                    'wp-rich-text' 
                )
            );

            register_block_type( 
                __DIR__, 
                array( 'render_callback' => array( $this, 'render_block' ) )
            );
        
        }



        public function render_block( $attributes, $content ) {
            
            // Extract the attributes
            $wrapper = '';
            if ( isset( $attributes['wrapper'] ) && function_exists( 'mycred_sanitize_sellcontent_wrapper_tag' ) ) {
                $wrapper = mycred_sanitize_sellcontent_wrapper_tag( $attributes['wrapper'] );
            }
            $post_id = isset( $attributes['postID'] ) ? absint( $attributes['postID'] ) : 0;

            $buyer_count = mycred_get_content_buyers_count( $post_id );

            $output = '';

            if ( $wrapper !== '' ) {
                $output .= '<' . $wrapper . ' class="mycred-buyer-count">';
            }

            $output .= esc_html( $buyer_count );

            if ( $wrapper !== '' ) {
                $output .= '</' . $wrapper . '>';
            }

            return $output; // Return the rendered output
        }


    }
endif;

new mycred_content_buyer_count();