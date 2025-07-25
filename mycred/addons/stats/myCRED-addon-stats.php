<?php
/**
 * Addon: Stats
 * Addon URI: http://mycred.me/add-ons/stats/
 * Version: 2.0
 */
if ( ! defined( 'myCRED_VERSION' ) ) exit;

define( 'myCRED_STATS_VERSION',     '2.0' );
define( 'myCRED_STATS',             __FILE__ );
define( 'myCRED_STATS_DIR',         myCRED_ADDONS_DIR . 'stats/' );

// Acceptable values: hex, rgb or rgba
if ( ! defined( 'MYCRED_STATS_COLOR_TYPE' ) )
	define( 'MYCRED_STATS_COLOR_TYPE', 'hex' );

require_once myCRED_STATS_DIR . 'includes/mycred-stats-functions.php';
require_once myCRED_STATS_DIR . 'includes/mycred-stats-object.php';
require_once myCRED_STATS_DIR . 'includes/mycred-stats-shortcodes.php';

do_action( 'mycred_stats_load_widgets' );

/**
 * myCRED_Stats_Module class
 * @since 1.6
 * @version 2.0
 */
if ( ! class_exists( 'myCRED_Stats_Module' ) ) :
	class myCRED_Stats_Module extends myCRED_Module {

		/**
		 * Construct
		 */
		public function __construct( $type = MYCRED_DEFAULT_TYPE_KEY ) {

			parent::__construct( 'myCRED_Stats_Module', array(
				'module_name' => 'stats',
				'defaults'    => mycred_get_addon_defaults( 'stats' ),
				'accordion'   => false,
				'register'    => false,
				'add_to_core' => false
			), $type );

		}

		/**
		 * Load
		 * @since 2.0
		 * @version 1.0
		 */
		public function load() {

			global $mycred_stats_cleared, $mycred_user_stats_cleared;

			$mycred_stats_cleared      = false;
			$mycred_user_stats_cleared = false;

			add_action( 'mycred_register_assets',      array( $this, 'register_assets' ) );
			add_action( 'mycred_init',                 array( $this, 'module_init' ) );
			add_action( 'mycred_admin_init',           array( $this, 'module_admin_init' ) );
			add_action( 'mycred_front_enqueue_footer', array( $this, 'maybe_enqueue_scripts' ) );

			add_action( 'mycred_update_user_balance',  array( $this, 'clear_user_data' ) );
			add_action( 'mycred_set_user_balance',     array( $this, 'clear_user_data' ) );

			add_filter( 'mycred_add_finished',         array( $this, 'clear_data' ) );

			add_action( 'mycred_delete_log_entry',     array( $this, 'force_clear_data' ) );
			add_action( 'mycred_update_log_entry',     array( $this, 'force_clear_data' ) );

			add_action( 'mycred_deleted_log_entry',    array( $this, 'force_clear_user_data' ) );
			add_action( 'mycred_updated_log_entry',    array( $this, 'force_clear_user_data' ) );

		}

		/**
		 * Init
		 * @since 1.6
		 * @version 1.0
		 */
		public function module_init() {

			$this->register_shortcodes();

			add_action( 'mycred_admin_enqueue', array( $this, 'admin_enqueue' ) );

		}

		/**
		 * Register Shortcodes
		 * @since 1.8
		 * @version 1.0
		 */
		public function register_shortcodes() {

			add_shortcode( MYCRED_SLUG . '_chart_circulation',      'mycred_render_chart_circulation' );
			add_shortcode( MYCRED_SLUG . '_chart_gain_loss',        'mycred_render_chart_gain_vs_loss' );

			add_shortcode( MYCRED_SLUG . '_chart_history',          'mycred_render_chart_history' );
			add_shortcode( MYCRED_SLUG . '_chart_balance_history',  'mycred_render_chart_balance_history' );
			add_shortcode( MYCRED_SLUG . '_chart_instance_history', 'mycred_render_chart_instance_history' );

			add_shortcode( MYCRED_SLUG . '_chart_top_balances',     'mycred_render_chart_top_balances' );
			add_shortcode( MYCRED_SLUG . '_chart_top_instances',    'mycred_render_chart_top_instances' );

			add_shortcode( MYCRED_SLUG . '_chart_acquisition',    	'mycred_render_chart_acquisition' );


		}

		/**
		 * Init
		 * @since 1.6
		 * @version 1.1
		 */
		public function module_admin_init() {

			add_action( 'mycred_overview_after',  array( $this, 'overview_after' ) );

			foreach ( $this->point_types as $type_id => $label ) {

				add_action( 'mycred_overview_total_' . $type_id, array( $this, 'overview_total' ), 10, 3 );

			}

			add_action( 'mycred_type_prefs', array( $this, 'after_general_settings' ) );
			add_filter( 'mycred_save_core_prefs',  array( $this, 'sanitize_extra_settings' ), 90, 3 );

			if ( count( $this->point_types ) > 1 ) {

				$priority = 10;
				foreach ( $this->point_types as $type_id => $label ) {

					add_action( 'mycred_type_prefs' . $type_id, array( $this, 'after_general_settings' ), $priority );
					add_filter( 'mycred_save_core_prefs' . $type_id,  array( $this, 'sanitize_extra_settings' ), $priority, 3 );

					$priority += 10;

				}
			}

		}

		/**
		 * Register Assets
		 * @since 2.0
		 * @version 1.0
		 */
		public function register_assets() {

			global $mycred_charts;

			$mycred_charts = array();

			// Built-in
			wp_register_style( 'mycred-stats', plugins_url( 'assets/css/mycred-statistics.css', myCRED_STATS ), array(), myCRED_STATS_VERSION, 'all' );

			// Chart Libraries
			wp_register_script( 'peity',     plugins_url( 'assets/libs/peity.min.js', myCRED_STATS ), array( 'jquery' ), '3.2.1', true );
			wp_register_script( 'charts-js', plugins_url( 'assets/libs/Chart.bundle.min.js', myCRED_STATS ), array( 'jquery' ), '2.7', true );

			wp_register_script( 'mycred-stats', plugins_url( 'assets/js/mycred-statistics.js', myCRED_STATS ), array( 'jquery', 'charts-js' ), myCRED_STATS_VERSION, true );

		}

		/**
		 * Maybe Enqueue Scripts
		 * @since 2.0
		 * @version 1.0
		 */
		public function maybe_enqueue_scripts() {

			global $mycred_charts;

			if ( ! empty( $mycred_charts ) && is_array( $mycred_charts ) ) {

				wp_localize_script(
					'mycred-stats',
					'myCREDStats',
					array(
						'globals' => array(),
						'charts'  => $mycred_charts
					)
				);

				wp_enqueue_script( 'mycred-stats' );

			}

		}

		/**
		 * Clear Data
		 * Will attempt to clear the stats data, assuming we can based on our setup.
		 * @since 2.0
		 * @version 1.0
		 */
		public function clear_data( $value ) {

			global $mycred_stats_cleared;

			if ( $mycred_stats_cleared === true ) return $value;

			mycred_delete_stats_data();

			$mycred_stats_cleared = true;

			return $value;

		}

		/**
		 * Clear User Data
		 * Will attempt to clear the stats data for a user, assuming we can based on our setup.
		 * @since 2.0
		 * @version 1.0
		 */
		public function clear_user_data( $user_id ) {

			global $mycred_user_stats_cleared;

			if ( $mycred_user_stats_cleared === true ) return $user_id;

			mycred_delete_user_stats_data( $user_id );

			$mycred_user_stats_cleared = true;

			return $user_id;

		}

		/**
		 * Force Clear Data
		 * Situations where stats data must be cleared no matter what we set for our setup.
		 * Mainly used when admin edits / deletes log entries in the wp-admin area.
		 * @since 2.0
		 * @version 1.0
		 */
		public function force_clear_data() {

			mycred_delete_stats_data( true );

		}

		/**
		 * Force Clear User Data
		 * Situations where stats data must be cleared no matter what we set for our setup.
		 * Mainly used when admin edits / deletes log entries in the wp-admin area.
		 * @since 2.0
		 * @version 1.0
		 */
		public function force_clear_user_data( $user_id ) {

			mycred_delete_user_stats_data( $user_id, true );

		}

		/**
		 * Overview Total
		 * @since 2.0
		 * @version 1.0
		 */
		public function overview_total( $point_type, $total, $data ) {

			$color = mycred_get_type_color( $point_type );
			$data  = mycred_get_history_data( $point_type );

			if ( ! empty( $data ) ) {

				$values = array();
				foreach ( $data as $dataset ) {
					foreach ( $dataset as $set )
						$values[] = $set->value;
				}

				echo '<span class="' . esc_attr( MYCRED_SLUG ) . '-stats-bar" data-type="' . esc_attr( $point_type ) . '" data-positive="' . esc_attr( $color['positive'] ) . '" data-negative="' . esc_attr( $color['negative'] ) . '" style="display: none;">' . esc_html( implode( ',', $values ) ) . '</span>';

			}

		}

		/**
		 * Overview After
		 * @since 2.0
		 * @version 1.0
		 */
		public function overview_after() {

?>
<script type="text/javascript">
jQuery(function($){

	$( 'span.<?php echo esc_attr( MYCRED_SLUG ); ?>-stats-bar' ).each(function(index,item){

		var barchart      = $(this);
		var positivecolor = barchart.data( 'positive' );
		var negativecolor = barchart.data( 'negative' );

		barchart.peity( "bar", {
			width : '56',
			fill  : function(value) {
				if ( value == 0 ) return '#ededed';
				return value > 0 ? positivecolor : negativecolor
			}
		});

	});

});
</script>
<?php

		}

		/**
		 * Admin Enqueue
		 * @since 2.0
		 * @version 1.0
		 */
		public function admin_enqueue( $hook ) {

			$screen = get_current_screen();

			if ( 'dashboard' == $screen->id ) {

				wp_enqueue_script( 'peity' );

			}

		}

		/**
		 * Add-on Settings
		 * @since 2.0
		 * @version 1.0
		 */
		public function after_general_settings( $mycred = NULL ) {

			$prefs             = $this->stats;
			$this->add_to_core = true;
			if ( $mycred->mycred_type != MYCRED_DEFAULT_TYPE_KEY ) {

				if ( ! isset( $mycred->stats ) )
					$prefs = $this->default_prefs;
				else
					$prefs = $mycred->stats;

				$this->option_id = $mycred->option_id;

			}

			$colors = mycred_get_type_color( $mycred->mycred_type );
			if ( empty( $prefs['color_positive'] ) ) $prefs['color_positive'] = $colors['positive'];
			if ( empty( $prefs['color_negative'] ) ) $prefs['color_negative'] = $colors['negative'];

?>
<div class="mycred-ui-accordion">
	<div class="mycred-ui-accordion-header">
		<h4 class="mycred-ui-accordion-header-title">
			<span class="dashicons dashicons-chart-area static mycred-ui-accordion-header-icon"></span>
			<label><?php esc_html_e( 'Statistics', 'mycred' ); ?></label>
		</h4>
		<div class="mycred-ui-accordion-header-actions hide-if-no-js">
			<button type="button" aria-expanded="true">
				<span class="mycred-ui-toggle-indicator" aria-hidden="true"></span>
			</button>
		</div>
	</div>
	<div class="body mycred-ui-accordion-body" style="display:none;">

		<div class="row">
			<div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">

				<h3><?php esc_html_e( 'Statistics Color', 'mycred' ); ?></h3>
				<div class="row">
					<div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">

						<div class="form-group">
							<label for="<?php echo esc_attr( $this->field_id( 'color_positive' ) ); ?>"><?php esc_html_e( 'Positive Values', 'mycred' ); ?></label>
							<input type="text" name="<?php echo esc_attr( $this->field_name( 'color_positive'  )); ?>" id="<?php echo esc_attr( $this->field_id( 'color_positive' ) ); ?>" value="<?php echo esc_attr( $prefs['color_positive'] ); ?>" class="form-control <?php if ( MYCRED_STATS_COLOR_TYPE == 'hex' ) echo ' wp-color-picker-field" data-default-color="#dedede'; ?>" />
						</div>

					</div>
					<div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">

						<div class="form-group">
							<label for="<?php echo esc_attr( $this->field_id( 'color_negative' ) ); ?>"><?php esc_html_e( 'Negative Values', 'mycred' ); ?></label>
							<input type="text" name="<?php echo esc_attr( $this->field_name( 'color_negative' ) ); ?>" id="<?php echo esc_attr( $this->field_id( 'color_negative' ) ); ?>" value="<?php echo esc_attr( $prefs['color_negative'] ); ?>" class="form-control <?php if ( MYCRED_STATS_COLOR_TYPE == 'hex' ) echo ' wp-color-picker-field" data-default-color="#dedede'; ?>" />
						</div>

					</div>
				</div>

			</div>
			<div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">

	<?php

				if ( $mycred->mycred_type == MYCRED_DEFAULT_TYPE_KEY ) :

					$cache_options = mycred_get_stats_cache_times();

	?>

				<h3><?php esc_html_e( 'Optimization', 'mycred' ); ?></h3>
				<p><span class="description"><?php esc_html_e( 'Disabling these features can improve render time of your charts, especially if you are showing a large number of charts on a single page. You can also select to disable these features when using the chart shortcodes.', 'mycred' ); ?></span></p>
				<div class="row">
					<div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">

						<div class="form-group">
							<div class="checkbox">
								<label for="<?php echo esc_attr( $this->field_id( 'animate' ) ); ?>"><input type="checkbox" name="<?php echo esc_attr( $this->field_name( 'animate' ) ); ?>" id="<?php echo esc_attr( $this->field_id( 'animate' ) ); ?>"<?php checked( $prefs['animate'], 1 ); ?> value="1" /> <?php esc_html_e( 'Animate Charts', 'mycred' ); ?></label>
							</div>
						</div>

					</div>
					<div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">

						<div class="form-group">
							<div class="checkbox">
								<label for="<?php echo esc_attr( $this->field_id( 'bezier' ) ); ?>"><input type="checkbox" name="<?php echo esc_attr( $this->field_name( 'bezier' ) ); ?>" id="<?php echo esc_attr( $this->field_id( 'bezier' ) ); ?>"<?php checked( $prefs['bezier'], 1 ); ?> value="1" /> <?php esc_html_e( 'Use Bezier Curves', 'mycred' ); ?></label>
							</div>
						</div>

					</div>
				</div>

				<div class="form-group">
					<label for="<?php echo esc_attr( $this->field_id( 'caching' ) ); ?>"><?php esc_html_e( 'Caching', 'mycred' ); ?></label>
					<select name="<?php echo esc_attr( $this->field_name( 'caching' ) ); ?>" id="<?php echo esc_attr( $this->field_id( 'caching' ) ); ?>" class="form-control">
	<?php

					foreach ( $cache_options as $value => $label ) {
						echo '<option value="' . esc_attr( $value ) . '"';
						if ( $prefs['caching'] == $value ) echo ' selected="selected"';
						echo '>' . esc_html( $label ) . '</option>';
					}

	?>
					</select>
				</div>

				<?php endif; ?>

			</div>
		</div>

	<?php if ( MYCRED_STATS_COLOR_TYPE == 'hex' ) : ?>
	<script type="text/javascript">
	jQuery(document).ready(function($){

		// Load wp color picker
		$( '.wp-color-picker-field' ).wpColorPicker();
		
	});
	</script>
	<?php endif; ?>

	</div>
</div>
<?php

		}

		/**
		 * Sanitize Settings
		 * @since 2.0
		 * @version 1.0
		 */
		public function sanitize_extra_settings( $new_data, $data, $core ) {

            $data = isset( $data['stats'] ) ? $data['stats'] : array();

            $new_data['stats']['color_positive'] = sanitize_text_field( $data['color_positive'] );
            $new_data['stats']['color_negative'] = sanitize_text_field( $data['color_negative'] );

            $colors                       = mycred_get_type_color();
            $colors[ $core->mycred_type ] = array(
                'positive' => $new_data['stats']['color_positive'],
                'negative' => $new_data['stats']['color_negative']
            );

            mycred_update_option( 'mycred-point-colors', $colors );

            if ( $core->mycred_type == MYCRED_DEFAULT_TYPE_KEY ) {


                $new_data['stats']['animate'] = ( array_key_exists( 'animate', $data ) ? 1 : 0 );
                $new_data['stats']['bezier']  = ( array_key_exists( 'bezier', $data ) ? 1 : 0 );
                $new_data['stats']['caching'] = sanitize_text_field( $data['caching'] );

            }

            return $new_data;

		}

	}
endif;

/**
 * Load Statistics Module
 * @since 1.7
 * @version 1.0
 */
if ( ! function_exists( 'mycred_load_statistics_addon' ) ) :
	function mycred_load_statistics_addon( $modules, $point_types ) {

		$modules['solo']['stats'] = new myCRED_Stats_Module();
		$modules['solo']['stats']->load();

		return $modules;

	}
endif;
add_filter( 'mycred_load_modules', 'mycred_load_statistics_addon', 100, 2 );
