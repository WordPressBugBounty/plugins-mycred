<?php
/**
 * General Settings AI ability helpers (get, update).
 *
 * @package myCred
 * @subpackage AI
 * @since 1.0.3
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

trait myCRED_AI_General_Settings_Trait {

	/**
	 * Whether a settings key looks like a secret.
	 *
	 * @param string $key Array key or dotted path segment.
	 * @return bool
	 */
	protected function is_secret_setting_key( $key ) {
		$key = strtolower( (string) $key );
		if ( in_array( $key, array( 'key', 'api_key', 'apikey' ), true ) ) {
			return true;
		}
		foreach ( array( 'token', 'secret', 'password', 'access_token' ) as $needle ) {
			if ( false !== strpos( $key, $needle ) ) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Recursively redact secret values for get responses.
	 *
	 * @param mixed $data Data.
	 * @return mixed
	 */
	protected function redact_settings_tree( $data ) {
		if ( ! is_array( $data ) ) {
			return $data;
		}
		$out = array();
		foreach ( $data as $key => $value ) {
			if ( is_array( $value ) && $this->is_assoc_array( $value ) ) {
				$out[ $key ] = $this->redact_settings_tree( $value );
			} elseif ( $this->is_secret_setting_key( $key ) ) {
				$out[ $key ] = $this->redact_secret_setting( $value );
			} else {
				$out[ $key ] = $value;
			}
		}
		return $out;
	}

	/**
	 * Recursively sanitize a settings tree.
	 *
	 * @param mixed $value Raw value.
	 * @return mixed
	 */
	protected function sanitize_settings_tree( $value ) {
		if ( is_array( $value ) ) {
			$out = array();
			foreach ( $value as $key => $child ) {
				$clean_key         = is_string( $key ) ? sanitize_text_field( $key ) : $key;
				$out[ $clean_key ] = $this->sanitize_settings_tree( $child );
			}
			return $out;
		}
		if ( is_bool( $value ) ) {
			return $value ? 1 : 0;
		}
		if ( is_int( $value ) || is_float( $value ) ) {
			return $value;
		}
		if ( is_string( $value ) && is_numeric( $value ) && preg_match( '/^-?\d+(\.\d+)?$/', $value ) ) {
			return false !== strpos( $value, '.' ) ? (float) $value : (int) $value;
		}
		if ( ! is_scalar( $value ) ) {
			return '';
		}
		$str = (string) $value;
		if ( $str !== wp_strip_all_tags( $str ) ) {
			return wp_kses_post( $str );
		}
		return sanitize_text_field( $str );
	}

	/**
	 * Deep-merge overlay into base (associative arrays only).
	 *
	 * @param array $base    Base by reference.
	 * @param array $overlay Overlay.
	 * @return void
	 */
	protected function merge_settings_tree( &$base, $overlay ) {
		if ( ! is_array( $base ) ) {
			$base = array();
		}
		if ( ! is_array( $overlay ) ) {
			return;
		}
		foreach ( $overlay as $key => $value ) {
			if (
				is_array( $value )
				&& $this->is_assoc_array( $value )
				&& isset( $base[ $key ] )
				&& is_array( $base[ $key ] )
				&& $this->is_assoc_array( $base[ $key ] )
			) {
				$this->merge_settings_tree( $base[ $key ], $value );
			} else {
				$base[ $key ] = $value;
			}
		}
	}

	/**
	 * Whether free myCred Addons is active.
	 *
	 * @return bool
	 */
	public function is_toolkit_free_plugin_active() {
		if ( defined( 'MYCRED_TOOLKIT_ROOT_DIR' ) ) {
			return true;
		}
		return $this->is_wp_plugin_active(
			array(
				'mycred-toolkit/mycred-toolkit.php',
				'myCred-toolkit/mycred-toolkit.php',
			)
		);
	}

	/**
	 * Whether myCred Addons Pro is active.
	 *
	 * @return bool
	 */
	public function is_toolkit_pro_plugin_active() {
		if ( defined( 'MYCRED_TOOLKIT_ROOT_DIR_PRO' ) ) {
			return true;
		}
		return $this->is_wp_plugin_active(
			array(
				'mycred-toolkit-pro/mycred-toolkit-pro.php',
				'myCred-toolkit-pro/mycred-toolkit-pro.php',
			)
		);
	}

	/**
	 * Whether any listed WP plugin basename is active.
	 *
	 * @param string[] $candidates Plugin basenames.
	 * @return bool
	 */
	protected function is_wp_plugin_active( $candidates ) {
		if ( ! function_exists( 'is_plugin_active' ) ) {
			$plugin_file = ABSPATH . 'wp-admin/includes/plugin.php';
			if ( file_exists( $plugin_file ) ) {
				require_once $plugin_file;
			}
		}
		if ( ! function_exists( 'is_plugin_active' ) ) {
			return false;
		}
		foreach ( (array) $candidates as $plugin ) {
			if ( is_plugin_active( $plugin ) ) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Whether free myCred Addons or myCred Addons Pro is active (required for myCred Addons add-ons).
	 *
	 * @return bool
	 */
	public function is_toolkit_plugin_active() {
		return $this->is_toolkit_free_plugin_active() || $this->is_toolkit_pro_plugin_active();
	}

	/**
	 * Whether a myCred Addons add-on slug is listed as enabled in options (ignores plugin state).
	 *
	 * @param string $slug myCred Addons add-on slug (e.g. mycred-zapier).
	 * @return bool
	 */
	public function is_toolkit_addon_listed_enabled( $slug ) {
		$enabled = get_option( 'mycred_enabled_addons', array() );
		if ( ! is_array( $enabled ) ) {
			return false;
		}
		return in_array( $slug, $enabled, true );
	}

	/**
	 * Whether a myCred Addons add-on is usable (free/Pro active AND addon enabled).
	 *
	 * @param string $slug myCred Addons add-on slug (e.g. mycred-zapier).
	 * @return bool
	 */
	public function is_toolkit_addon_active( $slug ) {
		if ( ! $this->is_toolkit_plugin_active() ) {
			return false;
		}
		return $this->is_toolkit_addon_listed_enabled( $slug );
	}

	/**
	 * Human-readable blocker when a myCred Addons-gated setting cannot be used.
	 *
	 * @param string $toolkit_addon_slug myCred Addons add-on slug.
	 * @return string
	 */
	protected function get_toolkit_addon_block_reason( $toolkit_addon_slug ) {
		if ( ! $this->is_toolkit_plugin_active() ) {
			return sprintf(
				/* translators: %s: myCred Addons add-on slug */
				__( 'Neither myCred Addons nor myCred Addons Pro is active. Activate myCred Addons Pro, or use mycred/ensure-toolkit-plugin (confirm=true) for free myCred Addons, then enable the "%s" add-on with mycred/enable-addon (type=toolkit) before changing these settings.', 'mycred' ),
				$toolkit_addon_slug
			);
		}

		return sprintf(
			/* translators: %s: myCred Addons add-on slug */
			__( 'Requires myCred Addons add-on "%s" to be enabled. Use mycred/enable-addon with type=toolkit.', 'mycred' ),
			$toolkit_addon_slug
		);
	}

	/**
	 * Resolve option key for core prefs by point type.
	 *
	 * @param string $point_type Point type key.
	 * @return string
	 */
	protected function get_core_option_key( $point_type ) {
		if ( empty( $point_type ) || $point_type === MYCRED_DEFAULT_TYPE_KEY ) {
			return 'mycred_pref_core';
		}
		return 'mycred_pref_core_' . sanitize_key( $point_type );
	}

	/**
	 * Get nested value from array by dotted path.
	 *
	 * @param array  $data Data.
	 * @param string $path Dotted path.
	 * @return mixed|null
	 */
	protected function get_nested_setting_value( $data, $path ) {
		if ( ! is_array( $data ) || '' === $path ) {
			return null;
		}
		$parts = explode( '.', $path );
		$cur   = $data;
		foreach ( $parts as $part ) {
			if ( ! is_array( $cur ) || ! array_key_exists( $part, $cur ) ) {
				return null;
			}
			$cur = $cur[ $part ];
		}
		return $cur;
	}

	/**
	 * Set nested value on array by dotted path.
	 *
	 * @param array  $data  Data by reference.
	 * @param string $path  Dotted path.
	 * @param mixed  $value Value.
	 * @return void
	 */
	protected function set_nested_setting_value( &$data, $path, $value ) {
		if ( ! is_array( $data ) ) {
			$data = array();
		}
		$parts = explode( '.', $path );
		$cur   = &$data;
		$last  = count( $parts ) - 1;
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
	 * Whether an array is associative.
	 *
	 * @param array $arr Array.
	 * @return bool
	 */
	protected function is_assoc_array( $arr ) {
		if ( ! is_array( $arr ) || array() === $arr ) {
			return false;
		}
		return array_keys( $arr ) !== range( 0, count( $arr ) - 1 );
	}

	/**
	 * Flatten nested settings into dotted paths.
	 *
	 * @param array  $data   Nested data.
	 * @param string $prefix Path prefix.
	 * @return array<string, mixed>
	 */
	protected function flatten_settings_input( $data, $prefix = '' ) {
		$out = array();
		if ( ! is_array( $data ) ) {
			return $out;
		}
		foreach ( $data as $key => $value ) {
			$path = ( '' === $prefix ) ? (string) $key : $prefix . '.' . $key;
			if ( is_array( $value ) && $this->is_assoc_array( $value ) ) {
				$out = array_merge( $out, $this->flatten_settings_input( $value, $path ) );
			} else {
				$out[ $path ] = $value;
			}
		}
		return $out;
	}

	/**
	 * Build nested array from dotted path => value map.
	 *
	 * @param array<string, mixed> $flat Flat map.
	 * @return array
	 */
	protected function nest_settings_output( $flat ) {
		$nested = array();
		foreach ( $flat as $path => $value ) {
			$this->set_nested_setting_value( $nested, $path, $value );
		}
		return $nested;
	}

	/**
	 * Sanitize a single setting value by registry type.
	 *
	 * @param array $field Field definition.
	 * @param mixed $value Raw value.
	 * @return mixed|WP_Error
	 */
	protected function sanitize_general_setting_value( $field, $value ) {
		$type = isset( $field['type'] ) ? $field['type'] : 'text';

		switch ( $type ) {
			case 'bool01':
				return ( empty( $value ) || '0' === $value || false === $value || 'false' === $value ) ? 0 : 1;

			case 'int':
				return absint( $value );

			case 'float':
				return (float) $value;

			case 'email':
				$email = sanitize_email( is_scalar( $value ) ? (string) $value : '' );
				return $email;

			case 'key':
				return sanitize_key( is_scalar( $value ) ? (string) $value : '' );

			case 'whitespace_char':
				$char = is_scalar( $value ) ? (string) $value : '';
				if ( strlen( $char ) > 1 ) {
					$char = substr( $char, 0, 1 );
				}
				return $char;

			case 'csv_ids':
				if ( is_array( $value ) ) {
					$ids = array_filter( array_map( 'absint', $value ) );
					return implode( ',', $ids );
				}
				$parts = array_filter( array_map( 'absint', explode( ',', (string) $value ) ) );
				return implode( ',', $parts );

			case 'csv_roles':
				if ( is_array( $value ) ) {
					$roles = array_filter( array_map( 'sanitize_key', $value ) );
					return implode( ',', $roles );
				}
				$parts = array_filter( array_map( 'sanitize_key', explode( ',', (string) $value ) ) );
				return implode( ',', $parts );

			case 'array_list':
				if ( ! is_array( $value ) ) {
					if ( is_string( $value ) && '' !== $value ) {
						$value = array_map( 'trim', explode( ',', $value ) );
					} else {
						$value = array();
					}
				}
				return array_values( array_filter( array_map( 'sanitize_text_field', $value ) ) );

			case 'point_type_list':
				return $this->sanitize_point_type_list_value( $value );

			case 'enum':
				$allowed = isset( $field['enum'] ) && is_array( $field['enum'] ) ? $field['enum'] : array();
				$raw     = is_scalar( $value ) ? (string) $value : '';
				if ( in_array( $raw, $allowed, true ) ) {
					return $raw;
				}
				if ( array_key_exists( 'default', $field ) ) {
					return $field['default'];
				}
				return new WP_Error(
					'invalid_enum',
					sprintf(
						/* translators: 1: field label, 2: allowed values */
						__( 'Invalid value for %1$s. Allowed: %2$s', 'mycred' ),
						isset( $field['label'] ) ? $field['label'] : 'field',
						implode( ', ', $allowed )
					)
				);

			case 'html':
				return wp_kses_post( is_scalar( $value ) ? (string) $value : '' );

			case 'textarea':
				return sanitize_textarea_field( is_scalar( $value ) ? (string) $value : '' );

			case 'text':
			default:
				$text = sanitize_text_field( is_scalar( $value ) ? (string) $value : '' );
				// Capability fields must not be emptied.
				if ( isset( $field['label'] ) && false !== stripos( $field['label'], 'capability' ) && '' === $text ) {
					return new WP_Error( 'empty_cap', __( 'Capability values cannot be empty.', 'mycred' ) );
				}
				return $text;
		}
	}

	/**
	 * Deep-copy an array so we never mutate WordPress option cache in place.
	 *
	 * @param mixed $data Data.
	 * @return mixed
	 */
	protected function deep_copy_option_value( $data ) {
		if ( ! is_array( $data ) && ! is_object( $data ) ) {
			return $data;
		}
		// serialize/unserialize detaches nested references more reliably than JSON for WP options.
		// phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.serialize_serialize,WordPress.PHP.DiscouragedPHPFunctions.serialize_unserialize
		$copied = unserialize( serialize( $data ) );
		if ( is_array( $copied ) || is_object( $copied ) ) {
			return $copied;
		}
		return is_array( $data ) ? array() : $data;
	}

	/**
	 * Bust WordPress option caches for a single option.
	 *
	 * @param string $option_id Option name.
	 * @return void
	 */
	protected function bust_option_caches( $option_id ) {
		if ( ! function_exists( 'wp_cache_delete' ) ) {
			return;
		}
		wp_cache_delete( $option_id, 'options' );
		wp_cache_delete( 'alloptions', 'options' );
		wp_cache_delete( 'notoptions', 'options' );
	}

	/**
	 * Persist an option array and bust caches so the next read hits the DB.
	 *
	 * @param string $option_id Option name.
	 * @param array  $value     Value to store.
	 * @return bool
	 */
	protected function persist_option_array( $option_id, $value ) {
		$value = $this->deep_copy_option_value( $value );

		$this->bust_option_caches( $option_id );

		$result = mycred_update_option( $option_id, $value );

		$this->bust_option_caches( $option_id );
		$after_raw = mycred_get_option( $option_id, null );

		// WordPress update_option can no-op (cache/reference); force a DB write when the value did not stick.
		if ( maybe_serialize( $value ) !== maybe_serialize( $after_raw ) && isset( $GLOBALS['wpdb'] ) ) {
			global $wpdb;
			$serialized = maybe_serialize( $value );
			// Two-step write so MySQL always reports rows changed (avoids 0-row false).
			$wpdb->update(
				$wpdb->options,
				array( 'option_value' => maybe_serialize( array( '_mycred_ai_persist_probe' => microtime( true ) ) ) ),
				array( 'option_name' => $option_id )
			);
			$rows = $wpdb->update(
				$wpdb->options,
				array( 'option_value' => $serialized ),
				array( 'option_name' => $option_id )
			);
			$this->bust_option_caches( $option_id );
			$result = ( false !== $rows );
		}

		return (bool) $result;
	}

	/**
	 * Fresh option read after cache bust.
	 *
	 * @param string $option_id Option name.
	 * @param mixed  $default   Default.
	 * @return mixed
	 */
	protected function get_option_fresh( $option_id, $default = array() ) {
		if ( function_exists( 'wp_cache_delete' ) ) {
			wp_cache_delete( $option_id, 'options' );
			wp_cache_delete( 'alloptions', 'options' );
			wp_cache_delete( 'notoptions', 'options' );
		}
		return mycred_get_option( $option_id, $default );
	}

	/**
	 * Resolve a point type key from a key or label (e.g. Coins â†’ coins).
	 *
	 * @param mixed $input Raw key or label.
	 * @return string|false
	 */
	protected function resolve_point_type_key( $input ) {
		if ( ! is_scalar( $input ) ) {
			return false;
		}

		$raw = trim( (string) $input );
		if ( '' === $raw ) {
			return false;
		}

		$key = sanitize_key( $raw );
		if ( function_exists( 'mycred_point_type_exists' ) && mycred_point_type_exists( $key ) ) {
			return $key;
		}

		if ( ! function_exists( 'mycred_get_types' ) ) {
			return false;
		}

		$types = mycred_get_types( true );
		if ( ! is_array( $types ) || empty( $types ) ) {
			return false;
		}

		if ( isset( $types[ $key ] ) ) {
			return $key;
		}
		if ( isset( $types[ $raw ] ) ) {
			return $raw;
		}

		// mycred_coins â†” coins style aliases.
		$candidates = array( $key );
		if ( 0 === strpos( $key, 'mycred_' ) ) {
			$candidates[] = substr( $key, strlen( 'mycred_' ) );
		} else {
			$candidates[] = 'mycred_' . $key;
		}

		$raw_lower = strtolower( $raw );
		foreach ( $types as $type_key => $label ) {
			$type_key_s = (string) $type_key;
			if ( in_array( $type_key_s, $candidates, true ) ) {
				return $type_key_s;
			}
			if ( strtolower( (string) $label ) === $raw_lower ) {
				return $type_key_s;
			}
			if ( sanitize_key( (string) $label ) === $key ) {
				return $type_key_s;
			}
			// Suffix match: requested "coins" matches stored "mycred_coins".
			foreach ( $candidates as $candidate ) {
				if ( '' !== $candidate && $type_key_s === $candidate ) {
					return $type_key_s;
				}
				if ( '' !== $candidate && substr( $type_key_s, -1 * strlen( $candidate ) ) === $candidate && ( strlen( $type_key_s ) === strlen( $candidate ) || '_' === substr( $type_key_s, -1 * strlen( $candidate ) - 1, 1 ) ) ) {
					return $type_key_s;
				}
			}
			if ( function_exists( 'mycred_get_point_type_name' ) ) {
				$singular = strtolower( (string) mycred_get_point_type_name( $type_key_s, true ) );
				$plural   = strtolower( (string) mycred_get_point_type_name( $type_key_s, false ) );
				if ( $singular === $raw_lower || $plural === $raw_lower ) {
					return $type_key_s;
				}
			}
		}

		return false;
	}

	/**
	 * Sanitize a list of point type keys/labels into valid keys.
	 *
	 * @param mixed $value Raw value.
	 * @return array|WP_Error
	 */
	protected function sanitize_point_type_list_value( $value ) {
		if ( ! is_array( $value ) ) {
			if ( is_string( $value ) && '' !== $value ) {
				$value = array_map( 'trim', explode( ',', $value ) );
			} else {
				$value = array();
			}
		}

		// Associative enable-map should already be normalized, but handle defensively.
		if ( $this->is_assoc_array( $value ) ) {
			$normalized = $this->normalize_buycred_types_value( $value );
			$value       = $normalized['types'];
		}

		$valid   = array();
		$invalid = array();
		foreach ( $value as $item ) {
			if ( is_array( $item ) ) {
				$invalid[] = wp_json_encode( $item );
				continue;
			}
			$resolved = $this->resolve_point_type_key( $item );
			if ( $resolved ) {
				$valid[] = $resolved;
			} else {
				$invalid[] = (string) $item;
			}
		}

		$valid = array_values( array_unique( $valid ) );

		$available = function_exists( 'mycred_get_types' ) ? array_keys( (array) mycred_get_types( true ) ) : array( MYCRED_DEFAULT_TYPE_KEY );

		// Any unresolved key is a hard failure â€” never silently keep only mycred_default.
		if ( ! empty( $invalid ) ) {
			return new WP_Error(
				'invalid_point_types',
				sprintf(
					/* translators: 1: invalid values, 2: resolved keys, 3: available keys */
					__( 'Could not resolve buyCRED point type(s): %1$s. Resolved: %2$s. Available keys on this site: %3$s. Use exact keys from buycred_available_point_types.', 'mycred' ),
					implode( ', ', $invalid ),
					! empty( $valid ) ? implode( ', ', $valid ) : __( '(none)', 'mycred' ),
					implode( ', ', $available )
				)
			);
		}

		if ( empty( $valid ) ) {
			return new WP_Error(
				'invalid_point_types',
				sprintf(
					/* translators: %s: available keys */
					__( 'No buyCRED point types provided. Available keys on this site: %s', 'mycred' ),
					implode( ', ', $available )
				)
			);
		}

		return $valid;
	}

	/**
	 * Normalize buyCRED types input from list, CSV, or checkbox/object form.
	 *
	 * @param mixed $types Raw types value.
	 * @return array{types: string[], sale_setup: array<string, array>}
	 */
	protected function normalize_buycred_types_value( $types ) {
		$result = array(
			'types'      => array(),
			'sale_setup' => array(),
		);

		if ( is_string( $types ) ) {
			$types = array_filter( array_map( 'trim', explode( ',', $types ) ) );
		}

		if ( ! is_array( $types ) ) {
			return $result;
		}

		// Numeric list of keys/labels â€” keep raw values; sanitize resolves/validates later.
		if ( ! $this->is_assoc_array( $types ) ) {
			$result['types'] = array_values( $types );
			return $result;
		}

		// Associative: { coins: true } or { coins: { enabled: 1, min: "1", max: "", time: "day" } }.
		foreach ( $types as $maybe_key => $value ) {
			$enabled = false;
			$setup   = array();

			if ( is_array( $value ) ) {
				if ( array_key_exists( 'enabled', $value ) ) {
					$enabled = ! empty( $value['enabled'] ) && '0' !== $value['enabled'] && false !== $value['enabled'] && 'false' !== $value['enabled'];
				} else {
					// Nested setup without explicit enabled â‡’ treat as enable intent.
					$enabled = true;
				}

				if ( isset( $value['min'] ) ) {
					$setup['min'] = $value['min'];
				}
				if ( isset( $value['max'] ) ) {
					$setup['max'] = $value['max'];
				}
				if ( isset( $value['time'] ) ) {
					$setup['time'] = $value['time'];
				}
			} else {
				$enabled = ! empty( $value ) && '0' !== $value && false !== $value && 'false' !== $value;
			}

			if ( ! $enabled ) {
				continue;
			}

			$key = $this->resolve_point_type_key( $maybe_key );
			if ( ! $key ) {
				// Keep raw key so sanitize can hard-fail instead of silently dropping.
				$result['types'][] = (string) $maybe_key;
				continue;
			}

			$result['types'][] = $key;
			if ( ! empty( $setup ) ) {
				$result['sale_setup'][ $key ] = $setup;
			}
		}

		$result['types'] = array_values( array_unique( $result['types'] ) );
		return $result;
	}

	/**
	 * Normalize settings payload before flatten (buyCRED Sale Setup shapes, etc.).
	 *
	 * @param array $settings Nested settings.
	 * @return array
	 */
	protected function normalize_general_settings_input( $settings ) {
		if ( ! is_array( $settings ) ) {
			return array();
		}

		if ( isset( $settings['buy_creds'] ) && is_array( $settings['buy_creds'] ) && array_key_exists( 'types', $settings['buy_creds'] ) ) {
			$normalized = $this->normalize_buycred_types_value( $settings['buy_creds']['types'] );
			$settings['buy_creds']['types'] = $normalized['types'];

			if ( ! empty( $normalized['sale_setup'] ) ) {
				if ( empty( $settings['buy_creds']['sale_setup'] ) || ! is_array( $settings['buy_creds']['sale_setup'] ) ) {
					$settings['buy_creds']['sale_setup'] = array();
				}
				foreach ( $normalized['sale_setup'] as $type_id => $setup ) {
					$existing = isset( $settings['buy_creds']['sale_setup'][ $type_id ] ) && is_array( $settings['buy_creds']['sale_setup'][ $type_id ] )
						? $settings['buy_creds']['sale_setup'][ $type_id ]
						: array();
					$settings['buy_creds']['sale_setup'][ $type_id ] = array_merge( $existing, $setup );
				}
			}
		}

		return $settings;
	}

	/**
	 * Redact secret values for get responses.
	 *
	 * @param mixed $value Current value.
	 * @return array
	 */
	protected function redact_secret_setting( $value ) {
		$configured = ! ( null === $value || '' === $value || array() === $value );
		return array(
			'configured' => $configured,
			'value'      => $configured ? '***' : '',
		);
	}

	/**
	 * Ability: Get General Settings.
	 *
	 * @param array $input Input.
	 * @return array|WP_Error
	 */
	public function execute_get_general_settings( $input ) {
		$section    = isset( $input['section'] ) ? sanitize_key( $input['section'] ) : '';
		$point_type = isset( $input['point_type'] ) ? sanitize_text_field( $input['point_type'] ) : MYCRED_DEFAULT_TYPE_KEY;

		if ( function_exists( 'mycred_point_type_exists' ) && ! mycred_point_type_exists( $point_type ) ) {
			$point_type = MYCRED_DEFAULT_TYPE_KEY;
		}

		$core_option = $this->get_core_option_key( $point_type );
		$core_prefs  = mycred_get_option( $core_option, array() );
		if ( ! is_array( $core_prefs ) ) {
			$core_prefs = array();
		}
		$remote_prefs = function_exists( 'mycred_get_remote' ) ? mycred_get_remote() : mycred_get_option( 'mycred_pref_remote', array() );
		if ( ! is_array( $remote_prefs ) ) {
			$remote_prefs = array();
		}

		$settings = $core_prefs;
		if ( ! empty( $remote_prefs ) ) {
			$settings['remote'] = $remote_prefs;
		}

		if ( '' !== $section ) {
			if ( ! array_key_exists( $section, $settings ) ) {
				return new WP_Error(
					'no_settings',
					sprintf( __( 'No settings found for section "%s".', 'mycred' ), $section )
				);
			}
			$settings = $settings[ $section ];
			if ( ! is_array( $settings ) ) {
				$settings = array( $section => $settings );
			}
		}

		return array(
			'success'    => true,
			'point_type' => $point_type,
			'section'    => '' !== $section ? $section : 'all',
			'settings'   => $this->redact_settings_tree( $settings ),
			'message'    => __( 'Retrieved general settings. Secret values are redacted.', 'mycred' ),
		);
	}

	/**
	 * Ability: Update General Settings.
	 *
	 * @param array $input Input.
	 * @return array|WP_Error
	 */
	public function execute_update_general_settings( $input ) {
		$settings_in = isset( $input['settings'] ) && is_array( $input['settings'] ) ? $input['settings'] : array();
		$point_type  = isset( $input['point_type'] ) ? sanitize_text_field( $input['point_type'] ) : MYCRED_DEFAULT_TYPE_KEY;

		if ( empty( $settings_in ) ) {
			return new WP_Error( 'no_settings', __( 'No settings provided to update.', 'mycred' ) );
		}

		if ( function_exists( 'mycred_point_type_exists' ) && ! mycred_point_type_exists( $point_type ) ) {
			return new WP_Error( 'invalid_point_type', __( 'The specified point type does not exist.', 'mycred' ) );
		}

		$settings_in = $this->normalize_general_settings_input( $settings_in );
		$remote_in   = null;
		if ( isset( $settings_in['remote'] ) ) {
			$remote_in = $settings_in['remote'];
			unset( $settings_in['remote'] );
		}

		$settings_in = $this->sanitize_settings_tree( $settings_in );
		if ( null !== $remote_in ) {
			$remote_in = $this->sanitize_settings_tree( $remote_in );
		}

		if ( isset( $settings_in['caps']['creds'] ) && '' === $settings_in['caps']['creds'] ) {
			return new WP_Error( 'empty_cap', __( 'Capability values cannot be empty.', 'mycred' ) );
		}
		if ( isset( $settings_in['caps']['plugin'] ) && '' === $settings_in['caps']['plugin'] ) {
			return new WP_Error( 'empty_cap', __( 'Capability values cannot be empty.', 'mycred' ) );
		}

		$core_option = $this->get_core_option_key( $point_type );
		$core_prefs  = $this->deep_copy_option_value( mycred_get_option( $core_option, array() ) );
		if ( ! is_array( $core_prefs ) ) {
			$core_prefs = array();
		}

		$updated = array();
		if ( ! empty( $settings_in ) ) {
			$this->merge_settings_tree( $core_prefs, $settings_in );
			$this->persist_option_array( $core_option, $core_prefs );
			$updated = array_merge( $updated, array_keys( $this->flatten_settings_input( $settings_in ) ) );

			if ( isset( $core_prefs['stats']['color_positive'] ) || isset( $core_prefs['stats']['color_negative'] ) ) {
				$colors = $this->deep_copy_option_value( mycred_get_option( 'mycred-point-colors', array() ) );
				if ( ! is_array( $colors ) ) {
					$colors = array();
				}
				if ( isset( $core_prefs['stats']['color_positive'] ) ) {
					$colors['positive'] = $core_prefs['stats']['color_positive'];
				}
				if ( isset( $core_prefs['stats']['color_negative'] ) ) {
					$colors['negative'] = $core_prefs['stats']['color_negative'];
				}
				$this->persist_option_array( 'mycred-point-colors', $colors );
			}
		}

		if ( null !== $remote_in && is_array( $remote_in ) ) {
			$remote_prefs = $this->deep_copy_option_value(
				function_exists( 'mycred_get_remote' ) ? mycred_get_remote() : mycred_get_option( 'mycred_pref_remote', array() )
			);
			if ( ! is_array( $remote_prefs ) ) {
				$remote_prefs = array();
			}
			$this->merge_settings_tree( $remote_prefs, $remote_in );
			$this->persist_option_array( 'mycred_pref_remote', $remote_prefs );
			foreach ( array_keys( $this->flatten_settings_input( $remote_in ) ) as $path ) {
				$updated[] = 'remote.' . $path;
			}
		}

		if ( empty( $updated ) ) {
			return new WP_Error( 'nothing_updated', __( 'No settings were updated.', 'mycred' ) );
		}

		return array(
			'success'    => true,
			'point_type' => $point_type,
			'updated'    => array_values( $updated ),
			'message'    => sprintf(
				/* translators: %d: number of updated fields */
				__( 'Successfully updated %d general setting field(s).', 'mycred' ),
				count( $updated )
			),
		);
	}
}

