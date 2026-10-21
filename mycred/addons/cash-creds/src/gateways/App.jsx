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
import WalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import HistoryToggleOffIcon from '@mui/icons-material/HistoryToggleOff';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { useAdminTheme } from '../../../../src/shared/adminTheme/AdminThemeProvider';
import { getSettingsTheme } from '../../../../src/pages/Settings/theme';
import SidebarPromoCard from '../../../../src/shared/components/SidebarPromoCard';
import GatewayDetailView from './GatewayDetailView';
import { App as WithdrawalsApp } from '../withdrawals/App.jsx';
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
} from '../../../../src/shared/adminShell/layout';

const NavCard = ({
    colors, icon, title, description, onClick, index = 0, isUpsell = false, badge,
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
            bgcolor: isUpsell ? (colors.sidebarHover || '#fafafa') : colors.paper,
            opacity: isUpsell ? 0.85 : 1,
            animation: 'staggerFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
            animationDelay: `${index * 0.06}s`,
            '@keyframes staggerFadeIn': {
                '0%': { opacity: 0, transform: 'translateY(10px)' },
                '100%': { opacity: 1, transform: 'translateY(0)' },
            },
        }}
    >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
                sx={{
                    bgcolor: isUpsell ? 'rgba(0,0,0,0.04)' : colors.primaryLight,
                    color: isUpsell ? colors.textMuted : colors.primary,
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
                {icon || <WalletOutlinedIcon sx={{ fontSize: '24px' }} />}
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
                                color: isUpsell ? colors.textSecondary : colors.white,
                                bgcolor: isUpsell ? colors.border : colors.primary,
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
        {isUpsell ? (
            <OpenInNewIcon sx={{ color: colors.textMuted, fontSize: '20px' }} />
        ) : (
            <ChevronRightIcon sx={{ color: colors.primary }} />
        )}
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
                <Skeleton variant="rectangular" height={40} sx={{ borderRadius: '8px', mb: 1.5, mx: 1 }} />
            </Box>
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: '12px', mt: 2, mx: 1, flexShrink: 0 }} />
        </Box>
        <Box sx={{ flexGrow: 1, bgcolor: colors.contentBg, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ borderBottom: `1px solid ${colors.border}`, p: '24px 32px', bgcolor: colors.paper, minHeight: '80px', boxSizing: 'border-box' }}>
                <Skeleton variant="text" width="30%" height={32} />
                <Skeleton variant="text" width="50%" height={20} />
            </Box>
            <Box sx={{ p: ADMIN_CONTENT_PADDING, maxWidth: ADMIN_CONTENT_MAX_WIDTH }}>
                {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} variant="rectangular" height={80} sx={{ borderRadius: '8px', mb: 3 }} />
                ))}
            </Box>
        </Box>
    </Box>
);

export default function App({ config }) {
    const { colors } = useAdminTheme();
    const theme = useMemo(() => getSettingsTheme(), []);

    const [activeCategory, setActiveCategory] = useState('gateways');
    const [activeView, setActiveView] = useState('main');
    const [gateways, setGateways] = useState([]);
    const [upsellGateways, setUpsellGateways] = useState([]);
    const [loading, setLoading] = useState(true);
    const [navDirection, setNavDirection] = useState('forward');
    const [settingsNonce, setSettingsNonce] = useState('');

    useEffect(() => {
        fetchGateways();
    }, []);

    const fetchGateways = async () => {
        setLoading(true);
        try {
            const restUrl = config.restUrl || '/wp-json/mycred/v1/cashcred-gateways';
            const res = await fetch(restUrl, {
                headers: { 'X-WP-Nonce': config.nonce || '' }
            });
            const data = await res.json();
            setGateways(data.gateways || []);
            setUpsellGateways([...(data.upsell_gateways || [])]);
            setSettingsNonce(data.settings_nonce || '');
        } catch (err) {
            console.error('Failed to load cashcred gateways', err);
            toast.error('Failed to load gateway settings.');
        } finally {
            setLoading(false);
        }
    };

    const handleNavigate = (view, category, direction = 'forward') => {
        setNavDirection(direction);
        if (category) setActiveCategory(category);
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

    const activeGateway = useMemo(() => {
        if (activeView === 'main') return null;
        return gateways.find(g => g.id === activeView);
    }, [activeView, gateways]);

    const activeCount = gateways.filter(g => g.is_active).length;

    return (
        <ThemeProvider theme={theme}>
            <Toaster position="bottom-right" toastOptions={toastOptions} />
            <Box sx={{ boxSizing: 'border-box', bgcolor: colors.bg, width: '100%', maxWidth: '100%' }}>

                {/* Form wrapper for option saving */}
                <form method="post" action="options.php" id="cashcred-gateways-form" style={{ width: '100%', maxWidth: '100%', display: 'flex', flexDirection: 'column' }}>
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
                                    <SidebarItem
                                        colors={colors}
                                        active={activeCategory === 'gateways'}
                                        label="Payment Gateways"
                                        icon={WalletOutlinedIcon}
                                        onClick={() => { setActiveCategory('gateways'); setActiveView('main'); }}
                                    />

                                    <Typography
                                        sx={{
                                            fontSize: '11px',
                                            fontWeight: 700,
                                            color: colors.textSecondary,
                                            letterSpacing: '0.48px',
                                            px: '12px',
                                            mt: '20px',
                                            mb: '8px',
                                            textTransform: 'uppercase'
                                        }}
                                    >
                                        cashCred Withdrawals
                                    </Typography>

                                    <SidebarItem
                                        colors={colors}
                                        active={activeCategory === 'withdrawals'}
                                        label="Withdrawals"
                                        icon={HistoryToggleOffIcon}
                                        onClick={() => { setActiveCategory('withdrawals'); setActiveView('main'); }}
                                    />
                                </Box>

                                {!config.isProActive && (
                                    <Box sx={ADMIN_SIDEBAR_PROMO_SX}>
                                        <SidebarPromoCard colors={colors} utmMedium="cashcred_sidebar" />
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
                                        {activeView !== 'main' && (
                                            <IconButton onClick={() => handleNavigate('main', null, 'backward')} sx={{ mr: 2 }}>
                                                <ArrowBackIcon sx={{ color: colors.primary }} />
                                            </IconButton>
                                        )}
                                        {activeView === 'main' ? (
                                            <Box>
                                                <Typography variant="h5" sx={{ fontWeight: 700, fontSize: '20px', color: colors.textPrimary }}>
                                                    {activeCategory === 'gateways' ? 'cashCred Payment Gateways' : 'cashCred Withdrawals'}
                                                </Typography>
                                                <Typography variant="subtitle1" sx={{ fontSize: '13px', color: colors.textSecondary, mt: 0.5 }}>
                                                    {activeCategory === 'gateways'
                                                        ? `Enable and configure payment gateways for point cashout / withdrawals • ${activeCount} of ${gateways.length} active`
                                                        : 'Review, approve, and process cashout withdrawal requests'}
                                                </Typography>
                                            </Box>
                                        ) : (
                                            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'nowrap', whiteSpace: 'nowrap', gap: '8px' }}>
                                                <Typography
                                                    component="span"
                                                    onClick={() => handleNavigate('main', null, 'backward')}
                                                    sx={{ cursor: 'pointer', color: colors.textSecondary, fontSize: '14px', fontWeight: 500, '&:hover': { color: colors.primary, textDecoration: 'underline' } }}
                                                >
                                                    Payment Gateways
                                                </Typography>
                                                <Typography component="span" sx={{ color: colors.breadcrumbMuted, fontSize: '14px', fontWeight: 500 }}>/</Typography>
                                                <Typography component="span" sx={{ color: colors.textPrimary, fontWeight: 600, fontSize: '14px' }}>
                                                    {activeGateway ? activeGateway.title : 'Details'}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                </Box>

                                {/* Animated Content Area */}
                                <Box sx={{ flexGrow: 1, minWidth: 0, width: '100%', maxWidth: '100%', position: 'relative', ...ADMIN_SCROLL_AREA_SX }}>
                                    <Box
                                        key={activeView + activeCategory}
                                        sx={{
                                            width: '100%',
                                            maxWidth: '100%',
                                            overflowX: 'hidden',
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
                                        }}
                                    >
                                        {/* Main List of Gateways (Core + Paid) */}
                                        {activeView === 'main' && activeCategory === 'gateways' && (
                                            <Box sx={{ p: ADMIN_CONTENT_PADDING, maxWidth: ADMIN_CONTENT_MAX_WIDTH }}>
                                                {gateways.map((gw, index) => {
                                                    const getStatusDesc = () => {
                                                        if (gw.is_active) {
                                                            return gw.sandbox_mode ? 'Sandbox mode enabled' : 'Active and accepting withdrawals';
                                                        }
                                                        return 'Click to configure and enable this gateway';
                                                    };

                                                    return (
                                                        <NavCard
                                                            key={gw.id}
                                                            colors={colors}
                                                            index={index}
                                                            title={gw.title}
                                                            description={getStatusDesc()}
                                                            badge={gw.is_active ? (gw.sandbox_mode ? 'SANDBOX' : 'ACTIVE') : null}
                                                            onClick={() => handleNavigate(gw.id, null, 'forward')}
                                                        />
                                                    );
                                                })}

                                                {upsellGateways.length > 0 && (
                                                    <>
                                                        <Typography
                                                            sx={{
                                                                fontSize: '12px',
                                                                fontWeight: 700,
                                                                color: colors.textSecondary,
                                                                letterSpacing: '0.48px',
                                                                mt: 4,
                                                                mb: 2,
                                                                textTransform: 'uppercase'
                                                            }}
                                                        >
                                                            PREMIUM GATEWAYS (MYCRED PRO)
                                                        </Typography>
                                                        {upsellGateways.map((gw, index) => (
                                                            <NavCard
                                                                key={gw.text + index}
                                                                colors={colors}
                                                                index={index + gateways.length}
                                                                isUpsell={true}
                                                                title={gw.text}
                                                                description="Unlock this payment gateway with myCred Pro"
                                                                badge={gw.additional_text || 'PRO ADDON'}
                                                                onClick={() => {
                                                                    if (gw.url) {
                                                                        window.open(gw.url, '_blank', 'noopener,noreferrer');
                                                                    }
                                                                }}
                                                            />
                                                        ))}
                                                    </>
                                                )}
                                            </Box>
                                        )}

                                        {/* Withdrawals Table View */}
                                        {activeView === 'main' && activeCategory === 'withdrawals' && (
                                            <Box sx={{ p: 2, width: '100%', maxWidth: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
                                                <WithdrawalsApp />
                                            </Box>
                                        )}

                                        {/* Individual Gateway Detail View */}
                                        {activeView !== 'main' && activeGateway && (
                                            <GatewayDetailView
                                                colors={colors}
                                                gateway={activeGateway}
                                                allGateways={gateways}
                                                onSaveSuccess={fetchGateways}
                                            />
                                        )}
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
