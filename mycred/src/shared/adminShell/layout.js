/**
 * Shared admin shell layout constants — Settings, Loyalty Widget, and future shells.
 * Values live in design tokens; this file re-exports for existing imports.
 */
import { LAYOUT, SHADOWS } from '../adminTheme/tokens';

export const ADMIN_CONTENT_MAX_WIDTH = LAYOUT.contentMaxWidth;
export const ADMIN_CONTENT_PADDING = LAYOUT.contentPadding;
export const ADMIN_FORM_MAX_WIDTH = LAYOUT.formMaxWidth;
export const ADMIN_CARD_PADDING = LAYOUT.cardPadding;
export const ADMIN_CARD_GAP = LAYOUT.cardGap;
export const ADMIN_SECTION_CARD_PADDING = LAYOUT.sectionCardPadding;
export const ADMIN_SIDEBAR_WIDTH = LAYOUT.sidebarWidth;
export const ADMIN_SHELL_MAX_WIDTH = LAYOUT.shellMaxWidth;
export const ADMIN_SHELL_WIDTH = LAYOUT.shellWidth;
export const ADMIN_SHELL_MARGIN = LAYOUT.shellMargin;
export const ADMIN_SHELL_RADIUS = LAYOUT.shellRadius;
export const ADMIN_CONTENT_HEADER_HEIGHT = LAYOUT.contentHeaderHeight;
export const ADMIN_FORM_COLUMN_MAX_WIDTH = LAYOUT.formColumnMaxWidth;
export const ADMIN_SETTINGS_CARD_PADDING = LAYOUT.settingsCardPadding;
export const ADMIN_SETTINGS_CARD_GAP = LAYOUT.settingsCardGap;
export const ADMIN_SETTINGS_SIDEBAR_WIDTH = LAYOUT.settingsSidebarWidth;

export const ADMIN_PAGE_WRAP_SX = {
    maxWidth: ADMIN_SHELL_MAX_WIDTH,
    width: ADMIN_SHELL_WIDTH,
    margin: ADMIN_SHELL_MARGIN,
    pb: 4,
    boxSizing: 'border-box',
};

export const ADMIN_SETTINGS_FONT = '"Figtree", "Inter", sans-serif';

/** Chrome styles applied on top of ADMIN_SETTINGS_SHELL_SX. */
export const getAdminSettingsShellChromeSx = (colors) => ({
    mx: 0,
    my: 0,
    bgcolor: colors.shellBg,
    borderRadius: ADMIN_SHELL_RADIUS,
    boxShadow: SHADOWS.shellSoft,
    border: `1px solid ${colors.shellChrome || colors.border}`,
    overflowX: 'hidden',
    overflowY: 'hidden',
});

export const ADMIN_VIEW_TRANSITION_SX = (navDirection) => ({
    animation: navDirection === 'forward'
        ? 'ameliaForward 0.45s cubic-bezier(0.16, 1, 0.3, 1)'
        : navDirection === 'backward'
            ? 'ameliaBackward 0.45s cubic-bezier(0.16, 1, 0.3, 1)'
            : 'fadeOnly 0.35s ease-out',
    '@keyframes ameliaForward': {
        '0%': { opacity: 0, transform: 'translateX(30px)' },
        '100%': { opacity: 1, transform: 'translateX(0)' },
    },
    '@keyframes ameliaBackward': {
        '0%': { opacity: 0, transform: 'translateX(-30px)' },
        '100%': { opacity: 1, transform: 'translateX(0)' },
    },
    '@keyframes fadeOnly': {
        '0%': { opacity: 0, transform: 'scale(0.995)' },
        '100%': { opacity: 1, transform: 'scale(1)' },
    },
});

/**
 * Viewport fill for short admin shells — keeps cards from collapsing on large screens.
 * Uses 100vh for broad support; --mycred-admin-chrome-offset is set per page in PHP (myCRED header + WP padding).
 */
export const ADMIN_SHELL_VIEWPORT_HEIGHT =
    'calc(100vh - var(--wp-admin--admin-bar--height, 32px) - var(--mycred-admin-chrome-offset, 88px))';

export const ADMIN_SHELL_VIEWPORT_HEIGHT_DVH =
    'calc(100dvh - var(--wp-admin--admin-bar--height, 32px) - var(--mycred-admin-chrome-offset, 88px))';

/** React root below myCRED page header — stretch shell to remaining viewport. */
export const ADMIN_SETTINGS_PAGE_ROOT_SX = {
    boxSizing: 'border-box',
    width: '100%',
    minHeight: ADMIN_SHELL_VIEWPORT_HEIGHT,
    display: 'flex',
    flexDirection: 'column',
    '@supports (height: 100dvh)': {
        minHeight: ADMIN_SHELL_VIEWPORT_HEIGHT_DVH,
    },
};

/** Page wrap fills root; no bottom padding so the shell can sit flush. */
export const ADMIN_SETTINGS_PAGE_WRAP_FILL_SX = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    pb: 0,
};

/** Hide native scrollbars while keeping scroll behavior. */
export const ADMIN_HIDE_SCROLLBAR_SX = {
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    '&::-webkit-scrollbar': {
        display: 'none',
        width: 0,
        height: 0,
    },
};

/** Scrollable region for real lists — not the main Settings/Woo/Tools panes. */
export const ADMIN_SCROLL_AREA_SX = {
    overflowY: 'auto',
    overflowX: 'hidden',
    minHeight: 0,
    ...ADMIN_HIDE_SCROLLBAR_SX,
};

/** Apply to the outer flex shell (sidebar + content). Min viewport band; grows with content. */
export const ADMIN_SHELL_SX = {
    display: 'flex',
    width: '100%',
    maxWidth: '100%',
    height: 'auto',
    minHeight: ADMIN_SHELL_VIEWPORT_HEIGHT,
    overflowX: 'hidden',
    overflowY: 'visible',
    boxSizing: 'border-box',
    '@supports (height: 100dvh)': {
        minHeight: ADMIN_SHELL_VIEWPORT_HEIGHT_DVH,
    },
};

/** Settings / Woo / Widget shell — min-height only (no max-height → no inner scrollbar). */
export const ADMIN_SETTINGS_SHELL_SX = {
    ...ADMIN_SHELL_SX,
    overflowX: 'hidden',
    overflowY: 'hidden',
};

/** Left nav column: full shell height; promo sits at bottom. */
export const ADMIN_SIDEBAR_SX = {
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'stretch',
    minHeight: 0,
    overflow: 'hidden',
    boxSizing: 'border-box',
};

/** Nav items above the promo card — grows with the sidebar. */
export const ADMIN_SIDEBAR_NAV_SX = {
    minHeight: 0,
    overflow: 'auto',
};

/** Promo card footer inside the sidebar. */
export const ADMIN_SIDEBAR_PROMO_SX = {
    pt: 2,
    pb: 1,
    flexShrink: 0,
    px: '4px',
};

/** Main content column beside the sidebar. */
export const ADMIN_CONTENT_COLUMN_SX = {
    flex: 1,
    flexGrow: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'visible',
    boxSizing: 'border-box',
};
