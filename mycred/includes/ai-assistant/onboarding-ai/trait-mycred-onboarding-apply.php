<?php
/**
 * Apply selected onboarding add-ons, hooks, settings, ranks, and badges.
 * Shared by AI Setup and Manual Setup.
 *
 * Used only by myCRED_AI_Onboarding.
 *
 * @package myCred
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

trait myCRED_Onboarding_Apply {

	/**
	 * Enable selected core, myCred Addons, and myCred Addons Pro slugs.
	 * Pro add-ons are stored as enabled even if myCred Addons Pro is not active yet;
	 * they only load in the UI after that plugin is activated.
	 *
	 * @param array $slugs Add-on slugs.
	 * @return array{core:string[],toolkit:string[],skipped:string[]}
	 */
	protected function enable_onboarding_addons( $slugs ) {
		$enabled = array(
			'core'    => array(),
			'toolkit' => array(),
			'skipped' => array(),
		);

		$need_toolkit = false;
		$resolved     = array();
		foreach ( (array) $slugs as $slug ) {
			$slug = sanitize_text_field( (string) $slug );
			if ( '' === $slug || 'mycred' === $slug ) {
				continue;
			}
			$source           = method_exists( $this, 'get_onboarding_addon_source' )
				? $this->get_onboarding_addon_source( $slug )
				: ( ( 0 === strpos( $slug, 'mycred-' ) ) ? 'toolkit' : 'core' );
			$resolved[ $slug ] = $source;
			if ( 'toolkit' === $source ) {
				$need_toolkit = true;
			}
		}

		$toolkit_ok = true;
		if ( $need_toolkit ) {
			$toolkit_ok = $this->ensure_onboarding_toolkit_plugin();
		}

		foreach ( $resolved as $slug => $source ) {
			if ( 'toolkit' === $source && ! $toolkit_ok ) {
				$enabled['skipped'][] = $slug;
				continue;
			}

			if ( function_exists( 'mycred_can_enable_toolkit_addon' ) && 'core' !== $source ) {
				$allowed = mycred_can_enable_toolkit_addon( $slug, 'toolkit' === $source ? 'toolkit' : 'core' );
				if ( is_wp_error( $allowed ) ) {
					$enabled['skipped'][] = $slug;
					continue;
				}
			}

			if ( function_exists( 'mycred_set_addon_active' ) ) {
				$result = mycred_set_addon_active( $slug, true );
				if ( empty( $result['success'] ) ) {
					$enabled['skipped'][] = $slug;
					continue;
				}
			} elseif ( 'core' !== $source ) {
				$current = get_option( 'mycred_enabled_addons', array() );
				if ( ! is_array( $current ) ) {
					$current = array();
				}
				$current[] = $slug;
				update_option( 'mycred_enabled_addons', array_values( array_unique( $current ) ) );
			} else {
				$prefs = get_option( 'mycred_pref_addons', array() );
				if ( ! is_array( $prefs ) ) {
					$prefs = array();
				}
				if ( empty( $prefs['active'] ) || ! is_array( $prefs['active'] ) ) {
					$prefs['active'] = array();
				}
				$prefs['active'][] = $slug;
				$prefs['active']   = array_values( array_unique( $prefs['active'] ) );
				if ( function_exists( 'mycred_update_option' ) ) {
					mycred_update_option( 'mycred_pref_addons', $prefs );
				} else {
					update_option( 'mycred_pref_addons', $prefs );
				}
			}

			if ( 'core' === $source ) {
				$enabled['core'][] = $slug;
			} else {
				$enabled['toolkit'][] = $slug;
			}
		}

		$enabled['core']    = array_values( array_unique( $enabled['core'] ) );
		$enabled['toolkit'] = array_values( array_unique( $enabled['toolkit'] ) );
		$enabled['skipped'] = array_values( array_unique( $enabled['skipped'] ) );

		return $enabled;
	}

	/**
	 * Install (WordPress.org) and/or activate myCred Addons when a myCred Addons add-on is selected.
	 *
	 * @return bool
	 */
	protected function ensure_onboarding_toolkit_plugin() {
		if ( function_exists( 'mycred_is_toolkit_plugin_active' ) && mycred_is_toolkit_plugin_active() ) {
			return true;
		}

		if ( ! function_exists( 'is_plugin_active' ) ) {
			require_once ABSPATH . 'wp-admin/includes/plugin.php';
		}

		$plugin_file = '';
		if ( function_exists( 'get_plugins' ) ) {
			foreach ( array_keys( get_plugins() ) as $candidate ) {
				if ( 'mycred-toolkit.php' === basename( $candidate ) ) {
					$plugin_file = $candidate;
					break;
				}
			}
		}

		if ( '' !== $plugin_file ) {
			if ( ! current_user_can( 'activate_plugins' ) ) {
				return false;
			}
			$activation = activate_plugin( $plugin_file );
			return ! is_wp_error( $activation );
		}

		if ( ! current_user_can( 'install_plugins' ) ) {
			return false;
		}

		require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
		require_once ABSPATH . 'wp-admin/includes/plugin-install.php';
		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/misc.php';

		$api = plugins_api( 'plugin_information', array( 'slug' => 'mycred-toolkit', 'fields' => array( 'sections' => false ) ) );
		if ( is_wp_error( $api ) || empty( $api->download_link ) ) {
			return false;
		}

		$skin     = new Automatic_Upgrader_Skin();
		$upgrader = new Plugin_Upgrader( $skin );
		$result   = $upgrader->install( $api->download_link );
		if ( is_wp_error( $result ) || false === $result ) {
			return false;
		}

		$plugin_file = 'mycred-toolkit/mycred-toolkit.php';
		if ( ! file_exists( WP_PLUGIN_DIR . '/' . $plugin_file ) ) {
			return false;
		}

		$activation = activate_plugin( $plugin_file );
		return ! is_wp_error( $activation );
	}

	/**
	 * Activate selected earning hooks on the default point type.
	 *
	 * @param array $hooks List of hook rows with hook_id and optional creds.
	 * @return string[] Activated hook IDs.
	 */
	protected function enable_onboarding_hooks( $hooks ) {
		$option_key = apply_filters( 'mycred_option_id', 'mycred_pref_hooks' );
		$settings   = function_exists( 'mycred_get_option' ) ? mycred_get_option( $option_key, array() ) : get_option( $option_key, array() );
		if ( ! is_array( $settings ) ) {
			$settings = array();
		}
		if ( empty( $settings['active'] ) || ! is_array( $settings['active'] ) ) {
			$settings['active'] = array();
		}
		if ( empty( $settings['hook_prefs'] ) || ! is_array( $settings['hook_prefs'] ) ) {
			$settings['hook_prefs'] = array();
		}

		$activated = array();
		foreach ( (array) $hooks as $row ) {
			if ( ! is_array( $row ) || empty( $row['hook_id'] ) ) {
				continue;
			}
			$hook_id = sanitize_key( $row['hook_id'] );
			if ( '' === $hook_id ) {
				continue;
			}
			if ( ! in_array( $hook_id, $settings['active'], true ) ) {
				$settings['active'][] = $hook_id;
			}
			$creds = isset( $row['creds'] ) ? sanitize_text_field( (string) $row['creds'] ) : '';
			if ( '' === $creds ) {
				$creds = '10';
			}
			if ( empty( $settings['hook_prefs'][ $hook_id ] ) || ! is_array( $settings['hook_prefs'][ $hook_id ] ) ) {
				$settings['hook_prefs'][ $hook_id ] = array(
					'creds' => $creds,
					'log'   => '%plural% for ' . str_replace( '_', ' ', $hook_id ),
					'limit' => '0/x',
				);
			} elseif ( '' !== $creds ) {
				$settings['hook_prefs'][ $hook_id ]['creds'] = $creds;
			}
			$activated[] = $hook_id;
		}

		$settings['active'] = array_values( array_unique( $settings['active'] ) );
		if ( function_exists( 'mycred_update_option' ) ) {
			mycred_update_option( $option_key, $settings );
		} else {
			update_option( $option_key, $settings );
		}

		return $activated;
	}

	/**
	 * Drop setting/checkout rows that belong to add-ons we did not enable.
	 *
	 * @param array $rows   Setting rows.
	 * @param array $slugs  Add-on slugs to drop.
	 * @return array
	 */
	protected function filter_onboarding_rows_not_in_addons( $rows, $slugs ) {
		if ( empty( $slugs ) || ! is_array( $rows ) ) {
			return is_array( $rows ) ? $rows : array();
		}
		$out = array();
		foreach ( $rows as $row ) {
			if ( ! is_array( $row ) ) {
				continue;
			}
			$addon = isset( $row['addon'] ) ? sanitize_text_field( (string) $row['addon'] ) : '';
			if ( '' !== $addon && in_array( $addon, $slugs, true ) ) {
				continue;
			}
			$out[] = $row;
		}
		return $out;
	}

	/**
	 * Set a dotted path on an array.
	 *
	 * @param array  $data  Target by reference.
	 * @param string $path  Dotted path.
	 * @param mixed  $value Value.
	 * @return void
	 */
	protected function set_onboarding_nested_value( &$data, $path, $value ) {
		if ( ! is_array( $data ) ) {
			$data = array();
		}
		$parts = array_values( array_filter( explode( '.', (string) $path ), 'strlen' ) );
		if ( empty( $parts ) ) {
			return;
		}
		$cur  = &$data;
		$last = count( $parts ) - 1;
		foreach ( $parts as $i => $part ) {
			if ( $i === $last ) {
				$cur[ $part ] = $value;
				return;
			}
			if ( ! isset( $cur[ $part ] ) || ! is_array( $cur[ $part ] ) ) {
				$cur[ $part ] = array();
			}
			$cur = &$cur[ $part ];
		}
	}

	/**
	 * Save mycred_pref_core without the Settings API sanitizer.
	 *
	 * register_setting( mycred_pref_core ) rebuilds the option from form fields
	 * and drops LevelCred keys when that add-on was enabled in the same request.
	 *
	 * @param array $core Core prefs.
	 * @return bool
	 */
	protected function update_onboarding_pref_core( $core ) {
		if ( ! is_array( $core ) ) {
			return false;
		}

		$hook = 'sanitize_option_mycred_pref_core';
		global $wp_filter;
		$backup = isset( $wp_filter[ $hook ] ) ? $wp_filter[ $hook ] : null;
		unset( $wp_filter[ $hook ] );

		if ( function_exists( 'mycred_update_option' ) ) {
			$result = mycred_update_option( 'mycred_pref_core', $core );
		} else {
			$result = update_option( 'mycred_pref_core', $core );
		}

		if ( $backup ) {
			$wp_filter[ $hook ] = $backup;
		}

		return (bool) $result;
	}

	/**
	 * @param mixed $addons Payload add-ons (slugs or rows).
	 * @return string[]
	 */
	protected function onboarding_selected_addon_slugs( $addons ) {
		$out = array();
		foreach ( (array) $addons as $item ) {
			if ( is_array( $item ) ) {
				$item = isset( $item['slug'] ) ? $item['slug'] : '';
			}
			$slug = strtolower( str_replace( '_', '-', sanitize_text_field( (string) $item ) ) );
			if ( '' !== $slug ) {
				$out[] = $slug;
			}
		}

		return array_values( array_unique( $out ) );
	}

	/**
	 * Whether Enable Partial Payments is on in the posted rows.
	 *
	 * @param array $rows Setting rows.
	 * @return bool
	 */
	protected function onboarding_partial_payments_enabled( $rows ) {
		foreach ( (array) $rows as $row ) {
			if ( ! is_array( $row ) ) {
				continue;
			}
			$key = strtolower( (string) ( $row['key'] ?? '' ) );
			if ( 'mwp_partial_payments.enable' !== $key ) {
				continue;
			}
			$value = strtolower( (string) ( $row['value'] ?? '' ) );

			return in_array( $value, array( '1', 'yes', 'true', 'on' ), true );
		}

		return false;
	}

	/**
	 * Partial Payment related keys apply only when Enable Partial Payments is on.
	 *
	 * @param array $rows Setting rows.
	 * @param bool  $enabled Whether the parent toggle is on.
	 * @return array
	 */
	protected function filter_onboarding_partial_payment_rows( $rows, $enabled ) {
		if ( $enabled ) {
			return array_values( (array) $rows );
		}
		$kept = array();
		foreach ( (array) $rows as $row ) {
			if ( ! is_array( $row ) ) {
				continue;
			}
			$key = strtolower( (string) ( $row['key'] ?? '' ) );
			if ( 0 === strpos( $key, 'mwp_partial_payments.' ) || 0 === strpos( $key, 'partial_payment_settings.' ) ) {
				continue;
			}
			$kept[] = $row;
		}

		return $kept;
	}

	/**
	 * WooCommerce Pay with Points gateway field keys.
	 *
	 * @return string[]
	 */
	protected function onboarding_woo_gateway_field_keys() {
		return array(
			'enabled',
			'title',
			'description',
			'log_template',
			'log_template_refund',
			'point_type',
			'exchange_rate',
			'show_total',
			'total_label',
			'balance_format',
			'profit_sharing_percent',
			'profit_sharing_log',
			'profit_sharing_refund_log',
			'product_restriction',
			'category_restriction',
			'tag_restriction',
		);
	}

	/**
	 * Whether a setting belongs to the WooCommerce checkout gateway.
	 *
	 * @param string $key   Setting key.
	 * @param string $addon Add-on slug.
	 * @return bool
	 */
	protected function is_onboarding_woo_gateway_setting_key( $key, $addon = '' ) {
		$addon = strtolower( str_replace( '_', '-', (string) $addon ) );
		if ( ! in_array( $addon, array( 'woocommerce', 'mycred-woocommerce-plus', 'gateway' ), true ) ) {
			return false;
		}
		$key = strtolower( (string) $key );
		if ( 0 === strpos( $key, 'woocommerce.' ) ) {
			$key = substr( $key, strlen( 'woocommerce.' ) );
		}

		return in_array( $key, $this->onboarding_woo_gateway_field_keys(), true );
	}

	/**
	 * Whether Pay with Points is enabled in posted rows.
	 *
	 * @param array $rows Setting rows.
	 * @return bool
	 */
	protected function onboarding_woo_payments_enabled( $rows ) {
		foreach ( (array) $rows as $row ) {
			if ( ! is_array( $row ) ) {
				continue;
			}
			$key   = (string) ( $row['key'] ?? '' );
			$addon = (string) ( $row['addon'] ?? '' );
			if ( ! $this->is_onboarding_woo_gateway_setting_key( $key, $addon ) ) {
				continue;
			}
			$bare = strtolower( $key );
			if ( 0 === strpos( $bare, 'woocommerce.' ) ) {
				$bare = substr( $bare, strlen( 'woocommerce.' ) );
			}
			if ( 'enabled' !== $bare ) {
				continue;
			}
			$value = strtolower( (string) ( $row['value'] ?? '' ) );

			return in_array( $value, array( '1', 'yes', 'true', 'on' ), true );
		}

		return false;
	}

	/**
	 * WooCommerce gateway fields apply only when Enable/Disable is on.
	 *
	 * @param array $rows    Setting rows.
	 * @param bool  $enabled Whether the parent toggle is on.
	 * @return array
	 */
	protected function filter_onboarding_woo_payment_rows( $rows, $enabled ) {
		if ( $enabled ) {
			return array_values( (array) $rows );
		}
		$kept = array();
		foreach ( (array) $rows as $row ) {
			if ( ! is_array( $row ) ) {
				continue;
			}
			$key   = (string) ( $row['key'] ?? '' );
			$addon = (string) ( $row['addon'] ?? '' );
			if ( $this->is_onboarding_woo_gateway_setting_key( $key, $addon ) ) {
				continue;
			}
			$kept[] = $row;
		}

		return $kept;
	}

	/**
	 * Whether a hook id is selected in the posted onboarding hooks.
	 *
	 * @param array  $hooks Hook rows.
	 * @param string $hook_id Hook id.
	 * @return bool
	 */
	protected function onboarding_hook_selected( $hooks, $hook_id ) {
		$hook_id = strtolower( (string) $hook_id );
		foreach ( (array) $hooks as $row ) {
			if ( ! is_array( $row ) ) {
				continue;
			}
			$id = strtolower( (string) ( $row['hook_id'] ?? '' ) );
			if ( $id === $hook_id ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Product Referral settings apply only when the Product Referral hook is on.
	 *
	 * @param array $rows Setting rows.
	 * @param bool  $enabled Whether the hook is selected.
	 * @return array
	 */
	protected function filter_onboarding_product_referral_rows( $rows, $enabled ) {
		if ( $enabled ) {
			return array_values( (array) $rows );
		}
		$kept = array();
		foreach ( (array) $rows as $row ) {
			if ( ! is_array( $row ) ) {
				continue;
			}
			$key = strtolower( (string) ( $row['key'] ?? '' ) );
			if ( 0 === strpos( $key, 'mwp_product_referral.' ) ) {
				continue;
			}
			$kept[] = $row;
		}

		return $kept;
	}

	/**
	 * Persist add-on / checkout setting rows from onboarding.
	 *
	 * @param array $rows Setting rows with addon, key, value.
	 * @param bool  $is_checkout Whether these are checkout gateway fields.
	 * @return int Number of fields written.
	 */
	protected function apply_onboarding_setting_rows( $rows, $is_checkout = false ) {
		$core         = function_exists( 'mycred_get_option' ) ? mycred_get_option( 'mycred_pref_core', array() ) : get_option( 'mycred_pref_core', array() );
		$woo          = get_option( 'woocommerce_mycred_settings', array() );
		$extra        = array();
		$touched_core = false;
		$touched_woo  = false;
		$hook_writes  = array();
		$written      = 0;

		if ( ! is_array( $core ) ) {
			$core = array();
		}
		if ( ! is_array( $woo ) ) {
			$woo = array();
		}

		foreach ( (array) $rows as $row ) {
			if ( ! is_array( $row ) ) {
				continue;
			}
			$key   = isset( $row['key'] ) ? sanitize_text_field( (string) $row['key'] ) : '';
			$addon = isset( $row['addon'] ) ? sanitize_text_field( (string) $row['addon'] ) : '';
			if ( '' === $key ) {
				continue;
			}
			$woo_gateway = $this->is_onboarding_woo_gateway_setting_key( $key, $addon );
			$key         = $this->normalize_onboarding_setting_key( $key, $addon );
			if ( '' === $key || ( ! $woo_gateway && $this->is_onboarding_post_meta_setting_key( $key ) ) ) {
				continue;
			}

			$value = isset( $row['value'] ) ? wp_unslash( $row['value'] ) : '';
			if ( is_array( $value ) ) {
				$value = array_map( 'sanitize_text_field', $value );
			} else {
				$value = sanitize_text_field( (string) $value );
			}
			$options = array();
			if ( isset( $row['options'] ) && is_array( $row['options'] ) ) {
				foreach ( $row['options'] as $opt_key => $opt_label ) {
					if ( is_scalar( $opt_label ) ) {
						$options[ sanitize_text_field( (string) $opt_key ) ] = sanitize_text_field( (string) $opt_label );
					}
				}
			}
			$value = $this->coerce_onboarding_choice_value( $value, $options );
			$value = $this->normalize_onboarding_setting_value( $key, $value );

			$dest = $this->onboarding_setting_destination( $key, $addon, $is_checkout );
			if ( ! $dest ) {
				continue;
			}

			if ( 'woo' === $dest['store'] ) {
				$field = $dest['path'];
				if ( in_array( $field, array( 'enabled', 'enable' ), true ) ) {
					$value = in_array( strtolower( (string) $value ), array( '1', 'yes', 'true', 'on' ), true ) ? 'yes' : 'no';
				}
				$woo[ $field ] = $value;
				$touched_woo   = true;
				$written++;
				continue;
			}

			if ( 'hooks' === $dest['store'] ) {
				$hook_writes[ $dest['hook'] ][ $dest['field'] ] = $value;
				$written++;
				continue;
			}

			if ( 'option' === $dest['store'] ) {
				$option_id = $dest['option'];
				if ( empty( $extra[ $option_id ] ) || ! is_array( $extra[ $option_id ] ) ) {
					$existing = function_exists( 'mycred_get_option' ) ? mycred_get_option( $option_id, array() ) : get_option( $option_id, array() );
					$extra[ $option_id ] = is_array( $existing ) ? $existing : array();
				}
				$this->set_onboarding_nested_value( $extra[ $option_id ], $dest['path'], $value );
				$written++;
				continue;
			}

			$this->set_onboarding_nested_value( $core, $dest['path'], $value );
			$touched_core = true;
			$written++;
		}

		if ( $touched_core ) {
			$this->update_onboarding_pref_core( $core );
		}
		if ( $touched_woo ) {
			update_option( 'woocommerce_mycred_settings', $woo );
			$type = defined( 'MYCRED_DEFAULT_TYPE_KEY' ) ? MYCRED_DEFAULT_TYPE_KEY : 'mycred_default';
			if ( is_string( $type ) && '' !== $type && 'mycred' !== $type ) {
				update_option( 'woocommerce_mycred_' . $type . '_settings', $woo );
			}
		}
		foreach ( $extra as $option_id => $payload ) {
			if ( function_exists( 'mycred_update_option' ) ) {
				mycred_update_option( $option_id, $payload );
			} else {
				update_option( $option_id, $payload );
			}
		}
		if ( ! empty( $hook_writes ) ) {
			$this->apply_onboarding_hook_pref_map( $hook_writes );
		}
		$this->maybe_migrate_onboarding_expiration_hook_prefs();

		return $written;
	}

	/**
	 * Map onboarding keys onto the option paths the add-on actually reads.
	 *
	 * @param string $key   Setting key.
	 * @param string $addon Add-on slug.
	 * @return string
	 */
	protected function normalize_onboarding_setting_key( $key, $addon ) {
		$key   = (string) $key;
		$addon = (string) $addon;
		$type  = defined( 'MYCRED_DEFAULT_TYPE_KEY' ) ? MYCRED_DEFAULT_TYPE_KEY : 'mycred_default';
		$key   = str_replace(
			array( '{type}', '{type_id}', '{post_type}' ),
			array( $type, $type, 'post' ),
			$key
		);

		if ( '' !== $addon && 0 === strpos( $key, $addon . '.' ) ) {
			$key = substr( $key, strlen( $addon ) + 1 );
		}

		$lower = strtolower( $key );
		if ( preg_match( '/(^|\.)exp_format$/', $lower ) || in_array( $lower, array( 'how_to_show', 'how-to-show' ), true ) ) {
			return 'exp_email.exp_format';
		}

		$hook_fields = array( 'exp_days', 'log', 'exp_ref_type', 'exp_references' );
		$bare        = ( 0 === strpos( $lower, 'expiration.' ) ) ? substr( $key, strlen( 'expiration.' ) ) : $key;
		$is_exp      = ( 'mycred-expiration-addon' === $addon || 0 === strpos( $lower, 'expiration.' ) || in_array( $key, array( 'exp_days', 'exp_ref_type', 'exp_references' ), true ) );
		if ( $is_exp && in_array( $bare, $hook_fields, true ) ) {
			return 'expiration.' . $bare;
		}

		if ( false === strpos( $key, '.' ) ) {
			if ( $this->is_onboarding_woo_gateway_setting_key( $key, $addon ) ) {
				return $key;
			}
			$root = $this->onboarding_pref_root_for_addon( $addon );
			if ( '' !== $root && $root !== $key ) {
				$key = $root . '.' . $key;
			}
		}

		return $key;
	}

	/**
	 * Default mycred_pref_core root for an add-on slug when the setting key has no dots.
	 *
	 * @param string $addon Add-on slug.
	 * @return string
	 */
	protected function onboarding_pref_root_for_addon( $addon ) {
		$map = array(
			'notifications'         => 'notifications',
			'mycred-notice-plus'    => 'notifications',
			'email-notices'         => 'emailnotices',
			'ranks'                 => 'rank',
			'coupons'               => 'coupons',
			'transfer'              => 'transfers',
			'sell-content'          => 'sell_content',
			'stats'                 => 'stats',
			'badges'                => 'badges',
			'buy-creds'             => 'buy_creds',
			'cash-creds'            => 'cashcreds',
			'gateway'               => 'gateway',
			'banking'               => 'banking',
			'mycred-progress-map'   => 'progress_map',
			'mycred-userpro'        => 'userpro',
			'mycred-zapier'         => 'zapier',
			'mycred-rest'           => 'mycred_rest_api',
			'mycred-social-proof'   => 'mycred_popup_notify',
			'mycred-sms-payments'   => 'sms_payments',
			'mycred-pacman'         => 'pacman',
			'mycred-credly'         => 'credly',
			'mycred-buddyboss'      => 'bboss',
			'mycred-transfer-plus'  => 'pending_transfers',
			'mycred-pending-points' => 'pending',
			'mycred-level-cred'     => 'level_cred',
			'woocommerce'           => 'woocommerce',
		);

		return isset( $map[ $addon ] ) ? $map[ $addon ] : '';
	}

	/**
	 * Decide where an onboarding setting is stored.
	 *
	 * @param string $key         Normalized key.
	 * @param string $addon       Add-on slug.
	 * @param bool   $is_checkout Checkout block.
	 * @return array<string,string>|null
	 */
	protected function onboarding_setting_destination( $key, $addon, $is_checkout = false ) {
		$woo_addon = in_array( $addon, array( 'woocommerce', 'mycred-woocommerce-plus', 'gateway' ), true );
		if ( $this->is_onboarding_woo_gateway_setting_key( $key, $addon ) ) {
			$path = strtolower( (string) $key );
			if ( 0 === strpos( $path, 'woocommerce.' ) ) {
				$path = substr( $path, strlen( 'woocommerce.' ) );
			}
			return array(
				'store' => 'woo',
				'path'  => $path,
			);
		}
		if ( $is_checkout || ( $woo_addon && false === strpos( $key, '.' ) ) ) {
			return array(
				'store' => 'woo',
				'path'  => $key,
			);
		}

		if ( preg_match( '/^mycred_sell_this_([^.]+)\.(.+)$/', $key, $m ) ) {
			return array(
				'store'  => 'option',
				'option' => 'mycred_sell_this_' . $m[1],
				'path'   => $m[2],
			);
		}

		$hook_path = $this->onboarding_hook_pref_parts( $key );
		if ( $hook_path ) {
			return array(
				'store' => 'hooks',
				'hook'  => $hook_path[0],
				'field' => $hook_path[1],
			);
		}

		return array(
			'store' => 'core',
			'path'  => $key,
		);
	}

	/**
	 * First-segment keys that belong in mycred_pref_core, not hook prefs.
	 *
	 * @return string[]
	 */
	protected function onboarding_core_pref_roots() {
		return array(
			'ai_settings',
			'badges',
			'badgr',
			'bboss',
			'buddypress',
			'buy_creds',
			'cashcreds',
			'code_transfers',
			'coupons',
			'credly',
			'dashboard',
			'emailnotices',
			'exp_email',
			'export',
			'notifications',
			'open_badge',
			'pacman',
			'pending_transfers',
			'pointtypes',
			'progress_map',
			'roles',
			'sell_content',
			'sms_payments',
			'transfers',
			'types',
			'userpro',
			'zapier',
			'rank',
			'pending',
			'level_cred',
			'partial_payment_settings',
			'format',
			'name',
			'caps',
			'exclude',
			'caching',
			'woocommerce',
			'mycred_popup_notify',
			'mycred_rest_api',
		);
	}

	/**
	 * CPT / notice fields are not core option keys.
	 *
	 * @param string $key Setting key.
	 * @return bool
	 */
	protected function is_onboarding_post_meta_setting_key( $key ) {
		if ( false !== strpos( (string) $key, '.' ) ) {
			return false;
		}

		return in_array(
			(string) $key,
			array(
				'instance',
				'title',
				'content',
				'excerpt',
				'_thumbnail_id',
				'ctype',
				'recipient',
				'mycred_email_exp_days_before',
				'mycred_notify_instance',
				'mycred_notify_ref',
				'mycred_rank_min',
				'mycred_rank_max',
			),
			true
		);
	}

	/**
	 * Coerce onboarding values to the stored option format.
	 *
	 * @param string $key   Setting key.
	 * @param mixed  $value Value.
	 * @return mixed
	 */
	protected function coerce_onboarding_choice_value( $value, $options ) {
		if ( is_array( $value ) ) {
			$mapped = array();
			foreach ( $value as $item ) {
				$mapped[] = $this->coerce_onboarding_choice_value( $item, $options );
			}
			return $mapped;
		}

		$raw = trim( (string) $value );
		if ( '' === $raw || empty( $options ) || ! is_array( $options ) ) {
			return $value;
		}
		if ( array_key_exists( $raw, $options ) ) {
			return $raw;
		}

		$lower = strtolower( $raw );
		foreach ( $options as $opt_key => $opt_label ) {
			if ( strtolower( (string) $opt_key ) === $lower ) {
				return (string) $opt_key;
			}
			if ( strtolower( trim( wp_strip_all_tags( (string) $opt_label ) ) ) === $lower ) {
				return (string) $opt_key;
			}
		}

		return $value;
	}

	protected function normalize_onboarding_setting_value( $key, $value ) {
		if ( 'exp_email.exp_format' === $key || preg_match( '/(^|\.)exp_format$/', (string) $key ) ) {
			return $this->normalize_onboarding_exp_format( $value );
		}

		if ( preg_match( '/(^|\.)exp_ref_type$/', (string) $key ) ) {
			return $this->normalize_onboarding_exp_ref_type( $value );
		}

		if ( preg_match( '/(^|\.)exp_references$/', (string) $key ) ) {
			return $this->normalize_onboarding_log_references( $value );
		}

		if ( 'level_cred.enable' === $key ) {
			return in_array( strtolower( (string) $value ), array( '1', 'yes', 'true', 'on' ), true ) ? 1 : 0;
		}

		if ( 'level_cred.based' === $key ) {
			$raw = strtolower( trim( (string) $value ) );
			if ( in_array( $raw, array( 'rank', 'badge', 'role' ), true ) ) {
				return $raw;
			}
			return 'rank';
		}

		return $value;
	}

	/**
	 * Bind LevelCred point-type prefs to the onboarding add-on toggle.
	 *
	 * @param bool $enabled Whether mycred-level-cred was selected.
	 * @return void
	 */
	protected function apply_level_cred_onboarding_prefs( $enabled ) {
		$core = function_exists( 'mycred_get_option' ) ? mycred_get_option( 'mycred_pref_core', array() ) : get_option( 'mycred_pref_core', array() );
		if ( ! is_array( $core ) ) {
			$core = array();
		}
		if ( ! isset( $core['level_cred'] ) || ! is_array( $core['level_cred'] ) ) {
			$core['level_cred'] = array();
		}

		$core['level_cred']['enable'] = $enabled ? 1 : 0;
		if ( $enabled ) {
			$core['level_cred']['based'] = 'rank';
		}

		$this->update_onboarding_pref_core( $core );
	}

	/**
	 * Map How-to-show labels onto days_left / date.
	 *
	 * @param mixed $value Raw value.
	 * @return string
	 */
	protected function normalize_onboarding_exp_format( $value ) {
		$raw = is_array( $value ) ? (string) reset( $value ) : (string) $value;
		$raw = trim( wp_strip_all_tags( $raw ) );
		if ( '' === $raw ) {
			return $raw;
		}

		$lower = strtolower( $raw );
		if ( 'date' === $lower || false !== strpos( $lower, '30-12-2020' ) || preg_match( '/^date\b/', $lower ) ) {
			return 'date';
		}
		if ( 'days_left' === $lower || 'days' === $lower || false !== strpos( $lower, 'day' ) ) {
			return 'days_left';
		}

		return $raw;
	}

	/**
	 * Map Apply-to-references labels onto stored radio values.
	 *
	 * @param mixed $value Raw value.
	 * @return string
	 */
	protected function normalize_onboarding_exp_ref_type( $value ) {
		$raw   = is_array( $value ) ? (string) reset( $value ) : (string) $value;
		$raw   = trim( wp_strip_all_tags( $raw ) );
		$lower = strtolower( $raw );
		if ( '' === $raw ) {
			return 'all_references';
		}
		if ( 'selected_references' === $lower || false !== strpos( $lower, 'selected' ) ) {
			return 'selected_references';
		}
		if ( 'all_references' === $lower || false !== strpos( $lower, 'all' ) ) {
			return 'all_references';
		}

		return $raw;
	}

	/**
	 * Convert labels / CSV strings into log-reference keys the Expiration UI stores.
	 *
	 * @param mixed $value Raw value (string, CSV, or array).
	 * @return array
	 */
	protected function normalize_onboarding_log_references( $value ) {
		$tokens = array();
		if ( is_array( $value ) ) {
			foreach ( $value as $item ) {
				if ( is_scalar( $item ) ) {
					$tokens[] = (string) $item;
				}
			}
		} else {
			$raw = trim( (string) $value );
			if ( '' !== $raw ) {
				$tokens = preg_split( '/[,;\n]+/', $raw );
			}
		}

		$map = function_exists( 'mycred_get_all_references' ) ? mycred_get_all_references() : array();
		if ( ! is_array( $map ) ) {
			$map = array();
		}

		$resolved = array();
		foreach ( $tokens as $token ) {
			$token = trim( wp_strip_all_tags( (string) $token ) );
			if ( '' === $token ) {
				continue;
			}
			$hit = $this->resolve_onboarding_log_reference_token( $token, $map );
			if ( '' !== $hit ) {
				$resolved[] = $hit;
			}
		}

		return array_values( array_unique( $resolved ) );
	}

	/**
	 * Match a token to a myCred log reference key.
	 *
	 * @param string               $token Raw token (key or label).
	 * @param array<string,string> $map   Reference key => label.
	 * @return string
	 */
	protected function resolve_onboarding_log_reference_token( $token, $map ) {
		if ( isset( $map[ $token ] ) ) {
			return $token;
		}

		$lower = strtolower( $token );
		foreach ( $map as $key => $label ) {
			if ( strtolower( (string) $key ) === $lower ) {
				return (string) $key;
			}
		}
		foreach ( $map as $key => $label ) {
			if ( strtolower( trim( wp_strip_all_tags( (string) $label ) ) ) === $lower ) {
				return (string) $key;
			}
		}

		$slug = sanitize_key( str_replace( ' ', '_', $token ) );
		if ( isset( $map[ $slug ] ) ) {
			return $slug;
		}

		return '';
	}

	/**
	 * Hook-pref setting keys (first segment is the hook id).
	 *
	 * @param string $key Setting key.
	 * @return array{0:string,1:string}|null
	 */
	protected function onboarding_hook_pref_parts( $key ) {
		$parts = explode( '.', (string) $key, 2 );
		if ( count( $parts ) < 2 || '' === $parts[0] || '' === $parts[1] ) {
			return null;
		}
		$hook_id = sanitize_key( $parts[0] );
		$field   = sanitize_text_field( $parts[1] );
		if ( in_array( $hook_id, $this->onboarding_core_pref_roots(), true ) ) {
			return null;
		}
		if ( ! in_array( $hook_id, $this->onboarding_hook_ids(), true ) ) {
			return null;
		}

		return array( $hook_id, $field );
	}

	/**
	 * Installed / catalog hook IDs (settings under these go to mycred_pref_hooks).
	 *
	 * @return string[]
	 */
	protected function onboarding_hook_ids() {
		static $ids = null;
		if ( is_array( $ids ) ) {
			return $ids;
		}

		$ids = array( 'expiration' );
		if ( function_exists( 'mycred_get_all_references' ) ) {
			$refs = mycred_get_all_references();
			if ( is_array( $refs ) ) {
				$ids = array_merge( $ids, array_map( 'strval', array_keys( $refs ) ) );
			}
		}

		$path = ( defined( 'MYCRED_AI_ONBOARDING_MANUAL_DIR' ) ? MYCRED_AI_ONBOARDING_MANUAL_DIR : ( dirname( __DIR__ ) . '/onboarding-manual/' ) ) . 'onboarding-manual-catalog.php';
		if ( file_exists( $path ) ) {
			$catalog = include $path;
			if ( is_array( $catalog ) && ! empty( $catalog['hooks'] ) && is_array( $catalog['hooks'] ) ) {
				$ids = array_merge( $ids, array_map( 'strval', array_keys( $catalog['hooks'] ) ) );
			}
		}

		$ids = array_values( array_unique( array_filter( $ids ) ) );
		$ids = array_values( array_diff( $ids, $this->onboarding_core_pref_roots() ) );

		return $ids;
	}

	/**
	 * Write nested hook preference fields into mycred_pref_hooks.
	 *
	 * @param array<string, array<string, mixed>> $writes Hook id => field => value.
	 * @return void
	 */
	protected function apply_onboarding_hook_pref_map( $writes ) {
		$option_key = apply_filters( 'mycred_option_id', 'mycred_pref_hooks' );
		$settings   = function_exists( 'mycred_get_option' ) ? mycred_get_option( $option_key, array() ) : get_option( $option_key, array() );
		if ( ! is_array( $settings ) ) {
			$settings = array();
		}
		if ( empty( $settings['active'] ) || ! is_array( $settings['active'] ) ) {
			$settings['active'] = array();
		}
		if ( empty( $settings['hook_prefs'] ) || ! is_array( $settings['hook_prefs'] ) ) {
			$settings['hook_prefs'] = array();
		}

		foreach ( $writes as $hook_id => $fields ) {
			$hook_id = sanitize_key( (string) $hook_id );
			if ( '' === $hook_id || ! is_array( $fields ) ) {
				continue;
			}
			if ( empty( $settings['hook_prefs'][ $hook_id ] ) || ! is_array( $settings['hook_prefs'][ $hook_id ] ) ) {
				$settings['hook_prefs'][ $hook_id ] = array();
			}
			foreach ( $fields as $field => $value ) {
				$field = sanitize_text_field( (string) $field );
				if ( '' === $field ) {
					continue;
				}
				if ( 'exp_references' === $field ) {
					$value = $this->normalize_onboarding_log_references( $value );
				}
				if ( 'exp_ref_type' === $field ) {
					$value = $this->normalize_onboarding_exp_ref_type( $value );
				}
				$settings['hook_prefs'][ $hook_id ][ $field ] = $value;
			}
			if ( ! in_array( $hook_id, $settings['active'], true ) ) {
				$settings['active'][] = $hook_id;
			}
		}

		$settings['active'] = array_values( array_unique( $settings['active'] ) );
		if ( function_exists( 'mycred_update_option' ) ) {
			mycred_update_option( $option_key, $settings );
		} else {
			update_option( $option_key, $settings );
		}
	}

	/**
	 * Move Expiration fields previously saved under core prefs into hook prefs,
	 * and lift General Settings (How to show) into core exp_email.
	 *
	 * @return void
	 */
	public function maybe_migrate_onboarding_expiration_hook_prefs() {
		$core = function_exists( 'mycred_get_option' ) ? mycred_get_option( 'mycred_pref_core', array() ) : get_option( 'mycred_pref_core', array() );
		if ( ! is_array( $core ) ) {
			$core = array();
		}

		$moved   = array();
		$touched = false;

		if ( ! empty( $core['expiration'] ) && is_array( $core['expiration'] ) ) {
			$this->split_expiration_onboarding_bag( $core['expiration'], $core, $moved, $touched );
			unset( $core['expiration'] );
			$touched = true;
		}

		if ( ! empty( $core['mycred-expiration-addon'] ) && is_array( $core['mycred-expiration-addon'] ) ) {
			$this->split_expiration_onboarding_bag( $core['mycred-expiration-addon'], $core, $moved, $touched );
			unset( $core['mycred-expiration-addon'] );
			$touched = true;
		}

		if ( array_key_exists( 'exp_format', $core ) ) {
			if ( empty( $core['exp_email'] ) || ! is_array( $core['exp_email'] ) ) {
				$core['exp_email'] = array();
			}
			$core['exp_email']['exp_format'] = $this->normalize_onboarding_exp_format( $core['exp_format'] );
			unset( $core['exp_format'] );
			$touched = true;
		}

		if ( isset( $core['exp_email']['exp_format'] ) ) {
			$normalized = $this->normalize_onboarding_exp_format( $core['exp_email']['exp_format'] );
			if ( $normalized !== $core['exp_email']['exp_format'] ) {
				$core['exp_email']['exp_format'] = $normalized;
				$touched                         = true;
			}
		}

		if ( ! empty( $moved ) ) {
			$this->apply_onboarding_hook_pref_map( array( 'expiration' => $moved ) );
		}

		if ( $touched ) {
			$this->update_onboarding_pref_core( $core );
		}

		$this->normalize_stored_expiration_hook_prefs();
	}

	/**
	 * Split a misplaced Expiration bag into core exp_email vs hook prefs.
	 *
	 * @param array $bag     Mixed fields.
	 * @param array $core    Core prefs (by ref).
	 * @param array $moved   Hook fields (by ref).
	 * @param bool  $touched Whether core changed (by ref).
	 * @return void
	 */
	protected function split_expiration_onboarding_bag( $bag, &$core, &$moved, &$touched ) {
		if ( ! is_array( $bag ) ) {
			return;
		}

		if ( ! empty( $bag['expiration'] ) && is_array( $bag['expiration'] ) ) {
			$this->split_expiration_onboarding_bag( $bag['expiration'], $core, $moved, $touched );
		}

		if ( ! empty( $bag['exp_email'] ) && is_array( $bag['exp_email'] ) ) {
			$existing            = ( isset( $core['exp_email'] ) && is_array( $core['exp_email'] ) ) ? $core['exp_email'] : array();
			$core['exp_email']   = array_merge( $existing, $bag['exp_email'] );
			$touched             = true;
		}

		if ( array_key_exists( 'exp_format', $bag ) ) {
			if ( empty( $core['exp_email'] ) || ! is_array( $core['exp_email'] ) ) {
				$core['exp_email'] = array();
			}
			$core['exp_email']['exp_format'] = $this->normalize_onboarding_exp_format( $bag['exp_format'] );
			$touched                         = true;
		}

		if ( array_key_exists( 'exp_email.exp_format', $bag ) ) {
			if ( empty( $core['exp_email'] ) || ! is_array( $core['exp_email'] ) ) {
				$core['exp_email'] = array();
			}
			$core['exp_email']['exp_format'] = $this->normalize_onboarding_exp_format( $bag['exp_email.exp_format'] );
			$touched                         = true;
		}

		foreach ( array( 'exp_days', 'log', 'exp_ref_type', 'exp_references' ) as $field ) {
			if ( array_key_exists( $field, $bag ) ) {
				$moved[ $field ] = $bag[ $field ];
			}
		}
	}

	/**
	 * Coerce stored Expiration hook prefs and lift How-to-show into core.
	 *
	 * @return void
	 */
	protected function normalize_stored_expiration_hook_prefs() {
		$option_key = apply_filters( 'mycred_option_id', 'mycred_pref_hooks' );
		$settings   = function_exists( 'mycred_get_option' ) ? mycred_get_option( $option_key, array() ) : get_option( $option_key, array() );
		if ( ! is_array( $settings ) || empty( $settings['hook_prefs']['expiration'] ) || ! is_array( $settings['hook_prefs']['expiration'] ) ) {
			return;
		}

		$exp      = $settings['hook_prefs']['expiration'];
		$changed  = false;
		$core     = function_exists( 'mycred_get_option' ) ? mycred_get_option( 'mycred_pref_core', array() ) : get_option( 'mycred_pref_core', array() );
		if ( ! is_array( $core ) ) {
			$core = array();
		}
		$core_touched = false;

		foreach ( array( 'exp_format', 'exp_email.exp_format' ) as $miskeyed ) {
			if ( ! array_key_exists( $miskeyed, $exp ) ) {
				continue;
			}
			if ( empty( $core['exp_email'] ) || ! is_array( $core['exp_email'] ) ) {
				$core['exp_email'] = array();
			}
			$core['exp_email']['exp_format'] = $this->normalize_onboarding_exp_format( $exp[ $miskeyed ] );
			unset( $settings['hook_prefs']['expiration'][ $miskeyed ] );
			$changed      = true;
			$core_touched = true;
		}

		if ( ! empty( $exp['exp_email'] ) && is_array( $exp['exp_email'] ) ) {
			$existing          = ( isset( $core['exp_email'] ) && is_array( $core['exp_email'] ) ) ? $core['exp_email'] : array();
			$core['exp_email'] = array_merge( $existing, $exp['exp_email'] );
			unset( $settings['hook_prefs']['expiration']['exp_email'] );
			$changed      = true;
			$core_touched = true;
		}

		$current    = isset( $settings['hook_prefs']['expiration']['exp_references'] ) ? $settings['hook_prefs']['expiration']['exp_references'] : array();
		$normalized = $this->normalize_onboarding_log_references( $current );
		if ( ! is_array( $current ) || array_values( $current ) !== $normalized ) {
			$settings['hook_prefs']['expiration']['exp_references'] = $normalized;
			$changed = true;
		}

		if ( $changed ) {
			if ( function_exists( 'mycred_update_option' ) ) {
				mycred_update_option( $option_key, $settings );
			} else {
				update_option( $option_key, $settings );
			}
		}

		if ( $core_touched ) {
			if ( isset( $core['exp_email']['exp_format'] ) ) {
				$core['exp_email']['exp_format'] = $this->normalize_onboarding_exp_format( $core['exp_email']['exp_format'] );
			}
			$this->update_onboarding_pref_core( $core );
		}
	}

	/**
	 * @deprecated Use normalize_stored_expiration_hook_prefs().
	 */
	protected function normalize_stored_expiration_references() {
		$this->normalize_stored_expiration_hook_prefs();
	}

	/**
	 * Derive a simple English singular from a plural display name.
	 *
	 * @param string $plural Plural label.
	 * @return string
	 */
	protected function singularize_onboarding_point_name( $plural ) {
		$plural = trim( $plural );
		if ( '' === $plural ) {
			return $plural;
		}

		if ( preg_match( '/ies$/i', $plural ) ) {
			return preg_replace( '/ies$/i', 'y', $plural );
		}

		if ( preg_match( '/(?:ches|shes|xes|zes|ses)$/i', $plural ) ) {
			return preg_replace( '/es$/i', '', $plural );
		}

		if ( preg_match( '/s$/i', $plural ) && ! preg_match( '/ss$/i', $plural ) ) {
			return preg_replace( '/s$/i', '', $plural );
		}

		return $plural;
	}

	/**
	 * Add s or es so a singular point type name has a plural label.
	 *
	 * @param string $singular Singular label.
	 * @return string
	 */
	protected function pluralize_onboarding_point_name( $singular ) {
		$singular = trim( $singular );
		if ( '' === $singular ) {
			return $singular;
		}

		if ( preg_match( '/[^aeiou]y$/i', $singular ) ) {
			return preg_replace( '/y$/i', 'ies', $singular );
		}

		if ( preg_match( '/(?:s|x|z|ch|sh)$/i', $singular ) ) {
			return $singular . 'es';
		}

		return $singular . 's';
	}

	/**
	 * The typed name is the singular label, unless it is already plural.
	 *
	 * @param string $name Point type name from onboarding.
	 * @return array{singular:string,plural:string}
	 */
	protected function onboarding_point_name_pair( $name ) {
		$name = trim( $name );
		$already_plural = (bool) preg_match( '/s$/i', $name ) && ! preg_match( '/(?:ss|x|z|ch|sh)$/i', $name );

		if ( $already_plural ) {
			return array(
				'singular' => $this->singularize_onboarding_point_name( $name ),
				'plural'   => $name,
			);
		}

		return array(
			'singular' => $name,
			'plural'   => $this->pluralize_onboarding_point_name( $name ),
		);
	}

	/**
	 * Update the default point type display names.
	 *
	 * @param string $name Display name from onboarding.
	 * @return void
	 */
	protected function update_onboarding_point_type_name( $name ) {
		$name = sanitize_text_field( $name );
		if ( '' === $name ) {
			return;
		}

		$pair     = $this->onboarding_point_name_pair( $name );
		$singular = $pair['singular'];
		$name     = $pair['plural'];

		$core = function_exists( 'mycred_get_option' ) ? mycred_get_option( 'mycred_pref_core', array() ) : get_option( 'mycred_pref_core', array() );
		if ( ! is_array( $core ) ) {
			$core = array();
		}
		if ( empty( $core['name'] ) || ! is_array( $core['name'] ) ) {
			$core['name'] = array();
		}

		$core['name']['plural']   = $name;
		$core['name']['singular'] = $singular;

		$this->update_onboarding_pref_core( $core );

		$type_key = defined( 'MYCRED_DEFAULT_TYPE_KEY' ) ? MYCRED_DEFAULT_TYPE_KEY : 'mycred_default';
		$types    = function_exists( 'mycred_get_option' ) ? mycred_get_option( 'mycred_types', array() ) : get_option( 'mycred_types', array() );
		if ( ! is_array( $types ) ) {
			$types = array();
		}
		$types[ $type_key ] = $name;
		if ( function_exists( 'mycred_update_option' ) ) {
			mycred_update_option( 'mycred_types', $types );
		} else {
			update_option( 'mycred_types', $types );
		}
		}

		/**
		 * Starter ranks for a website type.
		 *
		 * @param string $site_type Site type key.
		 * @return array<int, array<string, mixed>>
		 */
		protected function get_onboarding_starter_ranks( $site_type ) {
			$sets = array(
				'store'      => array(
					array( 'title' => 'Bronze Shopper', 'minimum' => 0, 'maximum' => 499, 'description' => 'New and first-time customers.' ),
					array( 'title' => 'Silver Shopper', 'minimum' => 500, 'maximum' => 1999, 'description' => 'Repeat buyers building loyalty.' ),
					array( 'title' => 'Gold Shopper', 'minimum' => 2000, 'maximum' => 9999, 'description' => 'Valued loyal customers.' ),
					array( 'title' => 'Platinum VIP', 'minimum' => 10000, 'maximum' => 9999999, 'description' => 'Top spending VIP customers.' ),
				),
				'lms'        => array(
					array( 'title' => 'Beginner', 'minimum' => 0, 'maximum' => 49, 'description' => 'Just started learning.' ),
					array( 'title' => 'Student', 'minimum' => 50, 'maximum' => 199, 'description' => 'Making steady course progress.' ),
					array( 'title' => 'Scholar', 'minimum' => 200, 'maximum' => 999, 'description' => 'Completing lessons and quizzes.' ),
					array( 'title' => 'Graduate', 'minimum' => 1000, 'maximum' => 4999, 'description' => 'Strong completion record.' ),
					array( 'title' => 'Expert', 'minimum' => 5000, 'maximum' => 9999999, 'description' => 'Master-level learner.' ),
				),
				'membership' => array(
					array( 'title' => 'Member', 'minimum' => 0, 'maximum' => 199, 'description' => 'New and renewing members.' ),
					array( 'title' => 'Silver Member', 'minimum' => 200, 'maximum' => 999, 'description' => 'Active membership activity.' ),
					array( 'title' => 'Gold Member', 'minimum' => 1000, 'maximum' => 4999, 'description' => 'Long-term engaged members.' ),
					array( 'title' => 'VIP', 'minimum' => 5000, 'maximum' => 9999999, 'description' => 'Highest membership tier.' ),
				),
				'community'  => array(
					array( 'title' => 'Newbie', 'minimum' => 0, 'maximum' => 99, 'description' => 'Just joined the community.' ),
					array( 'title' => 'Member', 'minimum' => 100, 'maximum' => 499, 'description' => 'Regular participating member.' ),
					array( 'title' => 'Contributor', 'minimum' => 500, 'maximum' => 1999, 'description' => 'Active contributor.' ),
					array( 'title' => 'Leader', 'minimum' => 2000, 'maximum' => 9999, 'description' => 'Highly engaged community leader.' ),
					array( 'title' => 'Legend', 'minimum' => 10000, 'maximum' => 9999999, 'description' => 'Top-tier community veteran.' ),
				),
				'donations'  => array(
					array( 'title' => 'Supporter', 'minimum' => 0, 'maximum' => 99, 'description' => 'First-time and small donors.' ),
					array( 'title' => 'Patron', 'minimum' => 100, 'maximum' => 999, 'description' => 'Repeat donors.' ),
					array( 'title' => 'Benefactor', 'minimum' => 1000, 'maximum' => 9999999, 'description' => 'Major donors.' ),
				),
				'blog'       => array(
					array( 'title' => 'Reader', 'minimum' => 0, 'maximum' => 49, 'description' => 'Casual visitor.' ),
					array( 'title' => 'Commenter', 'minimum' => 50, 'maximum' => 199, 'description' => 'Engages via comments.' ),
					array( 'title' => 'Author', 'minimum' => 200, 'maximum' => 999, 'description' => 'Publishes content.' ),
					array( 'title' => 'Influencer', 'minimum' => 1000, 'maximum' => 9999999, 'description' => 'Highly active community member.' ),
				),
			);

			$fallback = array(
				array( 'title' => 'Starter', 'minimum' => 0, 'maximum' => 99, 'description' => 'Getting started.' ),
				array( 'title' => 'Regular', 'minimum' => 100, 'maximum' => 499, 'description' => 'Consistent activity.' ),
				array( 'title' => 'Advanced', 'minimum' => 500, 'maximum' => 1999, 'description' => 'Strong engagement.' ),
				array( 'title' => 'Elite', 'minimum' => 2000, 'maximum' => 9999999, 'description' => 'Top-tier status.' ),
			);

			return isset( $sets[ $site_type ] ) ? $sets[ $site_type ] : $fallback;
		}

		/**
		 * Starter badges for a website type.
		 *
		 * @param string $site_type Site type key.
		 * @return array<int, array<string, mixed>>
		 */
		protected function get_onboarding_starter_badges( $site_type ) {
			$sets = array(
				'store'      => array(
					array( 'title' => 'First Purchase', 'description' => 'Completed a first order.', 'manual' => false, 'reference' => 'woocommerce_first_order', 'amount' => '1', 'by' => 'count' ),
					array( 'title' => 'Repeat Buyer', 'description' => 'Placed multiple orders.', 'manual' => false, 'reference' => 'woocommerce_each_order', 'amount' => '5', 'by' => 'count' ),
					array( 'title' => 'Reviewer', 'description' => 'Left product reviews.', 'manual' => false, 'reference' => 'approved_wooreview', 'amount' => '3', 'by' => 'count' ),
					array( 'title' => 'VIP Guest', 'description' => 'Manually awarded to standout customers.', 'manual' => true, 'reference' => '', 'amount' => '', 'by' => '' ),
				),
				'lms'        => array(
					array( 'title' => 'Welcome Student', 'description' => 'Registered to start learning.', 'manual' => false, 'reference' => 'registration', 'amount' => '1', 'by' => 'count' ),
					array( 'title' => 'Dedicated Learner', 'description' => 'Logs in consistently.', 'manual' => false, 'reference' => 'logging_in', 'amount' => '15', 'by' => 'count' ),
					array( 'title' => 'Honor Roll', 'description' => 'Manually awarded to top students.', 'manual' => true, 'reference' => '', 'amount' => '', 'by' => '' ),
				),
				'community'  => array(
					array( 'title' => 'Welcome Aboard', 'description' => 'Registered on the community.', 'manual' => false, 'reference' => 'registration', 'amount' => '1', 'by' => 'count' ),
					array( 'title' => 'Daily Visitor', 'description' => 'Logs in regularly.', 'manual' => false, 'reference' => 'logging_in', 'amount' => '10', 'by' => 'count' ),
					array( 'title' => 'Conversation Starter', 'description' => 'Leaves comments on posts.', 'manual' => false, 'reference' => 'comments', 'amount' => '25', 'by' => 'count' ),
					array( 'title' => 'Community Champion', 'description' => 'Manually awarded to standout members.', 'manual' => true, 'reference' => '', 'amount' => '', 'by' => '' ),
				),
				'membership' => array(
					array( 'title' => 'New Member', 'description' => 'Completed registration.', 'manual' => false, 'reference' => 'registration', 'amount' => '1', 'by' => 'count' ),
					array( 'title' => 'Returning Member', 'description' => 'Logs in regularly.', 'manual' => false, 'reference' => 'logging_in', 'amount' => '10', 'by' => 'count' ),
					array( 'title' => 'Founding Member', 'description' => 'Manually awarded for tenure or upgrades.', 'manual' => true, 'reference' => '', 'amount' => '', 'by' => '' ),
				),
				'blog'       => array(
					array( 'title' => 'New Subscriber', 'description' => 'Registered on the site.', 'manual' => false, 'reference' => 'registration', 'amount' => '1', 'by' => 'count' ),
					array( 'title' => 'Regular Reader', 'description' => 'Visits often.', 'manual' => false, 'reference' => 'site_visit', 'amount' => '7', 'by' => 'count' ),
					array( 'title' => 'Prolific Commenter', 'description' => 'Active in discussions.', 'manual' => false, 'reference' => 'comments', 'amount' => '15', 'by' => 'count' ),
				),
				'donations'  => array(
					array( 'title' => 'First Gift', 'description' => 'Made a first donation.', 'manual' => true, 'reference' => '', 'amount' => '', 'by' => '' ),
					array( 'title' => 'Loyal Donor', 'description' => 'Returns and stays engaged.', 'manual' => false, 'reference' => 'logging_in', 'amount' => '10', 'by' => 'count' ),
				),
			);

			return isset( $sets[ $site_type ] ) ? $sets[ $site_type ] : $sets['community'];
		}

		/**
		 * Attach starter ranks/badges onto recommended add-ons.
		 *
		 * @param array  $payload   Sanitized recommendation.
		 * @param string $site_type Site type key.
		 * @return array
		 */
		protected function attach_onboarding_ranks_badges( $payload, $site_type ) {
			if ( empty( $payload['addons'] ) || ! is_array( $payload['addons'] ) ) {
				return $payload;
			}

			foreach ( $payload['addons'] as &$addon ) {
				if ( empty( $addon['slug'] ) ) {
					continue;
				}
				if ( 'ranks' === $addon['slug'] ) {
					$addon['ranks'] = $this->get_onboarding_starter_ranks( $site_type );
				}
				if ( 'badges' === $addon['slug'] ) {
					$addon['badges'] = $this->get_onboarding_starter_badges( $site_type );
				}
			}
			unset( $addon );

			return $payload;
		}

		/**
		 * Whether a published/draft post with this title already exists.
		 *
		 * @param string $title     Title.
		 * @param string $post_type Post type.
		 * @return bool
		 */
		protected function onboarding_post_title_exists( $title, $post_type ) {
			$query = new WP_Query(
				array(
					'post_type'              => $post_type,
					'title'                  => $title,
					'post_status'            => 'any',
					'posts_per_page'         => 1,
					'fields'                 => 'ids',
					'no_found_rows'          => true,
					'update_post_meta_cache' => false,
					'update_post_term_cache' => false,
				)
			);
			return $query->have_posts();
		}

		/**
		 * Create selected starter ranks.
		 *
		 * @param array  $rows       Rank rows.
		 * @param string $point_type Point type key.
		 * @return string[] Created titles.
		 */
		protected function create_onboarding_ranks( $rows, $point_type ) {
			$created   = array();
			$post_type = defined( 'MYCRED_RANK_KEY' ) ? MYCRED_RANK_KEY : 'mycred_rank';
			$point_type = $point_type ? $point_type : ( defined( 'MYCRED_DEFAULT_TYPE_KEY' ) ? MYCRED_DEFAULT_TYPE_KEY : 'mycred_default' );

			foreach ( (array) $rows as $row ) {
				if ( ! is_array( $row ) ) {
					continue;
				}
				$title = isset( $row['title'] ) ? sanitize_text_field( (string) $row['title'] ) : '';
				if ( '' === $title || $this->onboarding_post_title_exists( $title, $post_type ) ) {
					continue;
				}
				$rank_id = wp_insert_post(
					array(
						'post_title'  => $title,
						'post_type'   => $post_type,
						'post_status' => 'publish',
						'post_content'=> isset( $row['description'] ) ? sanitize_textarea_field( (string) $row['description'] ) : '',
					),
					true
				);
				if ( is_wp_error( $rank_id ) || ! $rank_id ) {
					continue;
				}
				$minimum = isset( $row['minimum'] ) ? $row['minimum'] : 0;
				$maximum = isset( $row['maximum'] ) ? $row['maximum'] : 0;
				if ( function_exists( 'mycred' ) ) {
					$mycred  = mycred( $point_type );
					$minimum = $mycred->number( $minimum );
					$maximum = $mycred->number( $maximum );
				}
				$meta = function_exists( 'mycred_update_post_meta' ) ? 'mycred_update_post_meta' : 'update_post_meta';
				call_user_func( $meta, $rank_id, 'ctype', $point_type );
				call_user_func( $meta, $rank_id, 'mycred_rank_min', $minimum );
				call_user_func( $meta, $rank_id, 'mycred_rank_max', $maximum );
				$created[] = $title;
			}

			return $created;
		}

		/**
		 * Create selected starter badges.
		 *
		 * @param array  $rows       Badge rows.
		 * @param string $point_type Point type key.
		 * @return string[] Created titles.
		 */
		protected function create_onboarding_badges( $rows, $point_type ) {
			$created    = array();
			$post_type  = defined( 'MYCRED_BADGE_KEY' ) ? MYCRED_BADGE_KEY : 'mycred_badge';
			$point_type = $point_type ? $point_type : ( defined( 'MYCRED_DEFAULT_TYPE_KEY' ) ? MYCRED_DEFAULT_TYPE_KEY : 'mycred_default' );

			foreach ( (array) $rows as $row ) {
				if ( ! is_array( $row ) ) {
					continue;
				}
				$title = isset( $row['title'] ) ? sanitize_text_field( (string) $row['title'] ) : '';
				if ( '' === $title || $this->onboarding_post_title_exists( $title, $post_type ) ) {
					continue;
				}
				$description = isset( $row['description'] ) ? sanitize_textarea_field( (string) $row['description'] ) : '';
				$badge_id    = wp_insert_post(
					array(
						'post_title'   => $title,
						'post_content' => $description,
						'post_status'  => 'publish',
						'post_type'    => $post_type,
					),
					true
				);
				if ( is_wp_error( $badge_id ) || ! $badge_id ) {
					continue;
				}

				$manual    = ! empty( $row['manual'] );
				$reference = isset( $row['reference'] ) ? sanitize_key( (string) $row['reference'] ) : '';
				$amount    = isset( $row['amount'] ) ? sanitize_text_field( (string) $row['amount'] ) : '1';
				$by        = isset( $row['by'] ) ? sanitize_key( (string) $row['by'] ) : 'count';
				$requires  = array();
				if ( ! $manual && '' !== $reference ) {
					$requires[] = array(
						'type'      => $point_type,
						'reference' => $reference,
						'amount'    => '' !== $amount ? $amount : '1',
						'by'        => '' !== $by ? $by : 'count',
						'specific'  => '',
					);
				}

				$levels = array(
					array(
						'attachment_id' => 0,
						'image_url'     => '',
						'label'         => __( 'Level 1', 'mycred' ),
						'compare'       => 'AND',
						'requires'      => $requires,
						'reward'        => array(
							'type'   => '',
							'log'    => '',
							'amount' => '',
						),
					),
				);

				$meta = function_exists( 'mycred_update_post_meta' ) ? 'mycred_update_post_meta' : 'update_post_meta';
				call_user_func( $meta, $badge_id, 'badge_prefs', $levels );
				call_user_func( $meta, $badge_id, 'manual_badge', $manual ? 1 : 0 );
				call_user_func( $meta, $badge_id, 'open_badge', 0 );
				call_user_func( $meta, $badge_id, 'congratulation_msg', sprintf( __( 'Congratulations! You earned the %s badge.', 'mycred' ), $title ) );
				call_user_func( $meta, $badge_id, 'main_image', '' );
				call_user_func( $meta, $badge_id, 'mycred_badge_align', 'mycred_align_none' );
				call_user_func( $meta, $badge_id, 'mycred_layout_check', 'mycred_layout_none' );

				if ( function_exists( 'mycred_delete_option' ) ) {
					mycred_delete_option( 'mycred-badge-refs-' . $point_type );
				}
				$created[] = $title;
			}

			return $created;
		}

	/**
	 * AJAX: apply selected onboarding add-ons, hooks, and point type name.
	 *
	 * @return void
	 */
	public function handle_onboarding_apply_ajax() {
		check_ajax_referer( 'mycred_ai_onboarding_apply', 'nonce' );

		if ( ! $this->permission_callback( null ) ) {
			wp_send_json_error( array( 'message' => __( 'Forbidden: insufficient permissions.', 'mycred' ) ), 403 );
		}

		$addons_raw   = isset( $_POST['addons'] ) ? wp_unslash( $_POST['addons'] ) : '[]';
		$hooks_raw    = isset( $_POST['hooks'] ) ? wp_unslash( $_POST['hooks'] ) : '[]';
		$settings_raw = isset( $_POST['settings'] ) ? wp_unslash( $_POST['settings'] ) : '[]';
		$checkout_raw = isset( $_POST['checkout'] ) ? wp_unslash( $_POST['checkout'] ) : '[]';
		$ranks_raw    = isset( $_POST['ranks'] ) ? wp_unslash( $_POST['ranks'] ) : '[]';
		$badges_raw   = isset( $_POST['badges'] ) ? wp_unslash( $_POST['badges'] ) : '[]';
		$point_name   = isset( $_POST['point_name'] ) ? sanitize_text_field( wp_unslash( $_POST['point_name'] ) ) : '';
		$point_key    = isset( $_POST['point_key'] ) ? sanitize_key( wp_unslash( $_POST['point_key'] ) ) : '';

		$addons   = json_decode( $addons_raw, true );
		$hooks    = json_decode( $hooks_raw, true );
		$settings = json_decode( $settings_raw, true );
		$checkout = json_decode( $checkout_raw, true );
		$ranks    = json_decode( $ranks_raw, true );
		$badges   = json_decode( $badges_raw, true );
		if ( ! is_array( $addons ) ) {
			$addons = array();
		}
		if ( ! is_array( $hooks ) ) {
			$hooks = array();
		}
		if ( ! is_array( $settings ) ) {
			$settings = array();
		}
		if ( ! is_array( $checkout ) ) {
			$checkout = array();
		}
		if ( ! is_array( $ranks ) ) {
			$ranks = array();
		}
		if ( ! is_array( $badges ) ) {
			$badges = array();
		}

		$this->update_onboarding_point_type_name( $point_name );
		$selected_addons = $this->onboarding_selected_addon_slugs( $addons );
		$addons_enabled  = $this->enable_onboarding_addons( $selected_addons );
		$skipped         = isset( $addons_enabled['skipped'] ) && is_array( $addons_enabled['skipped'] ) ? $addons_enabled['skipped'] : array();
		$addons          = $selected_addons;
		if ( ! empty( $skipped ) ) {
			$addons    = array_values( array_diff( $selected_addons, $skipped ) );
			$settings  = $this->filter_onboarding_rows_not_in_addons( $settings, $skipped );
			$checkout  = $this->filter_onboarding_rows_not_in_addons( $checkout, $skipped );
		}
		$hooks_enabled    = $this->enable_onboarding_hooks( $hooks );
		$partial_on       = $this->onboarding_partial_payments_enabled( $settings ) || $this->onboarding_partial_payments_enabled( $checkout );
		$settings         = $this->filter_onboarding_partial_payment_rows( $settings, $partial_on );
		$checkout         = $this->filter_onboarding_partial_payment_rows( $checkout, $partial_on );
		$woo_pay_on       = $this->onboarding_woo_payments_enabled( $settings ) || $this->onboarding_woo_payments_enabled( $checkout );
		$settings         = $this->filter_onboarding_woo_payment_rows( $settings, $woo_pay_on );
		$checkout         = $this->filter_onboarding_woo_payment_rows( $checkout, $woo_pay_on );
		$referral_on      = $this->onboarding_hook_selected( $hooks, 'product_referral' );
		$settings         = $this->filter_onboarding_product_referral_rows( $settings, $referral_on );
		$checkout         = $this->filter_onboarding_product_referral_rows( $checkout, $referral_on );
		$settings_written = $this->apply_onboarding_setting_rows( $settings, false );
		$checkout_written = $this->apply_onboarding_setting_rows( $checkout, true );
		$this->apply_level_cred_onboarding_prefs( in_array( 'mycred-level-cred', $selected_addons, true ) );
		$point_type       = defined( 'MYCRED_DEFAULT_TYPE_KEY' ) ? MYCRED_DEFAULT_TYPE_KEY : 'mycred_default';
		$ranks_created    = in_array( 'ranks', $addons, true ) ? $this->create_onboarding_ranks( $ranks, $point_type ) : array();
		$badges_created   = in_array( 'badges', $addons, true ) ? $this->create_onboarding_badges( $badges, $point_type ) : array();

		if ( function_exists( 'mycred_mark_tour_guide_completed' ) ) {
			mycred_mark_tour_guide_completed();
		}

		wp_send_json_success(
			array(
				'addons'  => $addons_enabled,
				'hooks'   => $hooks_enabled,
				'settings'=> $settings_written,
				'checkout'=> $checkout_written,
				'ranks'   => $ranks_created,
				'badges'  => $badges_created,
			)
		);
	}
}
