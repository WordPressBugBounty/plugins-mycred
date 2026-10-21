import React, { useState, useEffect, useMemo } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import {
    Box,
    Typography,
    IconButton,
    Skeleton,
} from '@mui/material';
import toast, { Toaster } from 'react-hot-toast';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { useAdminTheme } from '../../../src/shared/adminTheme/AdminThemeProvider';
import { getSettingsTheme } from '../../../src/pages/Settings/theme';
import ServiceDetailView from './ServiceDetailView.jsx';
import SidebarPromoCard from '../../../src/shared/components/SidebarPromoCard';
import {
    ADMIN_CONTENT_MAX_WIDTH,
    ADMIN_CONTENT_PADDING,
    ADMIN_CARD_PADDING,
    ADMIN_CARD_GAP,
    ADMIN_SHELL_SX,
    ADMIN_SIDEBAR_SX,
    ADMIN_SIDEBAR_NAV_SX,
    ADMIN_SIDEBAR_PROMO_SX,
    ADMIN_CONTENT_COLUMN_SX,
    ADMIN_SCROLL_AREA_SX,
} from '../../../src/shared/adminShell/layout';

const NavCard = ({
    colors, icon, title, description, onClick, index = 0, badge,
}) => (
    <Box
        onClick={onClick}
        sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: `1px solid ${colors.border}`,
            borderRadius: '8px',
            p: ADMIN_CARD_PADDING,
            mb: ADMIN_CARD_GAP,
            cursor: 'pointer',
            bgcolor: colors.paper,
            transition: 'all 0.2s',
            animation: 'staggerFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
            animationDelay: `${index * 0.06}s`,
            '@keyframes staggerFadeIn': {
                '0%': { opacity: 0, transform: 'translateY(10px)' },
                '100%': { opacity: 1, transform: 'translateY(0)' },
            },
            '&:hover': {
                bgcolor: colors.navCardHover || colors.sidebarHover,
                borderColor: colors.primary,
            },
        }}
    >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
                sx={{
                    bgcolor: colors.primaryLight,
                    color: colors.primary,
                    borderRadius: '8px',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 3,
                    flexShrink: 0,
                }}
            >
                {icon || <AccountBalanceIcon sx={{ fontSize: '24px' }} />}
            </Box>
            <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                    <Typography variant="h6" sx={{ color: colors.textPrimary, fontWeight: 600 }}>
                        {title}
                    </Typography>
                    {badge && (
                        <Box
                            component="span"
                            sx={{
                                fontSize: '10px',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                color: colors.white,
                                bgcolor: colors.primary,
                                px: '6px',
                                py: '4px',
                                borderRadius: '4px',
                                lineHeight: 1,
                            }}
                        >
                            {badge}
                        </Box>
                    )}
                </Box>
                {description && (
                    <Typography variant="body2" sx={{ color: colors.textSecondary, mt: 0.3 }}>
                        {description}
                    </Typography>
                )}
            </Box>
        </Box>
        <ChevronRightIcon sx={{ color: colors.primary }} />
    </Box>
);

const SidebarItem = ({ colors, active, label, onClick, icon: Icon = SettingsOutlinedIcon }) => (
    <Box
        onClick={onClick}
        sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            px: '12px',
            py: '10px',
            mb: '4px',
            cursor: 'pointer',
            borderRadius: '8px',
            borderLeft: active ? `2px solid ${colors.primary}` : '2px solid transparent',
            bgcolor: active ? colors.sidebarActive : 'transparent',
            color: active ? colors.primary : colors.textPrimary,
            '&:hover': { bgcolor: active ? colors.sidebarActive : colors.sidebarHover },
        }}
    >
        <Icon sx={{ fontSize: '20px' }} />
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {label}
        </Typography>
    </Box>
);

const DashboardSkeleton = ({ colors }) => (
    <Box sx={{
        display: 'flex',
        minHeight: 'calc(100vh - 160px)',
        width: '100%',
        maxWidth: '100%',
        mx: 0,
        my: 0,
        bgcolor: colors.shellBg,
        borderRadius: '16px',
        boxShadow: colors.shellShadow,
        border: `1px solid ${colors.border}`,
        overflow: 'hidden',
    }}>
        <Box sx={{
            width: '280px',
            bgcolor: colors.sidebarBg,
            borderRight: `1px solid ${colors.border}`,
            p: '24px 12px',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100%',
        }}>
            <Box sx={{ flex: 1 }}>
                <Skeleton variant="rectangular" height={40} sx={{ borderRadius: '8px', mb: 1.5, mx: 1 }} />
            </Box>
        </Box>
        <Box sx={{ flexGrow: 1, bgcolor: colors.contentBg, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ borderBottom: `1px solid ${colors.border}`, p: '24px 32px', bgcolor: colors.paper, minHeight: '80px', boxSizing: 'border-box' }}>
                <Skeleton variant="text" width="30%" height={32} />
                <Skeleton variant="text" width="50%" height={20} />
            </Box>
            <Box sx={{ p: ADMIN_CONTENT_PADDING, maxWidth: ADMIN_CONTENT_MAX_WIDTH }}>
                {[1, 2].map((i) => (
                    <Skeleton key={i} variant="rectangular" height={80} sx={{ borderRadius: '8px', mb: 3 }} />
                ))}
            </Box>
        </Box>
    </Box>
);

export default function App({ config }) {
    const { colors } = useAdminTheme();
    const theme = useMemo(() => getSettingsTheme(), []);

    const [activeView, setActiveView] = useState('');
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [settingsNonce, setSettingsNonce] = useState('');

    useEffect(() => {
        fetchSettings();
    }, [config]);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const restUrl = config.apiUrl || '/wp-json/mycred/v1/banking';
            const res = await fetch(restUrl, {
                headers: { 'X-WP-Nonce': config.apiNonce || '' }
            });
            const data = await res.json();
            
            setServices(data.services || []);
            setSettingsNonce(data.settings_nonce || '');
            
            if (data.services && data.services.length > 0 && !activeView) {
                setActiveView(data.services[0].id);
            }
        } catch (err) {
            console.error('Failed to fetch banking settings', err);
            toast.error('Failed to load settings.');
        } finally {
            setLoading(false);
        }
    };

    const handleNavigate = (view) => {
        setActiveView(view);
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

    const activeService = useMemo(() => {
        return services.find(s => s.id === activeView) || services[0];
    }, [activeView, services]);

    const activeCount = services.filter(s => s.is_active).length;

    const getIconForService = (id) => {
        if (id === 'central') return <AccountBalanceIcon />;
        if (id === 'schedule_deposit') return <AccessTimeIcon />;
        return <AccountBalanceIcon />;
    };

    return (
        <ThemeProvider theme={theme}>
            <Toaster position="bottom-right" toastOptions={toastOptions} />
            <Box sx={{ boxSizing: 'border-box', bgcolor: colors.bg, width: '100%', maxWidth: '100%' }}>
                <form method="post" action="options.php" id="banking-settings-form" style={{ width: '100%', maxWidth: '100%', display: 'flex', flexDirection: 'column' }}>
                    {settingsNonce && (
                        <div dangerouslySetInnerHTML={{ __html: settingsNonce }} />
                    )}

                    {loading ? (
                        <DashboardSkeleton colors={colors} />
                    ) : (
                        <Box sx={{
                            ...ADMIN_SHELL_SX,
                            mx: 0,
                            my: 0,
                            bgcolor: colors.shellBg,
                            borderRadius: '16px',
                            boxShadow: colors.shellShadow,
                            border: `1px solid ${colors.border}`,
                        }}>
                            {/* ===== LEFT SIDEBAR ===== */}
                            <Box
                                sx={{
                                    ...ADMIN_SIDEBAR_SX,
                                    width: '280px',
                                    bgcolor: colors.sidebarBg,
                                    borderRight: `1px solid ${colors.border}`,
                                    p: '24px 12px',
                                }}
                            >
                                <Box sx={ADMIN_SIDEBAR_NAV_SX}>
                                    {services.map((svc) => (
                                        <SidebarItem
                                            key={svc.id}
                                            colors={colors}
                                            active={activeView === svc.id}
                                            label={svc.title}
                                            icon={getIconForService(svc.id).type}
                                            onClick={() => handleNavigate(svc.id)}
                                        />
                                    ))}
                                </Box>
                                {!config.isProActive && (
                                    <Box sx={ADMIN_SIDEBAR_PROMO_SX}>
                                        <SidebarPromoCard colors={colors} utmMedium="banking_sidebar" />
                                    </Box>
                                )}
                            </Box>

                            {/* ===== RIGHT CONTENT AREA ===== */}
                            <Box
                                sx={{
                                    ...ADMIN_CONTENT_COLUMN_SX,
                                    bgcolor: colors.contentBg,
                                }}
                            >
                                {/* Header bar */}
                                <Box sx={{
                                    borderBottom: `1px solid ${colors.border}`,
                                    p: '16px 32px',
                                    bgcolor: colors.paper,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: 2,
                                    minHeight: '80px',
                                    boxSizing: 'border-box',
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
                                        <Box>
                                            <Typography variant="h5" sx={{ fontWeight: 700, fontSize: '20px', color: colors.textPrimary }}>
                                                Central Deposit
                                            </Typography>
                                            <Typography variant="subtitle1" sx={{ fontSize: '13px', color: colors.textSecondary, mt: 0.5 }}>
                                                Manage central deposit settings and payout logic • {activeCount} of {services.length} active
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>

                                {/* Animated Content Area */}
                                <Box sx={{ flexGrow: 1, minWidth: 0, width: '100%', maxWidth: '100%', position: 'relative', ...ADMIN_SCROLL_AREA_SX }}>
                                    <Box
                                        key={activeView}
                                        sx={{
                                            width: '100%',
                                            maxWidth: '100%',
                                            overflowX: 'hidden',
                                            animation: 'fadeOnly 0.35s ease-out',
                                            '@keyframes fadeOnly': {
                                                '0%': { opacity: 0, transform: 'scale(0.995)' },
                                                '100%': { opacity: 1, transform: 'scale(1)' },
                                            },
                                        }}
                                    >
                                        {/* Individual Service Detail Views */}
                                        {services.map((svc) => (
                                            <Box key={svc.id} sx={{ display: activeView === svc.id ? 'block' : 'none' }}>
                                                <ServiceDetailView
                                                    service={svc}
                                                    onSaveSuccess={fetchSettings}
                                                />
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    )}
                </form>
            </Box>
        </ThemeProvider>
    );
}
