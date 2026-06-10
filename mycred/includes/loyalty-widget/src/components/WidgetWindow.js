import { Box, Typography, Paper, IconButton, Button, Fade } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LoginIcon from '@mui/icons-material/Login';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import { __, sprintf } from '@wordpress/i18n';
import EarnTab from './tabs/EarnTab';
import BoardTab from './tabs/BoardTab';
import LogsTab from './tabs/LogsTab';
import ProfileTab from './tabs/ProfileTab';
import RedeemTab from './tabs/RedeemTab';
import Badges from './Badges';
import Ranks from './Ranks';

const hexToRgba = (hex, opacity) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${opacity})` : hex;
};

const NavButton = ({ icon: Icon, label, color, textColor, svgSrc, onClick, active }) => (
    <Paper
        elevation={0}
        onClick={onClick}
        sx={{
            width: '100%',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            borderRadius: '12px',
            bgcolor: active ? color : '#fff',
            color: active ? textColor : '#2D1572',
            cursor: 'pointer',
            border: active ? `1px solid ${color}` : '1px solid transparent',
            boxShadow: '0px 8px 16px -8px #EDE8FF',
            transition: '0.2s',
            '&:hover': {
                bgcolor: active ? color : hexToRgba(color, 0.04),
                borderColor: color,
                color: active ? textColor : '#2D1572',
            }
        }}
    >
        {svgSrc ? (
            <Box
                sx={{
                    width: 20,
                    height: 20,
                    bgcolor: 'currentColor',
                    maskImage: `url(${svgSrc})`,
                    maskRepeat: 'no-repeat',
                    maskPosition: 'center',
                    maskSize: 'contain',
                    WebkitMaskImage: `url(${svgSrc})`,
                    WebkitMaskRepeat: 'no-repeat',
                    WebkitMaskPosition: 'center',
                    WebkitMaskSize: 'contain',
                }}
            />
        ) : (
            <Icon sx={{ color: 'inherit', fontSize: 20 }} />
        )}
        <Typography sx={{ fontSize: '14px', fontWeight: 600, color: 'inherit', fontFamily: "'Instrument Sans', sans-serif" }}>{label}</Typography>
    </Paper>
);

export default function WidgetWindow({ settings, user, currentTab, setCurrentTab, onClose }) {
    const design = settings.design || {};
    const content = settings.content || {};
    const tabs = settings.tabs || {};
    const general = settings.general || {};
    const assetsUrl = window.mycredLoyaltyWidget?.assets_url || '';

    // Addon feature flags from PHP
    const addons = window.mycredLoyaltyWidget?.addons || {};
    const ranksEnabled = addons.ranks_enabled !== false && addons.ranks_enabled !== 0;
    const badgesEnabled = addons.badges_enabled !== false && addons.badges_enabled !== 0;

    const bgColor = design.backgroundColor || '#2D1572';
    const textColor = design.textColor || '#5E2CED';
    const btnColor = design.buttonColor || '#5E2CED';
    const btnTextColor = design.buttonTextColor || '#FFFFFF';

    const isGuest = !user?.is_logged_in;
    const currentContent = isGuest ? (content.guest || {}) : (content.member || {});

    const position = general.widgetPosition || 'bottom-right';
    const isBottom = position.includes('bottom');
    const isRight = position.includes('right');

    const windowStyles = {
        width: 'min(420px, calc(100vw - 32px))',
        height: 'min(652px, calc(100vh - 120px))',
        bgcolor: '#F8F6FF', // Updated background
        borderRadius: '24px',
        boxShadow: '0px 16px 32px 0px rgba(230, 225, 250, 0.5)', // Updated shadow
        overflow: 'hidden',
        position: 'absolute',
        bottom: isBottom ? '88px' : 'auto',
        top: isBottom ? 'auto' : '88px',
        right: isRight ? '0' : 'auto',
        left: isRight ? 'auto' : '0',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid #ECE7FF' // Matching border
    };

    const renderContent = () => {
        if (currentTab === 'home') {
            return (
                <Box sx={{
                    p: '24px',
                    pt: '96px',
                    height: '100%',
                    position: 'relative',
                    overflowY: 'auto',
                    scrollbarWidth: 'none',  // Firefox
                    '&::-webkit-scrollbar': {
                        display: 'none'  // Chrome, Safari
                    }
                }}>
                    {/* Main Content Card - Absolute Positioning like Preview */}
                    <Paper
                        elevation={0}
                        sx={{
                            width: '372px',
                            height: '334px',
                            borderRadius: '12px',
                            bgcolor: '#fff',
                            boxShadow: '0px 8px 16px -8px #EDE8FF', // Updated shadow
                            position: 'absolute',
                            top: '108px',
                            left: '24px',
                            overflow: 'hidden',
                            zIndex: 11
                        }}
                    >
                        {/* Welcome Text - Absolute */}
                        <Box sx={{
                            position: 'absolute',
                            top: '28px',
                            left: '24px',
                            right: '24px',
                            textAlign: 'center'
                        }}>
                            <Typography
                                sx={{
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    color: textColor,
                                    fontFamily: "'Instrument Sans', sans-serif",
                                    lineHeight: '20px',
                                    display: 'inline'
                                }}
                            >
                                {currentContent.welcomeMessage || (isGuest ? __('Welcome! Sign up to start earning rewards', 'mycred') : __('Welcome back! Keep earning rewards', 'mycred'))}
                            </Typography>
                        </Box>

                        {/* Trophy - Absolute */}
                        <Box
                            component="img"
                            src={assetsUrl + 'trophy.svg'}
                            alt="Trophy"
                            sx={{
                                width: 90,
                                height: 90,
                                position: 'absolute',
                                top: '68px',
                                left: '141px'
                            }}
                        />

                        {!isGuest && user.all_balances?.length > 0 && (
                            <Box sx={{
                                position: 'absolute',
                                top: '238px',
                                left: '24px',
                                right: '24px',
                                display: 'grid',
                                gridTemplateColumns: `repeat(${Math.min(4, user.all_balances.length)}, 1fr)`,
                                gap: '8px',
                                zIndex: 12
                            }}>
                                {user.all_balances.slice(0, 4).map((b) => (
                                    <Box
                                        key={b.type}
                                        sx={{
                                            px: '4px',
                                            py: '6px',
                                            borderRadius: '10px',
                                            border: '1px solid #EDE8FF',
                                            bgcolor: '#fff',
                                            textAlign: 'center',
                                            boxShadow: '0px 2px 6px rgba(94,44,237,0.04)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            minHeight: '42px'
                                        }}
                                    >
                                        <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#2D1572', fontFamily: "'Instrument Sans', sans-serif", lineHeight: 1 }}>
                                            {b.formatted.replace(/[^\d.-]/g, '')}
                                        </Typography>
                                        <Typography sx={{ fontSize: '10px', color: '#8670C4', fontFamily: "'Instrument Sans', sans-serif", mt: '2px', lineHeight: 1 }}>
                                            {b.label}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        )}

                        {/* Button - Absolute */}
                        <Button
                            variant="contained"
                            onClick={() => {
                                const url = isGuest ? (currentContent.joinRedirect) : (currentContent.dashboardRedirect);
                                if (url) window.location.href = url;
                            }}
                            sx={{
                                width: '324px',
                                height: '48px',
                                position: 'absolute',
                                top: '178px',
                                left: '24px',
                                bgcolor: btnColor,
                                color: btnTextColor,
                                textTransform: 'none',
                                px: '24px',
                                py: '12px',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: 600,
                                gap: '8px',
                                fontFamily: "'Instrument Sans', sans-serif",
                                '&:hover': {
                                    bgcolor: btnColor,
                                    opacity: 0.9
                                }
                            }}
                        >
                            <LoginIcon sx={{ width: 24, height: 24, color: 'inherit' }} />
                            {isGuest ? (currentContent.joinButtonText || __('Join Now', 'mycred')) : (currentContent.dashboardButtonText || __('Dashboard', 'mycred'))}
                        </Button>

                        {/* Footer Text - Absolute */}
                        <Box sx={{
                            position: 'absolute',
                            top: '294px',
                            left: '0',
                            right: '0',
                            textAlign: 'center'
                        }}>
                            <Typography
                                sx={{
                                    fontSize: '14px',
                                    fontWeight: 400,
                                    color: hexToRgba(textColor, 0.7),
                                    fontFamily: "'Instrument Sans', sans-serif",
                                    lineHeight: '20px',
                                    display: 'inline'
                                }}
                            >
                                {isGuest ? __('Already have an account? ', 'mycred') : ''}
                            </Typography>
                            {isGuest && (
                                <Typography
                                    onClick={() => {
                                        if (currentContent.loginRedirect) window.location.href = currentContent.loginRedirect;
                                    }}
                                    sx={{
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        color: btnColor,
                                        fontFamily: "'Instrument Sans', sans-serif",
                                        lineHeight: '20px',
                                        display: 'inline',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {currentContent.loginButtonText || __('Sign in', 'mycred')}
                                </Typography>
                            )}
                        </Box>
                    </Paper>

                    {/* Navigation Grid - Absolute Positioning */}
                    <Box sx={{
                        position: 'absolute',
                        top: '446px',
                        left: '24px',
                        width: '372px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                    }}>
                        <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            columnGap: '12px',
                            rowGap: '12px',
                            width: '100%'
                        }}>
                            {(tabs.tabControls?.earn !== false) && <NavButton svgSrc={assetsUrl + 'earn-icon.svg'} label={currentContent.earnLabel || __('Earn', 'mycred')} color={btnColor} textColor={btnTextColor} onClick={() => setCurrentTab('earn')} active={currentTab === 'earn'} />}
                            {(tabs.tabControls?.redeem !== false && addons.is_toolkit_pro_active) && <NavButton svgSrc={assetsUrl + 'redeem-icon.svg'} label={currentContent.redeemLabel || __('Redeem', 'mycred')} color={btnColor} textColor={btnTextColor} onClick={() => setCurrentTab('redeem')} active={currentTab === 'redeem'} />}
                            {(tabs.tabControls?.board !== false) && <NavButton svgSrc={assetsUrl + 'board-icon.svg'} label={currentContent.boardLabel || __('Board', 'mycred')} color={btnColor} textColor={btnTextColor} onClick={() => setCurrentTab('board')} active={currentTab === 'board'} />}
                            {(tabs.tabControls?.logs !== false) && <NavButton svgSrc={assetsUrl + 'logs-icon.svg'} label={currentContent.logsLabel || __('History', 'mycred')} color={btnColor} textColor={btnTextColor} onClick={() => setCurrentTab('logs')} active={currentTab === 'logs'} />}
                            {(tabs.tabControls?.profile !== false) && <NavButton svgSrc={assetsUrl + 'profile-icon.svg'} label={currentContent.profileLabel || __('Profile', 'mycred')} color={btnColor} textColor={btnTextColor} onClick={() => setCurrentTab('profile')} active={currentTab === 'profile'} />}
                            {ranksEnabled && (tabs.tabControls?.ranks !== false) && <NavButton icon={LeaderboardIcon} label={currentContent.ranksLabel || __('Ranks', 'mycred')} color={btnColor} textColor={btnTextColor} onClick={() => setCurrentTab('ranks')} active={currentTab === 'ranks'} />}
                            {badgesEnabled && (tabs.tabControls?.badges !== false) && <NavButton icon={EmojiEventsIcon} label={currentContent.badgesLabel || __('Badges', 'mycred')} color={btnColor} textColor={btnTextColor} onClick={() => setCurrentTab('badges')} active={currentTab === 'badges'} />}
                        </Box>
                    </Box>
                </Box>
            );
        }

        if (currentTab === 'earn') return <EarnTab settings={settings} currentContent={currentContent} user={user} activeHooks={window.mycredLoyaltyWidget?.active_hooks || []} onBack={() => setCurrentTab('home')} onClose={onClose} />;
        if (currentTab === 'board') return <BoardTab settings={settings} currentContent={currentContent} user={user} onBack={() => setCurrentTab('home')} onClose={onClose} />;
        if (currentTab === 'redeem') return <RedeemTab settings={settings} currentContent={currentContent} onBack={() => setCurrentTab('home')} onClose={onClose} />;
        if (currentTab === 'logs') return <LogsTab settings={settings} currentContent={currentContent} user={user} onBack={() => setCurrentTab('home')} onClose={onClose} />;
        if (currentTab === 'profile') return <ProfileTab settings={settings} currentContent={currentContent} user={user} onBack={() => setCurrentTab('home')} onClose={onClose} />;
        if (currentTab === 'badges') return <Badges settings={settings} currentContent={currentContent} user={user} onBack={() => setCurrentTab('home')} onClose={onClose} />;
        if (currentTab === 'ranks') return <Ranks settings={settings} currentContent={currentContent} user={user} onBack={() => setCurrentTab('home')} onClose={onClose} />;

        return (
            <Box sx={{ p: '24px', pt: '108px', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="h6" sx={{ fontFamily: "'Instrument Sans', sans-serif", color: '#2D1572' }}>{currentTab.toUpperCase()}</Typography>
                <Typography variant="body2" sx={{ color: '#8670C4', fontFamily: "'Instrument Sans', sans-serif" }}>{__('Coming Soon...', 'mycred')}</Typography>
                <Button sx={{ mt: 2, color: btnColor }} onClick={() => setCurrentTab('home')}>{__('Back to Home', 'mycred')}</Button>
            </Box>
        );
    };

    return (
        <Fade in timeout={300}>
            <Box sx={windowStyles}>
                {/* Header - Only show on home tab */}
                {currentTab === 'home' && (
                    <Box sx={{
                        height: '164px',
                        bgcolor: bgColor,
                        color: textColor,
                        p: '24px',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        zIndex: 10
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                {design.showLogo ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Box component="img" src={design.logoUrl || (assetsUrl + 'default-logo.svg')} alt="Logo" sx={{ height: 32, objectFit: 'contain', maxWidth: 150 }} />
                                    </Box>
                                ) : (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Typography sx={{ fontSize: '18px', fontWeight: 700 }}>
                                            {design.logoText || general.widgetTitle || __('myCred', 'mycred')}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                            <IconButton size="small" onClick={onClose} sx={{ color: textColor }}>
                                <CloseIcon />
                            </IconButton>
                        </Box>
                    </Box>
                )}

                {/* Content Area */}
                {renderContent()}

                {/* Footer Branding */}
                {design.showBranding !== false && (
                    <Box sx={{
                        height: '50px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: '#F8F6FF',
                        borderTop: '1px solid #ECE7FF',
                        mt: 'auto'
                    }}>
                        <Typography sx={{
                            fontSize: '12px',
                            color: hexToRgba(textColor, 0.6),
                            fontFamily: "'Instrument Sans', sans-serif"
                        }}>
                            {__('Powered by ', 'mycred')}
                            <Box component="span" sx={{ fontWeight: 600 }}>
                                {__('myCred', 'mycred')}
                            </Box>
                        </Typography>
                    </Box>
                )}
            </Box>
        </Fade>
    );
}
