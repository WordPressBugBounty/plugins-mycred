import { useState, useEffect, useLayoutEffect, useMemo, useRef, useCallback } from '@wordpress/element';
import { ThemeProvider } from '@mui/material/styles';
import {
    Box, Typography, Skeleton, Collapse, GlobalStyles,
    Dialog, DialogContent, DialogActions, Button,
} from '@mui/material';
import toast, { Toaster } from 'react-hot-toast';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import SavingsOutlinedIcon from '@mui/icons-material/SavingsOutlined';
import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
import ExtensionOutlinedIcon from '@mui/icons-material/ExtensionOutlined';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useAdminTheme } from '../../shared/adminTheme/AdminThemeProvider';
import { COMPONENTS } from '../../shared/adminTheme/tokens';
import { getSettingsTheme } from './theme';
import { getLegacyFormSx } from './legacyFormStyles';
import SidebarPromoCard from '../../shared/components/SidebarPromoCard';
import CoreSettingsView from './components/CoreSettingsView';
import SectionedLegacyView from './components/SectionedLegacyView';
import {
    ADMIN_SETTINGS_SHELL_SX,
    ADMIN_SIDEBAR_SX,
    ADMIN_SIDEBAR_NAV_SX,
    ADMIN_SIDEBAR_PROMO_SX,
    ADMIN_CONTENT_COLUMN_SX,
    ADMIN_CONTENT_HEADER_HEIGHT,
    ADMIN_SETTINGS_SIDEBAR_WIDTH,
    ADMIN_SETTINGS_FONT,
    ADMIN_VIEW_TRANSITION_SX,
    getAdminSettingsShellChromeSx,
} from '../../shared/adminShell/layout';
import AdminPageWrap from '../../shared/adminShell/AdminPageWrap';
import AdminSettingsShell from '../../shared/adminShell/AdminSettingsShell';
import AdminContentHeader from '../../shared/adminShell/AdminContentHeader';
import AdminSettingsFooter from '../../shared/adminShell/AdminSettingsFooter';
import AdminNavCard from '../../shared/adminShell/AdminNavCard';
import AdminSettingsNavItem from '../../shared/adminShell/AdminSettingsNavItem';
import AdminPrimaryButton from '../../shared/adminShell/AdminPrimaryButton';
import { initLegacyEditors, removeLegacyEditors } from '../../shared/legacyEditors/initLegacyEditors';
import { uniquifyLegacyRadioIds } from '../../shared/legacyEditors/initLegacySelect2';

const CATEGORY_ICONS = {
    general: SettingsOutlinedIcon,
    communications: EmailOutlinedIcon,
    gamification: EmojiEventsOutlinedIcon,
    commerce: StorefrontOutlinedIcon,
    banking: SavingsOutlinedIcon,
    integrations: HubOutlinedIcon,
    other_addons: ExtensionOutlinedIcon,
};

const SidebarNavGroup = ({ colors, label, open, active, onToggle, children }) => (
    <Box sx={{ mb: 0.5 }}>
        <Box
            role="button"
            tabIndex={0}
            onClick={onToggle}
            onKeyDown={(e) => { if (e.key === 'Enter') onToggle(); }}
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 3,
                py: 1,
                cursor: 'pointer',
                userSelect: 'none',
            }}
        >
            <Typography
                sx={{
                    fontFamily: ADMIN_SETTINGS_FONT,
                    fontSize: 12,
                    fontWeight: 700,
                    color: active && open ? colors.primary : colors.textSecondary,
                    letterSpacing: '0.48px',
                    lineHeight: '16px',
                }}
            >
                {label}
            </Typography>
            {open ? (
                <KeyboardArrowUpIcon sx={{ fontSize: 14, color: colors.textSecondary }} />
            ) : (
                <KeyboardArrowDownIcon sx={{ fontSize: 14, color: colors.textSecondary }} />
            )}
        </Box>
        <Collapse in={open}>
            <Box sx={{ px: 2 }}>
                {children}
            </Box>
        </Collapse>
    </Box>
);

const AddonViewer = ({ colors, module }) => {
    const legacyFormSx = useMemo(() => getLegacyFormSx(colors), [colors]);
    const paneRef = useRef(null);
    const isCoreSettings = (module?.title || '').trim().toLowerCase() === 'core settings';
    const isPointTypes = (module?.title || '').trim().toLowerCase() === 'point types';

    const handleAddPointType = () => {
        document.getElementById('mycred-add-point-type')?.click();
    };

    useEffect(() => {
        if (!module?.bodyNode || isCoreSettings) return undefined;

        // Strip nested Pro upsell lists from relocated bodies (shown as NavCards instead).
        const removed = [];
        module.bodyNode.querySelectorAll('.mycred-plus-addon-upsell-list').forEach((node) => {
            removed.push({
                node,
                parent: node.parentNode,
                next: node.nextSibling,
            });
            node.remove();
        });

        return () => {
            removed.forEach(({ node, parent, next }) => {
                if (!parent) return;
                if (next) parent.insertBefore(node, next);
                else parent.appendChild(node);
            });
        };
    }, [module, isCoreSettings]);

    useEffect(() => {
        if (!module?.bodyNode || isCoreSettings) return undefined;

        const handleUpsellClick = (event) => {
            const header = event.target.closest('.buycred-cashcred-more-tab-btn');
            if (!header || !module.bodyNode.contains(header)) return;

            const url = header.getAttribute('data-url');
            if (url) {
                window.open(url, '_blank', 'noopener,noreferrer');
            }
        };

        module.bodyNode.addEventListener('click', handleUpsellClick);
        return () => module.bodyNode.removeEventListener('click', handleUpsellClick);
    }, [module, isCoreSettings]);

    useLayoutEffect(() => {
        if (!paneRef.current || !module?.bodyNode) {
            return undefined;
        }

        const timer = window.setTimeout(() => {
            uniquifyLegacyRadioIds(paneRef.current);
        }, 0);

        return () => window.clearTimeout(timer);
    }, [module]);

    const handleSave = async (e) => {
        e.preventDefault();

        const form = document.querySelector('form[action="options.php"]');
        if (!form) {
            toast.error('Settings form not found.');
            return;
        }

        const remoteKeyInput = form.querySelector('#myCRED-remote-key');
        if (remoteKeyInput) {
            const keyLength = remoteKeyInput.value.trim().length;
            if (keyLength > 0 && keyLength < 12) {
                toast.error('Remote Access API key must be at least 12 characters.');
                remoteKeyInput.focus();
                return;
            }
        }

        const formData = new FormData(form);
        const toastId = toast.loading('Saving settings...');

        try {
            const actionUrl = form.getAttribute('action');
            await fetch(actionUrl, {
                method: 'POST',
                body: formData,
                credentials: 'same-origin',
                redirect: 'manual',
            });
            toast.success('Settings updated successfully!', { id: toastId });
        } catch (err) {
            console.error(err);
            toast.error('Failed to save settings.', { id: toastId });
        }
    };

    if (!module) return null;

    return (
        <Box
            sx={{
                width: '100%',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                alignSelf: 'stretch',
                flex: 1,
                minHeight: 0,
                overflow: 'hidden',
            }}
        >
            <Box
                sx={{
                    p: 3,
                    width: '100%',
                    boxSizing: 'border-box',
                    alignItems: 'stretch',
                    alignSelf: 'stretch',
                    flex: 1,
                    minHeight: 0,
                    bgcolor: colors.paper,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                }}
            >
                <Box ref={paneRef} sx={legacyFormSx}>
                    {isCoreSettings ? (
                        <CoreSettingsView
                            colors={colors}
                            bodyNode={module.bodyNode}
                            initLegacyEditors={initLegacyEditors}
                            removeLegacyEditors={removeLegacyEditors}
                        />
                    ) : (
                        <SectionedLegacyView
                            colors={colors}
                            bodyNode={module.bodyNode}
                            moduleTitle={module.title}
                            initLegacyEditors={initLegacyEditors}
                            removeLegacyEditors={removeLegacyEditors}
                        />
                    )}
                </Box>
            </Box>

            <AdminSettingsFooter>
                {isPointTypes ? (
                    <AdminPrimaryButton colors={colors} onClick={handleAddPointType}>
                        Add Point Type
                    </AdminPrimaryButton>
                ) : (
                    <AdminPrimaryButton colors={colors} onClick={handleSave}>
                        Update Settings
                    </AdminPrimaryButton>
                )}
            </AdminSettingsFooter>
        </Box>
    );
};

const UNMAPPED_CATEGORY_ID = 'other_addons';

const PLUS_ADDON_UPSELL_CONFIG = {
    transfer: { category: 'commerce', insertAfter: 'Transfers' },
};

const mergePlusAddonUpsells = (parsedCategories) => {
    const upsellsByParent = window.mycredSettingsData?.plus_addon_upsells || {};

    Object.entries(PLUS_ADDON_UPSELL_CONFIG).forEach(([parentSlug, config]) => {
        const tabs = upsellsByParent[parentSlug];
        if (!Array.isArray(tabs) || tabs.length === 0) return;

        const categoryModules = parsedCategories[config.category];
        if (!categoryModules) return;

        const upsellModules = tabs.map((tab, index) => ({
            title: tab.text,
            description: tab.additional_text || 'Paid',
            viewId: `upsell_${parentSlug}_${index}`,
            isUpsell: true,
            upsellUrl: tab.url,
            badge: tab.additional_text || 'Paid',
            iconHtml: tab.icon
                ? `<span class="${tab.icon} mycred-ui-accordion-header-icon"></span>`
                : '',
        }));

        const insertIndex = categoryModules.findIndex((module) => module.title === config.insertAfter);
        // Only show parent-linked upsells when the parent module is present (addon active).
        if (insertIndex < 0) {
            return;
        }
        categoryModules.splice(insertIndex + 1, 0, ...upsellModules);
    });
};

const getPrimarySettingsLabel = () => {
    const data = window.mycredSettingsData;
    if (data?.isGeneralSettingsScreen) {
        return 'General Settings';
    }
    if (data?.pointTypeLabel) {
        return `${data.pointTypeLabel} Settings`;
    }
    return 'Settings';
};

const TAXONOMY = [
    {
        id: 'general',
        label: getPrimarySettingsLabel(),
        keys: ['Core Settings', 'Management', 'Optimization', 'Point Types', 'Uninstall', 'Remote Access', 'Dashboard', 'Exports', 'AI Assistant Settings', 'Statistics'],
    },
    {
        id: 'communications',
        label: 'Emails & Notifications',
        keys: ['Email Notices', 'Notifications', 'Notifications Plus'],
    },
    {
        id: 'gamification',
        label: 'Badges & Ranks',
        keys: ['Badges', 'Open Badge Setting', 'Credly Badges', 'Badgr', 'Ranks', 'Level Cred', 'Progress Map'],
    },
    {
        id: 'commerce',
        label: 'Commerce & Economy',
        keys: [
            'buyCRED',
            'cashCRED',
            'Coupons',
            'Transfers',
            'Sell Content',
            'Pending Transfers',
            'Transfer Fees',
            'Transfer via Code',
            'Twilio Transfers',
            'SMS Payments',
            'WooCommerce Plus',
        ],
    },
    {
        id: 'banking',
        label: 'Point Banking & Expiry',
        keys: ['Points Expiration', 'Reset Points', 'BP Charges'],
        prefixKeys: ['Pending '],
    },
    {
        id: 'integrations',
        label: 'Integrations & API',
        keys: [
            'REST API',
            'Social Proof',
            'Zapier',
            'GitHub Application Settings',
            'LearnDash Importer',
            'GamiPress Importer',
            'BuddyPress',
            'UserPro',
            'Pacman',
        ],
    },
];

const resolveCategoryForTitle = (title) => {
    for (const cat of TAXONOMY) {
        if (cat.keys?.includes(title)) {
            return cat.id;
        }
        if (cat.prefixKeys?.some((prefix) => title.startsWith(prefix))) {
            return cat.id;
        }
    }
    // Soft matches for toolkit title variants
    const lower = title.toLowerCase();
    if (lower.includes('buddypress')) return 'integrations';
    if (lower.includes('ai assistant')) return 'general';
    if (lower.includes('expiration')) return 'banking';
    if (lower.includes('woocommerce')) return 'commerce';
    if (lower.includes('social proof') || lower.includes('social share')) return 'integrations';
    return UNMAPPED_CATEGORY_ID;
};

const MODULE_DESCRIPTIONS = {
    'Core Settings': 'Core setup and foundations for myCred',
    'Management': 'Manage user balances, logs, and accounts',
    'Optimization': 'Optimize database performance and logging',
    'Point Types': 'Create and manage custom point types',
    'Uninstall': 'Configure what happens when you delete myCred',
    'Remote Access': 'Connect your myCred to external applications',
    'Dashboard': 'Configure dashboard widgets and stats',
    'Exports': 'Export point balances and logs',
    'Email Notices': 'Manage automated email notifications',
    'Notifications': 'Configure site-wide notifications',
    'Notifications Plus': 'Advanced notification rules and delivery options',
    'AI Assistant Settings': 'Configure the myCred AI assistant',
    'Badges': 'Manage user badges and achievements',
    'Open Badge Setting': 'Configure Open Badges integration settings',
    'Credly Badges': 'Integrate with Credly for digital credentials',
    'Badgr': 'Connect and manage Badgr digital badges',
    'Ranks': 'Configure user ranks and rank requirements',
    'Level Cred': 'Set up level-based point rewards and priorities',
    'Progress Map': 'Visual progress maps for user milestones',
    'Statistics': 'View and configure point statistics for this type',
    'buyCRED': 'Allow users to purchase points',
    'cashCRED': 'Redeem points for real cash',
    'Coupons': 'Create and manage point coupons',
    'Transfers': 'Allow point transfers between users',
    'Sell Content': 'Monetize content with point-based access',
    'Pending Transfers': 'Require approval before transfers complete',
    'Transfer Fees': 'Charge fees on point transfers',
    'Transfer via Code': 'Enable transfers using redeemable codes',
    'Twilio Transfers': 'Transfer points via SMS with Twilio',
    'SMS Payments': 'Accept point purchases via SMS payments',
    'WooCommerce Plus': 'Advanced WooCommerce points features',
    'Points Expiration': 'Configure automatic point expiry rules',
    'Reset Points': 'Bulk reset or adjust user point balances',
    'BP Charges': 'Charge points for BuddyPress actions',
    'REST API': 'Manage REST API access and endpoints',
    'Social Proof': 'Display live point activity popups on your site',
    'Zapier': 'Connect myCred to Zapier automations',
    'GitHub Application Settings': 'Configure GitHub app integration',
    'LearnDash Importer': 'Import points from LearnDash courses',
    'GamiPress Importer': 'Import points and achievements from GamiPress',
    'BuddyPress': 'BuddyPress profile and activity point settings',
    'UserPro': 'UserPro profile integration settings',
    'Pacman': 'Configure Pacman game point rewards',
};

const getModuleDescription = (title) => {
    if (MODULE_DESCRIPTIONS[title]) {
        return MODULE_DESCRIPTIONS[title];
    }
    if (title.startsWith('Pending ')) {
        return 'Configure pending point balances and release rules';
    }
    return 'Configure module settings dynamically';
};

const DashboardSkeleton = ({ colors, showPromo = true }) => (
    <Box sx={{
        ...ADMIN_SETTINGS_SHELL_SX,
        ...getAdminSettingsShellChromeSx(colors),
    }}>
        <Box sx={{
            ...ADMIN_SIDEBAR_SX,
            width: ADMIN_SETTINGS_SIDEBAR_WIDTH,
            minWidth: ADMIN_SETTINGS_SIDEBAR_WIDTH,
            bgcolor: colors.sidebarBg,
            borderRight: `1px solid ${colors.hookCardBorder || colors.border}`,
            py: 2,
            px: 0,
        }}>
            <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="40%" height={20} sx={{ mb: 1, mt: 1, ml: 3 }} />
                <Skeleton variant="rectangular" height={40} sx={{ borderRadius: '8px', mb: 1.5, mx: 2 }} />
                <Skeleton variant="text" width="60%" height={20} sx={{ mb: 1, mt: 2, ml: 3 }} />
                {[1, 2].map((i) => (
                    <Skeleton key={i} variant="rectangular" height={40} sx={{ borderRadius: '8px', mb: 1.5, mx: 2 }} />
                ))}
            </Box>
            {showPromo && (
                <Skeleton variant="rectangular" height={220} sx={{ borderRadius: '12px', mt: 2, mx: 2, mb: 2, flexShrink: 0 }} />
            )}
        </Box>
        <Box sx={{ ...ADMIN_CONTENT_COLUMN_SX, bgcolor: colors.paper, minHeight: 0 }}>
            <Box sx={{ borderBottom: `1px solid ${colors.shellChrome}`, px: 3, bgcolor: colors.paper, height: ADMIN_CONTENT_HEADER_HEIGHT, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Skeleton variant="text" width="30%" height={24} />
                <Skeleton variant="text" width="50%" height={18} />
            </Box>
            <Box sx={{ p: 3, width: '100%' }}>
                {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} variant="rectangular" height={80} sx={{ borderRadius: '8px', mb: 3 }} />
                ))}
            </Box>
        </Box>
    </Box>
);

const App = () => {
    const { colors } = useAdminTheme();
    const theme = useMemo(() => getSettingsTheme(), []);

    const [activeCategory, setActiveCategory] = useState('general');
    const [activeView, setActiveView] = useState('main');
    const [categoriesMap, setCategoriesMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [navDirection, setNavDirection] = useState('forward');
    const [sidebarOpen, setSidebarOpen] = useState({
        settings: true,
        extensions: true,
    });
    const confirmRequestRef = useRef(null);
    const [confirmRequest, setConfirmRequest] = useState(null);

    const finishConfirm = useCallback((accepted) => {
        const request = confirmRequestRef.current;
        if (!request) return;
        confirmRequestRef.current = null;
        setConfirmRequest(null);
        request.resolve(Boolean(accepted));
    }, []);

    const toastOptions = useMemo(() => ({
        style: {
            background: colors.paper,
            color: colors.textPrimary,
            border: `1px solid ${colors.border}`,
            borderRadius: '10px',
            fontFamily: '"Figtree", "Inter", sans-serif',
            fontSize: '13px',
            fontWeight: 500,
            boxShadow: colors.shadowMenu || '0px 10px 20px rgba(45, 21, 114, 0.08)',
        },
        success: {
            iconTheme: {
                primary: colors.success || '#16a34a',
                secondary: colors.paper,
            },
        },
        error: {
            iconTheme: {
                primary: colors.danger,
                secondary: colors.paper,
            },
        },
    }), [colors]);

    useEffect(() => {
        window.mycredSettingsToast = {
            success: (message, options = {}) => {
                const actionLabel = options.actionLabel || '';
                const actionUrl = options.actionUrl || '';
                if (actionLabel && actionUrl) {
                    toast.success(
                        (t) => (
                            <span style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                                <span>{message}</span>
                                <a
                                    href={actionUrl}
                                    onClick={() => toast.dismiss(t.id)}
                                    style={{
                                        color: colors.primary,
                                        fontWeight: 700,
                                        textDecoration: 'underline',
                                    }}
                                >
                                    {actionLabel}
                                </a>
                            </span>
                        ),
                        { duration: 6000 }
                    );
                    return;
                }
                toast.success(message);
            },
            error: (message) => toast.error(message || 'Error'),
            confirm: (options = {}) => new Promise((resolve) => {
                if (confirmRequestRef.current) {
                    confirmRequestRef.current.resolve(false);
                }
                const request = {
                    message: options.message || '',
                    confirmLabel: options.confirmLabel || 'OK',
                    cancelLabel: options.cancelLabel || 'Cancel',
                    resolve,
                };
                confirmRequestRef.current = request;
                setConfirmRequest(request);
            }),
        };

        return () => {
            if (confirmRequestRef.current) {
                confirmRequestRef.current.resolve(false);
                confirmRequestRef.current = null;
            }
            if (window.mycredSettingsToast) {
                delete window.mycredSettingsToast;
            }
        };
    }, [colors.primary]);

    const handleNavigate = (view, category, direction = 'forward') => {
        setNavDirection(direction);
        if (category) setActiveCategory(category);
        setActiveView(view);
    };

    useEffect(() => {
        const scrapeLegacyHooks = () => {
            const accordions = document.querySelectorAll('#mycred-legacy-form-wrap .mycred-ui-accordion');
            const parsedCategories = {};

            TAXONOMY.forEach((cat) => { parsedCategories[cat.id] = []; });
            parsedCategories[UNMAPPED_CATEGORY_ID] = [];

            accordions.forEach((accordion, idx) => {
                if (accordion.style.display === 'none') return;

                const parentWrapper = accordion.closest('.mycred-after-core-prefs, .mycred-type-prefs');
                if (parentWrapper && parentWrapper.style.display === 'none') return;

                const labelEl = accordion.querySelector('.mycred-ui-accordion-header label');
                const iconEl = accordion.querySelector('.mycred-ui-accordion-header-icon');
                const bodyEl = accordion.querySelector('.mycred-ui-accordion-body');

                if (labelEl && bodyEl) {
                    const title = labelEl.innerText.trim();

                    const moduleData = {
                        title,
                        description: getModuleDescription(title),
                        viewId: `module_${idx}`,
                        bodyNode: bodyEl,
                        iconHtml: iconEl ? iconEl.outerHTML : '',
                        originalParent: bodyEl.parentNode,
                        originalNextSibling: bodyEl.nextElementSibling,
                    };

                    const mappedCategory = resolveCategoryForTitle(title);

                    parsedCategories[mappedCategory].push(moduleData);
                }
            });

            mergePlusAddonUpsells(parsedCategories);

            setCategoriesMap(parsedCategories);
            setTimeout(() => setLoading(false), 300);
        };

        scrapeLegacyHooks();
    }, []);

    const getActiveTitle = () => {
        if (activeView === 'main') {
            const cat = TAXONOMY.find((c) => c.id === activeCategory);
            return cat ? cat.label : 'Extensions';
        }
        const activeModules = categoriesMap[activeCategory] || [];
        const module = activeModules.find((m) => m.viewId === activeView);
        return module ? module.title : 'Details';
    };

    const getActiveSubtitle = () => {
        if (activeView === 'main') {
            return activeCategory === 'general'
                ? 'Core setup and foundations for myCred'
                : 'Configure extensions dynamically';
        }
        return activeModule?.description || '';
    };

    const toggleSidebarGroup = useCallback((groupId) => {
        setSidebarOpen((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
    }, []);

    useEffect(() => {
        if (activeCategory === 'general') {
            setSidebarOpen((prev) => ({ ...prev, settings: true }));
        } else {
            setSidebarOpen((prev) => ({ ...prev, extensions: true }));
        }
    }, [activeCategory]);

    const activeSidebarTaxonomies = TAXONOMY.filter((cat) => categoriesMap[cat.id] && categoriesMap[cat.id].length > 0);
    const hasUnmapped = categoriesMap[UNMAPPED_CATEGORY_ID] && categoriesMap[UNMAPPED_CATEGORY_ID].length > 0;
    const extensionCategories = activeSidebarTaxonomies.filter((cat) => cat.id !== 'general');
    const showPromoCard = !window.mycredSettingsData?.isProActive;
    const currentModules = categoriesMap[activeCategory] || [];
    const generalLabel = getPrimarySettingsLabel();
    const isGeneralSettingsScreen = !!window.mycredSettingsData?.isGeneralSettingsScreen;
    const GeneralIcon = isGeneralSettingsScreen ? SettingsOutlinedIcon : StarOutlineIcon;
    const activeModule = activeView !== 'main'
        ? currentModules.find((m) => m.viewId === activeView)
        : null;
    const showExtensionsGroup = extensionCategories.length > 0 || hasUnmapped;
    const isSettingsSectionActive = activeCategory === 'general';
    const isExtensionsSectionActive = !isSettingsSectionActive;
    const activeSubtitle = getActiveSubtitle();
    const isModuleView = activeView.startsWith('module_');

    return (
        <ThemeProvider theme={theme}>
            <GlobalStyles
                styles={{
                    '.mycred-react-root, .mycred-react-root .MuiTypography-root': {
                        fontFamily: 'Figtree, Inter, sans-serif !important',
                    },
                }}
            />
            <Toaster position="bottom-right" toastOptions={toastOptions} />
            <Dialog
                open={Boolean(confirmRequest)}
                onClose={() => finishConfirm(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: '12px',
                        boxShadow: colors.shadowModal,
                        p: 1,
                        bgcolor: colors.paper,
                    },
                }}
            >
                <DialogContent sx={{ pt: 3, pb: 1 }}>
                    <Typography sx={{ color: colors.textPrimary, fontSize: '15px', lineHeight: 1.6, fontFamily: "'Figtree', sans-serif" }}>
                        {confirmRequest?.message}
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 2, gap: 1, justifyContent: 'flex-end' }}>
                    <Button
                        onClick={() => finishConfirm(false)}
                        sx={{
                            px: 3,
                            height: '44px',
                            color: colors.textPrimary,
                            borderRadius: '10px',
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '14px',
                            fontFamily: "'Figtree', sans-serif",
                            border: `1px solid ${colors.border}`,
                            '&:hover': { background: colors.hover, borderColor: colors.borderInput },
                        }}
                    >
                        {confirmRequest?.cancelLabel || 'Cancel'}
                    </Button>
                    <Button
                        onClick={() => finishConfirm(true)}
                        variant="contained"
                        sx={{
                            px: 3,
                            height: '44px',
                            background: colors.danger,
                            color: colors.white,
                            '&:hover': { background: colors.dangerHover, color: colors.white },
                            borderRadius: '10px',
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '14px',
                            fontFamily: "'Figtree', sans-serif",
                            boxShadow: 'none',
                        }}
                    >
                        {confirmRequest?.confirmLabel || 'OK'}
                    </Button>
                </DialogActions>
            </Dialog>
            <Box
                className="mycred-react-root"
                sx={{
                    boxSizing: 'border-box',
                    bgcolor: colors.bg,
                    overflowX: 'hidden',
                    width: '100%',
                    fontFamily: ADMIN_SETTINGS_FONT,
                }}
            >
                <AdminPageWrap>
                    {loading ? <DashboardSkeleton colors={colors} showPromo={showPromoCard} /> : (
                        <AdminSettingsShell>
                            <Box
                                sx={{
                                    ...ADMIN_SIDEBAR_SX,
                                    width: ADMIN_SETTINGS_SIDEBAR_WIDTH,
                                    minWidth: ADMIN_SETTINGS_SIDEBAR_WIDTH,
                                    bgcolor: colors.sidebarBg,
                                    borderRight: `1px solid ${colors.hookCardBorder || colors.border}`,
                                }}
                            >
                                <Box sx={{ ...ADMIN_SIDEBAR_NAV_SX, py: 2, px: 0 }}>
                                    <SidebarNavGroup
                                        colors={colors}
                                        label="SETTINGS"
                                        open={sidebarOpen.settings}
                                        active={isSettingsSectionActive}
                                        onToggle={() => toggleSidebarGroup('settings')}
                                    >
                                        <AdminSettingsNavItem
                                            colors={colors}
                                            active={activeCategory === 'general'}
                                            label={generalLabel}
                                            icon={GeneralIcon}
                                            onClick={() => { setActiveCategory('general'); setActiveView('main'); }}
                                        />
                                    </SidebarNavGroup>

                                    {showExtensionsGroup && (
                                        <SidebarNavGroup
                                            colors={colors}
                                            label="EXTENSIONS & ADD-ONS"
                                            open={sidebarOpen.extensions}
                                            active={isExtensionsSectionActive}
                                            onToggle={() => toggleSidebarGroup('extensions')}
                                        >
                                            {activeSidebarTaxonomies.map((cat) => {
                                                if (cat.id === 'general') return null;
                                                return (
                                                    <AdminSettingsNavItem
                                                        key={cat.id}
                                                        colors={colors}
                                                        active={activeCategory === cat.id}
                                                        label={cat.label}
                                                        icon={CATEGORY_ICONS[cat.id] || SettingsOutlinedIcon}
                                                        onClick={() => { setActiveCategory(cat.id); setActiveView('main'); }}
                                                    />
                                                );
                                            })}
                                            {hasUnmapped && (
                                                <AdminSettingsNavItem
                                                    colors={colors}
                                                    active={activeCategory === UNMAPPED_CATEGORY_ID}
                                                    label="Other Extensions"
                                                    icon={CATEGORY_ICONS.other_addons}
                                                    onClick={() => { setActiveCategory(UNMAPPED_CATEGORY_ID); setActiveView('main'); }}
                                                />
                                            )}
                                        </SidebarNavGroup>
                                    )}
                                </Box>

                                {showPromoCard && (
                                    <Box sx={{ ...ADMIN_SIDEBAR_PROMO_SX, px: 2 }}>
                                        <SidebarPromoCard colors={colors} utmMedium="settings_sidebar" />
                                    </Box>
                                )}
                            </Box>

                            <Box
                                sx={{
                                    ...ADMIN_CONTENT_COLUMN_SX,
                                    bgcolor: colors.paper,
                                    minHeight: 0,
                                    alignItems: 'stretch',
                                    alignSelf: 'stretch',
                                    width: '100%',
                                }}
                            >
                                <AdminContentHeader
                                    title={getActiveTitle()}
                                    subtitle={activeSubtitle}
                                    showBack={activeView !== 'main'}
                                    onBack={() => handleNavigate('main', null, 'backward')}
                                />

                                <Box
                                    sx={{
                                        flexGrow: 1,
                                        flex: 1,
                                        minHeight: 0,
                                        position: 'relative',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'stretch',
                                        alignSelf: 'stretch',
                                        width: '100%',
                                        overflow: isModuleView ? 'hidden' : 'visible',
                                    }}
                                >
                                    <Box
                                        key={activeView + activeCategory}
                                        sx={{
                                            width: '100%',
                                            flex: 1,
                                            minHeight: isModuleView ? 0 : 'auto',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'stretch',
                                            alignSelf: 'stretch',
                                            overflowY: isModuleView ? 'hidden' : 'visible',
                                            overflowX: 'hidden',
                                            ...ADMIN_VIEW_TRANSITION_SX(navDirection),
                                        }}
                                    >
                                        {activeView === 'main' && (
                                            <Box
                                                sx={{
                                                    p: 3,
                                                    width: '100%',
                                                    boxSizing: 'border-box',
                                                    alignItems: 'stretch',
                                                    alignSelf: 'stretch',
                                                    flex: 1,
                                                    overflow: 'visible',
                                                }}
                                            >
                                                {currentModules.map((module, index) => (
                                                    <AdminNavCard
                                                        key={module.viewId}
                                                        colors={colors}
                                                        index={index}
                                                        iconHtml={module.iconHtml}
                                                        fallbackIcon={<SettingsOutlinedIcon />}
                                                        title={module.title}
                                                        description={module.description}
                                                        isUpsell={module.isUpsell}
                                                        badge={module.badge}
                                                        onClick={() => {
                                                            if (module.isUpsell && module.upsellUrl) {
                                                                window.open(module.upsellUrl, '_blank', 'noopener,noreferrer');
                                                                return;
                                                            }
                                                            handleNavigate(module.viewId, null, 'forward');
                                                        }}
                                                    />
                                                ))}
                                                {currentModules.length === 0 && (
                                                    <Typography variant="body1" color="text.secondary">Fetching {getActiveTitle()} settings...</Typography>
                                                )}
                                            </Box>
                                        )}

                                        {activeView.startsWith('module_') && (
                                            <AddonViewer
                                                colors={colors}
                                                module={currentModules.find((m) => m.viewId === activeView)}
                                            />
                                        )}
                                    </Box>
                                </Box>
                            </Box>
                        </AdminSettingsShell>
                    )}
                </AdminPageWrap>
            </Box>
        </ThemeProvider>
    );
};

export default App;
