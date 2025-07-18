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

		if( isset( $_GET['page'] ) && $_GET['page'] == 'mycred-tools' )
			add_action( 'admin_enqueue_scripts', array( $this, 'admin_enqueue_scripts' ) );
		
	}

	public function admin_enqueue_scripts() {

		wp_enqueue_script( MYCRED_SLUG . '-select2-script' );

		wp_enqueue_style( MYCRED_SLUG . '-select2-style' );

		wp_enqueue_script( MYCRED_SLUG . '-tools-script', plugins_url( 'assets/js/mycred-tools.js', __DIR__ ), 'jquery', myCRED_VERSION, true );

		wp_localize_script( 
			MYCRED_SLUG . '-tools-script',
			'mycredTools',
			array(
				'ajax_url' 			   =>	admin_url( 'admin-ajax.php' ),
				'token'                =>	wp_create_nonce( 'mycred-tools' ),
				'awardConfirmText'     =>	__( 'Do you really want to bulk award?', 'mycred' ),
				'revokeConfirmText'    =>	__( 'Do you really want to bulk deduct?', 'mycred' ),
				'successfullyAwarded'  =>	__( 'Successfully Awarded.', 'mycred' ),
				'successfullyDeducted' =>	__( 'Successfully Deducted.', 'mycred' ),
				'pointsRequired'	   =>	__( 'Points field is required.', 'mycred' ),
				'logEntryRequired'	   =>	__( 'Log Entry is requried.', 'mycred' ),
				'revokeConfirmText'	   =>	__( 'Do you really want to bulk revoke?', 'mycred' ),
				'successfullyRevoked'  =>	__( 'Successfully Revoked.', 'mycred' ),
				'userOrRoleIsRequired' =>	__( 'Username or Role field required.', 'mycred' ),
				'tryLater'	           =>	__( 'Something went wrong try later.', 'mycred' ),
				'selectPointType'	   =>	__( 'Please select point type.', 'mycred' ),
				'accessDenied'	       =>	__( 'Access Denied', 'mycred' ),
				'selectUser'	       =>	__( 'Please select atleast one user.', 'mycred' ),
				'selectRank'	       =>	__( 'Please select rank.', 'mycred' ),
				'badgesFieldRequried'  =>  __( 'Please select atleast one badge.', 'mycred' ),
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
		
		$import = get_mycred_tools_page_url( 'import', 'import-points' );
		$export = get_mycred_tools_page_url( 'export', 'export-points' );

		// $logs_cleanup = get_mycred_tools_page_url('logs-cleanup');
		// $reset_data = get_mycred_tools_page_url('reset-data');
		$import_page = array( 
			'import-points', 
			'import-badges', 
			'import-ranks',
			'import-setup'
		);

		$export_page = array( 
			'export-points', 
			'export-badges', 
			'export-ranks',
			'export-setup'
		);
		?>

		<div class="" id="myCRED-wrap">
			<div class="mycred-tools">
				<h1>Tools</h1>
			</div>
			<div class="clear"></div>
			<div class="mycred-tools-main-nav">
				<ul class="subsubsub">
					<li>
						<a href="<?php echo esc_url( admin_url('admin.php?page=mycred-tools') ) ?>" class="<?php echo ( !isset( $_GET['import'] ) && !isset( $_GET['export'] ) ) ? 'current' : ''; ?>">Bulk Assign</a>|
					</li>
					<li>
						<a href="<?php echo esc_url( $import ) ?>" class="<?php echo ( isset( $_GET['import'] ) && in_array( $_GET['import'], $import_page ) ) ? 'current' : ''; ?>">Import</a>
					</li>
					<li>
						<a href="<?php echo esc_url( $export ) ?>" class="<?php echo ( isset( $_GET['export'] ) && in_array( $_GET['export'], $export_page ) ) ? 'current' : ''; ?>">Export</a>
					</li>
				</ul>
				<div class="clear"></div>
			</div>
		<?php

		if ( isset( $_GET['import'] ) ) {

			if ( in_array( $_GET['import'], $import_page ) )
			{ 
				$mycred_tools_import_export = new myCRED_Tools_Import_Export();

				$mycred_tools_import_export->get_header();
			}
		}

		elseif ( isset( $_GET['export'] ) ) {

			if ( in_array( $_GET['export'], $export_page ) )
			{ 
				$mycred_tools_import_export = new myCRED_Tools_Import_Export();

				$mycred_tools_import_export->get_header();
			}
		}

		elseif ( isset( $_GET['mycred-tools'] ) ) {
			if ( $_GET['mycred-tools'] == 'logs-cleanup' ) { ?>
				<h1>LOGS-CLEANUP</h1>
				<?php
			}
		}

		elseif ( isset( $_GET['mycred-tools'] ) ) 
		{
			if ( $_GET['mycred-tools'] == 'reset-data' ) { ?>
				<h1>RESET-DATA</h1>
				<?php
			}
		}
		else
		{

			$mycred_tools_bulk_assign = new myCRED_Tools_Bulk_Assign();
			$mycred_tools_bulk_assign->get_header();

		}

		?>
		</div>
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

		$user_count = count_users();
        $user_count = $user_count['total_users'];
        $total_ajax_request = ceil( $user_count / 100 );
        $run_again = false;

        $loop = isset( $_POST['loop'] ) ? $_POST['loop'] : '';
        $offset = $loop * 100;

        if ( $loop != $total_ajax_request ) {
        	$run_again = true;
        }

		$this->response = array( 
			'success' => 'tryLater',
		);

		if( isset( $_REQUEST['selected_type'] ) ) {

			$selected_type = sanitize_key( $_REQUEST['selected_type'] );

			switch ( $selected_type ) {
				case 'mycred-tools':
					$this->process_points( $offset, $run_again, $user_count );
					break;
				case 'ranks':
					$this->process_ranks( $offset, $run_again, $user_count );
					break;
				case 'badges':
					$this->process_badges( $offset, $run_again, $user_count );
					break;
				default:
					break;
			}

		}

		wp_send_json( $this->response );
		wp_die();

	}

	private function process_points( $offset = 0, $run_again = false , $user_count = 0 ) {

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
			'success' => true,
			'run_again' => $run_again,
			'user_count' => $user_count
		);

	}

	private function process_ranks( $offset = 0, $run_again = false , $user_count = 0 ) {

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
				'success' => true,
				'run_again' => $run_again,
				'user_count' => $user_count
			);

		}

	}

	private function process_badges( $offset = 0, $run_again = false , $user_count = 0 ) {

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
			'success' => true,
			'run_again' => $run_again,
			'user_count' => $user_count
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