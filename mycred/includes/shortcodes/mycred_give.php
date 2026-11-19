<?php
if ( ! defined( 'myCRED_VERSION' ) ) exit;

/**
 * myCRED Shortcode: mycred_give
 * This shortcode allows you to award or deduct points from a given user or the current user
 * when this shortcode is executed. You can insert this in page/post content
 * or in a template file. Note that users are awarded/deducted points each time
 * this shortcode exectutes!
 * @see http://codex.mycred.me/shortcodes/mycred_give/
 * @since 1.1
 * @version 1.3
 */
if ( ! function_exists( 'mycred_give_content_author_is_point_editor' ) ) :
	/**
	 * Whether the post being rendered may use [mycred_give] to change balances.
	 *
	 * @param string $type Point type key.
	 * @return bool
	 */
	function mycred_give_content_author_is_point_editor( $type = '' ) {

		if ( $type === '' ) {
			$type = MYCRED_DEFAULT_TYPE_KEY;
		}

		if ( ! mycred_point_type_exists( $type ) ) {
			return false;
		}

		$mycred    = mycred( $type );
		$author_id = 0;
		global $post;

		if ( $post instanceof WP_Post ) {
			$author_id = (int) $post->post_author;
		} else {
			$post_id = get_the_ID();
			if ( $post_id ) {
				$found = get_post( $post_id );
				if ( $found instanceof WP_Post ) {
					$author_id = (int) $found->post_author;
				}
			}
		}

		if ( $author_id < 1 ) {
			return false;
		}

		return user_can( $author_id, $mycred->get_point_editor_capability() );
	}
endif;

if ( ! function_exists( 'mycred_render_shortcode_give' ) ) :
	function mycred_render_shortcode_give( $atts, $content = '' ) {

		$atts = shortcode_atts( array(
			'amount'  => '',
			'user_id' => 'current',
			'log'     => '',
			'ref'     => 'gift',
			'limit'   => 0,
			'type'    => MYCRED_DEFAULT_TYPE_KEY
		), $atts, MYCRED_SLUG . '_give' );

		if ( ! is_user_logged_in() && $atts['user_id'] === 'current' ) {
			return $content;
		}

		if ( ! mycred_point_type_exists( $atts['type'] ) || apply_filters( 'mycred_give_run', true, $atts ) === false ) {
			return $content;
		}

		// Do not honor amount / user_id unless the post author may manage points.
		if ( ! mycred_give_content_author_is_point_editor( $atts['type'] ) ) {
			return $content;
		}

		$mycred  = mycred( $atts['type'] );
		$amount  = $mycred->number( $atts['amount'] );
		$user_id = mycred_get_user_id( $atts['user_id'] );
		$ref     = sanitize_key( $atts['ref'] );
		$limit   = absint( $atts['limit'] );

		if ( $mycred->exclude_user( $user_id ) ) {
			return $content;
		}

		if ( $limit > 0 && mycred_count_ref_instances( $ref, $user_id, $atts['type'] ) >= $limit ) {
			return $content;
		}

		$mycred->add_creds(
			$ref,
			$user_id,
			$amount,
			$atts['log'],
			0,
			'',
			$atts['type']
		);

		return $content;
	}
endif;
add_shortcode( MYCRED_SLUG . '_give', 'mycred_render_shortcode_give' );
