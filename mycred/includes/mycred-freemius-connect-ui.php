<?php
/**
 * Restyle Freemius connect / opt-in screen to match myCred admin UI.
 *
 * @package myCred
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'mycred_freemius_connect_ui_init' ) ) :

	/**
	 * Bootstrap Freemius connect UI overrides after SDK loads.
	 *
	 * @return void
	 */
	function mycred_freemius_connect_ui_init() {
		global $myc_fs;

		if ( ! isset( $myc_fs ) || ! is_object( $myc_fs ) ) {
			return;
		}

		if ( ! method_exists( $myc_fs, 'is_activation_mode' ) || ! $myc_fs->is_activation_mode() ) {
			return;
		}

		$myc_fs->add_action( 'connect/before', 'mycred_freemius_connect_print_styles' );

		add_filter( 'admin_body_class', 'mycred_freemius_connect_body_class' );
		add_action( 'admin_enqueue_scripts', 'mycred_freemius_connect_enqueue_fonts' );
		add_action( 'admin_head', 'mycred_freemius_connect_hide_notices', 1 );
	}

	/**
	 * Append body class on Freemius activation screen.
	 *
	 * @param string $classes Existing body classes.
	 * @return string
	 */
	function mycred_freemius_connect_body_class( $classes ) {
		global $myc_fs;

		if (
			! isset( $myc_fs ) || ! is_object( $myc_fs )
			|| ! method_exists( $myc_fs, 'is_activation_page' )
			|| ! $myc_fs->is_activation_page()
		) {
			return $classes;
		}

		return $classes . ' mycred-freemius-connect-page';
	}

	/**
	 * Load Figtree for the connect screen.
	 *
	 * @return void
	 */
	function mycred_freemius_connect_enqueue_fonts() {
		global $myc_fs;

		if (
			! isset( $myc_fs ) || ! is_object( $myc_fs )
			|| ! method_exists( $myc_fs, 'is_activation_page' )
			|| ! $myc_fs->is_activation_page()
		) {
			return;
		}

		wp_enqueue_style(
			'mycred-freemius-connect-fonts',
			'https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&display=swap',
			array(),
			null
		);
	}

	/**
	 * Print connect overrides after Freemius inline connect.css.
	 *
	 * @return void
	 */
	function mycred_freemius_connect_print_styles() {
		$css_path = myCRED_ASSETS_DIR . 'css/mycred-freemius-connect.css';

		if ( ! file_exists( $css_path ) ) {
			return;
		}

		$css = file_get_contents( $css_path );

		if ( ! is_string( $css ) || '' === $css ) {
			return;
		}

		$mascot_url = esc_url( plugins_url( 'assets/images/mycred-mascot.svg', myCRED_THIS ) );
		$css        = str_replace( '{{MYCRED_MASCOT_URL}}', $mascot_url, $css );

		echo '<style id="mycred-freemius-connect-css">' . $css . '</style>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	}

	/**
	 * Hide admin notices on the Freemius activation screen.
	 *
	 * @return void
	 */
	function mycred_freemius_connect_hide_notices() {
		global $myc_fs;

		if (
			! isset( $myc_fs ) || ! is_object( $myc_fs )
			|| ! method_exists( $myc_fs, 'is_activation_page' )
			|| ! $myc_fs->is_activation_page()
		) {
			return;
		}

		remove_all_actions( 'admin_notices' );
		remove_all_actions( 'all_admin_notices' );
		remove_all_actions( 'network_admin_notices' );
		remove_all_actions( 'user_admin_notices' );
	}

endif;

if ( did_action( 'myc_fs_loaded' ) ) {
	mycred_freemius_connect_ui_init();
} else {
	add_action( 'myc_fs_loaded', 'mycred_freemius_connect_ui_init' );
}
