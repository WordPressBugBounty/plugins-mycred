<?php
/**
 * myCred Onboarding wizard (UI only).
 *
 * Screens follow the setup prototype. No settings are saved from this view.
 *
 * @package myCred
 * @subpackage AI
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'is_plugin_active' ) ) {
	require_once ABSPATH . 'wp-admin/includes/plugin.php';
}

$mycred_ob_logo = ( defined( 'myCRED_THIS' ) ) ? plugins_url( 'assets/images/mycred-logo.svg', myCRED_THIS ) : '';
$mycred_ob_pro  = function_exists( 'is_plugin_active' ) && is_plugin_active( 'mycred-toolkit-pro/mycred-toolkit-pro.php' );
?>
<div class="wrap mycred-ai-assistant-wrapper mycred-ob-wrap">
	<h1 class="screen-reader-text"><?php esc_html_e( 'myCred Onboarding', 'mycred' ); ?></h1>

	<header class="mycred-ob-app-header">
		<div class="mycred-ob-logo-wrap">
			<?php if ( $mycred_ob_logo ) : ?>
				<img class="mycred-ob-logo" src="<?php echo esc_url( $mycred_ob_logo ); ?>" alt="<?php esc_attr_e( 'myCred', 'mycred' ); ?>" />
			<?php else : ?>
				<span class="mycred-ob-logo-fallback">myCred</span>
			<?php endif; ?>
		</div>
	</header>

	<div class="mycred-ob-container">
	<div class="mycred-ob-layout">
		<nav class="mycred-ob-nav" id="mycred-ob-nav" hidden aria-label="<?php esc_attr_e( 'Onboarding steps', 'mycred' ); ?>">
			<button type="button" class="mycred-ob-nav-item" data-nav="1" disabled>
				<span class="mycred-ob-nav-icon" aria-hidden="true">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M19 4C19.5304 4 20.0391 4.21071 20.4142 4.58579C20.7893 4.96086 21 5.46957 21 6V18C21 18.5304 20.7893 19.0391 20.4142 19.4142C20.0391 19.7893 19.5304 20 19 20H5C4.46957 20 3.96086 19.7893 3.58579 19.4142C3.21071 19.0391 3 18.5304 3 18V6C3 5.46957 3.21071 4.96086 3.58579 4.58579C3.96086 4.21071 4.46957 4 5 4H19ZM5 17C5 17.2652 5.10536 17.5196 5.29289 17.7071C5.48043 17.8946 5.73478 18 6 18H18C18.2652 18 18.5196 17.8946 18.7071 17.7071C18.8946 17.5196 19 17.2652 19 17V10H5V17ZM6 6C5.73478 6 5.48043 6.10536 5.29289 6.29289C5.10536 6.48043 5 6.73478 5 7C5 7.26522 5.10536 7.51957 5.29289 7.70711C5.48043 7.89464 5.73478 8 6 8C6.26522 8 6.51957 7.89464 6.70711 7.70711C6.89464 7.51957 7 7.26522 7 7C7 6.73478 6.89464 6.48043 6.70711 6.29289C6.51957 6.10536 6.26522 6 6 6ZM9 6C8.73478 6 8.48043 6.10536 8.29289 6.29289C8.10536 6.48043 8 6.73478 8 7C8 7.26522 8.10536 7.51957 8.29289 7.70711C8.48043 7.89464 8.73478 8 9 8C9.26522 8 9.51957 7.89464 9.70711 7.70711C9.89464 7.51957 10 7.26522 10 7C10 6.73478 9.89464 6.48043 9.70711 6.29289C9.51957 6.10536 9.26522 6 9 6ZM12 6C11.7348 6 11.4804 6.10536 11.2929 6.29289C11.1054 6.48043 11 6.73478 11 7C11 7.26522 11.1054 7.51957 11.2929 7.70711C11.4804 7.89464 11.7348 8 12 8C12.2652 8 12.5196 7.89464 12.7071 7.70711C12.8946 7.51957 13 7.26522 13 7C13 6.73478 12.8946 6.48043 12.7071 6.29289C12.5196 6.10536 12.2652 6 12 6Z" fill="currentColor"/>
					</svg>
				</span>
				<span class="mycred-ob-nav-text" id="mycred-ob-nav-details-label"><?php esc_html_e( 'Site details', 'mycred' ); ?></span>
			</button>
			<button type="button" class="mycred-ob-nav-item" data-nav="2" disabled>
				<span class="mycred-ob-nav-icon" aria-hidden="true">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M12 2v2.4M5.05 5.05l1.7 1.7M18.95 5.05l-1.7 1.7M2.8 12H5.2M18.8 12h2.4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
						<path d="M8.15 12.15a3.85 3.85 0 1 1 7.7 0c0 1.4-.72 2.42-1.5 3.3-.48.54-.85 1.08-.85 1.55v.25H10.5v-.25c0-.47-.37-1.01-.85-1.55-.78-.88-1.5-1.9-1.5-3.3Z" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>
						<rect x="9.55" y="17.15" width="4.9" height="2.55" rx=".7" stroke="currentColor" stroke-width="2.2"/>
						<path d="M10.55 21.1h2.9" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
					</svg>
				</span>
				<span class="mycred-ob-nav-text"><?php esc_html_e( 'Recommendations', 'mycred' ); ?></span>
			</button>
			<button type="button" class="mycred-ob-nav-item" data-nav="3" disabled>
				<span class="mycred-ob-nav-icon" aria-hidden="true">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M20.28 7.3425H14.52V4.8C14.52 4.40175 14.1983 4.08 13.8 4.08H4.62V3.18C4.62 3.081 4.539 3 4.44 3H3.18C3.081 3 3 3.081 3 3.18V20.82C3 20.919 3.081 21 3.18 21H4.44C4.539 21 4.62 20.919 4.62 20.82V14.88H10.2V17.4225C10.2 17.8208 10.5218 18.1425 10.92 18.1425H20.28C20.6783 18.1425 21 17.8208 21 17.4225V8.0625C21 7.66425 20.6783 7.3425 20.28 7.3425Z" fill="currentColor"/>
					</svg>
				</span>
				<span class="mycred-ob-nav-text"><?php esc_html_e( 'Complete', 'mycred' ); ?></span>
			</button>
		</nav>

		<div class="mycred-ob-main">
	<section class="mycred-ob-wizard" id="mycred-ob-wizard">
		<div class="mycred-ob-progress" aria-hidden="true">
			<div class="mycred-ob-bar is-active"></div>
			<div class="mycred-ob-bar"></div>
			<div class="mycred-ob-bar"></div>
			<div class="mycred-ob-bar"></div>
		</div>

		<!-- Step 1: Setup mode -->
		<div class="mycred-ob-screen is-active" data-screen="1">
			<div class="mycred-ob-head mycred-ob-head--center">
				<h2><?php esc_html_e( 'How would you like to set up your loyalty program?', 'mycred' ); ?></h2>
				<p><?php esc_html_e( 'Choose a ready-made setup or tell AI what you want to build. Review everything before applying it, and you can always change your settings manually later.', 'mycred' ); ?></p>
			</div>
			<div class="mycred-ob-body">
				<div class="mycred-ob-choice-grid">
					<div class="mycred-ob-choice" data-mode="ai">
						<div class="mycred-ob-choice-top">
							<div class="mycred-ob-icon mycred-ob-icon--ai" aria-hidden="true">
								<svg class="mycred-ob-svg-icon" viewBox="0 0 100 100" fill="currentColor" aria-hidden="true">
									<path d="M47.5 5.5 51.2 16.8 62.5 20.5 51.2 24.2 47.5 35.5 43.8 24.2 32.5 20.5 43.8 16.8Z"/>
									<path d="M21.2 13.2 24 21.8 32.6 24.6 24 27.4 21.2 36 18.4 27.4 9.8 24.6 18.4 21.8Z"/>
									<path d="M7.2 32.2 8.4 35.8 12 37 8.4 38.2 7.2 41.8 6 38.2 2.4 37 6 35.8Z"/>
									<path d="M18 46.2 20.2 52.6 26.6 54.8 20.2 57 18 63.4 15.8 57 9.4 54.8 15.8 52.6Z"/>
									<g fill="none" stroke="currentColor" stroke-width="8.2" stroke-linecap="round">
										<line x1="35.5" y1="51.8" x2="46.8" y2="60.6"/>
										<line x1="54.2" y1="66.2" x2="86.5" y2="91.2"/>
									</g>
								</svg>
							</div>
							<span class="mycred-ob-choice-badge"><?php esc_html_e( 'Recommended', 'mycred' ); ?></span>
						</div>
						<div class="mycred-ob-choice-copy">
							<h3><?php esc_html_e( 'Set up with AI', 'mycred' ); ?></h3>
							<p><?php esc_html_e( 'Describe what you want in your own words and let AI create a personalized setup for you.', 'mycred' ); ?></p>
							<ul class="mycred-ob-choice-checks">
								<li><?php esc_html_e( 'Tell AI what you want to achieve', 'mycred' ); ?></li>
								<li><?php esc_html_e( 'Get recommendations tailored to your goals', 'mycred' ); ?></li>
								<li><?php esc_html_e( 'Discover the right myCred features', 'mycred' ); ?></li>
								<li><?php esc_html_e( 'Customize every recommendation', 'mycred' ); ?></li>
								<li><?php esc_html_e( 'Review before anything is applied', 'mycred' ); ?></li>
							</ul>
						</div>
						<button type="button" class="mycred-ob-btn mycred-ob-choice-cta" data-choice-go><?php esc_html_e( 'Start with AI', 'mycred' ); ?></button>
						<p class="mycred-ob-choice-hint"><?php esc_html_e( 'Tailored recommendations and flexibility', 'mycred' ); ?></p>
					</div>
					<div class="mycred-ob-choice" data-mode="manual">
						<div class="mycred-ob-choice-top">
							<div class="mycred-ob-icon" aria-hidden="true">
								<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M4 5.14286C4 4.83975 4.12041 4.54906 4.33474 4.33474C4.54906 4.12041 4.83975 4 5.14286 4H18.8571C19.1602 4 19.4509 4.12041 19.6653 4.33474C19.8796 4.54906 20 4.83975 20 5.14286V7.42857C20 7.73168 19.8796 8.02237 19.6653 8.23669C19.4509 8.45102 19.1602 8.57143 18.8571 8.57143H5.14286C4.83975 8.57143 4.54906 8.45102 4.33474 8.23669C4.12041 8.02237 4 7.73168 4 7.42857V5.14286ZM4 12C4 11.6969 4.12041 11.4062 4.33474 11.1919C4.54906 10.9776 4.83975 10.8571 5.14286 10.8571H12C12.3031 10.8571 12.5938 10.9776 12.8081 11.1919C13.0224 11.4062 13.1429 11.6969 13.1429 12V18.8571C13.1429 19.1602 13.0224 19.4509 12.8081 19.6653C12.5938 19.8796 12.3031 20 12 20H5.14286C4.83975 20 4.54906 19.8796 4.33474 19.6653C4.12041 19.4509 4 19.1602 4 18.8571V12ZM16.5714 10.8571C16.2683 10.8571 15.9776 10.9776 15.7633 11.1919C15.549 11.4062 15.4286 11.6969 15.4286 12V18.8571C15.4286 19.1602 15.549 19.4509 15.7633 19.6653C15.9776 19.8796 16.2683 20 16.5714 20H18.8571C19.1602 20 19.4509 19.8796 19.6653 19.6653C19.8796 19.4509 20 19.1602 20 18.8571V12C20 11.6969 19.8796 11.4062 19.6653 11.1919C19.4509 10.9776 19.1602 10.8571 18.8571 10.8571H16.5714Z" fill="#5E2CED"/>
								</svg>
							</div>
						</div>
						<div class="mycred-ob-choice-copy">
							<h3><?php esc_html_e( 'Start with a ready-made setup', 'mycred' ); ?></h3>
							<p><?php esc_html_e( 'Answer a few questions and get a setup tailored to your website.', 'mycred' ); ?></p>
							<ul class="mycred-ob-choice-checks">
								<li><?php esc_html_e( 'Choose your website type and platform', 'mycred' ); ?></li>
								<li><?php esc_html_e( 'Start with recommended loyalty features', 'mycred' ); ?></li>
								<li><?php esc_html_e( 'Set up points and rewards faster', 'mycred' ); ?></li>
								<li><?php esc_html_e( 'Customize the setup to your needs', 'mycred' ); ?></li>
								<li><?php esc_html_e( 'Review before anything is applied', 'mycred' ); ?></li>
							</ul>
						</div>
						<button type="button" class="mycred-ob-btn mycred-ob-btn--secondary mycred-ob-choice-cta" data-choice-go><?php esc_html_e( 'Start with a template', 'mycred' ); ?></button>
						<p class="mycred-ob-choice-hint"><?php esc_html_e( 'Getting started quickly', 'mycred' ); ?></p>
					</div>
				</div>
			</div>
		</div>

		<!-- Step 2: Site type + platform (manual path) -->
		<div class="mycred-ob-screen" data-screen="2">
			<div class="mycred-ob-head">
				<h2><?php esc_html_e( 'What kind of site are you setting up?', 'mycred' ); ?></h2>
				<p><?php esc_html_e( 'Choose a website type, platform, and primary goal. myCred will prepare a predefined setup for that combination.', 'mycred' ); ?></p>
			</div>
			<div class="mycred-ob-body">
				<div class="mycred-ob-notice mycred-ob-notice--ai">
					<strong><?php esc_html_e( 'Nothing is applied yet.', 'mycred' ); ?></strong>
					<?php esc_html_e( 'This path uses a ready-made configuration for your type, platform, and goal. You will still review and confirm every item.', 'mycred' ); ?>
				</div>
				<div class="mycred-ob-notice mycred-ob-notice--error" id="mycred-ob-manual-error" hidden></div>
				<div class="mycred-ob-form-grid">
					<div class="mycred-ob-site-fields">
						<div class="mycred-ob-field">
							<label for="mycred-ob-manual-site-type"><?php esc_html_e( 'Website type', 'mycred' ); ?></label>
							<select id="mycred-ob-manual-site-type"></select>
						</div>
						<div class="mycred-ob-field">
							<label for="mycred-ob-manual-platform"><?php esc_html_e( 'Platform', 'mycred' ); ?></label>
							<select id="mycred-ob-manual-platform"></select>
						</div>
						<div class="mycred-ob-field">
							<label for="mycred-ob-manual-goal"><?php esc_html_e( 'Primary goal', 'mycred' ); ?></label>
							<select id="mycred-ob-manual-goal"></select>
						</div>
					</div>
				</div>
				<p class="mycred-ob-help"><?php esc_html_e( 'Example: E-commerce Store + WooCommerce + Reward product reviews.', 'mycred' ); ?></p>
			</div>
		</div>

		<!-- Step 3: AI prompt -->
		<div class="mycred-ob-screen" data-screen="3">
			<div class="mycred-ob-head">
				<div class="mycred-ob-head-row">
					<div>
						<h2><?php esc_html_e( 'Describe your rewards program', 'mycred' ); ?></h2>
						<p><?php esc_html_e( 'Tell AI what users should do, how they should earn points, and where points should be spent.', 'mycred' ); ?></p>
					</div>
					<?php echo class_exists( 'myCRED_AI_Middleware_Client' ) ? myCRED_AI_Middleware_Client::quota_widget_html( 'mycred-ob-quota' ) : ''; ?>
				</div>
			</div>
			<div class="mycred-ob-body">
				<div class="mycred-ob-notice mycred-ob-notice--ai">
					<strong><?php esc_html_e( 'AI does not apply settings automatically.', 'mycred' ); ?></strong>
					<?php esc_html_e( 'It prepares a proposal, explains its reasoning, and waits for your approval.', 'mycred' ); ?>
				</div>
				<div class="mycred-ob-notice mycred-ob-notice--error" id="mycred-ob-recommend-error" hidden></div>
				<div class="mycred-ob-form-grid">
					<div class="mycred-ob-site-fields">
						<div class="mycred-ob-field">
							<label for="mycred-ob-site-type"><?php esc_html_e( 'Website type', 'mycred' ); ?></label>
							<select id="mycred-ob-site-type"></select>
						</div>
						<div class="mycred-ob-field">
							<label for="mycred-ob-platform"><?php esc_html_e( 'Platform', 'mycred' ); ?></label>
							<select id="mycred-ob-platform"></select>
						</div>
						<div class="mycred-ob-field">
							<label for="mycred-ob-goal"><?php esc_html_e( 'Primary goal', 'mycred' ); ?></label>
							<select id="mycred-ob-goal"></select>
						</div>
					</div>
					<div class="mycred-ob-field mycred-ob-field--full">
						<label for="mycred-ob-prompt"><?php esc_html_e( 'Your prompt (Optional)', 'mycred' ); ?></label>
						<textarea id="mycred-ob-prompt" maxlength="1000" placeholder="<?php esc_attr_e( 'Example: I run a WooCommerce fashion store. Customers should earn points on purchases, product reviews and referrals. They should use points as a discount at checkout, but only for up to 50% of an order.', 'mycred' ); ?>"></textarea>
						<div class="mycred-ob-prompt-meta">
							<p class="mycred-ob-help"><?php esc_html_e( 'A detailed prompt produces a more relevant add-on list. Website type, platform, and primary goal are required.', 'mycred' ); ?></p>
							<span id="mycred-ob-prompt-count" class="mycred-ob-prompt-count" aria-live="polite">0 / 1000</span>
						</div>
					</div>
				</div>
				<div class="mycred-ob-prompt-examples">
					<h3><?php esc_html_e( 'Try a dummy example', 'mycred' ); ?></h3>
					<div class="mycred-ob-example-row">
						<button type="button" class="mycred-ob-example" data-example="store"><?php esc_html_e( 'WooCommerce fashion store', 'mycred' ); ?></button>
						<button type="button" class="mycred-ob-example" data-example="community"><?php esc_html_e( 'Community website', 'mycred' ); ?></button>
						<button type="button" class="mycred-ob-example" data-example="courses"><?php esc_html_e( 'Online courses', 'mycred' ); ?></button>
					</div>
				</div>
				<div class="mycred-ob-loading" id="mycred-ob-loading" role="status" aria-live="polite">
					<div class="mycred-ob-loading-card">
						<div class="mycred-ob-loading-head">
							<div class="mycred-ob-spinner mycred-ob-spinner--sm" aria-hidden="true"></div>
							<div>
								<strong><?php esc_html_e( 'Generating your myCred configuration…', 'mycred' ); ?></strong>
								<p class="mycred-ob-help"><?php esc_html_e( 'AI is reviewing your setup before it prepares an editable proposal.', 'mycred' ); ?></p>
							</div>
						</div>
						<ol class="mycred-ob-load-steps" id="mycred-ob-load-steps">
							<li><?php esc_html_e( 'Reading current scenario', 'mycred' ); ?></li>
							<li><?php esc_html_e( 'Analyzing your system', 'mycred' ); ?></li>
							<li><?php esc_html_e( 'Checking installed plugins', 'mycred' ); ?></li>
							<li><?php esc_html_e( 'Matching available add-ons', 'mycred' ); ?></li>
							<li><?php esc_html_e( 'Selecting earning hooks', 'mycred' ); ?></li>
							<li><?php esc_html_e( 'Recommending add-on settings', 'mycred' ); ?></li>
							<li><?php esc_html_e( 'Building your configuration', 'mycred' ); ?></li>
						</ol>
					</div>
				</div>
			</div>
		</div>

		<!-- Step 4: Recommended configuration -->
		<div class="mycred-ob-screen" data-screen="4">
			<div class="mycred-ob-head">
				<div class="mycred-ob-head-row">
					<div>
						<h2 id="mycred-ob-recommend-title"><?php esc_html_e( 'Recommended WooCommerce loyalty setup', 'mycred' ); ?></h2>
						<p id="mycred-ob-recommend-sub"><?php esc_html_e( 'Review and edit the point type, hooks and relevant add-ons before applying them.', 'mycred' ); ?></p>
					</div>
					<?php echo class_exists( 'myCRED_AI_Middleware_Client' ) ? myCRED_AI_Middleware_Client::quota_widget_html( 'mycred-ob-quota' ) : ''; ?>
				</div>
			</div>
			<div class="mycred-ob-body">
				<div class="mycred-ob-notice mycred-ob-notice--error" id="mycred-ob-apply-error" hidden></div>
				<div class="mycred-ob-ai-answer" id="mycred-ob-ai-answer">
					<div class="mycred-ob-ai-answer-head">
						<h3>
							<span class="mycred-ob-badge mycred-ob-badge--ai"><?php esc_html_e( 'AI analysis', 'mycred' ); ?></span>
							<?php esc_html_e( 'What I understood', 'mycred' ); ?>
						</h3>
						<button type="button" class="mycred-ob-btn mycred-ob-btn--secondary" id="mycred-ob-regenerate"><?php esc_html_e( 'Regenerate', 'mycred' ); ?></button>
					</div>
					<p id="mycred-ob-understood"><?php esc_html_e( 'You run a WooCommerce store and want to increase repeat purchases. Customers should earn points for orders, reviews and referrals, then use those points as a checkout discount with a 50% payment limit.', 'mycred' ); ?></p>
				</div>

				<div class="mycred-ob-config">
					<div>
						<section class="mycred-ob-section">
							<div class="mycred-ob-section-head">
								<div>
									<h3><?php esc_html_e( 'Point type', 'mycred' ); ?></h3>
									<p id="mycred-ob-point-intro"><?php esc_html_e( 'The main currency users will earn and spend.', 'mycred' ); ?></p>
								</div>
								<span class="mycred-ob-badge mycred-ob-badge--core"><?php esc_html_e( 'Core', 'mycred' ); ?></span>
							</div>
							<div class="mycred-ob-section-body">
								<div class="mycred-ob-setting">
									<div>
										<p class="mycred-ob-setting-title">
											<span id="mycred-ob-point-title"><?php esc_html_e( 'Reward Points', 'mycred' ); ?></span>
											<span class="mycred-ob-badge mycred-ob-badge--rec"><?php esc_html_e( 'Recommended', 'mycred' ); ?></span>
										</p>
										<p class="mycred-ob-setting-desc" id="mycred-ob-point-desc"><?php esc_html_e( 'A simple customer-facing name suitable for a loyalty program.', 'mycred' ); ?></p>
										<div class="mycred-ob-edit-line">
											<input id="mycred-ob-point-name" type="text" value="<?php esc_attr_e( 'Reward Points', 'mycred' ); ?>">
											<!-- <input id="mycred-ob-point-key" type="text" value="reward_points"> -->
										</div>
									</div>
								</div>
							</div>
						</section>

						<section class="mycred-ob-section" id="mycred-ob-hooks-section">
							<div class="mycred-ob-section-head">
								<div>
									<h3><?php esc_html_e( 'Earning rules (hooks)', 'mycred' ); ?></h3>
									<p id="mycred-ob-hooks-intro"></p>
								</div>
								<span class="mycred-ob-badge mycred-ob-badge--core"><?php esc_html_e( 'Core hooks', 'mycred' ); ?></span>
							</div>
							<div class="mycred-ob-section-body" id="mycred-ob-hooks-list"></div>
						</section>

						<section class="mycred-ob-section">
							<div class="mycred-ob-section-head">
								<div>
									<h3><?php esc_html_e( 'Relevant add-ons', 'mycred' ); ?></h3>
									<p><?php esc_html_e( 'Only add-ons connected to the prompt are shown.', 'mycred' ); ?></p>
								</div>
							</div>
							<div class="mycred-ob-section-body" id="mycred-ob-addons-list"></div>
						</section>
					</div>

					<aside>
						<div class="mycred-ob-side-card">
							<h3 id="mycred-ob-overview-title"><?php esc_html_e( 'AI setup overview', 'mycred' ); ?></h3>
							<div class="mycred-ob-side-card-body">
								<ul class="mycred-ob-checklist" id="mycred-ob-overview-list"></ul>
							</div>
						</div>
						<div class="mycred-ob-side-card" id="mycred-ob-checkout-example-card" hidden>
							<h3><?php esc_html_e( 'Customer checkout example', 'mycred' ); ?></h3>
							<div class="mycred-ob-side-card-body">
								<div class="mycred-ob-summary-note" id="mycred-ob-checkout-example"></div>
							</div>
						</div>
						<div class="mycred-ob-side-card">
							<h3><?php esc_html_e( 'Why this setup?', 'mycred' ); ?></h3>
							<div class="mycred-ob-side-card-body">
								<p class="mycred-ob-setting-desc" id="mycred-ob-why-text"></p>
							</div>
						</div>
					</aside>
				</div>
			</div>
		</div>

		<!-- Step 5: Complete -->
		<div class="mycred-ob-screen" data-screen="5">
			<div class="mycred-ob-head">
				<h2><?php esc_html_e( 'myCred setup is ready', 'mycred' ); ?></h2>
				<p><?php esc_html_e( 'Your selected configuration has been prepared successfully.', 'mycred' ); ?></p>
			</div>
			<div class="mycred-ob-body">
				<div class="mycred-ob-final-box">
					<div class="mycred-ob-final-icon" aria-hidden="true">✓</div>
					<h2><?php esc_html_e( 'Your rewards program is ready to test', 'mycred' ); ?></h2>
					<p id="mycred-ob-complete-copy"><?php esc_html_e( 'The production wizard would now save the selected settings, install approved add-ons, and take you to a safe test transaction.', 'mycred' ); ?></p>
					<div class="mycred-ob-mini-cards" id="mycred-ob-mini-cards"></div>
				</div>
			</div>
		</div>

		<div class="mycred-ob-footer" hidden>
			<div class="mycred-ob-privacy-note" id="mycred-ob-privacy-note" hidden>
				<span class="mycred-ob-privacy-note-icon" aria-hidden="true">!</span>
				<span>
					<?php esc_html_e( 'We collect your site URL and admin email to personalize AI recommendations.', 'mycred' ); ?>
					<a class="mycred-ob-privacy-link" href="<?php echo esc_url( 'https://mycred.me/privacy-policy/?utm_source=plugin&utm_medium=ai-onboarding' ); ?>" target="_blank" rel="noopener noreferrer"><?php esc_html_e( 'Privacy Policy', 'mycred' ); ?></a>
				</span>
			</div>
			<div class="mycred-ob-actions">
				<button type="button" class="mycred-ob-btn mycred-ob-btn--secondary" id="mycred-ob-back" hidden><?php esc_html_e( 'Back', 'mycred' ); ?></button>
				<button type="button" class="mycred-ob-btn mycred-ob-btn--primary" id="mycred-ob-next" disabled><?php esc_html_e( 'Next', 'mycred' ); ?></button>
			</div>
		</div>
	</section>
		<button type="button" class="mycred-ob-btn mycred-ob-btn--link mycred-ob-skip-below" id="mycred-ob-skip"><?php esc_html_e( 'Skip & Set Up Manually', 'mycred' ); ?></button>
		</div>
	</div>
	</div>
</div>
