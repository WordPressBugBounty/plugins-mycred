import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { Box, Typography, Skeleton, GlobalStyles } from '@mui/material';
import toast, { Toaster } from 'react-hot-toast';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import PaymentOutlinedIcon from '@mui/icons-material/PaymentOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import ViewCarouselOutlinedIcon from '@mui/icons-material/ViewCarouselOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import CardGiftcardOutlinedIcon from '@mui/icons-material/CardGiftcardOutlined';
import { useAdminTheme } from '../../../src/shared/adminTheme/AdminThemeProvider';
import { getSettingsTheme } from '../../../src/pages/Settings/theme';
import SidebarPromoCard from '../../../src/shared/components/SidebarPromoCard';
import RewardSettingsView from './RewardSettingsView.jsx';
import LegacyFormViewer from './LegacyFormViewer.jsx';
import AdminPageWrap from '../../../src/shared/adminShell/AdminPageWrap';
import AdminSettingsShell from '../../../src/shared/adminShell/AdminSettingsShell';
import AdminContentHeader from '../../../src/shared/adminShell/AdminContentHeader';
import AdminSettingsFooter from '../../../src/shared/adminShell/AdminSettingsFooter';
import AdminNavCard from '../../../src/shared/adminShell/AdminNavCard';
import AdminSettingsNavItem from '../../../src/shared/adminShell/AdminSettingsNavItem';
import AdminPrimaryButton from '../../../src/shared/adminShell/AdminPrimaryButton';
import {
    ADMIN_SETTINGS_SHELL_SX,
    ADMIN_SIDEBAR_SX,
    ADMIN_SIDEBAR_NAV_SX,
    ADMIN_SIDEBAR_PROMO_SX,
    ADMIN_CONTENT_COLUMN_SX,
    ADMIN_CONTENT_HEADER_HEIGHT,
    ADMIN_SETTINGS_FONT,
    ADMIN_SETTINGS_SIDEBAR_WIDTH,
    ADMIN_VIEW_TRANSITION_SX,
    getAdminSettingsShellChromeSx,
} from '../../../src/shared/adminShell/layout';

const TAXONOMY = [
    {
        id: 'rewards_points',
        label: 'Rewards & Points',
        keys: ['Reward Settings', 'Coupons', 'Product Referral'],
        prefixKeys: ['Reward', 'Coupon'],
        icon: EmojiEventsOutlinedIcon,
    },
    {
        id: 'products_display',
        label: 'Products & Display',
        keys: ['Restrict Products', 'Display Reward'],
        prefixKeys: ['Restrict', 'Display'],
        icon: ViewCarouselOutlinedIcon,
    },
    {
        id: 'payments_checkout',
        label: 'Payments & Checkout',
        keys: ['Partial Payments'],
        prefixKeys: ['Partial'],
        icon: PaymentOutlinedIcon,
    },
    {
        id: 'user_accounts',
        label: 'User Accounts',
        keys: ['Points History', 'My Account'],
        prefixKeys: ['Points', 'Account'],
        icon: AccountCircleOutlinedIcon,
    },
];

const UNMAPPED_CATEGORY_ID = 'other_addons';

const resolveCategoryForTitle = (title) => {
    for (const cat of TAXONOMY) {
        if (cat.keys?.includes(title)) {
            return cat.id;
        }
        if (cat.prefixKeys?.some((prefix) => title.startsWith(prefix))) {
            return cat.id;
        }
    }
    return UNMAPPED_CATEGORY_ID;
};

const DashboardSkeleton = ({ colors }) => (
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
        }}>
            <Box sx={{ ...ADMIN_SIDEBAR_NAV_SX, py: 2, px: 0 }}>
                <Box sx={{ px: 3, py: 1, mb: 0.5 }}>
                    <Skeleton variant="text" width="70%" height={16} />
                </Box>
                <Box sx={{ px: 2 }}>
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} variant="rectangular" height={40} sx={{ borderRadius: '8px', mb: 1.5 }} />
                    ))}
                </Box>
            </Box>
        </Box>
        <Box sx={{ ...ADMIN_CONTENT_COLUMN_SX, bgcolor: colors.paper, minHeight: 0, alignItems: 'stretch', alignSelf: 'stretch', width: '100%' }}>
            <Box sx={{ borderBottom: `1px solid ${colors.shellChrome}`, px: 3, height: ADMIN_CONTENT_HEADER_HEIGHT, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Skeleton variant="text" width="30%" height={24} />
                <Skeleton variant="text" width="50%" height={18} />
            </Box>
            <Box sx={{ p: 3, width: '100%' }}>
                {[1, 2].map((i) => (
                    <Skeleton key={i} variant="rectangular" height={80} sx={{ borderRadius: '8px', mb: 3 }} />
                ))}
            </Box>
        </Box>
    </Box>
);

export default function App() {
    const { colors } = useAdminTheme();
    const theme = useMemo(() => getSettingsTheme(), []);

    const config = window.mycredWooCommerceSettings || {};

    const [activeCategory, setActiveCategory] = useState('rewards_points');
    const [activeView, setActiveView] = useState('main');
    const [navDirection, setNavDirection] = useState('forward');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [scrapedModules, setScrapedModules] = useState([]);
    
    const [data, setData] = useState({
        reward_setting: { types: {}, status: [] },
        point_types: [],
        order_statuses: [],
        settings_nonce: '',
        upsells: [],
        status_field_name: ''
    });

    useEffect(() => {
        fetchSettings();

        // Scrape legacy PHP hooks (like mycred-woocommerce-plus)
        const scrapeLegacyHooks = () => {
            const accordions = document.querySelectorAll('#mycred-legacy-form-wrap .mycred-ui-accordion');
            const parsed = [];

            accordions.forEach((accordion, idx) => {
                const labelEl = accordion.querySelector('.mycred-ui-accordion-header label');
                const iconEl = accordion.querySelector('.mycred-ui-accordion-header-icon');
                const bodyEl = accordion.querySelector('.mycred-ui-accordion-body');

                if (labelEl && bodyEl) {
                    parsed.push({
                        title: labelEl.innerText.trim(),
                        viewId: `legacy_${idx}`,
                        bodyNode: bodyEl,
                        iconHtml: iconEl ? iconEl.outerHTML : '',
                        originalParent: bodyEl.parentNode,
                        originalNextSibling: bodyEl.nextElementSibling,
                    });
                }
            });

            setScrapedModules(parsed);
        };

        setTimeout(scrapeLegacyHooks, 100);

    }, []);

    const categoriesMap = useMemo(() => {
        const parsed = {};
        TAXONOMY.forEach((cat) => { parsed[cat.id] = []; });
        parsed[UNMAPPED_CATEGORY_ID] = [];

        // 1. Core Modules
        parsed['rewards_points'].push({
            isCore: true,
            title: 'Reward Settings',
            description: 'Setup product rewards and order status points.',
            viewId: 'reward',
            iconHtml: '' 
        });

        // 2. Scraped Legacy Modules
        scrapedModules.forEach((mod) => {
            const mappedCategory = resolveCategoryForTitle(mod.title);
            parsed[mappedCategory].push({
                ...mod,
                description: `Configure ${mod.title} settings for WooCommerce.`,
            });
        });

        // 3. Upsells
        if (data.upsells) {
            data.upsells.forEach((upsell, idx) => {
                const mappedCategory = resolveCategoryForTitle(upsell.text);
                const alreadyActive = parsed[mappedCategory].find(m => m.title === upsell.text);
                
                if (!alreadyActive) {
                    parsed[mappedCategory].push({
                        isExternal: true,
                        title: upsell.text,
                        badge: upsell.additional_text || 'PRO ADDON',
                        upsellUrl: upsell.url,
                        viewId: `upsell_${idx}`,
                        iconHtml: '', 
                    });
                }
            });
        }

        return parsed;
    }, [scrapedModules, data.upsells]);

    const fetchSettings = async ({ silent = false } = {}) => {
        if (!silent) setLoading(true);
        try {
            const restUrl = config.apiUrl || '/wp-json/mycred/v1/woocommerce/mycred_default';
            const res = await fetch(restUrl, {
                headers: { 'X-WP-Nonce': config.apiNonce || '' }
            });
            const result = await res.json();
            
            setData({
                reward_setting: result.reward_setting || { types: {}, status: [] },
                point_types: result.point_types || [],
                order_statuses: result.order_statuses || [],
                settings_nonce: result.settings_nonce || '',
                upsells: result.upsells || [],
                status_field_name: result.status_field_name || ''
            });
        } catch (err) {
            console.error('Failed to fetch WooCommerce settings', err);
            toast.error('Failed to load settings.');
        } finally {
            setLoading(false);
        }
    };

    const toastOptions = useMemo(() => ({
        style: {
            background: colors.paper,
            color: colors.textPrimary,
            border: `1px solid ${colors.border}`,
            fontFamily: '"Figtree", sans-serif',
            fontWeight: 500,
        },
    }), [colors]);

    const handleExternalClick = (url) => {
        window.open(url, '_blank');
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        const form = document.getElementById('woocommerce-settings-form');
        if (!form) {
            setSaving(false);
            return;
        }

        try {
            const formData = new FormData(form);
            const actionUrl = form.getAttribute('action');
            const response = await fetch(actionUrl, {
                method: 'POST',
                body: formData,
                credentials: 'same-origin',
                redirect: 'manual',
            });

            if (response.type === 'opaqueredirect' || response.status === 200 || response.status === 302) {
                toast.success('Settings saved successfully!');
                fetchSettings({ silent: true });
            } else {
                throw new Error('Failed to save settings');
            }
        } catch (err) {
            console.error('Error saving settings', err);
            toast.error('An error occurred while saving.');
        } finally {
            setSaving(false);
        }
    };

    const getActiveTitle = () => {
        if (activeView === 'main') {
            const cat = TAXONOMY.find((c) => c.id === activeCategory);
            return cat ? cat.label : 'Extensions';
        }
        const activeModules = categoriesMap[activeCategory] || [];
        const module = activeModules.find((m) => m.viewId === activeView);
        return module ? module.title : 'Settings';
    };

    const getActiveSubtitle = () => {
        if (activeView === 'main') {
            return `Configure ${getActiveTitle().toLowerCase()} settings for WooCommerce`;
        }
        const activeModules = categoriesMap[activeCategory] || [];
        const module = activeModules.find((m) => m.viewId === activeView);
        return module?.description || '';
    };

    const handleNavigate = useCallback((view, direction = 'forward') => {
        setNavDirection(direction);
        setActiveView(view);
    }, []);

    const activeSidebarTaxonomies = TAXONOMY.filter((cat) => categoriesMap[cat.id] && categoriesMap[cat.id].length > 0);
    const hasUnmapped = categoriesMap[UNMAPPED_CATEGORY_ID] && categoriesMap[UNMAPPED_CATEGORY_ID].length > 0;
    const currentModules = categoriesMap[activeCategory] || [];
    const showPromoCard = !config.isProActive;
    const isInnerView = activeView !== 'main';
    const activeModule = isInnerView
        ? currentModules.find((m) => m.viewId === activeView)
        : null;

    const renderModuleIcon = (mod) => {
        if (mod?.isCore) {
            return <EmojiEventsOutlinedIcon sx={{ fontSize: 24 }} />;
        }
        if (mod?.isExternal) {
            return <CardGiftcardOutlinedIcon sx={{ fontSize: 24 }} />;
        }
        return <SettingsOutlinedIcon sx={{ fontSize: 24 }} />;
    };

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
                    {loading ? (
                        <DashboardSkeleton colors={colors} />
                    ) : (
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
                                    <Box sx={{ px: 3, py: 1, mb: 0.5 }}>
                                        <Typography sx={{
                                            fontFamily: ADMIN_SETTINGS_FONT,
                                            fontSize: 12,
                                            fontWeight: 700,
                                            color: colors.textSecondary,
                                            letterSpacing: '0.48px',
                                            lineHeight: '16px',
                                        }}>
                                            WOOCOMMERCE SETTINGS
                                        </Typography>
                                    </Box>

                                    <Box sx={{ px: 2 }}>
                                        {activeSidebarTaxonomies.map((cat) => (
                                            <AdminSettingsNavItem
                                                key={cat.id}
                                                colors={colors}
                                                active={activeCategory === cat.id}
                                                label={cat.label}
                                                icon={cat.icon}
                                                onClick={() => {
                                                    setActiveCategory(cat.id);
                                                    handleNavigate('main', 'backward');
                                                }}
                                            />
                                        ))}

                                        {hasUnmapped && (
                                            <AdminSettingsNavItem
                                                colors={colors}
                                                active={activeCategory === UNMAPPED_CATEGORY_ID}
                                                label="Other Extensions"
                                                icon={SettingsOutlinedIcon}
                                                onClick={() => {
                                                    setActiveCategory(UNMAPPED_CATEGORY_ID);
                                                    handleNavigate('main', 'backward');
                                                }}
                                            />
                                        )}
                                    </Box>
                                </Box>

                                {showPromoCard && (
                                    <Box sx={{ ...ADMIN_SIDEBAR_PROMO_SX, px: 2 }}>
                                        <SidebarPromoCard colors={colors} utmMedium="woocommerce_sidebar" />
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
                                    subtitle={getActiveSubtitle()}
                                    showBack={isInnerView}
                                    onBack={() => handleNavigate('main', 'backward')}
                                />

                                <Box
                                    sx={{
                                        flexGrow: 1,
                                        flex: 1,
                                        minHeight: 0,
                                        position: 'relative',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        overflow: isInnerView ? 'hidden' : 'visible',
                                    }}
                                >
                                    <Box
                                        key={activeView + activeCategory}
                                        component={isInnerView ? 'form' : 'div'}
                                        id={isInnerView ? 'woocommerce-settings-form' : undefined}
                                        method={isInnerView ? 'post' : undefined}
                                        action={isInnerView ? 'options.php' : undefined}
                                        onSubmit={isInnerView ? handleSave : undefined}
                                        sx={{
                                            width: '100%',
                                            flex: 1,
                                            minHeight: isInnerView ? 0 : 'auto',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            overflow: isInnerView ? 'hidden' : 'visible',
                                            overflowX: 'hidden',
                                            ...ADMIN_VIEW_TRANSITION_SX(navDirection),
                                        }}
                                    >
                                        {isInnerView && data.settings_nonce && (
                                            <div dangerouslySetInnerHTML={{ __html: data.settings_nonce }} />
                                        )}

                                        {!isInnerView && (
                                            <Box
                                                sx={{
                                                    p: 3,
                                                    width: '100%',
                                                    boxSizing: 'border-box',
                                                    flex: 1,
                                                }}
                                            >
                                                {currentModules.map((mod, idx) => (
                                                    <AdminNavCard
                                                        key={mod.viewId}
                                                        colors={colors}
                                                        index={idx}
                                                        title={mod.title}
                                                        description={mod.description}
                                                        badge={mod.badge}
                                                        isUpsell={mod.isExternal}
                                                        iconHtml={!mod.isCore && !mod.isExternal ? mod.iconHtml : ''}
                                                        fallbackIcon={renderModuleIcon(mod)}
                                                        onClick={() => {
                                                            if (mod.isExternal) {
                                                                handleExternalClick(mod.upsellUrl);
                                                                return;
                                                            }
                                                            handleNavigate(mod.viewId, 'forward');
                                                        }}
                                                    />
                                                ))}
                                                {currentModules.length === 0 && (
                                                    <Typography variant="body2" color="text.secondary">
                                                        No active settings found in this category.
                                                    </Typography>
                                                )}
                                            </Box>
                                        )}

                                        {isInnerView && (
                                            <>
                                                <Box
                                                    sx={{
                                                        p: 3,
                                                        width: '100%',
                                                        boxSizing: 'border-box',
                                                        flex: 1,
                                                        minHeight: 0,
                                                        overflowY: 'auto',
                                                        overflowX: 'hidden',
                                                    }}
                                                >
                                                    {activeView === 'reward' && (
                                                        <RewardSettingsView data={data} />
                                                    )}
                                                    {activeView.startsWith('legacy_') && (
                                                        <LegacyFormViewer
                                                            module={activeModule}
                                                        />
                                                    )}
                                                </Box>
                                                <AdminSettingsFooter>
                                                    <AdminPrimaryButton
                                                        colors={colors}
                                                        type="submit"
                                                        loading={saving}
                                                    >
                                                        Update Settings
                                                    </AdminPrimaryButton>
                                                </AdminSettingsFooter>
                                            </>
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
}
