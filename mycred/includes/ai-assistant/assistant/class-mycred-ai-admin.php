<?php
/**
 * Addon AI Admin Module Class
 *
 * Extends the myCRED_Module class to register AI abilities and the administrative chat page.
 *
 * @package myCred
 * @subpackage AI
 * @since 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! class_exists( 'myCRED_AI_Admin' ) ) {

	class myCRED_AI_Admin extends myCRED_Module {

		/**
		 * Singleton Instance
		 *
		 * @var myCRED_AI_Admin|null
		 */
		protected static $_instance = null;

		/**
		 * Setup Instance Singleton
		 *
		 * @since 1.0
		 * @return myCRED_AI_Admin
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
			parent::__construct( 'myCRED_AI_Admin', array(
				'module_name' => 'ai',
				'defaults'    => array(),
				'register'    => false,
				'screen_id'   => 'mycred-ai-assistant',
				'labels'      => array(
					'menu'       => 'AI Assistant',
					'page_title' => 'AI Assistant'
				),
				'accordion'   => false,
				'add_to_core' => false,
				'cap'         => 'plugin', // Enforce point admin/editor capability requirements
				'menu_pos'    => 5,
				'main_menu'   => true
			) );

			$this->load();
		}

		/**
		 * Hooks Initialization (menu is registered in myCred core).
		 */
		public function load() {

			if ( ! empty( $this->screen_id ) ) {
				add_action( 'admin_init', array( $this, 'set_entries_per_page' ) );
			}

			if ( $this->register === true && ! empty( $this->option_id ) ) {
				add_action( 'mycred_admin_init', array( $this, 'register_settings' ), $this->menu_pos );
			}

			add_action( 'mycred_pre_init', array( $this, 'module_pre_init' ) );
			add_action( 'mycred_init', array( $this, 'module_init' ) );
			add_action( 'mycred_admin_init', array( $this, 'module_admin_init' ), $this->menu_pos + 1 );
			add_action( 'mycred_widgets_init', array( $this, 'module_widgets_init' ) );
			add_action( 'mycred_admin_enqueue', array( $this, 'scripts_and_styles' ), $this->menu_pos );

			add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_assets' ) );
			
			add_action( 'wp_ajax_mycred_ai_chat', array( $this, 'handle_chat_ajax' ) );
		}

		/**
		 * Admin menu is registered by myCred core (mycred-ai-assistant-menu.php).
		 */
		public function add_menu() {
			return;
		}

		/**
		 * Active point types string for the shared chat system prompt.
		 *
		 * @return string
		 */
		protected function get_point_types_instruction_string() {
			if ( function_exists( 'mycred_get_types' ) ) {
				$types     = mycred_get_types();
				$types_str = '';
				foreach ( $types as $slug => $label ) {
					$types_str .= "{$label} (Slug: '{$slug}'), ";
				}
				$types_str = rtrim( $types_str, ', ' );
				if ( '' !== $types_str ) {
					return $types_str;
				}
			}

			return "Points (Slug: 'mycred_default')";
		}

		/**
		 * WordPress AI chat system instruction (unchanged from the assistant chat).
		 *
		 * @param string $types_str Available point types string.
		 * @return string
		 */
		protected function get_wordpress_chat_system_instruction( $types_str ) {
			return "You are the myCred AI Assistant, an expert tool to help manage myCred point balances on this WordPress site. " .
				"You have access to several abilities: retrieving user balances, getting site summaries (like points in circulation), " .
				"awarding/deducting points, creating new point types, and setting up myCred Hooks. " .
				"Be helpful, precise, and professional. Always use the registered abilities to perform tasks instead of guessing or pretending. " .
				"When answering, display balances and statistics using the formatted values returned from the tools. " .
				"Format replies with short paragraphs, **bold** labels, and bullet lists. Do not use markdown heading hashes (#, ##, ###). " .
				"Only logged-in administrators have access to your chat, so you can execute the mutation tools (like award or deduct points, or create point types) when they ask you to. " .
				"When a user asks to create a new point type, use `mycred/create-point-type` with a lowercase meta key (letters and underscores only; spaces and hyphens become underscores), a plural name, and an optional singular name. Confirm the key and names with the user before creating. Tell them to reload the admin page after creation so the new type appears in menus. " .
				"When a user asks for hook recommendations (e.g., based on their site type like BuddyBoss or eCommerce), use `mycred/suggest-hooks` to fetch available hooks. " .
				"Then, recommend these hooks with dynamic point amount suggestions you deem appropriate for their site. Ask the user if they want to apply them. " .
				"If they confirm, use `mycred/apply-hooks` to save the configuration. " .
				$this->get_ranks_badges_system_instruction() .
				" IMPORTANT: The currently active point types on this site are: {$types_str}. When calling an ability that accepts a 'point_type' parameter, you MUST use one of these slugs. If the user asks to award/deduct a specific point type, use its corresponding slug. If the user does not specify, you can assume the default point type (mycred_default).";
		}

		/**
		 * Initials for the current admin user (chat avatar).
		 *
		 * @return string
		 */
		public function get_current_user_initials() {
			$user = wp_get_current_user();
			if ( ! $user->exists() ) {
				return '?';
			}

			$first = trim( (string) get_user_meta( $user->ID, 'first_name', true ) );
			$last  = trim( (string) get_user_meta( $user->ID, 'last_name', true ) );

			if ( $first !== '' && $last !== '' ) {
				return strtoupper( mb_substr( $first, 0, 1 ) . mb_substr( $last, 0, 1 ) );
			}

			$parts = preg_split( '/\s+/', trim( $user->display_name ) );
			if ( is_array( $parts ) && count( $parts ) >= 2 ) {
				return strtoupper( mb_substr( $parts[0], 0, 1 ) . mb_substr( end( $parts ), 0, 1 ) );
			}

			$fallback = $user->display_name ? $user->display_name : $user->user_login;
			return strtoupper( mb_substr( $fallback, 0, 2 ) );
		}

		/**
		 * Display name for the empty-state greeting (first + last, else username).
		 *
		 * @return string
		 */
		public function get_user_greeting_name() {
			$user = wp_get_current_user();
			if ( ! $user->exists() ) {
				return '';
			}

			$first = trim( (string) get_user_meta( $user->ID, 'first_name', true ) );
			$last  = trim( (string) get_user_meta( $user->ID, 'last_name', true ) );
			$full  = trim( $first . ' ' . $last );

			if ( $full !== '' ) {
				return $full;
			}

			return trim( (string) $user->user_login );
		}

		/**
		 * Time-of-day greeting label for the empty state.
		 *
		 * @return string
		 */
		public function get_time_greeting_label() {
			$hour = (int) current_time( 'G' );

			if ( $hour < 12 ) {
				return __( 'Good morning', 'mycred' );
			}

			if ( $hour < 17 ) {
				return __( 'Good afternoon', 'mycred' );
			}

			return __( 'Good evening', 'mycred' );
		}

		/**
		 * Full empty-state greeting, e.g. "Good afternoon, Morgan Smith".
		 *
		 * @return string
		 */
		public function get_empty_state_greeting_label() {
			$name = $this->get_user_greeting_name();

			if ( $name === '' ) {
				return $this->get_time_greeting_label();
			}

			return $this->get_time_greeting_label() . ', ' . $name;
		}

		/**
		 * URL for the AI chat avatar image.
		 *
		 * @return string
		 */
		public function get_ai_avatar_url() {
			if ( defined( 'MYCRED_AI_PLUGIN_FILE' ) && defined( 'MYCRED_AI_ASSISTANT_DIR' ) ) {
				$mascot_svg = MYCRED_AI_ASSISTANT_DIR . 'assets/images/ai-assistant-mascot.svg';
				if ( file_exists( $mascot_svg ) ) {
					return plugins_url( 'assistant/assets/images/ai-assistant-mascot.svg', MYCRED_AI_PLUGIN_FILE );
				}

				$local_svg = MYCRED_AI_ASSISTANT_DIR . 'assets/images/ai-avatar.svg';
				if ( file_exists( $local_svg ) ) {
					return plugins_url( 'assistant/assets/images/ai-avatar.svg', MYCRED_AI_PLUGIN_FILE );
				}

				$local_png = MYCRED_AI_ASSISTANT_DIR . 'assets/images/ai-avatar.png';
				if ( file_exists( $local_png ) ) {
					return plugins_url( 'assistant/assets/images/ai-avatar.png', MYCRED_AI_PLUGIN_FILE );
				}
			}

			if ( defined( 'MYCRED_THIS' ) && file_exists( MYCRED_THIS . 'assets/images/mycred-logo.svg' ) ) {
				return plugins_url( 'assets/images/mycred-logo.svg', MYCRED_THIS );
			}

			return MYCRED_AI_ASSETS_URL . 'images/ai-avatar.svg';
		}

		/**
		 * URL for the empty-state mascot (Figma node 5607:683).
		 *
		 * @return string
		 */
		public function get_ai_empty_mascot_url() {
			return $this->get_ai_avatar_url();
		}

		/**
		 * Check if we are on the AI Assistant admin page
		 *
		 * @param string $hook_suffix The current screen hook suffix.
		 * @return bool
		 */
		public function is_ai_assistant_admin_screen( $hook_suffix ) {
			return strpos( $hook_suffix, 'mycred-ai-assistant' ) !== false;
		}

		/**
		 * Enqueue Styles and Scripts on our custom admin page
		 *
		 * @param string $hook_suffix Current hook suffix.
		 */
		public function enqueue_assets( $hook_suffix ) {
			if ( ! $this->is_ai_assistant_admin_screen( $hook_suffix ) ) {
				return;
			}

			// Enqueue Outfit and Inter fonts from Google Fonts for rich visual design
			wp_enqueue_style( 'mycred-ai-fonts', 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap', array(), null );

			wp_enqueue_style(
				'mycred-ai-figtree',
				'https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&display=swap',
				array(),
				null
			);

			$style_deps = array( 'mycred-ai-figtree' );

			$tokens_path = defined( 'myCRED_THIS' ) ? plugin_dir_path( myCRED_THIS ) . 'src/shared/adminTheme/tokens.css' : '';
			if ( $tokens_path && file_exists( $tokens_path ) ) {
				wp_enqueue_style(
					'mycred-admin-tokens',
					plugins_url( 'src/shared/adminTheme/tokens.css', myCRED_THIS ),
					array(),
					defined( 'myCRED_VERSION' ) ? myCRED_VERSION : MYCRED_AI_VERSION
				);
				$style_deps[] = 'mycred-admin-tokens';
			}

			if ( wp_style_is( 'mycred-admin-ui', 'registered' ) ) {
				$style_deps[] = 'mycred-admin-ui';
			}

			// Enqueue our beautiful glassmorphic CSS styling
			wp_enqueue_style(
				'mycred-ai-admin-css',
				plugins_url( 'assets/css/mycred-ai-admin.css', __FILE__ ),
				$style_deps,
				MYCRED_AI_VERSION
			);
			
			wp_enqueue_script( 'mycred-ai-admin-js', plugins_url( 'assets/js/mycred-ai-admin.js', __FILE__ ), array( 'jquery' ), MYCRED_AI_VERSION, true );

			$current_user = wp_get_current_user();

			wp_localize_script( 'mycred-ai-admin-js', 'mycredAi', array(
				'ajax_url'       => admin_url( 'admin-ajax.php' ),
				'nonce'          => wp_create_nonce( 'mycred_ai_chat_nonce' ),
				'avatar_url'     => $this->get_ai_avatar_url(),
				'user_initials'  => $this->get_current_user_initials(),
				'user_name'      => $current_user->exists() ? $current_user->display_name : '',
				'ai_provider'    => 'mycred_middleware',
				'quota'          => class_exists( 'myCRED_AI_Middleware_Client' ) ? myCRED_AI_Middleware_Client::fetch_quota( false ) : null,
				'strings'        => array(
					'error'        => __( 'Something went wrong. Please try again.', 'mycred' ),
					'sending'      => __( 'Thinking...', 'mycred' ),
					'tokensLine'   => __( 'AI Tokens: %1$s / %2$s', 'mycred' ),
					'creditsLine'  => __( 'AI Credits: %1$s / %2$s', 'mycred' ),
					'tokensUsage'  => __( 'AI tokens usage', 'mycred' ),
					'creditsLabel' => __( 'AI credits', 'mycred' ),
					'creditsUsage' => __( 'AI credits usage', 'mycred' ),
					'thisMonth'    => __( 'This month:', 'mycred' ),
					'thisYear'     => __( 'This year:', 'mycred' ),
					'lifetime'     => __( 'Lifetime:', 'mycred' ),
					'usedLabel'    => __( 'Used:', 'mycred' ),
					'refreshMonth' => __( 'refreshes every month', 'mycred' ),
					'refreshYear'  => __( 'refreshes every year', 'mycred' ),
					'tokensHint'   => __( 'Tokens used of your site budget.', 'mycred' ),
					'creditsHint'  => __( 'AI requests used of your credit budget.', 'mycred' ),
				),
				'ai_settings_url' => $this->get_ai_connectors_settings_url(),
			) );
		}


		/**
		 * Read ability permission check
		 */
		public function permission_callback( $input ) {
			$cap = $this->core->get_point_editor_capability();
			return current_user_can( $cap ) || current_user_can( 'manage_options' );
		}

		/**
		 * Build supplemental system instruction for ranks/badges abilities.
		 *
		 * @return string
		 */
		protected function get_ranks_badges_system_instruction() {
			$parts = array();

			if ( myCRED_AI_Abilities::is_ranks_addon_active() ) {
				$parts[] = 'For rank systems: when a user describes their site (e.g. community site) and wants ranks, use `mycred/suggest-ranks` with their site_type, present the suggested rank names and min/max point values clearly, ask for confirmation, then use `mycred/create-ranks` only after they agree. Ranks use post titles and point thresholds (minimum/maximum).';
			}

			if ( myCRED_AI_Abilities::is_badges_addon_active() ) {
				$parts[] = 'For badges: when a user wants achievement badges, use `mycred/suggest-badges` with site_type, explain each badge (manual vs automatic), ask for confirmation, then use `mycred/create-badges` after they agree. Set manual=true for admin-awarded badges; for automatic badges include reference (e.g. logging_in, registration, comments) and amount.';
			}

			return implode( ' ', $parts );
		}

		/**
		 * Admin URL for WordPress AI provider / API key settings (Connectors screen).
		 *
		 * @return string
		 */
		public function get_ai_connectors_settings_url() {
			return admin_url( 'options-connectors.php' );
		}

		/**
		 * User-facing message when no AI provider or API key is configured.
		 *
		 * @return string HTML message.
		 */
		public function get_ai_not_configured_message_html() {
			$settings_url = $this->get_ai_connectors_settings_url();

			return sprintf(
				/* translators: 1: opening anchor tag, 2: closing anchor tag */
				__( '<strong>AI Assistant is not connected yet.</strong> To use chat, install a WordPress AI provider plugin (if needed), then open %1$sSettings → Connectors%2$s and add your API key. After saving, return here and try again.', 'mycred' ),
				'<a href="' . esc_url( $settings_url ) . '">',
				'</a>'
			);
		}

		/**
		 * Map technical AI Core errors to messages suitable for site administrators.
		 *
		 * @param string|WP_Error $error Raw error from the AI client.
		 * @return array{message: string, is_html: bool}
		 */
		public function format_ai_error_for_user( $error ) {
			$code    = '';
			$message = '';

			if ( is_wp_error( $error ) ) {
				$code    = $error->get_error_code();
				$message = $error->get_error_message();
			} else {
				$message = (string) $error;
			}

			$haystack = strtolower( $code . ' ' . $message );

			if ( 'no_middleware_credits' === $code && '' !== $message ) {
				return array(
					'message' => $message,
					'is_html' => false,
				);
			}

			$config_patterns = array(
				'no models found',
				'text_generation',
				'prompt_invalid_argument',
				'prompt_prevented',
				'not supported in this environment',
				'api key',
				'api_key',
				'authentication required',
				'unauthorized',
				'connector',
			);

			foreach ( $config_patterns as $pattern ) {
				if ( str_contains( $haystack, $pattern ) ) {
					return array(
						'message' => $this->get_ai_not_configured_message_html(),
						'is_html' => true,
					);
				}
			}

			return array(
				'message' => __( 'Sorry, the AI Assistant could not complete your request. Please try again in a moment.', 'mycred' ),
				'is_html' => false,
			);
		}

		/**
		 * System instruction for middleware mode.
		 *
		 * @param string $types_str Available point types string.
		 * @return string
		 */
		protected function get_middleware_system_instruction( $types_str ) {
			return "You are the myCred AI Assistant, an expert tool to help manage myCred point balances on this WordPress site. " .
				"Be helpful, precise, and professional. " .
				"You can execute real WordPress actions via tools AND provide guidance. " .
				"When a user asks for data (e.g. a user balance, site stats) or wants an action performed, use the appropriate tool. " .
				"When asked for advice or configuration guidance, respond directly with clear recommendations. " .
				"Always confirm write actions (awarding/deducting points, creating types, applying hooks, creating ranks/badges) with the user before executing, unless they have already confirmed. " .
				"Format replies with short paragraphs, **bold** labels, and bullet lists. Do not use markdown heading hashes (#, ##, ###). " .
				"IMPORTANT: The currently active point types on this site are: {$types_str}. When referring to a point type, use one of these slugs. If the user does not specify a point type, assume the default point type (mycred_default).";
		}

		/**
		 * Convert AJAX history payload to a simple role/content list for middleware mode.
		 *
		 * @param array  $raw_history Raw posted history.
		 * @param string $user_message Latest user message.
		 * @return array<int, array<string, string>>
		 */
		protected function get_middleware_messages_from_history( $raw_history, $user_message ) {
			$messages = array();

			if ( is_array( $raw_history ) ) {
				foreach ( $raw_history as $message ) {
					$message = wp_unslash( $message );
					if ( ! is_array( $message ) || empty( $message['role'] ) || empty( $message['parts'] ) || ! is_array( $message['parts'] ) ) {
						continue;
					}

					$text_parts = array();
					foreach ( $message['parts'] as $part ) {
						if ( is_array( $part ) && isset( $part['text'] ) && is_string( $part['text'] ) ) {
							$text_parts[] = trim( $part['text'] );
						}
					}

					$content = trim( implode( "\n", array_filter( $text_parts ) ) );
					if ( '' === $content ) {
						continue;
					}

					$messages[] = array(
						'role'    => sanitize_key( $message['role'] ),
						'content' => $content,
					);
				}
			}

			$messages[] = array(
				'role'    => 'user',
				'content' => $user_message,
			);

			return $messages;
		}

		/**
		 * Build compact tool definitions for the middleware system instruction.
		 * Enables the middleware LLM to call WordPress abilities via the ReAct pattern.
		 *
		 * @return string
		 */
		protected function build_middleware_tools_instruction() {
			$tools = array(
				array(
					'name'        => 'mycred/get-user-balance',
					'description' => 'Get the points balance of a user.',
					'args'        => array( 'user' => '(required) user ID, email, or username', 'point_type' => '(optional) point type key' ),
				),
				array(
					'name'        => 'mycred/get-site-points-summary',
					'description' => 'Get site-wide stats: total points in circulation, log entries, active members.',
					'args'        => array( 'point_type' => '(optional) point type key' ),
				),
				array(
					'name'        => 'mycred/award-points',
					'description' => 'Award points to a user.',
					'args'        => array( 'user' => '(required)', 'amount' => '(required) positive number', 'reason' => '(required)', 'point_type' => '(optional)' ),
				),
				array(
					'name'        => 'mycred/deduct-points',
					'description' => 'Deduct points from a user.',
					'args'        => array( 'user' => '(required)', 'amount' => '(required) positive number', 'reason' => '(required)', 'point_type' => '(optional)' ),
				),
				array(
					'name'        => 'mycred/suggest-hooks',
					'description' => 'Get hook suggestions based on site type.',
					'args'        => array( 'site_type' => '(required) e.g. Community, LMS, eCommerce, Blog', 'point_type' => '(optional)' ),
				),
				array(
					'name'        => 'mycred/apply-hooks',
					'description' => 'Apply/overwrite active hooks with a configuration.',
					'args'        => array( 'hooks' => '(required) array of {hook_id, creds, log} objects', 'point_type' => '(optional)' ),
				),
				array(
					'name'        => 'mycred/create-point-type',
					'description' => 'Create a new myCred point type.',
					'args'        => array( 'key' => '(required) lowercase underscore meta key', 'plural' => '(required) plural display name', 'singular' => '(optional)' ),
				),
				array(
					'name'        => 'mycred/get-general-settings',
					'description' => 'Read current myCred general settings from saved options. Secrets are redacted.',
					'args'        => array( 'section' => '(optional) e.g. core, remote, dashboard, ai, export, credly, zapier, social_proof, transfer_plus, sms_payments, pacman', 'point_type' => '(optional)' ),
				),
				array(
					'name'        => 'mycred/update-general-settings',
					'description' => 'Partially update general settings via a nested settings object. Confirm with the user first.',
					'args'        => array( 'settings' => '(required) nested object of fields to change', 'point_type' => '(optional)' ),
				),
				array(
					'name'        => 'mycred/list-addons',
					'description' => 'List built-in and myCred Addons add-ons with enabled status. Includes toolkit_plugin_active — if false, use mycred/ensure-toolkit-plugin (after user confirms) before enabling myCred Addons add-ons.',
					'args'        => array( 'type' => '(optional) all|core|toolkit', 'general_settings_only' => '(optional) boolean, default true' ),
				),
				array(
					'name'        => 'mycred/enable-addon',
					'description' => 'Enable or disable a core or myCred Addons add-on. For myCred Addons add-ons the myCred Addons plugin must already be active; otherwise use mycred/ensure-toolkit-plugin first.',
					'args'        => array( 'slug' => '(required) e.g. badges or mycred-zapier', 'type' => '(optional) core|toolkit', 'enable' => '(optional) true|false, default true' ),
				),
				array(
					'name'        => 'mycred/ensure-toolkit-plugin',
					'description' => 'Install free myCred Addons from wordpress.org if missing, then activate it. Required before Credly/Badgr/Zapier myCred Addons add-ons. Always confirm with the user; pass confirm=true.',
					'args'        => array( 'confirm' => '(required) true after user confirms', 'activate_only' => '(optional) true = only activate if already installed' ),
				),
			);

			if ( myCRED_AI_Abilities::is_ranks_addon_active() ) {
				$tools[] = array(
					'name'        => 'mycred/suggest-ranks',
					'description' => 'Suggest rank names and point thresholds by site type.',
					'args'        => array( 'site_type' => '(required)', 'point_type' => '(optional)' ),
				);
				$tools[] = array(
					'name'        => 'mycred/create-ranks',
					'description' => 'Create myCred ranks with point thresholds.',
					'args'        => array( 'ranks' => '(required) array of {title, minimum, maximum} objects', 'point_type' => '(optional)' ),
				);
			}

			if ( myCRED_AI_Abilities::is_badges_addon_active() ) {
				$tools[] = array(
					'name'        => 'mycred/suggest-badges',
					'description' => 'Suggest badge names and earning criteria by site type.',
					'args'        => array( 'site_type' => '(required)', 'point_type' => '(optional)' ),
				);
				$tools[] = array(
					'name'        => 'mycred/create-badges',
					'description' => 'Create myCred badges.',
					'args'        => array( 'badges' => '(required) array of {title, description, manual, reference, amount, by} objects', 'point_type' => '(optional)' ),
				);
			}

			return "\n\nTOOL USE INSTRUCTIONS:\n" .
				"When you need real WordPress data or want to perform an action, include one or more tool calls in your response.\n" .
				"Each tool call must appear on its own line in this exact JSON format (no markdown, no extra keys):\n" .
				"{\"__tool_call__\":{\"name\":\"tool/name\",\"arguments\":{\"arg\":\"value\"}}}\n\n" .
				"You may write a short explanation before the tool call lines. After receiving [TOOL RESULT:] messages, compose your final natural language answer using the returned data.\n\n" .
				"AVAILABLE TOOLS:\n" . wp_json_encode( $tools, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES );
		}

		/**
		 * Find all tool call JSON objects in a raw LLM response.
		 *
		 * @param string $response_text Raw LLM response.
		 * @return array[] Zero or more {name: string, arguments: array} descriptors.
		 */
		protected function find_all_middleware_tool_calls( $response_text ) {
			$tool_calls = array();
			$text       = trim( $response_text );

			if ( isset( $text[0] ) && '{' === $text[0] ) {
				$decoded = json_decode( $text, true );
				if ( is_array( $decoded ) && isset( $decoded['__tool_call__']['name'] ) ) {
					return array( $this->extract_tool_call_data( $decoded ) );
				}
			}

			if ( preg_match_all( '/```(?:json)?\s*([\s\S]+?)\s*```/', $text, $fence_matches ) ) {
				foreach ( $fence_matches[1] as $json_str ) {
					$decoded = json_decode( trim( $json_str ), true );
					if ( is_array( $decoded ) && isset( $decoded['__tool_call__']['name'] ) ) {
						$tool_calls[] = $this->extract_tool_call_data( $decoded );
					}
				}
				if ( ! empty( $tool_calls ) ) {
					return $tool_calls;
				}
			}

			$pattern = '/\{\s*"__tool_call__"\s*:\s*\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\}\s*\}/';
			if ( preg_match_all( $pattern, $text, $bare_matches ) ) {
				foreach ( $bare_matches[0] as $json_str ) {
					$decoded = json_decode( $json_str, true );
					if ( is_array( $decoded ) && isset( $decoded['__tool_call__']['name'] ) ) {
						$tool_calls[] = $this->extract_tool_call_data( $decoded );
					}
				}
			}

			return $tool_calls;
		}

		/**
		 * Extract tool call fields from a decoded JSON array.
		 *
		 * @param array $decoded Decoded __tool_call__ JSON object.
		 * @return array{name: string, arguments: array}
		 */
		protected function extract_tool_call_data( array $decoded ) {
			return array(
				'name'      => (string) $decoded['__tool_call__']['name'],
				'arguments' => ( isset( $decoded['__tool_call__']['arguments'] ) && is_array( $decoded['__tool_call__']['arguments'] ) )
					? $decoded['__tool_call__']['arguments']
					: array(),
			);
		}

		/**
		 * Execute a registered myCred ability by its slug.
		 *
		 * @param string $name      Ability slug (e.g. mycred/get-user-balance).
		 * @param array  $arguments Arguments for the ability callback.
		 * @return mixed Ability result or WP_Error.
		 */
		protected function execute_ability_by_name( $name, $arguments ) {
			$map = array(
				'mycred/get-user-balance'         => 'execute_get_user_balance',
				'mycred/get-site-points-summary'  => 'execute_get_site_points_summary',
				'mycred/award-points'             => 'execute_award_points',
				'mycred/deduct-points'            => 'execute_deduct_points',
				'mycred/suggest-hooks'            => 'execute_suggest_hooks',
				'mycred/apply-hooks'              => 'execute_apply_hooks',
				'mycred/create-point-type'        => 'execute_create_point_type',
				'mycred/get-general-settings'     => 'execute_get_general_settings',
				'mycred/update-general-settings'  => 'execute_update_general_settings',
				'mycred/list-addons'              => 'execute_list_addons',
				'mycred/enable-addon'             => 'execute_enable_addon',
				'mycred/ensure-toolkit-plugin'    => 'execute_ensure_toolkit_plugin',
				'mycred/suggest-ranks'            => 'execute_suggest_ranks',
				'mycred/create-ranks'             => 'execute_create_ranks',
				'mycred/suggest-badges'           => 'execute_suggest_badges',
				'mycred/create-badges'            => 'execute_create_badges',
			);

			if ( ! isset( $map[ $name ] ) ) {
				return new WP_Error( 'unknown_tool', sprintf( 'Unknown tool: %s', $name ) );
			}

			$method    = $map[ $name ];
			$abilities = myCRED_AI_Abilities::instance();

			if ( method_exists( $abilities, $method ) ) {
				return $abilities->$method( is_array( $arguments ) ? $arguments : array() );
			}

			if ( method_exists( $this, $method ) ) {
				return $this->$method( is_array( $arguments ) ? $arguments : array() );
			}

			return new WP_Error( 'tool_unavailable', sprintf( 'Tool %s is not available on this site.', $name ) );
		}

		/**
		 * Handle chat through the myCred middleware with a ReAct ability loop.
		 * The middleware LLM decides when to call a tool; abilities execute locally on WordPress.
		 *
		 * @param string $user_message Latest message.
		 * @param array  $raw_history Raw posted history.
		 * @param string $system_instruction System instruction.
		 * @return void
		 */
		protected function handle_chat_via_middleware( $user_message, $raw_history, $system_instruction ) {
			if ( ! class_exists( 'myCRED_AI_Middleware_Client' ) ) {
				wp_send_json_error(
					array(
						'message' => __( 'The AI service is unavailable right now. Please try again later.', 'mycred' ),
					)
				);
			}

			$system_with_tools = $system_instruction . $this->build_middleware_tools_instruction();
			$original_messages = $this->get_middleware_messages_from_history( $raw_history, $user_message );
			$loop_messages     = $original_messages;

			$loop_count = 0;
			$max_loops  = 5;

			while ( $loop_count < $max_loops ) {
				$result = myCRED_AI_Middleware_Client::process_chat( $loop_messages, $system_with_tools );

				if ( is_wp_error( $result ) ) {
					$friendly = $this->format_ai_error_for_user( $result );
					$error    = array( 'message' => $friendly['message'] );
					$quota    = myCRED_AI_Middleware_Client::quota_from_error( $result );
					if ( is_array( $quota ) ) {
						$error['quota'] = $quota;
					}
					wp_send_json_error( $error );
				}

				$response_text = $result['content'];
				$tool_calls    = $this->find_all_middleware_tool_calls( $response_text );

				if ( ! empty( $tool_calls ) ) {
					$loop_messages[] = array(
						'role'    => 'assistant',
						'content' => $response_text,
					);

					$result_lines = array();
					foreach ( $tool_calls as $tool_call ) {
						$tool_result    = $this->execute_ability_by_name( $tool_call['name'], $tool_call['arguments'] );
						$result_lines[] = '[TOOL RESULT: ' . $tool_call['name'] . '] ' .
							( is_wp_error( $tool_result )
								? 'Error: ' . $tool_result->get_error_message()
								: wp_json_encode( $tool_result, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES )
							);
					}

					$loop_messages[] = array(
						'role'    => 'user',
						'content' => implode( "\n", $result_lines ),
					);

					$loop_count++;
					continue;
				}

				$display_history = array();
				foreach ( $original_messages as $message ) {
					$display_history[] = array(
						'role'  => $message['role'],
						'parts' => array(
							array(
								'channel' => 'content',
								'type'    => 'text',
								'text'    => $message['content'],
							),
						),
					);
				}
				$display_history[] = array(
					'role'  => 'assistant',
					'parts' => array(
						array(
							'channel' => 'content',
							'type'    => 'text',
							'text'    => $response_text,
						),
					),
				);

				wp_send_json_success(
					array(
						'reply'             => $response_text,
						'history'           => $display_history,
						'ai_provider'       => 'mycred_middleware',
						'ai_provider_label' => 'myCred AI',
						'quota'             => isset( $result['quota'] ) ? $result['quota'] : null,
					)
				);
				return;
			}

			wp_send_json_error( array( 'message' => __( 'Maximum resolution loop count exceeded.', 'mycred' ) ) );
		}

		/**
		 * AJAX Chat Controller — myCred middleware only.
		 */
		public function handle_chat_ajax() {
			// Security checks
			check_ajax_referer( 'mycred_ai_chat_nonce', 'nonce' );

			if ( ! $this->permission_callback( null ) ) {
				wp_send_json_error( array( 'message' => __( 'Forbidden: insufficient permissions.', 'mycred' ) ) );
			}

			$user_message = isset( $_POST['message'] ) ? sanitize_text_field( $_POST['message'] ) : '';
			if ( empty( $user_message ) ) {
				wp_send_json_error( array( 'message' => __( 'Message cannot be empty.', 'mycred' ) ) );
			}

			$raw_history = ! empty( $_POST['history'] ) && is_array( $_POST['history'] ) ? $_POST['history'] : array();
			$types_str   = $this->get_point_types_instruction_string();
			$this->handle_chat_via_middleware( $user_message, $raw_history, $this->get_middleware_system_instruction( $types_str ) );
		}		

		/**
		 * Admin Screen View Renderer
		 */
		public function admin_page() {
			$mycred_ai_ranks_active       = myCRED_AI_Abilities::is_ranks_addon_active();
			$mycred_ai_badges_active      = myCRED_AI_Abilities::is_badges_addon_active();
			$mycred_ai_avatar_url         = $this->get_ai_avatar_url();
			$mycred_ai_empty_mascot_url   = $this->get_ai_empty_mascot_url();
			$mycred_ai_greeting_label     = $this->get_empty_state_greeting_label();
			$mycred_ai_upcoming_abilities = myCRED_AI_Abilities::get_upcoming_abilities();

			if ( function_exists( 'mycred_render_admin_header' ) ) {
				mycred_render_admin_header();
			}

			$view_path = plugin_dir_path( __FILE__ ) . 'views/admin-chat-page.php';
			if ( file_exists( $view_path ) ) {
				include $view_path;
			} else {
				echo '<div class="notice notice-error"><p>' . __( 'AI Assistant view file is missing.', 'mycred' ) . '</p></div>';
			}
		}

	}

	myCRED_AI_Admin::instance();

};
