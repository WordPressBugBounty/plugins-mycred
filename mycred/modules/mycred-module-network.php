<?php
if ( ! defined( 'myCRED_VERSION' ) ) exit;

/**
 * myCRED_Network class
 * This module handles all Multisite related features along with adding in the Network settings
 * page in the wp-admin area. Only used if myCRED is enabled network wide!
 * @since 0.1
 * @version 1.3
 */
if ( ! class_exists( 'myCRED_Network_Module' ) ) :
	class myCRED_Network_Module {

		public $core;
		public $plug;
		public $blog_id  = 0;
		public $settings = array();

		/**
		 * Construct
		 */
		public function __construct() {

			global $mycred_network;

			$this->core     = mycred();
			$this->blog_id  = get_current_blog_id();
			$this->settings = mycred_get_settings_network();

		}

		/**
		 * Load
		 * @since 0.1
		 * @version 1.1
		 */
		public function load() {

			add_action( 'mycred_init',                array( $this, 'module_init' ) );
			add_action( 'mycred_admin_init',          array( $this, 'module_admin_init' ) );

			add_action( 'admin_enqueue_scripts',      array( $this, 'enqueue_admin_before' ) );
			add_action( 'network_admin_menu',         array( $this, 'add_menu' ) );

		}

		/**
		 * Init
		 * @since 0.1
		 * @version 1.0.1
		 */
		public function module_init() {

			if ( MYCRED_ENABLE_LOGGING && ! mycred_is_main_site() ) {

				/**
				 * In situations where we are enforcing our main sites settings on all blogs and
				 * we are not centralising the log, we need to check if the local database table
				 * should be installed.
				 */
				if ( $this->settings['master'] && ! $this->settings['central'] ) {

					$local_install = get_blog_option( $this->blog_id, 'mycred_version_db', false );
					if ( $local_install === false ) {

						mycred_install_log( NULL, true );

						// Add local marker to prevent this from running again
						add_blog_option( $this->blog_id, 'mycred_version_db', time() );

					}

				}

			}

			$this->network_enabled = is_plugin_active_for_network( 'mycred/mycred.php' );

			if ( $this->network_enabled ) {

				add_filter( 'wpmu_blogs_columns',         array( $this, 'site_column_headers' ) );
				add_action( 'manage_sites_custom_column', array( $this, 'site_column_content' ), 10, 2 );
            	add_action( 'wp_ajax_mycred_active_network_site', array( $this, 'mycred_active_network_site' ) );


			}

		}

		/**
		 * Admin Init
		 * @since 0.1
		 * @version 1.0
		 */
		public function module_admin_init() {

			register_setting( 'mycred_network', 'mycred_network', array( $this, 'save_network_prefs' ) );

		}

		/**
		 * Enqueue Admin Before
		 * Adjust the myCRED column on the sites screen.
		 * @since 1.7.6
		 * @version 1.0
		 */
		public function enqueue_admin_before() {

			$screen = get_current_screen();
			if ( $screen->id == 'sites-network' ) {

				echo '<style type="text/css">th#' . esc_attr( MYCRED_SLUG ) . ' { width: 15%; }</style>';

			}

		}

		/**
		 * Site Column Headers
		 * @since 1.7.6
		 * @version 1.0
		 */
		public function site_column_headers( $columns ) {

			if ( ! array_key_exists( MYCRED_SLUG, $columns ) )
				$columns[ MYCRED_SLUG ] = mycred_label();

			return $columns;

		}

		/**
		 * Site Column Content
		 * @since 1.7.6
		 * @version 1.0
		 */
		public function site_column_content( $column_name, $blog_id ) {

			if ( $column_name == MYCRED_SLUG ) {
				
				wp_enqueue_script( 'mycred-accordion' );
				
				if ( mycred_is_site_blocked( $blog_id ) ) {

					echo '<span class="dashicons dashicons-warning"></span><div class="row-actions"><span class="info" style="color: #666">' . esc_html__( 'Blocked', 'mycred' ) . '</span></div>';

				}
				else {

					if ( ! $this->settings['master'] ) {

						if ( get_blog_option( $blog_id, 'mycred_setup_completed', false ) !== false )
							echo '<span class="dashicons dashicons-yes" style="color: green;"></span><div class="row-actions"><span class="info" style="color: #666">' . esc_html__( 'Installed', 'mycred' ) . '</span></div>';
						else
							echo '<span class="dashicons dashicons-minus"></span><button id="mycred-activate-network-sites" class="mycred-activate-network-sites" data-id="'.esc_attr($blog_id).'" type="button"> Activate</button><div style="display:none" class="mycred-loader"></div><div class="row-actions"><span class="info" style="color: #666">' . esc_html__( 'Not Installed', 'mycred' ) . '</span></div>';

					}
					else {

						// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
						echo '<span class="dashicons dashicons-yes"' . ( $blog_id == 1 ? ' style="color: green;"' : '' ) . '></span><div class="row-actions"><span class="info" style="color: #666">' . ( $blog_id == 1 ? esc_html__( 'Master Template', 'mycred' ) : esc_html__( 'Enabled', 'mycred' ) ) . '</span></div>';

					}

				}

			}

		}

		public function mycred_active_network_site() {
		
			$blog_id = isset( $_POST['id'] ) ? absint( $_POST['id'] ) : 0;
				
			global $mycred_network_blog_id;

			$mycred_network_blog_id = $blog_id;

			switch_to_blog( $blog_id );

			if ( is_mycred_ready() == false && $this->network_enabled ) {

				// Load Installer
				require_once myCRED_INCLUDES_DIR . 'mycred-install.php';
				$installer = mycred_installer();

				// Compatibility check
				$installer::compat();

				// First time activation
				if ( get_option( 'mycred_version', false ) === false )
					$installer::activate();	

				wp_send_json_success( );

			}

			restore_current_blog();

		}

		/**
		 * Add Network Menu Items
		 * @since 0.1
		 * @version 1.2
		 */
		public function add_menu() {

			$pages   = array();
			$name    = mycred_label( true );

			$pages[] = add_menu_page(
				$name,
				$name,
				'manage_network_options',
				MYCRED_SLUG . '-network',
				'',
				'dashicons-star-filled'
			);

			$pages[] = add_submenu_page(
				MYCRED_SLUG . '-network',
				__( 'Network Settings', 'mycred' ),
				__( 'Network Settings', 'mycred' ),
				'manage_network_options',
				MYCRED_SLUG . '-network',
				array( $this, 'admin_page_settings' )
			);

			foreach ( $pages as $page )
				add_action( 'admin_print_styles-' . $page, array( $this, 'admin_page_header' ) );

		}

		/**
		 * Add Admin Menu Styling
		 * @since 0.1
		 * @version 1.1
		 */
		public function admin_page_header() {

			wp_enqueue_style( 'mycred-bootstrap-grid' );

			wp_localize_script( 'mycred-accordion', 'myCRED', array( 'active' => 0 ) );

			wp_enqueue_script( 'mycred-accordion' );

?>
<!-- myCRED Accordion Styling -->
<style type="text/css">
h4:before { float:right; padding-right: 12px; font-size: 14px; font-weight: normal; color: silver; }
h4.ui-accordion-header.ui-state-active:before { content: "<?php esc_attr_e( 'click to close', 'mycred' ); ?>"; }
h4.ui-accordion-header:before { content: "<?php esc_attr_e( 'click to open', 'mycred' ); ?>"; }
</style>
<?php

		}

		/**
		 * Network Settings Page
		 * @since 0.1
		 * @version 1.1
		 */
		public function admin_page_settings() {

			// Security
			if ( ! current_user_can( 'manage_network_options' ) ) wp_die( 'Access Denied' );

			global $mycred_network;

			$name = mycred_label();

?>
<div class="wrap mycred-metabox" id="myCRED-wrap">
	<h1><?php printf( esc_html__( '%s Network', 'mycred' ), esc_html( $name ) ); ?><?php if ( MYCRED_DEFAULT_LABEL === 'myCRED' ) : ?> <a href="http://codex.mycred.me/chapter-i/multisites/" class="mycred-ui-info-btn" target="_blank"></a><?php endif; ?></h1>
<?php

			if ( wp_is_large_network() ) {

?>
	<p><?php esc_html_e( 'I am sorry but your network is too big to use these features.', 'mycred' ); ?></p>
<?php

			}

			else {

				// Inform user that myCRED has not yet been setup
				$setup = get_blog_option( 1, 'mycred_setup_completed', false );
				if ( $setup === false )
					echo '<div class="error"><p>' . sprintf( esc_html__( 'Note! %s has not yet been setup.', 'mycred' ), esc_html( $name ) ) . '</p></div>';

				// Settings Updated
				if ( isset( $_GET['settings-updated'] ) )
					echo '<div class="updated"><p>' . esc_html__( 'Settings Updated', 'mycred' ) . '</p></div>';

?>
	<form method="post" action="<?php echo esc_url( admin_url( 'options.php' ) ); ?>" class="form" name="mycred-core-settings-form" novalidate>

		<?php settings_fields( 'mycred_network' ); ?>

		<div class="list-items expandable-li" id="accordion">

			<div class="mycred-ui-accordion">
				<div class="mycred-ui-accordion-header">
					<h4 class="mycred-ui-accordion-header-title">
						<span class="dashicons dashicons-admin-settings static mycred-ui-accordion-header-icon"></span>
						<label><?php esc_html_e( 'Settings', 'mycred' ); ?></label>
					</h4>
					<div class="mycred-ui-accordion-header-actions hide-if-no-js">
						<button type="button" aria-expanded="true">
							<span class="mycred-ui-toggle-indicator" aria-hidden="true"></span>
						</button>
					</div>
				</div>
				<div class="body mycred-ui-accordion-body" style="display:none;">
					<div class="row">
						<div class="col-lg-6 col-md-6 col-sm-6 col-xs-12">
							<h3><?php esc_html_e( 'Master Template', 'mycred' ); ?></h3>
							<p><a href="http://codex.mycred.me/chapter-i/multisites/master-template/" class="mycred-ui-color-purple" target="_blank"><?php esc_html_e( 'Documentation', 'mycred' ); ?></a></p>
							<div class="row">
								<div class="col-xs-6">
									<div class="form-group">
										<label for="mycred-network-overwrite-enabled"><input type="radio" name="mycred_network[master]" id="mycred-network-overwrite-enabled" <?php checked( (int) $this->settings['master'], 1 ); ?> value="1" /> <?php esc_html_e( 'Enabled', 'mycred' ); ?></label>
									</div>
								</div>
								<div class="col-xs-6">
									<div class="form-group">
										<label for="mycred-network-overwrite-disabled"><input type="radio" name="mycred_network[master]" id="mycred-network-overwrite-disabled" <?php checked( (int) $this->settings['master'], 0 ); ?> value="0" /> <?php esc_html_e( 'Disabled', 'mycred' ); ?></label>
									</div>
								</div>
							</div>
						</div>
						<div class="col-lg-6 col-md-6 col-sm-6 col-xs-12">
							<h3><?php esc_html_e( 'Central Logging', 'mycred' ); ?></h3>
							<p><a href="http://codex.mycred.me/chapter-i/multisites/central-logging/" class="mycred-ui-color-purple" target="_blank"><?php esc_html_e( 'Documentation', 'mycred' ); ?></a></p>
							<div class="row">
								<div class="col-xs-6">
									<div class="form-group">
										<label for="mycred-network-overwrite-log-enabled"><input type="radio" name="mycred_network[central]" id="mycred-network-overwrite-log-enabled" <?php checked( (int) $this->settings['central'], 1 ); ?> value="1" /> <?php esc_html_e( 'Enabled', 'mycred' ); ?></label>
									</div>
								</div>
								<div class="col-xs-6">
									<div class="form-group">
										<label for="mycred-network-overwrite-log-disabled"><input type="radio" name="mycred_network[central]" id="mycred-network-overwrite-log-disabled" <?php checked( (int) $this->settings['central'], 0 ); ?> value="0" /> <?php esc_html_e( 'Disabled', 'mycred' ); ?></label>
									</div>
								</div>
							</div>
						</div>
					</div>

					<h3><?php esc_html_e( 'Site Block', 'mycred' ); ?></h3>
					<div class="row">
						<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
							<div class="form-group">
								<label for="mycred-network-block"><?php esc_html_e( 'Blog IDs', 'mycred' ); ?></label>
								<input type="text" name="mycred_network[block]" id="mycred-network-block" value="<?php echo esc_attr( $this->settings['block'] ); ?>" class="form-control" />
								<p><span class="description"><?php printf( esc_html__( 'Comma separated list of blog ids where %s is to be disabled.', 'mycred' ), esc_html( $name ) ); ?></span></p>
							</div>
						</div>
					</div>

					<?php do_action( 'mycred_network_prefs', $this ); ?>
				</div>
			</div>

			<?php do_action( 'mycred_after_network_prefs', $this ); ?>

		</div>

		<?php submit_button( __( 'Save Network Settings', 'mycred' ), 'mycred-ui-mt20 mycred-ui-btn-purple', 'submit', false ); ?>

	</form>	
<?php

			}

			do_action( 'mycred_bottom_network_page', $this );

?>
</div>
<?php

		}

		/**
		 * Save Network Settings
		 * @since 0.1
		 * @version 1.1
		 */
		public function save_network_prefs( $settings ) {

			$new_settings            = array();
			$new_settings['master']  = ( isset( $settings['master'] ) ) ? absint( $settings['master'] ) : 0;
			$new_settings['central'] = ( isset( $settings['central'] ) ) ? absint( $settings['central'] ) : 0;
			$new_settings['block']   = sanitize_text_field( $settings['block'] );

			// Master template feature change
			if ( (bool) $new_settings['master'] !== $this->settings['master'] ) {

				// Enabled
				if ( (bool) $new_settings['master'] === true ) {
					$this->enable_master_template();
				}
				// Disabled
				else {
					$this->disable_master_template();
				}

			}

			// Central logging feature change
			if ( (bool) $new_settings['central'] !== $this->settings['central'] ) {

				// Enabled
				if ( (bool) $new_settings['central'] === true ) {
					$this->enable_central_logging();
				}
				// Disabled
				else {
					$this->disable_central_logging();
				}

			}

			return apply_filters( 'mycred_save_network_prefs', $new_settings, $settings, $this->core );

		}

		/**
		 * Enable Master Template
		 * @since 1.7.6
		 * @version 1.0
		 */
		protected function enable_master_template() {

			do_action( 'mycred_master_template_enabled' );

		}

		/**
		 * Disable Master Template
		 * @since 1.7.6
		 * @version 1.0
		 */
		protected function disable_master_template() {

			do_action( 'mycred_master_template_disabled' );

		}

		/**
		 * Enable Central Logging
		 * @since 1.7.6
		 * @version 1.0
		 */
		protected function enable_central_logging() {

			do_action( 'mycred_central_logging_enabled' );

		}

		/**
		 * Disable Central Logging
		 * @since 1.7.6
		 * @version 1.0
		 */
		protected function disable_central_logging() {

			do_action( 'mycred_central_logging_disabled' );

		}

	}
endif;
