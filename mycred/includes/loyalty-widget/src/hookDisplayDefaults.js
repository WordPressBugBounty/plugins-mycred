import { __ } from '@wordpress/i18n';

const HOOK_CATEGORIES = ['wordpressHooks', 'woocommerceHooks', 'buddypressHooks', 'forumHooks'];

/** User-friendly widget copy keyed by myCred hook id (lowercase). */
const HOOK_DISPLAY_DEFAULTS = {
    registration: {
        label: __('Create your account', 'mycred'),
        description: __('Sign up once to start collecting rewards.', 'mycred'),
    },
    logging: {
        label: __('Log in', 'mycred'),
        description: __('Earn when you sign in to your account.', 'mycred'),
    },
    daily_login: {
        label: __('Daily login', 'mycred'),
        description: __('Visit and sign in each day to keep earning.', 'mycred'),
    },
    comments: {
        label: __('Leave a comment', 'mycred'),
        description: __('Post thoughtful comments on the site.', 'mycred'),
    },
    publishing: {
        label: __('Publish content', 'mycred'),
        description: __('Create and publish your own posts.', 'mycred'),
    },
    affiliate: {
        label: __('Refer friends', 'mycred'),
        description: __('Share your link and earn when others join or visit.', 'mycred'),
    },
    product_referral: {
        label: __('Refer a product', 'mycred'),
        description: __('Share products and earn when someone buys.', 'mycred'),
    },
    woocommerce_purchase: {
        label: __('Place an order', 'mycred'),
        description: __('Shop and earn on qualifying purchases.', 'mycred'),
    },
    anniversary: {
        label: __('Membership anniversary', 'mycred'),
        description: __('Get rewarded each year you stay with us.', 'mycred'),
    },
    trash: {
        label: __('Content rewards', 'mycred'),
        description: __('Earn when eligible content is removed or recycled.', 'mycred'),
    },
    deleted_content: {
        label: __('Content rewards', 'mycred'),
        description: __('Earn when eligible content is removed or recycled.', 'mycred'),
    },
    referrals: {
        label: __('Successful referrals', 'mycred'),
        description: __('Earn when someone you referred takes action.', 'mycred'),
    },
    watching_video: {
        label: __('Watch videos', 'mycred'),
        description: __('View eligible videos to collect points.', 'mycred'),
    },
    site_visit: {
        label: __('Visit the site', 'mycred'),
        description: __('Drop by the site to earn a visit bonus.', 'mycred'),
    },
    link_click: {
        label: __('Click partner links', 'mycred'),
        description: __('Follow special links to earn rewards.', 'mycred'),
    },
    view: {
        label: __('View content', 'mycred'),
        description: __('Read or view pages and posts to earn.', 'mycred'),
    },
    bp_new_blog: {
        label: __('Create a blog post', 'mycred'),
        description: __('Publish on your BuddyPress blog to earn.', 'mycred'),
    },
    bp_new_forum_topic: {
        label: __('Start a forum topic', 'mycred'),
        description: __('Open discussions in the community forum.', 'mycred'),
    },
    bp_new_forum_reply: {
        label: __('Reply in the forum', 'mycred'),
        description: __('Join forum conversations and earn.', 'mycred'),
    },
    bbp_new_topic: {
        label: __('Start a forum topic', 'mycred'),
        description: __('Open a new discussion thread.', 'mycred'),
    },
    bbp_new_reply: {
        label: __('Reply in the forum', 'mycred'),
        description: __('Post helpful replies in the forum.', 'mycred'),
    },
};

export const getHookDefaultsEntry = (hookId) => {
    const id = String(hookId || '').toLowerCase();
    if (HOOK_DISPLAY_DEFAULTS[id]) {
        return HOOK_DISPLAY_DEFAULTS[id];
    }
    return null;
};

export const applyHookTokens = (text, hook) => {
    if (!text) {
        return '';
    }
    const plural = hook?.plural || __('points', 'mycred');
    const singular = hook?.singular || __('point', 'mycred');
    return String(text)
        .replace(/%plural%/g, plural)
        .replace(/%singular%/g, singular);
};

export const getDefaultDisplayLabel = (hook) => {
    const entry = getHookDefaultsEntry(hook?.id);
    if (entry?.label) {
        return applyHookTokens(entry.label, hook);
    }
    return applyHookTokens(hook?.raw_title || hook?.title || '', hook);
};

export const getDefaultDisplayDescription = (hook) => {
    const entry = getHookDefaultsEntry(hook?.id);
    return entry?.description || '';
};

export const getSavedHookMatch = (hook, eventtriggers = {}) => {
    const catKey = hook?.category ? `${hook.category}Hooks` : 'wordpressHooks';
    if (!HOOK_CATEGORIES.includes(catKey)) {
        return null;
    }
    const list = eventtriggers[catKey];
    if (!Array.isArray(list)) {
        return null;
    }
    return list.find(
        (h) => String(h.id) === String(hook.id) && String(h.point_type) === String(hook.point_type)
    ) || null;
};

export const resolveHookLabel = (hook, eventtriggers = {}) => {
    const match = getSavedHookMatch(hook, eventtriggers);
    let label = '';
    if (match?.displayLabel?.trim()) {
        label = match.displayLabel;
    } else {
        const fromDefault = getHookDefaultsEntry(hook?.id)?.label;
        if (fromDefault) {
            label = fromDefault;
        } else {
            label = hook?.raw_title || hook?.title || '';
        }
    }
    return applyHookTokens(label, hook);
};

export const resolveHookDescription = (hook, eventtriggers = {}) => {
    const match = getSavedHookMatch(hook, eventtriggers);
    if (match?.displayDescription?.trim()) {
        return match.displayDescription.trim();
    }
    return getDefaultDisplayDescription(hook);
};

export const mergeHookAdminState = (hook, savedHook) => ({
    ...hook,
    enabled: savedHook ? savedHook.enabled !== false : true,
    displayLabel: savedHook?.displayLabel?.trim()
        ? savedHook.displayLabel
        : getDefaultDisplayLabel(hook),
    displayDescription: savedHook?.displayDescription?.trim()
        ? savedHook.displayDescription
        : getDefaultDisplayDescription(hook),
});