<?php
/**
 * Addon: Gateway
 * Addon URI: http://codex.mycred.me/chapter-iii/gateway/
 * Version: 1.4
 */
if ( ! defined( 'myCRED_VERSION' ) ) exit;

define( 'myCRED_GATE',               __FILE__ );
define( 'myCRED_GATE_VERSION',       '1.4' );
define( 'myCRED_GATE_DIR',           myCRED_ADDONS_DIR . 'gateway/' );
define( 'myCRED_GATE_ASSETS_DIR',    myCRED_GATE_DIR . 'assets/' );
define( 'myCRED_GATE_CART_DIR',      myCRED_GATE_DIR . 'carts/' );
define( 'myCRED_GATE_EVENT_DIR',     myCRED_GATE_DIR . 'event-booking/' );
define( 'myCRED_GATE_MEMBER_DIR',    myCRED_GATE_DIR . 'membership/' );
define( 'myCRED_GATE_AFFILIATE_DIR', myCRED_GATE_DIR . 'affiliate/' );
define( 'myCRED_GATE_BLOCKS_DIR', 	 myCRED_GATE_CART_DIR . 'block-compatibility/' );


if ( class_exists( 'myCRED_Addons_Module' ) ) {
    $get_addons_data = new myCRED_Addons_Module();
}

/**
 * Supported Carts
 */
if( is_array( $get_addons_data->addons ) && ! in_array( 'woocommerce', $get_addons_data->addons['active'] ) ) {
	require_once myCRED_GATE_CART_DIR . 'mycred-woocommerce.php';
}
require_once myCRED_GATE_CART_DIR . 'mycred-wpecommerce.php';

// WooCommerce blocks compatibility file
require_once myCRED_GATE_BLOCKS_DIR . 'mycred-woo-block-compatibility.php';

/**
 * Event Espresso
 */
function mycred_load_event_espresso3() {

	if ( ! defined( 'EVENT_ESPRESSO_VERSION' ) ) return;

	require_once myCRED_GATE_EVENT_DIR . 'mycred-eventespresso3.php';
	$gateway = new myCRED_Espresso_Gateway();
	$gateway->load();

}
add_action( 'mycred_init', 'mycred_load_event_espresso3' );

/**
 * Events Manager
 */
function mycred_load_events_manager() {

	if ( ! defined( 'EM_VERSION' ) ) return;

	// Free only
	if ( ! class_exists( 'EM_Pro' ) ) {

		require_once myCRED_GATE_EVENT_DIR . 'mycred-eventsmanager.php';
		$events = new myCRED_Events_Manager_Gateway();
		$events->load();

	}

}
add_action( 'mycred_init', 'mycred_load_events_manager' );
