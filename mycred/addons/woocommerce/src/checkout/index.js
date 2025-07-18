
import { registerBlockType } from '@wordpress/blocks';

registerBlockType( {
	"name": "mycred-woocommerce/mycred-woo-checkout-block",
	"version": "1.0.0",
	"title": "myCred WooCommerce",
	"category": "woocommerce",
    "parent": [ "woocommerce/checkout-totals-block" ],
	"attributes": {
		"lock": {
			"type": "object",
			"default": {
				"remove": true,
				"move": true
			}
		}
	},
	"textdomain": "mycred-woocommerce",
}, {} );