<?php
if ( ! defined( 'myCRED_VERSION' ) ) exit;

/**
 * myCRED_REST_Logs class
 * Handles AJAX requests for log management in the React UI.
 */
class myCRED_REST_Logs {

    public function __construct() {
        add_action( 'wp_ajax_mycred_get_logs_json',      array( $this, 'get_logs_json' ) );
        add_action( 'wp_ajax_mycred_delete_log_entries', array( $this, 'delete_entries' ) );
        add_action( 'wp_ajax_mycred_export_logs_json',   array( $this, 'export_logs_json' ) );
    }

    /**
     * Get Log Entries as JSON
     */
    public function get_logs_json() {
        check_ajax_referer( 'mycred-logs-nonce', 'token' );

        if ( ! current_user_can( 'edit_users' ) ) {
            wp_send_json_error( 'Access Denied' );
        }

        $ctype  = isset($_POST['ctype']) ? sanitize_key($_POST['ctype']) : MYCRED_DEFAULT_TYPE_KEY;
        $page   = isset($_POST['paged']) ? absint($_POST['paged']) : 1;
        $number = isset($_POST['number']) ? absint($_POST['number']) : 10;
        $search = isset($_POST['s']) ? sanitize_text_field($_POST['s']) : '';
        $user   = isset($_POST['user']) ? sanitize_text_field(wp_unslash($_POST['user'])) : '';
        $ref    = isset($_POST['ref']) ? sanitize_key($_POST['ref']) : '';
        $time   = isset($_POST['time']) ? sanitize_text_field( wp_unslash( $_POST['time'] ) ) : '';
        $from   = isset($_POST['from']) ? sanitize_text_field( wp_unslash( $_POST['from'] ) ) : '';
        $to     = isset($_POST['to']) ? sanitize_text_field( wp_unslash( $_POST['to'] ) ) : '';

        $args = array(
            'ctype'  => $ctype,
            'paged'  => $page,
            'number' => $number,
            's'      => $search
        );

        if ( ! empty( $user ) ) {
            $user_id = mycred_get_user_id( $user );
            if ( ! empty( $user_id ) ) {
                $args['user_id'] = $user_id;
            }
        }

        if ( ! empty( $ref ) && $ref !== 'all' ) {
            $args['ref'] = $ref;
        }

        $time_args = $this->build_time_query_args( $time, $from, $to );
        if ( $time_args !== null ) {
            $args['time'] = $time_args;
        }

        $allowed_orderby = array( 'id', 'ref', 'ref_id', 'user_id', 'creds', 'entry', 'time' );
        $orderby         = isset( $_POST['orderby'] ) ? sanitize_text_field( wp_unslash( $_POST['orderby'] ) ) : 'time';
        $order           = isset( $_POST['order'] ) ? strtoupper( sanitize_text_field( wp_unslash( $_POST['order'] ) ) ) : 'DESC';

        if ( ! in_array( $orderby, $allowed_orderby, true ) ) {
            $orderby = 'time';
        }
        if ( ! in_array( $order, array( 'ASC', 'DESC' ), true ) ) {
            $order = 'DESC';
        }

        $args['orderby'] = $orderby;
        $args['order']   = $order;

        $query = new myCRED_Query_Log( $args );
        $entries = array();

        $column_headers = apply_filters(
            'mycred_log_column_headers',
            array(
                'cb'       => '',
                'username' => __( 'User', 'mycred' ),
                'ref'      => __( 'Reference', 'mycred' ),
                'time'     => __( 'Date', 'mycred' ),
                'creds'    => __( 'Amount', 'mycred' ),
                'entry'    => __( 'Entry', 'mycred' ),
            ),
            $query,
            true
        );
        $show_expiry = array_key_exists( 'expiry', $column_headers );

        foreach ( $query->results as $entry ) {
            $user = get_userdata( $entry->user_id );
            
            // Format reference label
            $ref_label = $entry->ref;
            if ( isset( $query->references[ $entry->ref ] ) ) {
                $ref_label = $query->references[ $entry->ref ];
            }

            // Format entry with template tags
            $mycred_obj = mycred( $entry->ctype );
            $parsed_entry = $mycred_obj->parse_template_tags( $entry->entry, $entry );

            $expiry = apply_filters( 'mycred_log_expiry', '', $entry );
            if ( ! is_string( $expiry ) ) {
                $expiry = '';
            }

            $amount_before = ( (float) $entry->creds > 0 ) ? '+' : '';

            $entry_array = array(
                'id'         => $entry->id,
                'user_id'    => $entry->user_id,
                'username'   => $user ? $user->display_name : 'Unknown',
                'avatar'     => get_avatar_url( $entry->user_id, array( 'size' => 32 ) ),
                'reference'  => $ref_label,
                'ref_id'     => $entry->ref_id,
                'amount'           => (float) $entry->creds,
                'formatted_amount' => $mycred_obj->format_creds( $entry->creds, $amount_before, '', true ),
                'entry'      => $parsed_entry,
                'date'       => apply_filters(
                    'mycred_log_date',
                    date_i18n( get_option( 'date_format' ) . ' ' . get_option( 'time_format' ), $entry->time ),
                    $entry->time,
                    $entry
                ),
                'expiry'     => $expiry,
                'raw_time'   => $entry->time,
                'ctype'      => $entry->ctype
            );

            $entries[] = apply_filters( 'mycred_logs_json_entry', $entry_array, $entry, $ctype );
        }

        wp_send_json_success( array(
            'entries'       => $entries,
            'total_pages'   => $query->max_num_pages,
            'total_entries' => $query->num_rows,
            'references'    => $query->references,
            'show_expiry'   => $show_expiry,
        ) );
    }

    /**
     * Delete Log Entries
     */
    public function delete_entries() {
        check_ajax_referer( 'mycred-logs-nonce', 'token' );

        if ( ! current_user_can( 'manage_options' ) ) {
            wp_send_json_error( 'Access Denied' );
        }

        $ids = isset($_POST['ids']) ? array_map( 'absint', $_POST['ids'] ) : array();
        
        if ( empty( $ids ) ) {
            wp_send_json_error( 'No entries selected' );
        }

        global $wpdb, $mycred_log_table;
        
        $deletedCount = 0;
        foreach ( $ids as $id ) {
            $wpdb->delete( $mycred_log_table, array( 'id' => $id ), array( '%d' ) );
            $deletedCount++;
        }

        wp_send_json_success( array( 'message' => "$deletedCount entries deleted successfully" ) );
    }

    /**
     * Export Logs Trigger
     */
    public function export_logs_json() {
        check_ajax_referer( 'mycred-logs-nonce', 'token' );

        if ( ! current_user_can( 'edit_users' ) ) {
            wp_send_json_error( 'Access Denied' );
        }

        if ( ! class_exists( 'myCRED_Query_Export' ) ) {
            wp_send_json_error( 'Export is not available' );
        }

        $format = isset( $_POST['format'] ) ? sanitize_key( wp_unslash( $_POST['format'] ) ) : 'formatted';
        if ( ! in_array( $format, array( 'raw', 'formatted' ), true ) ) {
            $format = 'formatted';
        }

        $ids = array();
        if ( isset( $_POST['ids'] ) ) {
            $ids = array_values( array_unique( array_filter( array_map( 'absint', (array) wp_unslash( $_POST['ids'] ) ) ) ) );
        }

        if ( empty( $ids ) ) {
            $ctype  = isset( $_POST['ctype'] ) ? sanitize_key( $_POST['ctype'] ) : MYCRED_DEFAULT_TYPE_KEY;
            $search = isset( $_POST['s'] ) ? sanitize_text_field( wp_unslash( $_POST['s'] ) ) : '';
            $user   = isset( $_POST['user'] ) ? sanitize_text_field( wp_unslash( $_POST['user'] ) ) : '';
            $ref    = isset( $_POST['ref'] ) ? sanitize_key( $_POST['ref'] ) : '';
            $time   = isset( $_POST['time'] ) ? sanitize_text_field( wp_unslash( $_POST['time'] ) ) : '';
            $from   = isset( $_POST['from'] ) ? sanitize_text_field( wp_unslash( $_POST['from'] ) ) : '';
            $to     = isset( $_POST['to'] ) ? sanitize_text_field( wp_unslash( $_POST['to'] ) ) : '';

            $args = array(
                'ctype'  => $ctype,
                'number' => -1,
                's'      => $search,
            );

            if ( ! empty( $user ) ) {
                $user_id = mycred_get_user_id( $user );
                if ( ! empty( $user_id ) ) {
                    $args['user_id'] = $user_id;
                }
            }

            if ( ! empty( $ref ) && $ref !== 'all' ) {
                $args['ref'] = $ref;
            }

            $time_args = $this->build_time_query_args( $time, $from, $to );
            if ( $time_args !== null ) {
                $args['time'] = $time_args;
            }

            $query = new myCRED_Query_Log( $args );
            if ( empty( $query->results ) ) {
                wp_send_json_error( 'No log entries found to export' );
            }

            foreach ( $query->results as $entry ) {
                $ids[] = absint( $entry->id );
            }
        }

        $export = new myCRED_Query_Export( array(
            'raw'    => ( $format === 'raw' ),
            'number' => -1,
        ) );

        $export_data = $export->get_data_by_ids( $ids );
        if ( empty( $export_data ) ) {
            wp_send_json_error( 'No log entries found to export' );
        }

        wp_send_json_success( array(
            'message'  => 'Export data prepared.',
            'count'    => count( $export_data ),
            'rows'     => $export_data,
            'filename' => 'mycred-logs-' . $format . '-' . gmdate( 'Y-m-d-His' ) . '.csv',
        ) );
    }

    /**
     * Build time query args for the React logs UI.
     *
     * @param string $time  Preset label or keyword.
     * @param string $from  Start date (Y-m-d).
     * @param string $to    End date (Y-m-d).
     * @return string|array|null
     */
    private function build_time_query_args( $time = '', $from = '', $to = '' ) {

        if ( $this->is_valid_date_string( $from ) ) {
            $end_date = $this->is_valid_date_string( $to ) ? $to : $from;

            return array(
                'dates'   => array(
                    $this->date_to_timestamp( $from, '00:00:00' ),
                    $this->date_to_timestamp( $end_date, '23:59:59' ),
                ),
                'compare' => 'BETWEEN',
            );
        }

        if ( empty( $time ) || $time === 'all' || $time === 'All Time' ) {
            return null;
        }

        $preset_map = array(
            'Today'      => 'today',
            'Yesterday'  => 'yesterday',
            'This week'  => 'thisweek',
            'This month' => 'thismonth',
        );

        if ( isset( $preset_map[ $time ] ) ) {
            return $preset_map[ $time ];
        }

        $now = current_time( 'timestamp' );

        if ( $time === 'Last week' ) {
            $weekday = (int) date( 'w', $now );
            $day     = $weekday === 0 ? 7 : $weekday;

            return array(
                'dates'   => array(
                    strtotime( '-' . ( $day + 6 ) . ' days midnight', $now ),
                    strtotime( '-' . $day . ' days 23:59:59', $now ),
                ),
                'compare' => 'BETWEEN',
            );
        }

        if ( $time === 'Last month' ) {
            $start = strtotime( date( 'Y-m-01', strtotime( 'first day of last month', $now ) ) . ' 00:00:00', $now );
            $end   = strtotime( date( 'Y-m-t', strtotime( 'last day of last month', $now ) ) . ' 23:59:59', $now );

            return array(
                'dates'   => array( $start, $end ),
                'compare' => 'BETWEEN',
            );
        }

        if ( $time === 'Year to date' ) {
            return array(
                'dates'   => array(
                    strtotime( date( 'Y-01-01', $now ) . ' 00:00:00', $now ),
                    $now,
                ),
                'compare' => 'BETWEEN',
            );
        }

        if ( $this->is_valid_date_string( $time ) ) {
            return array(
                'dates'   => array(
                    $this->date_to_timestamp( $time, '00:00:00' ),
                    $this->date_to_timestamp( $time, '23:59:59' ),
                ),
                'compare' => 'BETWEEN',
            );
        }

        return null;
    }

    /**
     * @param string $date Y-m-d date string.
     * @return bool
     */
    private function is_valid_date_string( $date ) {
        return is_string( $date ) && preg_match( '/^\d{4}-\d{2}-\d{2}$/', $date );
    }

    /**
     * @param string $date Y-m-d date string.
     * @param string $time H:i:s time string.
     * @return int
     */
    private function date_to_timestamp( $date, $time ) {
        $timezone = function_exists( 'wp_timezone' ) ? wp_timezone() : new DateTimeZone( 'UTC' );
        $datetime = DateTime::createFromFormat( 'Y-m-d H:i:s', $date . ' ' . $time, $timezone );

        return $datetime ? $datetime->getTimestamp() : strtotime( $date . ' ' . $time );
    }
}

new myCRED_REST_Logs();
