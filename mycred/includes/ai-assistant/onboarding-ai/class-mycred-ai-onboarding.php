<?php
/**
 * myCred first-install onboarding wizard.
 *
 * Isolated from the AI Assistant chat admin so the wizard can load
 * without the chat UI, abilities, or myCRED_Module.
 *
 * @package myCred
 * @subpackage AI
 * @since 1.0.3
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! trait_exists( 'myCRED_Onboarding_Apply' ) ) {
	require_once plugin_dir_path( __FILE__ ) . 'trait-mycred-onboarding-apply.php';
}

if ( ! class_exists( 'myCRED_Onboarding_Manual' ) ) {
	require_once dirname( __DIR__ ) . '/onboarding-manual/class-mycred-onboarding-manual.php';
}

if ( ! class_exists( 'myCRED_AI_Onboarding' ) ) {

	class myCRED_AI_Onboarding {

		use myCRED_Onboarding_Apply;

		/**
		 * Singleton instance.
		 *
		 * @var myCRED_AI_Onboarding|null
		 */
		protected static $_instance = null;

		/**
		 * Setup instance singleton.
		 *
		 * @return myCRED_AI_Onboarding
		 */
		public static function instance() {
			if ( is_null( self::$_instance ) ) {
				self::$_instance = new self();
			}
			return self::$_instance;
		}

		/**
		 * Register wizard menu, redirects, assets, and AJAX.
		 */
		public function __construct() {
			add_action( 'wp_ajax_mycred_ai_onboarding_recommend', array( $this, 'handle_onboarding_recommend_ajax' ) );
			add_action( 'wp_ajax_mycred_ai_onboarding_manual', array( $this, 'handle_onboarding_manual_ajax' ) );
			add_action( 'wp_ajax_mycred_ai_onboarding_apply', array( $this, 'handle_onboarding_apply_ajax' ) );
			add_action( 'wp_ajax_mycred_ai_quota', array( $this, 'handle_quota_ajax' ) );
			add_action( 'wp_ajax_mycred_complete_tour_guide', array( $this, 'ajax_complete_tour_guide' ) );
			add_action( 'admin_init', array( $this, 'maybe_redirect_onboarding' ) );
			add_action( 'admin_init', array( $this, 'maybe_migrate_onboarding_expiration_hook_prefs' ) );
			add_action( 'admin_menu', array( $this, 'register_onboarding_menu' ) );
			add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_assets' ) );
			add_filter( 'admin_body_class', array( $this, 'admin_body_class' ) );
			add_action( 'admin_head', array( $this, 'hide_admin_notices' ), 1 );
		}

		/**
		 * Enqueue wizard assets on the onboarding screen.
		 *
		 * @param string $hook_suffix Current hook suffix.
		 * @return void
		 */
		public function enqueue_assets( $hook_suffix ) {
			if ( $this->is_onboarding_admin_screen( $hook_suffix ) ) {
				$this->enqueue_onboarding_assets();
			}
		}

		/**
		 * Whether the current user can run onboarding / tour-complete actions.
		 *
		 * @param mixed $input Unused; kept for call-site compatibility.
		 * @return bool
		 */
		public function permission_callback( $input = null ) {
			$capability = 'manage_options';
			if ( function_exists( 'mycred' ) ) {
				$mycred = mycred();
				if ( is_object( $mycred ) && method_exists( $mycred, 'get_point_editor_capability' ) ) {
					$capability = $mycred->get_point_editor_capability();
				}
			}
			return current_user_can( $capability ) || current_user_can( 'manage_options' );
		}

		/**
		 * AJAX: live quota from middleware. UI already shows the default 60,000 tokens.
		 *
		 * @return void
		 */
		public function handle_quota_ajax() {
			check_ajax_referer( 'mycred_ai_quota', 'nonce' );
			if ( ! $this->permission_callback( null ) ) {
				wp_send_json_error( array( 'message' => __( 'Forbidden: insufficient permissions.', 'mycred' ) ), 403 );
			}

			$onboarding = ! empty( $_POST['onboarding'] );
			$quota      = class_exists( 'myCRED_AI_Middleware_Client' )
				? myCRED_AI_Middleware_Client::fetch_quota( (bool) $onboarding )
				: null;

			wp_send_json_success( $quota );
		}

		/**
		 * Map technical AI errors to a message suitable for the wizard AJAX response.
		 *
		 * @param string|WP_Error $error Raw error.
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

			if ( 'no_middleware_credits' === $code && '' !== $message ) {
				return array(
					'message' => $message,
					'is_html' => false,
				);
			}

			foreach ( $config_patterns as $pattern ) {
				if ( false !== strpos( $haystack, $pattern ) ) {
					return array(
						'message' => __( 'AI Assistant is not connected yet. Configure an AI provider in myCred settings, then try again.', 'mycred' ),
						'is_html' => false,
					);
				}
			}

			return $this->onboarding_ai_unavailable_error();
		}

		/**
		 * User-facing onboarding AI failure, with a link to Predefined Template.
		 *
		 * @return array{message: string, is_html: bool}
		 */
		protected function onboarding_ai_unavailable_error() {
			$link = '<a href="#" class="mycred-ob-open-manual">' . esc_html__( 'Predefined Template', 'mycred' ) . '</a>';

			return array(
				'message' => sprintf(
					/* translators: %s: Predefined Template link */
					__( 'AI setup is unavailable right now. Please try again later, or continue with %s.', 'mycred' ),
					$link
				),
				'is_html' => true,
			);
		}

		/**
		 * Register a hidden onboarding wizard page (not listed in the myCred menu).
		 *
		 * @return void
		 */
		public function register_onboarding_menu() {
			if ( mycred_override_settings() && ! mycred_is_main_site() ) {
				return;
			}

			$capability = 'manage_options';
			$mycred     = function_exists( 'mycred' ) ? mycred() : null;
			if ( is_object( $mycred ) && method_exists( $mycred, 'get_point_admin_capability' ) ) {
				$capability = $mycred->get_point_admin_capability();
			}

			add_submenu_page(
				'admin.php',
				__( 'myCred Onboarding', 'mycred' ),
				__( 'Onboarding', 'mycred' ),
				$capability,
				'mycred-onboarding',
				array( $this, 'onboarding_page' )
			);
		}

		/**
		 * Keep new installs on the wizard until it is finished, then block it.
		 *
		 * @return void
		 */
		public function maybe_redirect_onboarding() {
			if ( ! is_admin() || wp_doing_ajax() || ( function_exists( 'wp_doing_cron' ) && wp_doing_cron() ) ) {
				return;
			}

			if ( isset( $_REQUEST['action'] ) && 'heartbeat' === $_REQUEST['action'] ) {
				return;
			}

			global $pagenow;
			$skip_screens = array(
				'admin-ajax.php',
				'admin-post.php',
				'async-upload.php',
				'media-upload.php',
				'update.php',
				'update-core.php',
				'plugin-install.php',
				'customize.php',
			);
			if ( in_array( $pagenow, $skip_screens, true ) ) {
				return;
			}

			global $myc_fs;
			if ( isset( $myc_fs ) && is_object( $myc_fs ) && method_exists( $myc_fs, 'is_activation_mode' ) && $myc_fs->is_activation_mode() ) {
				return;
			}

			$mycred = mycred();
			if ( ! is_object( $mycred ) || ! current_user_can( $mycred->get_point_admin_capability() ) ) {
				return;
			}

			$page          = isset( $_GET['page'] ) ? sanitize_key( wp_unslash( $_GET['page'] ) ) : '';
			$on_onboarding = ( 'mycred-onboarding' === $page );
			$on_tour       = isset( $_GET['mycred_tour_guide'] );
			$dashboard     = admin_url( 'admin.php?page=mycred-dashboard' );

			if ( function_exists( 'mycred_is_tour_guide_completed' ) && mycred_is_tour_guide_completed() ) {
				if ( $on_onboarding ) {
					wp_safe_redirect( $dashboard );
					exit;
				}
				return;
			}

			if ( ! function_exists( 'mycred_is_onboarding_pending' ) || ! mycred_is_onboarding_pending() ) {
				return;
			}

			if ( $on_onboarding || $on_tour ) {
				return;
			}

			wp_safe_redirect( admin_url( 'admin.php?page=mycred-onboarding' ) );
			exit;
		}

		/**
		 * Persist the shared tour/onboarding completion option.
		 *
		 * @return void
		 */
		public function ajax_complete_tour_guide() {
			check_ajax_referer( 'mycred-complete-tour-guide', 'nonce' );

			if ( ! $this->permission_callback( array() ) ) {
				wp_send_json_error( array( 'message' => __( 'You do not have permission to do this.', 'mycred' ) ), 403 );
			}

			$enable_addons = isset( $_POST['enable_addons'] ) && '1' === (string) wp_unslash( $_POST['enable_addons'] );
			$mark_complete = ! isset( $_POST['mark_complete'] ) || '1' === (string) wp_unslash( $_POST['mark_complete'] );

			if ( $enable_addons && function_exists( 'mycred_enable_all_builtin_addons' ) ) {
				mycred_enable_all_builtin_addons();
			}

			if ( $mark_complete && function_exists( 'mycred_mark_tour_guide_completed' ) ) {
				mycred_mark_tour_guide_completed();
			}

			wp_send_json_success(
				array(
					'completed'     => $mark_complete,
					'addons_enabled' => $enable_addons,
				)
			);
		}

		/**
		 * Whether the current admin screen is the onboarding wizard.
		 *
		 * @param string $hook_suffix Current hook suffix.
		 * @return bool
		 */
		public function is_onboarding_admin_screen( $hook_suffix ) {
			return strpos( $hook_suffix, 'mycred-onboarding' ) !== false;
		}

		/**
		 * Add a body class so the wizard can override WP admin chrome.
		 *
		 * @param string $classes Existing body classes.
		 * @return string
		 */
		public function admin_body_class( $classes ) {
			$page = isset( $_GET['page'] ) ? sanitize_key( wp_unslash( $_GET['page'] ) ) : '';
			if ( 'mycred-onboarding' === $page ) {
				$classes .= ' mycred-ob-admin';
			}
			return $classes;
		}

		/**
		 * Strip WordPress / Freemius / plugin admin notices from the wizard.
		 *
		 * @return void
		 */
		public function hide_admin_notices() {
			$page = isset( $_GET['page'] ) ? sanitize_key( wp_unslash( $_GET['page'] ) ) : '';
			if ( 'mycred-onboarding' !== $page ) {
				return;
			}

			remove_all_actions( 'admin_notices' );
			remove_all_actions( 'all_admin_notices' );
			remove_all_actions( 'network_admin_notices' );
			remove_all_actions( 'user_admin_notices' );
		}

		/**
		 * Enqueue onboarding wizard assets.
		 *
		 * @return void
		 */
		public function enqueue_onboarding_assets() {
			wp_enqueue_style(
				'mycred-ai-fonts',
				'https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap',
				array(),
				null
			);

			$onboarding_css = plugin_dir_path( __FILE__ ) . 'assets/css/mycred-ai-onboarding.css';
			$onboarding_js  = plugin_dir_path( __FILE__ ) . 'assets/js/mycred-ai-onboarding.js';
			$style_deps     = array( 'mycred-ai-fonts' );
			if ( wp_style_is( 'mycred-admin-ui', 'registered' ) ) {
				$style_deps[] = 'mycred-admin-ui';
			}

			wp_enqueue_style(
				'mycred-ai-onboarding-css',
				plugins_url( 'assets/css/mycred-ai-onboarding.css', __FILE__ ),
				$style_deps,
				file_exists( $onboarding_css ) ? (string) filemtime( $onboarding_css ) : MYCRED_AI_VERSION
			);

			$quota_css = dirname( __DIR__ ) . '/middleware/assets/css/mycred-ai-quota.css';
			wp_enqueue_style(
				'mycred-ai-quota-css',
				plugins_url( '../middleware/assets/css/mycred-ai-quota.css', __FILE__ ),
				array( 'mycred-ai-onboarding-css' ),
				file_exists( $quota_css ) ? (string) filemtime( $quota_css ) : MYCRED_AI_VERSION
			);

			wp_enqueue_script(
				'mycred-ai-onboarding-js',
				plugins_url( 'assets/js/mycred-ai-onboarding.js', __FILE__ ),
				array(),
				file_exists( $onboarding_js ) ? (string) filemtime( $onboarding_js ) : MYCRED_AI_VERSION,
				true
			);

			wp_localize_script(
				'mycred-ai-onboarding-js',
				'mycredOnboarding',
				array(
					'dashboardUrl'   => admin_url( 'admin.php?page=mycred-dashboard' ),
					'manualSetupUrl' => admin_url( 'admin.php?page=' . ( defined( 'MYCRED_MAIN_SLUG' ) ? MYCRED_MAIN_SLUG : 'mycred-main' ) . '&mycred_tour_guide=1' ),
					'ajaxUrl'        => admin_url( 'admin-ajax.php' ),
					'completeNonce'  => wp_create_nonce( 'mycred-complete-tour-guide' ),
					'recommendNonce' => wp_create_nonce( 'mycred_ai_onboarding_recommend' ),
					'manualNonce'    => wp_create_nonce( 'mycred_ai_onboarding_manual' ),
					'applyNonce'     => wp_create_nonce( 'mycred_ai_onboarding_apply' ),
					'siteTypes'      => $this->get_onboarding_site_taxonomy(),
					'platformStatus' => $this->get_onboarding_platform_plugin_status(),
					'logReferences'  => function_exists( 'mycred_get_all_references' ) ? mycred_get_all_references() : array(),
					'userRoles'      => $this->get_onboarding_user_roles(),
					'promptMax'         => 1000,
					'toolkitProActive'  => function_exists( 'mycred_is_toolkit_pro_plugin_active' ) && mycred_is_toolkit_pro_plugin_active(),
					'quota'             => class_exists( 'myCRED_AI_Middleware_Client' ) ? myCRED_AI_Middleware_Client::default_quota() : null,
					'quotaNonce'        => wp_create_nonce( 'mycred_ai_quota' ),
					'strings'      => array(
						'tokensLabel'     => __( 'AI tokens', 'mycred' ),
						'tokensUsage'     => __( 'AI tokens usage', 'mycred' ),
						'creditsLabel'    => __( 'AI credits', 'mycred' ),
						'creditsUsage'    => __( 'AI credits usage', 'mycred' ),
						'thisMonth'       => __( 'This month:', 'mycred' ),
						'thisYear'        => __( 'This year:', 'mycred' ),
						'lifetime'        => __( 'Lifetime:', 'mycred' ),
						'usedLabel'       => __( 'Used:', 'mycred' ),
						'refreshMonth'    => __( 'refreshes every month', 'mycred' ),
						'refreshYear'     => __( 'refreshes every year', 'mycred' ),
						'tokensHint'      => __( 'Tokens used of your site budget.', 'mycred' ),
						'creditsHint'     => __( 'AI requests used of your credit budget.', 'mycred' ),
						'next'              => __( 'Next', 'mycred' ),
						'showRecommended'   => __( 'Show recommended setup', 'mycred' ),
						'selectSiteType'    => __( 'Select a website type', 'mycred' ),
						'manualOverview'    => __( 'Setup overview', 'mycred' ),
						'manualWhy'         => __( 'Why this setup?', 'mycred' ),
						'applyError'        => __( 'Could not apply the selected settings. Please try again.', 'mycred' ),
						'applying'          => __( 'Applying selected settings…', 'mycred' ),
						'addonsArea'        => __( 'Add-on', 'mycred' ),
						'aiOverview'        => __( 'AI setup overview', 'mycred' ),
						'manualComplete'    => __( 'Selected add-ons and hooks have been enabled. You can fine-tune amounts on the Hooks screen.', 'mycred' ),
						'manualFieldsError' => __( 'Please select a website type, platform, and primary goal.', 'mycred' ),
						'generate'          => __( 'Generate recommendations', 'mycred' ),
						'review'            => __( 'Review changes', 'mycred' ),
						'apply'             => __( 'Apply selected settings', 'mycred' ),
						'openDashboard'     => __( 'Open myCred Dashboard', 'mycred' ),
						'complete'          => __( 'Complete', 'mycred' ),
						'siteDetails'       => __( 'Site details', 'mycred' ),
						'describeProgram'   => __( 'Describe program', 'mycred' ),
						'recommendedSetup'  => __( 'Recommended %s setup', 'mycred' ),
						'recommendedSub'    => __( 'Review the point type, hooks and relevant add-ons before applying them.', 'mycred' ),
						'recommendedSubNoPay' => __( 'Review the point type, hooks and relevant add-ons before applying them.', 'mycred' ),
						'rewardPoints'      => __( 'Reward Points', 'mycred' ),
						'selectPlatform'    => __( 'Select a platform', 'mycred' ),
						'recommended'       => __( 'Recommended', 'mycred' ),
						'optional'          => __( 'Optional', 'mycred' ),
						'platformSelected'  => __( '%s selected', 'mycred' ),
						'platformPluginMissing' => __( '%s is not installed. Setup will still complete, but %s features will not appear until you install and activate it.', 'mycred' ),
						'requiresPlugin'    => __( 'Requires %s', 'mycred' ),
						'addonsPro'         => __( 'myCred Addons Pro', 'mycred' ),
						'pointTypeProposed' => __( '1 point type proposed', 'mycred' ),
						'hooksSelected'     => __( '%s earning hooks selected', 'mycred' ),
						'checkoutSuggested' => __( '%s checkout settings suggested', 'mycred' ),
						'settingsSuggested' => __( '%s add-on settings suggested', 'mycred' ),
						'addonsSuggested'   => __( '%s add-ons recommended', 'mycred' ),
						'reviewArea'        => __( 'Area', 'mycred' ),
						'reviewNone'        => __( 'None', 'mycred' ),
						'reviewDisabled'    => __( 'Disabled', 'mycred' ),
						'noHooks'           => __( 'No matching hooks were returned. Try a more specific prompt.', 'mycred' ),
						'noSettings'        => __( 'No matching add-on settings were returned for this setup.', 'mycred' ),
						'noAddons'          => __( 'No matching add-ons were returned. Try a more specific prompt.', 'mycred' ),
						'addonHooks'        => __( 'Hooks', 'mycred' ),
						'earningRules'      => __( 'Earning Rules', 'mycred' ),
						'addonSettings'     => __( 'Settings', 'mycred' ),
						'addonProductReferral' => __( 'Product Referral', 'mycred' ),
						'productRewardInfoTitle' => __( 'Single Product Reward', 'mycred' ),
						'productRewardInfo' => __( 'You can set a point reward on each product later from the product edit screen.', 'mycred' ),
						'pointsFallback'    => __( 'Points', 'mycred' ),
						'exchangeRateEquals'=> __( '= 1 %s', 'mycred' ),
						'addonAbout'        => __( 'About', 'mycred' ),
						'addonAboutTitle'   => __( 'What this add-on does', 'mycred' ),
						'addonCheckout'     => __( 'Checkout', 'mycred' ),
						'addonNoDetails'    => __( 'No extra hooks or settings for this add-on.', 'mycred' ),
						'addonRanks'        => __( 'Ranks & Tiers', 'mycred' ),
						'addonBadges'       => __( 'Badges', 'mycred' ),
						'ranksAiNote'       => __( 'These ranks are AI generated. You can change names and point ranges later.', 'mycred' ),
						'badgesAiNote'      => __( 'These badges are AI generated. You can change names later.', 'mycred' ),
						'addonConfigTitle'  => __( '%s configuration', 'mycred' ),
						'rankPointsRange'   => __( '%1$s – %2$s points', 'mycred' ),
						'badgeManual'       => __( 'Awarded manually', 'mycred' ),
						'addReference'      => __( 'Type a reference and press Enter', 'mycred' ),
						'searchReferences'  => __( 'Search references', 'mycred' ),
						'recommendError'    => __( 'Could not generate add-on recommendations. Please try again.', 'mycred' ),
						'recommendConfigError' => __( 'Could not load AI setup. Refresh the page and try again.', 'mycred' ),
						'recommendFieldsError' => __( 'Please select a website type, platform, and primary goal.', 'mycred' ),
						'recommendTimeout'  => __( 'The AI request timed out or returned an invalid response. Please try again.', 'mycred' ),
						'promptCount'       => __( '%1$s / %2$s', 'mycred' ),
						'exampleStore'      => __( 'I run a WooCommerce fashion store. Customers should earn 1 point for every $1 spent, 20 points for approved product reviews, and 100 points after a successful referral. They should use points as a checkout discount, but points should cover no more than 50% of an order.', 'mycred' ),
						'exampleCommunity'  => __( 'I run a member community. Reward registration, daily login, publishing posts, useful comments and receiving likes. Add ranks and badges, but do not let members convert points to cash.', 'mycred' ),
						'exampleCourses'    => __( 'I sell online courses. Students should earn points when completing lessons, passing quizzes and finishing a course. Let them use points to unlock bonus content and show progress with ranks.', 'mycred' ),
					),
				)
			);
		}

		/**
		 * Current WordPress user roles for onboarding multi-selects.
		 *
		 * @return array<string, string>
		 */
		protected function get_onboarding_user_roles() {
			if ( ! function_exists( 'wp_roles' ) ) {
				return array();
			}
			$roles = wp_roles()->get_names();
			if ( ! is_array( $roles ) ) {
				return array();
			}
			$out = array();
			foreach ( $roles as $key => $label ) {
				$out[ sanitize_key( (string) $key ) ] = translate_user_role( (string) $label );
			}

			return $out;
		}

		/**
		 * Website types, platforms, and goals for the onboarding AI step.
		 *
		 * @return array<string, array>
		 */
		public function get_onboarding_site_taxonomy() {
			return array(
				'store'      => array(
					'label'     => __( 'E-commerce Store', 'mycred' ),
					'platforms' => array(
						'woocommerce'  => __( 'WooCommerce', 'mycred' ),
						'surecart'     => __( 'SureCart', 'mycred' ),
						'fluentcart'   => __( 'FluentCart', 'mycred' ),
						'studiocart'   => __( 'Studiocart', 'mycred' ),
						'edd'          => __( 'Easy Digital Downloads', 'mycred' ),
						'simplepay'    => __( 'WP Simple Pay', 'mycred' ),
						'dokan'        => __( 'Dokan marketplace', 'mycred' ),
					),
					'goals'     => array(
						'repeat_purchases' => __( 'Increase repeat purchases', 'mycred' ),
						'loyalty'          => __( 'Build customer loyalty', 'mycred' ),
						'aov'              => __( 'Increase average order value', 'mycred' ),
						'reviews'          => __( 'Reward product reviews', 'mycred' ),
						'referrals'        => __( 'Reward referrals', 'mycred' ),
						'pay_with_points'  => __( 'Let customers pay with points', 'mycred' ),
						'first_purchase'   => __( 'Reward first-time buyers', 'mycred' ),
						'vendor_rewards'   => __( 'Marketplace vendor rewards', 'mycred' ),
					),
				),
				'lms'        => array(
					'label'     => __( 'LMS / Courses', 'mycred' ),
					'platforms' => array(
						'learndash'    => __( 'LearnDash', 'mycred' ),
						'lifterlms'    => __( 'LifterLMS', 'mycred' ),
						'tutor'        => __( 'Tutor LMS', 'mycred' ),
						'sensei'       => __( 'Sensei LMS', 'mycred' ),
						'academy'      => __( 'Academy LMS', 'mycred' ),
						'masteriyo'    => __( 'Masteriyo LMS', 'mycred' ),
						'masterstudy'  => __( 'MasterStudy LMS', 'mycred' ),
						'courseware'   => __( 'WP Courseware', 'mycred' ),
						'h5p'          => __( 'H5P', 'mycred' ),
					),
					'goals'     => array(
						'course_completion' => __( 'Reward course / lesson completion', 'mycred' ),
						'quiz_engagement'   => __( 'Increase quiz engagement', 'mycred' ),
						'enrollments'       => __( 'Reward enrollments', 'mycred' ),
						'gamify_learning'   => __( 'Gamify learning (ranks + badges)', 'mycred' ),
						'unlock_content'    => __( 'Unlock bonus content with points', 'mycred' ),
						'reduce_dropout'    => __( 'Reduce course dropout', 'mycred' ),
					),
				),
				'membership' => array(
					'label'     => __( 'Membership Website', 'mycred' ),
					'platforms' => array(
						'memberpress' => __( 'MemberPress', 'mycred' ),
						'pmpro'       => __( 'Paid Memberships Pro', 'mycred' ),
						'pms'         => __( 'Paid Member Subscriptions', 'mycred' ),
					),
					'goals'     => array(
						'signups'       => __( 'Reward signups and renewals', 'mycred' ),
						'reduce_churn'  => __( 'Reduce membership churn', 'mycred' ),
						'gate_content'  => __( 'Gate content with points', 'mycred' ),
						'member_activity' => __( 'Reward member activity', 'mycred' ),
						'upgrades'      => __( 'Upgrade members to higher plans', 'mycred' ),
					),
				),
				'community'  => array(
					'label'     => __( 'Community Website', 'mycred' ),
					'platforms' => array(
						'buddyboss'        => __( 'BuddyBoss', 'mycred' ),
						'buddypress'       => __( 'BuddyPress', 'mycred' ),
						'fluentcommunity'  => __( 'FluentCommunity', 'mycred' ),
						'anspress'         => __( 'AnsPress', 'mycred' ),
						'userpro'          => __( 'UserPro', 'mycred' ),
						'usersultra'       => __( 'Users Ultra', 'mycred' ),
						'wp_user_manager'  => __( 'WP User Manager', 'mycred' ),
					),
					'goals'     => array(
						'engagement'    => __( 'Increase engagement', 'mycred' ),
						'daily_activity' => __( 'Reward daily activity', 'mycred' ),
						'gamify'        => __( 'Gamify with ranks and badges', 'mycred' ),
						'referrals'     => __( 'Reward referrals / invites', 'mycred' ),
						'transfers'     => __( 'Enable peer-to-peer transfers', 'mycred' ),
						'top_members'   => __( 'Recognize top members', 'mycred' ),
					),
				),
				'forms'      => array(
					'label'     => __( 'Forms / Lead Capture', 'mycred' ),
					'platforms' => array(
						'wpforms'        => __( 'WPForms', 'mycred' ),
						'fluentforms'    => __( 'Fluent Forms', 'mycred' ),
						'formidable'     => __( 'Formidable Forms', 'mycred' ),
						'forminator'     => __( 'Forminator', 'mycred' ),
						'ninjaforms'     => __( 'Ninja Forms', 'mycred' ),
						'gravity'        => __( 'Gravity Forms Booking', 'mycred' ),
						'everest'        => __( 'Everest Forms', 'mycred' ),
						'sureform'       => __( 'SureForm', 'mycred' ),
						'weforms'        => __( 'weForms', 'mycred' ),
						'wsform'         => __( 'WS Form', 'mycred' ),
						'arforms'        => __( 'ARForms', 'mycred' ),
						'bitform'        => __( 'Bit Form', 'mycred' ),
						'formmaker'      => __( 'Form Maker', 'mycred' ),
						'gutena'         => __( 'Gutena Forms', 'mycred' ),
						'happyforms'     => __( 'HappyForms', 'mycred' ),
						'jetform'        => __( 'JetFormBuilder', 'mycred' ),
						'kaliforms'      => __( 'Kali Forms', 'mycred' ),
						'metform'        => __( 'MetForm', 'mycred' ),
						'totalsurvey'    => __( 'TotalSurvey', 'mycred' ),
						'totalpoll'      => __( 'TotalPoll', 'mycred' ),
						'ratingform'     => __( 'Rating Form', 'mycred' ),
					),
					'goals'     => array(
						'submissions'   => __( 'Reward every form submission', 'mycred' ),
						'field_values'  => __( 'Reward specific field values / forms', 'mycred' ),
						'leads'         => __( 'Generate more leads', 'mycred' ),
						'surveys'       => __( 'Reward surveys and polls', 'mycred' ),
						'quiz_forms'    => __( 'Reward quiz-style forms', 'mycred' ),
					),
				),
				'bookings'   => array(
					'label'     => __( 'Bookings / Appointments', 'mycred' ),
					'platforms' => array(
						'bookly'         => __( 'Bookly', 'mycred' ),
						'bookingpress'   => __( 'BookingPress', 'mycred' ),
						'booknetic'      => __( 'Booknetic', 'mycred' ),
						'bookify'        => __( 'Bookify', 'mycred' ),
						'bookingcalendar' => __( 'Booking Calendar', 'mycred' ),
						'fluentbooking'  => __( 'Fluent Booking', 'mycred' ),
						'ssa'            => __( 'Simply Schedule Appointments', 'mycred' ),
						'wptravel'       => __( 'WP Travel', 'mycred' ),
					),
					'goals'     => array(
						'completed'     => __( 'Reward completed bookings', 'mycred' ),
						'repeat'        => __( 'Increase repeat appointments', 'mycred' ),
						'referrals'     => __( 'Reward referrals for bookings', 'mycred' ),
						'loyalty'       => __( 'Loyalty for returning clients', 'mycred' ),
					),
				),
				'events'     => array(
					'label'     => __( 'Events', 'mycred' ),
					'platforms' => array(
						'tec'             => __( 'The Events Calendar', 'mycred' ),
						'event_tickets'   => __( 'Event Tickets', 'mycred' ),
						'event_espresso'  => __( 'Event Espresso', 'mycred' ),
						'events_manager'  => __( 'Events Manager Pro', 'mycred' ),
						'zoom'            => __( 'Zoom', 'mycred' ),
					),
					'goals'     => array(
						'tickets'       => __( 'Reward ticket purchases', 'mycred' ),
						'attendance'    => __( 'Reward event attendance', 'mycred' ),
						'pay_with_points' => __( 'Pay for tickets with points', 'mycred' ),
						'zoom'          => __( 'Reward Zoom / session attendance', 'mycred' ),
					),
				),
				'donations'  => array(
					'label'     => __( 'Donations', 'mycred' ),
					'platforms' => array(
						'givewp' => __( 'GiveWP', 'mycred' ),
					),
					'goals'     => array(
						'donors'        => __( 'Reward donors', 'mycred' ),
						'repeat'        => __( 'Encourage repeat donations', 'mycred' ),
						'major_donors'  => __( 'Recognize major donors', 'mycred' ),
					),
				),
				'directory'  => array(
					'label'     => __( 'Directory / Listings', 'mycred' ),
					'platforms' => array(
						'geodirectory' => __( 'GeoDirectory', 'mycred' ),
						'wpadverts'    => __( 'WPAdverts', 'mycred' ),
					),
					'goals'     => array(
						'listings'      => __( 'Reward new listings', 'mycred' ),
						'renewals'      => __( 'Reward listing renewals', 'mycred' ),
						'inquiries'     => __( 'Reward inquiries / messages', 'mycred' ),
					),
				),
				'blog'       => array(
					'label'     => __( 'Blog / Content', 'mycred' ),
					'platforms' => array(
						'wordpress'    => __( 'WordPress (core hooks)', 'mycred' ),
						'favorites'    => __( 'Favorites', 'mycred' ),
						'wpulike'      => __( 'WP ULike', 'mycred' ),
						'postviews'    => __( 'WP-PostViews', 'mycred' ),
						'gdstarrating' => __( 'GD Star Rating', 'mycred' ),
						'presto'       => __( 'Presto Player', 'mycred' ),
						'jwplayer'     => __( 'JW Player', 'mycred' ),
						'vimeo'        => __( 'Vimeo', 'mycred' ),
					),
					'goals'     => array(
						'comments'      => __( 'Reward comments and publishing', 'mycred' ),
						'reads'         => __( 'Reward reads, views, and likes', 'mycred' ),
						'video'         => __( 'Reward video watches', 'mycred' ),
						'returning'     => __( 'Grow returning readers', 'mycred' ),
					),
				),
				'other'      => array(
					'label'     => __( 'Other', 'mycred' ),
					'platforms' => array(
						'custom' => __( 'Custom / not listed', 'mycred' ),
					),
					'goals'     => array(
						'engagement'    => __( 'Increase engagement', 'mycred' ),
						'loyalty'       => __( 'Build loyalty', 'mycred' ),
						'gamify'        => __( 'Gamify the experience', 'mycred' ),
						'reduce_churn'  => __( 'Bring users back / reduce churn', 'mycred' ),
					),
				),
			);
		}

		/**
		 * Add-on slugs that depend on a third-party platform plugin.
		 *
		 * @return array<string, string[]> Slug => platform keys.
		 */
		protected function get_onboarding_addon_required_platforms() {
			$map      = array();
			$presets  = array(
				'woocommerce'     => array( 'woocommerce', 'mycred-woocommerce-plus' ),
				'surecart'        => array( 'mycred-surecart' ),
				'fluentcart'      => array( 'mycred-fluent-cart' ),
				'studiocart'      => array( 'mycred-studiocart' ),
				'edd'             => array( 'mycred-gateway-edd' ),
				'simplepay'       => array( 'mycred-simple-pay-integration' ),
				'dokan'           => array( 'mycred-dokan' ),
				'learndash'       => array( 'mycred-learndash' ),
				'lifterlms'       => array( 'mycred-lifterlms' ),
				'tutor'           => array( 'mycred-tutor-lms' ),
				'sensei'          => array( 'mycred-senseilms' ),
				'academy'         => array( 'mycred-academy-lms' ),
				'masteriyo'       => array( 'mycred-masteriyo-lms' ),
				'masterstudy'     => array( 'mycred-masterstudylms' ),
				'courseware'      => array( 'mycred-for-courseware' ),
				'h5p'             => array( 'mycred-h5p' ),
				'memberpress'     => array( 'mycred-memberpress' ),
				'pmpro'           => array( 'mycred-paid-memberships-pro' ),
				'pms'             => array( 'mycred-paid-membership-subscriptions' ),
				'buddyboss'       => array( 'mycred-buddyboss' ),
				'buddypress'      => array( 'hook_bp_profile' ),
				'fluentcommunity' => array( 'mycred-fluent-community' ),
				'anspress'        => array( 'mycred-anspress-integration' ),
				'userpro'         => array( 'mycred-userpro' ),
				'usersultra'      => array( 'mycred-usersultra' ),
				'wp_user_manager' => array( 'mycred-wp-user-manager' ),
				'wpforms'         => array( 'mycred-wpforms' ),
				'fluentforms'     => array( 'mycred-fluentform' ),
				'formidable'      => array( 'mycred-formidable' ),
				'forminator'      => array( 'mycred-forminator' ),
				'ninjaforms'      => array( 'mycred-ninjaforms' ),
				'gravity'         => array( 'mycred-gravity-form-booking' ),
				'everest'         => array( 'mycred-everestform' ),
				'sureform'        => array( 'mycred-sureform' ),
				'weforms'         => array( 'mycred-weforms' ),
				'wsform'          => array( 'mycred-wsform' ),
				'arforms'         => array( 'mycred-arforms' ),
				'bitform'         => array( 'mycred-bitform' ),
				'formmaker'       => array( 'mycred-formmaker' ),
				'gutena'          => array( 'mycred-gutena-forms' ),
				'happyforms'      => array( 'mycred-happyform' ),
				'jetform'         => array( 'mycred-jetformbuilder' ),
				'kaliforms'       => array( 'mycred-kaliform' ),
				'metform'         => array( 'mycred-metform' ),
				'totalsurvey'     => array( 'mycred-for-totalsurvey' ),
				'totalpoll'       => array( 'mycred-for-totalpoll' ),
				'ratingform'      => array( 'mycred-for-rating-form' ),
				'bookly'          => array( 'mycred-bookly' ),
				'bookingpress'    => array( 'mycred-bookingpress' ),
				'booknetic'       => array( 'mycred-booknetic' ),
				'bookify'         => array( 'mycred-bookify' ),
				'bookingcalendar' => array( 'mycred-bookingcalendar' ),
				'fluentbooking'   => array( 'mycred-fluentbooking' ),
				'ssa'             => array( 'mycred-simply-schedule-appointments' ),
				'wptravel'        => array( 'mycred-wptravel' ),
				'tec'             => array( 'mycred-events-calendar' ),
				'event_tickets'   => array( 'mycred-event-tickets' ),
				'event_espresso'  => array( 'mycred-ee' ),
				'events_manager'  => array( 'mycred-for-events-manager-pro' ),
				'zoom'            => array( 'mycred-zoom-rewards' ),
				'givewp'          => array( 'mycred-give-wp-addon' ),
				'geodirectory'    => array( 'mycred-geodirectory' ),
				'wpadverts'       => array( 'mycred-wpadverts' ),
				'favorites'       => array( 'mycred-favorites' ),
				'wpulike'         => array( 'mycred-wp-ulike' ),
				'postviews'       => array( 'mycred-for-wp-postviews' ),
				'gdstarrating'    => array( 'mycred-for-gd-star-rating' ),
				'presto'          => array( 'mycred-presto-player' ),
				'jwplayer'        => array( 'mycred-jwplayer' ),
				'vimeo'           => array( 'mycred-videos' ),
			);

			foreach ( $presets as $platform => $slugs ) {
				foreach ( $slugs as $slug ) {
					if ( 0 === strpos( $slug, 'hook_' ) ) {
						continue;
					}
					if ( ! isset( $map[ $slug ] ) ) {
						$map[ $slug ] = array();
					}
					if ( ! in_array( $platform, $map[ $slug ], true ) ) {
						$map[ $slug ][] = $platform;
					}
				}
			}

			if ( isset( $map['woocommerce'] ) && ! in_array( 'woocommerce', $map['woocommerce'], true ) ) {
				$map['woocommerce'][] = 'woocommerce';
			}
			if ( isset( $map['mycred-dokan'] ) && ! in_array( 'woocommerce', $map['mycred-dokan'], true ) ) {
				$map['mycred-dokan'][] = 'woocommerce';
			}

			return $map;
		}

		/**
		 * How to detect each onboarding platform plugin.
		 *
		 * @return array<string, array>
		 */
		protected function get_onboarding_platform_plugin_detectors() {
			return array(
				'wordpress'       => array( 'always' => true ),
				'custom'          => array( 'always' => true ),
				'woocommerce'     => array( 'classes' => array( 'WooCommerce' ), 'plugins' => array( 'woocommerce/woocommerce.php' ) ),
				'surecart'        => array( 'classes' => array( 'SureCart' ), 'plugins' => array( 'surecart/surecart.php' ) ),
				'fluentcart'      => array( 'classes' => array( 'FluentCart\App\App' ), 'plugins' => array( 'fluent-cart/fluent-cart.php' ), 'needles' => array( 'fluent-cart/' ) ),
				'studiocart'      => array( 'classes' => array( 'NCS_Cart' ), 'plugins' => array( 'studiocart/studiocart.php' ), 'needles' => array( 'studiocart/' ) ),
				'edd'             => array( 'classes' => array( 'Easy_Digital_Downloads' ), 'plugins' => array( 'easy-digital-downloads/easy-digital-downloads.php' ) ),
				'simplepay'       => array( 'classes' => array( 'SimplePay\Core\SimplePay' ), 'plugins' => array( 'stripe/stripe-checkout.php', 'wp-simple-pay-pro-3/simple-pay.php' ), 'needles' => array( 'wp-simple-pay', 'stripe-checkout' ) ),
				'dokan'           => array( 'classes' => array( 'WeDevs_Dokan' ), 'plugins' => array( 'dokan-lite/dokan.php' ), 'needles' => array( 'dokan-lite/', 'dokan-pro/' ) ),
				'learndash'       => array( 'classes' => array( 'SFWD_LMS' ), 'plugins' => array( 'sfwd-lms/sfwd_lms.php' ) ),
				'lifterlms'       => array( 'classes' => array( 'LifterLMS' ), 'plugins' => array( 'lifterlms/lifterlms.php' ) ),
				'tutor'           => array( 'functions' => array( 'tutor' ), 'plugins' => array( 'tutor/tutor.php' ) ),
				'sensei'          => array( 'classes' => array( 'Sensei_Main' ), 'plugins' => array( 'sensei-lms/sensei-lms.php' ) ),
				'academy'         => array( 'classes' => array( 'Academy' ), 'plugins' => array( 'academy/academy.php' ), 'needles' => array( 'academy/' ) ),
				'masteriyo'       => array( 'classes' => array( 'Masteriyo\Masteriyo' ), 'plugins' => array( 'learning-management-system/lms.php' ), 'needles' => array( 'learning-management-system/', 'masteriyo' ) ),
				'masterstudy'     => array( 'classes' => array( 'STM_LMS_Helpers' ), 'needles' => array( 'masterstudy-lms' ) ),
				'courseware'      => array( 'functions' => array( 'WPCW_plugin_init' ), 'needles' => array( 'wp-courseware/' ) ),
				'h5p'             => array( 'classes' => array( 'H5P_Plugin' ), 'plugins' => array( 'h5p/h5p.php' ) ),
				'memberpress'     => array( 'classes' => array( 'MeprCtrlFactory' ), 'plugins' => array( 'memberpress/memberpress.php' ) ),
				'pmpro'           => array( 'functions' => array( 'pmpro_init' ), 'plugins' => array( 'paid-memberships-pro/paid-memberships-pro.php' ) ),
				'pms'             => array( 'classes' => array( 'Paid_Member_Subscriptions' ), 'needles' => array( 'paid-member-subscriptions/' ) ),
				'buddyboss'       => array( 'constants' => array( 'BP_PLATFORM_VERSION' ), 'plugins' => array( 'buddyboss-platform/bp-loader.php' ) ),
				'buddypress'      => array( 'functions' => array( 'buddypress' ), 'plugins' => array( 'buddypress/bp-loader.php' ) ),
				'fluentcommunity' => array( 'classes' => array( 'FluentCommunity\App\App' ), 'needles' => array( 'fluent-community/' ) ),
				'anspress'        => array( 'classes' => array( 'AnsPress' ), 'plugins' => array( 'anspress-question-answer/anspress-question-answer.php' ) ),
				'userpro'         => array( 'classes' => array( 'userpro_api' ), 'needles' => array( 'userpro/' ) ),
				'usersultra'      => array( 'classes' => array( 'XooUserUltra' ), 'needles' => array( 'users-ultra/' ) ),
				'wp_user_manager' => array( 'classes' => array( 'WP_User_Manager' ), 'plugins' => array( 'wp-user-manager/wp-user-manager.php' ) ),
				'wpforms'         => array( 'classes' => array( 'WPForms' ), 'plugins' => array( 'wpforms/wpforms.php', 'wpforms-lite/wpforms.php' ) ),
				'fluentforms'     => array( 'classes' => array( 'FluentForm\App\App' ), 'plugins' => array( 'fluentform/fluentform.php' ) ),
				'formidable'      => array( 'classes' => array( 'FrmAppHelper' ), 'plugins' => array( 'formidable/formidable.php' ) ),
				'forminator'      => array( 'classes' => array( 'Forminator' ), 'plugins' => array( 'forminator/forminator.php' ) ),
				'ninjaforms'      => array( 'classes' => array( 'Ninja_Forms' ), 'plugins' => array( 'ninja-forms/ninja-forms.php' ) ),
				'gravity'         => array( 'classes' => array( 'GFForms' ), 'plugins' => array( 'gravityforms/gravityforms.php' ) ),
				'everest'         => array( 'classes' => array( 'EverestForms' ), 'plugins' => array( 'everest-forms/everest-forms.php' ) ),
				'sureform'        => array( 'classes' => array( 'SRFM\Plugin' ), 'needles' => array( 'sureforms/' ) ),
				'weforms'         => array( 'classes' => array( 'WeForms' ), 'plugins' => array( 'weforms/weforms.php' ) ),
				'wsform'          => array( 'classes' => array( 'WS_Form' ), 'needles' => array( 'ws-form/' ) ),
				'arforms'         => array( 'classes' => array( 'arformcontroller' ), 'needles' => array( 'arforms' ) ),
				'bitform'         => array( 'needles' => array( 'bit-form/', 'bitform' ) ),
				'formmaker'       => array( 'needles' => array( 'form-maker/' ) ),
				'gutena'          => array( 'needles' => array( 'gutena-forms/' ) ),
				'happyforms'      => array( 'classes' => array( 'HappyForms' ), 'needles' => array( 'happyforms/' ) ),
				'jetform'         => array( 'classes' => array( 'Jet_Form_Builder\Plugin' ), 'needles' => array( 'jetformbuilder/' ) ),
				'kaliforms'       => array( 'needles' => array( 'kali-forms/' ) ),
				'metform'         => array( 'classes' => array( 'MetForm\Plugin' ), 'needles' => array( 'metform/' ) ),
				'totalsurvey'     => array( 'needles' => array( 'totalsurvey/' ) ),
				'totalpoll'       => array( 'needles' => array( 'totalpoll/' ) ),
				'ratingform'      => array( 'needles' => array( 'rating-form/' ) ),
				'bookly'          => array( 'classes' => array( 'Bookly\Lib\Plugin' ), 'needles' => array( 'bookly-responsive-appointment-booking-tool/', 'bookly/' ) ),
				'bookingpress'    => array( 'needles' => array( 'bookingpress-appointment-booking/' ) ),
				'booknetic'       => array( 'needles' => array( 'booknetic/' ) ),
				'bookify'         => array( 'needles' => array( 'bookify/' ) ),
				'bookingcalendar' => array( 'needles' => array( 'booking/', 'booking-calendar' ) ),
				'fluentbooking'   => array( 'needles' => array( 'fluent-booking/' ) ),
				'ssa'             => array( 'classes' => array( 'Simply_Schedule_Appointments' ), 'needles' => array( 'simply-schedule-appointments/' ) ),
				'wptravel'        => array( 'needles' => array( 'wp-travel/' ) ),
				'tec'             => array( 'classes' => array( 'Tribe__Events__Main' ), 'plugins' => array( 'the-events-calendar/the-events-calendar.php' ) ),
				'event_tickets'   => array( 'classes' => array( 'Tribe__Tickets__Main' ), 'plugins' => array( 'event-tickets/event-tickets.php' ) ),
				'event_espresso'  => array( 'classes' => array( 'EE_Base' ), 'needles' => array( 'event-espresso' ) ),
				'events_manager'  => array( 'classes' => array( 'EM_Events' ), 'plugins' => array( 'events-manager/events-manager.php' ) ),
				'zoom'            => array( 'needles' => array( 'video-conferencing-with-zoom', 'zoom-wordpress' ) ),
				'givewp'          => array( 'classes' => array( 'Give' ), 'plugins' => array( 'give/give.php' ) ),
				'geodirectory'    => array( 'classes' => array( 'GeoDirectory' ), 'plugins' => array( 'geodirectory/geodirectory.php' ) ),
				'wpadverts'       => array( 'functions' => array( 'adverts_init' ), 'plugins' => array( 'wpadverts/wpadverts.php' ) ),
				'favorites'       => array( 'classes' => array( 'Favorites' ), 'plugins' => array( 'favorites/favorites.php' ) ),
				'wpulike'         => array( 'classes' => array( 'WpUlikeInit' ), 'plugins' => array( 'wp-ulike/wp-ulike.php' ) ),
				'postviews'       => array( 'functions' => array( 'process_postviews' ), 'plugins' => array( 'wp-postviews/wp-postviews.php' ) ),
				'gdstarrating'    => array( 'needles' => array( 'gd-star-rating/' ) ),
				'presto'          => array( 'classes' => array( 'PrestoPlayer\Plugin' ), 'plugins' => array( 'presto-player/presto-player.php' ) ),
				'jwplayer'        => array( 'needles' => array( 'jw-player/' ) ),
				'vimeo'           => array( 'needles' => array( 'vimeo' ) ),
			);
		}

		/**
		 * Load WordPress plugin helpers used for onboarding detection.
		 *
		 * @return void
		 */
		protected function ensure_onboarding_plugin_functions() {
			if ( ! function_exists( 'is_plugin_active' ) ) {
				require_once ABSPATH . 'wp-admin/includes/plugin.php';
			}
		}

		/**
		 * Whether an active plugin path matches any needle.
		 *
		 * @param string[] $needles Path fragments.
		 * @return bool
		 */
		protected function is_onboarding_plugin_needle_active( $needles ) {
			$this->ensure_onboarding_plugin_functions();
			$active = (array) get_option( 'active_plugins', array() );
			if ( is_multisite() ) {
				$network = get_site_option( 'active_sitewide_plugins', array() );
				if ( is_array( $network ) ) {
					$active = array_merge( $active, array_keys( $network ) );
				}
			}
			foreach ( $active as $file ) {
				$haystack = strtolower( (string) $file );
				foreach ( (array) $needles as $needle ) {
					if ( '' !== $needle && false !== strpos( $haystack, strtolower( (string) $needle ) ) ) {
						return true;
					}
				}
			}
			return false;
		}

		/**
		 * Whether the third-party plugin for a platform key is active.
		 *
		 * @param string $platform Platform key.
		 * @return bool
		 */
		protected function is_onboarding_platform_plugin_active( $platform ) {
			$detectors = $this->get_onboarding_platform_plugin_detectors();
			if ( ! isset( $detectors[ $platform ] ) ) {
				return true;
			}

			$spec = $detectors[ $platform ];
			if ( ! empty( $spec['always'] ) ) {
				return true;
			}

			foreach ( (array) ( isset( $spec['classes'] ) ? $spec['classes'] : array() ) as $class_name ) {
				if ( $class_name && class_exists( $class_name ) ) {
					return true;
				}
			}
			foreach ( (array) ( isset( $spec['functions'] ) ? $spec['functions'] : array() ) as $function_name ) {
				if ( $function_name && function_exists( $function_name ) ) {
					return true;
				}
			}
			foreach ( (array) ( isset( $spec['constants'] ) ? $spec['constants'] : array() ) as $constant ) {
				if ( $constant && defined( $constant ) ) {
					return true;
				}
			}

			$this->ensure_onboarding_plugin_functions();
			foreach ( (array) ( isset( $spec['plugins'] ) ? $spec['plugins'] : array() ) as $plugin_file ) {
				if ( $plugin_file && is_plugin_active( $plugin_file ) ) {
					return true;
				}
			}

			if ( ! empty( $spec['needles'] ) && $this->is_onboarding_plugin_needle_active( $spec['needles'] ) ) {
				return true;
			}

			return false;
		}

		/**
		 * Human label for a platform key.
		 *
		 * @param string $platform Platform key.
		 * @return string
		 */
		protected function get_onboarding_platform_plugin_label( $platform ) {
			$taxonomy = $this->get_onboarding_site_taxonomy();
			foreach ( $taxonomy as $type ) {
				if ( ! empty( $type['platforms'][ $platform ] ) ) {
					return (string) $type['platforms'][ $platform ];
				}
			}
			return $platform;
		}

		/**
		 * Active/inactive status for every selectable platform plugin.
		 *
		 * @return array<string, array{label:string,active:bool}>
		 */
		protected function get_onboarding_platform_plugin_status() {
			$status   = array();
			$taxonomy = $this->get_onboarding_site_taxonomy();
			foreach ( $taxonomy as $type ) {
				if ( empty( $type['platforms'] ) || ! is_array( $type['platforms'] ) ) {
					continue;
				}
				foreach ( $type['platforms'] as $key => $label ) {
					if ( isset( $status[ $key ] ) ) {
						continue;
					}
					$detectors = $this->get_onboarding_platform_plugin_detectors();
					if ( ! empty( $detectors[ $key ]['always'] ) ) {
						continue;
					}
					$status[ $key ] = array(
						'label'  => (string) $label,
						'active' => $this->is_onboarding_platform_plugin_active( $key ),
					);
				}
			}
			return $status;
		}

		/**
		 * Add-on slug => source (core|toolkit|toolkit-pro) from the local catalog.
		 *
		 * @return array<string, string>
		 */
		protected function get_onboarding_addon_source_map() {
			static $map = null;
			if ( is_array( $map ) ) {
				return $map;
			}
			$map  = array();
			$path = ( defined( 'MYCRED_AI_ONBOARDING_MANUAL_DIR' ) ? MYCRED_AI_ONBOARDING_MANUAL_DIR : ( dirname( __DIR__ ) . '/onboarding-manual/' ) ) . 'onboarding-manual-catalog.php';
			if ( ! is_readable( $path ) ) {
				return $map;
			}
			$loaded = include $path;
			$addons = isset( $loaded['addons'] ) && is_array( $loaded['addons'] ) ? $loaded['addons'] : array();
			foreach ( $addons as $slug => $row ) {
				if ( ! is_string( $slug ) || ! is_array( $row ) || empty( $row['source'] ) ) {
					continue;
				}
				$map[ $slug ] = (string) $row['source'];
			}
			return $map;
		}

		/**
		 * Resolve catalog source for an add-on slug.
		 *
		 * @param string               $slug Add-on slug.
		 * @param array<string, mixed> $row  Payload row.
		 * @return string
		 */
		protected function get_onboarding_addon_source( $slug, $row = array() ) {
			if ( ! empty( $row['source'] ) && is_string( $row['source'] ) ) {
				$source = sanitize_key( $row['source'] );
				if ( in_array( $source, array( 'core', 'toolkit', 'toolkit-pro' ), true ) ) {
					return $source;
				}
			}
			$map = $this->get_onboarding_addon_source_map();
			if ( isset( $map[ $slug ] ) ) {
				return (string) $map[ $slug ];
			}
			if ( 0 === strpos( $slug, 'mycred-' ) ) {
				return 'toolkit';
			}
			return 'core';
		}

		/**
		 * Notes + can_apply for myCred Addons / myCred Addons Pro (and third-party plugins).
		 *
		 * @param array<string, mixed> $addon_row Sanitized add-on row.
		 * @return array<string, mixed>
		 */
		protected function annotate_onboarding_addon_availability( $addon_row ) {
			$slug   = isset( $addon_row['slug'] ) ? (string) $addon_row['slug'] : '';
			$source = $this->get_onboarding_addon_source( $slug, $addon_row );
			$addon_row['source']    = $source;
			$addon_row['can_apply'] = true;

			$toolkit_active     = function_exists( 'mycred_is_toolkit_plugin_active' ) && mycred_is_toolkit_plugin_active();
			$toolkit_installed  = function_exists( 'mycred_is_toolkit_plugin_installed' ) && mycred_is_toolkit_plugin_installed();
			$toolkit_pro_active = function_exists( 'mycred_is_toolkit_pro_plugin_active' ) && mycred_is_toolkit_pro_plugin_active();

			if ( 'toolkit-pro' === $source && ! $toolkit_pro_active ) {
				$addon_row['missing_plugin'] = array(
					'key'   => 'toolkit-pro',
					'label' => __( 'myCred Addons Pro', 'mycred' ),
					'note'  => __( 'This add-on needs myCred Addons Pro. Setup will still save it as enabled with your settings. It will appear after you install and activate myCred Addons Pro.', 'mycred' ),
				);
				return $addon_row;
			}

			if ( 'toolkit' === $source && ! $toolkit_active ) {
				if ( $toolkit_installed ) {
					$note = __( 'myCred Addons is installed but not active. If you keep this add-on selected, setup will activate myCred Addons and then enable the add-on.', 'mycred' );
				} else {
					$note = __( 'This add-on is part of myCred Addons (free, from WordPress.org). If you keep it selected, setup will install and activate myCred Addons, then enable this add-on.', 'mycred' );
				}
				$addon_row['missing_plugin'] = array(
					'key'   => 'toolkit',
					'label' => __( 'myCred Addons', 'mycred' ),
					'note'  => $note,
				);
				return $addon_row;
			}

			$missing = $this->get_addon_missing_plugin_note( $slug );
			if ( $missing ) {
				$addon_row['missing_plugin'] = $missing;
			}

			return $addon_row;
		}

		/**
		 * Missing third-party plugin details for an add-on slug.
		 *
		 * @param string $slug Add-on slug.
		 * @return array<string, mixed>|null
		 */
		protected function get_addon_missing_plugin_note( $slug ) {
			$required = $this->get_onboarding_addon_required_platforms();
			if ( empty( $required[ $slug ] ) || ! is_array( $required[ $slug ] ) ) {
				return null;
			}

			$missing_labels = array();
			$first_key      = '';
			foreach ( $required[ $slug ] as $platform ) {
				if ( $this->is_onboarding_platform_plugin_active( $platform ) ) {
					continue;
				}
				$label = $this->get_onboarding_platform_plugin_label( $platform );
				if ( '' === $label ) {
					continue;
				}
				if ( '' === $first_key ) {
					$first_key = $platform;
				}
				$missing_labels[] = $label;
			}

			$missing_labels = array_values( array_unique( $missing_labels ) );
			if ( empty( $missing_labels ) ) {
				return null;
			}

			if ( 1 === count( $missing_labels ) ) {
				$joined = $missing_labels[0];
				$note   = sprintf(
					/* translators: 1: plugin name, 2: plugin name */
					__( '%1$s is not installed. Setup will still complete, but %2$s features will not appear until you install and activate it.', 'mycred' ),
					$joined,
					$joined
				);
			} else {
				$last   = array_pop( $missing_labels );
				$joined = implode( ', ', $missing_labels ) . ' ' . __( 'and', 'mycred' ) . ' ' . $last;
				$note   = sprintf(
					/* translators: %s: plugin names */
					__( '%s are not installed. Setup will still complete, but related features will not appear until you install and activate them.', 'mycred' ),
					$joined
				);
			}

			return array(
				'key'    => $first_key,
				'label'  => $this->get_onboarding_platform_plugin_label( $first_key ),
				'note'   => $note,
			);
		}

		/**
		 * Validate onboarding taxonomy fields and return labels for the AI task.
		 *
		 * @param string $site_type Site type key.
		 * @param string $platform  Platform key.
		 * @param string $goal      Goal key.
		 * @return array<string, string>|WP_Error
		 */
		protected function validate_onboarding_recommend_fields( $site_type, $platform, $goal ) {
			$taxonomy = $this->get_onboarding_site_taxonomy();

			if ( ! isset( $taxonomy[ $site_type ] ) || ! is_array( $taxonomy[ $site_type ] ) ) {
				return new WP_Error( 'invalid_site_type', __( 'Please select a valid website type.', 'mycred' ) );
			}

			$type = $taxonomy[ $site_type ];
			if ( empty( $type['platforms'][ $platform ] ) ) {
				return new WP_Error( 'invalid_platform', __( 'Please select a valid platform.', 'mycred' ) );
			}
			if ( empty( $type['goals'][ $goal ] ) ) {
				return new WP_Error( 'invalid_goal', __( 'Please select a valid primary goal.', 'mycred' ) );
			}

			return array(
				'site_type'       => $site_type,
				'platform'        => $platform,
				'goal'            => $goal,
				'site_type_label' => (string) $type['label'],
				'platform_label'  => (string) $type['platforms'][ $platform ],
				'goal_label'      => (string) $type['goals'][ $goal ],
			);
		}

		/**
		 * Extract a JSON object from a model reply (raw or fenced).
		 *
		 * @param string $text Raw model output.
		 * @return array|null
		 */
		protected function parse_json_object_from_text( $text ) {
			$text = preg_replace( '/^\xEF\xBB\xBF/', '', trim( (string) $text ) );
			if ( '' === $text ) {
				return null;
			}

			$text = str_replace(
				array( "\xE2\x80\x9C", "\xE2\x80\x9D", "\xE2\x80\x98", "\xE2\x80\x99" ),
				array( '"', '"', "'", "'" ),
				$text
			);

			$candidates = array( $text );
			if ( preg_match( '/```(?:json)?\s*([\s\S]*?)\s*```/i', $text, $matches ) ) {
				array_unshift( $candidates, trim( $matches[1] ) );
			}

			$start = strpos( $text, '{' );
			$end   = strrpos( $text, '}' );
			if ( false !== $start && false !== $end && $end > $start ) {
				$candidates[] = substr( $text, $start, $end - $start + 1 );
			}

			foreach ( $candidates as $candidate ) {
				$decoded = $this->decode_json_object_candidate( $candidate );
				if ( is_array( $decoded ) ) {
					return $decoded;
				}
			}

			return null;
		}

		/**
		 * Decode one JSON object candidate, including trailing-comma and truncation repair.
		 *
		 * @param string $candidate JSON text.
		 * @return array|null
		 */
		protected function decode_json_object_candidate( $candidate ) {
			$candidate = trim( (string) $candidate );
			if ( '' === $candidate || '{' !== $candidate[0] ) {
				return null;
			}

			$flags = 0;
			if ( defined( 'JSON_INVALID_UTF8_IGNORE' ) ) {
				$flags |= JSON_INVALID_UTF8_IGNORE;
			}

			$attempts = array( $candidate, preg_replace( '/,\s*([}\]])/', '$1', $candidate ) );
			$closed   = $this->close_truncated_json( $attempts[1] );
			if ( is_string( $closed ) && $closed !== $attempts[1] ) {
				$attempts[] = $closed;
			}

			foreach ( $attempts as $attempt ) {
				$decoded = json_decode( $attempt, true, 512, $flags );
				if ( is_array( $decoded ) ) {
					return $decoded;
				}
			}

			return null;
		}

		/**
		 * Close truncated JSON objects/arrays and unfinished strings.
		 *
		 * @param string $json Possibly truncated JSON.
		 * @return string
		 */
		protected function close_truncated_json( $json ) {
			$json = (string) $json;
			if ( '' === $json ) {
				return $json;
			}

			$in_string = false;
			$escape    = false;
			$stack     = array();
			$len       = strlen( $json );

			for ( $i = 0; $i < $len; $i++ ) {
				$ch = $json[ $i ];
				if ( $in_string ) {
					if ( $escape ) {
						$escape = false;
						continue;
					}
					if ( '\\' === $ch ) {
						$escape = true;
						continue;
					}
					if ( '"' === $ch ) {
						$in_string = false;
					}
					continue;
				}
				if ( '"' === $ch ) {
					$in_string = true;
					continue;
				}
				if ( '{' === $ch ) {
					$stack[] = '}';
					continue;
				}
				if ( '[' === $ch ) {
					$stack[] = ']';
					continue;
				}
				if ( ( '}' === $ch || ']' === $ch ) && ! empty( $stack ) ) {
					array_pop( $stack );
				}
			}

			if ( $in_string ) {
				$json .= '"';
			}

			$json = rtrim( $json, ", \t\n\r" );
			while ( ! empty( $stack ) ) {
				$json .= array_pop( $stack );
			}

			return $json;
		}

		/**
		 * Whether decoded JSON is a usable onboarding recommendation (not a tool call).
		 *
		 * @param mixed $decoded Parsed model output.
		 * @return bool
		 */
		protected function is_usable_onboarding_payload( $decoded ) {
			if ( ! is_array( $decoded ) || isset( $decoded['__tool_call__'] ) ) {
				return false;
			}

			return isset( $decoded['addons'] )
				|| isset( $decoded['hooks'] )
				|| isset( $decoded['settings'] )
				|| isset( $decoded['point_type'] )
				|| isset( $decoded['ranks'] )
				|| isset( $decoded['badges'] )
				|| isset( $decoded['understood'] );
		}

		/**
		 * Keep recommended add-ons whose slugs exist in the catalog.
		 *
		 * @param array $payload Decoded model JSON.
		 * @param array $catalog Compact catalog.
		 * @return array{understood:string,addons:array<int,array<string,string>>}
		 */
		protected function sanitize_onboarding_priority( $value ) {
			$priority = sanitize_key( (string) $value );
			return in_array( $priority, array( 'recommended', 'optional' ), true ) ? $priority : 'optional';
		}

		/**
		 * Checkout rows that repeat a visible add-on setting stay on that add-on only.
		 *
		 * @param array<int, array<string, mixed>> $items    Checkout rows.
		 * @param array<int, array<string, mixed>> $settings Add-on settings.
		 * @return array<int, array<string, mixed>>
		 */
		protected function drop_checkout_items_duplicated_by_settings( $items, $settings ) {
			$items   = array_values( array_filter( (array) $items, function ( $item ) {
				return is_array( $item ) && ! $this->is_store_checkout_item( $item );
			} ) );
			$visible = array();
			foreach ( (array) $settings as $setting ) {
				if ( ! is_array( $setting ) ) {
					continue;
				}
				if ( 'show' !== strtolower( (string) ( $setting['ui'] ?? '' ) ) ) {
					continue;
				}
				$visible[] = $setting;
			}
			if ( empty( $visible ) ) {
				return array_values( (array) $items );
			}

			$kept = array();
			foreach ( (array) $items as $item ) {
				if ( ! is_array( $item ) || $this->checkout_item_duplicates_setting( $item, $visible ) ) {
					continue;
				}
				$kept[] = $item;
			}

			return $kept;
		}

		/**
		 * @param array<string, mixed>             $item     Checkout row.
		 * @param array<int, array<string, mixed>> $settings Visible settings.
		 * @return bool
		 */
		protected function checkout_item_duplicates_setting( $item, $settings ) {
			$item_key   = strtolower( trim( (string) ( $item['key'] ?? '' ) ) );
			$item_title = $this->bare_onboarding_setting_title( (string) ( $item['title'] ?? '' ) );
			foreach ( $settings as $setting ) {
				$setting_key = strtolower( trim( (string) ( $setting['key'] ?? '' ) ) );
				if ( '' !== $item_key && '' !== $setting_key && $item_key === $setting_key ) {
					return true;
				}
				$setting_title = $this->bare_onboarding_setting_title( (string) ( $setting['title'] ?? '' ) );
				if ( '' !== $item_title && $item_title === $setting_title ) {
					return true;
				}
			}

			return false;
		}

		/**
		 * WooCommerce spend toggles belong on the add-on, not in Checkout and payment.
		 *
		 * @param array<string, mixed> $item Checkout row.
		 * @return bool
		 */
		protected function is_store_checkout_item( $item ) {
			$key   = strtolower( trim( (string) ( $item['key'] ?? '' ) ) );
			$title = $this->bare_onboarding_setting_title( (string) ( $item['title'] ?? '' ) );
			if ( preg_match( '/^mwp_(partial_payments|coupons|my_account)(\.|$)/', $key ) ) {
				return true;
			}

			return in_array(
				$title,
				array(
					'enable partial payments',
					'enable coupons',
					'enable my account tab',
					'enable coupon generator',
				),
				true
			);
		}

		/**
		 * Compare "Enable Coupons" with "WooCommerce: Enable Coupons".
		 *
		 * @param string $title Setting title.
		 * @return string
		 */
		protected function bare_onboarding_setting_title( $title ) {
			$title = strtolower( trim( preg_replace( '/\s+/', ' ', (string) $title ) ) );
			$bare  = preg_replace( '/^[^:]{1,40}:\s*/', '', $title );

			return trim( is_string( $bare ) ? $bare : $title );
		}

		/**
		 * Prefix a generic field label with its settings group (e.g. Payments: Title).
		 *
		 * @param string $title Field label.
		 * @param string $group Parent group/menu title.
		 * @return string
		 */
		protected function format_onboarding_setting_title( $title, $group ) {
			$title = trim( (string) $title );
			$group = trim( (string) $group );
			if ( '' === $group || '' === $title ) {
				return '' !== $title ? $title : $group;
			}
			if ( false !== stripos( $title, $group ) ) {
				return $title;
			}

			return $group . ': ' . $title;
		}

		/**
		 * Sanitize starter ranks from a recommendation payload.
		 *
		 * @param mixed $rows Raw ranks.
		 * @return array<int, array<string, mixed>>
		 */
		protected function sanitize_onboarding_ranks( $rows ) {
			$out  = array();
			$seen = array();
			if ( ! is_array( $rows ) ) {
				return $out;
			}
			foreach ( $rows as $row ) {
				if ( ! is_array( $row ) ) {
					continue;
				}
				$title = isset( $row['title'] ) ? sanitize_text_field( (string) $row['title'] ) : '';
				if ( '' === $title ) {
					continue;
				}
				$key = strtolower( $title );
				if ( isset( $seen[ $key ] ) ) {
					continue;
				}
				$seen[ $key ] = true;
				$minimum      = isset( $row['minimum'] ) ? (float) $row['minimum'] : 0;
				$maximum      = isset( $row['maximum'] ) ? (float) $row['maximum'] : 0;
				if ( $maximum < $minimum ) {
					$swap    = $minimum;
					$minimum = $maximum;
					$maximum = $swap;
				}
				$out[] = array(
					'title'       => $title,
					'minimum'     => $minimum,
					'maximum'     => $maximum,
					'description' => isset( $row['description'] ) ? sanitize_text_field( (string) $row['description'] ) : '',
				);
			}
			return $out;
		}

		/**
		 * Sanitize starter badges from a recommendation payload.
		 *
		 * @param mixed $rows Raw badges.
		 * @return array<int, array<string, mixed>>
		 */
		protected function sanitize_onboarding_badges( $rows ) {
			$out  = array();
			$seen = array();
			if ( ! is_array( $rows ) ) {
				return $out;
			}
			foreach ( $rows as $row ) {
				if ( ! is_array( $row ) ) {
					continue;
				}
				$title = isset( $row['title'] ) ? sanitize_text_field( (string) $row['title'] ) : '';
				if ( '' === $title ) {
					continue;
				}
				$key = strtolower( $title );
				if ( isset( $seen[ $key ] ) ) {
					continue;
				}
				$seen[ $key ] = true;
				$manual       = ! empty( $row['manual'] );
				$reference    = isset( $row['reference'] ) ? sanitize_key( (string) $row['reference'] ) : '';
				$by           = isset( $row['by'] ) ? sanitize_key( (string) $row['by'] ) : 'count';
				if ( ! in_array( $by, array( 'count', 'sum' ), true ) ) {
					$by = 'count';
				}
				$out[] = array(
					'title'       => $title,
					'description' => isset( $row['description'] ) ? sanitize_text_field( (string) $row['description'] ) : '',
					'manual'      => $manual,
					'reference'   => $manual ? '' : $reference,
					'amount'      => isset( $row['amount'] ) ? sanitize_text_field( (string) $row['amount'] ) : '1',
					'by'          => $by,
				);
			}
			return $out;
		}

		/**
		 * Sanitize the full onboarding recommendation JSON.
		 *
		 * @param array $payload Decoded model JSON.
		 * @param array $addons_catalog Compact add-ons catalog.
		 * @param array $hooks_catalog Compact hooks catalog.
		 * @return array
		 */
		protected function sanitize_onboarding_recommend_payload( $payload, $addons_catalog, $hooks_catalog ) {
			$understood = '';
			if ( isset( $payload['understood'] ) && is_string( $payload['understood'] ) ) {
				$understood = sanitize_text_field( $payload['understood'] );
			}

			$point_in = isset( $payload['point_type'] ) && is_array( $payload['point_type'] ) ? $payload['point_type'] : array();
			$pt_name  = isset( $point_in['name'] ) ? sanitize_text_field( (string) $point_in['name'] ) : '';
			$pt_key   = isset( $point_in['key'] ) ? sanitize_key( str_replace( '-', '_', (string) $point_in['key'] ) ) : '';
			$pt_desc  = isset( $point_in['description'] ) ? sanitize_text_field( (string) $point_in['description'] ) : '';
			if ( '' === $pt_key && '' !== $pt_name ) {
				$pt_key = sanitize_key( str_replace( '-', '_', strtolower( $pt_name ) ) );
			}

			$hooks_intro    = isset( $payload['hooks_intro'] ) ? sanitize_text_field( (string) $payload['hooks_intro'] ) : '';
			$settings_intro = isset( $payload['settings_intro'] ) ? sanitize_text_field( (string) $payload['settings_intro'] ) : '';
			$why            = isset( $payload['why'] ) ? sanitize_textarea_field( (string) $payload['why'] ) : '';

			$overview = array();
			if ( isset( $payload['overview'] ) && is_array( $payload['overview'] ) ) {
				foreach ( $payload['overview'] as $item ) {
					if ( ! is_string( $item ) ) {
						continue;
					}
					$text = sanitize_text_field( $item );
					if ( '' !== $text ) {
						$overview[] = $text;
					}
				}
			}

			$hooks = array();
			$seen  = array();
			$rows  = isset( $payload['hooks'] ) && is_array( $payload['hooks'] ) ? $payload['hooks'] : array();
			foreach ( $rows as $row ) {
				if ( ! is_array( $row ) ) {
					continue;
				}
				$raw_id = '';
				if ( ! empty( $row['hook_id'] ) && is_string( $row['hook_id'] ) ) {
					$raw_id = $row['hook_id'];
				} elseif ( ! empty( $row['id'] ) && is_string( $row['id'] ) ) {
					$raw_id = $row['id'];
				}
				if ( '' === $raw_id ) {
					continue;
				}
				$hook_id = sanitize_key( $raw_id );
				if ( '' === $hook_id || isset( $seen[ $hook_id ] ) ) {
					continue;
				}
				if ( ! empty( $hooks_catalog ) && ! isset( $hooks_catalog[ $hook_id ] ) ) {
					continue;
				}
				$priority = $this->sanitize_onboarding_priority( isset( $row['priority'] ) ? $row['priority'] : 'recommended' );
				$seen[ $hook_id ] = true;
				$title            = isset( $hooks_catalog[ $hook_id ]['label'] ) ? $hooks_catalog[ $hook_id ]['label'] : '';
				$desc             = isset( $hooks_catalog[ $hook_id ]['description'] ) ? $hooks_catalog[ $hook_id ]['description'] : '';
				if ( '' === $title ) {
					$title = isset( $row['title'] ) ? sanitize_text_field( (string) $row['title'] ) : $hook_id;
				}
				if ( '' === $desc && isset( $row['description'] ) ) {
					$desc = sanitize_text_field( (string) $row['description'] );
				}
				$addon = isset( $row['addon'] ) ? sanitize_text_field( (string) $row['addon'] ) : '';
				if ( '' === $addon && isset( $hooks_catalog[ $hook_id ]['addon'] ) ) {
					$addon = sanitize_text_field( (string) $hooks_catalog[ $hook_id ]['addon'] );
				}
				$hooks[] = array(
					'hook_id'      => $hook_id,
					'title'        => $title,
					'description'  => $desc,
					'reason'       => isset( $row['reason'] ) ? sanitize_text_field( (string) $row['reason'] ) : '',
					'creds'        => isset( $row['creds'] ) ? sanitize_text_field( (string) $row['creds'] ) : '',
					'priority'     => $priority,
					'checked'      => 'recommended' === $priority,
					'addon'        => $addon,
					'requires_pro' => $this->onboarding_item_requires_pro( $addon ),
				);
			}

			usort(
				$hooks,
				function ( $a, $b ) {
					$a_rec = ( 'recommended' === $a['priority'] ) ? 0 : 1;
					$b_rec = ( 'recommended' === $b['priority'] ) ? 0 : 1;
					return $a_rec - $b_rec;
				}
			);

			$checkout_in = isset( $payload['checkout'] ) && is_array( $payload['checkout'] ) ? $payload['checkout'] : array();
			$checkout_rows = array();
			if ( isset( $checkout_in[0] ) ) {
				$checkout_rows = $checkout_in;
				$checkout_in   = array();
			} elseif ( isset( $checkout_in['items'] ) && is_array( $checkout_in['items'] ) ) {
				$checkout_rows = $checkout_in['items'];
			}

			$checkout_items = array();
			$seen_c         = array();
			$force_hide     = array_key_exists( 'relevant', $checkout_in ) && empty( $checkout_in['relevant'] );
			if ( ! $force_hide ) {
				foreach ( $checkout_rows as $row ) {
					if ( ! is_array( $row ) ) {
						continue;
					}
					$title = isset( $row['title'] ) ? sanitize_text_field( (string) $row['title'] ) : '';
					if ( '' === $title ) {
						continue;
					}
					$key = strtolower( $title );
					if ( isset( $seen_c[ $key ] ) ) {
						continue;
					}
					$seen_c[ $key ] = true;
					$priority       = $this->sanitize_onboarding_priority( isset( $row['priority'] ) ? $row['priority'] : 'recommended' );
					$type           = isset( $row['type'] ) ? sanitize_key( (string) $row['type'] ) : 'text';
					if ( ! in_array( $type, array( 'text', 'number', 'select', 'radio', 'checkbox', 'textarea', 'image' ), true ) ) {
						$type = 'text';
					}
					$options = array();
					if ( isset( $row['options'] ) && is_array( $row['options'] ) ) {
						foreach ( $row['options'] as $opt_key => $opt_label ) {
							if ( ! is_scalar( $opt_label ) ) {
								continue;
							}
							$options[ sanitize_text_field( (string) $opt_key ) ] = sanitize_text_field( (string) $opt_label );
						}
					}
					$checkout_addon = isset( $row['addon'] ) ? sanitize_text_field( (string) $row['addon'] ) : '';
					$checkout_items[] = array(
						'id'           => isset( $row['id'] ) ? sanitize_key( (string) $row['id'] ) : '',
						'addon'        => $checkout_addon,
						'key'          => isset( $row['key'] ) ? sanitize_text_field( (string) $row['key'] ) : '',
						'title'        => $title,
						'description'  => isset( $row['description'] ) ? sanitize_text_field( (string) $row['description'] ) : '',
						'reason'       => isset( $row['reason'] ) ? sanitize_text_field( (string) $row['reason'] ) : '',
						'value'        => isset( $row['value'] ) ? sanitize_text_field( (string) $row['value'] ) : '',
						'type'         => $type,
						'options'      => $options,
						'priority'     => $priority,
						'checked'      => 'recommended' === $priority,
						'requires_pro' => $this->onboarding_item_requires_pro( $checkout_addon ),
					);
				}
			}

			usort(
				$checkout_items,
				function ( $a, $b ) {
					$a_rec = ( 'recommended' === $a['priority'] ) ? 0 : 1;
					$b_rec = ( 'recommended' === $b['priority'] ) ? 0 : 1;
					return $a_rec - $b_rec;
				}
			);

			$checkout = array(
				'relevant' => ! empty( $checkout_items ),
				'intro'    => isset( $checkout_in['intro'] ) ? sanitize_text_field( (string) $checkout_in['intro'] ) : '',
				'example'  => isset( $checkout_in['example'] ) ? sanitize_textarea_field( (string) $checkout_in['example'] ) : '',
				'items'    => $checkout_items,
			);

			$settings = array();
			$seen_s   = array();
			$rows_s   = isset( $payload['settings'] ) && is_array( $payload['settings'] ) ? $payload['settings'] : array();
			foreach ( $rows_s as $row ) {
				if ( ! is_array( $row ) ) {
					continue;
				}
				$title = isset( $row['title'] ) ? sanitize_text_field( (string) $row['title'] ) : '';
				if ( '' === $title && isset( $row['label'] ) ) {
					$title = sanitize_text_field( (string) $row['label'] );
				}
				$key   = isset( $row['key'] ) ? sanitize_text_field( (string) $row['key'] ) : '';
				$addon = isset( $row['addon'] ) ? sanitize_text_field( (string) $row['addon'] ) : '';
				if ( '' === $title && '' === $key ) {
					continue;
				}
				$dup = strtolower( ( '' !== $addon && '' !== $key ) ? $addon . '|' . $key : $title );
				if ( isset( $seen_s[ $dup ] ) ) {
					continue;
				}
				$seen_s[ $dup ] = true;
				$priority       = $this->sanitize_onboarding_priority( isset( $row['priority'] ) ? $row['priority'] : 'recommended' );
				$type           = isset( $row['type'] ) ? sanitize_key( (string) $row['type'] ) : 'text';
				if ( ! in_array( $type, array( 'text', 'number', 'select', 'radio', 'checkbox', 'textarea', 'image' ), true ) ) {
					$type = 'text';
				}
				$raw_value = isset( $row['value'] ) ? $row['value'] : '';
				if ( is_array( $raw_value ) ) {
					$setting_value = implode(
						',',
						array_map(
							function ( $part ) {
								return sanitize_text_field( (string) $part );
							},
							$raw_value
						)
					);
				} else {
					$setting_value = sanitize_text_field( (string) $raw_value );
				}
				$is_ref_field = ( false !== strpos( $key, 'exp_references' ) );
				$options = array();
				if ( isset( $row['options'] ) && is_array( $row['options'] ) ) {
					foreach ( $row['options'] as $opt_key => $opt_label ) {
						if ( ! is_scalar( $opt_label ) ) {
							continue;
						}
						$options[ sanitize_text_field( (string) $opt_key ) ] = sanitize_text_field( (string) $opt_label );
					}
				}
				$depends_values = array();
				if ( isset( $row['depends_values'] ) && is_array( $row['depends_values'] ) ) {
					foreach ( $row['depends_values'] as $dep_val ) {
						if ( is_scalar( $dep_val ) && (string) $dep_val !== '' ) {
							$depends_values[] = sanitize_text_field( (string) $dep_val );
						}
					}
				}
				$group          = isset( $row['group'] ) ? sanitize_text_field( (string) $row['group'] ) : '';
				$ui             = isset( $row['ui'] ) ? sanitize_key( (string) $row['ui'] ) : '';
				$settings[]     = array(
					'addon'           => $addon,
					'key'             => $key,
					'title'           => $this->format_onboarding_setting_title( '' !== $title ? $title : $key, $group ),
					'description'     => isset( $row['description'] ) ? sanitize_text_field( (string) $row['description'] ) : '',
					'group'           => $group,
					'reason'          => isset( $row['reason'] ) ? sanitize_text_field( (string) $row['reason'] ) : '',
					'value'           => $is_ref_field ? implode( ',', $this->normalize_onboarding_log_references( $raw_value ) ) : $setting_value,
					'type'            => $type,
					'options'         => $options,
					'depends_on'      => isset( $row['depends_on'] ) ? sanitize_text_field( (string) $row['depends_on'] ) : '',
					'depends_values'  => $depends_values,
					'multiple'        => $is_ref_field || ! empty( $row['multiple'] ),
					'ui'              => $ui,
					'priority'        => $priority,
					'checked'         => 'recommended' === $priority,
					'requires_pro'    => $this->onboarding_item_requires_pro( $addon ),
				);
			}

			usort(
				$settings,
				function ( $a, $b ) {
					$a_rec = ( 'recommended' === $a['priority'] ) ? 0 : 1;
					$b_rec = ( 'recommended' === $b['priority'] ) ? 0 : 1;
					return $a_rec - $b_rec;
				}
			);

			$checkout['items']    = $this->drop_checkout_items_duplicated_by_settings( $checkout['items'], $settings );
			$checkout['relevant'] = ! empty( $checkout['items'] );

			$addons = array();
			$seen_a = array();
			$rows_a = isset( $payload['addons'] ) && is_array( $payload['addons'] ) ? $payload['addons'] : array();
			foreach ( $rows_a as $row ) {
				if ( ! is_array( $row ) || empty( $row['slug'] ) || ! is_string( $row['slug'] ) ) {
					continue;
				}
				$raw_slug = strtolower( str_replace( '_', '-', sanitize_text_field( $row['slug'] ) ) );
				$slug     = $this->fold_onboarding_child_addon_slug( $raw_slug );
				if ( '' === $slug || isset( $seen_a[ $slug ] ) ) {
					if ( '' !== $slug && isset( $seen_a[ $slug ] ) && 'recommended' === $this->sanitize_onboarding_priority( isset( $row['priority'] ) ? $row['priority'] : 'optional' ) ) {
						foreach ( $addons as $addon_i => $existing ) {
							if ( isset( $existing['slug'] ) && $existing['slug'] === $slug ) {
								$addons[ $addon_i ]['priority'] = 'recommended';
								break;
							}
						}
					}
					continue;
				}
				if ( ! empty( $addons_catalog ) && ! isset( $addons_catalog[ $slug ] ) ) {
					continue;
				}
				$priority = $this->sanitize_onboarding_priority( isset( $row['priority'] ) ? $row['priority'] : 'optional' );
				$seen_a[ $slug ] = true;
				$label           = isset( $addons_catalog[ $slug ]['label'] ) ? $addons_catalog[ $slug ]['label'] : '';
				$desc            = isset( $addons_catalog[ $slug ]['description'] ) ? $addons_catalog[ $slug ]['description'] : '';
				$source          = isset( $addons_catalog[ $slug ]['source'] ) ? $addons_catalog[ $slug ]['source'] : '';
				if ( '' === $label ) {
					$label = isset( $row['label'] ) ? sanitize_text_field( (string) $row['label'] ) : $slug;
				}
				if ( '' === $desc && isset( $row['description'] ) ) {
					$desc = sanitize_text_field( (string) $row['description'] );
				}
				if ( '' === $source && isset( $row['source'] ) ) {
					$source = sanitize_text_field( (string) $row['source'] );
				}
				if ( 'mycred-woocommerce-plus' === $raw_slug ) {
					$label  = isset( $addons_catalog['woocommerce']['label'] ) ? $addons_catalog['woocommerce']['label'] : __( 'WooCommerce', 'mycred' );
					$desc   = isset( $addons_catalog['woocommerce']['description'] ) ? $addons_catalog['woocommerce']['description'] : $desc;
					$source = isset( $addons_catalog['woocommerce']['source'] ) ? $addons_catalog['woocommerce']['source'] : 'core';
				}
				$addon_row = array(
					'slug'        => $slug,
					'label'       => $label,
					'description' => $desc,
					'purpose'     => isset( $row['purpose'] ) ? sanitize_textarea_field( (string) $row['purpose'] ) : $desc,
					'achieves'    => array(),
					'source'      => $source,
					'reason'      => isset( $row['reason'] ) ? sanitize_text_field( (string) $row['reason'] ) : '',
					'priority'    => $priority,
					'can_apply'   => true,
				);
				if ( isset( $row['achieves'] ) && is_array( $row['achieves'] ) ) {
					foreach ( $row['achieves'] as $line ) {
						if ( ! is_scalar( $line ) ) {
							continue;
						}
						$line = sanitize_text_field( (string) $line );
						if ( '' !== $line ) {
							$addon_row['achieves'][] = $line;
						}
					}
				}
				$addon_row = $this->annotate_onboarding_addon_availability( $addon_row );
				$addons[]  = $addon_row;
			}

			usort(
				$addons,
				function ( $a, $b ) {
					$a_rec = ( 'recommended' === $a['priority'] ) ? 0 : 1;
					$b_rec = ( 'recommended' === $b['priority'] ) ? 0 : 1;
					return $a_rec - $b_rec;
				}
			);

			$ranks  = $this->sanitize_onboarding_ranks( isset( $payload['ranks'] ) ? $payload['ranks'] : array() );
			$badges = $this->sanitize_onboarding_badges( isset( $payload['badges'] ) ? $payload['badges'] : array() );
			foreach ( $addons as $i => $addon ) {
				if ( empty( $addon['slug'] ) ) {
					continue;
				}
				if ( 'ranks' === $addon['slug'] ) {
					$nested = array();
					if ( ! empty( $payload['addons'] ) && is_array( $payload['addons'] ) ) {
						foreach ( $payload['addons'] as $src ) {
							if ( is_array( $src ) && isset( $src['slug'] ) && 'ranks' === $src['slug'] && ! empty( $src['ranks'] ) ) {
								$nested = $this->sanitize_onboarding_ranks( $src['ranks'] );
								break;
							}
						}
					}
					$addons[ $i ]['ranks'] = ! empty( $nested ) ? $nested : $ranks;
				}
				if ( 'badges' === $addon['slug'] ) {
					$nested = array();
					if ( ! empty( $payload['addons'] ) && is_array( $payload['addons'] ) ) {
						foreach ( $payload['addons'] as $src ) {
							if ( is_array( $src ) && isset( $src['slug'] ) && 'badges' === $src['slug'] && ! empty( $src['badges'] ) ) {
								$nested = $this->sanitize_onboarding_badges( $src['badges'] );
								break;
							}
						}
					}
					$addons[ $i ]['badges'] = ! empty( $nested ) ? $nested : $badges;
				}
			}

			return array(
				'understood'     => $understood,
				'point_type'     => array(
					'name'        => $pt_name,
					'key'         => $pt_key,
					'description' => $pt_desc,
				),
				'hooks_intro'    => $hooks_intro,
				'hooks'          => $hooks,
				'settings_intro' => $settings_intro,
				'settings'       => $settings,
				'checkout'       => $checkout,
				'why'            => $why,
				'overview'       => $overview,
				'addons'         => $addons,
			);
		}

		/**
		 * Child add-ons that now live inside a parent add-on (unified UI).
		 *
		 * WooCommerce Plus settings/hooks are shown on the WooCommerce add-on when
		 * myCred Addons Pro is active, so onboarding must not list Plus separately.
		 *
		 * @param string $slug Add-on slug.
		 * @return string Parent slug, or the original slug.
		 */
		/**
		 * BuddyBoss add-on stays on BuddyBoss; BuddyPress add-ons stay on BuddyPress.
		 *
		 * @param array  $payload  Sanitized recommendation.
		 * @param string $platform Selected platform key.
		 * @return array
		 */
		protected function filter_onboarding_payload_for_platform( $payload, $platform ) {
			$platform  = sanitize_key( (string) $platform );
			$exclusive = array(
				'buddyboss'  => array( 'mycred-buddyboss' ),
				'buddypress' => array( 'mycred-bp-charges', 'mycred-bp-group-leaderboards', 'mycred-for-buddypress-compliments' ),
			);
			$foreign = array();
			foreach ( $exclusive as $key => $slugs ) {
				if ( $key === $platform ) {
					continue;
				}
				foreach ( $slugs as $slug ) {
					$foreign[ $slug ] = true;
				}
			}
			if ( empty( $foreign ) ) {
				return is_array( $payload ) ? $payload : array();
			}

			$payload = is_array( $payload ) ? $payload : array();
			if ( ! empty( $payload['addons'] ) && is_array( $payload['addons'] ) ) {
				$kept = array();
				foreach ( $payload['addons'] as $addon ) {
					$slug = isset( $addon['slug'] ) ? strtolower( (string) $addon['slug'] ) : '';
					if ( '' === $slug || isset( $foreign[ $slug ] ) ) {
						continue;
					}
					$kept[] = $addon;
				}
				$payload['addons'] = $kept;
			}
			if ( ! empty( $payload['hooks'] ) && is_array( $payload['hooks'] ) ) {
				$kept = array();
				foreach ( $payload['hooks'] as $hook ) {
					if ( ! is_array( $hook ) ) {
						continue;
					}
					$addon = isset( $hook['addon'] ) ? strtolower( (string) $hook['addon'] ) : '';
					$id    = isset( $hook['hook_id'] ) ? strtolower( (string) $hook['hook_id'] ) : '';
					if ( '' !== $addon && isset( $foreign[ $addon ] ) ) {
						continue;
					}
					if ( isset( $foreign['mycred-buddyboss'] ) && 0 === strpos( $id, 'completing_buddyboss_' ) ) {
						continue;
					}
					$kept[] = $hook;
				}
				$payload['hooks'] = $kept;
			}
			if ( ! empty( $payload['settings'] ) && is_array( $payload['settings'] ) ) {
				$kept = array();
				foreach ( $payload['settings'] as $row ) {
					if ( ! is_array( $row ) ) {
						continue;
					}
					$addon = isset( $row['addon'] ) ? strtolower( (string) $row['addon'] ) : '';
					if ( '' !== $addon && isset( $foreign[ $addon ] ) ) {
						continue;
					}
					$kept[] = $row;
				}
				$payload['settings'] = $kept;
			}

			return $payload;
		}

		protected function fold_onboarding_child_addon_slug( $slug ) {
			$slug = strtolower( str_replace( '_', '-', (string) $slug ) );
			if ( 'mycred-woocommerce-plus' === $slug ) {
				return 'woocommerce';
			}
			return $slug;
		}

		/**
		 * Whether a nested hook/setting comes from WooCommerce Plus and needs Pro.
		 *
		 * @param string $addon Original add-on slug.
		 * @return bool
		 */
		protected function onboarding_item_requires_pro( $addon ) {
			$slug = strtolower( str_replace( '_', '-', (string) $addon ) );
			if ( 'mycred-woocommerce-plus' !== $slug ) {
				return false;
			}
			return ! ( function_exists( 'mycred_is_toolkit_pro_plugin_active' ) && mycred_is_toolkit_pro_plugin_active() );
		}

		/**
		 * Keep the extra onboarding prompt intact (sanitize_textarea_field can empty some text).
		 *
		 * @param mixed $raw Raw POST prompt.
		 * @return string
		 */
		protected function sanitize_onboarding_extra_prompt( $raw ) {
			$raw = is_string( $raw ) ? $raw : '';
			$raw = wp_check_invalid_utf8( $raw, true );
			$clean = sanitize_textarea_field( $raw );
			if ( '' === $clean && '' !== trim( $raw ) ) {
				$clean = trim( wp_strip_all_tags( $raw ) );
			}
			if ( function_exists( 'mb_substr' ) ) {
				return mb_substr( $clean, 0, 1000 );
			}

			return substr( $clean, 0, 1000 );
		}

		/**
		 * Ask middleware for an onboarding recommendation.
		 *
		 * Plugin sends only website type, platform, goal, and optional extra prompt.
		 *
		 * @param array  $fields Validated taxonomy fields.
		 * @param string $prompt Optional extra admin prompt.
		 * @return array|WP_Error
		 */
		protected function request_onboarding_recommendation( $fields, $prompt = '' ) {
			if ( ! class_exists( 'myCRED_AI_Middleware_Client' ) ) {
				$friendly = $this->onboarding_ai_unavailable_error();
				return new WP_Error( 'no_middleware', $friendly['message'] );
			}

			$result = myCRED_AI_Middleware_Client::process_onboarding(
				$fields['site_type'],
				$fields['platform'],
				$fields['goal'],
				$prompt
			);
			if ( is_wp_error( $result ) ) {
				return $result;
			}

			if ( isset( $result['recommendation'] ) && is_array( $result['recommendation'] ) ) {
				$decoded = $result['recommendation'];
			} else {
				$decoded = $this->parse_json_object_from_text( isset( $result['content'] ) ? (string) $result['content'] : '' );
				if ( ! $this->is_usable_onboarding_payload( $decoded ) ) {
					$friendly = $this->onboarding_ai_unavailable_error();
					return new WP_Error( 'parse_fail', $friendly['message'] );
				}
			}

			if ( ! empty( $result['quota'] ) && is_array( $result['quota'] ) ) {
				$decoded['quota'] = $result['quota'];
			}

			return $decoded;
		}

		/**
		 * AJAX: hardcoded Manual Setup for the selected site type, platform, and goal.
		 *
		 * @return void
		 */
		public function handle_onboarding_manual_ajax() {
			check_ajax_referer( 'mycred_ai_onboarding_manual', 'nonce' );

			if ( ! $this->permission_callback( null ) ) {
				wp_send_json_error( array( 'message' => __( 'Forbidden: insufficient permissions.', 'mycred' ) ), 403 );
			}

			$site_type = isset( $_POST['site_type'] ) ? sanitize_key( wp_unslash( $_POST['site_type'] ) ) : '';
			$platform  = isset( $_POST['platform'] ) ? sanitize_key( wp_unslash( $_POST['platform'] ) ) : '';
			$goal      = isset( $_POST['goal'] ) ? sanitize_key( wp_unslash( $_POST['goal'] ) ) : '';

			$fields = $this->validate_onboarding_recommend_fields( $site_type, $platform, $goal );
			if ( is_wp_error( $fields ) ) {
				wp_send_json_error( array( 'message' => $fields->get_error_message() ) );
			}

			$builder = new myCRED_Onboarding_Manual();
			$decoded = $builder->make( $fields );
			$catalogs = $builder->catalogs_for_sanitize();

			if ( ! $this->is_usable_onboarding_payload( $decoded ) ) {
				wp_send_json_error( array( 'message' => __( 'Could not build the Manual Setup recommendation. Please try again.', 'mycred' ) ) );
			}

			$payload = $this->sanitize_onboarding_recommend_payload( $decoded, $catalogs['addons'], $catalogs['hooks'] );
			$payload = $this->attach_onboarding_ranks_badges( $payload, $fields['site_type'] );
			wp_send_json_success( $payload );
		}

		/**
		 * AJAX: generate onboarding add-on recommendations from the catalog.
		 *
		 * @return void
		 */
		public function handle_onboarding_recommend_ajax() {
			check_ajax_referer( 'mycred_ai_onboarding_recommend', 'nonce' );

			try {
				if ( ! $this->permission_callback( null ) ) {
					wp_send_json_error( array( 'message' => __( 'Forbidden: insufficient permissions.', 'mycred' ) ), 403 );
				}

				if ( function_exists( 'set_time_limit' ) ) {
					set_time_limit( 300 );
				}

				$site_type = isset( $_POST['site_type'] ) ? sanitize_key( wp_unslash( $_POST['site_type'] ) ) : '';
				$platform  = isset( $_POST['platform'] ) ? sanitize_key( wp_unslash( $_POST['platform'] ) ) : '';
				$goal      = isset( $_POST['goal'] ) ? sanitize_key( wp_unslash( $_POST['goal'] ) ) : '';
				$prompt = $this->sanitize_onboarding_extra_prompt(
					isset( $_POST['prompt'] ) ? wp_unslash( $_POST['prompt'] ) : ''
				);

				$fields = $this->validate_onboarding_recommend_fields( $site_type, $platform, $goal );
				if ( is_wp_error( $fields ) ) {
					wp_send_json_error( array( 'message' => $fields->get_error_message() ) );
				}

				$decoded = $this->request_onboarding_recommendation( $fields, $prompt );
				if ( is_wp_error( $decoded ) ) {
					$friendly = $this->format_ai_error_for_user( $decoded );
					$error    = array(
						'message' => $friendly['message'],
						'is_html' => ! empty( $friendly['is_html'] ),
					);
					$quota    = class_exists( 'myCRED_AI_Middleware_Client' )
						? myCRED_AI_Middleware_Client::quota_from_error( $decoded )
						: null;
					if ( is_array( $quota ) ) {
						$error['quota'] = $quota;
					}
					wp_send_json_error( $error );
				}

				if ( ! $this->is_usable_onboarding_payload( $decoded ) ) {
					$friendly = $this->onboarding_ai_unavailable_error();
					wp_send_json_error(
						array(
							'message' => $friendly['message'],
							'is_html' => true,
						)
					);
				}

				$payload = $this->sanitize_onboarding_recommend_payload( $decoded, array(), array() );
				$payload = $this->filter_onboarding_payload_for_platform( $payload, $platform );
				$quota   = class_exists( 'myCRED_AI_Middleware_Client' )
					? myCRED_AI_Middleware_Client::sanitize_quota( isset( $decoded['quota'] ) ? $decoded['quota'] : null )
					: null;
				if ( is_array( $quota ) ) {
					$payload['quota'] = $quota;
				}
				wp_send_json_success( $payload );
			} catch ( \Throwable $e ) {
				if ( defined( 'WP_DEBUG_LOG' ) && WP_DEBUG_LOG ) {
					error_log( 'mycred onboarding recommend exception: ' . $e->getMessage() );
				}
				$friendly = $this->onboarding_ai_unavailable_error();
				wp_send_json_error(
					array(
						'message' => $friendly['message'],
						'is_html' => true,
					)
				);
			}
		}

		/**
		 * Render the onboarding wizard (UI only).
		 *
		 * @return void
		 */
		public function onboarding_page() {
			$view_path = plugin_dir_path( __FILE__ ) . 'views/admin-onboarding-page.php';
			if ( file_exists( $view_path ) ) {
				include $view_path;
				return;
			}

			echo '<div class="notice notice-error"><p>' . esc_html__( 'Onboarding view file is missing.', 'mycred' ) . '</p></div>';
		}

	}

	myCRED_AI_Onboarding::instance();
}
