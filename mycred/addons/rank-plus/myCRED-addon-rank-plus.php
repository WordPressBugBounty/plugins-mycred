<?php
/**
 * Addon: Rank Plus
 * Version: 1.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! defined( 'MYCRED_RANK_PLUS_VERSION' ) ) {
	define( 'MYCRED_RANK_PLUS_VERSION', '1.0.1' );
}

if ( ! defined( 'MYCRED_RANK_PLUS_THIS' ) ) {
	define( 'MYCRED_RANK_PLUS_THIS', __FILE__ );
}

if ( ! defined( 'MYCRED_RANK_PLUS_DIR' ) ) {
	define( 'MYCRED_RANK_PLUS_DIR', plugin_dir_path( MYCRED_RANK_PLUS_THIS ) );
}

if ( ! defined( 'MYCRED_RANK_PLUS_INCLUDES_DIR' ) ) {
	define( 'MYCRED_RANK_PLUS_INCLUDES_DIR', MYCRED_RANK_PLUS_DIR . 'includes/' );
}

if ( ! defined( 'MYCRED_RANK_PLUS_REQUIREMENTS_DIR' ) ) {
	define( 'MYCRED_RANK_PLUS_REQUIREMENTS_DIR', MYCRED_RANK_PLUS_INCLUDES_DIR . 'requirements/' );
}

// Rank key
if ( ! defined( 'MYCRED_RANK_PLUS_KEY' ) ) {
	define( 'MYCRED_RANK_PLUS_KEY', 'mycred_rank_plus' );
}

// Rank Type key
if ( ! defined( 'MYCRED_RANK_TYPE_KEY' ) ) {
	define( 'MYCRED_RANK_TYPE_KEY', 'mycred_rank_types' );
}

require_once MYCRED_RANK_PLUS_INCLUDES_DIR . 'mycred-rank-plus-functions.php';

/**
 * Load Ranks Plus Module
 *
 * @since 1.0
 * @version 1.0
 */
if ( ! function_exists( 'mycred_load_rank_plus_addon' ) ) :
	function mycred_load_rank_plus_addon( $modules, $point_types ) {

		if ( empty( $modules['solo']['rank-plus'] ) ) {
			
			require_once MYCRED_RANK_PLUS_INCLUDES_DIR . 'mycred-rank-plus-module.php';

			$modules['solo']['rank-plus'] = new myCRED_Ranks_Plus_Module();
			$modules['solo']['rank-plus']->load();

		}

		return $modules;
	}
endif;
add_filter( 'mycred_load_modules', 'mycred_load_rank_plus_addon', 100, 2 );
