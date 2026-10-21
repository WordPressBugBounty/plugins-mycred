<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! isset( $mycred_ai_ranks_active ) ) {
	$mycred_ai_ranks_active = false;
}
if ( ! isset( $mycred_ai_badges_active ) ) {
	$mycred_ai_badges_active = false;
}
if ( ! isset( $mycred_ai_avatar_url ) ) {
	$mycred_ai_avatar_url = '';
}
if ( ! isset( $mycred_ai_empty_mascot_url ) ) {
	$mycred_ai_empty_mascot_url = $mycred_ai_avatar_url;
}
if ( ! isset( $mycred_ai_greeting_label ) ) {
	$mycred_ai_greeting_label = '';
}

if ( ! function_exists( 'mycred_ai_chip_icon_svg' ) ) {
	/**
	 * Inline SVG for starter prompt chips.
	 *
	 * @param string $icon Icon key.
	 * @param int    $size Icon size in pixels.
	 * @return string
	 */
	function mycred_ai_chip_icon_svg( $icon, $size = 16 ) {
		$size   = max( 12, (int) $size );
		$common = 'viewBox="0 0 24 24" width="' . $size . '" height="' . $size . '" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';

		switch ( $icon ) {
			case 'circulation':
				return '<svg ' . $common . '><path d="M3 12a9 9 0 1 0 9-9"/><path d="M12 3v9l6 3"/></svg>';
			case 'balance':
				return '<svg ' . $common . '><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>';
			case 'award':
				return '<svg ' . $common . '><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></svg>';
			case 'deduct':
				return '<svg ' . $common . '><circle cx="12" cy="12" r="9"/><path d="M8 12h8"/></svg>';
			case 'point-type':
				return '<svg ' . $common . '><ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6"/><path d="M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/></svg>';
			case 'hooks':
				return '<svg ' . $common . '><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg>';
			case 'ranks':
				return '<svg ' . $common . '><path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7L12 17.8 5.7 21.2 8 14 2 9.4h7.6L12 2z"/></svg>';
			case 'badges':
				return '<svg ' . $common . '><circle cx="12" cy="8" r="5"/><path d="M8.5 14.5 7 22l5-3 5 3-1.5-7.5"/></svg>';
			default:
				return '<svg ' . $common . '><circle cx="12" cy="12" r="9"/></svg>';
		}
	}
}

$mycred_ai_prompt_chips = array(
	array(
		'icon'   => 'circulation',
		'prompt' => __( 'What is the total point circulation?', 'mycred' ),
		'label'  => __( 'Check circulation', 'mycred' ),
	),
	array(
		'icon'   => 'balance',
		'prompt' => __( 'What is admin\'s point balance?', 'mycred' ),
		'label'  => __( 'User balance', 'mycred' ),
	),
	array(
		'icon'   => 'award',
		'prompt' => __( 'Award 10 points to admin for contribution', 'mycred' ),
		'label'  => __( 'Award points', 'mycred' ),
	),
	array(
		'icon'   => 'deduct',
		'prompt' => __( 'Deduct 5 points from admin for refund', 'mycred' ),
		'label'  => __( 'Deduct points', 'mycred' ),
	),
	array(
		'icon'   => 'point-type',
		'prompt' => __( 'Create a Gold Coins point type with key gold_coins', 'mycred' ),
		'label'  => __( 'New point type', 'mycred' ),
	),
	array(
		'icon'   => 'hooks',
		'prompt' => __( 'I have a BuddyBoss site, suggest hooks', 'mycred' ),
		'label'  => __( 'Suggest hooks', 'mycred' ),
	),
);

if ( $mycred_ai_ranks_active ) {
	$mycred_ai_prompt_chips[] = array(
		'icon'   => 'ranks',
		'prompt' => __( 'I have a community site — suggest a rank system', 'mycred' ),
		'label'  => __( 'Suggest ranks', 'mycred' ),
	);
}

if ( $mycred_ai_badges_active ) {
	$mycred_ai_prompt_chips[] = array(
		'icon'   => 'badges',
		'prompt' => __( 'Suggest badges for my community site', 'mycred' ),
		'label'  => __( 'Suggest badges', 'mycred' ),
	);
}

$mycred_ai_featured_prompts = array_slice( $mycred_ai_prompt_chips, 0, 3 );
$mycred_ai_secondary_chips  = array_slice( $mycred_ai_prompt_chips, 3 );
?>
<div class="wrap mycred-ai-assistant-wrapper">
	<h1 class="screen-reader-text"><?php esc_html_e( 'AI Assistant', 'mycred' ); ?></h1>

	<div class="mycred-ai-page">
		<div class="mycred-ai-shell" id="mycred-ai-shell" data-mode="empty">
			<div class="mycred-ai-empty-stage">
				<div class="mycred-ai-empty-inner">
					<div class="mycred-ai-empty-mascot" aria-hidden="true">
						<?php if ( ! empty( $mycred_ai_empty_mascot_url ) ) : ?>
						<img src="<?php echo esc_url( $mycred_ai_empty_mascot_url ); ?>" alt="" width="56" height="56" decoding="async" />
						<?php endif; ?>
					</div>
					<?php if ( ! empty( $mycred_ai_greeting_label ) ) : ?>
					<h2 class="mycred-ai-empty-greeting"><?php echo esc_html( $mycred_ai_greeting_label ); ?></h2>
					<?php endif; ?>
					<p class="mycred-ai-empty-lede"><?php esc_html_e( 'What should we do with points today?', 'mycred' ); ?></p>

					<ul class="mycred-ai-prompt-cards" role="list" aria-label="<?php esc_attr_e( 'Featured prompts', 'mycred' ); ?>">
						<?php foreach ( $mycred_ai_featured_prompts as $card ) : ?>
						<li>
							<button type="button" class="mycred-ai-prompt-card" data-prompt="<?php echo esc_attr( $card['prompt'] ); ?>">
								<?php echo mycred_ai_chip_icon_svg( $card['icon'], 20 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
								<?php echo esc_html( $card['prompt'] ); ?>
							</button>
						</li>
						<?php endforeach; ?>
					</ul>
				</div>
			</div>

			<div class="mycred-ai-thread-view" aria-label="<?php esc_attr_e( 'Conversation', 'mycred' ); ?>">
				<div class="mycred-ai-thread-bar">
					<h3><?php esc_html_e( 'AI Assistant', 'mycred' ); ?></h3>
					<button type="button" class="mycred-ai-ghost-btn mycred-ai-new-chat" id="mycred-ai-new-chat">
						<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
						<?php esc_html_e( 'New chat', 'mycred' ); ?>
					</button>
				</div>
				<div class="mycred-ai-chat-messages" id="mycred-ai-chat-messages" role="log" aria-live="polite"></div>
			</div>

			<div class="mycred-ai-composer-slot">
				<form id="mycred-ai-chat-form" class="mycred-ai-composer mycred-ai-chat-form">
					<textarea id="mycred-ai-chat-input" placeholder="<?php esc_attr_e( 'Ask anything about points...', 'mycred' ); ?>" required rows="2" aria-label="<?php esc_attr_e( 'Message', 'mycred' ); ?>"></textarea>
					<div class="mycred-ai-composer-bar">
						<button type="button" class="mycred-ai-ghost-btn mycred-ai-what-i-can-btn" id="mycred-ai-what-i-can-btn" aria-expanded="false" aria-controls="mycred-ai-what-i-can-panel">
							<svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M8 .6l1.05 4.05L13.1 5.7 9.05 7.35 8 11.4 6.95 7.35 2.9 5.7l4.05-1.05L8 .6zm5.2 8.7l.7 2.7 2.7.7-2.7.7-.7 2.7-.7-2.7-2.7-.7 2.7-.7.7-2.7z"/></svg>
							<?php esc_html_e( 'What I can do', 'mycred' ); ?>
						</button>
						<button type="submit" class="mycred-ai-send-btn" id="mycred-ai-send-btn" disabled aria-label="<?php esc_attr_e( 'Send message', 'mycred' ); ?>">
							<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
						</button>
					</div>
					<div class="mycred-ai-can-popover" id="mycred-ai-what-i-can-panel" hidden>
						<ul class="mycred-ai-can-list">
							<li>
								<strong><?php esc_html_e( 'Points', 'mycred' ); ?></strong>
								<?php esc_html_e( 'Circulation, user balances, award or deduct, and new point types.', 'mycred' ); ?>
							</li>
							<li>
								<strong><?php esc_html_e( 'Hooks', 'mycred' ); ?></strong>
								<?php esc_html_e( 'Suggest hooks for your site and apply them.', 'mycred' ); ?>
							</li>
							<li>
								<strong><?php esc_html_e( 'Settings & add-ons', 'mycred' ); ?></strong>
								<?php esc_html_e( 'Read General Settings, list add-ons, and enable them.', 'mycred' ); ?>
							</li>
							<?php if ( $mycred_ai_ranks_active || $mycred_ai_badges_active ) : ?>
							<li>
								<strong><?php esc_html_e( 'Ranks & badges', 'mycred' ); ?></strong>
								<?php esc_html_e( 'Suggest and create rank or badge setups.', 'mycred' ); ?>
							</li>
							<?php endif; ?>
						</ul>
					</div>

					<ul class="mycred-ai-chips" role="list" aria-label="<?php esc_attr_e( 'More starter prompts', 'mycred' ); ?>">
						<?php foreach ( $mycred_ai_secondary_chips as $chip ) : ?>
						<li>
							<button type="button" class="mycred-ai-chip" role="listitem" data-prompt="<?php echo esc_attr( $chip['prompt'] ); ?>">
								<?php echo mycred_ai_chip_icon_svg( $chip['icon'] ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
								<?php echo esc_html( $chip['label'] ); ?>
							</button>
						</li>
						<?php endforeach; ?>
					</ul>
				</form>

				<div class="mycred-ai-composer-meta">
					<p class="mycred-ai-composer-hint"><?php esc_html_e( 'Enter to send, Shift + Enter for a new line', 'mycred' ); ?></p>
					<?php
					$mycred_ai_quota       = class_exists( 'myCRED_AI_Middleware_Client' )
						? myCRED_AI_Middleware_Client::default_quota()
						: array(
							'type'  => 'tokens',
							'used'  => 0,
							'total' => 60000,
						);
					$mycred_ai_quota_used  = isset( $mycred_ai_quota['used'] ) ? (int) $mycred_ai_quota['used'] : 0;
					$mycred_ai_quota_total = isset( $mycred_ai_quota['total'] ) ? (int) $mycred_ai_quota['total'] : 60000;
					$mycred_ai_quota_line  = ( isset( $mycred_ai_quota['type'] ) && 'credits' === $mycred_ai_quota['type'] )
						? /* translators: 1: used amount, 2: total amount */ __( 'AI Credits: %1$s / %2$s', 'mycred' )
						: /* translators: 1: used amount, 2: total amount */ __( 'AI Tokens: %1$s / %2$s', 'mycred' );
					?>
					<p class="mycred-ai-composer-quota" id="mycred-ai-quota-text"><?php echo esc_html( sprintf( $mycred_ai_quota_line, number_format_i18n( $mycred_ai_quota_used ), number_format_i18n( $mycred_ai_quota_total ) ) ); ?></p>
				</div>
			</div>
		</div>
	</div>
</div>
