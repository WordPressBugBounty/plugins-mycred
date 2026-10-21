<?php
/**
 * Addon AI Abilities
 *
 * @package myCred
 * @subpackage AI
 * @since 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once dirname( __FILE__ ) . '/trait-mycred-ai-general-settings.php';

if ( ! class_exists( 'myCRED_AI_Abilities' ) ) {

	class myCRED_AI_Abilities {

		use myCRED_AI_General_Settings_Trait;

		/**
		 * Singleton Instance
		 *
		 * @var myCRED_AI_Abilities|null
		 */
		protected static $_instance = null;

		/**
		 * Setup Instance Singleton
		 *
		 * @since 1.0
		 * @return myCRED_AI_Abilities
		 */
		public static function instance() {
			if ( is_null( self::$_instance ) ) {
				self::$_instance = new self();
			}
			return self::$_instance;
		}

		/**
		 * Construct
		 *
		 * Sets up our custom module configuration matching myCRED_Module patterns.
		 */
		public function __construct() {
			add_action( 'wp_abilities_api_categories_init', array( $this, 'register_abilities_category' ) );
			add_action( 'wp_abilities_api_init', array( $this, 'register_abilities' ) );
		}
		
		
		/**
		 * Registers the custom myCred AI abilities category
		 */
		public function register_abilities_category() {
			wp_register_ability_category( 'mycred', array(
				'label'       => __( 'myCred Points Management', 'mycred' ),
				'description' => __( 'Abilities to retrieve point balances, site summaries, award or deduct points, create point types, ranks, badges, and update general settings.', 'mycred' )
			) );
		}
		
		/**
		 * Registers custom abilities with WordPress 7.0 AI Core
		 */
		public function register_abilities() {
			// Ability 1: get-user-balance
			wp_register_ability( 'mycred/get-user-balance', array(
				'label'               => __( 'Get User Balance', 'mycred' ),
				'description'         => __( 'Retrieves the current points balance of a user by user ID, email, or username.', 'mycred' ),
				'category'            => 'mycred',
				'execute_callback'    => array( $this, 'execute_get_user_balance' ),
				'permission_callback' => array( $this, 'permission_callback' ),
				'input_schema'        => array(
					'type'       => 'object',
					'properties' => array(
						'user' => array(
							'type'        => 'string',
							'description' => 'The user ID, email, or username to fetch balance for.',
						),
						'point_type' => array(
							'type'        => 'string',
							'description' => 'The point type key. Optional, defaults to default type.',
						),
					),
					'required'   => array( 'user' ),
				),
				'output_schema'       => array(
					'type'       => 'object',
					'properties' => array(
						'user_id'           => array( 'type' => 'integer' ),
						'username'          => array( 'type' => 'string' ),
						'balance'           => array( 'type' => 'number' ),
						'formatted_balance' => array( 'type' => 'string' ),
						'point_type'        => array( 'type' => 'string' ),
					),
					'required'   => array( 'user_id', 'username', 'balance', 'formatted_balance' ),
				),
			) );

			// Ability 2: get-site-points-summary
			wp_register_ability( 'mycred/get-site-points-summary', array(
				'label'               => __( 'Get Site Points Summary', 'mycred' ),
				'description'         => __( 'Retrieves total points in circulation, total log entries, and active members count.', 'mycred' ),
				'category'            => 'mycred',
				'execute_callback'    => array( $this, 'execute_get_site_points_summary' ),
				'permission_callback' => array( $this, 'permission_callback' ),
				'input_schema'        => array(
					'type'       => 'object',
					'properties' => array(
						'point_type' => array(
							'type'        => 'string',
							'description' => 'The point type key. Optional, defaults to default type.',
						),
					),
				),
				'output_schema'       => array(
					'type'       => 'object',
					'properties' => array(
						'point_type'                  => array( 'type' => 'string' ),
						'point_type_label'            => array( 'type' => 'string' ),
						'total_circulation'           => array( 'type' => 'number' ),
						'formatted_total_circulation' => array( 'type' => 'string' ),
						'total_log_entries'           => array( 'type' => 'integer' ),
						'active_members_count'        => array( 'type' => 'integer' ),
					),
					'required'   => array( 'point_type', 'total_circulation', 'formatted_total_circulation', 'total_log_entries', 'active_members_count' ),
				),
			) );

			// Ability 3: award-points
			wp_register_ability( 'mycred/award-points', array(
				'label'               => __( 'Award Points', 'mycred' ),
				'description'         => __( 'Awards points to a specified user with a given reason.', 'mycred' ),
				'category'            => 'mycred',
				'execute_callback'    => array( $this, 'execute_award_points' ),
				'permission_callback' => array( $this, 'admin_permission_callback' ),
				'input_schema'        => array(
					'type'       => 'object',
					'properties' => array(
						'user' => array(
							'type'        => 'string',
							'description' => 'The user ID, email, or username to award points to.',
						),
						'amount' => array(
							'type'        => 'number',
							'description' => 'The number of points to award (must be a positive number).',
						),
						'reason' => array(
							'type'        => 'string',
							'description' => 'The reason or description for awarding points.',
						),
						'point_type' => array(
							'type'        => 'string',
							'description' => 'The point type key. Optional, defaults to default type.',
						),
					),
					'required'   => array( 'user', 'amount', 'reason' ),
				),
				'output_schema'       => array(
					'type'       => 'object',
					'properties' => array(
						'success'               => array( 'type' => 'boolean' ),
						'message'               => array( 'type' => 'string' ),
						'new_balance'           => array( 'type' => 'number' ),
						'formatted_new_balance' => array( 'type' => 'string' ),
					),
					'required'   => array( 'success', 'message', 'new_balance', 'formatted_new_balance' ),
				),
			) );

			// Ability 4: deduct-points
			wp_register_ability( 'mycred/deduct-points', array(
				'label'               => __( 'Deduct Points', 'mycred' ),
				'description'         => __( 'Deducts points from a specified user with a given reason.', 'mycred' ),
				'category'            => 'mycred',
				'execute_callback'    => array( $this, 'execute_deduct_points' ),
				'permission_callback' => array( $this, 'admin_permission_callback' ),
				'input_schema'        => array(
					'type'       => 'object',
					'properties' => array(
						'user' => array(
							'type'        => 'string',
							'description' => 'The user ID, email, or username to deduct points from.',
						),
						'amount' => array(
							'type'        => 'number',
							'description' => 'The number of points to deduct (must be a positive number).',
						),
						'reason' => array(
							'type'        => 'string',
							'description' => 'The reason or description for deducting points.',
						),
						'point_type' => array(
							'type'        => 'string',
							'description' => 'The point type key. Optional, defaults to default type.',
						),
					),
					'required'   => array( 'user', 'amount', 'reason' ),
				),
				'output_schema'       => array(
					'type'       => 'object',
					'properties' => array(
						'success'               => array( 'type' => 'boolean' ),
						'message'               => array( 'type' => 'string' ),
						'new_balance'           => array( 'type' => 'number' ),
						'formatted_new_balance' => array( 'type' => 'string' ),
					),
					'required'   => array( 'success', 'message', 'new_balance', 'formatted_new_balance' ),
				),
			) );

			// Ability 5: suggest-hooks
			wp_register_ability( 'mycred/suggest-hooks', array(
				'label'               => __( 'Suggest Hooks', 'mycred' ),
				'description'         => __( 'Returns the registered myCred hooks available for the selected point type, including core and addon hooks, plus their dynamic settings fields and payload shape.', 'mycred' ),
				'category'            => 'mycred',
				'execute_callback'    => array( $this, 'execute_suggest_hooks' ),
				'permission_callback' => array( $this, 'admin_permission_callback' ),
				'input_schema'        => array(
					'type'       => 'object',
					'properties' => array(
						'site_type' => array(
							'type'        => 'string',
							'description' => 'The type of the site (e.g., eCommerce, LMS, BuddyBoss, Community, Blog).',
						),
						'point_type' => array(
							'type'        => 'string',
							'description' => 'The point type key. Optional, defaults to default type.',
						),
					),
					'required'   => array( 'site_type' ),
				),
				'output_schema'       => array(
					'type'       => 'object',
					'properties' => array(
						'suggested_hooks' => array(
							'type'        => 'array',
							'description' => 'List of suggested hooks with their descriptions and dynamic field metadata.',
							'items'       => array(
								'type'       => 'object',
								'properties' => array(
									'hook_id'     => array( 'type' => 'string', 'description' => 'The internal hook ID (e.g., logging_in, publishing_content, comments)' ),
									'description' => array( 'type' => 'string', 'description' => 'Explanation of what this hook does and why it is recommended.' ),
									'fields'      => array(
										'type'        => 'array',
										'description' => 'Flattened list of dynamic setting fields for this hook.',
										'items'       => array(
											'type'       => 'object',
											'properties' => array(
												'path'        => array( 'type' => 'string' ),
												'type'        => array( 'type' => 'string' ),
												'is_multiple' => array( 'type' => 'boolean' ),
											),
										),
									),
									'repeatable_fields' => array(
										'type'        => 'array',
										'items'       => array( 'type' => 'string' ),
										'description' => 'Top-level fields that behave like repeated row arrays.',
									),
									'settings_shape' => array(
										'type'                 => 'object',
										'additionalProperties' => true,
										'description'          => 'Current settings if configured, otherwise the hook defaults shape.',
									),
									'payload_hint' => array(
										'type'                 => 'object',
										'additionalProperties' => true,
										'description'          => 'Suggested payload shape to send back to mycred/apply-hooks.',
									),
								)
							)
						),
					),
					'required'   => array( 'suggested_hooks' ),
				),
			) );

			// Ability 6: apply-hooks
			wp_register_ability( 'mycred/apply-hooks', array(
				'label'               => __( 'Apply Hooks', 'mycred' ),
				'description'         => __( 'Overwrites current active hooks and applies the provided hook configuration. For hooks with custom fields, send the full settings payload. For hooks that support repeated rows, send occurrences/rows/items entries that match the hook field names.', 'mycred' ),
				'category'            => 'mycred',
				'execute_callback'    => array( $this, 'execute_apply_hooks' ),
				'permission_callback' => array( $this, 'admin_permission_callback' ),
				'input_schema'        => array(
					'type'       => 'object',
					'properties' => array(
						'hooks' => array(
							'type'        => 'array',
							'description' => 'List of hooks to apply.',
							'items'       => array(
								'type'       => 'object',
								'properties' => array(
									'hook_id' => array( 'type' => 'string', 'description' => 'The internal hook ID (e.g., logging_in)' ),
									'creds'   => array( 'type' => 'number', 'description' => 'The amount of points to award/deduct for this hook.' ),
									'log'     => array( 'type' => 'string', 'description' => 'The log template message for this hook (e.g., %plural% for logging in).' ),
									'settings' => array(
										'type'                 => 'object',
										'description'          => 'Optional full hook preferences payload. Use this for hooks with nested or custom settings fields instead of relying only on creds/log.',
										'additionalProperties' => true,
									),
								),
								'required'   => array( 'hook_id' )
							)
						),
						'point_type' => array(
							'type'        => 'string',
							'description' => 'The point type key. Optional, defaults to default type.',
						),
					),
					'required'   => array( 'hooks' ),
				),
				'output_schema'       => array(
					'type'       => 'object',
					'properties' => array(
						'success' => array( 'type' => 'boolean' ),
						'message' => array( 'type' => 'string' ),
					),
					'required'   => array( 'success', 'message' ),
				),
			) );

			// Ability 7: create-point-type
			wp_register_ability( 'mycred/create-point-type', array(
				'label'               => __( 'Create Point Type', 'mycred' ),
				'description'         => __( 'Registers a new myCred point type with a unique meta key and display names.', 'mycred' ),
				'category'            => 'mycred',
				'execute_callback'    => array( $this, 'execute_create_point_type' ),
				'permission_callback' => array( $this, 'admin_permission_callback' ),
				'input_schema'        => array(
					'type'       => 'object',
					'properties' => array(
						'key' => array(
							'type'        => 'string',
							'description' => 'The meta key for the new point type. Lowercase letters and underscores only; spaces and hyphens are converted to underscores.',
						),
						'plural' => array(
							'type'        => 'string',
							'description' => 'The plural display name for the point type (e.g., Gold Coins).',
						),
						'singular' => array(
							'type'        => 'string',
							'description' => 'The singular display name. Optional; defaults to the plural name if omitted.',
						),
					),
					'required'   => array( 'key', 'plural' ),
				),
				'output_schema'       => array(
					'type'       => 'object',
					'properties' => array(
						'success'    => array( 'type' => 'boolean' ),
						'message'    => array( 'type' => 'string' ),
						'point_type' => array( 'type' => 'string' ),
						'singular'   => array( 'type' => 'string' ),
						'plural'     => array( 'type' => 'string' ),
					),
					'required'   => array( 'success', 'message', 'point_type', 'singular', 'plural' ),
				),
			) );

			// Ability 8: get-general-settings
			wp_register_ability( 'mycred/get-general-settings', array(
				'label'               => __( 'Get General Settings', 'mycred' ),
				'description'         => __( 'Retrieves current myCred general settings from saved options. Secret values are redacted.', 'mycred' ),
				'category'            => 'mycred',
				'execute_callback'    => array( $this, 'execute_get_general_settings' ),
				'permission_callback' => array( $this, 'admin_permission_callback' ),
				'input_schema'        => array(
					'type'       => 'object',
					'properties' => array(
						'section' => array(
							'type'        => 'string',
							'description' => 'Optional section filter (e.g. core, remote, dashboard, ai, export, open_badge, credly, badgr, zapier, github, emailnotices, badges, ranks).',
						),
						'point_type' => array(
							'type'        => 'string',
							'description' => 'The point type key. Optional, defaults to default type.',
						),
					),
				),
				'output_schema'       => array(
					'type'       => 'object',
					'properties' => array(
						'success'          => array( 'type' => 'boolean' ),
						'message'          => array( 'type' => 'string' ),
						'point_type'       => array( 'type' => 'string' ),
						'section'          => array( 'type' => 'string' ),
						'settings'         => array( 'type' => 'object' ),
						'updatable_fields' => array( 'type' => 'array' ),
					),
					'required'   => array( 'success', 'message', 'settings' ),
				),
			) );

			// Ability 9: update-general-settings
			wp_register_ability( 'mycred/update-general-settings', array(
				'label'               => __( 'Update General Settings', 'mycred' ),
				'description'         => __( 'Partially updates myCred general settings from a nested settings object. Confirm changes with the user before calling.', 'mycred' ),
				'category'            => 'mycred',
				'execute_callback'    => array( $this, 'execute_update_general_settings' ),
				'permission_callback' => array( $this, 'admin_permission_callback' ),
				'input_schema'        => array(
					'type'       => 'object',
					'properties' => array(
						'settings' => array(
							'type'        => 'object',
							'description' => 'Nested settings to update (e.g. {"name":{"singular":"Coin","plural":"Coins"},"dashboard":{"dashboard_enable":1}}).',
						),
						'point_type' => array(
							'type'        => 'string',
							'description' => 'The point type key. Optional, defaults to default type.',
						),
					),
					'required'   => array( 'settings' ),
				),
				'output_schema'       => array(
					'type'       => 'object',
					'properties' => array(
						'success'    => array( 'type' => 'boolean' ),
						'message'    => array( 'type' => 'string' ),
						'point_type' => array( 'type' => 'string' ),
						'updated'    => array( 'type' => 'array' ),
						'skipped'    => array( 'type' => 'array' ),
					),
					'required'   => array( 'success', 'message' ),
				),
			) );

			// Ability 10: list-addons
			wp_register_ability( 'mycred/list-addons', array(
				'label'               => __( 'List Add-ons', 'mycred' ),
				'description'         => __( 'Lists built-in and myCred Addons add-ons with enabled status, focusing on those that contribute General Settings. Use before updating addon-dependent settings.', 'mycred' ),
				'category'            => 'mycred',
				'execute_callback'    => array( $this, 'execute_list_addons' ),
				'permission_callback' => array( $this, 'admin_permission_callback' ),
				'input_schema'        => array(
					'type'       => 'object',
					'properties' => array(
						'type' => array(
							'type'        => 'string',
							'description' => 'Filter: all (default), core, or toolkit.',
						),
						'general_settings_only' => array(
							'type'        => 'boolean',
							'description' => 'If true, only list add-ons that expose General Settings. Default true.',
						),
					),
				),
				'output_schema'       => array(
					'type'       => 'object',
					'properties' => array(
						'success' => array( 'type' => 'boolean' ),
						'message' => array( 'type' => 'string' ),
						'addons'  => array( 'type' => 'array' ),
					),
					'required'   => array( 'success', 'message', 'addons' ),
				),
			) );

			// Ability 11: enable-addon
			wp_register_ability( 'mycred/enable-addon', array(
				'label'               => __( 'Enable or Disable Add-on', 'mycred' ),
				'description'         => __( 'Enables or disables a built-in myCred add-on (mycred_pref_addons) or a myCred Addons add-on (mycred_enabled_addons). Required before updating that add-on\'s General Settings.', 'mycred' ),
				'category'            => 'mycred',
				'execute_callback'    => array( $this, 'execute_enable_addon' ),
				'permission_callback' => array( $this, 'admin_permission_callback' ),
				'input_schema'        => array(
					'type'       => 'object',
					'properties' => array(
						'slug' => array(
							'type'        => 'string',
							'description' => 'Add-on slug (e.g. badges, email-notices, mycred-zapier).',
						),
						'type' => array(
							'type'        => 'string',
							'description' => 'Add-on type: core or toolkit (myCred Addons). Optional; auto-detected from slug when omitted.',
						),
						'enable' => array(
							'type'        => 'boolean',
							'description' => 'True to enable (default), false to disable.',
						),
					),
					'required'   => array( 'slug' ),
				),
				'output_schema'       => array(
					'type'       => 'object',
					'properties' => array(
						'success' => array( 'type' => 'boolean' ),
						'message' => array( 'type' => 'string' ),
						'slug'    => array( 'type' => 'string' ),
						'type'    => array( 'type' => 'string' ),
						'enabled' => array( 'type' => 'boolean' ),
					),
					'required'   => array( 'success', 'message', 'slug', 'enabled' ),
				),
			) );

			// Ability 12: ensure-toolkit-plugin (install from wordpress.org + activate).
			wp_register_ability( 'mycred/ensure-toolkit-plugin', array(
				'label'               => __( 'Install / Activate myCred Addons', 'mycred' ),
				'description'         => __( 'Ensures the free myCred Addons WordPress plugin is installed (from wordpress.org if missing) and activated. Required before enabling myCred Addons add-ons like Credly, Badgr, or Zapier. Always confirm with the user first and pass confirm=true.', 'mycred' ),
				'category'            => 'mycred',
				'execute_callback'    => array( $this, 'execute_ensure_toolkit_plugin' ),
				'permission_callback' => array( $this, 'admin_permission_callback' ),
				'input_schema'        => array(
					'type'       => 'object',
					'properties' => array(
						'confirm' => array(
							'type'        => 'boolean',
							'description' => 'Must be true after the user confirms install/activate.',
						),
						'activate_only' => array(
							'type'        => 'boolean',
							'description' => 'If true, only activate an already-installed myCred Addons plugin (do not download/install). Default false.',
						),
					),
					'required'   => array( 'confirm' ),
				),
				'output_schema'       => array(
					'type'       => 'object',
					'properties' => array(
						'success'  => array( 'type' => 'boolean' ),
						'message'  => array( 'type' => 'string' ),
						'status'   => array( 'type' => 'string' ),
						'plugin'   => array( 'type' => 'string' ),
						'installed'=> array( 'type' => 'boolean' ),
						'active'   => array( 'type' => 'boolean' ),
					),
					'required'   => array( 'success', 'message', 'status' ),
				),
			) );

			if ( self::is_ranks_addon_active() ) {
				$this->register_ranks_abilities();
			}

			if ( self::is_badges_addon_active() ) {
				$this->register_badges_abilities();
			}
		}
		
		/**
		 * Whether the built-in Ranks addon is enabled and loaded.
		 *
		 * @return bool
		 */
		public static function is_ranks_addon_active() {
			return class_exists( 'myCRED_Ranks_Module' ) && self::instance()->is_addon_active( 'ranks' );
		}

        	/**
		 * Whether the built-in Badges addon is enabled and loaded.
		 *
		 * @return bool
		 */
		public static function is_badges_addon_active() {
			return class_exists( 'myCRED_Badge_Module' ) && self::instance()->is_addon_active( 'badges' );
		}

        	/**
		 * Whether a built-in myCred addon slug is enabled.
		 *
		 * @param string $slug Addon slug (e.g. ranks, badges).
		 * @return bool
		 */
		public function is_addon_active( $slug ) {
			$addons_prefs = get_option( 'mycred_pref_addons', array() );
			$active       = ! empty( $addons_prefs['active'] ) ? $addons_prefs['active'] : array();
			return in_array( $slug, $active, true );
		}
		
		/**
		 * Register ranks-related abilities when the built-in Ranks addon is active.
		 */
		protected function register_ranks_abilities() {
			wp_register_ability( 'mycred/suggest-ranks', array(
				'label'               => __( 'Suggest Ranks', 'mycred' ),
				'description'         => __( 'Suggests a progression of rank names and point thresholds based on the site type (e.g. Community, LMS, eCommerce).', 'mycred' ),
				'category'            => 'mycred',
				'execute_callback'    => array( $this, 'execute_suggest_ranks' ),
				'permission_callback' => array( $this, 'admin_permission_callback' ),
				'input_schema'        => array(
					'type'       => 'object',
					'properties' => array(
						'site_type' => array(
							'type'        => 'string',
							'description' => 'The type of site (e.g., Community, BuddyBoss, LMS, eCommerce, Blog).',
						),
						'point_type' => array(
							'type'        => 'string',
							'description' => 'The point type key ranks belong to. Optional, defaults to default type.',
						),
					),
					'required'   => array( 'site_type' ),
				),
				'output_schema'       => array(
					'type'       => 'object',
					'properties' => array(
						'suggested_ranks' => array(
							'type'  => 'array',
							'items' => array(
								'type'       => 'object',
								'properties' => array(
									'title'   => array( 'type' => 'string' ),
									'minimum' => array( 'type' => 'number' ),
									'maximum' => array( 'type' => 'number' ),
									'description' => array( 'type' => 'string' ),
								),
							),
						),
						'point_type' => array( 'type' => 'string' ),
					),
					'required'   => array( 'suggested_ranks', 'point_type' ),
				),
			) );

			wp_register_ability( 'mycred/create-ranks', array(
				'label'               => __( 'Create Ranks', 'mycred' ),
				'description'         => __( 'Creates published myCred ranks with title and min/max point thresholds.', 'mycred' ),
				'category'            => 'mycred',
				'execute_callback'    => array( $this, 'execute_create_ranks' ),
				'permission_callback' => array( $this, 'admin_permission_callback' ),
				'input_schema'        => array(
					'type'       => 'object',
					'properties' => array(
						'ranks' => array(
							'type'        => 'array',
							'description' => 'List of ranks to create.',
							'items'       => array(
								'type'       => 'object',
								'properties' => array(
									'title'   => array( 'type' => 'string', 'description' => 'Rank display name.' ),
									'minimum' => array( 'type' => 'number', 'description' => 'Minimum points required (inclusive).' ),
									'maximum' => array( 'type' => 'number', 'description' => 'Maximum points for this rank (inclusive).' ),
								),
								'required'   => array( 'title', 'minimum', 'maximum' ),
							),
						),
						'point_type' => array(
							'type'        => 'string',
							'description' => 'The point type key. Optional, defaults to default type.',
						),
					),
					'required'   => array( 'ranks' ),
				),
				'output_schema'       => array(
					'type'       => 'object',
					'properties' => array(
						'success'       => array( 'type' => 'boolean' ),
						'message'       => array( 'type' => 'string' ),
						'created_ranks' => array(
							'type'  => 'array',
							'items' => array(
								'type'       => 'object',
								'properties' => array(
									'rank_id' => array( 'type' => 'integer' ),
									'title'   => array( 'type' => 'string' ),
									'minimum' => array( 'type' => 'number' ),
									'maximum' => array( 'type' => 'number' ),
								),
							),
						),
					),
					'required'   => array( 'success', 'message', 'created_ranks' ),
				),
			) );
		}

		/**
		 * Register badges-related abilities when the built-in Badges addon is active.
		 */
		protected function register_badges_abilities() {
			wp_register_ability( 'mycred/suggest-badges', array(
				'label'               => __( 'Suggest Badges', 'mycred' ),
				'description'         => __( 'Suggests badge names and earning criteria based on the site type (e.g. Community, LMS).', 'mycred' ),
				'category'            => 'mycred',
				'execute_callback'    => array( $this, 'execute_suggest_badges' ),
				'permission_callback' => array( $this, 'admin_permission_callback' ),
				'input_schema'        => array(
					'type'       => 'object',
					'properties' => array(
						'site_type' => array(
							'type'        => 'string',
							'description' => 'The type of site (e.g., Community, BuddyBoss, LMS, eCommerce, Blog).',
						),
						'point_type' => array(
							'type'        => 'string',
							'description' => 'The point type key for automatic badge requirements. Optional, defaults to default type.',
						),
					),
					'required'   => array( 'site_type' ),
				),
				'output_schema'       => array(
					'type'       => 'object',
					'properties' => array(
						'suggested_badges' => array(
							'type'  => 'array',
							'items' => array(
								'type'       => 'object',
								'properties' => array(
									'title'       => array( 'type' => 'string' ),
									'description' => array( 'type' => 'string' ),
									'manual'      => array( 'type' => 'boolean' ),
									'reference'   => array( 'type' => 'string' ),
									'amount'      => array( 'type' => 'string' ),
									'by'          => array( 'type' => 'string' ),
								),
							),
						),
						'point_type' => array( 'type' => 'string' ),
					),
					'required'   => array( 'suggested_badges', 'point_type' ),
				),
			) );

			wp_register_ability( 'mycred/create-badges', array(
				'label'               => __( 'Create Badges', 'mycred' ),
				'description'         => __( 'Creates published myCred badges, optionally with automatic earning requirements.', 'mycred' ),
				'category'            => 'mycred',
				'execute_callback'    => array( $this, 'execute_create_badges' ),
				'permission_callback' => array( $this, 'admin_permission_callback' ),
				'input_schema'        => array(
					'type'       => 'object',
					'properties' => array(
						'badges' => array(
							'type'        => 'array',
							'description' => 'List of badges to create.',
							'items'       => array(
								'type'       => 'object',
								'properties' => array(
									'title'       => array( 'type' => 'string', 'description' => 'Badge name.' ),
									'description' => array( 'type' => 'string', 'description' => 'Optional badge description shown in admin.' ),
									'manual'      => array( 'type' => 'boolean', 'description' => 'If true, badge is manually awarded by admins only.' ),
									'reference'   => array( 'type' => 'string', 'description' => 'Hook reference for automatic badges (e.g. logging_in, registration, comments).' ),
									'amount'      => array( 'type' => 'string', 'description' => 'Required count/amount for the reference (e.g. "10").' ),
									'by'          => array( 'type' => 'string', 'description' => 'Requirement comparison: count, sum, etc. Defaults to count.' ),
								),
								'required'   => array( 'title' ),
							),
						),
						'point_type' => array(
							'type'        => 'string',
							'description' => 'Point type for automatic requirements. Optional, defaults to default type.',
						),
					),
					'required'   => array( 'badges' ),
				),
				'output_schema'       => array(
					'type'       => 'object',
					'properties' => array(
						'success'        => array( 'type' => 'boolean' ),
						'message'        => array( 'type' => 'string' ),
						'created_badges' => array(
							'type'  => 'array',
							'items' => array(
								'type'       => 'object',
								'properties' => array(
									'badge_id' => array( 'type' => 'integer' ),
									'title'    => array( 'type' => 'string' ),
									'manual'   => array( 'type' => 'boolean' ),
								),
							),
						),
					),
					'required'   => array( 'success', 'message', 'created_badges' ),
				),
			) );
		}
		
		/**
		 * Ability IDs exposed to the AI chat for the current site.
		 *
		 * @return string[]
		 */
		public static function get_chat_abilities() {
			$abilities = array(
				'mycred/get-user-balance',
				'mycred/get-site-points-summary',
				'mycred/award-points',
				'mycred/deduct-points',
				'mycred/suggest-hooks',
				'mycred/apply-hooks',
				'mycred/create-point-type',
				'mycred/get-general-settings',
				'mycred/update-general-settings',
				'mycred/list-addons',
				'mycred/enable-addon',
				'mycred/ensure-toolkit-plugin',
			);

			if ( self::is_ranks_addon_active() ) {
				$abilities[] = 'mycred/suggest-ranks';
				$abilities[] = 'mycred/create-ranks';
			}

			if ( self::is_badges_addon_active() ) {
				$abilities[] = 'mycred/suggest-badges';
				$abilities[] = 'mycred/create-badges';
			}

			/**
			 * Filter abilities exposed via myCred MCP Bridge (and other MCP integrations).
			 *
			 * @param string[] $abilities Ability slugs.
			 */
			return apply_filters( 'mycred_mcp_exposed_abilities', $abilities );
		}

       		 /**
		 * Read ability permission check.
		 *
		 * @param mixed $input Ability input.
		 * @return bool
		 */
		public function permission_callback( $input ) {
			$mycred = mycred();
			$cap    = method_exists( $mycred, 'get_point_editor_capability' )
				? $mycred->get_point_editor_capability()
				: 'export';
			return current_user_can( $cap ) || current_user_can( 'manage_options' );
		}

        	/**
		 * Write/Mutation ability permission check (Strict Point Administrator)
		 */
		public function admin_permission_callback( $input ) {
			$mycred = mycred();
			$cap    = method_exists( $mycred, 'get_point_admin_capability' )
				? $mycred->get_point_admin_capability()
				: 'manage_options';
			return current_user_can( $cap ) || current_user_can( 'manage_options' );
		}
		
		/**
		 * Resolve a user identifier to a user ID.
		 *
		 * @param string $identifier User ID, email, login, or slug.
		 * @return int|false
		 */
		protected function resolve_user_id( $identifier ) {
			if ( empty( $identifier ) ) {
				return false;
			}

			$user = false;

			if ( is_numeric( $identifier ) ) {
				$user = get_user_by( 'id', (int) $identifier );
			}

			if ( ! $user && is_email( $identifier ) ) {
				$user = get_user_by( 'email', $identifier );
			}

			if ( ! $user ) {
				$user = get_user_by( 'slug', $identifier );
			}
			if ( ! $user ) {
				$user = get_user_by( 'login', $identifier );
			}

			return $user ? (int) $user->ID : false;
		}
		
		/**
		 * Ability Callback: Get User Balance
		 */
		public function execute_get_user_balance( $input ) {
			$user_identifier = isset( $input['user'] ) ? sanitize_text_field( $input['user'] ) : '';
			$point_type      = isset( $input['point_type'] ) ? sanitize_text_field( $input['point_type'] ) : MYCRED_DEFAULT_TYPE_KEY;

			$user_id = $this->resolve_user_id( $user_identifier );
			if ( ! $user_id ) {
				return new WP_Error( 'user_not_found', __( 'Specified user could not be found.', 'mycred' ) );
			}

			$mycred  = mycred( $point_type );
			$balance = mycred_get_users_balance( $user_id, $point_type );

			if ( $balance === false ) {
				return new WP_Error( 'excluded_user', __( 'This user is excluded from myCred or cannot be queried.', 'mycred' ) );
			}

			$user_obj = get_userdata( $user_id );
			return array(
				'user_id'           => $user_id,
				'username'          => $user_obj->user_login,
				'balance'           => (float) $balance,
				'formatted_balance' => $mycred->format_creds( $balance ),
				'point_type'        => $point_type,
			);
		}
		
		/**
		 * Ability Callback: Get Site Points Summary
		 */
		public function execute_get_site_points_summary( $input ) {
			global $wpdb;
			$point_type = isset( $input['point_type'] ) ? sanitize_text_field( $input['point_type'] ) : MYCRED_DEFAULT_TYPE_KEY;
			$mycred     = mycred( $point_type );

			// Total circulation query
			$total_circulation = $wpdb->get_var( $wpdb->prepare(
				"SELECT SUM( CAST( meta_value AS DECIMAL( 18, 4 ) ) ) FROM {$wpdb->usermeta} WHERE meta_key = %s",
				$point_type
			) );
			$total_circulation = $total_circulation ? (float) $total_circulation : 0.0;

			// Total log entries
			$log_table         = $mycred->log_table;
			$total_log_entries = $wpdb->get_var( $wpdb->prepare(
				"SELECT COUNT(*) FROM {$log_table} WHERE ctype = %s",
				$point_type
			) );
			$total_log_entries = $total_log_entries ? (int) $total_log_entries : 0;

			// Active members count (users who have at least one log entry)
			$active_members_count = $wpdb->get_var( $wpdb->prepare(
				"SELECT COUNT(DISTINCT user_id) FROM {$log_table} WHERE ctype = %s",
				$point_type
			) );
			$active_members_count = $active_members_count ? (int) $active_members_count : 0;

			// If no log entries, fall back to users who have user meta values
			if ( $active_members_count === 0 ) {
				$active_members_count = $wpdb->get_var( $wpdb->prepare(
					"SELECT COUNT(*) FROM {$wpdb->usermeta} WHERE meta_key = %s AND CAST(meta_value AS DECIMAL(18,4)) != 0",
					$point_type
				) );
				$active_members_count = $active_members_count ? (int) $active_members_count : 0;
			}

			// Point type label
			$point_type_label = isset( $this->point_types[ $point_type ] ) ? $this->point_types[ $point_type ] : $mycred->core['name']['singular'];

			return array(
				'point_type'                  => $point_type,
				'point_type_label'            => $point_type_label,
				'total_circulation'           => $total_circulation,
				'formatted_total_circulation' => $mycred->format_creds( $total_circulation ),
				'total_log_entries'           => $total_log_entries,
				'active_members_count'        => $active_members_count,
			);
		}

		/**
		 * Ability Callback: Award Points
		 */
		public function execute_award_points( $input ) {
			$user_identifier = isset( $input['user'] ) ? sanitize_text_field( $input['user'] ) : '';
			$amount          = isset( $input['amount'] ) ? (float) $input['amount'] : 0.0;
			$reason          = isset( $input['reason'] ) ? sanitize_text_field( $input['reason'] ) : '';
			$point_type      = isset( $input['point_type'] ) ? sanitize_text_field( $input['point_type'] ) : MYCRED_DEFAULT_TYPE_KEY;

			if ( $amount <= 0 ) {
				return new WP_Error( 'invalid_amount', __( 'Award amount must be greater than zero.', 'mycred' ) );
			}

			$user_id = $this->resolve_user_id( $user_identifier );
			if ( ! $user_id ) {
				return new WP_Error( 'user_not_found', __( 'Specified user could not be found.', 'mycred' ) );
			}

			$mycred = mycred( $point_type );
			if ( $mycred->exclude_user( $user_id ) ) {
				return new WP_Error( 'excluded_user', __( 'This user is excluded from myCred and cannot receive points.', 'mycred' ) );
			}

			// Award points using mycred_add
			$success = mycred_add(
				'ai_assistant',
				$user_id,
				$amount,
				$reason,
				get_current_user_id(),
				'',
				$point_type
			);

			if ( ! $success ) {
				return new WP_Error( 'award_failed', __( 'Could not award points to the user.', 'mycred' ) );
			}

			$new_balance = mycred_get_users_balance( $user_id, $point_type );
			$user_obj    = get_userdata( $user_id );

			return array(
				'success'               => true,
				'message'               => sprintf( __( 'Successfully awarded %1$s to %2$s.', 'mycred' ), $mycred->format_creds( $amount ), $user_obj->user_login ),
				'new_balance'           => (float) $new_balance,
				'formatted_new_balance' => $mycred->format_creds( $new_balance ),
			);
		}

		/**
		 * Ability Callback: Deduct Points
		 */
		public function execute_deduct_points( $input ) {
			$user_identifier = isset( $input['user'] ) ? sanitize_text_field( $input['user'] ) : '';
			$amount          = isset( $input['amount'] ) ? (float) $input['amount'] : 0.0;
			$reason          = isset( $input['reason'] ) ? sanitize_text_field( $input['reason'] ) : '';
			$point_type      = isset( $input['point_type'] ) ? sanitize_text_field( $input['point_type'] ) : MYCRED_DEFAULT_TYPE_KEY;

			if ( $amount <= 0 ) {
				return new WP_Error( 'invalid_amount', __( 'Deduct amount must be greater than zero.', 'mycred' ) );
			}

			$user_id = $this->resolve_user_id( $user_identifier );
			if ( ! $user_id ) {
				return new WP_Error( 'user_not_found', __( 'Specified user could not be found.', 'mycred' ) );
			}

			$mycred = mycred( $point_type );
			if ( $mycred->exclude_user( $user_id ) ) {
				return new WP_Error( 'excluded_user', __( 'This user is excluded from myCred and cannot have points deducted.', 'mycred' ) );
			}

			// Deduct points using mycred_subtract
			$success = mycred_subtract(
				'ai_assistant',
				$user_id,
				$amount,
				$reason,
				get_current_user_id(),
				'',
				$point_type
			);

			if ( ! $success ) {
				return new WP_Error( 'deduct_failed', __( 'Could not deduct points from the user.', 'mycred' ) );
			}

			$new_balance = mycred_get_users_balance( $user_id, $point_type );
			$user_obj    = get_userdata( $user_id );

			return array(
				'success'               => true,
				'message'               => sprintf( __( 'Successfully deducted %1$s from %2$s.', 'mycred' ), $mycred->format_creds( $amount ), $user_obj->user_login ),
				'new_balance'           => (float) $new_balance,
				'formatted_new_balance' => $mycred->format_creds( $new_balance ),
			);
		}

		/**
		 * Ability Callback: Suggest Hooks
		 */
		public function execute_suggest_hooks( $input ) {
			$site_type  = isset( $input['site_type'] ) ? sanitize_text_field( $input['site_type'] ) : 'Blog';
			$point_type = isset( $input['point_type'] ) ? sanitize_text_field( $input['point_type'] ) : MYCRED_DEFAULT_TYPE_KEY;
			
			$available_hooks  = array();

			$hooks_module = new myCRED_Hooks_Module( $point_type );
			$installed    = $hooks_module->get( false );

			$option_key     = $point_type === MYCRED_DEFAULT_TYPE_KEY ? 'mycred_pref_hooks' : 'mycred_pref_hooks_' . $point_type;
			$hooks_settings = get_option( $option_key, array() );

			$registered_hooks = isset( $installed ) && is_array( $installed ) ? $installed : array();

			foreach ( $registered_hooks as $hook_id => $hook_data ) {
				$hook_callback    = isset( $hook_data['callback'] ) ? $hook_data['callback'] : null;
				$hook_object      = null;
				$settings_shape   = isset( $hooks_settings['hook_prefs'][ $hook_id ] ) && is_array( $hooks_settings['hook_prefs'][ $hook_id ] )
					? $hooks_settings['hook_prefs'][ $hook_id ]
					: array();
				$repeatable_fields = array();
				$fields            = array();
				$payload_hint      = array();

				if ( is_array( $hook_callback ) && ! empty( $hook_callback[0] ) && class_exists( $hook_callback[0] ) ) {
					$hook_class  = $hook_callback[0];
					$hook_object = new $hook_class( isset( $hooks_settings['hook_prefs'] ) ? $hooks_settings['hook_prefs'] : array(), $point_type );
				}

				if ( empty( $settings_shape ) && $hook_object && isset( $hook_object->defaults ) && is_array( $hook_object->defaults ) ) {
					$settings_shape = $hook_object->defaults;
				}

				if ( ! empty( $settings_shape ) ) {
					$pending_nodes = array(
						array(
							'path'  => '',
							'value' => $settings_shape,
						)
					);

					while ( ! empty( $pending_nodes ) ) {
						$node = array_shift( $pending_nodes );
						$path = $node['path'];
						$value = $node['value'];

						if ( ! is_array( $value ) ) {
							$fields[] = array(
								'path'        => $path,
								'type'        => gettype( $value ),
								'is_multiple' => false,
							);
							continue;
						}

						$is_list = array_keys( $value ) === range( 0, count( $value ) - 1 );
						if ( $path !== '' ) {
							$fields[] = array(
								'path'        => $path,
								'type'        => 'array',
								'is_multiple' => $is_list,
							);
						}

						if ( $path === '' ) {
							foreach ( $value as $child_key => $child_value ) {
								if ( is_array( $child_value ) ) {
									$repeatable_fields[] = (string) $child_key;
								}
							}
						}

						foreach ( $value as $child_key => $child_value ) {
							$child_path = $path === '' ? (string) $child_key : $path . '.' . $child_key;

							if ( is_array( $child_value ) ) {
								if ( array_keys( $child_value ) === range( 0, count( $child_value ) - 1 ) ) {
									$sample = reset( $child_value );
									if ( is_array( $sample ) ) {
										$payload_hint[ $child_key ] = array(
											array_fill_keys( array_keys( $sample ), '' ),
										);
									} else {
										$payload_hint[ $child_key ] = array();
									}
								} elseif ( $path === '' ) {
									$payload_hint[ $child_key ] = $child_value;
								}
								$pending_nodes[] = array(
									'path'  => $child_path,
									'value' => $child_value,
								);
							} else {
								if ( $path === '' ) {
									$payload_hint[ $child_key ] = $child_value;
								}
								$fields[] = array(
									'path'        => $child_path,
									'type'        => gettype( $child_value ),
									'is_multiple' => false,
								);
							}
						}
					}
				}

				$available_hooks[] = array(
					'hook_id'     => $hook_id,
					'description' => ! empty( $hook_data['description'] ) ? wp_strip_all_tags( $hook_data['description'] ) : sprintf( __( 'Available myCred hook: %s', 'mycred' ), $hook_id ),
					'fields'           => $fields,
					'repeatable_fields' => array_values( array_unique( $repeatable_fields ) ),
					'settings_shape'   => $settings_shape,
					'payload_hint'     => $payload_hint,
				);
			}

			return array(
				'suggested_hooks' => $available_hooks,
			);
		}

		/**
		 * Ability Callback: Apply Hooks (Overwrite)
		 */
		public function execute_apply_hooks( $input ) {
			$hooks      = isset( $input['hooks'] ) && is_array( $input['hooks'] ) ? $input['hooks'] : array();
			$point_type = isset( $input['point_type'] ) ? sanitize_text_field( $input['point_type'] ) : MYCRED_DEFAULT_TYPE_KEY;

			if ( empty( $hooks ) ) {
				return new WP_Error( 'no_hooks', __( 'No hooks provided to apply.', 'mycred' ) );
			}

			$option_key     = $point_type === MYCRED_DEFAULT_TYPE_KEY ? 'mycred_pref_hooks' : 'mycred_pref_hooks_' . $point_type;
			$hooks_settings = get_option( $option_key, array() );
			$hooks_module   = new myCRED_Hooks_Module( $point_type );
			$registered     = $hooks_module->get( false );
			
			if ( ! isset( $hooks_settings['active'] ) ) {
				$hooks_settings['active'] = array();
			}
			if ( ! isset( $hooks_settings['hook_prefs'] ) ) {
				$hooks_settings['hook_prefs'] = array();
			}

			$installed_hooks = is_array( $registered ) ? array_keys( $registered ) : array();

			// Overwrite the active hooks array with the new list
			$active_hooks = array();

			foreach ( $hooks as $hook ) {
				if ( empty( $hook['hook_id'] ) ) {
					continue;
				}
				$hook_id = sanitize_text_field( $hook['hook_id'] );
				
				// Ensure the hook is actually available on the site
				if ( ! empty( $installed_hooks ) && ! in_array( $hook_id, $installed_hooks ) ) {
					continue;
				}

				if ( empty( $registered[ $hook_id ]['callback'] ) ) {
					continue;
				}

				$hook_callback = $registered[ $hook_id ]['callback' ];
				$hook_object   = null;
				if ( is_array( $hook_callback ) && ! empty( $hook_callback[0] ) && class_exists( $hook_callback[0] ) ) {
					$hook_class  = $hook_callback[0];
					$hook_object = new $hook_class( $hooks_settings['hook_prefs'], $point_type );
				}
				
				$active_hooks[] = $hook_id;

				$raw_settings = array();
				if ( isset( $hook['settings'] ) && is_array( $hook['settings'] ) ) {
					$raw_settings = $hook['settings'];
				} else {
					$raw_settings = $hook;
					unset( $raw_settings['hook_id'] );
				}

				if ( empty( $raw_settings ) && isset( $hooks_settings['hook_prefs'][ $hook_id ] ) && is_array( $hooks_settings['hook_prefs'][ $hook_id ] ) ) {
					$raw_settings = $hooks_settings['hook_prefs'][ $hook_id ];
				}

				if ( empty( $raw_settings ) ) {
					$creds = isset( $hook['creds'] ) ? (float) $hook['creds'] : 1;
					$log   = isset( $hook['log'] ) && ! empty( $hook['log'] ) ? sanitize_text_field( $hook['log'] ) : '%plural% for ' . str_replace( '_', ' ', $hook_id );
					$raw_settings = array(
						'creds' => $creds,
						'log'   => $log,
						'limit' => '0/x',
					);
				}

				$row_settings = array();
				if ( isset( $raw_settings['occurrences'] ) && is_array( $raw_settings['occurrences'] ) ) {
					$row_settings = $raw_settings['occurrences'];
				} elseif ( isset( $raw_settings['items'] ) && is_array( $raw_settings['items'] ) ) {
					$row_settings = $raw_settings['items'];
				} elseif ( isset( $raw_settings['rows'] ) && is_array( $raw_settings['rows'] ) ) {
					$row_settings = $raw_settings['rows'];
				} elseif ( isset( $raw_settings[0] ) && is_array( $raw_settings[0] ) ) {
					$row_settings = $raw_settings;
				}

				if ( ! empty( $row_settings ) ) {
					$shape_source = array();
					if ( isset( $hooks_settings['hook_prefs'][ $hook_id ] ) && is_array( $hooks_settings['hook_prefs'][ $hook_id ] ) ) {
						$shape_source = $hooks_settings['hook_prefs'][ $hook_id ];
					} elseif ( $hook_object && isset( $hook_object->defaults ) && is_array( $hook_object->defaults ) ) {
						$shape_source = $hook_object->defaults;
					}

					$repeatable_fields = array();
					foreach ( $shape_source as $field_key => $field_value ) {
						if ( is_array( $field_value ) ) {
							$repeatable_fields[] = $field_key;
						}
					}

					if ( ! empty( $repeatable_fields ) ) {
						$normalized_settings = array();
						foreach ( $repeatable_fields as $field_key ) {
							$normalized_settings[ $field_key ] = array();
						}

						foreach ( $row_settings as $index => $row_setting ) {
							if ( ! is_array( $row_setting ) ) {
								continue;
							}

							foreach ( $repeatable_fields as $field_key ) {
								$field_aliases = array( $field_key );
								if ( substr( $field_key, -1 ) === 's' ) {
									$field_aliases[] = substr( $field_key, 0, -1 );
								}
								if ( $field_key === 'creds' ) {
									$field_aliases[] = 'amount';
								}

								$field_value = null;
								foreach ( $field_aliases as $field_alias ) {
									if ( array_key_exists( $field_alias, $row_setting ) ) {
										$field_value = $row_setting[ $field_alias ];
										break;
									}
								}

								if ( $field_value === null ) {
									$field_value = array_key_exists( $field_key, $shape_source ) ? $shape_source[ $field_key ] : array();
									if ( is_array( $field_value ) ) {
										$field_value = '';
									}
								}

								$normalized_settings[ $field_key ][ $index ] = $field_value;
							}
						}

						$raw_settings = $normalized_settings;
					}
				}

				$sanitized_settings = $hooks_module->call( 'sanitise_preferences', $hook_callback, $raw_settings );
				if ( is_array( $sanitized_settings ) ) {
					$hooks_settings['hook_prefs'][ $hook_id ] = $sanitized_settings;
				}
			}

			// In myCred, active hooks are stored directly in mycred_pref_hooks['active']
			$hooks_settings['active'] = $active_hooks;
			$hooks_settings['installed'] = $registered;

			// Save options
			update_option( $option_key, $hooks_settings );

			return array(
				'success' => true,
				'message' => sprintf( __( 'Successfully applied %d available hooks. Existing hooks were overwritten.', 'mycred' ), count( $active_hooks ) ),
			);
		}

		/**
		 * Ability Callback: Create Point Type
		 */
		public function execute_create_point_type( $input ) {
			$key      = isset( $input['key'] ) ? sanitize_text_field( $input['key'] ) : '';
			$plural   = isset( $input['plural'] ) ? sanitize_text_field( $input['plural'] ) : '';
			$singular = isset( $input['singular'] ) ? sanitize_text_field( $input['singular'] ) : '';

			if ( empty( $key ) || empty( $plural ) ) {
				return new WP_Error( 'missing_fields', __( 'Both key and plural name are required to create a point type.', 'mycred' ) );
			}

			$key = str_replace( array( ' ', '-' ), '_', $key );
			$key = sanitize_key( $key );

			if ( empty( $key ) ) {
				return new WP_Error( 'invalid_key', __( 'The point type key is invalid after sanitization.', 'mycred' ) );
			}

			if ( $key === MYCRED_DEFAULT_TYPE_KEY ) {
				return new WP_Error( 'invalid_key', __( 'The default point type key cannot be used for a new point type.', 'mycred' ) );
			}

			if ( function_exists( 'mycred_point_type_exists' ) && mycred_point_type_exists( $key ) ) {
				return new WP_Error( 'point_type_exists', __( 'A point type with this key already exists.', 'mycred' ) );
			}

			$types = mycred_get_option( 'mycred_types', array( MYCRED_DEFAULT_TYPE_KEY => mycred_label() ) );
			if ( array_key_exists( $key, $types ) ) {
				return new WP_Error( 'point_type_exists', __( 'A point type with this key already exists.', 'mycred' ) );
			}

			if ( empty( $singular ) ) {
				$singular = $plural;
			}

			$result = $this->create_point_type( $key, $plural, $singular );
			if ( is_wp_error( $result ) ) {
				return $result;
			}

			return array(
				'success'    => true,
				'message'    => sprintf(
					__( 'Successfully created point type "%1$s" (key: %2$s). Reload the admin page to see the new type in menus and settings.', 'mycred' ),
					$plural,
					$key
				),
				'point_type' => $key,
				'singular'   => $singular,
				'plural'     => $plural,
			);
		}

		/**
		 * Persist a new point type (mirrors myCRED_Settings_Module::sanitize_settings).
		 *
		 * @param string $key      Sanitized point type key.
		 * @param string $plural   Plural display name.
		 * @param string $singular Singular display name.
		 * @return true|WP_Error
		 */
		private function create_point_type( $key, $plural, $singular ) {
			$type_settings = mycred_get_option( 'mycred_pref_core_' . $key );
			if ( ! empty( $type_settings ) ) {
				return new WP_Error( 'point_type_exists', __( 'A point type with this key already exists.', 'mycred' ) );
			}

			$defaults = mycred()->defaults();
			$defaults['cred_id']              = $key;
			$defaults['name']['singular']     = $singular;
			$defaults['name']['plural']       = $plural;

			$saved = mycred_update_option( 'mycred_pref_core_' . $key, $defaults );
			if ( ! $saved ) {
				return new WP_Error( 'create_failed', __( 'Could not save point type settings.', 'mycred' ) );
			}

			$types           = mycred_get_option( 'mycred_types', array( MYCRED_DEFAULT_TYPE_KEY => mycred_label() ) );
			$types[ $key ]   = $plural;
			$types_saved     = mycred_update_option( 'mycred_types', $types );
			if ( ! $types_saved ) {
				return new WP_Error( 'create_failed', __( 'Could not update the point types registry.', 'mycred' ) );
			}

			if ( function_exists( 'mycred_upload_default_point_image' ) ) {
				mycred_upload_default_point_image();
			}

			return true;
		}

		/**
		 * Catalog of add-ons that expose General Settings (and related sections).
		 *
		 * @return array<string, array{type:string,label:string,section:string}>
		 */
		public function get_general_settings_addon_catalog() {
			$items = array(
				'email-notices'           => array( 'type' => 'core', 'label' => 'Email Notices', 'section' => 'emailnotices' ),
				'notifications'           => array( 'type' => 'core', 'label' => 'Notifications', 'section' => 'notifications' ),
				'coupons'                 => array( 'type' => 'core', 'label' => 'Coupons', 'section' => 'coupons' ),
				'transfer'                => array( 'type' => 'core', 'label' => 'Transfers', 'section' => 'transfers' ),
				'badges'                  => array( 'type' => 'core', 'label' => 'Badges', 'section' => 'badges' ),
				'ranks'                   => array( 'type' => 'core', 'label' => 'Ranks', 'section' => 'ranks' ),
				'sell-content'            => array( 'type' => 'core', 'label' => 'Sell Content', 'section' => 'sell_content' ),
				'stats'                   => array( 'type' => 'core', 'label' => 'Statistics', 'section' => 'stats' ),
				'buy-creds'               => array( 'type' => 'core', 'label' => 'buyCRED', 'section' => 'buy_creds' ),
				'cash-creds'              => array( 'type' => 'core', 'label' => 'cashCRED', 'section' => 'cashcreds' ),
				'woocommerce'             => array( 'type' => 'core', 'label' => 'WooCommerce', 'section' => 'woocommerce' ),
				'mycred-credly'           => array( 'type' => 'toolkit', 'label' => 'Credly', 'section' => 'credly' ),
				'mycred-badgr'            => array( 'type' => 'toolkit', 'label' => 'Badgr', 'section' => 'badgr' ),
				'mycred-zapier'           => array( 'type' => 'toolkit', 'label' => 'Zapier', 'section' => 'zapier' ),
				'mycred-github'           => array( 'type' => 'toolkit', 'label' => 'GitHub App', 'section' => 'github' ),
				'mycred-buddyboss'        => array( 'type' => 'toolkit', 'label' => 'BuddyBoss Display', 'section' => 'bboss' ),
				'mycred-social-proof'     => array( 'type' => 'toolkit', 'label' => 'Social Proof', 'section' => 'social_proof' ),
				'mycred-progress-map'     => array( 'type' => 'toolkit', 'label' => 'Progress Map', 'section' => 'progress_map' ),
				'mycred-expiration-addon' => array( 'type' => 'toolkit', 'label' => 'Expiration', 'section' => 'expiration' ),
				'mycred-notice-plus'      => array( 'type' => 'toolkit', 'label' => 'Notifications Plus', 'section' => 'notifications' ),
				'mycred-rest'             => array( 'type' => 'toolkit', 'label' => 'REST API', 'section' => 'rest_api' ),
				'mycred-pacman'           => array( 'type' => 'toolkit', 'label' => 'Pacman', 'section' => 'pacman' ),
				'mycred-transfer-plus'    => array( 'type' => 'toolkit', 'label' => 'Transfer Plus', 'section' => 'transfer_plus' ),
				'mycred-sms-payments'     => array( 'type' => 'toolkit', 'label' => 'SMS Payments', 'section' => 'sms_payments' ),
				'mycred-userpro'          => array( 'type' => 'toolkit', 'label' => 'UserPro', 'section' => 'userpro' ),
				'mycred-pending-points'   => array( 'type' => 'toolkit', 'label' => 'Pending Points', 'section' => 'pending_points' ),
				'mycred-level-cred'       => array( 'type' => 'toolkit', 'label' => 'LevelCred', 'section' => 'level_cred' ),
				'mycred-woocommerce-plus' => array( 'type' => 'toolkit', 'label' => 'WooCommerce Plus', 'section' => 'woocommerce_plus' ),
			);

			/**
			 * Filter the add-on catalog used by list/enable abilities.
			 *
			 * @param array $items Slug => meta.
			 */
			return apply_filters( 'mycred_ai_general_settings_addon_catalog', $items );
		}

		/**
		 * Known built-in core addon slugs (folder names under addons/).
		 *
		 * @return string[]
		 */
		protected function get_known_core_addon_slugs() {
			$catalog = array_keys(
				array_filter(
					$this->get_general_settings_addon_catalog(),
					function ( $item ) {
						return 'core' === $item['type'];
					}
				)
			);
			$extra = array( 'banking', 'gateway', 'woocommerce', 'badge-plus', 'rank-plus', 'badge-editor', 'birthday' );
			return array_values( array_unique( array_merge( $catalog, $extra ) ) );
		}

		/**
		 * Resolve whether a slug is core or toolkit.
		 *
		 * @param string $slug Addon slug.
		 * @param string $type Hint: core|toolkit|empty.
		 * @return string|WP_Error core|toolkit
		 */
		protected function resolve_addon_type( $slug, $type = '' ) {
			$type = sanitize_key( $type );
			if ( in_array( $type, array( 'core', 'toolkit' ), true ) ) {
				return $type;
			}
			$catalog = $this->get_general_settings_addon_catalog();
			if ( isset( $catalog[ $slug ] ) ) {
				return $catalog[ $slug ]['type'];
			}
			if ( in_array( $slug, $this->get_known_core_addon_slugs(), true ) ) {
				return 'core';
			}
			if ( 0 === strpos( $slug, 'mycred-' ) || 'ai-assistant' === $slug ) {
				return 'toolkit';
			}
			return new WP_Error(
				'unknown_addon_type',
				sprintf(
					/* translators: %s: addon slug */
					__( 'Could not determine add-on type for "%s". Pass type=core or type=toolkit.', 'mycred' ),
					$slug
				)
			);
		}

		/**
		 * Whether a built-in core addon folder exists.
		 *
		 * @param string $slug Addon slug.
		 * @return bool
		 */
		protected function core_addon_exists( $slug ) {
			if ( ! defined( 'myCRED_ADDONS_DIR' ) ) {
				return in_array( $slug, $this->get_known_core_addon_slugs(), true );
			}
			$file = myCRED_ADDONS_DIR . $slug . '/myCRED-addon-' . $slug . '.php';
			return file_exists( $file );
		}

		/**
		 * myCred Addons free/Pro root directories that may contain addons.
		 *
		 * @return string[]
		 */
		protected function get_toolkit_addon_root_dirs() {
			$dirs = array();
			if ( defined( 'MYCRED_TOOLKIT_ROOT_DIR_PRO' ) ) {
				$dirs[] = MYCRED_TOOLKIT_ROOT_DIR_PRO;
			}
			if ( defined( 'MYCRED_TOOLKIT_ROOT_DIR' ) ) {
				$dirs[] = MYCRED_TOOLKIT_ROOT_DIR;
			}
			return $dirs;
		}

		/**
		 * Whether a myCred Addons add-on folder exists (free myCred Addons or myCred Addons Pro).
		 *
		 * @param string $slug myCred Addons add-on slug.
		 * @return bool
		 */
		protected function toolkit_addon_exists( $slug ) {
			$slug = sanitize_text_field( $slug );
			foreach ( $this->get_toolkit_addon_root_dirs() as $root ) {
				$file = $root . 'includes/addons/' . $slug . '/' . $slug . '.php';
				if ( file_exists( $file ) ) {
					return true;
				}
			}
			return false;
		}

		/**
		 * Ability Callback: List Add-ons.
		 *
		 * @param array $input Input.
		 * @return array
		 */
		public function execute_list_addons( $input ) {
			$type_filter = isset( $input['type'] ) ? sanitize_key( $input['type'] ) : 'all';
			$gs_only     = ! isset( $input['general_settings_only'] ) || (bool) $input['general_settings_only'];

			$toolkit_plugin_active = $this->is_toolkit_plugin_active();
			$catalog               = $this->get_general_settings_addon_catalog();
			$addons                = array();

			if ( $gs_only ) {
				foreach ( $catalog as $slug => $meta ) {
					if ( 'all' !== $type_filter && $meta['type'] !== $type_filter ) {
						continue;
					}
					$enabled = ( 'core' === $meta['type'] )
						? $this->is_addon_active( $slug )
						: $this->is_toolkit_addon_active( $slug );
					$item    = array(
						'slug'                 => $slug,
						'type'                 => $meta['type'],
						'label'                => $meta['label'],
						'section'              => $meta['section'],
						'enabled'              => $enabled,
						'has_general_settings' => true,
						'available'            => ( 'core' === $meta['type'] )
							? $this->core_addon_exists( $slug )
							: ( $toolkit_plugin_active && $this->toolkit_addon_exists( $slug ) ),
					);
					if ( 'toolkit' === $meta['type'] ) {
						$item['toolkit_plugin_active']      = $toolkit_plugin_active;
						$item['toolkit_free_plugin_active'] = $this->is_toolkit_free_plugin_active();
						$item['toolkit_pro_plugin_active']  = $this->is_toolkit_pro_plugin_active();
						$item['listed_enabled']             = $this->is_toolkit_addon_listed_enabled( $slug );
						if ( ! $toolkit_plugin_active ) {
							$item['blocker'] = __( 'Activate myCred Addons Pro, or use mycred/ensure-toolkit-plugin (confirm=true) for free myCred Addons first.', 'mycred' );
						} elseif ( ! $item['listed_enabled'] ) {
							$item['blocker'] = __( 'Enable this myCred Addons add-on with mycred/enable-addon (type=toolkit).', 'mycred' );
						}
					}
					$addons[] = $item;
				}
			} else {
				if ( 'toolkit' !== $type_filter ) {
					foreach ( $this->get_known_core_addon_slugs() as $slug ) {
						$meta     = isset( $catalog[ $slug ] ) ? $catalog[ $slug ] : array(
							'type'    => 'core',
							'label'   => $slug,
							'section' => '',
						);
						$addons[] = array(
							'slug'                 => $slug,
							'type'                 => 'core',
							'label'                => $meta['label'],
							'section'              => isset( $meta['section'] ) ? $meta['section'] : '',
							'enabled'              => $this->is_addon_active( $slug ),
							'has_general_settings' => isset( $catalog[ $slug ] ),
							'available'            => $this->core_addon_exists( $slug ),
						);
					}
				}
				if ( 'core' !== $type_filter ) {
					$seen_toolkit = array();
					foreach ( $this->get_toolkit_addon_root_dirs() as $root ) {
						$toolkit_dir = $root . 'includes/addons/';
						if ( ! is_dir( $toolkit_dir ) ) {
							continue;
						}
						$dirs = scandir( $toolkit_dir );
						foreach ( (array) $dirs as $dir ) {
							if ( '.' === $dir || '..' === $dir || ! is_dir( $toolkit_dir . $dir ) || isset( $seen_toolkit[ $dir ] ) ) {
								continue;
							}
							if ( ! $this->toolkit_addon_exists( $dir ) ) {
								continue;
							}
							$seen_toolkit[ $dir ] = true;
							$meta                 = isset( $catalog[ $dir ] ) ? $catalog[ $dir ] : array(
								'type'    => 'toolkit',
								'label'   => $dir,
								'section' => '',
							);
							$addons[]             = array(
								'slug'                  => $dir,
								'type'                  => 'toolkit',
								'label'                 => $meta['label'],
								'section'               => isset( $meta['section'] ) ? $meta['section'] : '',
								'enabled'               => $this->is_toolkit_addon_active( $dir ),
								'has_general_settings'  => isset( $catalog[ $dir ] ),
								'available'             => true,
								'toolkit_plugin_active' => $toolkit_plugin_active,
							);
						}
					}
				}
			}

			$message = sprintf(
				/* translators: %d: addon count */
				__( 'Found %d add-on(s). Enable inactive ones with mycred/enable-addon before updating their General Settings.', 'mycred' ),
				count( $addons )
			);
			if ( ! $toolkit_plugin_active && ( 'all' === $type_filter || 'toolkit' === $type_filter ) ) {
				$message .= ' ' . __( 'Neither free myCred Addons nor myCred Addons Pro is active — activate myCred Addons Pro, or use mycred/ensure-toolkit-plugin (confirm=true) for free myCred Addons, before enabling myCred Addons add-ons.', 'mycred' );
			}

			return array(
				'success'                    => true,
				'toolkit_plugin_active'      => $toolkit_plugin_active,
				'toolkit_free_plugin_active' => $this->is_toolkit_free_plugin_active(),
				'toolkit_pro_plugin_active'  => $this->is_toolkit_pro_plugin_active(),
				'addons'                     => $addons,
				'message'                    => $message,
			);
		}

		/**
		 * Ability Callback: Enable or Disable Add-on.
		 *
		 * @param array $input Input.
		 * @return array|WP_Error
		 */
		public function execute_enable_addon( $input ) {
			$slug   = isset( $input['slug'] ) ? sanitize_text_field( $input['slug'] ) : '';
			$type   = isset( $input['type'] ) ? sanitize_key( $input['type'] ) : '';
			$enable = ! isset( $input['enable'] ) || (bool) $input['enable'];

			if ( '' === $slug ) {
				return new WP_Error( 'missing_slug', __( 'Add-on slug is required.', 'mycred' ) );
			}

			// Normalize common aliases.
			$aliases = array(
				'emailnotices'     => 'email-notices',
				'buycred'          => 'buy-creds',
				'buy_creds'        => 'buy-creds',
				'cashcred'         => 'cash-creds',
				'cashcreds'        => 'cash-creds',
				'sell_content'     => 'sell-content',
				'transfers'        => 'transfer',
				'credly'           => 'mycred-credly',
				'badgr'            => 'mycred-badgr',
				'zapier'           => 'mycred-zapier',
				'github'           => 'mycred-github',
				'buddyboss'        => 'mycred-buddyboss',
				'bboss'            => 'mycred-buddyboss',
				'social_proof'     => 'mycred-social-proof',
				'social-proof'     => 'mycred-social-proof',
				'progress_map'     => 'mycred-progress-map',
				'progress-map'     => 'mycred-progress-map',
				'expiration'       => 'mycred-expiration-addon',
				'notice-plus'      => 'mycred-notice-plus',
				'notice_plus'      => 'mycred-notice-plus',
				'rest'             => 'mycred-rest',
				'rest-api'         => 'mycred-rest',
				'pacman'           => 'mycred-pacman',
				'transfer-plus'    => 'mycred-transfer-plus',
				'transfer_plus'    => 'mycred-transfer-plus',
				'sms'              => 'mycred-sms-payments',
				'sms-payments'     => 'mycred-sms-payments',
				'userpro'          => 'mycred-userpro',
				'pending-points'   => 'mycred-pending-points',
				'pending_points'   => 'mycred-pending-points',
				'level-cred'       => 'mycred-level-cred',
				'level_cred'       => 'mycred-level-cred',
				'woocommerce-plus' => 'mycred-woocommerce-plus',
				'woo-plus'         => 'mycred-woocommerce-plus',
			);
			if ( isset( $aliases[ $slug ] ) ) {
				$slug = $aliases[ $slug ];
			}

			$resolved = $this->resolve_addon_type( $slug, $type );
			if ( is_wp_error( $resolved ) ) {
				return $resolved;
			}
			$type = $resolved;

			if ( 'core' === $type ) {
				if ( ! $this->core_addon_exists( $slug ) ) {
					return new WP_Error(
						'addon_not_found',
						sprintf(
							/* translators: %s: addon slug */
							__( 'Built-in add-on "%s" was not found.', 'mycred' ),
							$slug
						)
					);
				}

				$addons_prefs = get_option( 'mycred_pref_addons', array() );
				if ( ! is_array( $addons_prefs ) ) {
					$addons_prefs = array();
				}
				if ( empty( $addons_prefs['active'] ) || ! is_array( $addons_prefs['active'] ) ) {
					$addons_prefs['active'] = array();
				}

				$is_active = in_array( $slug, $addons_prefs['active'], true );
				if ( $enable && $is_active ) {
					return array(
						'success' => true,
						'slug'    => $slug,
						'type'    => 'core',
						'enabled' => true,
						'message' => sprintf( __( 'Built-in add-on "%s" is already enabled.', 'mycred' ), $slug ),
					);
				}
				if ( ! $enable && ! $is_active ) {
					return array(
						'success' => true,
						'slug'    => $slug,
						'type'    => 'core',
						'enabled' => false,
						'message' => sprintf( __( 'Built-in add-on "%s" is already disabled.', 'mycred' ), $slug ),
					);
				}

				if ( $enable ) {
					$addons_prefs['active'][] = $slug;
					$addons_prefs['active']   = array_values( array_unique( $addons_prefs['active'] ) );
					$message                  = sprintf( __( 'Built-in add-on "%s" has been enabled. Reload the admin page if its UI does not appear yet.', 'mycred' ), $slug );
				} else {
					$addons_prefs['active'] = array_values( array_diff( $addons_prefs['active'], array( $slug ) ) );
					$message                = sprintf( __( 'Built-in add-on "%s" has been disabled.', 'mycred' ), $slug );
				}

				update_option( 'mycred_pref_addons', $addons_prefs );

				return array(
					'success' => true,
					'slug'    => $slug,
					'type'    => 'core',
					'enabled' => $enable,
					'message' => $message,
				);
			}

			// myCred Addons.
			if ( ! $this->is_toolkit_plugin_active() ) {
				return new WP_Error(
					'toolkit_plugin_inactive',
					__( 'Neither myCred Addons nor myCred Addons Pro is active. Activate myCred Addons Pro, or use mycred/ensure-toolkit-plugin with confirm=true for free myCred Addons, then enable the myCred Addons add-on with mycred/enable-addon (type=toolkit).', 'mycred' )
				);
			}
			if ( ! $this->toolkit_addon_exists( $slug ) ) {
				return new WP_Error(
					'addon_not_found',
					sprintf(
						/* translators: %s: addon slug */
						__( 'myCred Addons add-on "%s" was not found.', 'mycred' ),
						$slug
					)
				);
			}

			$enabled_addons = get_option( 'mycred_enabled_addons', array() );
			if ( ! is_array( $enabled_addons ) ) {
				$enabled_addons = array();
			}

			$is_active = in_array( $slug, $enabled_addons, true );
			if ( $enable && $is_active ) {
				return array(
					'success' => true,
					'slug'    => $slug,
					'type'    => 'toolkit',
					'enabled' => true,
						'message' => sprintf( __( 'myCred Addons add-on "%s" is already enabled.', 'mycred' ), $slug ),
				);
			}
			if ( ! $enable && ! $is_active ) {
				return array(
					'success' => true,
					'slug'    => $slug,
					'type'    => 'toolkit',
					'enabled' => false,
						'message' => sprintf( __( 'myCred Addons add-on "%s" is already disabled.', 'mycred' ), $slug ),
				);
			}

			if ( $enable ) {
				$enabled_addons[] = $slug;
				$enabled_addons   = array_values( array_unique( $enabled_addons ) );
				$message          = sprintf( __( 'myCred Addons add-on "%s" has been enabled. Reload the admin page if its UI does not appear yet.', 'mycred' ), $slug );
			} else {
				$enabled_addons = array_values( array_diff( $enabled_addons, array( $slug ) ) );
				$message        = sprintf( __( 'myCred Addons add-on "%s" has been disabled.', 'mycred' ), $slug );
			}

			update_option( 'mycred_enabled_addons', $enabled_addons );

			return array(
				'success' => true,
				'slug'    => $slug,
				'type'    => 'toolkit',
				'enabled' => $enable,
				'message' => $message,
			);
		}

		/**
		 * Preferred / known basenames for the free myCred Addons plugin.
		 *
		 * @return string[]
		 */
		protected function get_toolkit_plugin_basename_candidates() {
			return array(
				'mycred-toolkit/mycred-toolkit.php',
				'myCred-toolkit/mycred-toolkit.php',
			);
		}

		/**
		 * Resolve installed myCred Addons plugin basename, if present.
		 *
		 * @return string|false Plugin basename or false.
		 */
		protected function find_installed_toolkit_plugin() {
			if ( ! function_exists( 'get_plugins' ) ) {
				require_once ABSPATH . 'wp-admin/includes/plugin.php';
			}

			$candidates = $this->get_toolkit_plugin_basename_candidates();
			foreach ( $candidates as $basename ) {
				$path = WP_PLUGIN_DIR . '/' . $basename;
				if ( file_exists( $path ) ) {
					return $basename;
				}
			}

			$plugins = get_plugins();
			foreach ( $plugins as $basename => $data ) {
				$name = isset( $data['Name'] ) ? $data['Name'] : '';
				$text = isset( $data['TextDomain'] ) ? $data['TextDomain'] : '';
				if (
					0 === stripos( (string) $basename, 'mycred-toolkit/' )
					|| 'mycred-toolkit' === $text
					|| false !== stripos( $name, 'myCred Toolkit' )
					|| false !== stripos( $name, 'myCred Addons' )
				) {
					// Prefer free myCred Addons; skip Pro package names.
					if (
						false !== stripos( $name, 'Toolkit Pro' )
						|| false !== stripos( $name, 'Addons Pro' )
						|| false !== stripos( (string) $basename, 'toolkit-pro' )
					) {
						continue;
					}
					return $basename;
				}
			}

			return false;
		}

		/**
		 * Ability Callback: Install (if needed) and activate free myCred Addons.
		 *
		 * @param array $input Input.
		 * @return array|WP_Error
		 */
		public function execute_ensure_toolkit_plugin( $input ) {
			$confirm       = ! empty( $input['confirm'] );
			$activate_only = ! empty( $input['activate_only'] );

			if ( ! $confirm ) {
				return new WP_Error(
					'confirmation_required',
					__( 'Confirm with the user first, then call again with confirm=true to install/activate myCred Addons.', 'mycred' )
				);
			}

			if ( ! current_user_can( 'activate_plugins' ) ) {
				return new WP_Error(
					'insufficient_capability',
					__( 'You do not have permission to activate plugins.', 'mycred' )
				);
			}

			if ( ! function_exists( 'is_plugin_active' ) ) {
				require_once ABSPATH . 'wp-admin/includes/plugin.php';
			}

			$plugin = $this->find_installed_toolkit_plugin();

			if ( $plugin && is_plugin_active( $plugin ) ) {
				return array(
					'success'   => true,
					'status'    => 'already_active',
					'plugin'    => $plugin,
					'installed' => true,
					'active'    => true,
					'message'   => __( 'myCred Addons is already installed and active. You can now enable myCred Addons add-ons with mycred/enable-addon (type=toolkit).', 'mycred' ),
				);
			}

			if ( $plugin && ! is_plugin_active( $plugin ) ) {
				$result = activate_plugin( $plugin, '', false, true );
				if ( is_wp_error( $result ) ) {
					return new WP_Error(
						'activation_failed',
						sprintf(
							/* translators: %s: error message */
							__( 'Failed to activate myCred Addons: %s', 'mycred' ),
							$result->get_error_message()
						)
					);
				}

				return array(
					'success'   => true,
					'status'    => 'activated',
					'plugin'    => $plugin,
					'installed' => true,
					'active'    => true,
					'message'   => __( 'myCred Addons was already installed and is now active. Next enable the needed myCred Addons add-on (e.g. mycred-credly) with mycred/enable-addon type=toolkit.', 'mycred' ),
				);
			}

			if ( $activate_only ) {
				return new WP_Error(
					'toolkit_not_installed',
					__( 'myCred Addons is not installed. Call again without activate_only (confirm=true) to download it from wordpress.org and activate it.', 'mycred' )
				);
			}

			if ( ! current_user_can( 'install_plugins' ) ) {
				return new WP_Error(
					'insufficient_capability',
					__( 'You do not have permission to install plugins. Install myCred Addons manually from Plugins → Add New, then ask to activate it.', 'mycred' )
				);
			}

			if ( ! function_exists( 'plugins_api' ) ) {
				require_once ABSPATH . 'wp-admin/includes/plugin-install.php';
			}
			require_once ABSPATH . 'wp-admin/includes/file.php';
			require_once ABSPATH . 'wp-admin/includes/misc.php';
			require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';

			$api = plugins_api(
				'plugin_information',
				array(
					'slug'   => 'mycred-toolkit',
					'fields' => array(
						'sections' => false,
					),
				)
			);

			if ( is_wp_error( $api ) ) {
				return new WP_Error(
					'plugin_api_failed',
					sprintf(
						/* translators: %s: error message */
						__( 'Could not fetch myCred Addons from wordpress.org: %s', 'mycred' ),
						$api->get_error_message()
					)
				);
			}

			if ( empty( $api->download_link ) ) {
				return new WP_Error(
					'plugin_api_failed',
					__( 'wordpress.org did not return a download link for myCred Addons.', 'mycred' )
				);
			}

			// Silence upgrader HTML output in AJAX/chat context.
			ob_start();
			$skin     = new Automatic_Upgrader_Skin();
			$upgrader = new Plugin_Upgrader( $skin );
			$install  = $upgrader->install( $api->download_link );
			ob_end_clean();

			if ( is_wp_error( $install ) ) {
				return new WP_Error(
					'install_failed',
					sprintf(
						/* translators: %s: error message */
						__( 'Failed to install myCred Addons: %s', 'mycred' ),
						$install->get_error_message()
					)
				);
			}

			if ( false === $install ) {
				$skin_errors = method_exists( $skin, 'get_errors' ) ? $skin->get_errors() : null;
				$detail      = ( is_wp_error( $skin_errors ) && $skin_errors->has_errors() )
					? $skin_errors->get_error_message()
					: __( 'Unknown installer error (filesystem permissions?).', 'mycred' );
				return new WP_Error(
					'install_failed',
					sprintf(
						/* translators: %s: error detail */
						__( 'Failed to install myCred Addons: %s', 'mycred' ),
						$detail
					)
				);
			}

			$plugin = ! empty( $upgrader->plugin_info() )
				? $upgrader->plugin_info()
				: $this->find_installed_toolkit_plugin();

			if ( ! $plugin ) {
				return new WP_Error(
					'install_failed',
					__( 'myCred Addons appeared to install, but the plugin file could not be found for activation.', 'mycred' )
				);
			}

			$activate = activate_plugin( $plugin, '', false, true );
			if ( is_wp_error( $activate ) ) {
				return new WP_Error(
					'activation_failed',
					sprintf(
						/* translators: 1: plugin file, 2: error message */
						__( 'myCred Addons installed as %1$s but activation failed: %2$s. Activate it under Plugins, then continue.', 'mycred' ),
						$plugin,
						$activate->get_error_message()
					),
					array(
						'plugin'    => $plugin,
						'installed' => true,
						'active'    => false,
					)
				);
			}

			return array(
				'success'   => true,
				'status'    => 'installed_and_activated',
				'plugin'    => $plugin,
				'installed' => true,
				'active'    => true,
				'message'   => __( 'myCred Addons was installed from wordpress.org and activated. Next enable the needed myCred Addons add-on (e.g. mycred-credly) with mycred/enable-addon type=toolkit. Reload the admin page if the myCred Addons UI does not appear yet.', 'mycred' ),
			);
		}

		/**
		 * Ability Callback: Suggest Ranks
		 *
		 * @param array $input Input.
		 * @return array|WP_Error
		 */
		public function execute_suggest_ranks( $input ) {
			$site_type  = isset( $input['site_type'] ) ? sanitize_text_field( $input['site_type'] ) : '';
			$point_type = isset( $input['point_type'] ) ? sanitize_text_field( $input['point_type'] ) : MYCRED_DEFAULT_TYPE_KEY;

			if ( '' === $site_type ) {
				return new WP_Error( 'missing_fields', __( 'A site type is required to suggest ranks.', 'mycred' ) );
			}

			if ( function_exists( 'mycred_point_type_exists' ) && ! mycred_point_type_exists( $point_type ) ) {
				$point_type = MYCRED_DEFAULT_TYPE_KEY;
			}

			return array(
				'suggested_ranks' => $this->get_rank_suggestions_for_site_type( $site_type ),
				'point_type'      => $point_type,
			);
		}

		/**
		 * Ability Callback: Create Ranks
		 *
		 * @param array $input Input.
		 * @return array|WP_Error
		 */
		public function execute_create_ranks( $input ) {
			$ranks      = isset( $input['ranks'] ) && is_array( $input['ranks'] ) ? $input['ranks'] : array();
			$point_type = isset( $input['point_type'] ) ? sanitize_text_field( $input['point_type'] ) : MYCRED_DEFAULT_TYPE_KEY;

			if ( empty( $ranks ) ) {
				return new WP_Error( 'missing_fields', __( 'No ranks were provided.', 'mycred' ) );
			}

			if ( function_exists( 'mycred_point_type_exists' ) && ! mycred_point_type_exists( $point_type ) ) {
				return new WP_Error( 'invalid_point_type', __( 'The specified point type does not exist.', 'mycred' ) );
			}

			$created = array();
			$errors  = array();
			foreach ( $ranks as $rank ) {
				if ( ! is_array( $rank ) || empty( $rank['title'] ) ) {
					continue;
				}
				$result = $this->create_rank(
					sanitize_text_field( $rank['title'] ),
					isset( $rank['minimum'] ) ? $rank['minimum'] : 0,
					isset( $rank['maximum'] ) ? $rank['maximum'] : 0,
					$point_type
				);
				if ( is_wp_error( $result ) ) {
					$errors[] = $result->get_error_message();
					continue;
				}
				$created[] = $result;
			}

			if ( empty( $created ) ) {
				return new WP_Error(
					'create_failed',
					! empty( $errors ) ? implode( ' ', $errors ) : __( 'Could not create any ranks.', 'mycred' )
				);
			}

			return array(
				'success'       => true,
				'created_ranks' => $created,
				'message'       => sprintf(
					/* translators: %d: number of ranks */
					__( 'Successfully created %d rank(s).', 'mycred' ),
					count( $created )
				),
			);
		}

		/**
		 * Ability Callback: Suggest Badges
		 *
		 * @param array $input Input.
		 * @return array|WP_Error
		 */
		public function execute_suggest_badges( $input ) {
			$site_type  = isset( $input['site_type'] ) ? sanitize_text_field( $input['site_type'] ) : '';
			$point_type = isset( $input['point_type'] ) ? sanitize_text_field( $input['point_type'] ) : MYCRED_DEFAULT_TYPE_KEY;

			if ( '' === $site_type ) {
				return new WP_Error( 'missing_fields', __( 'A site type is required to suggest badges.', 'mycred' ) );
			}

			if ( function_exists( 'mycred_point_type_exists' ) && ! mycred_point_type_exists( $point_type ) ) {
				$point_type = MYCRED_DEFAULT_TYPE_KEY;
			}

			return array(
				'suggested_badges' => $this->get_badge_suggestions_for_site_type( $site_type, $point_type ),
				'point_type'       => $point_type,
			);
		}

		/**
		 * Ability Callback: Create Badges
		 *
		 * @param array $input Input.
		 * @return array|WP_Error
		 */
		public function execute_create_badges( $input ) {
			$badges     = isset( $input['badges'] ) && is_array( $input['badges'] ) ? $input['badges'] : array();
			$point_type = isset( $input['point_type'] ) ? sanitize_text_field( $input['point_type'] ) : MYCRED_DEFAULT_TYPE_KEY;

			if ( empty( $badges ) ) {
				return new WP_Error( 'missing_fields', __( 'No badges were provided.', 'mycred' ) );
			}

			if ( function_exists( 'mycred_point_type_exists' ) && ! mycred_point_type_exists( $point_type ) ) {
				return new WP_Error( 'invalid_point_type', __( 'The specified point type does not exist.', 'mycred' ) );
			}

			$created = array();
			$errors  = array();
			foreach ( $badges as $badge ) {
				if ( ! is_array( $badge ) || empty( $badge['title'] ) ) {
					continue;
				}
				$manual = ! empty( $badge['manual'] );
				$result = $this->create_badge(
					sanitize_text_field( $badge['title'] ),
					isset( $badge['description'] ) ? sanitize_text_field( $badge['description'] ) : '',
					$manual,
					$point_type,
					isset( $badge['reference'] ) ? sanitize_key( $badge['reference'] ) : '',
					isset( $badge['amount'] ) ? sanitize_text_field( (string) $badge['amount'] ) : '',
					isset( $badge['by'] ) ? sanitize_key( $badge['by'] ) : 'count'
				);
				if ( is_wp_error( $result ) ) {
					$errors[] = $result->get_error_message();
					continue;
				}
				$created[] = $result;
			}

			if ( empty( $created ) ) {
				return new WP_Error(
					'create_failed',
					! empty( $errors ) ? implode( ' ', $errors ) : __( 'Could not create any badges.', 'mycred' )
				);
			}

			return array(
				'success'        => true,
				'created_badges' => $created,
				'message'        => sprintf(
					/* translators: %d: number of badges */
					__( 'Successfully created %d badge(s).', 'mycred' ),
					count( $created )
				),
			);
		}

		/**
		 * Rank name/threshold templates by site type.
		 *
		 * @param string $site_type Site category label.
		 * @return array[]
		 */
		protected function get_rank_suggestions_for_site_type( $site_type ) {
			$key = strtolower( preg_replace( '/[^a-z0-9]+/', '', $site_type ) );

			$templates = array(
				'community' => array(
					array( 'title' => 'Newbie', 'minimum' => 0, 'maximum' => 99, 'description' => 'Just joined the community.' ),
					array( 'title' => 'Member', 'minimum' => 100, 'maximum' => 499, 'description' => 'Regular participating member.' ),
					array( 'title' => 'Contributor', 'minimum' => 500, 'maximum' => 1999, 'description' => 'Active contributor to discussions and content.' ),
					array( 'title' => 'Leader', 'minimum' => 2000, 'maximum' => 9999, 'description' => 'Highly engaged community leader.' ),
					array( 'title' => 'Legend', 'minimum' => 10000, 'maximum' => 9999999, 'description' => 'Top-tier community veteran.' ),
				),
				'buddyboss' => array(
					array( 'title' => 'Rookie', 'minimum' => 0, 'maximum' => 99, 'description' => 'New community member.' ),
					array( 'title' => 'Insider', 'minimum' => 100, 'maximum' => 499, 'description' => 'Growing social presence.' ),
					array( 'title' => 'Influencer', 'minimum' => 500, 'maximum' => 1999, 'description' => 'Recognized group participant.' ),
					array( 'title' => 'Ambassador', 'minimum' => 2000, 'maximum' => 9999, 'description' => 'Trusted community voice.' ),
					array( 'title' => 'Icon', 'minimum' => 10000, 'maximum' => 9999999, 'description' => 'Elite community status.' ),
				),
				'lms'       => array(
					array( 'title' => 'Beginner', 'minimum' => 0, 'maximum' => 49, 'description' => 'Started learning on the platform.' ),
					array( 'title' => 'Student', 'minimum' => 50, 'maximum' => 199, 'description' => 'Making steady course progress.' ),
					array( 'title' => 'Scholar', 'minimum' => 200, 'maximum' => 999, 'description' => 'Completed multiple lessons or courses.' ),
					array( 'title' => 'Graduate', 'minimum' => 1000, 'maximum' => 4999, 'description' => 'Advanced learner with strong completion record.' ),
					array( 'title' => 'Expert', 'minimum' => 5000, 'maximum' => 9999999, 'description' => 'Master-level learner.' ),
				),
				'ecommerce' => array(
					array( 'title' => 'Bronze Shopper', 'minimum' => 0, 'maximum' => 499, 'description' => 'Early-stage customer.' ),
					array( 'title' => 'Silver Shopper', 'minimum' => 500, 'maximum' => 1999, 'description' => 'Repeat buyer.' ),
					array( 'title' => 'Gold Shopper', 'minimum' => 2000, 'maximum' => 9999, 'description' => 'Valued loyal customer.' ),
					array( 'title' => 'Platinum VIP', 'minimum' => 10000, 'maximum' => 9999999, 'description' => 'Top spending VIP.' ),
				),
				'blog'      => array(
					array( 'title' => 'Reader', 'minimum' => 0, 'maximum' => 49, 'description' => 'Casual blog visitor.' ),
					array( 'title' => 'Commenter', 'minimum' => 50, 'maximum' => 199, 'description' => 'Engages via comments.' ),
					array( 'title' => 'Author', 'minimum' => 200, 'maximum' => 999, 'description' => 'Publishes or contributes content.' ),
					array( 'title' => 'Influencer', 'minimum' => 1000, 'maximum' => 9999999, 'description' => 'Highly active blog community member.' ),
				),
			);

			if ( isset( $templates[ $key ] ) ) {
				return $templates[ $key ];
			}

			if ( false !== strpos( $key, 'buddy' ) || false !== strpos( $key, 'boss' ) ) {
				return $templates['buddyboss'];
			}
			if ( false !== strpos( $key, 'learn' ) || false !== strpos( $key, 'course' ) || 'lms' === $key ) {
				return $templates['lms'];
			}
			if ( false !== strpos( $key, 'commerce' ) || false !== strpos( $key, 'woo' ) || false !== strpos( $key, 'shop' ) ) {
				return $templates['ecommerce'];
			}
			if ( false !== strpos( $key, 'blog' ) ) {
				return $templates['blog'];
			}

			return $templates['community'];
		}

		/**
		 * Badge templates by site type.
		 *
		 * @param string $site_type  Site category label.
		 * @param string $point_type Point type key for automatic requirements.
		 * @return array[]
		 */
		protected function get_badge_suggestions_for_site_type( $site_type, $point_type = MYCRED_DEFAULT_TYPE_KEY ) {
			$key = strtolower( preg_replace( '/[^a-z0-9]+/', '', $site_type ) );

			$community_badges = array(
				array(
					'title'       => 'Welcome Aboard',
					'description' => 'Awarded when a user registers on the community.',
					'manual'      => false,
					'reference'   => 'registration',
					'amount'      => '1',
					'by'          => 'count',
				),
				array(
					'title'       => 'Daily Visitor',
					'description' => 'Logs in regularly to stay active.',
					'manual'      => false,
					'reference'   => 'logging_in',
					'amount'      => '10',
					'by'          => 'count',
				),
				array(
					'title'       => 'Conversation Starter',
					'description' => 'Leaves thoughtful comments on posts.',
					'manual'      => false,
					'reference'   => 'comments',
					'amount'      => '25',
					'by'          => 'count',
				),
				array(
					'title'       => 'Content Creator',
					'description' => 'Publishes posts or pages for the community.',
					'manual'      => false,
					'reference'   => 'publishing_content',
					'amount'      => '5',
					'by'          => 'count',
				),
				array(
					'title'       => 'Community Champion',
					'description' => 'Manually awarded to standout members.',
					'manual'      => true,
					'reference'   => '',
					'amount'      => '',
					'by'          => '',
				),
			);

			$templates = array(
				'community' => $community_badges,
				'buddyboss' => array_merge(
					$community_badges,
					array(
						array(
							'title'       => 'Profile Complete',
							'description' => 'Uploaded an avatar or completed profile.',
							'manual'      => true,
							'reference'   => '',
							'amount'      => '',
							'by'          => '',
						),
					)
				),
				'lms'       => array(
					array( 'title' => 'First Lesson', 'description' => 'Started the learning journey.', 'manual' => false, 'reference' => 'registration', 'amount' => '1', 'by' => 'count' ),
					array( 'title' => 'Dedicated Learner', 'description' => 'Logs in consistently.', 'manual' => false, 'reference' => 'logging_in', 'amount' => '15', 'by' => 'count' ),
					array( 'title' => 'Course Contributor', 'description' => 'Publishes learning-related content.', 'manual' => false, 'reference' => 'publishing_content', 'amount' => '3', 'by' => 'count' ),
					array( 'title' => 'Honor Roll', 'description' => 'Manually awarded top students.', 'manual' => true, 'reference' => '', 'amount' => '', 'by' => '' ),
				),
				'ecommerce' => array(
					array( 'title' => 'First Purchase', 'description' => 'Completed a first order.', 'manual' => true, 'reference' => '', 'amount' => '', 'by' => '' ),
					array( 'title' => 'Loyal Customer', 'description' => 'Frequent logins and engagement.', 'manual' => false, 'reference' => 'logging_in', 'amount' => '20', 'by' => 'count' ),
					array( 'title' => 'Reviewer', 'description' => 'Leaves product or post reviews.', 'manual' => false, 'reference' => 'comments', 'amount' => '10', 'by' => 'count' ),
				),
				'blog'      => array(
					array( 'title' => 'New Subscriber', 'description' => 'Registered on the blog.', 'manual' => false, 'reference' => 'registration', 'amount' => '1', 'by' => 'count' ),
					array( 'title' => 'Regular Reader', 'description' => 'Visits the site often.', 'manual' => false, 'reference' => 'site_visit', 'amount' => '7', 'by' => 'count' ),
					array( 'title' => 'Prolific Commenter', 'description' => 'Active in discussions.', 'manual' => false, 'reference' => 'comments', 'amount' => '15', 'by' => 'count' ),
				),
			);

			if ( isset( $templates[ $key ] ) ) {
				return $templates[ $key ];
			}

			if ( false !== strpos( $key, 'buddy' ) || false !== strpos( $key, 'boss' ) ) {
				return $templates['buddyboss'];
			}
			if ( false !== strpos( $key, 'learn' ) || false !== strpos( $key, 'course' ) || 'lms' === $key ) {
				return $templates['lms'];
			}
			if ( false !== strpos( $key, 'commerce' ) || false !== strpos( $key, 'woo' ) || false !== strpos( $key, 'shop' ) ) {
				return $templates['ecommerce'];
			}
			if ( false !== strpos( $key, 'blog' ) ) {
				return $templates['blog'];
			}

			return $templates['community'];
		}

		/**
		 * Create a single rank post.
		 *
		 * @param string $title      Rank title.
		 * @param float  $minimum    Min points.
		 * @param float  $maximum    Max points.
		 * @param string $point_type Point type key.
		 * @return array|WP_Error
		 */
		private function create_rank( $title, $minimum, $maximum, $point_type ) {
			if ( ! defined( 'MYCRED_RANK_KEY' ) ) {
				return new WP_Error( 'ranks_unavailable', __( 'Ranks are not available.', 'mycred' ) );
			}

			$existing = get_page_by_title( $title, OBJECT, MYCRED_RANK_KEY );
			if ( $existing && isset( $existing->ID ) ) {
				return new WP_Error( 'rank_exists', sprintf( __( 'A rank titled "%s" already exists.', 'mycred' ), $title ) );
			}

			$rank_id = wp_insert_post(
				array(
					'post_title'  => $title,
					'post_type'   => MYCRED_RANK_KEY,
					'post_status' => 'publish',
				),
				true
			);

			if ( is_wp_error( $rank_id ) || ! $rank_id ) {
				return new WP_Error( 'create_failed', sprintf( __( 'Could not create rank "%s".', 'mycred' ), $title ) );
			}

			$mycred  = mycred( $point_type );
			$minimum = $mycred->number( $minimum );
			$maximum = $mycred->number( $maximum );

			mycred_update_post_meta( $rank_id, 'ctype', $point_type );
			mycred_update_post_meta( $rank_id, 'mycred_rank_min', $minimum );
			mycred_update_post_meta( $rank_id, 'mycred_rank_max', $maximum );

			return array(
				'rank_id' => (int) $rank_id,
				'title'   => $title,
				'minimum' => (float) $minimum,
				'maximum' => (float) $maximum,
			);
		}

		/**
		 * Create a single badge post.
		 *
		 * @param string $title       Badge title.
		 * @param string $description Post excerpt/content description.
		 * @param bool   $manual      Manual badge flag.
		 * @param string $point_type  Point type for requirements.
		 * @param string $reference   Hook reference for auto badges.
		 * @param string $amount      Requirement amount.
		 * @param string $by          Requirement by (count, sum, etc.).
		 * @return array|WP_Error
		 */
		private function create_badge( $title, $description, $manual, $point_type, $reference = '', $amount = '', $by = 'count' ) {
			if ( ! defined( 'MYCRED_BADGE_KEY' ) ) {
				return new WP_Error( 'badges_unavailable', __( 'Badges are not available.', 'mycred' ) );
			}

			$existing = get_page_by_title( $title, OBJECT, MYCRED_BADGE_KEY );
			if ( $existing && isset( $existing->ID ) ) {
				return new WP_Error( 'badge_exists', sprintf( __( 'A badge titled "%s" already exists.', 'mycred' ), $title ) );
			}

			$badge_id = wp_insert_post(
				array(
					'post_title'   => $title,
					'post_content' => $description,
					'post_type'    => MYCRED_BADGE_KEY,
					'post_status'  => 'publish',
				),
				true
			);

			if ( is_wp_error( $badge_id ) || ! $badge_id ) {
				return new WP_Error( 'create_failed', sprintf( __( 'Could not create badge "%s".', 'mycred' ), $title ) );
			}

			$requires = array();
			if ( ! $manual && ! empty( $reference ) ) {
				$requires[] = array(
					'type'      => $point_type,
					'reference' => $reference,
					'amount'    => '' !== $amount ? $amount : '1',
					'by'        => '' !== $by ? $by : 'count',
					'specific'  => '',
				);
			}

			$badge_levels = array(
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

			mycred_update_post_meta( $badge_id, 'badge_prefs', $badge_levels );
			mycred_update_post_meta( $badge_id, 'manual_badge', $manual ? 1 : 0 );
			mycred_update_post_meta( $badge_id, 'open_badge', 0 );
			mycred_update_post_meta( $badge_id, 'congratulation_msg', sprintf( __( 'Congratulations! You earned the %s badge.', 'mycred' ), $title ) );
			mycred_update_post_meta( $badge_id, 'main_image', '' );
			mycred_update_post_meta( $badge_id, 'mycred_badge_align', 'mycred_align_none' );
			mycred_update_post_meta( $badge_id, 'mycred_layout_check', 'mycred_layout_none' );

			if ( function_exists( 'mycred_delete_option' ) ) {
				mycred_delete_option( 'mycred-badge-refs-' . $point_type );
			}

			return array(
				'badge_id' => (int) $badge_id,
				'title'    => $title,
				'manual'   => (bool) $manual,
			);
		}

		/**
		 * Planned abilities shown in the sidebar (not registered yet).
		 *
		 * @return array<int, array{slug: string, label: string, icon: string, hint: string}>
		 */
		public static function get_upcoming_abilities() {
			return array(
				array(
					'slug'  => 'mycred/setup-ecommerce',
					'label' => __( 'WooCommerce setup', 'mycred' ),
					'icon'  => 'dashicons-cart',
					'hint'  => __( 'Product rewards, checkout points & store hooks', 'mycred' ),
				),
				array(
					'slug'  => 'mycred/setup-gamification',
					'label' => __( 'Full gamification plan', 'mycred' ),
					'icon'  => 'dashicons-performance',
					'hint'  => __( 'AI roadmap for hooks, ranks, badges & point types', 'mycred' ),
				),
				array(
					'slug'  => 'mycred/setup-coupons',
					'label' => __( 'Coupons & rewards', 'mycred' ),
					'icon'  => 'dashicons-tickets-alt',
					'hint'  => __( 'Suggest and create point coupon campaigns', 'mycred' ),
				),
				array(
					'slug'  => 'mycred/setup-referrals',
					'label' => __( 'Referral program', 'mycred' ),
					'icon'  => 'dashicons-groups',
					'hint'  => __( 'Invite rewards and referral hook configuration', 'mycred' ),
				),
				array(
					'slug'  => 'mycred/setup-email-notices',
					'label' => __( 'Email notices', 'mycred' ),
					'icon'  => 'dashicons-email',
					'hint'  => __( 'Point event emails for users and admins', 'mycred' ),
				),
				array(
					'slug'  => 'mycred/analyze-leaderboard',
					'label' => __( 'Leaderboard insights', 'mycred' ),
					'icon'  => 'dashicons-visibility',
					'hint'  => __( 'Top users, circulation trends & engagement stats', 'mycred' ),
				),
				array(
					'slug'  => 'mycred/bulk-adjust-points',
					'label' => __( 'Bulk point adjust', 'mycred' ),
					'icon'  => 'dashicons-admin-users',
					'hint'  => __( 'Award or deduct points for many users at once', 'mycred' ),
				),
				array(
					'slug'  => 'mycred/setup-buycred',
					'label' => __( 'Buy points (buyCred)', 'mycred' ),
					'icon'  => 'dashicons-money',
					'hint'  => __( 'Gateways and packages to sell points', 'mycred' ),
				),
				array(
					'slug'  => 'mycred/setup-sell-content',
					'label' => __( 'Sell content', 'mycred' ),
					'icon'  => 'dashicons-lock',
					'hint'  => __( 'Paywall posts and pages with point prices', 'mycred' ),
				),
				array(
					'slug'  => 'mycred/audit-point-log',
					'label' => __( 'Log & fraud audit', 'mycred' ),
					'icon'  => 'dashicons-shield',
					'hint'  => __( 'Spot unusual balances and suspicious activity', 'mycred' ),
				),
			);
		}

	
	}

	myCRED_AI_Abilities::instance();
}