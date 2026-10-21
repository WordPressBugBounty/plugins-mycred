<?php
/**
 * myCred AI Assistant admin menu (always visible under myCred).
 *
 * Opens the chat when WordPress AI Core or myCred middleware is available;
 * otherwise shows an in-page notice.
 *
 * @package myCred
 * @since 2.9.6
 */

if ( ! defined( 'myCRED_VERSION' ) ) {
	exit;
}

if ( ! defined( 'MYCRED_AI_ASSISTANT_PAGE' ) ) {
	define( 'MYCRED_AI_ASSISTANT_PAGE', 'mycred-ai-assistant' );
}

if ( ! defined( 'MYCRED_AI_ASSISTANT_ADDON_SLUG' ) ) {
	define( 'MYCRED_AI_ASSISTANT_ADDON_SLUG', 'ai-assistant' );
}

if ( ! defined( 'MYCRED_AI_ASSISTANT_BLOG_URL' ) ) {
	define( 'MYCRED_AI_ASSISTANT_BLOG_URL', 'https://codex.mycred.me/docs/toolkit/mycred-ai-assistant' );
}

if ( ! function_exists( 'mycred_ai_assistant_can_open' ) ) :
	/**
	 * Whether the AI Assistant chat may load.
	 *
	 * @return bool
	 */
	function mycred_ai_assistant_can_open() {
		if ( ! class_exists( 'myCRED_AI_Admin' ) ) {
			return false;
		}

		return function_exists( 'wp_supports_ai' ) && wp_supports_ai();
	}
endif;

if ( ! function_exists( 'mycred_ai_assistant_menu_badge_html' ) ) :
	/**
	 * Sidebar menu "New" pill HTML.
	 *
	 * @return string
	 */
	function mycred_ai_assistant_menu_badge_html() {
		return ' <span class="mycred-ai-menu-new" style="display:inline-block;margin-left:6px;padding:2px 8px;border-radius:10px;background:#3b82f6;color:#fff;font-size:10px;font-weight:600;line-height:1.4;vertical-align:middle;">'
			. esc_html__( 'New', 'mycred' )
			. '</span>';
	}
endif;

if ( ! class_exists( 'myCRED_AI_Assistant_Menu' ) ) :

	class myCRED_AI_Assistant_Menu {

		/**
		 * @var myCRED_AI_Assistant_Menu|null
		 */
		protected static $_instance = null;

		/**
		 * @return myCRED_AI_Assistant_Menu
		 */
		public static function instance() {
			if ( is_null( self::$_instance ) ) {
				self::$_instance = new self();
			}
			return self::$_instance;
		}

		public function __construct() {
			add_action( 'mycred_add_menu', array( $this, 'register_menu' ), 0 );
		}

		/**
		 * Register AI Assistant under the myCred main menu.
		 */
		public function register_menu() {

			if ( mycred_override_settings() && ! mycred_is_main_site() ) {
				return;
			}

			$mycred = mycred();
			if ( ! is_object( $mycred ) ) {
				return;
			}

			$page_title = __( 'AI Assistant', 'mycred' );
			$menu_label = $page_title . mycred_ai_assistant_menu_badge_html();

			mycred_add_main_submenu(
				$page_title,
				$menu_label,
				$mycred->get_point_admin_capability(),
				MYCRED_AI_ASSISTANT_PAGE,
				array( $this, 'render_admin_page' ),
				0
			);
		}

		/**
		 * Render chat UI or an in-page notice when AI is unavailable.
		 */
		public function render_admin_page() {

			if ( mycred_ai_assistant_can_open() ) {
				myCRED_AI_Admin::instance()->admin_page();
				return;
			}

			$this->render_unavailable_notice();
		}

		/**
		 * Show setup guidance when WordPress AI Core is not available.
		 */
		private function render_unavailable_notice() {
			$docs_url = esc_url( MYCRED_AI_ASSISTANT_BLOG_URL );
			?>
			<div class="wrap">
				<h1><?php echo esc_html__( 'AI Assistant', 'mycred' ); ?></h1>
				<div class="notice notice-warning">
					<p>
						<?php
						echo wp_kses_post(
							sprintf(
								/* translators: %s: documentation URL */
								__( '<strong>WordPress AI Core is not available on this site.</strong> The AI Assistant requires WordPress 7.0+ with AI support enabled (<code>wp_supports_ai()</code>). <a href="%s" target="_blank" rel="noopener noreferrer">Read the setup guide</a> to learn how to enable it.', 'mycred' ),
								$docs_url
							)
						);
						?>
					</p>
				</div>
			</div>
			<?php
		}
	}

	myCRED_AI_Assistant_Menu::instance();

endif;
