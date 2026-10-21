/**
 * myCred Admin Design Tokens
 * Single source of truth for React admin UIs (Settings, Hooks, Tools, Logs, Loyalty, etc.).
 *
 * Prefer: import { COLORS, TYPOGRAPHY, RADIUS, SPACING, LAYOUT, SHADOWS, COMPONENTS } from '.../tokens'
 * Or:     const { colors, typography, radius, spacing, layout, shadows, components } = useAdminTheme()
 *
 * Do not invent new hex values in page components — extend this file instead.
 */

/** @typedef {typeof COLORS} AdminColors */

export const COLORS = {
    // Surfaces
    bg: '#f8f6ff',
    paper: '#ffffff',
    paperMuted: '#f2effb',
    contentBg: '#fcfbfe',
    /** Settings form controls */
    inputBg: '#f9f7fc',
    shellBg: '#ffffff',
    sidebarBg: '#ffffff',
    sidebarActive: '#f8f6ff',
    sidebarHover: '#fcfaff',
    hover: '#f8f6ff',
    rowHover: '#fbfaff',
    navCardHover: '#fbfaff',
    hookInactiveBg: '#faf9fe',
    hookCardInactiveBg: '#ffffff',
    filterActiveBg: '#f2eeff',
    paginationActive: '#ebe4ff',

    // Text
    textPrimary: '#2d1572',
    textSecondary: '#6b57a1',
    textMuted: '#978abc',
    tableHeaderText: '#715da9',
    breadcrumbMuted: '#d1c4e9',
    white: '#ffffff',

    // Brand
    primary: '#5e2ced',
    primaryLight: '#ebe4ff',
    primaryHover: '#6a47ff',
    configure: '#8559ff',
    configureHover: '#734bd6',

    // Borders
    border: '#e2ddee',
    borderInput: '#ddd2f9',
    borderPopover: '#e7dffb',
    hookCardBorder: '#e5dff6',
    nestedCardBorder: '#e5dbff',
    radioBorder: '#9e7cff',
    switchTrackOff: '#e6e0f5',
    toggleOff: '#ddd6f1',

    // Semantic
    danger: '#f16060',
    dangerHover: '#ff4d4d',
    dangerBg: '#fff2f2',
    dangerBgHover: '#ffe4e4',
    success: '#16a34a',
    successBg: 'rgba(34, 197, 94, 0.12)',
    warningBg: '#FFFBEB',
    warningBorder: '#FEF3C7',
    warningText: '#92400E',

    // Chrome
    bulkBarBg: '#2d1572',
    bulkBarSecondary: '#523c90',
    bulkBarSecondaryHover: '#644aa8',

    // Shadows (also in SHADOWS; kept on COLORS for existing callers)
    shadow: '0px 10px 40px rgba(0, 0, 0, 0.08)',
    shadowMenu: '0px 10px 20px rgba(45, 21, 114, 0.08)',
    shadowModal: '0px 24px 48px rgba(45, 21, 114, 0.12)',
    shadowBulk: '0px 20px 40px rgba(45, 21, 114, 0.3)',
    shellShadow: '0 20px 40px rgba(0,0,0,0.05)',
    /** Settings chrome (shell, header, content seam) */
    shellChrome: '#E0E0E0',
};

export const FONTS = {
    sans: '"Figtree", "Inter", sans-serif',
    display: '"Vollkorn", "Figtree", serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
};

export const TYPOGRAPHY = {
    fontFamily: FONTS.sans,
    displayFamily: FONTS.display,
    // Page titles (Settings / Logs headers)
    pageTitle: {
        fontFamily: FONTS.sans,
        fontWeight: 700,
        fontSize: '20px',
        lineHeight: '28px',
        color: COLORS.textPrimary,
    },
    // Inner screen titles (AddonViewer heading)
    sectionTitle: {
        fontFamily: FONTS.sans,
        fontWeight: 700,
        fontSize: '22px',
        lineHeight: '28px',
        color: COLORS.textPrimary,
    },
    // Card / block titles
    cardTitle: {
        fontFamily: FONTS.sans,
        fontWeight: 700,
        fontSize: '15px',
        lineHeight: '22px',
        color: COLORS.textPrimary,
    },
    // NavCard title
    navTitle: {
        fontFamily: FONTS.sans,
        fontWeight: 600,
        fontSize: '16px',
        lineHeight: '22px',
        color: COLORS.textPrimary,
    },
    body: {
        fontFamily: FONTS.sans,
        fontWeight: 500,
        fontSize: '14px',
        lineHeight: '20px',
        color: COLORS.textPrimary,
    },
    bodySecondary: {
        fontFamily: FONTS.sans,
        fontWeight: 400,
        fontSize: '14px',
        lineHeight: '20px',
        color: COLORS.textSecondary,
    },
    caption: {
        fontFamily: FONTS.sans,
        fontWeight: 400,
        fontSize: '13px',
        lineHeight: '18px',
        color: COLORS.textSecondary,
    },
    label: {
        fontFamily: FONTS.sans,
        fontWeight: 600,
        fontSize: '13px',
        lineHeight: '18px',
        color: COLORS.textPrimary,
    },
    overline: {
        fontFamily: FONTS.sans,
        fontWeight: 700,
        fontSize: '11px',
        lineHeight: '16px',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: COLORS.textMuted,
    },
    button: {
        fontFamily: FONTS.sans,
        fontWeight: 600,
        fontSize: '14px',
        textTransform: 'none',
    },
};

/** 4px scale */
export const SPACING = {
    xxs: 4,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
    section: 16,
    page: 32,
};

export const RADIUS = {
    xs: '4px',
    sm: '8px',
    md: '10px',
    lg: '12px',
    xl: '14px',
    pill: '999px',
    /** Default interactive controls */
    control: '8px',
    /** Nav / content cards */
    card: '8px',
    /** Settings section papers */
    sectionCard: '14px',
    /** Inner icon well */
    iconWell: '12px',
};

export const SHADOWS = {
    none: 'none',
    card: COLORS.shellShadow,
    shell: COLORS.shellShadow,
    shellSoft: '0 4px 20px rgba(0,0,0,0.08)',
    menu: COLORS.shadowMenu,
    modal: COLORS.shadowModal,
    bulk: COLORS.shadowBulk,
    soft: COLORS.shadow,
    focusRing: '0 0 0 3px rgba(94, 44, 237, 0.12)',
};

export const LAYOUT = {
    contentMaxWidth: '1200px',
    contentPadding: '32px',
    formMaxWidth: '1200px',
    cardPadding: '16px 24px',
    cardGap: '16px',
    sectionCardPadding: '24px',
    sidebarWidth: '260px',
    iconSm: 32,
    iconMd: 40,
    iconHeader: 48,
    iconLg: 56,
    controlHeight: 44,
    /** Settings shell (do not change contentMaxWidth — Widget uses 1200). */
    shellMaxWidth: '1400px',
    shellWidth: '90%',
    shellMargin: '40px auto',
    shellRadius: '12px',
    contentHeaderHeight: 76,
    formColumnMaxWidth: 888,
    settingsCardPadding: '20px',
    settingsCardGap: '24px',
    settingsSidebarWidth: 288,
};

/**
 * Component recipes — use these sx snippets so Settings / Tools / Hooks stay aligned.
 */
export const COMPONENTS = {
    navCard: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        border: `1px solid ${COLORS.border}`,
        borderRadius: RADIUS.card,
        p: LAYOUT.cardPadding,
        mb: LAYOUT.cardGap,
        bgcolor: COLORS.paper,
        cursor: 'pointer',
    },
    sectionCard: {
        borderRadius: RADIUS.sectionCard,
        border: `1px solid ${COLORS.border}`,
        bgcolor: COLORS.paper,
        p: LAYOUT.sectionCardPadding,
        boxShadow: SHADOWS.card,
        boxSizing: 'border-box',
    },
    nestedCard: {
        borderRadius: RADIUS.control,
        border: `1px solid ${COLORS.nestedCardBorder}`,
        bgcolor: COLORS.rowHover,
        p: LAYOUT.sectionCardPadding,
        boxShadow: 'none',
        boxSizing: 'border-box',
    },
    settingsCard: {
        borderRadius: RADIUS.card,
        border: `1px solid ${COLORS.hookCardBorder}`,
        bgcolor: COLORS.paper,
        p: LAYOUT.settingsCardPadding,
        boxShadow: 'none',
        boxSizing: 'border-box',
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: 700,
        color: COLORS.textMuted,
        textTransform: 'uppercase',
        letterSpacing: '0.48px',
        mb: 1.5,
        lineHeight: '16px',
    },
    settingsNavItem: {
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 1.5,
        py: 1.25,
        mb: 0.5,
        borderRadius: RADIUS.card,
        cursor: 'pointer',
    },
    iconWell: {
        sm: {
            width: LAYOUT.iconSm,
            height: LAYOUT.iconSm,
            borderRadius: RADIUS.sm,
            bgcolor: COLORS.primaryLight,
            color: COLORS.primary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        md: {
            width: LAYOUT.iconMd,
            height: LAYOUT.iconMd,
            borderRadius: RADIUS.sm,
            bgcolor: COLORS.primaryLight,
            color: COLORS.primary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        lg: {
            width: LAYOUT.iconLg,
            height: LAYOUT.iconLg,
            borderRadius: RADIUS.iconWell,
            bgcolor: COLORS.primaryLight,
            color: COLORS.primary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
    },
    fieldLabel: {
        display: 'block',
        fontSize: '13px',
        fontWeight: 600,
        color: COLORS.textPrimary,
        mb: '8px',
    },
    textField: {
        height: LAYOUT.controlHeight,
        borderRadius: RADIUS.control,
        border: `1px solid ${COLORS.borderInput}`,
        bgcolor: COLORS.paper,
        color: COLORS.textPrimary,
        fontSize: '14px',
        fontWeight: 500,
        px: '14px',
    },
    primaryButton: {
        height: LAYOUT.controlHeight,
        borderRadius: RADIUS.control,
        bgcolor: COLORS.primary,
        color: COLORS.white,
        fontWeight: 600,
        fontSize: '14px',
        textTransform: 'none',
        boxShadow: 'none',
        px: 2.5,
        '&:hover': { bgcolor: COLORS.primaryHover, boxShadow: 'none' },
    },
    ghostButton: {
        height: LAYOUT.controlHeight,
        borderRadius: RADIUS.control,
        bgcolor: COLORS.paper,
        color: COLORS.primary,
        border: `1px solid ${COLORS.borderInput}`,
        fontWeight: 600,
        fontSize: '14px',
        textTransform: 'none',
        boxShadow: 'none',
    },
    dangerButton: {
        height: LAYOUT.controlHeight,
        borderRadius: RADIUS.control,
        bgcolor: COLORS.dangerBg,
        color: COLORS.danger,
        border: `1px solid #ffd6d6`,
        fontWeight: 600,
        fontSize: '14px',
        textTransform: 'none',
        boxShadow: 'none',
        '&:hover': { bgcolor: COLORS.dangerBgHover },
    },
    badge: {
        fontSize: '10px',
        fontWeight: 700,
        textTransform: 'uppercase',
        color: COLORS.white,
        bgcolor: COLORS.textMuted,
        px: '6px',
        py: '4px',
        borderRadius: RADIUS.xs,
        lineHeight: 1,
    },
};

/** Flat CSS custom properties for HTML mockups / non-React surfaces */
export const CSS_VARIABLES = {
    '--mycred-bg': COLORS.bg,
    '--mycred-paper': COLORS.paper,
    '--mycred-paper-muted': COLORS.paperMuted,
    '--mycred-content-bg': COLORS.contentBg,
    '--mycred-input-bg': COLORS.inputBg,
    '--mycred-shell-bg': COLORS.shellBg,
    '--mycred-hover': COLORS.hover,
    '--mycred-nav-card-hover': COLORS.navCardHover,
    '--mycred-hook-inactive-bg': COLORS.hookInactiveBg,
    '--mycred-hook-card-inactive-bg': COLORS.hookCardInactiveBg,
    '--mycred-filter-active-bg': COLORS.filterActiveBg,
    '--mycred-pagination-active': COLORS.paginationActive,
    '--mycred-text-primary': COLORS.textPrimary,
    '--mycred-text-secondary': COLORS.textSecondary,
    '--mycred-text-muted': COLORS.textMuted,
    '--mycred-table-header-text': COLORS.tableHeaderText,
    '--mycred-white': COLORS.white,
    '--mycred-primary': COLORS.primary,
    '--mycred-primary-light': COLORS.primaryLight,
    '--mycred-primary-hover': COLORS.primaryHover,
    '--mycred-configure': COLORS.configure,
    '--mycred-configure-hover': COLORS.configureHover,
    '--mycred-border': COLORS.border,
    '--mycred-border-input': COLORS.borderInput,
    '--mycred-border-popover': COLORS.borderPopover,
    '--mycred-hook-card-border': COLORS.hookCardBorder,
    '--mycred-nested-card-border': COLORS.nestedCardBorder,
    '--mycred-radio-border': COLORS.radioBorder,
    '--mycred-switch-track-off': COLORS.switchTrackOff,
    '--mycred-toggle-off': COLORS.toggleOff,
    '--mycred-danger': COLORS.danger,
    '--mycred-danger-bg': COLORS.dangerBg,
    '--mycred-success': COLORS.success,
    '--mycred-success-bg': COLORS.successBg,
    '--mycred-warning-bg': COLORS.warningBg,
    '--mycred-warning-border': COLORS.warningBorder,
    '--mycred-warning-text': COLORS.warningText,
    '--mycred-radius-xs': RADIUS.xs,
    '--mycred-radius-sm': RADIUS.sm,
    '--mycred-radius-md': RADIUS.md,
    '--mycred-radius-lg': RADIUS.lg,
    '--mycred-radius-control': RADIUS.control,
    '--mycred-radius-card': RADIUS.card,
    '--mycred-radius-section': RADIUS.sectionCard,
    '--mycred-radius-icon-well': RADIUS.iconWell,
    '--mycred-radius-pill': RADIUS.pill,
    '--mycred-shadow-shell': SHADOWS.shell,
    '--mycred-shadow-shell-soft': SHADOWS.shellSoft,
    '--mycred-shadow-soft': SHADOWS.soft,
    '--mycred-shadow-focus': SHADOWS.focusRing,
    '--mycred-shadow-content-card': '0 2px 12px rgba(45, 21, 114, 0.03)',
    '--mycred-font-sans': FONTS.sans,
    '--mycred-control-height': `${LAYOUT.controlHeight}px`,
    '--mycred-content-max': LAYOUT.contentMaxWidth,
    '--mycred-shell-max': LAYOUT.shellMaxWidth,
    '--mycred-form-column-max': `${LAYOUT.formColumnMaxWidth}px`,
    '--mycred-settings-sidebar': `${LAYOUT.settingsSidebarWidth}px`,
    '--mycred-shell-chrome': COLORS.shellChrome,
    '--mycred-icon-sm': `${LAYOUT.iconSm}px`,
    '--mycred-icon-md': `${LAYOUT.iconMd}px`,
    '--mycred-space-xs': `${SPACING.xs}px`,
    '--mycred-space-sm': `${SPACING.sm}px`,
    '--mycred-space-md': `${SPACING.md}px`,
    '--mycred-space-lg': `${SPACING.lg}px`,
    '--mycred-space-xl': `${SPACING.xl}px`,
};

export const tokens = {
    colors: COLORS,
    fonts: FONTS,
    typography: TYPOGRAPHY,
    spacing: SPACING,
    radius: RADIUS,
    shadows: SHADOWS,
    layout: LAYOUT,
    components: COMPONENTS,
    cssVariables: CSS_VARIABLES,
};

export default tokens;
