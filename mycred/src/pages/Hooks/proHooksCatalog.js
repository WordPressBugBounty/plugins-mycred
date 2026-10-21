/**
 * Toolkit Pro hooks shown as catalog placeholders.
 * When the real addon registers the hook via AJAX, the live entry replaces the dummy.
 *
 * Free core/addon hooks (birthday, anniversary, video, WooCommerce, etc.) are NOT listed
 * here — they appear via AJAX when available and always show as Free.
 */

/** Pro-only ids that have a free twin; skip dummy if the free hook is already installed. */
export const PRO_FREE_ALIASES = {
	birthday_pro: 'birthday',
	anniversary_pro: 'anniversary',
};

export const PRO_HOOKS = [
	// Enhancements (Toolkit Pro — no free twin as the same id)
	{
		id: 'expiration',
		title: 'Points Expiration',
		description: 'Expire points after a certain period of time.',
		group: 'enhancements',
		hiddenInCatalog: true,
	},
	{
		id: 'mycred_points_cap',
		title: 'Points Cap',
		description: 'Limit the points users can earn within a given timeframe.',
		group: 'enhancements',
	},

	// BuddyPress charge / sell hooks (Toolkit Pro)
	{
		id: 'join_group',
		title: 'Join Group',
		description: 'Charge or award points for joining BuddyPress groups.',
		group: 'integrations',
	},
	{
		id: 'messaging',
		title: 'Sending Private Messages',
		description: 'Charge or award points for BuddyPress private messages.',
		group: 'integrations',
	},
	{
		id: 'view_profile',
		title: 'View Profiles',
		description: 'Sell or award access when users view BuddyPress profiles.',
		group: 'integrations',
	},
	{
		id: 'activity_ranks_and_badges',
		title: 'Ranks and badges',
		description: 'Show ranks and badges in BuddyPress activity comments.',
		group: 'integrations',
	},

	// Dokan
	{
		id: 'dokrateprofile',
		title: 'Dokan vendor profile rating',
		description: 'Give points to vendors based on profile ratings.',
		group: 'integrations',
	},
	{
		id: 'product_ratings',
		title: 'Dokan product review',
		description: 'Give points to vendors based on product ratings.',
		group: 'integrations',
	},
	{
		id: 'vendor_sales',
		title: 'Points for vendor sales',
		description: 'Award points when vendor sales exceed a set limit.',
		group: 'integrations',
	},

	// Social (Toolkit Pro)
	{
		id: 'social_share',
		title: 'Points for Social Share',
		description: 'Award points when users share content on social networks.',
		group: 'enhancements',
	},
	{
		id: 'social_follow',
		title: 'Points for Social Follow',
		description: 'Award points when users follow social profiles.',
		group: 'enhancements',
	},

	// Community (UserPro / Users Ultra)
	{
		id: 'userpro_follow',
		title: 'User Pro: Following Users',
		description: 'Award or deduct points when users follow or unfollow others.',
		group: 'integrations',
	},
	{
		id: 'userpro_message',
		title: 'User Pro: Messaging',
		description: 'Award or deduct points for sending or receiving messages.',
		group: 'integrations',
	},
	{
		id: 'userpro_verify',
		title: 'User Pro: Verification',
		description: 'Award or deduct points when a user gets verified.',
		group: 'integrations',
	},
	{
		id: 'usersultra_media',
		title: 'Users Ultra: Media',
		description: 'Award or deduct points for uploading photos or videos.',
		group: 'integrations',
	},
	{
		id: 'usersultra_messages',
		title: 'Users Ultra: Messages',
		description: 'Award or deduct points for sending messages.',
		group: 'integrations',
	},
	{
		id: 'usersultra_profile',
		title: 'Users Ultra: Profile',
		description: 'Award or deduct points for avatar or background changes.',
		group: 'integrations',
	},
	{
		id: 'usersultra_social',
		title: 'Users Ultra: Social',
		description: 'Award or deduct points for friendships, blocks, or ratings.',
		group: 'integrations',
	},
	{
		id: 'usersultra_wall',
		title: 'Users Ultra: Wall',
		description: 'Award or deduct points for wall posts and replies.',
		group: 'integrations',
	},

	// Games
	{
		id: 'play_pacman',
		title: 'Points for Playing Pacman',
		description: 'Award points based on Pacman game score.',
		group: 'gamification',
	},

	// WC Vendors
	{
		id: 'vendor_ratings',
		title: 'Points for Product Rating',
		description: 'Add points to vendors based on their product reviews.',
		group: 'integrations',
	},
];

export const PRO_HOOK_IDS = new Set( PRO_HOOKS.map( ( h ) => h.id ) );

export const buildCatalogHooks = ( installed = [] ) => {
	const byId = new Map();
	const installedIds = new Set( ( installed || [] ).map( ( h ) => h.id ) );

	installed.forEach( ( hook ) => {
		byId.set( hook.id, {
			...hook,
			// Live/registered hooks are usable (free or already activated); never mark Pro.
			is_pro: false,
			is_dummy: false,
		} );
	} );

	PRO_HOOKS.forEach( ( pro ) => {
		if ( pro.hiddenInCatalog ) {
			return;
		}
		if ( byId.has( pro.id ) ) {
			return;
		}
		const freeAlias = PRO_FREE_ALIASES[ pro.id ];
		if ( freeAlias && installedIds.has( freeAlias ) ) {
			return;
		}
		byId.set( pro.id, {
			id: pro.id,
			title: pro.title,
			description: pro.description,
			documentation: '',
			active: false,
			prefs_html: '',
			summary: [],
			is_pro: true,
			is_dummy: true,
			group: pro.group,
		} );
	} );

	return Array.from( byId.values() );
};
