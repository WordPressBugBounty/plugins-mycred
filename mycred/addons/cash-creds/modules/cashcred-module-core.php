<?php
if ( ! defined( 'MYCRED_CASHCRED' ) ) exit;

/**
 * myCRED_cashCRED_Module class
 * @since 0.1
 * @version 1.4.1
 */
if ( ! class_exists( 'myCRED_cashCRED_Module' ) ) :
	class myCRED_cashCRED_Module extends myCRED_Module {

		public $post_ID = 0;

		/**
		 * Construct
		 */
		function __construct( $type = MYCRED_DEFAULT_TYPE_KEY ) {
			 
			parent::__construct( 'myCRED_cashCRED_Module', array(
				'module_name' => 'cashcreds',
				'option_id'   => 'mycred_pref_cashcreds',
				'defaults'    => array(
					'installed'     => array(),
					'active'        => array(),
					'gateway_prefs' => array()
				),
				'labels'      	  => array(
					'menu'        => __( 'cashcred Gateways', 'mycred' ),
					'page_title'  => __( 'cashCred Gateways', 'mycred' ),
					'page_header' => __( 'cashcred Gateways', 'mycred' )
				),
				'screen_id'   => MYCRED_SLUG . '-cashcreds',
				'accordion'   => true,
				'add_to_core' => true,
				'menu_pos'    => 80,
				'main_menu'   => true
			), $type );

			$this->mycred_type = MYCRED_DEFAULT_TYPE_KEY;

		}

		/**
		 * Load
		 * @version 1.0
		 */
		public function load() {

			add_action( 'mycred_init',                     array( $this, 'module_init' ), $this->menu_pos );
			add_action( 'wp_loaded',                       array( $this, 'module_run' ) );

			add_action( 'mycred_register_assets',          array( $this, 'register_assets' ) );
			add_action( 'mycred_front_enqueue_footer',     array( $this, 'enqueue_footer' ) );

			add_action( 'mycred_admin_init',               array( $this, 'module_admin_init' ), $this->menu_pos );
			add_action( 'mycred_admin_init',               array( $this, 'register_settings' ), $this->menu_pos+1 );
			add_action( 'mycred_add_menu',                 array( $this, 'add_menu' ), $this->menu_pos );

			add_action( 'pre_get_comments',                array( $this, 'hide_cashcred_transactions' ) );

			add_action( 'wp_ajax_cashcred_pay_now',		   array( $this, 'cashcred_pay_now'), 10, 2 );
			add_action( 'wp_ajax_nopriv_cashcred_pay_now', array( $this, 'cashcred_pay_now'), 10, 2 );

			add_action( 'mycred_after_core_prefs',         array( $this, 'after_general_settings' ) );
			add_filter( 'mycred_save_core_prefs',          array( $this, 'sanitize_extra_settings' ), 90, 3 );

		}
		
		 
		
		/**
		 * Init
		 * Register shortcodes.
		 * @since 0.1
		 * @version 1.4
		 */
		public function module_init() {
			 
			// Add shortcodes first
			add_shortcode( MYCRED_SLUG . '_cashcred', 'mycred_render_cashcred' );

			$this->setup_instance();

			$this->current_user_id = get_current_user_id();

		}

		/**
		 * Run
		 * Runs a gateway if requested.
		 * @since 1.9
		 * @version 1.0
		 */
		public function module_run() {
		
			global $cashcred_instance;
			 
			// Prep
			$installed = $this->get();

			// Make sure we have installed gateways.
			if ( empty( $installed ) ) return;

			// We only want to deal with active gateways
			foreach ( $installed as $id => $data ) {
				if ( $this->is_active( $id ) )
					$cashcred_instance->active[ $id ] = $data;
			}
			
			if ( empty( $cashcred_instance->active ) ) return;

			/**
			 * Step 1 - Look for returns
			 * Runs though all active payment gateways and lets them decide if this is the
			 * user returning after a remote purchase. Each gateway should know what to look
			 * for to determen if they are responsible for handling the return.
			 */	
			foreach ( $cashcred_instance->active as $id => $data ) {

				if ( $data['external'] === true )
					$this->call( 'returning', $cashcred_instance->active[ $id ]['callback'] );

			}

			if ( $this->can_save_settings() )
				$this->save_user_payment_methods();
			
			$cashcred_instance->gateway_id = cashcred_get_requested_gateway_id();

			do_action( 'mycred_pre_process_cashcred' );
			 	
			// If we have a valid gateway ID and the gateway is active, lets run that gateway.
			if ( $cashcred_instance->gateway_id !== false && array_key_exists( $cashcred_instance->gateway_id, $cashcred_instance->active ) && $this->can_withdraw_request() ) {

				$this->process_new_withdraw_request( $cashcred_instance->gateway_id );
 
			}

		}
		
		public function cashcred_pay_now( $post_id = false, $auto = false ) {

			global $cashcred_instance;

			$payment_response = array();
			
			if( empty( $post_id ) && ! empty( $_POST['post_ID'] ) ) {
				$post_id = sanitize_text_field( wp_unslash( $_POST['post_ID'] ) );
			}
			
			if ( empty( $post_id ) ) {
				return	$this->response( false, array( 'message' => 'Post id required' ), $auto );
			}

			$this->post_ID = $post_id;
			
			if( ! empty( $_POST['cashcred_pay_method'] ) ) {
				$cashcred_pay_method = sanitize_text_field( wp_unslash(  $_POST['cashcred_pay_method'] ) );	
			} 
			else {
				return	$this->response( false, array( 'message' => 'Invalid Payment Gateway' ), $auto );
			}

			$withdraw_user_id    = (int) mycred_get_post_meta( $post_id, 'from', true );
			$payment_settings    = cashcred_get_payment_settings( $post_id );
			$withdraw_point_type = $payment_settings->point_type;
			$withdraw_amount     = $payment_settings->points;
			$users_balance       = mycred_get_users_balance( $withdraw_user_id, $withdraw_point_type );

			if( $withdraw_amount > $users_balance ) {

				return $this->response( false, array( 'message' => 'Insufficient Balance' ), $auto );
			
			}
			
			if ( $cashcred_pay_method !== false && array_key_exists( $cashcred_pay_method, $cashcred_instance->active ) ) {
			
				$cashcred_instance->gateway = cashcred_gateway( $cashcred_pay_method );

				$cashcred_prefs = mycred_get_option( 'mycred_pref_cashcreds' , false );
				
				do_action( 'mycred_cashcred_process',$cashcred_pay_method, $cashcred_prefs );
				do_action( "mycred_cashcred_process_{$cashcred_pay_method}", $cashcred_prefs );
				
				$payment_response =	$cashcred_instance->gateway->process( $post_id );

				if( $payment_response['status'] == true ) {
					
					$history_comments = $this->cashcred_update_payment_status( $post_id, $auto );
					$payment_response['cashcred_total']   = $history_comments['cashcred_total'];
					$payment_response['history_comments'] = $history_comments['comments'];
					return	$this->response( true, $payment_response, $auto );
					
				} 
				else {
					
					$payment_response['cashcred_total']   = '';
					$payment_response['date'] 			  = '';
					$payment_response['history_comments'] = '';	
					return	$this->response( false, $payment_response, $auto );
					
				}
			 
			} 
			else {

				return	$this->response( false, array( 'message' => 'Invalid Payment Gateway' ), $auto );
				
			}

		}

		public function cashcred_developer_log() {

			$counter = (int) mycred_get_post_meta( $this->post_ID, 'cashcred_log_counter', true );
			$orderdesc = $counter;

			$logdata = '';
			
			for ($log = 1; $log <= $counter; $log++) {
				
				$payment_log = ''; 
					
				$payment_log = mycred_get_post_meta( $this->post_ID, 'cashcred_log_' . $orderdesc, true );
				 
				$logdata .= "<pre>";	
				$logdata .= "<b>Date Time: </b>".$payment_log['datetime']."<br>";  
				$logdata .= "<b>Payment Gateway: </b>".$payment_log['payment_gateway']."<br>";  
				$logdata .=  print_r( json_decode( $payment_log["response"] ) , true );
				$logdata .= "</pre>";

				$orderdesc = $counter - 1; 

			}
			return $logdata;

		}

		public function response( $status, $message, $is_auto ){

			$response = array(
				'status'   => $status, 
				'message'  => isset( $message['message'] ) ? $message['message'] : '',
				'date'     => isset( $message['date'] ) ? $message['date'] : '',
				'total'    => isset( $message['cashcred_total'] ) ? $message['cashcred_total'] : '',
				'comments' => isset( $message['history_comments'] ) ? $message['history_comments'] : '' ,
				'log'      => $this->cashcred_developer_log() 
			);

			if( $is_auto )
				return $response;
			else
				wp_send_json( $response );

		}
		
		public function cashcred_update_payment_status( $post_id , $manual ) {
		
			$time 					= get_post_meta( $post_id, 'cashcred_payment_transfer_date', true );
			$point_type 			= get_post_meta( $post_id, 'point_type', true );
			$points 				= get_post_meta( $post_id, 'points', true );
			$gateway 				= get_post_meta( $post_id, 'gateway', true );
			$user_id 				= get_post_meta( $post_id, 'from', true );
			// $fee_points				= get_post_meta( $post_id, 'fee_points', true );

			$response_send 			= array();
			
			//Add comments in history section
			$user 				    = wp_get_current_user();
			$author       			= 'cashCRED';
			$author_email		    = apply_filters( 'mycred_cashcred_comment_email', 'cashcred-service@mycred.me' );
			$get_payment_settings   = cashcred_get_payment_settings( $post_id );

			//adding fees attribute in cashcred 2.4
			$cashcred_setting = mycred_get_cashcred_settings();
			if( !empty( $cashcred_setting ) ){
			
				if( $cashcred_setting['fees']['use'] == 1 ) {
					
					$fee = $cashcred_setting['fees']['types'][$point_type]['amount'];
					
					if( $cashcred_setting['fees']['types'][$point_type]['by'] == 'percent' )
						$fee = ( ( $fee / 100 ) * $points );

					if( $cashcred_setting['fees']['types'][$point_type]['min_cap'] != 0 )
						$fee = $fee + $cashcred_setting['fees']['types'][$point_type]['min_cap'];

					if( $cashcred_setting['fees']['types'][$point_type]['max_cap'] != 0 && $fee > $cashcred_setting['fees']['types'][$point_type]['max_cap'] )
						$fee = $cashcred_setting['fees']['types'][$point_type]['max_cap'];

					
					if( $cashcred_setting['fees']['account'] != 0){
						
						$log_data = array(
							'post_id' => $post_id,
							'fees_setting' => $cashcred_setting['fees'],
							'transfer_fee_user'	=> $cashcred_setting['fees']['account']
						);

						$mycred = mycred( $point_type );

						if( ! empty( get_userdata( $cashcred_setting['fees']['account'] )->user_login) )
							$mycred->add_creds( 
								'fee_transfer', 
								$cashcred_setting['fees']['account'], 
								$fee,
								'fee transfer to ' . get_userdata( $cashcred_setting['fees']['account'] )->user_login, 
								$post_id , 
								$log_data, 
								$point_type 
							);
					}

					$log_data = array(
						'post_id' => $post_id ,
						'fees_setting' => $cashcred_setting['fees']
					);

					mycred_subtract( 
						'cashcred_withdrawal_fee', 
						$user_id, 
						-$fee, 
						'fee deduct', 
						$post_id , 
						$log_data, 
						$point_type 
					);
						
				}
			}

			$currency   			= $get_payment_settings->currency;
			$amount     			= $get_payment_settings->points * $get_payment_settings->cost;
			$amount_set 			= $currency .' '.$amount;
			$comment 				= 'Withdrawal payment request processed by %s with the amount %s.' ;
			$comment 				= apply_filters( 'mycred_cashcred_comment_text' , $comment );
			$comment				= sprintf( $comment , $user->user_login ,$amount_set);
			
			/* set user total balance */
			$cashcred_total 		= get_user_meta( $user_id, 'cashcred_total', true );
			
			if( ! get_user_meta( $user_id, 'cashcred_total', true ) ) 
				$cashcred_total	    = 0;
			
			$cashcred_total 		= $amount + $cashcred_total;

			update_user_meta( $user_id, 'cashcred_total', $cashcred_total );
			mycred_cashcred_update_status( $post_id, 'status', 'Approved' );
			 
			$log_data = array(
				'post_id' => $post_id ,
				'payment_gateway' => $gateway
			); 
			$gateway_name =  cashcred_gateway( $gateway );
			
			$format = '%s payment credited';  
			$entry = sprintf($format, $gateway_name->label); 
			
			mycred_subtract( 'cashcred_withdrawal', $user_id, -$points, apply_filters( 'cashcred_withdraw_request_entry', $entry ), $post_id , $log_data, $point_type );
			
			if($manual == true) {
				update_post_meta( $post_id, 'manual', 'Auto' );
			}
			else {
				update_post_meta( $post_id, 'manual', 'Manual' );	
			}
			
			wp_insert_comment( 
				array(
					'comment_post_ID'      => $post_id,
					'comment_author'       => $author,
					'comment_author_email' => $author_email,
					'comment_content'      => $comment,
					'comment_type'         => 'cashcred',
					'comment_author_IP'    => isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '',
					'comment_date'         => $time,
					'comment_approved'     => 1,
					'user_id'              => 0
				) 
			);
					
			$response_send['comments'] 	     = $comment;
			$response_send['cashcred_total'] = $currency .' '. $cashcred_total;
				 
			return $response_send;
		
		}

		/**
		 * Register Assets
		 * @since 1.8
		 * @version 1.0
		 */
		public function register_assets() {

			wp_register_style( 'cashcred-withdraw', plugins_url( 'assets/css/withdraw.css', MYCRED_CASHCRED ), array(), MYCRED_CASHCRED_VERSION, 'all' );
			wp_register_script( 'cashcred-withdraw', plugins_url( 'assets/js/withdraw.js', MYCRED_CASHCRED ), array( 'jquery' ), MYCRED_CASHCRED_VERSION, 'all' );

		}

		/**
		 * Setup Purchase Instance
		 * @since 1.8
		 * @version 1.0
		 */
		public function setup_instance() {

			global $cashcred_instance;

			$cashcred_instance             = new StdClass();
			$cashcred_instance->active     = array();
			$cashcred_instance->gateway_id = false;
			$cashcred_instance->error      = false;
			$cashcred_instance->gateway    = false;
			
		}

		/**
		 * Get Payment Gateways
		 * Retreivs all available payment gateways that can be used to cashCred
		 * @since 0.1
		 * @version 1.1.1
		 */
		public function get() {

			$installed = mycred_get_cashcred_gateways();
			
			// Untill all custom gateways have been updated, make sure all gateways have an external setting
			if ( ! empty( $installed ) ) {
				foreach ( $installed as $id => $settings ) {

					if ( ! array_key_exists( 'external', $settings ) )
						$installed[ $id ]['external'] = true;

					if ( ! array_key_exists( 'custom_rate', $settings ) )
						$installed[ $id ]['custom_rate'] = false;

				}
			}

			return $installed;

		}

		public function save_user_payment_methods(){

			$payment_methods = array();

			// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.MissingUnslash,WordPress.Security.ValidatedSanitizedInput.InputNotSanitized,WordPress.Security.ValidatedSanitizedInput.InputNotValidated
			foreach ( $_POST['cashcred_user_settings'] as $type_id => $value ) {

				$payment_method_data = array();

				foreach ( $value as $field_id => $field_value ) {
					$payment_method_data[ $field_id ] = sanitize_text_field( $field_value );
				}

				$payment_methods[ $type_id ] = $payment_method_data;
			}
			mycred_update_user_meta( get_current_user_id(), 'cashcred_user_settings', '', $payment_methods );
		}

		public function process_new_withdraw_request( $gateway_id ){

			global $wp;
			
			$requested_url 		   = isset( $_SERVER['REQUEST_URI'] ) ? sanitize_url( wp_unslash( home_url( $wp->request ) ) ) . sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '';	 
			$point_type			   = isset( $_POST['cashcred_point_type'] ) ? sanitize_text_field( wp_unslash( $_POST['cashcred_point_type'] ) ) : '';
			$cashcred_pay_method   = isset( $_POST['cashcred_pay_method'] ) ? sanitize_text_field( wp_unslash( $_POST['cashcred_pay_method'] ) ) : '';
			$points 			   = isset( $_POST['points'] ) ? sanitize_text_field( wp_unslash( $_POST['points'] ) ) : "";
			
			$mycred_pref_cashcreds = mycred_get_option( 'mycred_pref_cashcreds' , false );

			$currency 			   = $mycred_pref_cashcreds['gateway_prefs'][$gateway_id]['currency'];
			$cost 				   = 1;

			if ( ! empty( $mycred_pref_cashcreds['gateway_prefs'][$gateway_id]['exchange'][$point_type] ) ) {
				$cost 			   = $mycred_pref_cashcreds['gateway_prefs'][$gateway_id]['exchange'][$point_type];
			}
			
			$user_balance = mycred_get_users_balance( get_current_user_id() , $point_type );
			
			//adding fees attribute in cashcred 2.4
			$cashcred_setting = mycred_get_cashcred_settings();
			if( ! empty( $cashcred_setting['fees'] ) ){
			
				$fee = 0;
				if( $cashcred_setting['fees']['use'] == 1 ) {
					
					$fee_amount = $cashcred_setting['fees']['types'][$point_type]['amount'];
					$fee = $fee_amount;
					if( $cashcred_setting['fees']['types'][$point_type]['by'] == 'percent' && is_numeric($fee_amount) )
						$fee = ( ( $fee_amount / 100 ) * $points );

					if( $cashcred_setting['fees']['types'][$point_type]['min_cap'] != 0 )
						$fee = $fee + $cashcred_setting['fees']['types'][$point_type]['min_cap'];

					if( $cashcred_setting['fees']['types'][$point_type]['max_cap'] != 0 && $fee > $cashcred_setting['fees']['types'][$point_type]['max_cap'] )
						$fee = intval($cashcred_setting['fees']['types'][$point_type]['max_cap']);
						
						 $cashcred_fees = !empty($fee) ? $fee : 0 ;
						
					     $fee_points = $points + $cashcred_fees; 

					if( $user_balance < $fee_points ){
				
						$notice = __('Insufficient funds after adding fee'); 
						$this->notification_message( $notice, $requested_url );

					}
				}
			}


			if( $user_balance < $points ){
					 
				$format = __('Insufficient funds your point is %s');  
				$notice = sprintf($format, mycred_display_users_balance( get_current_user_id() , $point_type ));

				$this->notification_message( $notice, $requested_url );
				
			}
			
			$user_id = get_current_user_id();
			
			$post_id = wp_insert_post( array(
				'post_title'     => '',
				'post_type'      => 'cashcred_withdrawal',
				'post_status'    => 'publish',
				'post_author'    =>  $user_id,
				'ping_status'    => 'closed',
				'comment_status' => 'open'
			) );
			
			if ( $post_id !== NULL && ! is_wp_error( $post_id ) ) {
				
				wp_update_post( array( 'ID' => $post_id, 'post_title' => $post_id ) );
				$remote_addr = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '';
				//Will store post meta by checking multisite and current blog, Will store in current blog's table
				check_site_add_post_meta( $post_id, 'point_type',   $point_type, true );
				check_site_add_post_meta( $post_id, 'gateway', 		$cashcred_pay_method , true );
				check_site_add_post_meta( $post_id, 'points',     	$points, true );
				check_site_add_post_meta( $post_id, 'fee_points',   $fee, true );
				check_site_add_post_meta( $post_id, 'cost',         $cost, true );
				check_site_add_post_meta( $post_id, 'currency',     $currency, true );
				check_site_add_post_meta( $post_id, 'from',         get_current_user_id(), true );
				check_site_add_post_meta( $post_id, 'user_ip',      $remote_addr, true );
				check_site_add_post_meta( $post_id, 'manual',       'Manual', true );
				
				if( isset( $mycred_pref_cashcreds['gateway_prefs'][ $cashcred_pay_method ]["allow_auto_withdrawal"] ) && 
					$mycred_pref_cashcreds['gateway_prefs'][ $cashcred_pay_method ]["allow_auto_withdrawal"] == "yes" ) {
					
					$cashcred_auto_payment = $this->cashcred_pay_now( $post_id, true );
                    
                    if(isset( $cashcred_auto_payment['status'] ) && ! $cashcred_auto_payment['status'] ) {
                        mycred_cashcred_update_status( $post_id, 'status', 'Pending' );
                    }
					
					$this->notification_message( $cashcred_auto_payment['message'], $requested_url );

				}
				else {
					mycred_cashcred_update_status( $post_id, 'status', 'Pending' );
				}
					    
				$this->notification_message( '', $requested_url );

			}

		}

		public function can_withdraw_request() {

			$response = false; 
			$pending_withdrawal = cashcred_get_withdraw_requests('Pending');
			
			if( ! empty( $_POST['points'] ) && 
				! empty( $_POST['cashcred_point_type'] ) && 
				! empty( $_POST['cashcred_pay_method'] ) && 
				! empty( $_POST['cashcred_withdraw_wpnonce'] ) && 
				wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['cashcred_withdraw_wpnonce'] ) ), 'cashCred-withdraw-request' ) && 
				empty( $pending_withdrawal )
			) {
				$response = true;
			}

			return apply_filters( 'cashcred_can_withdraw_request', $response );

		}

		public function can_save_settings() {

			$response = false; 

			if( isset( $_POST['cashcred_save_settings'] ) && 
				! empty( $_POST['cashcred_user_settings'] ) && 
				! empty( $_POST['cashcred_settings_wpnonce'] ) && 
				wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['cashcred_settings_wpnonce'] ) ), 'cashCred-payment-settings' ) 
			) {
				$response = true;
			}

			return apply_filters( 'can_save_payment_methods', $response );

		}

		public function notification_message( $message, $url ) {

			if ( ! empty( $message ) ) 
				update_user_meta( get_current_user_id(), 'cashcred_notice', $message );

			wp_redirect( $url ); 
			exit;

		}

		/**
		 * Process New Request
		 * @since 1.8
		 * @version 1.0
		 */
		public function process_new_request() {
			
		
			global $cashcred_instance, $cashcred_withdraw;

			if ( $cashcred_instance->checkout === false && isset( $_REQUEST['mycred_buy'] ) )
				$cashcred_instance->checkout = true;

			if ( $cashcred_instance->checkout ) {

				$cashcred_withdraw = true;

			}

		}

		/**
		 * Hide Comments
		 * @since 2.0
		 * @version 1.0
		 */
		public function hide_cashcred_transactions( $query ) {

			global $post_type;

			if ( $post_type != MYCRED_CASHCRED_KEY ) {

				if ( empty( $query->query_vars['type__in'] ) ) {

					if( ! empty( $query->query_vars['type__not_in'] ) && is_array( $query->query_vars['type__not_in'] ) ) {

						array_push( $query->query_vars['type__not_in'], 'cashcred' );

					}
					else {
							
						$query->query_vars['type__not_in'] = array( 'cashcred' );

					}

				}
	
			}
		    
		}

		/**
		 * Enqueue Footer
		 * @since 1.8
		 * @version 1.0
		 */
		public function enqueue_footer() {

			global $cashcred_instance, $cashcred_withdraw;

			if ( $cashcred_withdraw ) {

				$mycred_pref_cashcreds = mycred_get_option( 'mycred_pref_cashcreds' , false );

				$cashcred_user_settings = mycred_get_user_meta( get_current_user_id(), 'cashcred_user_settings', '', true );
			
				$exchange = array();

				$gateway_notices = array();
				 
				foreach( $cashcred_instance->active as $active_gateway_key =>  $active_gateway_value ){
				
					$currency_value 	 = $mycred_pref_cashcreds['gateway_prefs'][$active_gateway_key]["currency"];
					$cost_value 		 = $mycred_pref_cashcreds['gateway_prefs'][$active_gateway_key]["exchange"];
					$minimum_amount 	 = $mycred_pref_cashcreds['gateway_prefs'][$active_gateway_key]["minimum_amount"];
					$maximum_amount 	 = $mycred_pref_cashcreds['gateway_prefs'][$active_gateway_key]["maximum_amount"];
					
					$exchange[$active_gateway_key] = array( 
						"point_type" => $cost_value,
						"currency"   => $currency_value,
						"min"        => $minimum_amount,
						"max"        => $maximum_amount
					);

					if ( ! empty( $cashcred_user_settings ) && is_array( $cashcred_user_settings ) && array_key_exists( $active_gateway_key , $cashcred_user_settings ) ) {

						$gateway_notices[ $active_gateway_key ] = false;
						
						foreach ( $cashcred_user_settings[ $active_gateway_key ] as $field ) {
							 
							if ( empty( $field ) ) {
								$gateway_notices[ $active_gateway_key ] = true;
								break;
							}

						}

					}
					else {

						$gateway_notices[ $active_gateway_key ] = true;
					
					}

				}

				wp_enqueue_style( 'cashcred-withdraw' );

				wp_localize_script(
					'cashcred-withdraw',
					'cashcred',
					apply_filters( 'mycred_cashcred_withdraw_js', array(
						'ajaxurl'         => home_url( '/' ),
						'exchange'	      => $exchange,
						'gateway_notices' => $gateway_notices,
 					), $this )
				);
				wp_enqueue_script( 'cashcred-withdraw' );

			}

		}

		/**
		 * Admin Init
		 * @since 1.5
		 * @version 1.1
		 */
		public function module_admin_init() {

			// Prep
			$installed = mycred_get_cashcred_gateways();

			// Make sure we have installed gateways.
			if ( empty( $installed ) ) return;

			/**
			 * Admin Init
			 * Runs though all installed gateways to allow admin inits.
			 */
			foreach ( $installed as $id => $data )
				$this->call( 'admin_init', $installed[ $id ]['callback'] );

		}

		/**
		 * Page Header
		 * @since 1.3
		 * @version 1.2
		 */
		public function settings_header() {

			wp_enqueue_style( 'mycred-bootstrap-grid' );

		}

		/**
		 * Payment Gateways Page
		 * @since 0.1
		 * @since 2.3 Added paid gateway tabs `mycred_cashcred_more_gateways_tab` 
		 * @version 1.2.2
		 */
		public function admin_page() {

			// Security
			if ( ! $this->core->user_is_point_admin() ) wp_die( 'Access Denied' );

			$installed = $this->get();

?>
<div class="wrap mycred-metabox" id="myCRED-wrap">
	<h1><?php esc_html_e( 'cashCred Payment Gateways', 'mycred' ); ?></h1>
<?php

			// Updated settings
			if ( isset( $_GET['settings-updated'] ) && $_GET['settings-updated'] == true )
				echo '<div class="updated settings-error"><p>' . esc_html__( 'Settings Updated', 'mycred' ) . '</p></div>';

?>
	<form method="post" action="options.php" class="form">

		<?php settings_fields( $this->settings_name ); ?>

		<?php do_action( 'mycred_before_cashcred_page', $this ); ?>

		<div class="list-items expandable-li" id="accordion">
<?php

			if ( ! empty( $installed ) ) {
				foreach ( $installed as $key => $data ) {

					$has_documentation = ( array_key_exists( 'documentation', $data ) && ! empty( $data['documentation'] ) ) ? esc_url_raw( $data['documentation'] ) : false;
					$has_test_mode     = ( array_key_exists( 'sandbox', $data ) ) ? (bool) $data['sandbox'] : false;
					$sandbox_mode      = ( array_key_exists( $key, $this->gateway_prefs ) && array_key_exists( 'sandbox', $this->gateway_prefs[ $key ] ) && $this->gateway_prefs[ $key ]['sandbox'] === 1 ) ? true : false;

					if ( ! array_key_exists( 'icon', $data ) )
						$data['icon'] = 'dashicons-admin-plugins';

					$column_class = 'col-lg-6 col-md-6 col-sm-12 col-xs-12';
					if ( ! $has_documentation && ! $has_test_mode )
						$column_class = 'col-lg-12 col-md-12 col-sm-12 col-xs-12';
					elseif ( $has_documentation && $has_test_mode )
						$column_class = 'col-lg-4 col-md-4 col-sm-12 col-xs-12';

?>
			<div class="mycred-ui-accordion">
				<div class="mycred-ui-accordion-header">
					<h4 class="mycred-ui-accordion-header-title">
						<span class="dashicons <?php echo esc_attr( $data['icon'] ); ?><?php if ( $this->is_active( $key ) ) { if ( $sandbox_mode ) echo ' debug'; else echo ' active'; } else echo ' static'; ?> mycred-ui-accordion-header-icon"></span>
						<label><?php echo wp_kses_post( $this->core->template_tags_general( $data['title'] ) ); ?></label>
					</h4>
					<div class="mycred-ui-accordion-header-actions hide-if-no-js">
						<button type="button" aria-expanded="true">
							<span class="mycred-ui-toggle-indicator" aria-hidden="true"></span>
						</button>
					</div>
				</div>
				<div class="body mycred-ui-accordion-body" style="display: none;">
					<div class="row">
						<div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
							<div class="form-group">
								<div>&nbsp;</div>
								<label for="cashcred-gateway-<?php echo esc_attr( $key ); ?>"><input type="checkbox" name="mycred_pref_cashcreds[active][]" id="cashcred-gateway-<?php echo esc_attr( $key ); ?>" value="<?php echo esc_attr( $key ); ?>"<?php if ( $this->is_active( $key ) ) echo ' checked="checked"'; ?> /> <?php esc_html_e( 'Enable', 'mycred' ); ?></label>
							</div>
						</div>
						<div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
							<?php if ( $has_test_mode ) : ?>
							<div class="form-group">
								<div>&nbsp;</div>
								<label for="cashcred-gateway-<?php echo esc_attr( $key ); ?>-sandbox"><input type="checkbox" name="mycred_pref_cashcreds[gateway_prefs][<?php echo esc_attr( $key ); ?>][sandbox]" id="cashcred-gateway-<?php echo esc_attr( $key ); ?>-sandbox" value="<?php echo esc_attr( $key ); ?>"<?php if ( $sandbox_mode ) echo ' checked="checked"'; ?> /> <?php esc_html_e( 'Sandbox Mode', 'mycred' ); ?></label>
							</div>
							<?php endif; ?>
						</div>
						<div class="col-lg-4 col-md-4 col-sm-12 col-xs-12" style="text-align: right;">
							<?php if ( MYCRED_DEFAULT_LABEL === 'myCRED' && $has_documentation ) : ?>
							<div class="form-group">
								<div>&nbsp;</div>
								<a href="<?php echo esc_url( $has_documentation ); ?>" target="_blank"><?php esc_html_e( 'Documentation', 'mycred' ); ?></a>
							</div>
							<?php endif; ?>
						</div>
					</div>
					<hr />
					<br />

					<?php $this->call( 'preferences', $data['callback'] ); ?>

					<input type="hidden" name="mycred_pref_cashcreds[installed]" value="<?php echo esc_attr( $key ); ?>" />
				</div>
			</div>
<?php

				}
			}

			$more_gateways_tab = array();

			$more_gateways_tab[] = array(
				'icon'				=>	'dashicons dashicons-admin-generic static',
				'text'				=>	'Paypal',
				'additional_text'	=>	'Paid',
				'url'				=>	'https://mycred.me/store/cashcred-paypal/',
				'status'			=>	'disabled',
				'plugin'			=>	'mycred-cashcred-paypal/mycred-cashcred-paypal.php'
			);

			$more_gateways_tab[] = array(
				'icon'				=>	'dashicons dashicons-admin-generic static',
				'text'				=>	'Stripe',
				'additional_text'	=>	'Paid',
				'url'				=>	'https://mycred.me/store/cashcred-stripe/',
				'status'			=>	'disabled',
				'plugin'			=>	'mycred-cashcred-stripe/mycred-cashcred-stripe.php'
			);

			$more_gateways_tab[] = array(
				'icon'				=>	'dashicons dashicons-admin-generic static',
				'text'				=>	'More Gateways',
				'url'				=>	'https://mycred.me/product-category/cashcred-gateways/',
			);

			$more_gateways_tab = apply_filters( 'mycred_cashcred_more_gateways_tab', $more_gateways_tab );

			$counter = 0;

			if( MYCRED_SHOW_PREMIUM_ADDONS )
			{
				include_once( ABSPATH . 'wp-admin/includes/plugin.php' );

				foreach( $more_gateways_tab as $key => $gateway )
				{
					if ( isset( $gateway['plugin'] ) && is_plugin_active( $gateway['plugin'] ) )
					{
						$counter++;
						continue;
					}
					
					//If all gateways are active, don't show more gateways
					if( $counter == count( $more_gateways_tab )-1 )
						break;

					$disabled_class = ( isset( $gateway['status'] ) && $gateway['status'] == 'disabled' )  ? 'disabled' : '';

					?>

<div class="mycred-ui-accordion <?php esc_attr_e( $disabled_class );?>">
	<div class="mycred-ui-accordion-header buycred-cashcred-more-tab-btn" data-url="<?php esc_attr_e( $gateway['url'] );?>">
		<h4 class="mycred-ui-accordion-header-title">
			<span class="dashicons <?php esc_html_e( $gateway['icon'] );?> static mycred-ui-accordion-header-icon"></span>
			<label><?php esc_html_e( $gateway['text'] ); ?></label>
			<?php if( array_key_exists( 'additional_text', $gateway )  && ! empty( $gateway['additional_text'] ) ): ?>
			<span class="mycred-ui-badge"><?php esc_html_e( $gateway['additional_text'] );?></span>
			<?php endif;?>
		</h4>
	</div>
	<div class="body" style="display:none; padding: 0px; border: none;"></div>
</div>

					<?php
				}
			}

?>
		</div>

		<?php do_action( 'mycred_after_cashcred_page', $this ); ?>

		<?php submit_button( __( 'Update Settings', 'mycred' ), 'mycred-ui-mt20 mycred-ui-btn-purple', 'submit', false ); ?>

	</form>

	<?php do_action( 'mycred_bottom_cashcred_page', $this ); ?>

<script type="text/javascript">
jQuery(function($) {
	$( 'select.currency' ).change(function(){
		var target = $(this).attr( 'data-update' );
		$( '.' + target ).empty();
		$( '.' + target ).text( $(this).val() );
	});
});
</script>
</div>
<?php

		}

		/**
		 * Sanititze Settings
		 * @since 0.1
		 * @version 1.3.1
		 */
		public function sanitize_settings( $data ) {

			$data      = apply_filters( 'mycred_cashcred_save_prefs', $data );
			$installed = $this->get();

			if ( empty( $installed ) ) return $data;

			foreach ( $installed as $gateway_id => $gateway ) {

				$gateway_id     = (string) $gateway_id;
				$submitted_data = ( ! empty( $data['gateway_prefs'] ) && array_key_exists( $gateway_id, $data['gateway_prefs'] ) ) ? $data['gateway_prefs'][ $gateway_id ] : false;

				// No need to do anything if we have no data
				if ( $submitted_data !== false )
					$data['gateway_prefs'][ $gateway_id ] = $this->call( 'sanitise_preferences', $installed[ $gateway_id ]['callback'], $submitted_data );

			}

			return $data;

		}

		/**
		 * Settings Page
		 * @since 1.2.3
		 * @version 1.2
		 */
		public function after_general_settings( $mycred = NULL ) {

			$cashcred_prefs = mycred_get_cashcred_settings();
			$point_types = $mycred->point_types;
			?>
			<div class="mycred-ui-accordion">
				<div class="mycred-ui-accordion-header">
                    <h4 class="mycred-ui-accordion-header-title">
                        <span class="dashicons dashicons-mycred-cashcred static mycred-ui-accordion-header-icon"></span>
                        <label><strong>cash</strong>CRED</label>
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
							<div class="form-group">
								<label for="mycred_pref_core_cashcreds_debugging"><?php esc_html_e( 'Payment Debugging Log', 'mycred' ); ?></label>
								<select class="form-control" name="mycred_pref_core[cashcreds][debugging]" id="mycred_pref_core_cashcreds_debugging">
									<option value="disable" <?php echo $cashcred_prefs['debugging'] != 'enable' ? 'selected="selected"' : ''; ?>>Disabled</option>
									<option value="enable" <?php echo $cashcred_prefs['debugging'] == 'enable' ? 'selected="selected"' : ''; ?>>Enable</option>
								</select>
								<p><span class="description"><?php esc_html_e( 'Payment Debugging log for developers.', 'mycred' ); ?></span></p>
							</div>
						</div>
					</div>
					<hr class="mb-4" />
					<h3><?php esc_html_e( 'Fee Setup', 'mycred' ); ?></h3>
						<div class="row">
							<div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
								<div class="form-group">
									<label for="<?php echo esc_attr( $this->field_id( array( 'fees' => 'use' ) ) ); ?>"><input type="checkbox" name="mycred_pref_core[cashcreds][fees][use]" id="<?php echo esc_attr( $this->field_id( array( 'fees' => 'use' ) ) ); ?>"<?php checked( $cashcred_prefs['fees']['use'], 1 ); ?> value="1" /> <?php esc_html_e( 'Enable this feature', 'mycred' ); ?></label>
								</div>
							</div>
							<div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
								<div class="form-group">
									<label for="<?php echo esc_attr( $this->field_id( array( 'fees' => 'account' ) ) ); ?>"><?php esc_html_e( 'Fee Account', 'mycred' ); ?></label>
									<input type="text" class="form-control" name="mycred_pref_core[cashcreds][fees][account]" id="<?php echo esc_attr( $this->field_id( array( 'fees' => 'account' ) ) ); ?>" value="<?php echo esc_attr( $cashcred_prefs['fees']['account'] ); ?>" />
									<p><span class="description"><?php esc_html_e( 'Option to deposit transfer fees into a specific users account. Use zero to disable.', 'mycred' ); ?></span></p>
								</div>
							</div>
						</div>
						<?php
						
						foreach ( $point_types as $key => $key ) {

							$mycred = mycred( $key );
							if ( ! array_key_exists( $key, $cashcred_prefs['fees']['types'] ) )
								$cashcred_prefs['fees']['types'][ $key ] = array(
									'amount'       => 0,
									'by'           => 'percent',
									'min_cap'      => 0,
									'max_cap'      => 0,
									'presentation' => '( %fee% + %min% ) max. %max% = %total%'
								);

						?>
						<hr class="mb-4">
						<div class="row">
							<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
								<h3><?php printf( esc_html__( '%s Transfer Fee', 'mycred' ), esc_html( $mycred->plural() ) ); ?></h3>
							</div>
						</div>
						<div class="row">
							<div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
								<div class="form-group">
									<div class="row">
										<label for="<?php echo esc_attr( $this->field_id( array( 'fees', 'types', $key, 'amount' ) ) ); ?>"><?php esc_html_e( 'The Fee', 'mycred' ); ?></label>
										<div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
									
											<input class="form-control" type="text" size="8" name="mycred_pref_core[cashcreds][fees][types][<?php echo esc_attr( $key ); ?>][amount]" id="<?php echo esc_attr( $this->field_id( array( 'fees', 'types', $key, 'amount' ) ) ); ?>" value="<?php echo esc_attr( $cashcred_prefs['fees']['types'][ $key ]['amount'] ); ?>" />
										</div> 
										<div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
											<select class="form-control" name="mycred_pref_core[cashcreds][fees][types][<?php echo esc_attr( $key ); ?>][by]" id="<?php echo esc_attr( $this->field_id( array( 'fees', 'types', $key, 'by' ) ) ); ?>"><?php

												$options = array( 'percent' => __( 'Percent', 'mycred' ), 'sum' => $mycred->plural() );
												foreach ( $options as $value => $label ) {
													echo '<option value="' . esc_html( $value ) . '"';
													if ( $cashcred_prefs['fees']['types'][ $key ]['by'] == $value ) echo ' selected="selected"';
													echo '>' . esc_html( $label ) . '</option>';
												}?>
												
											</select>
										</div>
									</div>
									<p><span class="description"><?php esc_html_e( 'Use zero for no fee.', 'mycred' ); ?></span></p>
								</div>
							</div>
							<div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
								<div class="form-group">
									<label for="<?php echo esc_attr( $this->field_id( array( 'fees', 'types', $key, 'min_cap' ) ) ); ?>"><?php esc_html_e( 'Minimum Charge', 'mycred' ); ?> (<?php echo esc_html( $mycred->plural() ); ?>)</label>
									<input class="form-control" type="text" size="8" name="mycred_pref_core[cashcreds][fees][types][<?php echo esc_attr( $key ); ?>][min_cap]" id="<?php echo esc_attr( $this->field_id( array( 'fees', 'types', $key, 'min_cap' ) ) ); ?>" value="<?php echo esc_attr( $cashcred_prefs['fees']['types'][ $key ]['min_cap'] ); ?>" />
									<p><span class="description"><?php esc_html_e( 'Option to set a minimum charge. If set, this amount is added on top of the fee. Example 2% fee + 1.30 points. Use zero to disable.', 'mycred' ); ?></span></p>
								</div>
							</div>
							<div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
								<div class="form-group">
									<label for="<?php echo esc_attr( $this->field_id( array( 'fees', 'types', $key, 'max_cap' ) ) ); ?>"><?php esc_html_e( 'Maximum Cap', 'mycred' ); ?> (<?php echo esc_html( $mycred->plural() ); ?>)</label>
									<input class="form-control" type="text" size="8" name="mycred_pref_core[cashcreds][fees][types][<?php echo esc_attr( $key ); ?>][max_cap]" id="<?php echo esc_attr( $this->field_id( array( 'fees', 'types', $key, 'max_cap' ) ) ); ?>" value="<?php echo esc_attr( $cashcred_prefs['fees']['types'][ $key ]['max_cap'] ); ?>" />
									<p><span class="description"><?php esc_html_e( 'Optional maximum cap for transfer fees. Use zero to disable.', 'mycred' ); ?></span></p>
								</div>
							</div>
						</div>
						<div class="row">
							<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
								<div class="form-group">
									<label for="<?php echo esc_attr( $this->field_id( array( 'fees', 'types', $key, 'presentation' ) ) ); ?>"><?php esc_html_e( 'Presentation', 'mycred' ); ?></label>
									<input type="text" class="form-control" name="mycred_pref_core[cashcreds][fees][types][<?php echo esc_attr( $key ); ?>][presentation]" id="<?php echo esc_attr( $this->field_id( array( 'fees', 'types', $key, 'presentation' ) ) ); ?>" value="<?php echo esc_attr( $cashcred_prefs['fees']['types'][ $key ]['presentation'] ); ?>" />
									<p><span class="description"><?php esc_html_e( 'Option to set how fees are displayed to your users. Available template tags are: %fee%, %min% and %max% = %total%', 'mycred' ); ?></span></p>
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
		 * Sanitize & Save Settings
		 * @since 2.0
		 * @version 1.0
		 */
		public function sanitize_extra_settings( $new_data, $data, $general ) {
			
			$point_types = $general->point_types;
			
			$new_data['cashcreds']['debugging'] = sanitize_text_field( $data['cashcreds']['debugging'] );
			$new_data['cashcreds']['fees']['use'] = isset( $data['cashcreds']['fees']['use'] ) ? 1 : 0;
			$new_data['cashcreds']['fees']['account'] = intval( $data['cashcreds']['fees']['account'] );
			$new_data['cashcreds']['fees']['types'] = array();
			foreach ( $point_types as $key => $type ) {

				$new_data['cashcreds']['fees']['types'][$key]['amount'] = sanitize_text_field( $data['cashcreds']['fees']['types'][$key]['amount'] );
				$new_data['cashcreds']['fees']['types'][$key]['by'] = sanitize_text_field( $data['cashcreds']['fees']['types'][$key]['by'] );
				$new_data['cashcreds']['fees']['types'][$key]['min_cap'] = sanitize_text_field( $data['cashcreds']['fees']['types'][$key]['min_cap'] );
				$new_data['cashcreds']['fees']['types'][$key]['max_cap'] = sanitize_text_field( $data['cashcreds']['fees']['types'][$key]['max_cap'] );
				$new_data['cashcreds']['fees']['types'][$key]['presentation'] = wp_filter_post_kses( $data['cashcreds']['fees']['types'][$key]['presentation'] );

			}

			return $new_data;

		}


	}
endif;

/**
 * Load cashCred Module
 * @since 1.7
 * @version 1.0
 */
if ( ! function_exists( 'mycred_load_cashcred_core_addon' ) ) :
	function mycred_load_cashcred_core_addon( $modules, $point_types ) {

		$modules['solo']['cashcred'] = new myCRED_cashCRED_Module();
		$modules['solo']['cashcred']->load();

		return $modules;

	}
endif;
add_filter( 'mycred_load_modules', 'mycred_load_cashcred_core_addon', 30, 2 );
