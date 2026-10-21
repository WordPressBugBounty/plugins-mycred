/**
 * Catalog grouping aligned with Add-ons page tabs.
 * Core hooks → Built-in; toolkit/pro hooks → Forms / Booking / Gamifications /
 * Enhancements / Integrations / LMS.
 */

export const CATALOG_GROUPS = [
	{ id: 'all', label: 'All' },
	{ id: 'builtin', label: 'Built-in' },
	{ id: 'forms', label: 'Forms' },
	{ id: 'booking', label: 'Booking' },
	{ id: 'gamification', label: 'Gamifications' },
	{ id: 'enhancements', label: 'Enhancements' },
	{ id: 'integrations', label: 'Integrations' },
	{ id: 'lms', label: 'LMS' },
];

const GROUP_IDS = new Set( CATALOG_GROUPS.map( ( g ) => g.id ).filter( ( id ) => id !== 'all' ) );

export const getHookGroup = ( hook ) => {
	if ( hook?.group && GROUP_IDS.has( hook.group ) ) {
		return hook.group;
	}

	const hay = `${ hook?.id || '' } ${ hook?.title || '' }`.toLowerCase();

	if (
		/forminator|formidable|gravity|wpforms|ninja[\s_-]?form|contact[\s_-]?form|fluent[\s_-]?form|caldera|everest[\s_-]?form|frm_form|gf_/.test(
			hay
		)
	) {
		return 'forms';
	}
	if ( /booking|appointment|latepoint|amelia|bookly/.test( hay ) ) {
		return 'booking';
	}
	if ( /pacman|spin[\s_-]?wheel|fortune[\s_-]?wheel|play_pacman/.test( hay ) ) {
		return 'gamification';
	}
	if (
		/learndash|lifter|tutor[\s_-]?lms|sensei|learnpress|course|lesson[\s_-]?complete|quiz[\s_-]?complete/.test(
			hay
		)
	) {
		return 'lms';
	}
	if (
		/social[\s_-]?share|social[\s_-]?follow|expiration|points[\s_-]?cap|anniversary_pro|birthday_pro/.test(
			hay
		)
	) {
		return 'enhancements';
	}
	if (
		/woocommerce_each|woocommerce_numbers|woocommerce_order_range|product_referral|dokan|dokrate|vendor[\s_-]?sales|vendor[\s_-]?ratings|product_ratings|buddy|bbpress|join[\s_-]?group|view[\s_-]?profile|messaging|activity_ranks|userpro|usersultra|users[\s_-]?ultra|jwplayer|jw[\s_-]?player|vimeo|youtube|video_view|hook_jwplayer/.test(
			hay
		)
	) {
		return 'integrations';
	}

	return 'builtin';
};

export const groupHooks = ( hooks ) => {
	const counts = { all: hooks.length };
	const grouped = {};

	CATALOG_GROUPS.forEach( ( g ) => {
		if ( g.id === 'all' ) {
			return;
		}
		counts[ g.id ] = 0;
		grouped[ g.id ] = [];
	} );

	hooks.forEach( ( hook ) => {
		const group = getHookGroup( hook );
		if ( ! grouped[ group ] ) {
			grouped[ group ] = [];
			counts[ group ] = 0;
		}
		grouped[ group ].push( hook );
		counts[ group ] += 1;
	} );

	return { grouped, counts };
};
