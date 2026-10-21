<?php
if (!defined('MYCRED_PURCHASE'))
	exit;

/**
 * buyCRED_Pending_Payments class
 * @since 1.7
 * @version 1.2
 */
if (!class_exists('buyCRED_Pending_Payments')):
	class buyCRED_Pending_Payments extends myCRED_Module
	{

		/**
		 * Construct
		 */
		function __construct($type = MYCRED_DEFAULT_TYPE_KEY)
		{

			parent::__construct('buyCRED_Pending_Payments', array(
				'module_name' => 'pending_payments',
				'option_id' => '',
				'defaults' => array(),
				'screen_id' => '',
				'accordion' => false,
				'add_to_core' => false,
				'menu_pos' => 75
			), $type);

		}

		/**
		 * Load
		 * @version 1.0.1
		 */
		public function load()
		{

			add_action('mycred_init', array($this, 'module_init'), $this->menu_pos);
			add_action('mycred_admin_init', array($this, 'module_admin_init'), $this->menu_pos);

			add_action('rest_api_init', array($this, 'register_pending_payments_rest_routes'));
			add_action('admin_enqueue_scripts', array($this, 'enqueue_react_pending_list_scripts'));
			add_action('all_admin_notices', array($this, 'render_react_pending_list_root'));

		}

		/**
		 * Module Init
		 * @since 1.7
		 * @version 1.2
		 */
		public function module_init()
		{

			$this->register_pending_payments();

			add_shortcode(MYCRED_SLUG . '_buy_pending', 'mycred_render_pending_purchases');

			add_action('mycred_pre_process_buycred', array($this, 'intercept_cancellations'));

			add_action('mycred_add_menu', array($this, 'add_to_menu'), $this->menu_pos);
			add_action('transition_post_status', array($this, 'pending_transitions'), 10, 3);

		}

		/**
		 * Intercept Cancellations
		 * @since 1.7
		 * @version 1.1
		 */
		public function intercept_cancellations()
		{

			global $buycred_instance;

			// Intercept payment cancellations
			if (isset($_REQUEST['buycred-cancel']) && isset($_REQUEST['_token'])) {

				$pending_payment_id = sanitize_text_field(wp_unslash($_REQUEST['buycred-cancel']));

				// Verify nonce is bound to this specific transaction
				if ( ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_REQUEST['_token'] ) ), 'buycred-cancel-pending-payment-' . $pending_payment_id ) ) {
					wp_safe_redirect( remove_query_arg( array( 'buycred-cancel', '_token' ) ) );
					exit;
				}

				// Move item to trash (ownership check is inside buycred_trash_pending_payment)
				buycred_trash_pending_payment($pending_payment_id);

				// Redirect
				wp_safe_redirect(remove_query_arg(array('buycred-cancel', '_token')));
				exit;

			}

		}

		/**
		 * Pending Transitions
		 * @since 1.8
		 * @version 1.0
		 */
		public function pending_transitions($new_status, $old_status, $post)
		{

			if ($post->post_status == MYCRED_BUY_KEY) {

				mycred_delete_user_meta($post->post_author, 'buycred_pending_payments');

			}

		}

		/**
		 * Module Admin Init
		 * @since 1.7
		 * @version 1.1
		 */
		public function module_admin_init()
		{

			add_filter('parent_file', array($this, 'parent_file'));
			add_filter('submenu_file', array($this, 'subparent_file'), 10, 2);

			add_action('admin_notices', array($this, 'admin_notices'));
			add_filter('post_row_actions', array($this, 'adjust_row_actions'), 10, 2);
			add_action('admin_head-post.php', array($this, 'edit_pending_payment_style'));
			add_action('admin_head-edit.php', array($this, 'pending_payments_style'));
			add_filter('post_updated_messages', array($this, 'post_updated_messages'));

			add_filter('manage_' . MYCRED_BUY_KEY . '_posts_columns', array($this, 'adjust_column_headers'));
			add_action('manage_' . MYCRED_BUY_KEY . '_posts_custom_column', array($this, 'adjust_column_content'), 10, 2);
			add_filter('bulk_actions-edit-' . MYCRED_BUY_KEY, array($this, 'bulk_actions'));
			add_action('save_post_' . MYCRED_BUY_KEY, array($this, 'save_pending_payment'), 10, 2);

			// Intercept payment completions
			if (isset($_GET['credit']) && isset($_GET['token']) && wp_verify_nonce(sanitize_text_field(wp_unslash($_GET['token'])), 'buycred-payout-pending')) {

				$pending_id = absint($_GET['credit']);

			if ($this->core->user_is_point_editor()) {

						$base_url = admin_url('admin.php?page=mycred-gateways');

						if (buycred_complete_pending_payment($pending_id)) {
							$url = add_query_arg(array('credited' => 1), $base_url);
						} else {
							$url = add_query_arg(array('credited' => 0), $base_url);
						}

						wp_safe_redirect($url);
						exit;

					}

			}

		}

		/**
		 * Register Pending Payments
		 * @since 1.5
		 * @version 1.1
		 */
		protected function register_pending_payments()
		{

			$labels = array(
				'name' => _x('buyCred Pending Payments', 'Post Type General Name', 'mycred'),
				'singular_name' => _x('buyCred Pending Payment', 'Post Type Singular Name', 'mycred'),
				'menu_name' => __('buyCred Pending Payments', 'mycred'),
				'parent_item_colon' => '',
				'all_items' => __('buyCred Pending Payments', 'mycred'),
				'view_item' => '',
				'add_new_item' => '',
				'add_new' => '',
				'edit_item' => __('Edit buyCred Pending Payment', 'mycred'),
				'update_item' => '',
				'search_items' => 'Search',
				'not_found' => __('Not found in Trash', 'mycred'),
				'not_found_in_trash' => __('Not found in Trash', 'mycred'),
			);
			$args = array(
				'labels' => $labels,
				'supports' => array('title', 'comments'),
				'hierarchical' => false,
				'public' => false,
				'show_ui' => true,
				'show_in_menu' => false,
				'show_in_nav_menus' => false,
				'show_in_admin_bar' => false,
				'can_export' => true,
				'has_archive' => false,
				'exclude_from_search' => true,
				'publicly_queryable' => false,
				'register_meta_box_cb' => array($this, 'add_metaboxes')
			);
			register_post_type(MYCRED_BUY_KEY, apply_filters('mycred_setup_pending_payment', $args));

		}

		/**
		 * Adjust Post Updated Messages
		 * @since 1.7
		 * @version 1.1
		 */
		public function post_updated_messages($messages)
		{

			$messages[MYCRED_BUY_KEY] = array(
				0 => '',
				1 => __('Payment Updated.', 'mycred'),
				2 => __('Payment Updated.', 'mycred'),
				3 => __('Payment Updated.', 'mycred'),
				4 => __('Payment Updated.', 'mycred'),
				5 => __('Payment Updated.', 'mycred'),
				6 => __('Payment Updated.', 'mycred'),
				7 => __('Payment Updated.', 'mycred'),
				8 => __('Payment Updated.', 'mycred'),
				9 => __('Payment Updated.', 'mycred'),
				10 => ''
			);

			return $messages;

		}

		/**
		 * Add Comment
		 * @since 1.7
		 * @version 1.0
		 */
		public function add_comment($post_id, $event = '', $time = NULL)
		{

			return buycred_add_pending_comment($post_id, $event, $time);

		}

		/**
		 * Admin Notices
		 * @since 1.7
		 * @version 1.1
		 */
		public function admin_notices()
		{

			if (isset($_GET['post_type']) && $_GET['post_type'] == MYCRED_BUY_KEY && isset($_GET['credited'])) {

				if ($_GET['credited'] == 1)
					echo '<div id="message" class="updated notice is-dismissible"><p>' . esc_html__('Pending payment successfully credited to account.', 'mycred') . '</p><button type="button" class="notice-dismiss"></button></div>';
				elseif ($_GET['credited'] == 0)
					echo '<div id="message" class="error notice is-dismissible"><p>' . esc_html__('Failed to credit the pending payment to account.', 'mycred') . '</p><button type="button" class="notice-dismiss"></button></div>';

			}

		}

		/**
		 * Add Admin Menu Item
		 * @since 1.7
		 * @version 1.1
		 */
		public function add_to_menu()
		{

			// Merged into buyCred Gateways React shell interface

		}

		/**
		 * Parent File
		 * @since 1.7
		 * @version 1.0.1
		 */
		public function parent_file($parent = '')
		{

			global $pagenow;

			if (isset($_GET['post']) && mycred_get_post_type(absint($_GET['post'])) == MYCRED_BUY_KEY && isset($_GET['action']) && $_GET['action'] == 'edit')
				return MYCRED_MAIN_SLUG;

			return $parent;

		}

		/**
		 * Sub Parent File
		 * @since 1.7.8
		 * @version 1.0
		 */
		public function subparent_file($subparent = '', $parent = '')
		{

			global $pagenow;

			if (($pagenow == 'edit.php' || $pagenow == 'post-new.php') && isset($_GET['post_type']) && $_GET['post_type'] == MYCRED_BUY_KEY) {

				return 'edit.php?post_type=' . MYCRED_BUY_KEY;

			} elseif ($pagenow == 'post.php' && isset($_GET['post']) && mycred_get_post_type(absint($_GET['post'])) == MYCRED_BUY_KEY) {

				return 'edit.php?post_type=' . MYCRED_BUY_KEY;

			}

			return $subparent;

		}

		/**
		 * Pending Payment Column Headers
		 * @since 1.5
		 * @version 1.0
		 */
		public function adjust_column_headers($columns)
		{

			return array(
				'cb' => $columns['cb'],
				'comments' => $columns['comments'],
				'title' => __('Transaction ID', 'mycred'),
				'date' => $columns['date'],
				'author' => __('Buyer', 'mycred'),
				'amount' => __('Amount', 'mycred'),
				'cost' => __('Cost', 'mycred'),
				'gateway' => __('Gateway', 'mycred'),
				'ctype' => __('Type', 'mycred')
			);

		}

		/**
		 * Pending Payment Column Content
		 * @since 1.5
		 * @version 1.0
		 */
		public function adjust_column_content($column_name, $post_id)
		{

			global $mycred_modules;

			switch ($column_name) {
				case 'author':

					$from = (int) mycred_get_post_meta($post_id, 'from', true);
					$user = get_userdata($from);

					if (isset($user->display_name))
						echo '<a href="' . esc_url(add_query_arg(array('user_id' => $user->ID), admin_url('user-edit.php'))) . '">' . esc_html($user->display_name) . '</a>';
					else
						echo 'ID: ' . esc_html($from);

					break;
				case 'amount':

					$type = mycred_get_post_meta($post_id, 'point_type', true);
					$amount = mycred_get_post_meta($post_id, 'amount', true);
					$mycred = mycred($type);

					echo esc_html($mycred->format_creds($amount));

					break;
				case 'cost':

					$cost = mycred_get_post_meta($post_id, 'cost', true);
					$currency = mycred_get_post_meta($post_id, 'currency', true);

					echo esc_html($cost . ' ' . $currency);

					break;
				case 'gateway':

					$gateway = mycred_get_post_meta($post_id, 'gateway', true);
					$installed = $mycred_modules['solo']['buycred']->get();

					if (isset($installed[$gateway]))
						echo esc_html($installed[$gateway]['title']);
					else
						echo esc_html($gateway);

					break;
				case 'ctype':

					$type = mycred_get_post_meta($post_id, 'point_type', true);

					if (isset($this->point_types[$type]))
						echo esc_html($this->point_types[$type]);
					else
						echo esc_html($type);

					break;
			}

		}

		/**
		 * Adjust Bulk Actions
		 * @since 1.5
		 * @version 1.0
		 */
		public function bulk_actions($actions)
		{

			unset($actions['edit']);
			return $actions;

		}

		/**
		 * Pending Payment Row Actions
		 * @since 1.5
		 * @version 1.2
		 */
		public function adjust_row_actions($actions, $post)
		{

			if ($post->post_type == MYCRED_BUY_KEY && $post->post_status != 'trash') {

				unset($actions['inline hide-if-no-js']);

				// Add option to "Pay Out" now
				if ($this->core->user_is_point_editor())
					$actions['credit'] = '<a href="' . esc_url(add_query_arg(array(
						'post_type' => MYCRED_BUY_KEY,
						'credit' => $post->ID,
						'token' => wp_create_nonce('buycred-payout-pending')
					), admin_url('edit.php'))) . '">' . __('Pay Out', 'mycred') . '</a>';

			}

			return $actions;

		}

		/**
		 * Edit Pending Payment Style
		 * @since 1.7
		 * @version 1.0.1
		 */
		public function edit_pending_payment_style()
		{

			global $post_type;

			if ($post_type !== MYCRED_BUY_KEY)
				return;

			wp_enqueue_style('mycred-bootstrap-grid');

			add_filter('postbox_classes_buycred_payment_buycred-pending-payment', array($this, 'metabox_classes'));
			add_filter('postbox_classes_buycred_payment_buycred-pending-comments', array($this, 'metabox_classes'));

			?>
			<script type="text/javascript">
				jQuery(function ($) {

					$(document).ready(function () {
						$('h1 .page-title-action, .wrap .page-title-action').remove();
						$('#titlewrap #title').attr('readonly', 'readonly').addClass('readonly');
					});

				});
			</script>
			<?php

		}

		/**
		 * Pending Payment Style
		 * @since 1.7
		 * @version 1.0.1
		 */
		public function pending_payments_style()
		{

			global $post_type;

			if ($post_type !== MYCRED_BUY_KEY)
				return;

			?>
			<script type="text/javascript">
				jQuery(function ($) {

					$(document).ready(function () {
						$('h1 .page-title-action, .wrap .page-title-action').remove();
					});

				});
			</script>
			<?php

		}

		/**
		 * Add Metaboxes
		 * @since 1.7
		 * @version 1.1
		 */
		public function add_metaboxes()
		{

			add_meta_box(
				'buycred-pending-payment',
				__('Pending Payment', 'mycred'),
				array($this, 'metabox_pending_payment'),
				MYCRED_BUY_KEY,
				'normal',
				'high'
			);

			if (MYCRED_BUY_PENDING_COMMENTS)
				add_meta_box(
					'buycred-pending-comments',
					__('History', 'mycred'),
					array($this, 'metabox_pending_comments'),
					MYCRED_BUY_KEY,
					'normal',
					'default'
				);

			remove_meta_box('commentstatusdiv', MYCRED_BUY_KEY, 'normal');
			remove_meta_box('commentsdiv', MYCRED_BUY_KEY, 'normal');

			remove_meta_box('submitdiv', MYCRED_BUY_KEY, 'side');
			add_meta_box(
				'submitdiv',
				__('Actions', 'mycred'),
				array($this, 'metabox_pending_actions'),
				MYCRED_BUY_KEY,
				'side',
				'high'
			);

		}

		/**
		 * Metabox: Pending Actions
		 * @since 1.7
		 * @version 1.0
		 */
		public function metabox_pending_actions($post)
		{
			$delete_url  = get_delete_post_link($post->ID);
			$rest_url    = rest_url('mycred/v1/buycred-payments/' . $post->ID . '/credit');
			$nonce       = wp_create_nonce('wp_rest');
			$redirect_ok   = admin_url('admin.php?page=mycred-gateways&credited=1');
			$redirect_fail = admin_url('admin.php?page=mycred-gateways&credited=0');
			?>
			<div class="submitbox mycred-metabox" id="submitpost">
				<div id="minor-publishing">
					<div style="display:none;">
						<?php submit_button(__('Save', 'mycred'), 'button', 'save'); ?>
					</div>

					<div id="minor-publishing-actions">

						<div>
							<button type="button" id="buycred-metabox-payout"
								class="button button-secondary button-block"
								data-rest="<?php echo esc_url($rest_url); ?>"
								data-nonce="<?php echo esc_attr($nonce); ?>"
								data-redirect-ok="<?php echo esc_url($redirect_ok); ?>"
								data-redirect-fail="<?php echo esc_url($redirect_fail); ?>">
								<?php esc_html_e('Pay Out', 'mycred'); ?>
							</button>
						</div>
						<div><a href="<?php echo esc_url($delete_url); ?>"
								class="button button-secondary button-block"><?php esc_html_e('Trash', 'mycred'); ?></a></div>

					</div>

					<div class="clear"></div>
				</div>
				<div id="major-publishing-actions">

					<div id="publishing-action">
						<span class="spinner"></span>

						<input type="submit" id="publish" class="button button-primary primary button-large"
							value="<?php esc_attr_e('Save Changes', 'mycred'); ?>" />

					</div>
					<div class="clear"></div>
				</div>
			</div>
			<script>
			(function() {
				var btn = document.getElementById('buycred-metabox-payout');
				if (!btn) return;
				btn.addEventListener('click', function() {
					btn.disabled = true;
					btn.textContent = '<?php echo esc_js(__('Processing...', 'mycred')); ?>';
					fetch(btn.dataset.rest, {
						method: 'POST',
						headers: { 'X-WP-Nonce': btn.dataset.nonce }
					})
					.then(function(r) { return r.json().then(function(d) { return {ok: r.ok, data: d}; }); })
					.then(function(res) {
						if (res.ok) {
							window.location.href = btn.dataset.redirectOk;
						} else {
							window.location.href = btn.dataset.redirectFail;
						}
					})
					.catch(function() {
						window.location.href = btn.dataset.redirectFail;
					});
				});
			})();
			</script>
			<?php

		}

		/**
		 * Metabox: Pending Payment
		 * @since 1.7
		 * @version 1.0.1
		 */
		public function metabox_pending_payment($post)
		{

			global $mycred_modules;

			$pending_payment = buycred_get_pending_payment($post->ID);
			$buyer_name = 'ID: ' . $pending_payment->buyer_id;

			$buyer_object = get_userdata($pending_payment->buyer_id);
			if (isset($buyer_object->ID)) {
				$buyer_name = $buyer_object->display_name;
				if ($buyer_name == '')
					$buyer_name = $buyer_object->user_email;
			}

			if ($pending_payment->recipient_id == $pending_payment->buyer_id)
				$recipient_name = $buyer_name;
			else {
				$recipient_name = 'ID: ' . $pending_payment->recipient_id;
				$recipient_object = get_userdata($pending_payment->recipient_id);
				if (isset($recipient_object->ID)) {
					$recipient_name = $recipient_object->display_name;
					if ($recipient_name == '')
						$recipient_name = $recipient_object->user_email;
				}
			}

			if ($pending_payment->point_type == $this->core->cred_id)
				$mycred = $this->core;
			else
				$mycred = mycred($pending_payment->point_type);

			?>
			<div class="form">
				<div class="row">
					<div class="col-md-6">
						<div class="form-group">
							<label><?php esc_html_e('Payer', 'mycred'); ?></label>
							<p class="form-control-static"><?php echo esc_attr($buyer_name); ?></p>
						</div>
					</div>
					<div class="col-md-6">
						<div class="form-group">
							<label><?php esc_html_e('Recipient', 'mycred'); ?></label>
							<p class="form-control-static"><?php echo esc_attr($recipient_name); ?></p>
						</div>
					</div>
				</div>
				<div class="row">
					<div class="col-md-3 col-sm-6">
						<div class="form-group">
							<label for="buycred-pending-payment-point_type"><?php esc_html_e('Point Type', 'mycred'); ?></label>
							<?php

							$buycred_types = isset( $this->core->buy_creds['types'] ) ? $this->core->buy_creds['types'] : array();

							// Just one point type is set for sale. No need for a dropdown menu
							if ( is_array( $buycred_types ) && count( $buycred_types ) == 1 ) {

								?>
								<p class="form-control-static"><?php echo esc_html($mycred->plural()); ?></p>
								<input type="hidden" name="buycred_pending_payment[point_type]"
									value="<?php echo esc_attr($pending_payment->point_type); ?>" />
								<?php

							}

							// Multiple point types are set for sale. Show a dropdown menu
							else {

								?>
								<select name="buycred_pending_payment[point_type]" id="buycred-pending-payment-point_type"
									class="form-control">
									<?php

									foreach ($buycred_types as $point_type) {

										echo '<option value="' . esc_attr($point_type) . '"';
										if ($pending_payment->point_type == $point_type)
											echo ' selected="selected"';
										echo '>' . esc_html(mycred_get_point_type_name($point_type, false)) . '</option>';

									}

									?>
								</select>
								<?php

							}

							?>
						</div>
					</div>
					<div class="col-md-3 col-sm-6">
						<div class="form-group">
							<label for="buycred-pending-payment-gateway"><?php esc_html_e('Gateway', 'mycred'); ?></label>
							<select name="buycred_pending_payment[gateway]" id="buycred-pending-payment-gateway"
								class="form-control">
								<?php

								foreach ($mycred_modules['solo']['buycred']->get() as $gateway_id => $info) {

									echo '<option value="' . esc_attr($gateway_id) . '"';
									if ($pending_payment->gateway_id == $gateway_id)
										echo ' selected="selected"';
									if (!$mycred_modules['solo']['buycred']->is_active($gateway_id))
										echo ' disabled="disabled"';
									echo '>' . esc_html($info['title']) . '</option>';

								}

								?>
							</select>
						</div>
					</div>
					<div class="col-md-2 col-sm-6">
						<div class="form-group">
							<label for="buycred-pending-payment-amount"><?php esc_html_e('Amount', 'mycred'); ?></label>
							<input type="text" name="buycred_pending_payment[amount]" id="buycred-pending-payment-amount"
								class="form-control"
								value="<?php echo esc_attr($mycred->number($pending_payment->amount)); ?>" />
						</div>
					</div>
					<div class="col-md-2 col-sm-6">
						<div class="form-group">
							<label for="buycred-pending-payment-cost"><?php esc_html_e('Cost', 'mycred'); ?></label>
							<input type="text" name="buycred_pending_payment[cost]" id="buycred-pending-payment-cost"
								class="form-control" value="<?php echo esc_attr($pending_payment->cost); ?>" />
						</div>
					</div>
					<div class="col-md-2 col-sm-6">
						<div class="form-group">
							<label for="buycred-pending-payment-currency"><?php esc_html_e('Currency', 'mycred'); ?></label>
							<input type="text" name="buycred_pending_payment[currency]" id="buycred-pending-payment-currency"
								class="form-control" value="<?php echo esc_attr($pending_payment->currency); ?>" />
						</div>
					</div>
				</div>
			</div>
			<?php

		}

		/**
		 * Metabox: Pending Payment Comments
		 * @since 1.7
		 * @version 1.0
		 */
		public function metabox_pending_comments($post)
		{

			$comments = get_comments(array('post_id' => $post->ID, 'type__in' => array('buycred')));

			echo '<ul class="history">';

			if (empty($comments)) {

				$c = new StdClass();
				$c->comment_date = $post->post_date;
				$c->comment_content = __('Pending request created.', 'mycred');

				$event = $this->add_comment($post->ID, $c->comment_content, $c->comment_date);
				if ($event === false)
					$c->comment_content .= ' Unsaved';
				else
					$c->comment_content .= ' ' . $event;

				$comments[] = $c;

			}

			foreach ($comments as $comment) {

				echo '<li><time>' . esc_html($comment->comment_date) . '</time><p>' . esc_html($comment->comment_content) . '</p></li>';

			}

			echo '</ul>';

		}

		/**
		 * Save Pending Payment
		 * @since 1.7
		 * @version 1.0
		 */
		public function save_pending_payment($post_id, $post)
		{

			if (!$this->core->user_is_point_editor() || !isset($_POST['buycred_pending_payment']))
				return;

			// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.MissingUnslash,WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
			$pending_payment = $_POST['buycred_pending_payment'];
			$changed = false;

			foreach ($pending_payment as $meta_key => $meta_value) {

				$new_value = sanitize_text_field($meta_value);
				$old_value = mycred_get_post_meta($post_id, $meta_key, true);
				if ($new_value != $old_value) {
					mycred_update_post_meta($post_id, $meta_key, $new_value);
					$changed = true;
				}

			}

			if ($changed) {
				$user = wp_get_current_user();
				$this->add_comment($post_id, sprintf(__('Pending payment updated by %s', 'mycred'), $user->user_login));
			}

		}

		/**
		 * Enqueue React Pending Payments List Bundle
		 */
		public function enqueue_react_pending_list_scripts()
		{
			$screen    = get_current_screen();
			$post_type = isset($_GET['post_type']) ? sanitize_key($_GET['post_type']) : ($screen && isset($screen->post_type) ? $screen->post_type : '');

			if (!$screen || $screen->base !== 'edit' || $post_type !== MYCRED_BUY_KEY) {
				return;
			}

			$bundle_path = myCRED_ROOT_DIR . 'addons/build/buycred-pending.bundle.js';
			$bundle_url  = plugins_url( 'addons/build/buycred-pending.bundle.js', myCRED_THIS );

			if (!file_exists($bundle_path)) {
				return;
			}

			wp_enqueue_script(
				'mycred-buycred-pending-react',
				$bundle_url,
				array('wp-element', 'wp-i18n'),
				filemtime($bundle_path),
				true
			);

			$rest_url = rest_url('mycred/v1/buycred-payments');

			// Initial data
			$initial_items = array();
			$total_count   = 0;
			$counts        = array('all' => 0, 'trash' => 0);

			try {
				$req = new WP_REST_Request('GET', '/mycred/v1/buycred-payments');
				$res = $this->get_pending_payments_rest($req);
				if ($res && !is_wp_error($res) && method_exists($res, 'get_data')) {
					$data          = $res->get_data();
					$initial_items = isset($data['items']) ? $data['items'] : array();
					$total_count   = isset($data['total']) ? $data['total'] : 0;
					$counts        = isset($data['counts']) ? $data['counts'] : $counts;
				}
			} catch (Exception $e) {}

			wp_localize_script('mycred-buycred-pending-react', 'mycredPendingPaymentsData', array(
				'restUrl'     => $rest_url,
				'nonce'       => wp_create_nonce('wp_rest'),
				'initialData' => array(
					'items'  => $initial_items,
					'total'  => $total_count,
					'counts' => $counts
				),
				'proPromoImageUrl' => plugins_url( 'assets/images/test.png', myCRED_THIS )
			));

			echo '<style type="text/css">
				body.post-type-buycred_payment #wpbody-content > .wrap,
				body.post-type-buycred_payment #posts-filter { display: none !important; }
				body.post-type-buycred_payment #screen-options-link-wrap,
				body.post-type-buycred_payment #screen-options-wrap,
				body.post-type-buycred_payment .screen-meta-toggle { display: none !important; }
				#mycred-buycred-pending-list-root { width: 100%; margin-top: 15px; display: block !important; }
				
				/* Reset WP global input/select/button borders & outlines inside MUI root */
				#mycred-buycred-pending-list-root .MuiInputBase-input,
				#mycred-buycred-pending-list-root input[type="text"],
				#mycred-buycred-pending-list-root input[type="search"] {
					border: none !important;
					background: transparent !important;
					box-shadow: none !important;
					outline: none !important;
				}
				#mycred-buycred-pending-list-root input:focus,
				#mycred-buycred-pending-list-root select:focus,
				#mycred-buycred-pending-list-root button:focus {
					outline: 0 !important;
					box-shadow: none !important;
				}
				
				/* Fix button text color & link state overrides from WP admin links */
				#mycred-buycred-pending-list-root a.MuiButton-root,
				#mycred-buycred-pending-list-root a.MuiButton-root:hover,
				#mycred-buycred-pending-list-root a.MuiButton-root:focus,
				#mycred-buycred-pending-list-root a.MuiButton-root:visited {
					text-decoration: none !important;
				}
				#mycred-buycred-pending-list-root a.MuiButton-containedPrimary,
				#mycred-buycred-pending-list-root a.MuiButton-containedPrimary:hover,
				#mycred-buycred-pending-list-root a.MuiButton-containedPrimary:focus,
				#mycred-buycred-pending-list-root a.MuiButton-containedPrimary:visited {
					color: #ffffff !important;
					background-color: #5e2ced !important;
				}
				#mycred-buycred-pending-list-root a.MuiButton-containedPrimary * {
					color: #ffffff !important;
				}
			</style>';
		}

		/**
		 * Render React Root Container
		 */
		public function render_react_pending_list_root()
		{
			$screen    = get_current_screen();
			$post_type = isset($_GET['post_type']) ? sanitize_key($_GET['post_type']) : ($screen && isset($screen->post_type) ? $screen->post_type : '');

			if ($screen && $screen->base === 'edit' && $post_type === MYCRED_BUY_KEY) {
				echo '<div id="mycred-buycred-pending-list-root"></div>';
			}
		}

		/**
		 * Register REST API Routes for buyCred Pending Payments
		 */
		public function register_pending_payments_rest_routes()
		{
			register_rest_route('mycred/v1', '/buycred-payments', array(
				'methods'             => 'GET',
				'callback'            => array($this, 'get_pending_payments_rest'),
				'permission_callback' => function () {
					return current_user_can($this->core->get_point_editor_capability());
				}
			));

			register_rest_route('mycred/v1', '/buycred-payments/bulk', array(
				'methods'             => 'POST',
				'callback'            => array($this, 'bulk_pending_payments_rest'),
				'permission_callback' => function () {
					return current_user_can($this->core->get_point_editor_capability());
				}
			));

			register_rest_route('mycred/v1', '/buycred-payments/(?P<id>\d+)', array(
				array(
					'methods'             => 'DELETE',
					'callback'            => array($this, 'delete_pending_payment_rest'),
					'permission_callback' => function () {
						return current_user_can($this->core->get_point_editor_capability());
					}
				),
				array(
					'methods'             => 'POST',
					'callback'            => array($this, 'restore_pending_payment_rest'),
					'permission_callback' => function () {
						return current_user_can($this->core->get_point_editor_capability());
					}
				)
			));

			register_rest_route('mycred/v1', '/buycred-payments/(?P<id>\d+)/credit', array(
				'methods'             => 'POST',
				'callback'            => array($this, 'credit_pending_payment_rest'),
				'permission_callback' => function () {
					return current_user_can($this->core->get_point_editor_capability());
				}
			));
		}

		/**
		 * REST GET Handler
		 */
		public function get_pending_payments_rest($request)
		{
			global $mycred_modules;

			$status   = $request->get_param('status') ? sanitize_key($request->get_param('status')) : 'all';
			$search   = $request->get_param('search') ? sanitize_text_field($request->get_param('search')) : '';
			$page     = $request->get_param('page') ? absint($request->get_param('page')) : 1;
			$per_page = $request->get_param('per_page') ? absint($request->get_param('per_page')) : 10;

			$post_status = ($status === 'trash') ? 'trash' : array('publish', 'pending', 'draft', 'future', 'private');

			$args = array(
				'post_type'      => MYCRED_BUY_KEY,
				'post_status'    => $post_status,
				'posts_per_page' => $per_page,
				'paged'          => $page,
				'orderby'        => 'date',
				'order'          => 'DESC',
			);

			if (!empty($search)) {
				$args['s'] = $search;
			}

			$query = new WP_Query($args);
			$items = array();

			$installed_gateways = isset($mycred_modules['solo']['buycred']) ? $mycred_modules['solo']['buycred']->get() : array();

			foreach ($query->posts as $post) {
				$buyer_id     = (int) mycred_get_post_meta($post->ID, 'from', true);
				$buyer_user   = get_userdata($buyer_id);
				$buyer_name   = ($buyer_user && isset($buyer_user->display_name)) ? $buyer_user->display_name : ($buyer_id ? "ID: {$buyer_id}" : 'Guest');
				$buyer_avatar = get_avatar_url($buyer_id, array('size' => 40));

				$type   = mycred_get_post_meta($post->ID, 'point_type', true);
				$mycred = mycred($type);
				$amount = mycred_get_post_meta($post->ID, 'amount', true);
				$cost   = mycred_get_post_meta($post->ID, 'cost', true);
				$curr   = mycred_get_post_meta($post->ID, 'currency', true);
				$gw_id  = mycred_get_post_meta($post->ID, 'gateway', true);

				$gw_title = isset($installed_gateways[$gw_id]) ? $installed_gateways[$gw_id]['title'] : $gw_id;
				$type_label = isset($this->point_types[$type]) ? $this->point_types[$type] : $type;

				$items[] = array(
					'id'               => $post->ID,
					'title'            => $post->post_title ? $post->post_title : "#{$post->ID}",
					'edit_url'         => admin_url('post.php?post=' . $post->ID . '&action=edit'),
					'buyer_id'         => $buyer_id,
					'buyer_name'       => $buyer_name,
					'buyer_avatar'     => $buyer_avatar,
					'amount'           => $amount,
					'formatted_amount' => $mycred->format_creds($amount),
					'cost'             => $cost,
					'currency'         => $curr,
					'gateway'          => $gw_id,
					'gateway_title'    => $gw_title,
					'point_type'       => $type,
					'point_type_label' => $type_label,
					'date'             => get_the_date('M j, Y, g:i a', $post),
					'status'           => $post->post_status,
					'comments_count'   => get_comments_number($post->ID)
				);
			}

			// Counts
			$count_all   = wp_count_posts(MYCRED_BUY_KEY);
			$total_buy   = isset($count_all->{MYCRED_BUY_KEY}) ? (int) $count_all->{MYCRED_BUY_KEY} : 0;
			$total_pub   = isset($count_all->publish) ? (int) $count_all->publish : 0;
			$total_trash = isset($count_all->trash) ? (int) $count_all->trash : 0;

			return rest_ensure_response(array(
				'items'  => $items,
				'total'  => (int) $query->found_posts,
				'counts' => array(
					'all'     => $total_buy + $total_pub,
					'publish' => $total_buy + $total_pub,
					'trash'   => $total_trash
				)
			));
		}

		/**
		 * REST Pay Out / Credit Handler
		 */
		public function credit_pending_payment_rest($request)
		{
			$id = absint($request->get_param('id'));

			$pending_payment = buycred_get_pending_payment( $id );
			if ( $pending_payment === false ) {
				return new WP_Error('credit_failed', 'Pending payment object not found.', array('status' => 400));
			}

			$gateway = buycred_gateway( $pending_payment->gateway_id );
			if ( $gateway === false ) {
				return new WP_Error('credit_failed', 'Gateway instance not found for ID: ' . $pending_payment->gateway_id, array('status' => 400));
			}

			// Complete Payment
			$mycred = mycred( $pending_payment->point_type );
			$reference  = 'buy_creds_with_' . $pending_payment->gateway_id;
			$sales_data = array(
				'to'       => $pending_payment->recipient_id,
				'from'     => $pending_payment->buyer_id,
				'amount'   => $pending_payment->amount,
				'cost'     => $pending_payment->cost,
				'currency' => $pending_payment->currency,
				'ctype'    => $pending_payment->point_type
			);
			$data       = array( 'ref_type' => 'user', 'txn_id' => $pending_payment->transaction_id, 'sales_data' => implode( '|', $sales_data ) );
			$has_entry  = $mycred->has_entry( $reference, $pending_payment->buyer_id, $pending_payment->recipient_id, $data, $pending_payment->point_type );

			// Try direct add_creds
			if (buycred_complete_pending_payment($id)) {
				return rest_ensure_response(array('success' => true, 'message' => __('Pending payment successfully credited.', 'mycred')));
			}

			return new WP_Error('credit_failed', __('Failed to credit pending payment.', 'mycred'), array('status' => 400));
		}

		/**
		 * REST Delete / Trash Handler
		 */
		public function delete_pending_payment_rest($request)
		{
			$id        = absint($request->get_param('id'));
			$force     = filter_var($request->get_param('force'), FILTER_VALIDATE_BOOLEAN);
			$post      = get_post($id);

			if (!$post || $post->post_type !== MYCRED_BUY_KEY) {
				return new WP_Error('not_found', __('Payment not found.', 'mycred'), array('status' => 404));
			}

			if ($force) {
				wp_delete_post($id, true);
			} else {
				wp_trash_post($id);
			}

			return rest_ensure_response(array('success' => true));
		}

		/**
		 * REST Restore Handler
		 */
		public function restore_pending_payment_rest($request)
		{
			$id   = absint($request->get_param('id'));
			$post = get_post($id);

			if (!$post || $post->post_type !== MYCRED_BUY_KEY) {
				return new WP_Error('not_found', __('Payment not found.', 'mycred'), array('status' => 404));
			}

			wp_untrash_post($id);

			return rest_ensure_response(array('success' => true));
		}

		/**
		 * REST Bulk Actions Handler
		 */
		public function bulk_pending_payments_rest($request)
		{
			$ids         = $request->get_param('ids');
			$bulk_action = sanitize_key($request->get_param('bulk_action'));

			if (!is_array($ids) || empty($ids)) {
				return new WP_Error('invalid_ids', __('No items selected.', 'mycred'), array('status' => 400));
			}

			foreach ($ids as $id) {
				$id   = absint($id);
				$post = get_post($id);
				if (!$post || $post->post_type !== MYCRED_BUY_KEY) continue;

				if ($bulk_action === 'trash') {
					wp_trash_post($id);
				} elseif ($bulk_action === 'restore') {
					wp_untrash_post($id);
				} elseif ($bulk_action === 'delete') {
					wp_delete_post($id, true);
				}
			}

			return rest_ensure_response(array('success' => true));
		}

	}
endif;

/**
 * Load buyCRED Pending Module
 * @since 1.7
 * @version 1.0
 */
if (!function_exists('mycred_load_buycred_pending_addon')):
	function mycred_load_buycred_pending_addon($modules, $point_types)
	{

		$modules['solo']['buycred-pending'] = new buyCRED_Pending_Payments();
		$modules['solo']['buycred-pending']->load();

		return $modules;

	}
endif;
add_filter('mycred_load_modules', 'mycred_load_buycred_pending_addon', 40, 2);
