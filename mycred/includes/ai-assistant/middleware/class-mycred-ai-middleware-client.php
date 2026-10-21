<?php
/**
 * myCred AI middleware client.
 *
 * @package myCred
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! class_exists( 'myCRED_AI_Middleware_Client' ) ) {

    class myCRED_AI_Middleware_Client {

        const DEFAULT_OPERATION = 'mycred';

        const EMBEDDED_PROVISION_SECRET = 'mycred-ai-embedded-provision-2026-07-Q4nLs8WpZd';

        const DEFAULT_TOKEN_TOTAL = 60000;

        /**
         * Normalize site URL for middleware validation.
         *
         * @param string $url Site URL.
         * @return string
         */
        public static function normalize_site_url( $url ) {
            $url = untrailingslashit( trim( (string) $url ) );
            if ( '' === $url ) {
                return '';
            }

            $parts = wp_parse_url( $url );
            if ( ! is_array( $parts ) || empty( $parts['host'] ) ) {
                return $url;
            }

            $scheme = isset( $parts['scheme'] ) ? strtolower( (string) $parts['scheme'] ) : 'http';
            $host   = strtolower( (string) $parts['host'] );
            $port   = ! empty( $parts['port'] ) ? ':' . (int) $parts['port'] : '';
            $path   = isset( $parts['path'] ) ? trim( (string) $parts['path'] ) : '';
            $path   = untrailingslashit( $path );
            $out    = $scheme . '://' . $host . $port;

            if ( '' !== $path && '/' !== $path ) {
                $out .= $path;
            }

            return $out;
        }

        /**
         * Middleware config from myCred core prefs.
         *
         * @return array<string, string>
         */
        public static function mw_config() {
            $core = mycred_get_option( 'mycred_pref_core', array() );
            $ai   = isset( $core['ai_settings'] ) && is_array( $core['ai_settings'] ) ? $core['ai_settings'] : array();

            $license = isset( $ai['middleware_license_key'] ) ? trim( (string) $ai['middleware_license_key'] ) : '';
            if ( '' === $license ) {
                $license = get_option( 'mycred_ai_middleware_license_key', '' );
                $license = is_string( $license ) ? trim( $license ) : '';
            }

            $op = self::DEFAULT_OPERATION;
            $op = (string) apply_filters( 'mycred_ai_middleware_operation', $op );

            $site = untrailingslashit( home_url( '/' ) );
            if ( '' === $site ) {
                $site = untrailingslashit( site_url( '/' ) );
            }
            $site = self::normalize_site_url( $site );
            $site = (string) apply_filters( 'mycred_ai_middleware_site_url', $site );

            $base = isset( $ai['middleware_base_url'] ) ? trim( (string) $ai['middleware_base_url'] ) : '';
            if ( '' === $base && defined( 'MYCRED_AI_MIDDLEWARE_BASE_URL' ) ) {
                $base = (string) MYCRED_AI_MIDDLEWARE_BASE_URL;
            }
            $base = (string) apply_filters( 'mycred_ai_middleware_base_url', $base );

            return array(
                'license_key' => $license,
                'operation'   => $op,
                'site_url'    => $site,
                'base_url'    => untrailingslashit( $base ),
            );
        }

        /**
         * Whether a base URL is configured.
         *
         * @return bool
         */
        public static function mw_base_ok() {
            return '' !== self::mw_config()['base_url'];
        }

        /**
         * Build full middleware API URL.
         *
         * @param string $base_url Base URL.
         * @param string $endpoint Endpoint.
         * @return string
         */
        public static function mw_url( $base_url, $endpoint ) {
            $base     = untrailingslashit( (string) $base_url );
            $endpoint = trim( (string) $endpoint, '/' );
            if ( '' === $base || '' === $endpoint ) {
                return '';
            }

            $base_lower = strtolower( $base );
            if ( strlen( $base_lower ) >= 4 && substr( $base_lower, -4 ) === '/api' ) {
                $url = $base . '/' . $endpoint;
            } else {
                $url = $base . '/api/' . $endpoint;
            }

            return (string) apply_filters( 'mycred_ai_middleware_api_url', $url, $base_url, $endpoint );
        }

        /**
         * Whether a license is already available.
         *
         * @return bool
         */
        public static function has_license() {
            return '' !== trim( self::mw_config()['license_key'] );
        }

        /**
         * Fetch non-empty env value.
         *
         * @param string $name Env name.
         * @return string
         */
        private static function env_str( $name ) {
            $value = getenv( $name );
            if ( is_string( $value ) && '' !== $value ) {
                return $value;
            }
            if ( isset( $_ENV[ $name ] ) && is_string( $_ENV[ $name ] ) && '' !== $_ENV[ $name ] ) {
                return (string) $_ENV[ $name ];
            }

            return '';
        }

        /**
         * Secret for provision-free calls.
         *
         * @return string
         */
        public static function provision_secret() {
            foreach ( array( 'MYCRED_AI_PROVISION_SECRET', 'MYCRED_PROVISION_SECRET' ) as $key ) {
                $value = self::env_str( $key );
                if ( '' !== $value ) {
                    return (string) apply_filters( 'mycred_ai_provision_secret', $value );
                }
            }

            $opt = get_option( 'mycred_ai_provision_secret', '' );
            $opt = is_string( $opt ) ? trim( $opt ) : '';
            if ( '' !== $opt ) {
                return (string) apply_filters( 'mycred_ai_provision_secret', $opt );
            }

            return (string) apply_filters( 'mycred_ai_provision_secret', self::EMBEDDED_PROVISION_SECRET );
        }

        /**
         * Admin identity used on first provision.
         *
         * @return array<string, string>
         */
        public static function wp_owner() {
            $admin_email = sanitize_email( (string) get_option( 'admin_email' ) );
            $admin_name  = '';
            $user        = wp_get_current_user();

            if ( $user && $user->ID ) {
                $admin_name = trim( (string) $user->display_name );
            }
            if ( '' === $admin_name ) {
                $admin_name = trim( (string) get_bloginfo( 'name' ) );
            }
            if ( function_exists( 'mb_strlen' ) && function_exists( 'mb_substr' ) && mb_strlen( $admin_name, 'UTF-8' ) > 255 ) {
                $admin_name = mb_substr( $admin_name, 0, 255, 'UTF-8' );
            } elseif ( strlen( $admin_name ) > 255 ) {
                $admin_name = substr( $admin_name, 0, 255 );
            }

            return array(
                'admin_email' => $admin_email,
                'admin_name'  => $admin_name,
            );
        }

        /**
         * User-facing middleware failure. Technical details stay in logs / error data.
         *
         * @param string               $code       Error code.
         * @param string               $technical  Debug detail, not shown in the UI.
         * @param array<string, mixed> $data       Extra error data.
         * @param bool                 $onboarding Whether this is the onboarding wizard.
         * @return WP_Error
         */
        private static function fail( $code, $technical = '', $data = array(), $onboarding = false ) {
            $technical = trim( (string) $technical );
            if ( '' !== $technical && defined( 'WP_DEBUG_LOG' ) && WP_DEBUG_LOG ) {
                error_log( 'myCred AI middleware [' . $code . ']: ' . $technical );
            }
            if ( ! is_array( $data ) ) {
                $data = array();
            }
            if ( '' !== $technical ) {
                $data['debug'] = $technical;
            }

            $message = $onboarding
                ? __( 'AI setup is unavailable right now. Please try again later, or continue with Predefined Template.', 'mycred' )
                : __( 'The AI service is unavailable right now. Please try again later.', 'mycred' );

            return new WP_Error( $code, $message, $data );
        }

        /**
         * Ensure a license is available.
         *
         * @param bool $onboarding Whether this is the onboarding wizard.
         * @return true|WP_Error
         */
        public static function ensure_license( $onboarding = false ) {
            if ( self::has_license() ) {
                return true;
            }

            $secret = self::provision_secret();
            if ( '' === trim( $secret ) ) {
                return self::fail(
                    'mycred_ai_license_or_secret_required',
                    'The middleware requires a license key, and this site could not obtain one automatically.',
                    array(),
                    $onboarding
                );
            }

            $config = self::mw_config();
            if ( '' === $config['base_url'] ) {
                return self::fail( 'mycred_ai_no_base', 'AI middleware base URL is not set.', array(), $onboarding );
            }

            $url      = self::mw_url( $config['base_url'], 'licenses/provision-free' );
            $identity = self::wp_owner();
            $body     = array(
                'site_url'    => self::normalize_site_url( $config['site_url'] ),
                'plugin_slug' => $config['operation'],
            );

            if ( '' !== $identity['admin_email'] ) {
                $body['admin_email'] = $identity['admin_email'];
            }
            if ( '' !== $identity['admin_name'] ) {
                $body['admin_name'] = $identity['admin_name'];
            }

            $args = apply_filters(
                'mycred_ai_provision_request_args',
                array(
                    'timeout' => 45,
                    'headers' => array(
                        'Content-Type'               => 'application/json; charset=utf-8',
                        'Accept'                     => 'application/json',
                        'X-myCRED-Provision-Secret'  => $secret,
                    ),
                    'body'    => wp_json_encode( $body ),
                ),
                $body
            );

            $response = wp_remote_post( $url, $args );
            if ( is_wp_error( $response ) ) {
                return self::fail(
                    'mycred_ai_provision_http',
                    'Could not provision middleware license: ' . $response->get_error_message(),
                    array(),
                    $onboarding
                );
            }

            $code = wp_remote_retrieve_response_code( $response );
            $raw  = wp_remote_retrieve_body( $response );
            $json = json_decode( $raw, true );

            $license_from_response = self::license_from_json( $json );
            if ( $code >= 200 && $code < 300 && '' !== $license_from_response ) {
                self::save_license( $license_from_response );
                return true;
            }

            $msg = self::api_msg( $json, 'License provisioning failed.' );

            return self::fail(
                'mycred_ai_provision_api',
                $msg,
                array(
                    'status' => $code,
                    'raw'    => $raw,
                ),
                $onboarding
            );
        }

        /**
         * License key from JSON response.
         *
         * @param mixed $json Response body.
         * @return string
         */
        private static function license_from_json( $json ) {
            if ( is_array( $json ) && ! empty( $json['data']['license_key'] ) && is_string( $json['data']['license_key'] ) ) {
                return trim( $json['data']['license_key'] );
            }

            return '';
        }

        /**
         * Extract human-readable API error.
         *
         * @param mixed  $json JSON response.
         * @param string $default Default message.
         * @return string
         */
        private static function api_msg( $json, $default ) {
            if ( ! is_array( $json ) ) {
                return $default;
            }
            if ( ! empty( $json['message'] ) && is_string( $json['message'] ) ) {
                return $json['message'];
            }
            if ( ! empty( $json['error'] ) && is_string( $json['error'] ) ) {
                return $json['error'];
            }
            if ( isset( $json['data'] ) && is_array( $json['data'] ) ) {
                if ( ! empty( $json['data']['message'] ) && is_string( $json['data']['message'] ) ) {
                    return $json['data']['message'];
                }
                if ( ! empty( $json['data']['error'] ) && is_string( $json['data']['error'] ) ) {
                    return $json['data']['error'];
                }
            }
            if ( ! empty( $json['errors'] ) && is_array( $json['errors'] ) ) {
                $parts = array();
                foreach ( $json['errors'] as $messages ) {
                    if ( is_array( $messages ) ) {
                        foreach ( $messages as $message ) {
                            if ( is_string( $message ) ) {
                                $parts[] = $message;
                            }
                        }
                    } elseif ( is_string( $messages ) ) {
                        $parts[] = $messages;
                    }
                }
                if ( $parts ) {
                    return implode( ' ', $parts );
                }
            }

            return $default;
        }

        /**
         * Persist middleware license.
         *
         * @param string $license_key License key.
         * @return bool
         */
        public static function save_license( $license_key ) {
            $license_key = sanitize_text_field( $license_key );
            if ( '' === $license_key ) {
                return false;
            }

            update_option( 'mycred_ai_middleware_license_key', $license_key, false );

            $core = mycred_get_option( 'mycred_pref_core', array() );
            if ( ! is_array( $core ) ) {
                $core = array();
            }
            if ( ! isset( $core['ai_settings'] ) || ! is_array( $core['ai_settings'] ) ) {
                $core['ai_settings'] = array();
            }
            $core['ai_settings']['middleware_license_key'] = $license_key;

            return (bool) mycred_update_option( 'mycred_pref_core', $core );
        }

        /**
         * Run process-ai for myCred chat.
         *
         * @param array<int, array<string, string>> $messages Chat messages.
         * @param string                            $system_instruction System instruction.
         * @return array<string, mixed>|WP_Error
         */
        public static function process_chat( array $messages, $system_instruction, $args = array() ) {
            $strip_tags        = ! isset( $args['strip_tags'] ) || $args['strip_tags'];
            $timeout           = isset( $args['timeout'] ) ? max( 30, (int) $args['timeout'] ) : 90;
            $serialized_prompt = self::build_serialized_prompt( $messages, $system_instruction, $strip_tags );
            $config            = self::mw_config();
            $body              = array(
                'site_url'  => untrailingslashit( $config['site_url'] ),
                'prompt'    => $serialized_prompt,
                'operation' => $config['operation'],
            );

            $body = apply_filters( 'mycred_ai_middleware_request_body', $body, $messages, $system_instruction );

            return self::post_process_ai( $body, $timeout );
        }

        /**
         * Onboarding recommend: plugin sends only type / platform / goal / optional prompt.
         * Catalogs and system prompt live on the middleware.
         *
         * @param string $site_type Website type key.
         * @param string $platform  Platform key.
         * @param string $goal      Primary goal key.
         * @param string $prompt    Optional extra admin prompt.
         * @return array<string, mixed>|WP_Error
         */
        public static function process_onboarding( $site_type, $platform, $goal, $prompt = '' ) {
            $config = self::mw_config();
            $prompt = trim( (string) $prompt );
            $body   = array(
                'site_url'  => untrailingslashit( $config['site_url'] ),
                'operation' => 'mycred_onboarding',
                'site_type' => (string) $site_type,
                'platform'  => (string) $platform,
                'goal'      => (string) $goal,
            );

            // Only send extra prompt when the admin actually typed one.
            // An empty "prompt" key is stored as blank on middleware and looks like the text never arrived.
            if ( '' !== $prompt ) {
                $body['prompt']       = $prompt;
                $body['extra_prompt'] = $prompt;
            }

            return self::post_process_ai(
                apply_filters( 'mycred_ai_middleware_onboarding_body', $body ),
                240,
                'process-ai',
                true
            );
        }

        /**
         * POST a licensed middleware JSON endpoint.
         *
         * @param array<string, mixed> $body       Request body.
         * @param int                  $timeout    Timeout in seconds.
         * @param string               $endpoint   API endpoint.
         * @param bool                 $onboarding Whether this is the onboarding wizard.
         * @return array<string, mixed>|WP_Error
         */
        private static function post_process_ai( array $body, $timeout = 90, $endpoint = 'process-ai', $onboarding = false ) {
            $config = self::mw_config();
            if ( '' === $config['base_url'] ) {
                return self::fail( 'mycred_ai_no_base', 'AI middleware base URL is not set.', array(), $onboarding );
            }

            $ensured = self::ensure_license( $onboarding );
            if ( is_wp_error( $ensured ) ) {
                return $ensured;
            }

            $config = self::mw_config();
            if ( '' === trim( $config['license_key'] ) ) {
                return self::fail( 'mycred_ai_no_license', 'No middleware license key is available.', array(), $onboarding );
            }

            $url = self::mw_url( $config['base_url'], $endpoint );

            $encoded_body = wp_json_encode( $body );
            if ( false === $encoded_body ) {
                return self::fail( 'mycred_ai_encode', 'Could not prepare the AI request.', array(), $onboarding );
            }

            $args = apply_filters(
                'mycred_ai_middleware_request_args',
                array(
                    'timeout' => max( 30, (int) $timeout ),
                    'headers' => array(
                        'Content-Type'  => 'application/json; charset=utf-8',
                        'Accept'        => 'application/json',
                        'X-License-Key' => $config['license_key'],
                    ),
                    'body'    => $encoded_body,
                ),
                $body
            );

            $response = wp_remote_post( $url, $args );
            if ( is_wp_error( $response ) ) {
                return self::fail(
                    'mycred_ai_http',
                    'Could not reach AI server: ' . $response->get_error_message(),
                    array(),
                    $onboarding
                );
            }

            $code = wp_remote_retrieve_response_code( $response );
            $raw  = wp_remote_retrieve_body( $response );
            $json = json_decode( $raw, true );

            if ( ! is_array( $json ) ) {
                return self::fail(
                    'mycred_ai_bad_response',
                    'AI server returned an invalid response. HTTP ' . (int) $code . '; body: ' . self::clip_log( $raw ),
                    array( 'status' => $code ),
                    $onboarding
                );
            }

            $status = isset( $json['status'] ) ? strtolower( trim( (string) $json['status'] ) ) : '';
            if ( $code >= 400 || in_array( $status, array( 'failed', 'error', 'fail' ), true ) ) {
                $tech     = self::api_msg( $json, 'AI request failed.' );
                $err_data = array( 'status' => $code );
                $quota    = self::parse_quota( $json );
                if ( is_array( $quota ) ) {
                    $err_data['quota'] = $quota;
                }
                if ( 'AI request failed.' === $tech ) {
                    $tech .= ' HTTP ' . (int) $code . '; body: ' . self::clip_log( $raw );
                }

                if ( 402 === (int) $code ) {
                    $message = is_string( $tech ) && '' !== $tech
                        ? $tech
                        : __( 'You’ve reached your AI usage limit for this site.', 'mycred' );

                    return new WP_Error( 'no_middleware_credits', $message, $err_data );
                }

                return self::fail(
                    'mycred_ai_api',
                    is_string( $tech ) ? $tech : 'AI request failed.',
                    $err_data,
                    $onboarding
                );
            }

            $data           = self::as_assoc( isset( $json['data'] ) ? $json['data'] : $json );
            if ( ! is_array( $data ) ) {
                $data = is_array( $json ) ? $json : array();
            }
            $recommendation = self::coerce_recommendation( $data, $json );
            $content        = self::extract_content( $json, $raw );
            if ( ! is_array( $recommendation ) && is_string( $content ) && '' !== trim( $content ) ) {
                $from_content = self::as_assoc( $content );
                if ( self::looks_like_onboarding( $from_content ) ) {
                    $recommendation = $from_content;
                }
            }
            if ( null === $recommendation && '' === trim( (string) $content ) ) {
                return self::fail(
                    'mycred_ai_empty',
                    'AI returned an empty response. HTTP ' . (int) $code . '; body: ' . self::clip_log( $raw ),
                    array(),
                    $onboarding
                );
            }

            $out = array(
                'content' => $content,
            );
            if ( is_array( $recommendation ) ) {
                $out['recommendation'] = $recommendation;
            }
            $quota = self::parse_quota( $json );
            if ( is_array( $quota ) ) {
                $out['quota'] = $quota;
            }

            return $out;
        }

        /**
         * Normalize a quota payload from the middleware.
         *
         * @param mixed $quota Raw quota.
         * @return array{type: string, used: int, total: int}|null
         */
        public static function sanitize_quota( $quota ) {
            if ( ! is_array( $quota ) ) {
                return null;
            }

            $type  = ( isset( $quota['type'] ) && 'tokens' === $quota['type'] ) ? 'tokens' : 'credits';
            $used  = max( 0, (int) ( $quota['used'] ?? 0 ) );
            $total = max( 0, (int) ( $quota['total'] ?? 0 ) );
            if ( $total <= 0 ) {
                return null;
            }

            return array(
                'type'  => $type,
                'used'  => $used,
                'total' => $total,
                'reset' => self::sanitize_quota_reset( $quota['reset'] ?? 'never' ),
            );
        }

        /**
         * @param mixed $reset Raw reset value.
         * @return string
         */
        public static function sanitize_quota_reset( $reset ) {
            $reset = strtolower( trim( (string) $reset ) );

            return in_array( $reset, array( 'monthly', 'yearly', 'lifetime', 'never' ), true ) ? $reset : 'never';
        }

        /**
         * Immediate UI quota before the middleware responds.
         *
         * @return array{type: string, used: int, total: int, reset: string}
         */
        public static function default_quota() {
            return array(
                'type'  => 'tokens',
                'used'  => 0,
                'total' => self::DEFAULT_TOKEN_TOTAL,
                'reset' => 'monthly',
            );
        }

        /**
         * Quota dropdown chip markup.
         *
         * @param string $wrapper_class Wrapper class.
         * @param string $wrapper_id    Optional id.
         * @param bool   $hidden        Whether the widget starts hidden (onboarding until AI mode).
         * @return string
         */
        public static function quota_widget_html( $wrapper_class, $wrapper_id = '', $hidden = true ) {
            $quota     = self::default_quota();
            $total_fmt = number_format_i18n( $quota['total'] );
            ob_start();
            ?>
			<div class="<?php echo esc_attr( $wrapper_class ); ?>"<?php echo $wrapper_id ? ' id="' . esc_attr( $wrapper_id ) . '"' : ''; ?><?php echo $hidden ? ' hidden' : ''; ?> data-quota-type="tokens" data-quota-pct="0%">
				<button type="button" class="mycred-quota-chip" aria-expanded="false">
					<span class="mycred-quota-chip-main">
						<span class="mycred-quota-chip-top">
							<span class="mycred-quota-chip-title" data-quota-title><?php esc_html_e( 'AI tokens', 'mycred' ); ?></span>
							<span class="mycred-quota-chip-pct" data-quota-pct>0%</span>
						</span>
						<span class="mycred-quota-bar" aria-hidden="true"><span class="mycred-quota-bar-fill" data-quota-bar style="width:0%"></span></span>
					</span>
					<span class="mycred-quota-chevron" aria-hidden="true">
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
					</span>
				</button>
				<div class="mycred-quota-panel">
					<div class="mycred-quota-panel-inner">
						<div class="mycred-quota-panel-card">
							<span class="mycred-quota-period" data-quota-period><?php esc_html_e( 'This month:', 'mycred' ); ?></span>
							<span class="mycred-quota-nums"><strong data-quota-used>0</strong> / <span data-quota-total><?php echo esc_html( $total_fmt ); ?></span></span>
							<span class="mycred-quota-refresh" data-quota-refresh><?php esc_html_e( 'refreshes every month', 'mycred' ); ?></span>
						</div>
					</div>
				</div>
			</div>
			<?php
            return (string) ob_get_clean();
        }

        /**
         * Read quota from a middleware JSON body.
         *
         * @param mixed $json Response JSON.
         * @return array{type: string, used: int, total: int}|null
         */
        public static function parse_quota( $json ) {
            if ( ! is_array( $json ) ) {
                return null;
            }

            if ( isset( $json['quota'] ) ) {
                return self::sanitize_quota( $json['quota'] );
            }

            if ( isset( $json['tokens_total'] ) ) {
                return self::sanitize_quota(
                    array(
                        'type'  => 'tokens',
                        'used'  => $json['tokens_used'] ?? 0,
                        'total' => $json['tokens_total'],
                    )
                );
            }

            return null;
        }

        /**
         * Quota from a WP_Error returned by this client.
         *
         * @param WP_Error $error Error.
         * @return array{type: string, used: int, total: int}|null
         */
        public static function quota_from_error( $error ) {
            if ( ! is_wp_error( $error ) ) {
                return null;
            }
            $data = $error->get_error_data();

            return self::sanitize_quota( is_array( $data ) && isset( $data['quota'] ) ? $data['quota'] : null );
        }

        /**
         * Current site quota from middleware (does not spend tokens).
         *
         * @param bool $onboarding Whether this is the onboarding wizard.
         * @return array{type: string, used: int, total: int}|null
         */
        public static function fetch_quota( $onboarding = false ) {
            $default = self::default_quota();

            if ( '' === self::mw_config()['base_url'] ) {
                return $default;
            }

            $ensured = self::ensure_license( $onboarding );
            if ( is_wp_error( $ensured ) ) {
                return $default;
            }

            $config = self::mw_config();
            if ( '' === trim( $config['license_key'] ) ) {
                return $default;
            }

            $url = self::mw_url( $config['base_url'], 'licenses/check' );
            if ( '' === $url ) {
                return $default;
            }

            $response = wp_remote_post(
                $url,
                array(
                    'timeout' => 12,
                    'headers' => array(
                        'Content-Type'  => 'application/json; charset=utf-8',
                        'Accept'        => 'application/json',
                        'X-License-Key' => $config['license_key'],
                    ),
                    'body'    => '{}',
                )
            );
            if ( is_wp_error( $response ) ) {
                return $default;
            }

            $json   = json_decode( wp_remote_retrieve_body( $response ), true );
            $parsed = self::parse_quota( $json );

            return is_array( $parsed ) ? $parsed : $default;
        }

        /**
         * Serialize system prompt + history into one middleware prompt.
         *
         * @param array<int, array<string, string>> $messages Chat messages.
         * @param string                            $system_instruction System instruction.
         * @return string
         */
        private static function build_serialized_prompt( array $messages, $system_instruction, $strip_tags = true ) {
            $lines   = array();
            $system_instruction = trim( (string) $system_instruction );
            if ( '' !== $system_instruction ) {
                $lines[] = '[System]: ' . $system_instruction;
            }

            foreach ( $messages as $message ) {
                if ( empty( $message['role'] ) || ! isset( $message['content'] ) ) {
                    continue;
                }
                $role    = ucfirst( sanitize_text_field( (string) $message['role'] ) );
                $content = (string) $message['content'];
                $content = $strip_tags ? wp_strip_all_tags( $content ) : $content;
                $content = trim( $content );
                if ( '' === $content ) {
                    continue;
                }
                $lines[] = sprintf( '[%s]: %s', $role, $content );
            }

            return implode( "\n\n", $lines );
        }

        /**
         * Truncate a string for debug logs.
         *
         * @param string $text Raw text.
         * @return string
         */
        private static function clip_log( $text ) {
            $text = preg_replace( '/\s+/', ' ', trim( (string) $text ) );
            if ( strlen( $text ) > 800 ) {
                return substr( $text, 0, 800 ) . '…';
            }

            return $text;
        }

        /**
         * Decode JSON object/array from a string or pass arrays through.
         *
         * @param mixed $value Raw value.
         * @return array<string, mixed>|null
         */
        private static function as_assoc( $value ) {
            if ( is_array( $value ) ) {
                return $value;
            }
            if ( ! is_string( $value ) ) {
                return null;
            }

            $value = trim( $value );
            if ( '' === $value ) {
                return null;
            }

            if ( preg_match( '/```(?:json)?\s*([\s\S]*?)\s*```/i', $value, $matches ) ) {
                $value = trim( $matches[1] );
            }

            $flags = 0;
            if ( defined( 'JSON_INVALID_UTF8_IGNORE' ) ) {
                $flags |= JSON_INVALID_UTF8_IGNORE;
            }

            $decoded = json_decode( $value, true, 512, $flags );
            if ( is_array( $decoded ) ) {
                return $decoded;
            }

            $start = strpos( $value, '{' );
            $end   = strrpos( $value, '}' );
            if ( false === $start || false === $end || $end <= $start ) {
                return null;
            }

            $decoded = json_decode( substr( $value, $start, $end - $start + 1 ), true, 512, $flags );

            return is_array( $decoded ) ? $decoded : null;
        }

        /**
         * Whether an array looks like an onboarding recommendation payload.
         *
         * @param mixed $decoded Candidate.
         * @return bool
         */
        private static function looks_like_onboarding( $decoded ) {
            if ( ! is_array( $decoded ) || isset( $decoded['__tool_call__'] ) ) {
                return false;
            }

            foreach ( array( 'addons', 'hooks', 'settings', 'point_type', 'ranks', 'badges', 'understood', 'checkout' ) as $key ) {
                if ( array_key_exists( $key, $decoded ) ) {
                    return true;
                }
            }

            return false;
        }

        /**
         * Middleware sometimes returns recommendation as an object, sometimes as a JSON string.
         *
         * @param array<string, mixed> $data Inner data.
         * @param array<string, mixed> $json Full JSON.
         * @return array<string, mixed>|null
         */
        private static function coerce_recommendation( array $data, array $json ) {
            $candidates = array(
                isset( $data['recommendation'] ) ? $data['recommendation'] : null,
                isset( $json['recommendation'] ) ? $json['recommendation'] : null,
                isset( $data['content'] ) ? $data['content'] : null,
            );

            foreach ( $candidates as $candidate ) {
                $decoded = self::as_assoc( $candidate );
                if ( self::looks_like_onboarding( $decoded ) ) {
                    return $decoded;
                }
                if ( is_array( $decoded ) && isset( $decoded['recommendation'] ) ) {
                    $inner = self::as_assoc( $decoded['recommendation'] );
                    if ( self::looks_like_onboarding( $inner ) ) {
                        return $inner;
                    }
                }
                if ( is_array( $decoded ) && isset( $decoded['data'] ) ) {
                    $inner_data = self::as_assoc( $decoded['data'] );
                    if ( is_array( $inner_data ) && isset( $inner_data['recommendation'] ) ) {
                        $inner = self::as_assoc( $inner_data['recommendation'] );
                        if ( self::looks_like_onboarding( $inner ) ) {
                            return $inner;
                        }
                    }
                    if ( self::looks_like_onboarding( $inner_data ) ) {
                        return $inner_data;
                    }
                }
            }

            return null;
        }

        /**
         * Extract generated content from middleware response.
         *
         * @param array<string, mixed> $json Response JSON.
         * @param string               $raw Raw response.
         * @return string
         */
        private static function extract_content( array $json, $raw ) {
            $data = isset( $json['data'] ) ? $json['data'] : $json;
            if ( is_string( $data ) ) {
                $decoded_data = self::as_assoc( $data );
                $data         = is_array( $decoded_data ) ? $decoded_data : array();
            } elseif ( ! is_array( $data ) ) {
                $data = $json;
            }
            foreach ( array( 'content', 'response', 'text', 'recommendation' ) as $key ) {
                if ( ! isset( $data[ $key ] ) ) {
                    continue;
                }
                if ( is_string( $data[ $key ] ) && '' !== trim( $data[ $key ] ) ) {
                    return trim( $data[ $key ] );
                }
                if ( is_array( $data[ $key ] ) ) {
                    $encoded = wp_json_encode( $data[ $key ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES );
                    if ( is_string( $encoded ) && '' !== $encoded && '[]' !== $encoded && '{}' !== $encoded ) {
                        return $encoded;
                    }
                }
            }

            return '';
        }
    }

};
