<?php
if ( ! defined( 'myCRED_VERSION' ) ) exit;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
if ( ! class_exists( 'myCRED_Tools' ) ) :
class myCRED_Tools {

	private $response = array();

	/**
	 * Construct
	 */
	public function __construct() {

        if ( mycred_override_settings() && ! mycred_is_main_site() ) return;

		add_action( 'admin_menu', array( $this, 'tools_sub_menu' ) );

		add_action( 'wp_ajax_mycred-tools-select-user', array( $this, 'tools_select_user' ) );

		if( isset( $_GET['page'] ) && $_GET['page'] == 'mycred-tools' ) {
			add_action( 'admin_enqueue_scripts', array( $this, 'admin_enqueue_scripts' ) );
		}
		
	}

	public function admin_enqueue_scripts() {
		// Enqueue React app for Tools page
		wp_enqueue_script(
			'mycred-tools-react-app',
			plugins_url('assets/build/tools.bundle.js', __DIR__),
			array('wp-element'),
			myCRED_VERSION,
			true
		);

		// Get editable roles
		$wp_roles = wp_roles();
		$roles = array();
		foreach ($wp_roles->roles as $role => $details) {
			$roles[] = array(
				'id' => $role,
				'name' => $details['name']
			);
		}

		// Get point types
		$point_types = array();
		foreach (mycred_get_types() as $key => $label) {
			$point_types[] = array(
				'id' => $key,
				'name' => $label
			);
		}

		// Get badges
		$badges = array();
		if (class_exists('myCRED_Badge')) {
			$badge_ids = mycred_get_badge_ids();
			foreach ($badge_ids as $id) {
				$badges[] = array(
					'id' => $id,
					'name' => get_the_title($id)
				);
			}
		}

		// Get ranks
		$ranks = array();
		if (class_exists('myCRED_Ranks_Module')) {
			foreach (mycred_get_types() as $key => $pt) {
				if (mycred_manual_ranks($key)) {
					$mycred_ranks = mycred_get_ranks('publish', '-1', 'ASC', $key);
					foreach ($mycred_ranks as $value) {
						$ranks[] = array(
							'id' => $value->post->ID,
							'name' => "{$value->post->post_title} ({$pt})"
						);
					}
				}
			}
		}

		// Get badge categories for setup export
		$badge_categories = array();
		if (class_exists('myCRED_Badge')) {
			$categories = get_terms(array(
				'taxonomy' => 'mycred_badge_category',
				'hide_empty' => false,
			));
			if (!is_wp_error($categories)) {
				foreach ($categories as $cat) {
					$cat_badges = mycred_get_badges_by_term_id($cat->term_id);
					$badges_list = array();
					foreach ($cat_badges as $badge) {
						$badges_list[] = array(
							'id' => $badge->ID,
							'name' => $badge->post_title
						);
					}
					$badge_categories[] = array(
						'id' => $cat->term_id,
						'name' => $cat->name,
						'badges' => $badges_list
					);
				}
			}
		}

		$uncategorized_badges = array();
		$has_uncategorized    = false;
		if ( class_exists( 'myCRED_Tools_Import_Export' ) ) {
			$import_export = new myCRED_Tools_Import_Export();
			$uncat_rows    = $import_export->get_uncat_badge_ids();
			if ( ! empty( $uncat_rows ) ) {
				$has_uncategorized = true;
				foreach ( $uncat_rows as $row ) {
					$uncategorized_badges[] = array(
						'id'   => (int) $row['ID'],
						'name' => get_the_title( $row['ID'] ),
					);
				}
			}
		}

		$is_toolkit_pro_active = false;
		$active_plugins = (array) get_option( 'active_plugins', array() );
		if ( in_array( 'mycred-toolkit-pro/mycred-toolkit-pro.php', $active_plugins, true ) || class_exists( 'MyCRED_Toolkit_Core_Pro' ) ) {
			if ( file_exists( WP_PLUGIN_DIR . '/mycred-toolkit-pro/includes/mycred-toolkit-plan-check.php' ) || class_exists( 'MyCRED_Toolkit_Core_Pro' ) ) {
				$is_toolkit_pro_active = true;
			}
		}

		wp_localize_script(
			'mycred-tools-react-app',
			'mycredToolsData',
			array(
				'ajax_url' => admin_url('admin-ajax.php'),
				'nonce' => wp_create_nonce('mycred-tools'),
				'roles' => $roles,
				'pointTypes' => $point_types,
				'badges' => $badges,
				'ranks' => $ranks,
				'badgeCategories' => $badge_categories,
				'uncategorizedBadges' => $uncategorized_badges,
				'hasUncategorizedBadges' => $has_uncategorized,
				'isRanksEnabled' => class_exists('myCRED_Ranks_Module'),
				'isBadgesEnabled' => class_exists('myCRED_Badge'),
				'isProActive' => $is_toolkit_pro_active,
				'proDemoUrl' => 'https://mycred.me/demo/?utm_source=plugin&utm_medium=tools_sidebar',
				'proPromoImageUrl' => plugins_url( 'assets/images/test.png', myCRED_THIS ),
				'assetsUrl' => plugins_url('assets/images/', __DIR__),
				'footerBgUrl' => plugins_url('src/pages/About/icons/footer-bg.svg', dirname(__FILE__)),
			)
		);
	}

	/**
	 * Register tools menu
	 * 
	 * @since 2.4.4.1 `$capability` check added
	 */
	public function tools_sub_menu() {

		$this->menu_fallback();

		$mycred     = new myCRED_Settings();
		$capability = $mycred->get_point_admin_capability();

		mycred_add_main_submenu( 
			'Tools', 
			'Tools', 
			$capability, 
			'mycred-tools',
			array( $this, 'tools_page' ),
			2
		);

	}

	/**
	 * Tools menu callback
	 * @since 2.3
	 * @since 2.4 Import Export Module Added
	 * @version 1.1
	 */
	public function tools_page() { 
		mycred_render_admin_header();
		?>
		<div class="wrap" id="myCRED-wrap" style="width: 90% !important; max-width: 1440px !important; margin: 20px auto !important; padding: 0 !important; background: transparent !important; box-shadow: none !important; border: none !important;">
			<div id="mycred-tools-ui-root"></div>
		</div>
		<style>
			/* Hide legacy WP UI chrome */
			#screen-meta-links,
			.wrap h1,
			.wp-heading-inline,
			.notice-info,
			.update-nag,
			#wpfooter,
			.page-title-action {
				display: none !important;
			}
			#mycred-tools-ui-root {
				width: 100%;
				box-sizing: border-box;
			}
		</style>
		<?php
	}

	public function get_all_users()
	{
		$users = array();

		$wp_users = get_users();

		foreach( $wp_users as $user )
            $users[$user->user_email] = $user->display_name;

		return $users;
	}

	public function get_users_by_email( $emails )
	{
		$ids = array();

		foreach( $emails as $email )
			$ids[] = get_user_by( 'email', $email )->ID;

		return $ids;
	}

	public function get_users_by_role( $roles )
	{
		$user_ids = array();

		foreach( $roles as $role )
		{
			$args = array(
				'role'	=>	$role
			);

			$user_query = new WP_User_Query( $args );

			if ( ! empty( $user_query->get_results() ) ) 
			{
				foreach ( $user_query->get_results() as $user ) 
					$user_ids[] = $user->ID;
			}
		}

		return $user_ids;
	}

	public function tools_assign_award() {

		check_ajax_referer( 'mycred-tools', 'token' );

		$user_count         = count_users();
		$user_count         = (int) $user_count['total_users'];
		$total_ajax_request = (int) ceil( $user_count / 100 );
		$run_again          = false;

		$loop   = isset( $_POST['loop'] ) ? absint( $_POST['loop'] ) : 0;
		$offset = $loop * 100;

		$award_to_all_users = isset( $_REQUEST['award_to_all_users'] )
			&& sanitize_key( wp_unslash( $_REQUEST['award_to_all_users'] ) ) === 'true';

		// Selected users/roles are returned in full (no offset pagination).
		// Only "award to all" uses batched loops of 100.
		if ( $award_to_all_users ) {
			$run_again = ( $loop + 1 ) < $total_ajax_request;
		}

		$this->response = array(
			'success' => 'tryLater',
		);

		if ( isset( $_REQUEST['selected_type'] ) ) {

			$selected_type = sanitize_key( $_REQUEST['selected_type'] );

			switch ( $selected_type ) {
				case 'mycred-tools':
					$this->process_points( $offset, $run_again, $user_count, $total_ajax_request );
					break;
				case 'ranks':
					$this->process_ranks( $offset, $run_again, $user_count, $total_ajax_request );
					break;
				case 'badges':
					$this->process_badges( $offset, $run_again, $user_count, $total_ajax_request );
					break;
				default:
					break;
			}

		}

		wp_send_json( $this->response );
		wp_die();

	}

	private function process_points( $offset = 0, $run_again = false , $user_count = 0, $total_ajax_request = 1 ) {

		if ( ! isset( $_REQUEST['point_type'] ) ) {

			$this->response = array( 'success' => 'selectPointType' );
			return;
		
		}
		
		$point_type      = sanitize_key( $_REQUEST['point_type'] );
		$current_user_id = get_current_user_id();
		$mycred          = mycred( $point_type );

		if ( ! $mycred->user_is_point_admin( $current_user_id ) ) {

			$this->response = array( 'success' => 'accessDenied' );
			return;

		}

		if ( empty( $_REQUEST['points_to_award'] ) ) {

			$this->response = array( 'success' => 'pointsRequired' );
			return;
		
		}

		$points_to_award = sanitize_text_field( wp_unslash( $_REQUEST['points_to_award'] ) );

		$log_entry = isset( $_REQUEST['log_entry'] ) ? ( sanitize_key( $_REQUEST['log_entry'] ) == 'true' ? true : false ) : false;
		$users_to_award = $this->get_requested_users( $offset );
		$count_user = count( $users_to_award );

		if ( empty( $users_to_award ) ) return;

		foreach ( $users_to_award  as $user_id ) {

			if ( $mycred->exclude_user( $user_id ) ) continue;

			//Entries with log
			if( $log_entry ) {

				$log_entry_text = isset( $_REQUEST['log_entry_text'] ) ? sanitize_text_field( wp_unslash( $_REQUEST['log_entry_text'] ) ) : '';

				if( empty( $log_entry_text ) ) {

					$this->response = array( 'success' => 'logEntryRequired' );
					return;

				}

				$mycred->add_creds(
					'bulk_assign',
					$user_id,
					$points_to_award,
					$log_entry_text
				);

			}
			else {

				$new_balance = $mycred->update_users_balance( $user_id, $points_to_award, $point_type );
			
			}

		}

		$this->response = array(
			'success'            => true,
			'run_again'          => $run_again,
			'user_count'         => $user_count,
			'total_ajax_request' => $total_ajax_request,
		);

	}

	private function process_ranks( $offset = 0, $run_again = false , $user_count = 0, $total_ajax_request = 1 ) {

		if( class_exists( 'myCRED_Ranks_Module' ) && mycred_manual_ranks() ) {

			if ( empty( $_REQUEST['rank_to_award'] ) ) {

				$this->response = array( 'success' => 'selectRank' );
				return;
			
			}

			$rank_id         = intval( $_REQUEST['rank_to_award'] );
			$point_type      = mycred_get_rank_pt( $rank_id );
			$current_user_id = get_current_user_id();
			$mycred          = mycred( $point_type );

			if ( ! $mycred->user_is_point_admin( $current_user_id ) ) {

				$this->response = array( 'success' => 'accessDenied' );
				return;

			}

			$users_to_award = $this->get_requested_users( $offset );

			if ( empty( $users_to_award ) ) return;

			foreach ( $users_to_award  as $user_id ) {

				if ( $mycred->exclude_user( $user_id ) ) continue;

				mycred_save_users_rank( $user_id, $rank_id, $point_type );

			}

			$this->response = array(
				'success'            => true,
				'run_again'          => $run_again,
				'user_count'         => $user_count,
				'total_ajax_request' => $total_ajax_request,
			);

		}

	}

	private function process_badges( $offset = 0, $run_again = false , $user_count = 0, $total_ajax_request = 1 ) {

		$current_user_id = get_current_user_id();
		$mycred          = mycred();
		$is_revoke       = ( isset( $_REQUEST['revoke'] ) && $_REQUEST['revoke'] == 'revoke' );

		if ( ! $mycred->user_is_point_admin( $current_user_id ) ) {

			$this->response = array( 'success' => 'accessDenied' );
			return;

		}
		
		if ( $is_revoke )
			$selected_badges = isset( $_REQUEST['badges_to_revoke'] ) ? sanitize_text_field( wp_unslash( $_REQUEST['badges_to_revoke'] ) ) : '';
		else
			$selected_badges = isset( $_REQUEST['badges_to_award'] ) ? sanitize_text_field( wp_unslash( $_REQUEST['badges_to_award'] ) ) : '';

		$selected_badges = json_decode( stripslashes( $selected_badges ) );

		if( empty( $selected_badges ) ) {

			$this->response = array( 'success' => 'badgesFieldRequried' );
			return;

		}	
		
		$selected_users = $this->get_requested_users( $offset );

		if ( empty( $selected_users ) ) return;

		foreach( $selected_badges as $badge_id ) {

			foreach( $selected_users as $user_id ) {

				if ( $mycred->exclude_user( $user_id ) ) continue;

				if ( $is_revoke ) {
					
					$badge = mycred_get_badge( (int) $badge_id );
        			$badge->divest( $user_id );

				}
				else {

					mycred_assign_badge_to_user( $user_id, (int) $badge_id );

				}

			}

		}

		$this->response = array(
			'success'            => true,
			'run_again'          => $run_again,
			'user_count'         => $user_count,
			'total_ajax_request' => $total_ajax_request,
		);

	}

	private function get_requested_users( $offset = 0 ) {

		$users_to_award = array();

		if ( isset( $_REQUEST['award_to_all_users'] ) ) {
			
			$award_to_all_users = sanitize_key( $_REQUEST['award_to_all_users'] ) == 'true' ? true : false;

			if ( $award_to_all_users ) {
				$args = array(
					'orderby' => array(
						'ID'
					),
					'offset' => $offset,
					'number' => 100
				);
				$users = get_users( $args ); 
				foreach( $users as $user  ) {
					$users_to_award[] = $user->data->user_email;
				}

				$users_to_award = $this->get_users_by_email( $users_to_award );
			}
			else {

				$selected_users      = isset( $_REQUEST['users'] ) ? sanitize_text_field( wp_unslash( $_REQUEST['users'] ) ) : '[]';
				$selected_user_roles = isset( $_REQUEST['user_roles'] ) ? sanitize_text_field( wp_unslash( $_REQUEST['user_roles'] ) ) : '[]';

				$selected_users      = json_decode( stripslashes( $selected_users ) );
				$selected_user_roles = json_decode( stripslashes( $selected_user_roles ) );

				$users_to_award      = $this->get_users_by_email( $selected_users );

				if( ! empty( $selected_user_roles ) ) {

					$users_by_role = $this->get_users_by_role( $selected_user_roles );
					$users_to_award = array_merge( $users_by_role, $users_to_award );
					$users_to_award = array_unique( $users_to_award );
				
				}

			}

		}

		if ( empty( $users_to_award ) ) 
			$this->response = array( 'success' => 'selectUser' );

		return $users_to_award;

	}

	/**
	 * Ajax Call-back
	 * @since 2.4.1
	 * @since 2.4.4.1 `current_user_can` security added
	 * @version 1.0
	 */
	public function tools_select_user()
	{

		check_ajax_referer( 'mycred-tools', 'token' );

		$mycred = new myCRED_Settings();
		$capability = $mycred->get_point_admin_capability();

		if( !current_user_can( $capability ) ) {
			die( '-1' );
		}
		
		if( isset( $_GET['action'] ) &&  $_GET['action'] == 'mycred-tools-select-user' )
		{
			$search = isset( $_GET['search'] ) ? sanitize_text_field( $_GET['search'] ) : '';

			$results = mycred_get_users_by_name_email( $search, 'user_email' );

			echo json_encode( $results );

			die;
		}
	}

	public function menu_fallback() {

		if ( ! empty( $_GET['page'] ) && $_GET['page'] == 'mycred-tools' ) {
			
			if ( ! empty( $_GET['mycred-tools'] ) ) {
				
				if ( 
					( $_GET['mycred-tools'] == 'badges' && ! class_exists( 'myCRED_Badge' ) ) ||
					( $_GET['mycred-tools'] == 'ranks' && ! class_exists( 'myCRED_Ranks_Module' ) )
				) {
					
					$args = array(
						'page'         => MYCRED_SLUG . '-tools',
						'mycred-tools' => 'points'
					);

					wp_safe_redirect( add_query_arg( $args, admin_url( 'admin.php' ) ) );
					exit;

				}

			}

		}

	}

}
endif;

$mycred_tools = new myCRED_Tools();

if ( ! function_exists( 'get_mycred_tools_page_url' ) ) :
	function get_mycred_tools_page_url( $urls, $argument = '', $check = false ) {

		$args = array(
			'page'         => MYCRED_SLUG . '-tools',
			$urls =>  $argument,
		);

		// if( $check == true )
			// apply_filters();

		return esc_url( add_query_arg( $args, admin_url( 'admin.php' ) ) );

	}
endif;