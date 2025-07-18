<?php
if ( ! defined( 'myCRED_VERSION' ) ) exit;

/**
 * myCRED_Hooks_Module class
 * @since 0.1
 * @version 1.3
 */
if ( ! class_exists( 'myCRED_Hooks_Module' ) ) :
	class myCRED_Hooks_Module extends myCRED_Module {

		public $setup;

		/**
		 * Construct
		 */
		public function __construct( $type = MYCRED_DEFAULT_TYPE_KEY ) {

			$option_id = apply_filters( 'mycred_option_id', 'mycred_pref_hooks' );

			parent::__construct( 'myCRED_Hooks_Module', array(
				'module_name' => 'hooks',
				'option_id'   => $option_id,
				'defaults'    => array(
					'installed'   => array(),
					'active'      => array(),
					'hook_prefs'  => array()
				),
				'labels'      => array(
					'menu'        => __( 'Hooks', 'mycred' ),
					'page_title'  => __( 'Hooks', 'mycred' ),
					'page_header' => __( 'Hooks', 'mycred' )
				),
				'screen_id'   => MYCRED_SLUG . '-hooks',
				'accordion'   => false,
				'menu_pos'    => 20
			), $type );

		}

		/**
		 * Load Hooks
		 * @since 0.1
		 * @version 1.1
		 */
		public function module_init() {

			// Loop through each active hook and call the run() method.
			if ( ! empty( $this->installed ) ) {

				foreach ( $this->installed as $key => $gdata ) {

					if ( $this->is_active( $key ) && isset( $gdata['callback'] ) ) {
						$this->call( 'run', $gdata['callback'] );
					}

				}

			}

			// Ajax handlers for hook management
			add_action( 'wp_ajax_mycred-hook-order',  array( $this, 'ajax_hook_activation' ) );
			add_action( 'wp_ajax_mycred-save-hook',   array( $this, 'ajax_save_hook_prefs' ) );

		}

		/**
		 * Get Hooks
		 * @since 0.1
		 * @version 1.3
		 */
		public function get( $save = false ) {

			$installed = array();

			// Registrations
			$installed['registration'] = array(
				'title'         => __( '%plural% for registrations', 'mycred' ),
				'description'   => __( 'Award %_plural% for users joining your website.', 'mycred' ),
				'documentation' => 'http://codex.mycred.me/hooks/registrations/',
				'callback'      => array( 'myCRED_Hook_Registration' )
			);

			// Anniversary
			$installed['anniversary'] = array(
				'title'         => __( '%plural% for Anniversary', 'mycred' ),
				'description'   => __( 'Award %_plural% for each year a user has been member.', 'mycred' ),
				'documentation' => 'http://codex.mycred.me/hooks/anniversary/',
				'callback'      => array( 'myCRED_Hook_Anniversary' )
			);

			// Site Visits
			$installed['site_visit'] = array(
				'title'         => __( '%plural% for daily visits', 'mycred' ),
				'description'   => __( 'Award %_plural% for visiting your website on a daily basis.', 'mycred' ),
				'documentation' => 'http://codex.mycred.me/hooks/daily-visits/',
				'callback'      => array( 'myCRED_Hook_Site_Visits' )
			);

			// View Content
			$installed['view_contents'] = array(
				'title'         => __( '%plural% for viewing content', 'mycred' ),
				'description'   => __( 'Award %_plural% for viewing content.', 'mycred' ),
				'documentation' => 'http://codex.mycred.me/hooks/viewing-content/',
				'callback'      => array( 'myCRED_Hook_View_Contents' )
			);

			// Logins
			$installed['logging_in'] = array(
				'title'         => __( '%plural% for logins', 'mycred' ),
				'description'   => __( 'Award %_plural% for logging in.', 'mycred' ),
				'documentation' => 'http://codex.mycred.me/hooks/logins/',
				'callback'      => array( 'myCRED_Hook_Logging_In' )
			);

			// Content Publishing
			$installed['publishing_content'] = array(
				'title'         => __( '%plural% for publishing content', 'mycred' ),
				'description'   => __( 'Award %_plural% for publishing content.', 'mycred' ),
				'documentation' => 'http://codex.mycred.me/hooks/publishing-content/',
				'callback'      => array( 'myCRED_Hook_Publishing_Content' )
			);

			// Content Deletions
			$installed['deleted_content'] = array(
				'title'         => __( '%plural% for trashed content', 'mycred' ),
				'description'   => __( 'Award or Deduct %_plural% when content gets trashed.', 'mycred' ),
				'documentation' => 'http://codex.mycred.me/hooks/deleting-content/',
				'callback'      => array( 'myCRED_Hook_Delete_Content' )
			);

			// Commenting
			$installed['comments'] = array(
				'title'         => ( ! function_exists( 'dsq_is_installed' ) ) ? __( '%plural% for comments', 'mycred' ) : __( '%plural% for Disqus comments', 'mycred' ),
				'description'   => __( 'Award %_plural% for making comments.', 'mycred' ),
				'documentation' => 'http://codex.mycred.me/hooks/comments/',
				'callback'      => array( 'myCRED_Hook_Comments' )
			);

			// Link Clicks
			$installed['link_click'] = array(
				'title'         => __( '%plural% for clicking on links', 'mycred' ),
				'description'   => str_replace( '%shortcode%', '<a href="http://codex.mycred.me/shortcodes/mycred_link/" target="_blank">mycred_link</a>', __( 'Award %_plural% for clicks on links generated by the %shortcode% shortcode.', 'mycred' ) ),
				'documentation' => 'http://codex.mycred.me/hooks/clicking-on-links/',
				'callback'      => array( 'myCRED_Hook_Click_Links' )
			);

			// Video Views
			$installed['video_view'] = array(
				'title'         => __( '%plural% for viewing Videos', 'mycred' ),
				'description'   => str_replace( '%shortcode%', '<a href="http://codex.mycred.me/shortcodes/mycred_video/" target="_blank">mycred_video</a>', __( 'Award %_plural% for watches videos embedded using the %shortcode% shortcode.', 'mycred' ) ),
				'documentation' => 'http://codex.mycred.me/hooks/watching-videos/',
				'callback'      => array( 'myCRED_Hook_Video_Views' )
			);

			// Affiliation
			$installed['affiliate'] = array(
				'title'         => __( '%plural% for referrals', 'mycred' ),
				'description'   => __( 'Award %_plural% for signup or visitor referrals.', 'mycred' ),
				'documentation' => 'http://codex.mycred.me/hooks/referrals/',
				'callback'      => array( 'myCRED_Hook_Affiliate' )
			);

			// View Specific Content (Member)
			$installed['view_contents_specific'] = array(
				'title'         => __( '%plural% for viewing specific content (Member)', 'mycred' ),
				'description'   => __( 'Award %_plural% for viewing specific content. (Member)', 'mycred' ),
				'documentation' => 'http://codex.mycred.me/hooks/viewing-content-specific-member/',
				'callback'      => array( 'myCRED_Hook_View_Contents_specific' )
			);

			// View Specific Content (Author)
			$installed['view_contents_specific_author'] = array(
				'title'         => __( '%plural% for viewing specific content (Author)', 'mycred' ),
				'description'   => __( 'Award %_plural% for viewing specific content. (Author)', 'mycred' ),
				'documentation' => 'http://codex.mycred.me/hooks/viewing-content-specific-author/',
				'callback'      => array( 'myCRED_Hook_View_Contents_specific_author' )
			);

			$installed = apply_filters( 'mycred_setup_hooks', $installed, $this->mycred_type );

			$option_id = apply_filters( 'mycred_option_id', 'mycred_pref_hooks' );

			if ( $save === true && $this->core->user_is_point_admin() ) {
				$new_data = array(
					'active'     => $this->active,
					'installed'  => $installed,
					'hook_prefs' => $this->hook_prefs
				);
				mycred_update_option( $this->option_id, $new_data );
			}

			$this->installed = $installed;
			return $installed;

		}

		/**
		 * Call
		 * Either calls a given class method or function.
		 * @since 0.1
		 * @version 1.1.1
		 */
		public function call( $call, $callback, $return = NULL ) {

			// Class
			if ( is_array( $callback ) && class_exists( $callback[0] ) ) {

				$class = $callback[0];
				$methods = get_class_methods( $class );
				if ( in_array( $call, $methods ) ) {

					$new = new $class( ( isset( $this->hook_prefs ) ) ? $this->hook_prefs : array(), $this->mycred_type );
					return $new->$call( $return );

				}

			}

			// Function
			elseif ( ! is_array( $callback ) ) {

				if ( function_exists( $callback ) ) {

					if ( $return !== NULL )
						return call_user_func( $callback, $return, $this );
					else
						return call_user_func( $callback, $this );

				}

			}

			if ( $return !== NULL )
				return array();

		}

		/**
		 * Settings Header
		 * @since 1.7
		 * @version 1.0
		 */
		public function settings_header() {

			$option_id = apply_filters( 'mycred_option_id', 'mycred_pref_hooks' );

			wp_enqueue_style( 'mycred-bootstrap-grid' );

			wp_localize_script(
				'mycred-widgets',
				'myCREDHooks',
				array(
					'type' => $this->mycred_type,
					'option_id' => $option_id
				)
			);
			wp_enqueue_script( 'mycred-widgets' );
			wp_enqueue_script( 'mycred-specific-content-script' );

			if ( wp_is_mobile() )
				wp_enqueue_script( 'jquery-touch-punch' );

		}

		/**
		 * Admin Page
		 * @since 0.1
		 * @version 1.2.1
		 */
		public function admin_page() {

			// Security
			if ( ! $this->core->user_is_point_admin() ) wp_die( 'Access Denied' );

			$option_id = apply_filters( 'mycred_option_id', 'mycred_pref_hooks' );

			// Get installed
			$installed   = $this->get();
			$this->setup = mycred_get_option( $option_id . '_sidebar', 'default' );
			$button      = '';

?>
<style type="text/css">
.widget-content { display: block; float: none; clear: both; }
.widget-content label.subheader { display: block; font-weight: bold; padding: 0 0 0 0; margin: 0 0 6px 0; }
.widget-content ol { margin: 0 0 6px 0; }
.widget-content ol.inline:after { content: ""; display: block; height: 1px; clear: both; }
.widget-content ol li { list-style-type: none; margin: 0 0 0 0; padding: 0 0 0 0; }
.widget-content ol.inline li { display: block; float: left; min-width: 45%; }
.widget-content ol.inline li.empty { display: none; }
.widget-content ol li input, .widget-content ol li select { margin-bottom: 6px; }
.widget-content ol li input[type="checkbox"], .widget-content ol li input[type="radio"] { margin-bottom: 0; }
.widget-content ol li input.mini { margin-right: 12px; }
.widget-content ol li input.long { width: 100%; }
.widget-content ol li label { display: block; margin-bottom: 6px; }
.widget-content select.limit-toggle { vertical-align: top; }

.widget-content .hook-instance { margin-bottom: 18px; border-bottom: 1px dashed #d5d5d5; }
.widget-content .hook-instance:last-of-type { border-bottom: none; margin-bottom: 0; }
.widget-content .hook-instance h3 { margin: 0 0 12px 0; }
.widget-content .hook-instance .row > div .form-group:last-child { margin-bottom: 0; }
.widget-content .page-title-action { top: 0; float: right; }

#sidebar-active .widget-inside .form .form-group span.description { display: block; font-style: italic; font-size: 12px; line-height: 16px; padding-left: 0; padding-right: 0; padding-top: 6px; }
#available-widgets .widget .widget-description { min-height: 50px; }
#sidebar-active .widget-inside form .widget-content { padding-top: 12px; }
#sidebar-active .widget-inside form .widget-control-actions { padding-top: 12px; border-top: 1px dashed #dedede; margin-top: 12px; }
.form .radio { margin-bottom: 12px; }
</style>

<div class="wrap" id="myCRED-wrap">
	<h1><?php esc_html_e( 'Hooks', 'mycred' ); if ( MYCRED_DEFAULT_LABEL === 'myCRED' ) : ?> <a href="http://codex.mycred.me/chapter-ii/setup-hooks/" class="mycred-ui-info-btn" target="_blank"><p><?php esc_html_e( 'Documentation', 'mycred' ); ?></p></a><?php endif; ?></h1>
	<div class="widget-liquid-left">
		<div id="widgets-left">
			<div id="available-widgets" class="widgets-holder-wrap">
				<div class="sidebar-name">
					<div class="sidebar-name-arrow"><br /></div>
					<h2><?php esc_html_e( 'Available Hooks' ); ?> <span id="removing-widget"><?php esc_html_x( 'Deactivate', 'removing-widget' ); ?> <span></span></span></h2>
				</div>
				<div class="widget-holder">
					<div class="sidebar-description">
						<p class="description"><?php esc_html_e( 'To activate a hook drag it to a sidebar or click on it. To deactivate a hook and delete its settings, drag it back.' ); ?></p>
					</div>
					<div id="widget-list">
<?php

			// If we have hooks
			if ( ! empty( $installed ) ) {

				global $mycred_field_id;

				$mycred_field_id = '__i__';

				// Loop though them
				$count = 0;
				foreach ( $installed as $key => $data ) {

?>
						<div id="widget-mycred-hook_<?php echo esc_attr( $key ); ?>" class="widget ui-draggable"<?php if ( $this->is_active( $key ) ) echo ' style="display: none;"'; ?> title="<?php echo esc_html( $this->core->template_tags_general( $data['title'] ) ); ?>">
							<div class="widget-top">
								<div class="widget-title-action">
 									<div class="dashicons-mycred-hook arrow-round"></div>
								</div>
								<div class="widget-title ui-draggable-handle">
									<h3><?php echo esc_html( $this->core->template_tags_general( $data['title'] ) ); ?></h3>
								
								</div>
							</div>
							<div class="widget-inside mycred-metabox">
								<form method="post" action="" class="form">
									<div class="widget-content">
										<?php $this->call( 'preferences', $data['callback'] ); ?>
									</div>
									<input type="hidden" name="widget-id" class="widget-id" value="<?php echo esc_attr( $key ); ?>" />
									<input type="hidden" name="id_base" class="id_base" value="<?php echo esc_attr( $key ); ?>" />
									<input type="hidden" name="add_new" class="add_new" value="single" />
									<div class="widget-control-actions">
										<div class="alignleft">
											<a class="widget-control-remove" href="#remove"><?php esc_html_e( 'Delete', 'mycred' ); ?></a> | <a class="widget-control-close" href="#close"><?php esc_html_e( 'Close', 'mycred' ); ?></a><?php if ( MYCRED_DEFAULT_LABEL === 'myCRED' && array_key_exists( 'documentation', $data ) && ! empty( $data['documentation'] ) ) : ?> | <a class="hook-documentation" href="<?php echo esc_url( $data['documentation'] ); ?>" target="_blank">Hook Documentation</a><?php endif; ?><?php if ( array_key_exists( 'pro', $data ) && ! empty( $data['pro'] ) ) : ?> | <a class="hook-pro" href="<?php echo esc_url( $data['pro'] ); ?>" target="_blank">Get Pro</a><?php endif; ?>
										</div>
										<div class="alignright">
											<input type="submit" name="savewidget" id="widget-mycred-hook-<?php echo esc_attr( $key ); ?>-__i__-savewidget" class="button button-primary widget-control-save right mycred-ui-btn-purple" value="<?php esc_attr_e( 'Save', 'mycred' ); ?>" />
											<span class="spinner"></span>
										</div>
									</div>
								</form>
							</div>
							<div class="widget-description"><?php echo wp_kses_post( nl2br( $this->core->template_tags_general( $data['description'] ) ) ); ?></div>
						</div>
<?php

					$count++;
				}

				$mycred_field_id = '';

			}

?>
					</div>
					<br class="clear" />
				</div>
				<br class="clear" />
			</div>
		</div>
	</div>
	<div class="widget-liquid-right">

		<?php $this->display_sidebars(); ?>

	</div>
	<form method="post"><?php wp_nonce_field( 'manage-mycred-hooks', '_wpnonce_widgets', false ); ?></form>
	<br class="clear" />
</div>
<div class="widgets-chooser">
	<ul class="widgets-chooser-sidebars"></ul>
	<div class="widgets-chooser-actions">
		<button class="button-secondary"><?php esc_html_e( 'Cancel', 'mycred' ); ?></button>
		<button class="button-primary"><?php esc_html_e( 'Add Hook', 'mycred' ); ?></button>
	</div>
</div>

<script type="text/javascript">
jQuery(function($) {

	$( 'div.widget-liquid-right' ).on( 'change', 'select.limit-toggle', function(){

		if ( $(this).find( ':selected' ).val() != 'x' )
			$(this).prev().attr( 'type', 'text' ).val( 0 );
		else
			$(this).prev().attr( 'type', 'hidden' ).val( 0 );

	});

});
</script>
<?php

		}

		/**
		 * Display Sidebars
		 * @since 1.7
		 * @version 1.0
		 */
		public function display_sidebars() {

			// Default setup
			if ( $this->setup == 'default' ) {

?>
<div id="widgets-right" class="single-sidebar">
	<div class="sidebars-column-0">
		<div class="widgets-holder-wrap">
			<div id="sidebar-active" class="widgets-sortables ui-droppable ui-sortable">
				<div class="sidebar-name">
					<div class="sidebar-name-arrow"><br /></div>
					<h2><?php esc_html_e( 'Active Hooks', 'mycred' ); ?></h2>
				</div>
				<div class="sidebar-description">
					<p class="description"><?php esc_html_e( 'The following hooks are used for all users.', 'mycred' ); ?></p>
				</div>
<?php

			do_action( 'mycred_before_active_hooks',$this->mycred_type );
			
			// If we have hooks
			if ( ! empty( $this->installed ) ) {

				// Loop though them
				foreach ( $this->installed as $key => $data ) {

					// Show only active hooks
					if ( ! $this->is_active( $key ) ) continue;

?>
				<div id="widget-mycred-hook_<?php echo esc_attr( $key ); ?>" class="widget" style="z-index: auto;">
					<div class="widget-top">
						<div class="widget-title-action">
							<div class="dashicons-mycred-hook arrow-round"></div>
						</div>
						<div class="widget-title ui-draggable-handle">
							<h3><?php echo esc_html( $this->core->template_tags_general( $data['title'] ) ); ?></h3>
						</div>
					</div>
					<div class="widget-inside mycred-metabox">
						<form method="post" action="" class="form">
							<div class="widget-content">

								<?php $this->call( 'preferences', $data['callback'] ); ?>

							</div>
							<input type="hidden" name="widget-id" class="widget-id" value="<?php echo esc_attr( $key ); ?>" />
							<input type="hidden" name="id_base" class="id_base" value="<?php echo esc_attr( $key ); ?>" />
							<input type="hidden" name="add_new" class="add_new" value="single" />
							<div class="widget-control-actions">
								<div class="alignleft">
									<a class="widget-control-remove" href="#remove"><?php esc_html_e( 'Delete', 'mycred' ); ?></a> | <a class="widget-control-close" href="#close"><?php esc_html_e( 'Close', 'mycred' ); ?></a><?php if ( MYCRED_DEFAULT_LABEL === 'myCRED' && array_key_exists( 'documentation', $data ) && ! empty( $data['documentation'] ) ) : ?> | <a class="hook-documentation" href="<?php echo esc_url( $data['documentation'] ); ?>" target="_blank">Hook Documentation</a><?php endif; ?><?php if ( array_key_exists( 'pro', $data ) && ! empty( $data['pro'] ) ) : ?> | <a class="hook-pro" href="<?php echo esc_url( $data['pro'] ); ?>" target="_blank">Get Pro</a><?php endif; ?>
								</div>
								<div class="alignright">
									<input type="submit" name="savewidget" id="widget-mycred-hook-<?php echo esc_attr( $key ); ?>-__i__-savewidget" class="button button-primary widget-control-save right mycred-ui-btn-purple" value="<?php esc_attr_e( 'Save', 'mycred' ); ?>" />
									<span class="spinner"></span>
								</div>
							</div>
						</form>
					</div>
					<div class="widget-description"><?php echo wp_kses_post( nl2br( $this->core->template_tags_general( $data['description'] ) ) ); ?></div>
				</div>
<?php

				}

			}

?>

			</div>
		</div>
	</div>
</div>
<?php

			}

			// Let others play
			else {

				do_action( 'mycred-hook-sidebars' , $this );
				do_action( 'mycred-hook-sidebars-' . $this->mycred_type , $this );

			}

		}

		/**
		 * AJAX: Save Hook Activations
		 * Either saves the hook order (no use) or saves hooks being activated or deactivated.
		 * @since 1.7
		 * @since 2.4.5 @filter added `mycred_before_hooks_activation_save`
		 * @version 1.0.2
		 */
		public function ajax_hook_activation() {

			check_ajax_referer( 'manage-mycred-hooks', 'savewidgets' );

			if ( ! isset( $_POST['sidebars'] ) ) die;

			$ctype      = isset( $_POST['ctype'] ) ? sanitize_key( $_POST['ctype'] ) : '';
			$option_id  = isset( $_POST['option_id'] ) ? sanitize_key( $_POST['option_id'] ) : '';
			if ( $ctype !== $this->mycred_type ) return;

			$installed  = $this->get();

			if ( ! empty( $_POST['sidebars'] ) ) {
				// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.MissingUnslash,WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
				foreach ( $_POST['sidebars'] as $sidebar_id => $hooks ) {

					$hooks = explode( ',', $hooks );

					// First get all the hook IDs
					$clean_hook_ids = array();
					if ( ! empty( $hooks ) ) {
						foreach ( $hooks as $hook_id ) {
							$clean_hook_ids[] = sanitize_key( str_replace( array( 'new-widget-mycred-hook_', 'widget-mycred-hook_' ), '', $hook_id ) );
						}
					}

					// One for all
					if ( $sidebar_id == 'sidebar-active' ) {

						$active_hooks = array();
						if ( ! empty( $this->active ) && ! empty( $clean_hook_ids ) ) {
							foreach ( $this->active as $already_active_hook_id ) {

								// Retain active hooks that are set to remain active
								if ( in_array( $already_active_hook_id, $clean_hook_ids ) && ! in_array( $already_active_hook_id, $active_hooks ) )
									$active_hooks[] = $already_active_hook_id;

							}
						}

						// Loop through all hooks in this sidebase and consider them as active
						if ( ! empty( $clean_hook_ids ) ) {
							foreach ( $clean_hook_ids as $hook_id ) {

								if ( array_key_exists( $hook_id, $installed ) && ! in_array( $hook_id, $active_hooks ) )
									$active_hooks[] = $hook_id;

							}
						}

						$active_hooks = array_unique( $active_hooks, SORT_STRING );
						$this->active = $active_hooks;

						if ( $ctype != MYCRED_DEFAULT_TYPE_KEY ) {
							$option_id = $option_id . '_' . $ctype;
						}

						$hooks_update = apply_filters( 'mycred_before_hooks_activation_save', $this, $option_id );

						// Update our settings to activate the hook(s)
						mycred_update_option( $option_id, array(
							'active'     => $hooks_update->active,
							'installed'  => $installed,
							'hook_prefs' => $hooks_update->hook_prefs
						) );

					}

				}
			}

		}

		/**
		 * AJAX: Save Hook Settings
		 * @since 1.7
		 * @version 1.0.4
		 */
		public function ajax_save_hook_prefs() {
		    
			check_ajax_referer( 'manage-mycred-hooks', 'savewidgets' );

			$sidebar    = isset( $_POST['sidebar'] ) ? sanitize_text_field( wp_unslash( $_POST['sidebar'] ) ) : '';
			$hook_id    = isset( $_POST['id_base'] ) ? sanitize_key( $_POST['id_base'] ) : '';
			$ctype      = isset( $_POST['ctype'] ) ? sanitize_key( $_POST['ctype'] ) : '';
			$option_id  = isset( $_POST['option_id'] ) ? sanitize_key( $_POST['option_id'] ) : '';
			$hook_prefs = false;

			if ( $ctype !== $this->mycred_type ) return;

			$installed  = $this->get();

			// $_POST['mycred_pref_hooks'] will not be available if we remove the last active hook
			// Removing all hooks from the active sidebar will trigger this method so we need to take that
			// into account
			$mycred_pref_hooks_save = $option_id;
			if ( isset( $_POST[$mycred_pref_hooks_save] ) || isset($_POST[ $mycred_pref_hooks_save.'_' . $ctype ]) ) {

				// Get hook settings
				if ( $ctype != MYCRED_DEFAULT_TYPE_KEY )
					$mycred_pref_hooks_save = $mycred_pref_hooks_save . '_' . $ctype;

				if ( ! array_key_exists( $hook_id, $_POST[ $mycred_pref_hooks_save ]['hook_prefs'] ) ) die;

				if ( ! array_key_exists( $hook_id, $installed ) )
					die( '<p>No longer available hook</p>' );

				// New settings
				// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.MissingUnslash,WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
				$new_settings = $this->call( 'sanitise_preferences', $installed[ $hook_id ]['callback'], $_POST[ $mycred_pref_hooks_save ]['hook_prefs'][ $hook_id ] );

				$this->hook_prefs[ $hook_id ] = $new_settings;

			}

			$hooks_update = apply_filters( 'mycred_before_hooks_save', $this, $mycred_pref_hooks_save, $hook_id );

			// Update our settings to activate the hook(s)
			mycred_update_option( $mycred_pref_hooks_save, array(
				'active'     => $hooks_update->active,
				'installed'  => $installed,
				'hook_prefs' => $hooks_update->hook_prefs
			) );

			if ( isset( $_POST['mycred_pref_hooks'] ) || isset($_POST[ 'mycred_pref_hooks_' . $ctype ]) ) 
			    $hooks_update->call( 'preferences', $installed[ $hook_id ]['callback'] );

			die;

		}

	}
endif;
