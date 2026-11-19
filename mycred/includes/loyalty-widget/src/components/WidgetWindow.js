import { Box, Typography, Button } from '@mui/material';
import { __ } from '@wordpress/i18n';
import HomeScreen from './HomeScreen';
import EarnTab from './tabs/EarnTab';
import BoardTab from './tabs/BoardTab';
import LogsTab from './tabs/LogsTab';
import ProfileTab from './tabs/ProfileTab';
import RedeemTab from './tabs/RedeemTab';
import FaqTab from './tabs/FaqTab';
import Badges from './Badges';
import Ranks from './Ranks';
import { filterActiveHooksForWidget } from '../pointTypeVisibility';
import {
    getThemeColors,
    MYCRED_BRANDING_URL,
    getAnimationKeyframes,
    animationStyles,
    WIDGET_SHELL_MIN_HEIGHT,
    WIDGET_HOME_SHELL_MIN_HEIGHT,
    WIDGET_SHELL_MAX_HEIGHT,
    WIDGET_PANEL_BOX_SHADOW,
    WIDGET_PANEL_CONTENT_MIN_HEIGHT,
} from './preview/utils';

export default function WidgetWindow({ settings, user, currentTab, setCurrentTab, onClose }) {
    const design = settings.design || {};
    const content = settings.content || {};
    const tabs = settings.tabs || {};
    const general = settings.general || {};
    const faq = settings.faq || {};
    const assetsUrl = window.mycredLoyaltyWidget?.assets_url || '';

    const addons = window.mycredLoyaltyWidget?.addons || {};
    const ranksEnabled = addons.ranks_enabled !== false && addons.ranks_enabled !== 0;
    const badgesEnabled = addons.badges_enabled !== false && addons.badges_enabled !== 0;
    const isPro = addons.is_toolkit_pro_active;
    const hasWoo = Boolean(window.mycredLoyaltyWidget?.has_woocommerce);

    const isAdmin = window.mycredLoyaltyWidget?.is_admin;
    const settingsUrl = window.mycredLoyaltyWidget?.settings_url;

    const btnColor = design.buttonColor || '#5E2CED';
    const theme = getThemeColors(design);

    const isGuest = !user?.is_logged_in;
    const currentContent = isGuest ? (content.guest || {}) : (content.member || {});

    const position = general.widgetPosition || 'bottom-right';
    const isBottom = position.includes('bottom');
    const isRight = position.includes('right');
    const animation = getAnimationKeyframes(design.launcherAnimation || 'none');
    const isHomeTab = currentTab === 'home';
    const windowStyles = {
        ...animationStyles,
        animation,
        width: 'min(365px, calc(100vw - 32px))',
        height: 'auto',
        minHeight: isHomeTab ? WIDGET_HOME_SHELL_MIN_HEIGHT : WIDGET_SHELL_MIN_HEIGHT,
        maxHeight: WIDGET_SHELL_MAX_HEIGHT,
        bgcolor: '#F8F6FF',
        borderRadius: '24px',
        boxShadow: WIDGET_PANEL_BOX_SHADOW,
        overflow: 'hidden',
        position: 'absolute',
        bottom: isBottom ? 0 : 'auto',
        top: isBottom ? 'auto' : 0,
        right: isRight ? '0' : 'auto',
        left: isRight ? 'auto' : '0',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        border: `1px solid ${theme.footerBorder}`,
    };

    const tabProps = {
        settings,
        currentContent,
        user,
        onBack: () => setCurrentTab('home'),
        onClose,
    };

    const renderContent = () => {
        if (currentTab === 'home') {
            return (
                <HomeScreen
                    design={design}
                    content={currentContent}
                    tabs={tabs}
                    faq={faq}
                    user={user}
                    isGuest={isGuest}
                    isPro={isPro}
                    hasWoo={hasWoo}
                    assetsUrl={assetsUrl}
                    ranksEnabled={ranksEnabled}
                    badgesEnabled={badgesEnabled}
                    onNavigate={setCurrentTab}
                    onClose={onClose}
                />
            );
        }

        if (currentTab === 'earn') {
            return (
                <EarnTab
                    {...tabProps}
                    activeHooks={filterActiveHooksForWidget(window.mycredLoyaltyWidget?.active_hooks || [], settings)}
                />
            );
        }
        if (currentTab === 'board') return <BoardTab {...tabProps} />;
        if (currentTab === 'redeem') return <RedeemTab {...tabProps} />;
        if (currentTab === 'logs') return <LogsTab {...tabProps} />;
        if (currentTab === 'faq') return <FaqTab {...tabProps} />;
        if (currentTab === 'profile') return <ProfileTab {...tabProps} />;
        if (currentTab === 'badges') return <Badges {...tabProps} />;
        if (currentTab === 'ranks') return <Ranks {...tabProps} />;

        return (
            <Box sx={{
                p: '24px',
                flex: 1,
                minHeight: WIDGET_PANEL_CONTENT_MIN_HEIGHT,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <Typography variant="h6" sx={{ fontFamily: "'Instrument Sans', sans-serif", color: '#2D1572' }}>{currentTab.toUpperCase()}</Typography>
                <Typography variant="body2" sx={{ color: '#8670C4', fontFamily: "'Instrument Sans', sans-serif" }}>{__('Coming Soon...', 'mycred')}</Typography>
                <Button sx={{ mt: 2, color: btnColor }} onClick={() => setCurrentTab('home')}>{__('Back to Home', 'mycred')}</Button>
            </Box>
        );
    };

    return (
        <Box sx={windowStyles}>
            <Box
                key={currentTab}
                sx={{
                    flex: 1,
                    overflow: 'hidden',
                    position: 'relative',
                    minHeight: isHomeTab ? 0 : WIDGET_PANEL_CONTENT_MIN_HEIGHT,
                    display: 'flex',
                    flexDirection: 'column',
                    animation: 'fadeKeyframe 0.25s ease-out both',
                }}
            >
                {renderContent()}
            </Box>

            {(design.showBranding !== false || isAdmin) && (
                <Box sx={{
                    height: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isAdmin ? 'space-between' : 'center',
                    bgcolor: '#F8F6FF',
                    borderTop: `1px solid ${theme.footerBorder}`,
                    flexShrink: 0,
                    px: 2,
                }}>
                    {isAdmin && (
                        <Button
                            href={settingsUrl}
                            variant="text"
                            size="small"
                            sx={{
                                color: btnColor,
                                fontSize: '12px',
                                fontFamily: "'Instrument Sans', sans-serif",
                                fontWeight: 600,
                                textTransform: 'none',
                                minWidth: 0,
                                p: 1,
                            }}
                        >
                            {__('Edit Widget', 'mycred')}
                        </Button>
                    )}
                    
                    {design.showBranding !== false ? (
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.75,
                            bgcolor: 'rgba(0, 0, 0, 0.05)',
                            px: 1.5,
                            py: 0.75,
                            borderRadius: '100px',
                            transition: 'all 0.2s',
                            '&:hover': {
                                bgcolor: 'rgba(0, 0, 0, 0.08)',
                            }
                        }}>
                            <Typography sx={{ fontSize: '12px', color: '#555', fontFamily: "'Instrument Sans', sans-serif", fontWeight: 500 }}>
                                {__('Powered by', 'mycred')}
                            </Typography>
                            <Box
                                component="a"
                                href={MYCRED_BRANDING_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    fontWeight: 700,
                                    color: '#1a1a1a',
                                    textDecoration: 'none',
                                    fontSize: '13px',
                                    fontFamily: "'Instrument Sans', sans-serif",
                                }}
                            >
                                {__('myCred', 'mycred')}
                            </Box>
                        </Box>
                    ) : <Box />}
                </Box>
            )}
        </Box>
    );
}
