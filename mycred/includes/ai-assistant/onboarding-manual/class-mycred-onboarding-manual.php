<?php
/**
 * Builds a Manual Setup recommendation from hardcoded maps.
 * Does not call middleware or AI schemas.
 *
 * @package myCred
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! class_exists( 'myCRED_Onboarding_Manual' ) ) {

	class myCRED_Onboarding_Manual {

		/**
		 * Directory that holds presets, catalog, and settings maps.
		 *
		 * @var string
		 */
		protected $base_dir;

		/**
		 * @param string|null $base_dir Optional override for data files.
		 */
		public function __construct( $base_dir = null ) {
			$this->base_dir = $base_dir ? (string) $base_dir : plugin_dir_path( __FILE__ );
		}

		/**
		 * Manual-only script. Does not change the AI onboarding bundle.
		 *
		 * @return void
		 */
		public static function enqueue_script() {
			$page = isset( $_GET['page'] ) ? sanitize_key( wp_unslash( $_GET['page'] ) ) : '';
			if ( 'mycred-onboarding' !== $page ) {
				return;
			}

			$path = plugin_dir_path( __FILE__ ) . 'assets/js/mycred-onboarding-manual.js';
			wp_enqueue_script(
				'mycred-onboarding-manual',
				plugins_url( 'assets/js/mycred-onboarding-manual.js', __FILE__ ),
				array(),
				file_exists( $path ) ? (string) filemtime( $path ) : '1.0.0',
				true
			);
			wp_localize_script(
				'mycred-onboarding-manual',
				'mycredOnboardingManual',
				array(
					'strings' => array(
						'goalSelected'     => __( 'Goal: %s', 'mycred' ),
						'overviewIncludes' => __( 'Includes: %s', 'mycred' ),
						'pointTypeName'    => __( 'Point type name', 'mycred' ),
					),
				)
			);
		}

		/**
		 * @param array<string, string> $fields Validated type / platform / goal labels.
		 * @return array<string, mixed>
		 */
		public static function build( $fields ) {
			$instance = new self();
			return $instance->make( $fields );
		}

		/**
		 * @param array<string, string> $fields Validated fields.
		 * @return array<string, mixed>
		 */
		public function make( $fields ) {
			$presets  = $this->presets();
			$catalog  = $this->catalog();
			$hooks_db = isset( $catalog['hooks'] ) && is_array( $catalog['hooks'] ) ? $catalog['hooks'] : array();
			$addons_db = isset( $catalog['addons'] ) && is_array( $catalog['addons'] ) ? $catalog['addons'] : array();

			$site_type = isset( $fields['site_type'] ) ? (string) $fields['site_type'] : '';
			$platform  = isset( $fields['platform'] ) ? (string) $fields['platform'] : '';
			$goal      = isset( $fields['goal'] ) ? (string) $fields['goal'] : '';

			$type_preset     = isset( $presets['site_types'][ $site_type ] ) && is_array( $presets['site_types'][ $site_type ] ) ? $presets['site_types'][ $site_type ] : array();
			$platform_preset = isset( $presets['platforms'][ $platform ] ) && is_array( $presets['platforms'][ $platform ] ) ? $presets['platforms'][ $platform ] : array();
			$goal_preset     = ( '' !== $goal && isset( $presets['goals'][ $goal ] ) && is_array( $presets['goals'][ $goal ] ) ) ? $presets['goals'][ $goal ] : array();

			$wanted_roles = isset( $goal_preset['roles'] ) && is_array( $goal_preset['roles'] ) ? $goal_preset['roles'] : array();
			$skip_ids     = isset( $platform_preset['skip_ids'] ) && is_array( $platform_preset['skip_ids'] ) ? $platform_preset['skip_ids'] : array();
			$include_ids  = isset( $platform_preset['include_ids'] ) && is_array( $platform_preset['include_ids'] ) ? $platform_preset['include_ids'] : array();

			$schema_slugs  = array();
			$platform_slug = isset( $platform_preset['slug'] ) ? (string) $platform_preset['slug'] : '';
			if ( '' !== $platform_slug ) {
				$schema_slugs[] = $platform_slug;
			}
			foreach ( array( 'also', 'extra' ) as $group ) {
				if ( ! empty( $platform_preset[ $group ] ) && is_array( $platform_preset[ $group ] ) ) {
					$schema_slugs = array_merge( $schema_slugs, $platform_preset[ $group ] );
				}
			}
			$schema_slugs = array_values( array_unique( array_filter( array_map( 'strval', $schema_slugs ) ) ) );

			$pool         = array();
			$hook_sources = array();
			foreach ( $hooks_db as $hook_id => $meta ) {
				if ( ! is_array( $meta ) ) {
					continue;
				}
				$addon = isset( $meta['addon'] ) ? (string) $meta['addon'] : 'mycred';
				if ( ! in_array( $addon, $schema_slugs, true ) ) {
					continue;
				}
				$hook_id = (string) $hook_id;
				$pool[ $hook_id ] = $meta;
				if ( ! isset( $hook_sources[ $hook_id ] ) ) {
					$hook_sources[ $hook_id ] = array();
				}
				if ( ! in_array( $addon, $hook_sources[ $hook_id ], true ) ) {
					$hook_sources[ $hook_id ][] = $addon;
				}
			}

			$core_hooks = array();
			foreach ( $hooks_db as $hook_id => $meta ) {
				if ( ! is_array( $meta ) ) {
					continue;
				}
				$addon = isset( $meta['addon'] ) ? (string) $meta['addon'] : 'mycred';
				if ( 'mycred' === $addon ) {
					$core_hooks[ (string) $hook_id ] = $meta;
				}
			}

			foreach ( $include_ids as $hook_id ) {
				if ( isset( $core_hooks[ $hook_id ] ) ) {
					$pool[ $hook_id ] = $core_hooks[ $hook_id ];
				} elseif ( isset( $hooks_db[ $hook_id ] ) && is_array( $hooks_db[ $hook_id ] ) ) {
					$pool[ $hook_id ] = $hooks_db[ $hook_id ];
					$src              = isset( $hooks_db[ $hook_id ]['addon'] ) ? (string) $hooks_db[ $hook_id ]['addon'] : '';
					if ( '' !== $src && 'mycred' !== $src ) {
						$hook_sources[ $hook_id ][] = $src;
					}
				}
			}

			$type_core = isset( $type_preset['core_hooks'] ) && is_array( $type_preset['core_hooks'] ) ? $type_preset['core_hooks'] : array();
			foreach ( $type_core as $hook_id ) {
				if ( isset( $core_hooks[ $hook_id ] ) ) {
					$pool[ $hook_id ] = $core_hooks[ $hook_id ];
				}
			}

			$generic_core = array( 'registration', 'anniversary', 'site_visit', 'logging_in', 'publishing_content', 'comments', 'affiliate', 'video_view', 'view_contents' );
			foreach ( $generic_core as $hook_id ) {
				if ( ! isset( $core_hooks[ $hook_id ] ) ) {
					continue;
				}
				$roles = $this->classify_hook_roles( $hook_id, isset( $core_hooks[ $hook_id ]['label'] ) ? (string) $core_hooks[ $hook_id ]['label'] : '' );
				if ( in_array( 'negative', $roles, true ) ) {
					continue;
				}
				if ( $wanted_roles !== array() && array_intersect( $roles, $wanted_roles ) ) {
					$pool[ $hook_id ] = $core_hooks[ $hook_id ];
				}
			}

			$payload_hooks  = array();
			$matched_schema = false;
			$seen_hooks     = array();
			$goal_label     = isset( $fields['goal_label'] ) ? (string) $fields['goal_label'] : $goal;
			$site_label     = isset( $fields['site_type_label'] ) ? (string) $fields['site_type_label'] : $site_type;
			$plat_label     = isset( $fields['platform_label'] ) ? (string) $fields['platform_label'] : $platform;

			foreach ( $pool as $hook_id => $meta ) {
				if ( in_array( $hook_id, $skip_ids, true ) ) {
					continue;
				}
				$roles    = $this->classify_hook_roles( $hook_id, isset( $meta['label'] ) ? (string) $meta['label'] : '' );
				$is_core  = isset( $core_hooks[ $hook_id ] ) && ! in_array( $hook_id, $include_ids, true );
				$role_hit = ( $wanted_roles !== array() && array_intersect( $roles, $wanted_roles ) );

				if ( in_array( 'negative', $roles, true ) ) {
					continue;
				}

				if ( $role_hit ) {
					if ( ! $is_core ) {
						$matched_schema = true;
					}
					$seen_hooks[ $hook_id ] = true;
					$payload_hooks[]        = $this->hook_row( $hook_id, $meta, 'recommended', 'Matches the selected goal: ' . $goal_label . '.' );
					continue;
				}

				if ( $is_core && in_array( $hook_id, $type_core, true ) ) {
					$seen_hooks[ $hook_id ] = true;
					$payload_hooks[]        = $this->hook_row( $hook_id, $meta, 'optional', 'Useful baseline for a ' . $site_label . '.' );
				}
			}

			if ( ! $matched_schema ) {
				$count = 0;
				foreach ( $pool as $hook_id => $meta ) {
					if ( isset( $seen_hooks[ $hook_id ] ) || in_array( $hook_id, $skip_ids, true ) ) {
						continue;
					}
					if ( isset( $core_hooks[ $hook_id ] ) && ! in_array( $hook_id, $include_ids, true ) ) {
						continue;
					}
					$roles = $this->classify_hook_roles( $hook_id, isset( $meta['label'] ) ? (string) $meta['label'] : '' );
					if ( in_array( 'negative', $roles, true ) ) {
						continue;
					}
					$seen_hooks[ $hook_id ] = true;
					$payload_hooks[]        = $this->hook_row( $hook_id, $meta, 'recommended', 'Core ' . $plat_label . ' earning hook for this setup.' );
					$count++;
					if ( $count >= 5 ) {
						break;
					}
				}
			}

			$want_checkout = ! empty( $goal_preset['checkout'] ) && ! empty( $platform_preset['checkout'] );
			$ownership     = $this->platform_addon_ownership( $presets );
			$current_owned = isset( $ownership['by_platform'][ $platform ] ) ? $ownership['by_platform'][ $platform ] : array();
			$foreign_slugs = array_values( array_diff( $ownership['all'], $current_owned ) );

			$plat_addons = array();
			if ( '' !== $platform_slug && 'mycred' !== $platform_slug ) {
				$plat_addons[] = array(
					'slug'     => $platform_slug,
					'priority' => 'recommended',
					'reason'   => 'Required integration for ' . $plat_label . '.',
				);
			}
			if ( ! empty( $platform_preset['also'] ) && is_array( $platform_preset['also'] ) ) {
				foreach ( $platform_preset['also'] as $also_slug ) {
					$plat_addons[] = array(
						'slug'     => (string) $also_slug,
						'priority' => 'recommended',
						'reason'   => 'Required integration for ' . $plat_label . '.',
					);
				}
			}

			$addon_from_hooks = array();
			foreach ( $payload_hooks as $row ) {
				if ( ! is_array( $row ) || empty( $row['hook_id'] ) ) {
					continue;
				}
				$hook_id = (string) $row['hook_id'];
				if ( empty( $hook_sources[ $hook_id ] ) || ! is_array( $hook_sources[ $hook_id ] ) ) {
					continue;
				}
				$hook_priority = ( isset( $row['priority'] ) && 'recommended' === $row['priority'] ) ? 'recommended' : 'optional';
				foreach ( $hook_sources[ $hook_id ] as $src ) {
					$src = (string) $src;
					if ( '' === $src || 'mycred' === $src ) {
						continue;
					}
					$prev                     = isset( $addon_from_hooks[ $src ] ) ? $addon_from_hooks[ $src ] : 'optional';
					$addon_from_hooks[ $src ] = ( 'recommended' === $hook_priority || 'recommended' === $prev ) ? 'recommended' : 'optional';
				}
			}
			$hook_addons = array();
			foreach ( $addon_from_hooks as $src => $priority ) {
				$hook_addons[] = array(
					'slug'     => $src,
					'priority' => $priority,
					'reason'   => 'Needed to enable the recommended hooks from this add-on.',
				);
			}

			$type_addons = isset( $type_preset['addons'] ) && is_array( $type_preset['addons'] ) ? $type_preset['addons'] : array();
			$goal_addons = isset( $goal_preset['addons'] ) && is_array( $goal_preset['addons'] ) ? $goal_preset['addons'] : array();
			$payload_addons = $this->merge_rows(
				array(),
				array_merge(
					$this->filter_addons_for_platform( $plat_addons, $platform, $foreign_slugs ),
					$this->filter_addons_for_platform( $type_addons, $platform, $foreign_slugs ),
					$this->filter_addons_for_platform( $goal_addons, $platform, $foreign_slugs ),
					$this->filter_addons_for_platform( $hook_addons, $platform, $foreign_slugs )
				),
				'slug'
			);

			foreach ( $payload_addons as $i => $row ) {
				$slug = isset( $row['slug'] ) ? (string) $row['slug'] : '';
				if ( '' === $slug || ! isset( $addons_db[ $slug ] ) || ! is_array( $addons_db[ $slug ] ) ) {
					continue;
				}
				if ( empty( $payload_addons[ $i ]['label'] ) && ! empty( $addons_db[ $slug ]['label'] ) ) {
					$payload_addons[ $i ]['label'] = (string) $addons_db[ $slug ]['label'];
				}
				if ( empty( $payload_addons[ $i ]['description'] ) && ! empty( $addons_db[ $slug ]['description'] ) ) {
					$payload_addons[ $i ]['description'] = (string) $addons_db[ $slug ]['description'];
				}
				if ( empty( $payload_addons[ $i ]['source'] ) && ! empty( $addons_db[ $slug ]['source'] ) ) {
					$payload_addons[ $i ]['source'] = (string) $addons_db[ $slug ]['source'];
				}
			}

			$point_type = $this->point_type_for( $type_preset, $goal_preset, $site_label );
			$point_name = isset( $point_type['name'] ) ? (string) $point_type['name'] : '';
			$checkout   = $this->checkout_for_platform( $platform, $platform_preset, $goal_preset, $plat_label, $point_name );
			$settings   = $this->settings_for_addons( $payload_addons );

			$rec_hook_titles  = array();
			$rec_addon_labels = array();
			foreach ( $payload_hooks as $row ) {
				if ( ( isset( $row['priority'] ) ? $row['priority'] : '' ) !== 'recommended' ) {
					continue;
				}
				$title = isset( $row['title'] ) ? (string) $row['title'] : '';
				if ( '' !== $title ) {
					$rec_hook_titles[] = $title;
				}
			}
			foreach ( $payload_addons as $row ) {
				if ( ( isset( $row['priority'] ) ? $row['priority'] : '' ) !== 'recommended' ) {
					continue;
				}
				$label = isset( $row['label'] ) ? (string) $row['label'] : ( isset( $row['slug'] ) ? (string) $row['slug'] : '' );
				if ( '' !== $label ) {
					$rec_addon_labels[] = $label;
				}
			}

			$addon_summary = $rec_addon_labels
				? implode( ', ', array_slice( $rec_addon_labels, 0, 4 ) )
				: __( 'the matching myCred add-ons', 'mycred' );

			return array(
				'understood'     => sprintf(
					/* translators: 1: site type, 2: platform, 3: goal, 4: point type name */
					__( 'You selected a %1$s using %2$s, with the goal “%3$s”. Users will earn and spend %4$s. Nothing is applied until you confirm.', 'mycred' ),
					$site_label,
					$plat_label,
					$goal_label,
					$point_name
				),
				'point_type'     => $point_type,
				'hooks_intro'    => sprintf(
					/* translators: 1: platform, 2: goal */
					__( 'Earning hooks chosen for %1$s and the goal “%2$s”.', 'mycred' ),
					$plat_label,
					$goal_label
				),
				'hooks'          => $payload_hooks,
				'settings_intro' => __( 'Starter settings for the recommended add-ons. You can change them before applying.', 'mycred' ),
				'settings'       => $settings,
				'checkout'       => $checkout,
				'why'            => sprintf(
					/* translators: 1: platform, 2: goal, 3: point type name, 4: add-on list */
					__( 'This ready-made setup is based on %1$s and the goal “%2$s”. It uses %3$s and recommends %4$s so you can start without writing a prompt.', 'mycred' ),
					$plat_label,
					$goal_label,
					$point_name,
					$addon_summary
				),
				'overview'       => $this->overview_for(
					$plat_label,
					$goal_label,
					$point_name,
					$rec_hook_titles,
					$rec_addon_labels,
					$settings,
					$checkout
				),
				'addons'         => $payload_addons,
			);
		}

		/**
		 * Point type for the selected website type (and goal when it needs a spend currency).
		 *
		 * @param array<string, mixed> $type_preset Site-type preset.
		 * @param array<string, mixed> $goal_preset Goal preset.
		 * @param string               $site_label  Site type label.
		 * @return array{name:string,key:string,description:string}
		 */
		protected function point_type_for( $type_preset, $goal_preset, $site_label ) {
			$point_type = isset( $type_preset['point_type'] ) && is_array( $type_preset['point_type'] )
				? $type_preset['point_type']
				: array();

			$name = isset( $point_type['name'] ) ? trim( (string) $point_type['name'] ) : '';
			$key  = isset( $point_type['key'] ) ? (string) $point_type['key'] : '';
			$desc = isset( $point_type['description'] ) ? trim( (string) $point_type['description'] ) : '';

			if ( '' === $name ) {
				$name = __( 'Reward Points', 'mycred' );
			}
			if ( '' === $key ) {
				$key = sanitize_key( str_replace( '-', '_', strtolower( $name ) ) );
			}
			if ( '' === $key ) {
				$key = 'reward_points';
			}
			if ( '' === $desc ) {
				$desc = sprintf(
					/* translators: %s: website type */
					__( 'The main currency users will earn and spend on a %s.', 'mycred' ),
					$site_label
				);
			}
			if ( ! empty( $goal_preset['checkout'] ) ) {
				$desc = sprintf(
					/* translators: %s: point type name */
					__( '%s can be earned and spent at checkout.', 'mycred' ),
					$name
				);
			}

			return array(
				'name'        => $name,
				'key'         => $key,
				'description' => $desc,
			);
		}

		/**
		 * Checkout block for platforms that can take points as payment.
		 *
		 * @param string               $platform        Platform key.
		 * @param array<string, mixed> $platform_preset Platform preset.
		 * @param array<string, mixed> $goal_preset     Goal preset.
		 * @param string               $plat_label      Platform label.
		 * @param string               $point_name      Point type name.
		 * @return array<string, mixed>
		 */
		protected function checkout_for_platform( $platform, $platform_preset, $goal_preset, $plat_label, $point_name ) {
			$empty = array(
				'relevant' => false,
				'intro'    => '',
				'example'  => '',
				'items'    => array(),
			);
			if ( empty( $goal_preset['checkout'] ) || empty( $platform_preset['checkout'] ) ) {
				return $empty;
			}

			$addon = isset( $platform_preset['slug'] ) ? (string) $platform_preset['slug'] : '';
			if ( 'dokan' === $platform || 'woocommerce' === $platform ) {
				$addon = 'woocommerce';
			}
			if ( 'mycred' === $addon ) {
				$addon = '';
			}

			$rate_key = in_array( $platform, array( 'events_manager' ), true ) ? 'rate' : 'exchange_rate';
			$point    = '' !== $point_name ? $point_name : __( 'Reward Points', 'mycred' );

			return array(
				'relevant' => true,
				'intro'    => sprintf(
					/* translators: 1: point type name, 2: platform */
					__( 'Accept %1$s as payment in %2$s, with an exchange rate so customers know what a point is worth.', 'mycred' ),
					$point,
					$plat_label
				),
				'example'  => sprintf(
					/* translators: 1: point type name, 2: platform */
					__( 'Exchange rate 1 means 1 %1$s unit equals 1.00 in store currency on %2$s checkout.', 'mycred' ),
					$point,
					$plat_label
				),
				'items'    => array(
					array(
						'addon'       => $addon,
						'key'         => 'enabled',
						'title'       => __( 'Enable points payment', 'mycred' ),
						'description' => sprintf(
							/* translators: 1: point type name, 2: platform */
							__( 'Let logged-in customers pay with %1$s on %2$s.', 'mycred' ),
							$point,
							$plat_label
						),
						'reason'      => __( 'Gives points a real spend so balances do not sit unused.', 'mycred' ),
						'value'       => '1',
						'type'        => 'checkbox',
						'priority'    => 'recommended',
					),
					array(
						'addon'       => $addon,
						'key'         => $rate_key,
						'title'       => __( 'Exchange rate', 'mycred' ),
						'description' => sprintf(
							/* translators: %s: point type name */
							__( 'How much 1 %s is worth in store currency.', 'mycred' ),
							$point
						),
						'reason'      => __( 'Matches the payment gateway exchange rate field (default 1).', 'mycred' ),
						'value'       => '1',
						'type'        => 'number',
						'priority'    => 'recommended',
					),
					array(
						'addon'       => $addon,
						'key'         => 'show_total',
						'title'       => __( 'Show total in points', 'mycred' ),
						'description' => sprintf(
							/* translators: %s: point type name */
							__( 'Show the order total converted to %s on checkout.', 'mycred' ),
							$point
						),
						'reason'      => __( 'Customers understand the cost before they pay.', 'mycred' ),
						'value'       => 'checkout',
						'type'        => 'select',
						'options'     => array(
							'no'       => __( 'Do not show', 'mycred' ),
							'cart'     => __( 'Cart', 'mycred' ),
							'checkout' => __( 'Checkout', 'mycred' ),
							'both'     => __( 'Cart and checkout', 'mycred' ),
						),
						'priority'    => 'optional',
					),
				),
			);
		}

		/**
		 * Sidebar overview lines for the selected combination.
		 *
		 * @param string               $plat_label       Platform label.
		 * @param string               $goal_label       Goal label.
		 * @param string               $point_name       Point type name.
		 * @param array<int, string>   $rec_hook_titles  Recommended hook titles.
		 * @param array<int, string>   $rec_addon_labels Recommended add-on labels.
		 * @param array<int, mixed>    $settings         Setting rows.
		 * @param array<string, mixed> $checkout         Checkout block.
		 * @return array<int, string>
		 */
		protected function overview_for( $plat_label, $goal_label, $point_name, $rec_hook_titles, $rec_addon_labels, $settings, $checkout ) {
			$hook_count  = count( $rec_hook_titles );
			$addon_count = count( $rec_addon_labels );
			$lines       = array();

			if ( '' !== $plat_label ) {
				$lines[] = sprintf(
					/* translators: %s: platform */
					__( '%s selected', 'mycred' ),
					$plat_label
				);
			}
			if ( '' !== $goal_label ) {
				$lines[] = sprintf(
					/* translators: %s: goal */
					__( 'Goal: %s', 'mycred' ),
					$goal_label
				);
			}
			if ( '' !== $point_name ) {
				$lines[] = $point_name;
			}
			$lines[] = sprintf(
				/* translators: %s: number of hooks */
				_n( '%s earning hook selected', '%s earning hooks selected', $hook_count, 'mycred' ),
				(string) $hook_count
			);
			if ( $rec_hook_titles ) {
				$lines[] = sprintf(
					/* translators: %s: hook titles */
					__( 'Includes: %s', 'mycred' ),
					implode( ', ', array_slice( $rec_hook_titles, 0, 3 ) )
				);
			}
			if ( $addon_count ) {
				$lines[] = sprintf(
					/* translators: %s: number of add-ons */
					_n( '%s add-on recommended', '%s add-ons recommended', $addon_count, 'mycred' ),
					(string) $addon_count
				);
				$lines[] = implode( ', ', array_slice( $rec_addon_labels, 0, 4 ) );
			}
			if ( ! empty( $settings ) ) {
				$setting_count = count( $settings );
				$lines[]       = sprintf(
					/* translators: %s: number of settings */
					_n( '%s add-on setting suggested', '%s add-on settings suggested', $setting_count, 'mycred' ),
					(string) $setting_count
				);
			}
			if ( ! empty( $checkout['relevant'] ) && ! empty( $checkout['items'] ) ) {
				$checkout_count = count( $checkout['items'] );
				$lines[]        = sprintf(
					/* translators: %s: number of checkout settings */
					_n( '%s checkout setting suggested', '%s checkout settings suggested', $checkout_count, 'mycred' ),
					(string) $checkout_count
				);
			}

			return array_values( array_filter( $lines ) );
		}

		/**
		 * Hook / add-on label catalogs used when sanitizing the payload.
		 *
		 * @return array{hooks: array, addons: array}
		 */
		public function catalogs_for_sanitize() {
			$catalog = $this->catalog();
			return array(
				'hooks'  => isset( $catalog['hooks'] ) && is_array( $catalog['hooks'] ) ? $catalog['hooks'] : array(),
				'addons' => isset( $catalog['addons'] ) && is_array( $catalog['addons'] ) ? $catalog['addons'] : array(),
			);
		}

		/**
		 * @return array<string, mixed>
		 */
		protected function presets() {
			static $presets = null;
			if ( is_array( $presets ) ) {
				return $presets;
			}
			$path   = $this->base_dir . 'onboarding-manual-presets.php';
			$loaded = is_readable( $path ) ? include $path : array();
			$presets = is_array( $loaded ) ? $loaded : array();
			return $presets;
		}

		/**
		 * @return array<string, mixed>
		 */
		protected function catalog() {
			static $catalog = null;
			if ( is_array( $catalog ) ) {
				return $catalog;
			}
			$path    = $this->base_dir . 'onboarding-manual-catalog.php';
			$loaded  = is_readable( $path ) ? include $path : array();
			$catalog = is_array( $loaded ) ? $loaded : array( 'hooks' => array(), 'addons' => array() );
			return $catalog;
		}

		/**
		 * @return array<string, mixed>
		 */
		protected function settings_map() {
			static $map = null;
			if ( is_array( $map ) ) {
				return $map;
			}
			$path = $this->base_dir . 'onboarding-manual-settings.php';
			$loaded = is_readable( $path ) ? include $path : array();
			$map    = is_array( $loaded ) ? $loaded : array();
			return $map;
		}

		/**
		 * @param array<int, array<string, mixed>> $addons Recommended add-on rows.
		 * @return array<int, array<string, mixed>>
		 */
		protected function settings_for_addons( $addons ) {
			$map = $this->settings_map();
			$out = array();
			foreach ( $addons as $row ) {
				if ( ! is_array( $row ) || empty( $row['slug'] ) ) {
					continue;
				}
				$slug = (string) $row['slug'];
				if ( empty( $map[ $slug ] ) || ! is_array( $map[ $slug ] ) ) {
					continue;
				}
				foreach ( $map[ $slug ] as $setting ) {
					if ( ! is_array( $setting ) ) {
						continue;
					}
					$setting['addon'] = $slug;
					$setting['ui']    = 'show';
					$out[]            = $setting;
				}
			}
			return $out;
		}

		/**
		 * @param string               $hook_id Hook id.
		 * @param array<string, mixed> $meta    Catalog row.
		 * @param string               $priority Priority.
		 * @param string               $reason  Reason copy.
		 * @return array<string, mixed>
		 */
		protected function hook_row( $hook_id, $meta, $priority, $reason ) {
			return array(
				'hook_id'     => $hook_id,
				'title'       => isset( $meta['label'] ) ? (string) $meta['label'] : $hook_id,
				'description' => isset( $meta['description'] ) ? (string) $meta['description'] : '',
				'creds'       => isset( $meta['creds'] ) ? (string) $meta['creds'] : '10',
				'priority'    => $priority,
				'reason'      => $reason,
				'addon'       => isset( $meta['addon'] ) ? (string) $meta['addon'] : 'mycred',
			);
		}

		/**
		 * @param array<string, mixed> $presets Presets.
		 * @return array{by_platform: array<string, string[]>, all: string[]}
		 */
		protected function platform_addon_ownership( $presets ) {
			$by_platform = array();
			$all         = array();
			$platforms   = isset( $presets['platforms'] ) && is_array( $presets['platforms'] ) ? $presets['platforms'] : array();

			foreach ( $platforms as $key => $preset ) {
				if ( ! is_array( $preset ) ) {
					continue;
				}
				$slugs = array();
				if ( ! empty( $preset['slug'] ) && 'mycred' !== $preset['slug'] ) {
					$slugs[] = (string) $preset['slug'];
				}
				foreach ( array( 'also', 'extra' ) as $group ) {
					if ( empty( $preset[ $group ] ) || ! is_array( $preset[ $group ] ) ) {
						continue;
					}
					foreach ( $preset[ $group ] as $slug ) {
						$slugs[] = (string) $slug;
					}
				}
				$slugs               = array_values( array_unique( array_filter( $slugs ) ) );
				$by_platform[ $key ] = $slugs;
				$all                 = array_merge( $all, $slugs );
			}

			return array(
				'by_platform' => $by_platform,
				'all'         => array_values( array_unique( $all ) ),
			);
		}

		/**
		 * @param array<int, array<string, mixed>> $rows          Add-on rows.
		 * @param string                           $platform      Selected platform.
		 * @param array<int, string>               $foreign_slugs Other platform slugs.
		 * @return array<int, array<string, mixed>>
		 */
		protected function filter_addons_for_platform( $rows, $platform, $foreign_slugs ) {
			$out = array();
			foreach ( $rows as $row ) {
				if ( ! is_array( $row ) || empty( $row['slug'] ) ) {
					continue;
				}
				if ( ! empty( $row['platforms'] ) && is_array( $row['platforms'] ) && ! in_array( $platform, $row['platforms'], true ) ) {
					continue;
				}
				if ( in_array( (string) $row['slug'], $foreign_slugs, true ) ) {
					continue;
				}
				unset( $row['platforms'] );
				$out[] = $row;
			}
			return $out;
		}

		/**
		 * @param array<int, array<string, mixed>> $list    Base list.
		 * @param array<int, array<string, mixed>> $overlay Overlay.
		 * @param string                           $id_key  Merge key.
		 * @return array<int, array<string, mixed>>
		 */
		protected function merge_rows( $list, $overlay, $id_key ) {
			$index = array();
			foreach ( $list as $i => $row ) {
				if ( ! is_array( $row ) || empty( $row[ $id_key ] ) ) {
					continue;
				}
				$index[ (string) $row[ $id_key ] ] = $i;
			}

			foreach ( $overlay as $row ) {
				if ( ! is_array( $row ) || empty( $row[ $id_key ] ) ) {
					continue;
				}
				$id = (string) $row[ $id_key ];
				if ( isset( $index[ $id ] ) ) {
					$list[ $index[ $id ] ] = array_merge( $list[ $index[ $id ] ], $row );
					continue;
				}
				$index[ $id ] = count( $list );
				$list[]       = $row;
			}

			return $list;
		}

		/**
		 * @param string $hook_id Hook id.
		 * @param string $label   Hook label.
		 * @return string[]
		 */
		protected function classify_hook_roles( $hook_id, $label = '' ) {
			$hay = strtolower( str_replace( array( '-', '_' ), ' ', $hook_id . ' ' . $label ) );

			if ( preg_match( '/refund|cancel|fail|delete|abandon|expired|unfavorite|unpublication|remove$/', $hay ) ) {
				return array( 'negative' );
			}

			$roles = array();

			if ( preg_match( '/first order/', $hay ) ) {
				$roles[] = 'first_order';
			} elseif ( preg_match( '/order range/', $hay ) ) {
				$roles[] = 'order_range';
			} elseif ( preg_match( '/numbers of order|number of order/', $hay ) ) {
				$roles[] = 'order_count';
			} elseif ( preg_match( '/each order|product purchase|order completion|complete pay|purchase ticket|studiocart purchase|subscription activated|subscription renewed|vendor sales/', $hay ) ) {
				$roles[] = 'purchase';
			}

			if ( preg_match( '/review|rating|dokrate|product ratings/', $hay ) ) {
				$roles[] = 'review';
			}
			if ( preg_match( '/referral|affiliate|invite/', $hay ) ) {
				$roles[] = 'referral';
			}
			if ( preg_match( '/vendor|dokrate/', $hay ) ) {
				$roles[] = 'vendor';
			}
			if ( preg_match( '/enroll/', $hay ) ) {
				$roles[] = 'enroll';
			}
			if ( preg_match( '/lesson/', $hay ) ) {
				$roles[] = 'lesson';
			}
			if ( preg_match( '/topic/', $hay ) ) {
				$roles[] = 'topic';
			}
			if ( preg_match( '/quiz|h5p content/', $hay ) ) {
				$roles[] = 'quiz';
			}
			if ( preg_match( '/course/', $hay ) && ! preg_match( '/enroll/', $hay ) ) {
				$roles[] = 'course';
			}
			if ( preg_match( '/field value|specific field|specific form/', $hay ) ) {
				$roles[] = 'field_value';
			} elseif ( preg_match( '/submit|poll|survey|totalpoll|totalsurvey|rating form/', $hay ) ) {
				$roles[] = 'submit';
			}
			if ( preg_match( '/booking|appointment|wptravel/', $hay ) ) {
				$roles[] = 'booking';
			}
			if ( preg_match( '/ticket|rsvp|zoom|events manager|tec |event/', $hay ) ) {
				$roles[] = 'event';
			}
			if ( preg_match( '/give wp|donor|donation/', $hay ) ) {
				$roles[] = 'donate';
			}
			if ( preg_match( '/advert|listing|geodirectory place|geodirectory category/', $hay ) ) {
				$roles[] = 'listing';
			}
			if ( preg_match( '/message|contact author|inquiry/', $hay ) ) {
				$roles[] = 'inquiry';
			}
			if ( preg_match( '/profile|activity|friend|group|forum|follow|question|answer|vote|compliment|avatar|cover|bio|verify/', $hay ) ) {
				$roles[] = 'community';
			}
			if ( preg_match( '/video|presto|jwplayer/', $hay ) ) {
				$roles[] = 'video';
			}
			if ( preg_match( '/like|favorite|postviews|view(?:ing)? contents?|gdstars/', $hay ) ) {
				$roles[] = 'read';
			}
			if ( preg_match( '/membership|subscription|renew membership|renew advert/', $hay ) ) {
				$roles[] = 'membership';
			}
			if ( preg_match( '/registrations|\bregistration\b|becoming a member/', $hay ) ) {
				$roles[] = 'registration';
			}
			if ( preg_match( '/logins|logging in/', $hay ) ) {
				$roles[] = 'login';
			}
			if ( preg_match( '/site visit|daily visit/', $hay ) ) {
				$roles[] = 'visit';
			}
			if ( preg_match( '/anniversary/', $hay ) ) {
				$roles[] = 'anniversary';
			}
			if ( preg_match( '/comment/', $hay ) ) {
				$roles[] = 'comments';
			}
			if ( preg_match( '/publish/', $hay ) ) {
				$roles[] = 'publish';
			}

			return array_values( array_unique( $roles ) );
		}
	}

	add_action( 'admin_enqueue_scripts', array( 'myCRED_Onboarding_Manual', 'enqueue_script' ), 20 );
}
