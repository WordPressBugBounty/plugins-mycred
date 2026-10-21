<?php
if ( ! defined( 'myCRED_VERSION' ) ) exit;

define( 'myCRED_Settings',              __FILE__ );

define( 'myCRED_Settings_VERSION',      '1.3' );

/**
 * myCRED_Settings_Module class
 * @since 0.1
 * @version 1.5
 */
if ( ! class_exists( 'myCRED_Settings_Module' ) ) :
	class myCRED_Settings_Module extends myCRED_Module {

		/**
		 * Construct
		 */
		public function __construct( $type = MYCRED_DEFAULT_TYPE_KEY ) {

			parent::__construct( 'myCRED_Settings_Module', array(
				'module_name' => 'general',
				'option_id'   => 'mycred_pref_core',
				'labels'      => array(
					'menu'        => __( 'Settings', 'mycred' ),
					'page_title'  => __( 'Settings', 'mycred' ),
					'page_header' => __( 'Settings', 'mycred' )
				),
				'screen_id'   => MYCRED_SLUG . '-settings',
				'accordion'   => true,
				'menu_pos'    => 100
			), $type );

		}

		/**
		 * Init
		 * @since 1.7
		 * @version 1.0
		 */
		public function module_init() {

			// Delete users log entries when the user is deleted
			if ( isset( $this->core->delete_user ) && $this->core->delete_user )
				add_action( 'delete_user', array( $this, 'action_delete_users_log_entries' ) );

			add_action( 'wp_ajax_mycred-action-empty-log',       array( $this, 'action_empty_log' ) );
			add_action( 'wp_ajax_mycred-action-reset-accounts',  array( $this, 'action_reset_balance' ) );
			add_action( 'wp_ajax_mycred-action-export-balances', array( $this, 'action_export_balances' ) );
			add_action( 'wp_ajax_mycred-action-generate-key',    array( $this, 'action_generate_key' ) );
			add_action( 'wp_ajax_mycred-action-max-decimals',    array( $this, 'action_update_log_cred_format' ) );
			add_action( 'wp_ajax_mycred-get-users-to-exclude',   array( $this, 'get_users' ) );
			add_action( 'wp_ajax_mycred-action-add-point-type',  array( $this, 'action_add_point_type' ) );
			add_action( 'wp_ajax_mycred-action-delete-point-type', array( $this, 'action_delete_point_type' ) );
			add_action( 'wp_ajax_mycred-action-update-point-type-label', array( $this, 'action_update_point_type_label' ) );

            // React UI AJAX Save Handler
            add_action( 'wp_ajax_mycred-save-core-settings',    array( $this, 'ajax_save_core_settings' ) );

		}

		/**
		 * React AJAX Save Core Settings
		 */
		public function ajax_save_core_settings() {
			if ( ! check_ajax_referer( 'wp_rest', 'nonce', false ) ) {
                wp_send_json_error( 'Invalid security token.' );
            }

			if ( ! $this->core->user_is_point_admin() ) {
				wp_send_json_error( 'Access Denied' );
            }

            $raw_data = isset( $_POST['mycred_pref_core'] ) ? wp_unslash( $_POST['mycred_pref_core'] ) : array();
            
            // To mimic the native options.php post payload, we run it directly through the class's own sanitization hook
            $clean_data = $this->sanitize_settings( $raw_data );
            
            // Merge with existing core settings so we don't wipe things out
            $updated_core = wp_parse_args( $clean_data, $this->core->core );
            
            // Save it
            mycred_update_option( 'mycred_pref_core', $updated_core );

			wp_send_json_success( array( 'message' => esc_html__( 'Settings successfully updated.', 'mycred' ), 'data' => $updated_core ) );
		}

		/**
		 * Admin Init
		 * @since 1.3
		 * @version 1.0.1
		 */
		public function module_admin_init() {
			
			if ( isset( $_GET['do'] ) && $_GET['do'] == 'export' )
				$this->load_export();

		}

		/**
		 * Empty Log Action
		 * @since 1.3
		 * @version 1.4
		 */
		public function action_empty_log() {

			// Security
			check_ajax_referer( 'mycred-management-actions', 'token' );

			// Access
			if ( ! is_user_logged_in() || ! $this->core->user_is_point_admin() )
				wp_send_json_error( 'Access denied' );

			// Type
			if ( ! isset( $_POST['type'] ) )
				wp_send_json_error( 'Missing point type' );

			$type = sanitize_key( $_POST['type'] );

			global $wpdb, $mycred_log_table;

			// If we only have one point type we truncate the log
			if ( count( $this->point_types ) == 1 && $type == MYCRED_DEFAULT_TYPE_KEY )
				$wpdb->query( "TRUNCATE TABLE {$mycred_log_table};" );

			// Else we want to delete the selected point types only
			else
				$wpdb->delete(
					$mycred_log_table,
					array( 'ctype' => $type ),
					array( '%s' )
				);

			// Count results
			$total_rows = $wpdb->get_var( "SELECT COUNT(*) FROM {$mycred_log_table} WHERE ctype = '{$type}';" );
			$wpdb->flush();

			// Response
			wp_send_json_success( $total_rows );

		}

		/**
		 * Render Point Types List Rows
		 * @since 2.9
		 * @version 1.0
		 */
		public function render_point_types_list( $point_types = null ) {

			if ( $point_types === null ) {
				$point_types = $this->point_types;
			}

			if ( empty( $point_types ) || ! is_array( $point_types ) ) {
				return;
			}

			?>
			<div class="mycred-point-types-table">
				<div class="mycred-point-types-table-head">
					<div class="mycred-point-types-col meta"><?php esc_html_e( 'Meta Key', 'mycred' ); ?></div>
					<div class="mycred-point-types-col label"><?php esc_html_e( 'Label', 'mycred' ); ?></div>
					<div class="mycred-point-types-col actions"><?php esc_html_e( 'Actions', 'mycred' ); ?></div>
				</div>
				<div class="mycred-point-types-table-body">
			<?php

			foreach ( $point_types as $type => $label ) {

				$type  = sanitize_key( $type );
				$label = strip_tags( $label );

				if ( $type === MYCRED_DEFAULT_TYPE_KEY ) {
					?>
					<div class="mycred-point-type-row is-default">
						<div class="mycred-point-types-col meta">
							<input type="text" disabled="disabled" readonly="readonly" class="form-control mycred-point-type-locked" value="<?php echo esc_attr( $type ); ?>" />
						</div>
						<div class="mycred-point-types-col label">
							<input type="text" disabled="disabled" readonly="readonly" class="form-control mycred-point-type-locked" value="<?php echo esc_attr( $label ); ?>" />
						</div>
						<div class="mycred-point-types-col actions">
							<span class="mycred-point-type-badge"><?php esc_html_e( 'Default', 'mycred' ); ?></span>
						</div>
					</div>
					<?php
					continue;
				}

				$settings_url = $this->get_point_type_settings_url( $type );

				?>
				<div class="mycred-point-type-row" data-point-type="<?php echo esc_attr( $type ); ?>">
					<div class="mycred-point-types-col meta">
						<input type="text" name="mycred_pref_core[types][<?php echo esc_attr( $type ); ?>][key]" value="<?php echo esc_attr( $type ); ?>" class="form-control mycred-point-type-locked" readonly="readonly" />
					</div>
					<div class="mycred-point-types-col label">
						<input type="text" name="mycred_pref_core[types][<?php echo esc_attr( $type ); ?>][label]" value="<?php echo esc_attr( $label ); ?>" class="form-control mycred-point-type-label" data-type="<?php echo esc_attr( $type ); ?>" data-original="<?php echo esc_attr( $label ); ?>" />
					</div>
					<div class="mycred-point-types-col actions">
						<div class="mycred-point-type-action-buttons">
							<a class="button mycred-point-type-settings-btn" href="<?php echo esc_url( $settings_url ); ?>"><?php esc_html_e( 'Open settings', 'mycred' ); ?></a>
							<button type="button" class="button button-link-delete mycred-delete-point-type" data-type="<?php echo esc_attr( $type ); ?>"><?php esc_html_e( 'Delete', 'mycred' ); ?></button>
						</div>
					</div>
				</div>
				<?php

			}

			?>
				</div>
			</div>
			<?php

		}

		/**
		 * Settings admin URL for a custom point type.
		 * @since 2.9
		 * @version 1.0
		 */
		public function get_point_type_settings_url( $type ) {

			$type = sanitize_key( $type );
			if ( $type === '' || $type === MYCRED_DEFAULT_TYPE_KEY ) {
				return admin_url( 'admin.php?page=' . MYCRED_MAIN_SLUG );
			}

			return admin_url( 'admin.php?page=mycred_' . $type . '-settings' );

		}

		/**
		 * Refresh in-memory point types after add/delete.
		 * @since 2.9
		 * @version 1.0
		 */
		protected function refresh_point_types_registry( $types ) {

			global $mycred_types;

			$mycred_types      = $types;
			$this->point_types = $types;

		}

		/**
		 * Add Point Type AJAX Action
		 * @since 2.9
		 * @version 1.0
		 */
		public function action_add_point_type() {

			check_ajax_referer( 'mycred-management-actions', 'token' );

			if ( ! is_user_logged_in() || ! $this->core->user_is_point_admin() ) {
				wp_send_json_error( __( 'Access denied', 'mycred' ) );
			}

			if ( $this->mycred_type !== MYCRED_DEFAULT_TYPE_KEY ) {
				wp_send_json_error( __( 'Point types can only be managed from the default type settings.', 'mycred' ) );
			}

			$key      = isset( $_POST['key'] ) ? sanitize_text_field( wp_unslash( $_POST['key'] ) ) : '';
			$singular = isset( $_POST['singular'] ) ? sanitize_text_field( wp_unslash( $_POST['singular'] ) ) : '';
			$plural   = isset( $_POST['plural'] ) ? sanitize_text_field( wp_unslash( $_POST['plural'] ) ) : '';

			$missing_labels = array();
			if ( $key === '' ) {
				$missing_labels[] = __( 'Meta key', 'mycred' );
			}
			if ( $singular === '' ) {
				$missing_labels[] = __( 'Singular', 'mycred' );
			}
			if ( $plural === '' ) {
				$missing_labels[] = __( 'Plural', 'mycred' );
			}
			if ( ! empty( $missing_labels ) ) {
				if ( count( $missing_labels ) === 1 ) {
					wp_send_json_error( sprintf(
						/* translators: %s: missing field label. */
						__( '%s is required.', 'mycred' ),
						$missing_labels[0]
					) );
				}
				if ( count( $missing_labels ) === 2 ) {
					$missing_list = sprintf(
						/* translators: 1: first missing field, 2: second missing field. */
						__( '%1$s and %2$s', 'mycred' ),
						$missing_labels[0],
						$missing_labels[1]
					);
				} else {
					$last_label   = array_pop( $missing_labels );
					$missing_list = sprintf(
						/* translators: 1: comma-separated missing fields, 2: last missing field. */
						__( '%1$s, and %2$s', 'mycred' ),
						implode( ', ', $missing_labels ),
						$last_label
					);
				}
				wp_send_json_error( sprintf(
					/* translators: %s: missing field labels. */
					__( '%s are required.', 'mycred' ),
					$missing_list
				) );
			}

			$key = str_replace( array( ' ', '-' ), '_', $key );
			$key = sanitize_key( $key );

			if ( $key === '' || ! preg_match( '/^[a-z_]+$/', $key ) ) {
				wp_send_json_error( __( 'Meta key must be lowercase letters and underscores only.', 'mycred' ) );
			}

			if ( $key === MYCRED_DEFAULT_TYPE_KEY ) {
				wp_send_json_error( __( 'The default point type key cannot be used for a new point type.', 'mycred' ) );
			}

			$types = mycred_get_option( 'mycred_types', array( MYCRED_DEFAULT_TYPE_KEY => mycred_label() ) );
			if ( ! is_array( $types ) ) {
				$types = array( MYCRED_DEFAULT_TYPE_KEY => mycred_label() );
			}

			if ( array_key_exists( $key, $types ) ) {
				wp_send_json_error( __( 'A point type with this key already exists.', 'mycred' ) );
			}

			$type_settings = mycred_get_option( 'mycred_pref_core_' . $key );
			if ( ! empty( $type_settings ) ) {
				wp_send_json_error( __( 'A point type with this key already exists.', 'mycred' ) );
			}

			$mycred            = mycred();
			$new_type_defaults = $mycred->defaults();
			$new_type_defaults['cred_id']          = $key;
			$new_type_defaults['name']['singular'] = $singular;
			$new_type_defaults['name']['plural']   = $plural;

			mycred_update_option( 'mycred_pref_core_' . $key, $new_type_defaults );

			$types[ $key ] = $plural;
			mycred_update_option( 'mycred_types', $types );
			$this->refresh_point_types_registry( $types );

			if ( function_exists( 'mycred_upload_default_point_image' ) ) {
				mycred_upload_default_point_image();
			}

			ob_start();
			$this->render_point_types_list( $types );
			$html = ob_get_clean();

			wp_send_json_success( array(
				'message' => __( 'Point type added successfully.', 'mycred' ),
				'html'    => $html,
				'key'     => $key,
				'url'     => $this->get_point_type_settings_url( $key ),
				'label'   => $plural,
			) );

		}

		/**
		 * Delete Point Type AJAX Action
		 * @since 2.9
		 * @version 1.0
		 */
		public function action_delete_point_type() {

			check_ajax_referer( 'mycred-management-actions', 'token' );

			if ( ! is_user_logged_in() || ! $this->core->user_is_point_admin() ) {
				wp_send_json_error( __( 'Access denied', 'mycred' ) );
			}

			if ( $this->mycred_type !== MYCRED_DEFAULT_TYPE_KEY ) {
				wp_send_json_error( __( 'Point types can only be managed from the default type settings.', 'mycred' ) );
			}

			$type = isset( $_POST['type'] ) ? sanitize_key( wp_unslash( $_POST['type'] ) ) : '';

			if ( $type === '' ) {
				wp_send_json_error( __( 'Missing point type', 'mycred' ) );
			}

			if ( $type === MYCRED_DEFAULT_TYPE_KEY ) {
				wp_send_json_error( __( 'The default point type cannot be deleted.', 'mycred' ) );
			}

			$types = mycred_get_option( 'mycred_types', array( MYCRED_DEFAULT_TYPE_KEY => mycred_label() ) );
			if ( ! is_array( $types ) || ! array_key_exists( $type, $types ) ) {
				wp_send_json_error( __( 'Point type not found.', 'mycred' ) );
			}

			do_action( 'mycred_delete_point_type', $type );
			do_action( 'mycred_delete_point_type_' . $type );

			unset( $types[ $type ] );
			mycred_update_option( 'mycred_types', $types );
			$this->refresh_point_types_registry( $types );

			ob_start();
			$this->render_point_types_list( $types );
			$html = ob_get_clean();

			wp_send_json_success( array(
				'message' => __( 'Point type deleted successfully.', 'mycred' ),
				'html'    => $html,
				'key'     => $type,
			) );

		}

		/**
		 * Update Point Type Label AJAX Action
		 * @since 2.9
		 * @version 1.0
		 */
		public function action_update_point_type_label() {

			check_ajax_referer( 'mycred-management-actions', 'token' );

			if ( ! is_user_logged_in() || ! $this->core->user_is_point_admin() ) {
				wp_send_json_error( __( 'Access denied', 'mycred' ) );
			}

			if ( $this->mycred_type !== MYCRED_DEFAULT_TYPE_KEY ) {
				wp_send_json_error( __( 'Point types can only be managed from the default type settings.', 'mycred' ) );
			}

			$type  = isset( $_POST['type'] ) ? sanitize_key( wp_unslash( $_POST['type'] ) ) : '';
			$label = isset( $_POST['label'] ) ? sanitize_text_field( wp_unslash( $_POST['label'] ) ) : '';

			if ( $type === '' || $type === MYCRED_DEFAULT_TYPE_KEY ) {
				wp_send_json_error( __( 'Invalid point type.', 'mycred' ) );
			}

			if ( $label === '' ) {
				wp_send_json_error( __( 'Label cannot be empty.', 'mycred' ) );
			}

			$types = mycred_get_option( 'mycred_types', array( MYCRED_DEFAULT_TYPE_KEY => mycred_label() ) );
			if ( ! is_array( $types ) || ! array_key_exists( $type, $types ) ) {
				wp_send_json_error( __( 'Point type not found.', 'mycred' ) );
			}

			$types[ $type ] = $label;
			mycred_update_option( 'mycred_types', $types );
			$this->refresh_point_types_registry( $types );

			$type_settings = mycred_get_option( 'mycred_pref_core_' . $type );
			if ( is_array( $type_settings ) ) {
				if ( ! isset( $type_settings['name'] ) || ! is_array( $type_settings['name'] ) ) {
					$type_settings['name'] = array();
				}
				$type_settings['name']['plural'] = $label;
				mycred_update_option( 'mycred_pref_core_' . $type, $type_settings );
			}

			wp_send_json_success( array(
				'message' => __( 'Label updated successfully.', 'mycred' ),
				'label'   => $label,
				'key'     => $type,
			) );

		}

		/**
		 * Reset All Balances Action
		 * @since 1.3
		 * @version 1.4.1
		 */
		public function action_reset_balance() {

			// Type
			if ( ! isset( $_POST['type'] ) )
				wp_send_json_error( 'Missing point type' );

			$type = sanitize_key( $_POST['type'] );
			if ( $type != $this->mycred_type ) return;

			// Security
			check_ajax_referer( 'mycred-management-actions', 'token' );

			// Access
			if ( ! is_user_logged_in() || ! $this->core->user_is_point_admin() )
				wp_send_json_error( 'Access denied' );

			global $wpdb;

			$wpdb->delete(
				$wpdb->usermeta,
				array( 'meta_key' => mycred_get_meta_key( $type, '' ) ),
				array( '%s' )
			);

			$wpdb->delete(
				$wpdb->usermeta,
				array( 'meta_key' => mycred_get_meta_key( $type, '_total' ) ),
				array( '%s' )
			);

			do_action( 'mycred_zero_balances', $type );

			// Response
			wp_send_json_success( __( 'Accounts successfully reset', 'mycred' ) );

		}

		/**
		 * Export User Balances
		 * @filter mycred_export_raw
		 * @since 1.3
		 * @version 1.2
		 */
		public function action_export_balances() {

			// Security
			check_ajax_referer( 'mycred-management-actions', 'token' );

			global $wpdb;

			// Log Template
			$log  = isset( $_POST['log_temp'] ) ? sanitize_text_field( wp_unslash( $_POST['log_temp'] ) ) : '';

			// Type
			if ( ! isset( $_POST['type'] ) )
				wp_send_json_error( 'Missing point type' );

			$type = isset( $_POST['type'] ) ? sanitize_text_field( wp_unslash( $_POST['type'] ) ) : '';

			$identify = isset( $_POST['identify'] ) ? sanitize_text_field( wp_unslash( $_POST['identify'] ) ) : 'ID';

			// Identify users by
			switch ( $identify ) {

				case 'ID' :

					$SQL = "SELECT user_id AS user, meta_value AS balance FROM {$wpdb->usermeta} WHERE meta_key = %s;";

				break;

				case 'email' :

					$SQL = "SELECT user_email AS user, meta_value AS balance FROM {$wpdb->usermeta} LEFT JOIN {$wpdb->users} ON {$wpdb->usermeta}.user_id = {$wpdb->users}.ID WHERE {$wpdb->usermeta}.meta_key = %s;";

				break;

				case 'login' :

					$SQL = "SELECT user_login AS user, meta_value AS balance FROM {$wpdb->usermeta} LEFT JOIN {$wpdb->users} ON {$wpdb->usermeta}.user_id = {$wpdb->users}.ID WHERE {$wpdb->usermeta}.meta_key = %s;";

				break;

			}

			$query = $wpdb->get_results( $wpdb->prepare( $SQL, $type ) );

			if ( empty( $query ) )
				wp_send_json_error( __( 'No users found to export', 'mycred' ) );

			$array = array();
			foreach ( $query as $result ) {
				$data = array(
					'mycred_user'   => $result->user,
					'mycred_amount' => $this->core->number( $result->balance ),
					'mycred_ctype'  => $type
				);

				if ( ! empty( $log ) )
					$data = array_merge_recursive( $data, array( 'mycred_log' => $log ) );

				$array[] = $data;
			}

			set_transient( 'mycred-export-raw', apply_filters( 'mycred_export_raw', $array ), 3000 );

			// Response
			wp_send_json_success( admin_url( 'admin.php?page=' . MYCRED_SLUG . '-settings&do=export' ) );

		}

		/**
		 * Generate Key Action
		 * @since 1.3
		 * @version 1.1
		 */
		public function action_generate_key() {

			// Security
			check_ajax_referer( 'mycred-management-actions', 'token' );

			// Response
			wp_send_json_success( wp_generate_password( 16, true, true ) );

		}

		/**
         * Get Point Image
         * @since 2.2
         * @version 1.0
         */
        public function get_point_image( $attachment_id, $point_type_field ) {

            $image = false;

            if ( $attachment_id > 0 ) {

                $_image = wp_get_attachment_url( $attachment_id );
		
                if ( strlen( $_image ) > 5 )
				{
					$image = "<img src='$_image' alt='Point Type image' /><input type='hidden' name='$point_type_field' value='{$attachment_id}' />";
				}

            }

            return $image;

        }

		/**
		 * Update Log Cred Format Action
		 * Will attempt to modify the myCRED log's cred column format.
		 * @since 1.6
		 * @version 1.0.1
		 */
		public function action_update_log_cred_format() {

			// Security
			check_ajax_referer( 'mycred-management-actions', 'token' );

			if ( ! isset( $_POST['decimals'] ) || $_POST['decimals'] == '' || $_POST['decimals'] > 20 )
				wp_send_json_error( __( 'Invalid decimal value.', 'mycred' ) );

			if ( ! $this->is_main_type )
				wp_send_json_error( 'Invalid Use' );

			$decimals = absint( $_POST['decimals'] );

			global $wpdb, $mycred_log_table;

			if ( $decimals > 0 ) {
				$format = 'decimal';
				if ( $decimals > 4 )
					$cred_format = "decimal(32,$decimals)";
				else
					$cred_format = "decimal(22,$decimals)";
			}
			else {
				$format      = 'bigint';
				$cred_format = 'bigint(22)';
			}

			// Alter table
			$results = $wpdb->query( "ALTER TABLE {$mycred_log_table} MODIFY creds {$cred_format} DEFAULT NULL;" );

			// If we selected no decimals and we have multiple point types, we need to update
			// their settings to also use no decimals.
			if ( $decimals == 0 && count( $this->point_types ) > 1 ) {
				foreach ( $this->point_types as $type_id => $label ) {

					$new_type_core = mycred_get_option( 'mycred_pref_core_' . $type_id );
					if ( ! isset( $new_type_core['format']['decimals'] ) ) continue;

					$new_type_core['format']['type']     = $format;
					$new_type_core['format']['decimals'] = 0;
					mycred_update_option( 'mycred_pref_core_' . $type_id, $new_type_core );

				}
			}

			// Save settings
			$new_core                       = $this->core->core;
			$new_core['format']['type']     = $format;
			$new_core['format']['decimals'] = $decimals;
			mycred_update_option( 'mycred_pref_core', $new_core );

			// Send the good news
			wp_send_json_success( array(
				'url'   => esc_url( add_query_arg( array( 'page' => MYCRED_SLUG . '-settings', 'open-tab' => 0 ), admin_url( 'admin.php' ) ) ),
				'label' => __( 'Log Updated', 'mycred' )
			) );

		}

		/**
		 * Load Export
		 * Creates a CSV export file of the 'mycred-export-raw' transient.
		 * @since 1.3
		 * @version 1.1
		 */
		public function load_export() {

			// Security
			if ( $this->core->user_is_point_editor() ) {

				$export = get_transient( 'mycred-export-raw' );
				if ( $export === false ) return;

				if ( isset( $export[0]['mycred_log'] ) )
					$headers = array( 'mycred_user', 'mycred_amount', 'mycred_ctype', 'mycred_log' );
				else
					$headers = array( 'mycred_user', 'mycred_amount', 'mycred_ctype' );	

				require_once myCRED_ASSETS_DIR . 'libs/parsecsv.lib.php';
				$csv = new parseCSV();

				delete_transient( 'mycred-export-raw' );
				$csv->output( true, 'mycred-balance-export.csv', $export, $headers );

				die;

			}

		}

		/**
		 * Delete Users Log Entries
		 * Will remove a given users log entries.
		 * @since 1.4
		 * @version 1.1
		 */
		public function action_delete_users_log_entries( $user_id ) {

			global $wpdb, $mycred_log_table;

			$wpdb->delete(
				$mycred_log_table,
				array( 'user_id' => $user_id, 'ctype' => $this->mycred_type ),
				array( '%d', '%s' )
			);

		}

		/**
		 * Scripts & Styles
		 * @since 1.7
		 * @version 1.1
		 */
		public function scripts_and_styles() {


			wp_enqueue_media();

                $screen = get_current_screen();

                // Main settings render on mycred-main; legacy submenu uses mycred-settings.
                $is_general_settings_screen = false;
                $is_settings_screen         = false;
                $current_page               = isset( $_GET['page'] ) ? sanitize_key( wp_unslash( $_GET['page'] ) ) : '';
                if ( $screen ) {
                    $is_general_settings_screen = (
                        $screen->base === 'toplevel_page_' . MYCRED_MAIN_SLUG
                        || $screen->id === 'toplevel_page_' . MYCRED_MAIN_SLUG
                    );
                    $is_settings_screen = (
                        $current_page === $this->screen_id
                        || $screen->id === $this->screen_id
                        || ( $is_general_settings_screen && $this->is_main_type )
                    );
                }

                if ( $is_settings_screen ) {
                    wp_enqueue_editor();
                }
            
            // Enqueue the new React settings app — only for this point type's settings page
            // so a later type cannot overwrite mycredSettingsData.pointTypeLabel.
            $script_url = plugins_url( 'assets/build/settings.bundle.js', myCRED_THIS );
            $script_path = myCRED_ROOT_DIR . 'assets/build/settings.bundle.js';
            if ( file_exists( $script_path ) && $is_settings_screen ) {
                $style_path = myCRED_ROOT_DIR . 'assets/build/settings.css';
                if ( file_exists( $style_path ) ) {
                    wp_enqueue_style(
                        'mycred-settings-react-app',
                        plugins_url( 'assets/build/settings.css', myCRED_THIS ),
                        array(),
                        myCRED_VERSION . '.' . filemtime( $style_path )
                    );
                } else {
                    wp_enqueue_style(
                        'mycred-settings-figtree',
                        'https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&display=swap',
                        array(),
                        null
                    );
                }

                wp_enqueue_script(
                    'mycred-settings-react-app',
                    $script_url,
                    array( 'wp-element', 'wp-editor', 'editor' ),
                    myCRED_VERSION . '.' . filemtime( $script_path ),
                    true
                );
                
                $plus_addon_upsells = array();
				if ( $is_general_settings_screen ) {
					$transfer_active = function_exists( 'mycred_child_addon_is_active' )
						? mycred_child_addon_is_active( 'transfer' )
						: ( function_exists( 'mycred_get_active_addon_slugs' ) && in_array( 'transfer', mycred_get_active_addon_slugs(), true ) );
					if ( $transfer_active && function_exists( 'mycred_build_plus_addon_upsell_tabs' ) ) {
						$plus_addon_upsells['transfer'] = mycred_build_plus_addon_upsell_tabs( 'transfer' );
					}
				}
               

                wp_localize_script( 'mycred-settings-react-app', 'mycredSettingsData', array(
                    'core'                      => $this->core->core,
                    'isMainType'                => $this->is_main_type,
                    'isGeneralSettingsScreen'   => $is_general_settings_screen,
                    'pointType'                 => $this->mycred_type,
                    'pointTypeLabel'            => $this->core->name['plural'],
                    'screenid'                  => $screen ? $screen->id : '',
                    'excludedUsers'             => $this->get_excluded_users(),
                    'nonce'                     => wp_create_nonce( 'wp_rest' ),
                    'isProActive'               => class_exists( 'MyCRED_Toolkit_Core_Pro' ) || ( function_exists('is_plugin_active') && is_plugin_active( 'mycred-toolkit-pro/mycred-toolkit-pro.php' ) ),
                    'proDemoUrl'                => 'https://mycred.me/pricing/?utm_source=plugin&utm_medium=settings_sidebar',
                    'proPromoImageUrl'          => plugins_url( 'assets/images/test.png', myCRED_THIS ),
                    'plus_addon_upsells'        => $plus_addon_upsells,
                ));
            }

			wp_register_script(
				'mycred-type-management',
				plugins_url( 'assets/js/mycred-type-management.js', myCRED_THIS ),
				array( 'jquery', 'jquery-ui-core', 'jquery-ui-dialog', 'jquery-effects-core', 'jquery-effects-slide' ),
				myCRED_VERSION . '.8'
			);

			wp_enqueue_style( MYCRED_SLUG . '-select2-style' );

			wp_enqueue_script( MYCRED_SLUG . '-select2-script' );

		}

	/**
	 * Settings Header
	 * Inserts the export styling
	 * @since 1.3
	 * @version 1.2.3
	 */
	public function settings_header() {

		// Add body class for settings pages
		add_filter( 'admin_body_class', array( $this, 'add_settings_body_class' ) );

		add_action( 'admin_head', function() {
			echo '<style>
				#screen-meta-links,
				.wrap h1,
				.wp-heading-inline,
				.mycred-ui-info-btn,
				.notice-info,
				.update-nag,
				#wpfooter,
				.page-title-action { display: none !important; }
				body.mycred-settings-page,
				body.mycred-settings-page #wpcontent,
				body.mycred-settings-page #wpbody,
				body.mycred-settings-page #wpbody-content,
				body.mycred-settings-page #wpfooter {
					background: #F8F6FF !important;
				}
				body.mycred-settings-page #wpbody-content { padding-bottom: 0; }
				body.mycred-settings-page #myCRED-wrap,
				body.mycred-settings-page.mycred-admin-page #myCRED-wrap,
				body.mycred-settings-page .wrap:not(#fs_connect) {
					background: transparent !important;
					padding: 0 !important;
					margin: 0 !important;
					box-shadow: none !important;
					border-radius: 0 !important;
					width: 100% !important;
					max-width: none !important;
					border: none !important;
				}
				body.mycred-settings-page #mycred-settings-ui-root {
					width: 100%;
					max-width: 100%;
					box-sizing: border-box;
					margin-left: -20px;
					margin-right: 20px;
					background: #F8F6FF;
					font-family: "Figtree", "Inter", sans-serif !important;
				}
				body.mycred-settings-page .mycred-page-header {
					background: #ffffff !important;
					position: relative;
					z-index: 10;
				}
			</style>';
		} );

		global $wp_filter, $mycred;

			// Allows to link to the settings page with a defined module to be opened
			// in the accordion. Request must be made under the "open-tab" key and should
			// be the module name in lowercase with the myCRED_ removed.
			$this->accordion_tabs = array( 'core' => 0, 'management' => 1, 'point-types' => 2, 'exports_module' => 3 );

			// Check if there are registered action hooks for mycred_after_core_prefs
			$count = 3;
			if ( isset( $wp_filter['mycred_after_core_prefs'] ) ) {

				// If remove access is enabled
				$settings = mycred_get_remote();
				if ( $settings['enabled'] )
					$this->accordion_tabs['remote'] = $count++;

				foreach ( $wp_filter['mycred_after_core_prefs'] as $priority ) {

					foreach ( $priority as $key => $data ) {

						if ( ! isset( $data['function'] ) ) continue;

						if ( ! is_array( $data['function'] ) )
							$this->accordion_tabs[ $data['function'] ] = $count++;

						else {

							foreach ( $data['function'] as $id => $object ) {

								if ( isset( $object->module_id ) ) {
									$module_id = str_replace( 'myCRED_', '', $object->module_id );
									$module_id = strtolower( $module_id );
									$this->accordion_tabs[ $module_id ] = $count++;
								}

							}

						}

					}

				}

			}

			// If the requested tab exists, localize the accordion script to open this tab.
			// For this to work, the variable "active" must be set to the position of the
			// tab starting with zero for "Core".
			if ( isset( $_REQUEST['open-tab'] ) && array_key_exists( sanitize_key( wp_unslash( $_REQUEST['open-tab'] ) ), $this->accordion_tabs ) )
				wp_localize_script( 'mycred-accordion', 'myCRED', array( 'active' => $this->accordion_tabs[ sanitize_key( wp_unslash( $_REQUEST['open-tab'] ) ) ] ) );

			wp_localize_script(
				'mycred-type-management',
				'myCREDmanage',
				array(
					'ajaxurl'       	 => admin_url( 'admin-ajax.php' ),
					'token'         	 => wp_create_nonce( 'mycred-management-actions' ),
					'cache'         	 => wp_create_nonce( 'mycred-clear-cache' ),
					'working'       	 => esc_attr__( 'Processing...', 'mycred' ),
					'confirm_log'        => esc_attr__( 'Warning! All entries in your log will be permanently removed! This can not be undone!', 'mycred' ),
					'confirm_clean' 	 => esc_attr__( 'All log entries belonging to deleted users will be permanently deleted! This can not be undone!', 'mycred' ),
					'confirm_reset' 	 => esc_attr__( 'Warning! All user balances will be set to zero! This can not be undone!', 'mycred' ),
					'confirm_delete_type'=> esc_attr__( 'Delete this point type? Related logs and data may be removed. This cannot be undone.', 'mycred' ),
					'add_type_missing'   => esc_attr__( 'Meta key, singular, and plural labels are required.', 'mycred' ),
					'add_type_invalid'   => esc_attr__( 'Meta key must be lowercase letters and underscores only.', 'mycred' ),
					'field_meta_key'     => esc_attr__( 'Meta key', 'mycred' ),
					'field_singular'     => esc_attr__( 'Singular', 'mycred' ),
					'field_plural'       => esc_attr__( 'Plural', 'mycred' ),
					'field_is_required'  => esc_attr__( '%s is required.', 'mycred' ),
					'fields_are_required'=> esc_attr__( '%s are required.', 'mycred' ),
					'field_and'          => esc_attr__( '%1$s and %2$s', 'mycred' ),
					'field_and_more'     => esc_attr__( '%1$s, and %2$s', 'mycred' ),
					'label_empty'        => esc_attr__( 'Label cannot be empty.', 'mycred' ),
					'label_saved'        => esc_attr__( 'Label updated.', 'mycred' ),
					'open_settings'      => esc_attr__( 'Open settings', 'mycred' ),
					'added_go_settings'  => esc_attr__( 'Go to this point type settings', 'mycred' ),
					'imagelabel'   		 => esc_js( sprintf( '%s {{image}}', __( 'Level', 'mycred' ) ) ),
					'setImage'     		 => esc_js( __( 'Set Image', 'mycred' ) ),
					'set_featured_image' => __( 'Set Default Point Type image', 'mycred' ),
					'changeImage'        => esc_js( __( 'Change Image', 'mycred' ) ),
					'uploadImage'        => esc_js( __( 'Upload Image', 'mycred' ) ),
					'removeImage'        => esc_js( __( 'Remove', 'mycred' ) ),
					'uploadtitle'  		 => esc_js( esc_attr__( 'Point Type Image', 'mycred' ) ),
					'uploadbutton' 		 => esc_js( esc_attr__( 'Use as Image', 'mycred' ) ),
					'done'          	 => esc_attr__( 'Done!', 'mycred' ),
					'export_close'  	 => '✕',
					'export_title' 		 => $mycred->template_tags_general( esc_attr__( 'Export %singular% Balances', 'mycred' ) ),
					'decimals'      	 => esc_attr__( 'In order to adjust the number of decimal places you want to use we must update your log. It is highly recommended that you backup your current log before continuing!', 'mycred' ),
					'fieldName'		 	 => $this->field_name(),
					'excludedUsers'		 => $this->get_excluded_users()
					)
			);
			wp_enqueue_script( 'mycred-type-management' );
			wp_enqueue_style( 'mycred-bootstrap-grid' );

			wp_enqueue_style( 'wp-color-picker' );
			wp_enqueue_script( 'wp-color-picker' );

		}

		/**
		 * Adjust Decimal Places Settings
		 * @since 1.6
		 * @version 1.0.2
		 */
		public function adjust_decimal_places() {

			// Main point type = allow db adjustment
			if ( $this->is_main_type ) {

?>
<div><input type="number" min="0" max="20" id="mycred-adjust-decimal-places" class="form-control" value="<?php echo esc_attr( $this->core->format['decimals'] ); ?>" data-org="<?php echo esc_attr( $this->core->format['decimals'] ); ?>" size="8" /> <input type="button" style="display:none;" id="mycred-update-log-decimals" class="button button-primary button-large" value="<?php esc_attr_e( 'Update Database', 'mycred' ); ?>" /></div>
<?php

			}
			// Other point type.
			else {

				$default = mycred();
				if ( $default->format['decimals'] == 0 ) {

?>
<div><?php esc_html_e( 'No decimals', 'mycred' ); ?></div>
<?php

				}
				else {

?>
<select name="<?php echo esc_attr( $this->field_name( array( 'format' => 'decimals' ) ) ); ?>" id="<?php echo esc_attr( $this->field_id( array( 'format' => 'decimals' ) ) ); ?>" class="form-control">
<?php

					echo '<option value="0"';
					if ( $this->core->format['decimals'] == 0 ) echo ' selected="selected"';
					echo '>' . esc_html__( 'No decimals', 'mycred' ) . '</option>';

					for ( $i = 1 ; $i <= $default->format['decimals'] ; $i ++ ) {
						echo '<option value="' . esc_attr( $i ) . '"';
						if ( $this->core->format['decimals'] == $i ) echo ' selected="selected"';
						echo '>' . esc_html( $i ) . ' - 0.' . esc_html( str_pad( '0', $i, '0' ) ) . '</option>';
					}

					$url = add_query_arg( array( 'page' => MYCRED_SLUG . '-settings', 'open-tab' => 0 ), admin_url( 'admin.php' ) );

?>
</select>
<p><span class="description"><a href="<?php echo esc_url( $url ); ?>"><?php esc_html_e( 'Click here', 'mycred'); ?></a><?php esc_html_e( ' to change your default point types setup.', 'mycred' ); ?></span></p>
<?php

				}

			}

		}

		/**
		 * Admin Page
		 * @since 0.1
		 * @since 2.3 Added select2, Exclude User by ID and Role 
		 * @version 1.6
		 */
		public function admin_page() {

			// Security
			if ( ! $this->core->user_is_point_admin() ) wp_die( 'Access Denied' );

			// General Settings
			$general     = $this->general;
			$action_hook = ( ! $this->is_main_type ) ? $this->mycred_type : '';
			$delete_user = ( isset( $this->core->delete_user ) ) ? $this->core->delete_user : 0;
			$admin_log_entries = ( isset( $this->core->admin_log_entries ) ) ? $this->core->admin_log_entries : 0;
			$main_screen = ( get_current_screen()->base == 'toplevel_page_mycred-main' );

			// Social Media Links
			$social      = array();
			$social[]    = '<a href="https://www.facebook.com/myCRED" class="facebook" target="_blank">Facebook</a>';
			$social[]    = '<a href="https://plus.google.com/+MycredMe/posts" class="googleplus" target="_blank">Google+</a>';
			$social[]    = '<a href="https://twitter.com/my_cred" class="twitter" target="_blank">Twitter</a>';
			
			// Exclude Users by ID
			$all_users = array();
			$excluded_ids = array();
			
			$excluded_ids_args = array(
				'name'		=>	$this->field_name( array( 'exclude' => 'list' ) ) . '[]',
				'id'		=>	$this->field_id( array( 'exclude' => 'list' ) ),
				'class'		=>	'form-control',
				'multiple'	=>	'multiple'
			);

			//Exclude Users by Role
			$excluded_roles = explode( ',', esc_attr( $this->core->exclude['by_roles'] ) );
			$wp_roles = wp_roles();
			$roles = array();
			foreach( $wp_roles->roles as $role => $name )
				$roles[$role] = $name['name'];
			$roles_args = array(
				'name'		=>	$this->field_name( array( 'exclude' => 'by_roles' ) ) . '[]',
				'id'		=>	$this->field_id( array( 'exclude' => 'by_roles' ) ),
				'class'		=>	'form-control',
				'multiple'	=>	'multiple'
			);

			$allowed_html = array(
				'select' => array(
					'name'  	=> array(),
					'id'		=> array(),
					'class'		=> array(),
					'style'		=> array(),
					'multiple'	=> array(),
				),
				'option' => array(
					'value'    => array(),
					'selected' => array()
				)
			);

?>

<?php mycred_render_admin_header(); ?>

<div class="wrap" id="myCRED-wrap" style="width: 100% !important; max-width: none !important; margin: 0 !important; padding: 0 !important; border-radius: 0 !important; background: transparent !important; box-shadow: none !important; border: none !important;">
	<hr class="wp-header-end" style="display: none;" />

	<?php $this->update_notice(); ?>

	<form method="post" action="options.php" class="form" name="mycred-core-settings-form" novalidate>

        <!-- React Mount Point -->
        <div id="mycred-settings-ui-root"></div>

        <div id="mycred-legacy-form-wrap" style="display:none;">

		<?php settings_fields( $this->settings_name ); ?>

		<div class="list-items expandable-li" id="accordion">
			<div class="mycred-ui-accordion" <?php echo !$main_screen ? '' : 'style="display:none"';?>>
				<div class="mycred-ui-accordion-header">
					<h4 class="mycred-ui-accordion-header-title">
						<span class="dashicons dashicons-admin-settings static mycred-ui-accordion-header-icon"></span>
						<label><?php esc_html_e( 'Core Settings', 'mycred' ); ?></label>
					</h4>
					<div class="mycred-ui-accordion-header-actions hide-if-no-js">
						<button type="button" aria-expanded="true">
							<span class="mycred-ui-toggle-indicator" aria-hidden="true"></span>
						</button>
					</div>
				</div>
				<div class="body mycred-ui-accordion-body" style="display:none;">

					<div class="row">
						<div class="col-lg-5 col-md-12 col-sm-12 col-xs-12">
							<h3><?php esc_html_e( 'Labels', 'mycred' ); ?></h3>
							<div class="row">
								<div class="col-lg-6 col-md-6 col-sm-6 col-xs-6">
									<div class="form-group">
										<label for="<?php echo esc_attr( $this->field_id( array( 'name' => 'singular' ) ) ); ?>"><?php esc_html_e( 'Singular', 'mycred' ); ?></label>
										<input type="text" name="<?php echo esc_attr( $this->field_name( array( 'name' => 'singular' ) ) ); ?>" id="<?php echo esc_attr( $this->field_id( array( 'name' => 'singular' ) ) ); ?>" class="form-control" placeholder="<?php esc_attr_e( 'Required', 'mycred' ); ?>" value="<?php echo esc_attr( $this->core->name['singular'] ); ?>" />
									</div>
								</div>
								<div class="col-lg-6 col-md-6 col-sm-6 col-xs-6">
									<div class="form-group">
										<label for="<?php echo esc_attr( $this->field_id( array( 'name' => 'plural' ) ) ); ?>"><?php esc_html_e( 'Plural', 'mycred' ); ?></label>
										<input type="text" name="<?php echo esc_attr( $this->field_name( array( 'name' => 'plural' ) ) ); ?>" id="<?php echo esc_attr( $this->field_id( array( 'name' => 'plural' ) ) ); ?>" class="form-control" placeholder="<?php esc_attr_e( 'Required', 'mycred' ); ?>" value="<?php echo esc_attr( $this->core->name['plural'] ); ?>" />
									</div>
								</div>
							</div>
							<div class="row">
								<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
									<p class="mt-0">
										<span class="description"><?php esc_html_e( 'These labels are used throughout the admin area and when presenting points to your users.', 'mycred' ); ?></span>
									</p>
								</div>
							</div>
						</div>	
						<div class="col-lg-7 col-md-12 col-sm-12 col-xs-12">
							<div class="row">
								<div class="col-lg-7 col-md-12 col-sm-12 col-xs-12">
									<h3><?php esc_html_e( 'Format', 'mycred' ); ?></h3>
									<div class="row">
										<div class="col-lg-3 col-md-3 col-sm-3 col-xs-3">
											<div class="form-group">
												<label for="<?php echo esc_attr( $this->field_id( 'before' ) ); ?>"><?php esc_html_e( 'Prefix', 'mycred' ); ?></label>
												<input type="text" name="<?php echo esc_attr( $this->field_name( 'before' ) ); ?>" id="<?php echo esc_attr( $this->field_id( 'before' ) ); ?>" class="form-control" value="<?php echo esc_attr( $this->core->before ); ?>" />
											</div>
										</div>
										<div class="col-lg-9 col-md-9 col-sm-9 col-xs-9">
											<div class="form-group">
												<label for="<?php echo esc_attr( $this->field_id( array( 'format' => 'separators' ) ) ); ?>-thousand"><?php esc_html_e( 'Separators', 'mycred' ); ?></label>
												<div class="form-inline">
													<label class="inline">1</label>
													<input type="text" name="<?php echo esc_attr( $this->field_name( array( 'format' => 'separators' ) ) ); ?>[thousand]" id="<?php echo esc_attr( $this->field_id( array( 'format' => 'separators' ) ) ); ?>-thousand" placeholder="," class="form-control" value="<?php echo esc_attr( $this->core->format['separators']['thousand'] ); ?>" /> 
													<label>000</label> 
													<input type="text" name="<?php echo esc_attr( $this->field_name( array( 'format' => 'separators' ) ) ); ?>[decimal]" id="<?php echo esc_attr( $this->field_id( array( 'format' => 'separators' ) ) ); ?>-decimal" placeholder="." class="form-control" size="2" value="<?php echo esc_attr( $this->core->format['separators']['decimal'] ); ?>" /> 
													<label>00</label>
												</div>
											</div>
										</div>
									</div>
								</div>
								<div class="col-lg-5 col-md-12 col-sm-12 col-xs-12">
									<h3>&nbsp;</h3>
									<div class="row">
										<div class="col-lg-8 col-md-8 col-sm-8 col-xs-8">
											<div class="form-group">
												<label for=""><?php esc_html_e( 'Decimals', 'mycred' ); ?></label>
												<?php $this->adjust_decimal_places(); ?>
											</div>
										</div>
										<div class="col-lg-4 col-md-4 col-sm-4 col-xs-4">
											<div class="form-group">
												<label for="<?php echo esc_attr( $this->field_id( 'after' ) ); ?>"><?php esc_html_e( 'Suffix', 'mycred' ); ?></label>
												<input type="text" name="<?php echo esc_attr( $this->field_name( 'after' ) ); ?>" id="<?php echo esc_attr( $this->field_id( 'after' ) ); ?>" class="form-control" value="<?php echo esc_attr( $this->core->after ); ?>" />
											</div>
										</div>
									</div>
								</div>
							</div>
							<div class="row">
								<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
									<p class="mt-0">
										<span class="description"><?php esc_html_e( 'Set decimals to zero if you prefer to use whole numbers.', 'mycred' ); ?>
										</span>
									</p>
									<?php if ( $this->is_main_type ) : ?>
									<p class="m-alert m-alert-info"><strong><?php esc_html_e( 'Tip', 'mycred' ); ?>:</strong> <?php esc_html_e( 'As this is your main point type, the value you select here will be the largest number of decimals your installation will support.', 'mycred' ); ?></span></p>
									<?php endif; ?>
								</div>
							</div>


						</div>					
						
					</div>
					
					<div class="row">
						<div class="col-lg-5 col-md-5 col-sm-5 col-xs-5">
							<h3><?php esc_html_e( 'Security', 'mycred' ); ?></h3>
							<div class="row">
								<div class="col-lg-6 col-md-6 col-sm-6 col-xs-6">
									<div class="form-group">
										<label for="<?php echo esc_attr( $this->field_id( array( 'caps' => 'creds' ) ) ); ?>"><?php esc_html_e( 'Point Editors', 'mycred' ); ?></label>
										<input type="text" name="<?php echo esc_attr( $this->field_name( array( 'caps' => 'creds' ) ) ); ?>" id="<?php echo esc_attr( $this->field_id( array( 'caps' => 'creds' ) ) ); ?>" class="form-control" placeholder="<?php esc_attr_e( 'Required', 'mycred' ); ?>" value="<?php echo esc_attr( $this->core->caps['creds'] ); ?>" />
										<p><span class="description"><?php esc_html_e( 'The capability of users who can edit balances.', 'mycred' ); ?></span></p>
									</div>
								</div>
								<div class="col-lg-6 col-md-6 col-sm-6 col-xs-6">
									<div class="form-group">
										<label for="<?php echo esc_attr( $this->field_id( array( 'caps' => 'plugin' ) ) ); ?>"><?php esc_html_e( 'Point Administrators', 'mycred' ); ?></label>
										<input type="text" name="<?php echo esc_attr( $this->field_name( array( 'caps' => 'plugin' ) ) ); ?>" id="<?php echo esc_attr( $this->field_id( array( 'caps' => 'plugin' ) ) ); ?>" class="form-control" placeholder="<?php esc_attr_e( 'Required', 'mycred' ); ?>" value="<?php echo esc_attr( $this->core->caps['plugin'] ); ?>" />
										<p><span class="description"><?php esc_html_e( 'The capability of users who can edit settings.', 'mycred' ); ?></span></p>
									</div>
								</div>
							</div>
						</div>
						<div class="col-lg-7 col-md-7 col-sm-7 col-xs-7">
							<h3>&nbsp;</h3>
							<div class="row">
								<div class="col-lg-3 col-md-3 col-sm-3 col-xs-3">
									<div class="form-group">
										<?php if ( ! isset( $this->core->max ) ) $this->core->max(); ?>
										<label for="<?php echo esc_attr( $this->field_id( 'max' ) ); ?>"><?php esc_html_e( 'Max. Amount', 'mycred' ); ?></label>
										<input type="text" name="<?php echo esc_attr( $this->field_name( 'max' ) ); ?>" id="<?php echo esc_attr( $this->field_id( 'max' ) ); ?>" class="form-control" value="<?php echo esc_attr( $this->core->max ); ?>" />
										<p><span class="description"><?php esc_html_e( 'The maximum amount allowed to be paid out in a single instance.', 'mycred' ); ?></span></p>
									</div>
								</div>
								<div class="col-lg-5 col-md-5 col-sm-5 col-xs-5">
									<div class="form-group">
										<label for="<?php echo esc_attr( $excluded_ids_args['id'] ); ?>"><?php esc_html_e( 'Exclude Users', 'mycred' ); ?></label>
										<?php echo wp_kses( mycred_create_select2( $all_users, $excluded_ids_args, $excluded_ids, '100%' ), $allowed_html ); ?>
									</div>
									<div class="form-group">
										<div class="checkbox">
											<label for="<?php echo esc_attr( $this->field_id( array( 'exclude' => 'cred_editors' ) ) ); ?>"><input type="checkbox" name="<?php echo esc_attr( $this->field_name( array( 'exclude' => 'cred_editors' ) ) ); ?>" id="<?php echo esc_attr( $this->field_id( array( 'exclude' => 'cred_editors' ) ) ); ?>"<?php checked( $this->core->exclude['cred_editors'], 1 ); ?> value="1" /> <?php esc_html_e( 'Exclude point editors', 'mycred' ); ?></label>
										</div>
										<div class="checkbox">
											<label for="<?php echo esc_attr( $this->field_id( array( 'exclude' => 'plugin_editors' ) ) ); ?>"><input type="checkbox" name="<?php echo esc_attr( $this->field_name( array( 'exclude' => 'plugin_editors' ) ) ); ?>" id="<?php echo esc_attr( $this->field_id( array( 'exclude' => 'plugin_editors' ) ) ); ?>"<?php checked( $this->core->exclude['plugin_editors'], 1 ); ?> value="1" /> <?php esc_html_e( 'Exclude point administrators', 'mycred' ); ?></label>
										</div>
									</div>
								</div>
								<div class="col-lg-4 col-md-4 col-sm-4 col-xs-4">
									<div class="form-group">
										<label for="<?php echo esc_attr( $roles_args['id'] ); ?>"><?php esc_html_e( 'Exclude by User Role', 'mycred' ); ?></label>
										<?php echo wp_kses( mycred_create_select2( $roles, $roles_args, $excluded_roles, '100%' ), $allowed_html ); ?>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div class="row mycred-image-level">
						<div class="col-lg-5 col-md-5 col-sm-5 col-xs-5">
							<div id="mycred-image-setup" class="default-image-wrapper">
								<h3><?php esc_html_e( 'Point Type Image', 'mycred' ); ?></h3>
								<div class="point-type-image">
									<div class="point-image-buttons">
										<button type="button" class="button button-secondary" id="point-type-change-default-image"><?php esc_html_e( 'Upload Image', 'mycred' ); ?></button>
										<button type="button" id="point-type-remove-image"><?php esc_html_e( 'Remove', 'mycred' ); ?></button>
									</div>
									<div class="point-type-image-wrapper image-wrapper">
									<?php
										$attachment_id = mycred_get_default_point_image_id();
										$image_url 	   = wp_get_attachment_url( $attachment_id );

										if( property_exists( $this->core, 'attachment_id' ) && $this->get_point_image( $this->core->attachment_id , $this->field_name( 'attachment_id' )) ) {
											echo wp_kses_post( $this->get_point_image( $this->core->attachment_id , $this->field_name( 'attachment_id' ) ) );
										}
										elseif( !$attachment_id ) { ?>
											<div class="default-image-wrapper image-wrapper empty dashicons"></div>
											<?php
										}
										else {
											echo "<img src='". esc_url( $image_url ) ."' />";
											echo "<input type='hidden' value='". esc_attr( $attachment_id ) ."' name='".esc_attr( $this->field_name( 'attachment_id' ) )."' />";
										} 
									?>
									</div>
								</div>
							</div>	
						</div>
						<div class="col-lg-7 col-md-7 col-sm-7 col-xs-7">
							<h3><?php esc_html_e( 'Other Settings', 'mycred' ); ?></h3>
							<div class="form-group">
								<label for="<?php echo esc_attr( $this->field_id( 'delete_user' ) ); ?>"><input type="checkbox" name="<?php echo esc_attr( $this->field_name( 'delete_user' ) ); ?>" id="<?php echo esc_attr( $this->field_id( 'delete_user' ) ); ?>" <?php checked( $delete_user, 1 ); ?> value="1" /> <?php esc_html_e( 'Delete log entries when user is deleted.', 'mycred' ); ?></label>
							</div>
							<div class="form-group">
								<label for="<?php echo esc_attr( $this->field_id( 'admin_log_entries' ) ); ?>"><input type="checkbox" name="<?php echo esc_attr( $this->field_name( 'admin_log_entries' ) ); ?>" id="<?php echo esc_attr( $this->field_id( 'admin_log_entries' ) ); ?>" <?php checked( $admin_log_entries, 1 ); ?> value="1" /> <?php esc_html_e( 'Log entries will be required when the admin manually adjusts.', 'mycred' ); ?></label>
							</div>
						</div>
						<div class="col-lg-6 col-md-6 col-sm-6 col-xs-6">
							<?php do_action( 'mycred_core_prefs' . $action_hook, $this ); ?>
						</div>
					</div>
				</div>
			</div>
<?php

			global $wpdb, $mycred_log_table;

			$total_rows  = $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM {$mycred_log_table} WHERE ctype = %s;", $this->mycred_type ) );
			$reset_block = false;

			if ( get_transient( 'mycred-accounts-reset' ) !== false )
				$reset_block = true;

?>
			<div class="mycred-ui-accordion" <?php echo !$main_screen ? '' : 'style="display:none"';?>>
				<div class="mycred-ui-accordion-header">
					<h4 class="mycred-ui-accordion-header-title">
						<span class="dashicons dashicons-dashboard static mycred-ui-accordion-header-icon"></span>
						<label><?php esc_html_e( 'Management', 'mycred' ); ?></label>
					</h4>
					<div class="mycred-ui-accordion-header-actions hide-if-no-js">
						<button type="button" aria-expanded="true">
							<span class="mycred-ui-toggle-indicator" aria-hidden="true"></span>
						</button>
					</div>
				</div>
				<div class="body mycred-ui-accordion-body" style="display:none;">

					<div class="row">
						<div class="col-lg-5 col-md-5 col-sm-5 col-xs-5">
							<div class="form-group">
								<label>Log Table</label>
								<h1><?php echo esc_attr( $mycred_log_table ); ?></h1>
							</div>
						</div>
						<div class="col-lg-3 col-md-3 col-sm-3 col-xs-3">
							<div class="form-group">
								<label><?php esc_html_e( 'Entries', 'mycred' ); ?></label>
								<h1><?php echo esc_html( $total_rows ); ?></h1>
							</div>
						</div>
						<div class="col-lg-4 col-md-4 col-sm-4 col-xs-4">
							<div class="form-group">
								<label><?php esc_html_e( 'Actions', 'mycred' ); ?></label>
								<div>
									<?php if ( ( ! mycred_centralize_log() ) || ( mycred_centralize_log() && $GLOBALS['blog_id'] == 1 ) ) : ?>
									<button type="button" id="mycred-manage-action-empty-log" data-type="<?php echo esc_attr( $this->mycred_type ); ?>" class="button button-large large <?php if ( $total_rows == 0 ) echo '"disabled="disabled'; else echo 'button-primary'; ?>"><?php esc_html_e( 'Empty Log', 'mycred' ); ?></button>
									<?php endif; ?>
								</div>
							</div>
						</div>
					</div>

					<div class="row">
						<div class="col-lg-5 col-md-5 col-sm-5 col-xs-5">
							<div class="form-group">
								<label><?php esc_html_e( 'Balance Meta Key', 'mycred' ); ?></label>
								<h1><?php echo esc_html( $this->core->cred_id ); ?></h1>
							</div>
						</div>
						<div class="col-lg-3 col-md-3 col-sm-3 col-xs-3">
							<div class="form-group">
								<label><?php esc_html_e( 'Users', 'mycred' ); ?></label>
								<h1><?php echo esc_html( $this->core->count_members() ); ?></h1>
							</div>
						</div>
						<div class="col-lg-4 col-md-4 col-sm-4 col-xs-4">
							<div class="form-group">
								<label><?php esc_html_e( 'Actions', 'mycred' ); ?></label>
								<div>
									<button type="button" id="mycred-manage-action-reset-accounts" data-type="<?php echo esc_attr( $this->mycred_type ); ?>" class="button button-large large <?php if ( $reset_block ) echo '" disabled="disabled'; else echo 'button-primary'; ?>"><?php esc_html_e( 'Set all to zero', 'mycred' ); ?></button> 
									<button type="button" id="mycred-export-users-points" data-type="<?php echo esc_attr( $this->mycred_type ); ?>" class="button button-large large"><?php esc_html_e( 'Export Balances', 'mycred' ); ?></button>
								</div>
							</div>
						</div>
					</div>

					<?php do_action( 'mycred_management_prefs' . $action_hook, $this ); ?>

				</div>
			</div>

			<?php do_action( 'mycred_after_management_prefs' . $action_hook, $this ); ?>

<?php

			if ( $main_screen ) :

?>
			<div class="mycred-ui-accordion">
				<div class="mycred-ui-accordion-header">
					<h4 class="mycred-ui-accordion-header-title">
						<span class="dashicons dashicons-star-filled static mycred-ui-accordion-header-icon"></span>
						<label><?php esc_html_e( 'Point Types', 'mycred' ); ?></label>
					</h4>
					<div class="mycred-ui-accordion-header-actions hide-if-no-js">
						<button type="button" aria-expanded="true">
							<span class="mycred-ui-toggle-indicator" aria-hidden="true"></span>
						</button>
					</div>
				</div>
				<div class="body mycred-ui-accordion-body" style="display:none;">
					<div id="mycred-point-types-list" class="mycred-point-types-list">
						<?php $this->render_point_types_list(); ?>
					</div>
					<h3><?php esc_html_e( 'Add New Type', 'mycred' ); ?></h3>
					<div class="row mycred-add-point-type-fields">
						<div class="col-lg-4 col-md-4 col-sm-4 col-xs-4">
							<div class="form-group">
								<label for="mycred-new-ctype-key-value"><?php esc_html_e( 'Meta Key', 'mycred' ); ?></label>
								<input type="text" id="mycred-new-ctype-key-value" placeholder="<?php esc_attr_e( 'Required', 'mycred' ); ?>" value="" class="form-control" autocomplete="off" />
							</div>
						</div>
						<div class="col-lg-4 col-md-4 col-sm-4 col-xs-4">
							<div class="form-group">
								<label for="mycred-new-ctype-key-singular"><?php esc_html_e( 'Singular', 'mycred' ); ?></label>
								<input type="text" id="mycred-new-ctype-key-singular" placeholder="<?php esc_attr_e( 'Required', 'mycred' ); ?>" value="" class="form-control" autocomplete="off" />
							</div>
						</div>
						<div class="col-lg-4 col-md-4 col-sm-4 col-xs-4">
							<div class="form-group">
								<label for="mycred-new-ctype-key-label"><?php esc_html_e( 'Plural', 'mycred' ); ?></label>
								<input type="text" id="mycred-new-ctype-key-label" placeholder="<?php esc_attr_e( 'Required', 'mycred' ); ?>" value="" class="form-control" autocomplete="off" />
							</div>
						</div>
					</div>
					<div id="mycred-ctype-warning" class="mycred-settings-note">
						<span class="mycred-settings-note-icon" aria-hidden="true">
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M9 18h6" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
								<path d="M10 21h4" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
								<path d="M12 2a7 7 0 0 0-4 12.7V16a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-1.3A7 7 0 0 0 12 2Z" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"/>
								<path d="M12 2v1.5M8.2 3.8l1.1 1.1M15.8 3.8l-1.1 1.1" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
							</svg>
						</span>
						<p class="mycred-settings-note-text">
							<strong><?php esc_html_e( 'Note', 'mycred' ); ?></strong>
							<?php esc_html_e( 'This meta key must be in lowercase and only contain letters or underscore. All other characters will be deleted! make sure to add some unique prefix to this meta key to avoid any conflicts in database.', 'mycred' ); ?>
							<a href="https://codex.mycred.me/chapter-i/points/"><?php esc_html_e( 'Read More', 'mycred' ); ?></a>
						</p>
					</div>
					<p class="mycred-add-point-type-actions">
						<button type="button" id="mycred-add-point-type" class="button button-primary"><?php esc_html_e( 'Add Point Type', 'mycred' ); ?></button>
					</p>
				</div>
			</div>
<?php

			endif;

?>

			<div class="mycred-after-core-prefs" <?php echo $main_screen ? '' : 'style="display:none"';?> >
				<?php do_action( 'mycred_after_core_prefs' . $action_hook, $this ); ?>
			</div>

			<div class="mycred-type-prefs" <?php echo !$main_screen ? '' : 'style="display:none"';?>>
				<?php do_action( 'mycred_type_prefs' . $action_hook, $this ); ?>
			</div>

		</div>

		<?php submit_button( __( 'Update Settings', 'mycred' ), 'mycred-ui-mt20 mycred-ui-btn-purple', 'submit', false ); ?>

        </div> <!-- #mycred-legacy-form-wrap -->
	</form>

	<?php do_action( 'mycred_bottom_settings_page' . $action_hook, $this ); ?>

		</div>
	</div>

	<div id="export-points" style="display:none;">
		<div class="mycred-container">

			<div class="form mycred-metabox">
				<div class="row">
					<div class="col-lg-6 col-md-6 col-sm-6 col-xs-6">
						<div class="form-group">
							<label><?php esc_html_e( 'Identify users by', 'mycred' ); ?></label>
							<select id="mycred-export-identify-by" class="form-control">
<?php

			// Identify users by...
			$identify = apply_filters( 'mycred_export_by', array(
				'ID'    => __( 'User ID', 'mycred' ),
				'email' => __( 'User Email', 'mycred' ),
				'login' => __( 'User Login', 'mycred' )
			) );

			foreach ( $identify as $id => $label )
				echo '<option value="' . esc_attr( $id ) . '">' . esc_html( $label ) . '</option>';

?>
							</select>
							<span class="description"><?php esc_html_e( 'Use ID if you intend to use this export as a backup of your current site while Email is recommended if you want to export to a different site.', 'mycred' ); ?></span>
						</div>
					</div>
					<div class="col-lg-6 col-md-6 col-sm-6 col-xs-6">
						<div class="form-group">
							<label><?php esc_html_e( 'Import Log Entry', 'mycred' ); ?></label>
							<input type="text" id="mycred-export-log-template" value="" class="regular-text form-control" />
							<span class="description"><?php echo sprintf( esc_html__( 'Optional log entry to use if you intend to import this file in a different %s installation.', 'mycred' ), esc_html( mycred_label() ) ); ?></span>
						</div>
					</div>
				</div>	

				<div class="row last">
					<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12 text-right">
						<input type="button" id="mycred-run-exporter" value="<?php esc_attr_e( 'Export', 'mycred' ); ?>" data-type="<?php echo esc_attr( $this->mycred_type ); ?>" class="button button-large button-primary" />
					</div>
				</div>
			</div>

		</div>
	</div>



<div class="mycred-settings-sidebar" style="display:none;">
			<?php
			/**
			 * Filter to hide/show the pro banner in settings sidebar
			 */
			if ( ! is_plugin_active( 'mycred-toolkit-pro/mycred-toolkit-pro.php' ) ) :
			?>
			<div class="mycred-sidebar-widget mycred-promo-widget">
				<h3 class="mycred-sidebar-widget-title"><?php esc_html_e( '👑Unlock more with myCred Pro', 'mycred' ); ?></h3>
				<div class="mycred-sidebar-widget-content">
					<ul class="mycred-feature-list">
						<li><?php esc_html_e( '49+ Premium Addons', 'mycred' ); ?></li>
						<li><?php esc_html_e( 'Pro E-Commerce Integrations', 'mycred' ); ?></li>
						<li><?php esc_html_e( 'Points Purchasing Addons', 'mycred' ); ?></li>
						<li><?php esc_html_e( 'Points to cash withdraw addons', 'mycred' ); ?></li>
						<li><?php esc_html_e( 'Enhancement Addons', 'mycred' ); ?></li>
						<li><?php esc_html_e( 'Integration Addons', 'mycred' ); ?></li>
						<li><?php esc_html_e( 'Priority Technical Support', 'mycred' ); ?></li>
					</ul>
					<a href="https://mycred.me/pricing/?utm_source=plugin&utm_medium=settings_pro_banner" target="_blank" class="mycred-btn-yellow"><?php esc_html_e( 'UPGRADE NOW', 'mycred' ); ?></a>
				</div>
			</div>
			<?php endif; ?>

			<div class="mycred-sidebar-widget mycred-docs-widget">
				<h3 class="mycred-sidebar-widget-title">
					<span class="dashicons dashicons-book-alt"></span>
					<?php esc_html_e( 'Documentation', 'mycred' ); ?>
				</h3>
				<div class="mycred-sidebar-widget-content">
					<p><?php esc_html_e( 'View our comprehensive documentation to configure myCred smoothly.', 'mycred' ); ?></p>
					<a href="https://codex.mycred.me/?utm_source=plugin&utm_medium=settings_doc_btn" target="_blank" class="mycred-btn-blue"><?php esc_html_e( 'VIEW DOCUMENTATION', 'mycred' ); ?></a>
				</div>
			</div>

			<div class="mycred-sidebar-widget mycred-support-widget">
				<h3 class="mycred-sidebar-widget-title">
					<span class="dashicons dashicons-sos"></span>
					<?php esc_html_e( 'Need Help? We\'ve got your back!', 'mycred' ); ?>
				</h3>
				<div class="mycred-sidebar-widget-content">
					<p><?php esc_html_e( 'Our support team is available 24/7 to help you. If you need any assistance, just click the button below.', 'mycred' ); ?></p>
					<a href="https://mycred.me/support/?utm_source=plugin&utm_medium=settings_support_btn" target="_blank" class="mycred-btn-green"><?php esc_html_e( 'SUPPORT', 'mycred' ); ?></a>
				</div>
			</div>

		



<?php

		}

		/**
		 * Maybe Whitespace
		 * Since we want to allow a single whitespace in the string and sanitize_text_field() removes this whitespace
		 * this little method will make sure that whitespace is still there and that we still can sanitize the field.
		 * @since 0.1
		 * @version 1.0
		 */
		public function maybe_whitespace( $string ) {

			if ( strlen( $string ) > 1 )
				return '';

			return $string;

		}

		/**
		 * Sanititze Settings
		 * @filter 'mycred_save_core_prefs'
		 * @since 0.1
		 * @since 2.3 Added `by_role` Exclude user by role
		 * @version 1.5.2
		 */
		public function sanitize_settings( $post ) {

			$new_data = array();

			if ( $this->mycred_type == MYCRED_DEFAULT_TYPE_KEY ) {
				if ( isset( $post['types'] ) ) {

					$types = array( MYCRED_DEFAULT_TYPE_KEY => mycred_label() );
					foreach ( $post['types'] as $item => $data ) {

						// Make sure it is not marked as deleted
						if ( isset( $post['delete_types'] ) && in_array( $item, $post['delete_types'] ) ) {

							do_action( 'mycred_delete_point_type', $data['key'] );
							do_action( 'mycred_delete_point_type_' . $data['key'] );
							continue;

						}

						// Skip if empty
						if ( empty( $data['key'] ) || empty( $data['label'] ) ) continue;

						// Add if not in array already
						if ( ! array_key_exists( $data['key'], $types ) ) {

							$key           = str_replace( array( ' ', '-' ), '_', $data['key'] );
							$key           = sanitize_key( $key );

							$types[ $key ] = sanitize_text_field( $data['label'] );

							$type_settings = mycred_get_option( 'mycred_pref_core_' . $key );

							if ( $key !== MYCRED_DEFAULT_TYPE_KEY && empty( $type_settings  ) ) {

								if ( empty( $data['singular'] ) )
									$data['singular'] = $types[ $key ];

								$mycred = mycred();
								$new_type_defaults = $mycred->defaults();
								$new_type_defaults['cred_id'] = $key;
								$new_type_defaults['name']['singular'] = sanitize_text_field( $data['singular'] );
								$new_type_defaults['name']['plural']   = $types[ $key ];
							
								mycred_update_option( 'mycred_pref_core_' . $key , $new_type_defaults );

								mycred_upload_default_point_image();
							}

						}

					}

					mycred_update_option( 'mycred_types', $types );
					unset( $post['types'] );

					if ( isset( $post['delete_types'] ) )
						unset( $post['delete_types'] );

				}

				$new_data['format'] = $this->core->core['format'];

				if ( isset( $post['format']['type'] ) && $post['format']['type'] != '' )
					$new_data['format']['type'] = absint( $post['format']['type'] );

				if ( isset( $post['format']['decimals'] ) )
					$new_data['format']['decimals'] = absint( $post['format']['decimals'] );

			}
			else {

				$main_settings      = mycred_get_option( 'mycred_pref_core' );
				$new_data['format'] = $main_settings['format'];

				if ( isset( $post['format']['decimals'] ) ) {

					$new_decimals = absint( $post['format']['decimals'] );
					if ( $new_decimals <= $main_settings['format']['decimals'] )
						$new_data['format']['decimals'] = $new_decimals;

				}

			}

			// Format
			$new_data['cred_id'] = $this->mycred_type;

			$new_data['format']['separators']['decimal']  = $this->maybe_whitespace( $post['format']['separators']['decimal'] );
			$new_data['format']['separators']['thousand'] = $this->maybe_whitespace( $post['format']['separators']['thousand'] );

			// Name
			$new_data['name']    = array(
				'singular'          => sanitize_text_field( $post['name']['singular'] ),
				'plural'            => sanitize_text_field( $post['name']['plural'] )
			);

			// Look
			$new_data['before']  = sanitize_text_field( $post['before'] );
			$new_data['after']   = sanitize_text_field( $post['after'] );

			// Capabilities
			$new_data['caps']    = array(
				'plugin'            => sanitize_text_field( $post['caps']['plugin'] ),
				'creds'             => sanitize_text_field( $post['caps']['creds'] )
			);

			// Max
			$new_data['max']     = $this->core->number( $post['max'] );

			// Make sure multisites uses capabilities that exists
			if ( in_array( $new_data['caps']['plugin'], array( 'create_users', 'delete_themes', 'edit_plugins', 'edit_themes', 'edit_users' ) ) && is_multisite() )
				$new_data['caps']['plugin'] = 'edit_theme_options';

			//Exclude Users by roles and ID
			$sanitized_exclude_ids = !empty( $post['exclude']['list'] ) ? sanitize_text_field( implode( ',', $post['exclude']['list'] ) ) : '';
			$sanitized_exclude_roles = !empty( $post['exclude']['by_roles'] ) ? sanitize_text_field( implode( ',', $post['exclude']['by_roles'] ) ) : '';

			// Excludes
			$new_data['exclude'] = array(
				'plugin_editors'    =>	( isset( $post['exclude']['plugin_editors'] ) ) ? $post['exclude']['plugin_editors'] : 0,
				'cred_editors'      =>	( isset( $post['exclude']['cred_editors'] ) ) ? $post['exclude']['cred_editors'] : 0,
				'list'              =>	$sanitized_exclude_ids,
				'by_roles'			=>	$sanitized_exclude_roles
			);

			// Remove Exclude users balances
			if ( $new_data['exclude']['list'] != '' || $new_data['exclude']['by_roles'] != '' ) {

				$excluded_ids = wp_parse_id_list( $new_data['exclude']['list'] );

				//Exclude by User Role
				$excluded_roles = $post['exclude']['by_roles'];

				if( !empty( $excluded_roles ) )
				{
					$users_by_role = $this->get_users_by_role( $excluded_roles );
					$excluded_ids = array_merge( $excluded_ids, $users_by_role );
					$excluded_ids = array_unique( $excluded_ids );
				}

	
				if ( ! empty( $excluded_ids ) ) {
					foreach ( $excluded_ids as $user_id ) {

						$user_id = absint( $user_id );
						if ( $user_id == 0 ) continue;

						mycred_delete_user_meta( $user_id, $this->mycred_type );
						mycred_delete_user_meta( $user_id, $this->mycred_type, '_total' );

					}
				}

			}
			
			// User deletions
			$new_data['delete_user'] = ( isset( $post['delete_user'] ) ) ? $post['delete_user'] : 0;

			$new_data['admin_log_entries'] = ( isset( $post['admin_log_entries'] ) ) ? $post['admin_log_entries'] : 0;

			//Point type image
			$new_data['attachment_id'] = isset( $post['attachment_id'] ) ? $post['attachment_id'] : 0;

			$action_hook             = '';
			if ( ! $this->is_main_type )
				$action_hook = $this->mycred_type;

			return apply_filters( 'mycred_save_core_prefs' . $action_hook, $new_data, $post, $this );

		}

		/**
		 * @since 2.3
		 * @version 1.0
		 */
		public function get_users_by_role( $roles ) {
			
			$user_ids = array();

			foreach( $roles as $role ) {

				$args = array(
					'role'	=>	$role
				);

				$user_query = new WP_User_Query( $args );

				if ( ! empty( $user_query->get_results() ) ) {

					foreach ( $user_query->get_results() as $user ) 
						$user_ids[] = $user->ID;
				
				}
			
			}

			return $user_ids;
		}

	/**
	 * Add body class for settings pages
	 * @since 2.9.5.2
	 * @version 1.0
	 */
	public function add_settings_body_class( $classes ) {
		$classes .= ' mycred-settings-page';
		return $classes;
	}

	/**
	 * Get users by username/ email ajax callback
	 * @since 2.4.1
	 * @version 1.0
	 */
	public function get_users() {

			check_ajax_referer( 'mycred-management-actions', 'token' );
			
			if( isset( $_GET['action'] ) && $_GET['action'] == 'mycred-get-users-to-exclude' ) {

				$search = isset( $_GET['search'] ) ? sanitize_text_field( wp_unslash( $_GET['search'] ) ) : '';

				$results = mycred_get_users_by_name_email( $search );

				echo json_encode( $results );

				die;

			}

		}

		public function get_excluded_users() {

			$users = array();

			$user_ids = explode( ',', esc_attr( $this->core->exclude['list'] ) );

			if( $user_ids[0] != '' ) {

				foreach( $user_ids as $key => $user_id ) {

					$user_data = get_userdata( $user_id );

					$users[$key]['id'] = $user_data->ID;
					$users[$key]['text'] = $user_data->user_login;
					$users[$key]['selected'] = true;
				
				}
			
			}

			return empty( $users ) ? false : $users;
		}

	}
endif;