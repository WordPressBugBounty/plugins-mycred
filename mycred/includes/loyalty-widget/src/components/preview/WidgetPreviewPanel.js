import { useState, useEffect, useMemo } from '@wordpress/element';
import { Box } from '@mui/material';
import { __ } from '@wordpress/i18n';
import WidgetShell from '../WidgetShell';
import Launcher from '../Launcher';
import HomeScreen from '../HomeScreen';
import EarnTab from '../tabs/EarnTab';
import BoardTab from '../tabs/BoardTab';
import LogsTab from '../tabs/LogsTab';
import ProfileTab from '../tabs/ProfileTab';
import RedeemTab from '../tabs/RedeemTab';
import FaqTab from '../tabs/FaqTab';
import Badges from '../Badges';
import Ranks from '../Ranks';
import {
    fixtureGuestUser,
    fixtureMemberUser,
    fixtureHooks,
    fixtureLeaderboard,
    fixtureLogs,
    fixtureBadges,
    fixtureRanks,
    fixtureCoupons,
    fixtureAddons,
    fixtureTiers,
} from './fixtureData';
import { usePreviewSettings } from '../../context/PreviewSettingsContext';
import {
    filterActiveHooksForWidget,
    filterPointTypesMap,
    getVisibleBalances,
    getPointTypesMapFromWindow,
} from '../../pointTypeVisibility';

const SCREEN_OPTIONS = [
    { value: 'home', label: __('Home', 'mycred') },
    { value: 'earn', label: __('Earn', 'mycred') },
    { value: 'redeem', label: __('Redeem', 'mycred') },
    { value: 'board', label: __('Board', 'mycred') },
    { value: 'logs', label: __('History', 'mycred') },
    { value: 'ranks', label: __('Ranks', 'mycred') },
    { value: 'badges', label: __('Badges', 'mycred') },
    { value: 'profile', label: __('Profile', 'mycred') },
];

export default function WidgetPreviewPanel() {
    const { settings, previewGuest } = usePreviewSettings();
    const { design, content, tabs, general, faq } = settings;

    const [currentScreen, setCurrentScreen] = useState('home');
    const [isOpen, setIsOpen] = useState(false);
    const isGuest = previewGuest !== false;

    const isPro = window.mycredLoyaltyWidgetData?.is_toolkit_pro_active || false;
    const hasWoo = Boolean(window.mycredLoyaltyWidgetData?.has_woocommerce);
    const assetsUrl = window.mycredLoyaltyWidgetData?.assets_url || '';

    useEffect(() => {
        window.mycredLoyaltyWidget = window.mycredLoyaltyWidget || {};
        window.mycredLoyaltyWidget.addons = fixtureAddons;
        const baseTypes = getPointTypesMapFromWindow();
        window.mycredLoyaltyWidget.point_types = filterPointTypesMap(baseTypes, { general });
        if (!Object.keys(window.mycredLoyaltyWidget.point_types).length) {
            window.mycredLoyaltyWidget.point_types = { mycred_default: __('Points', 'mycred') };
        }
        window.mycredLoyaltyWidget.assets_url = assetsUrl;
        window.mycredLoyaltyWidget.is_toolkit_pro_active = isPro;
    }, [assetsUrl, isPro, general?.visiblePointTypes]);

    const currentContent = isGuest ? (content.guest || {}) : (content.member || {});
    const user = useMemo(() => {
        const base = isGuest ? fixtureGuestUser : fixtureMemberUser;
        if (isGuest || !base.all_balances?.length) {
            return base;
        }
        return {
            ...base,
            all_balances: getVisibleBalances(base.all_balances, { general }),
        };
    }, [isGuest, general?.visiblePointTypes]);

    const previewHooks = useMemo(() => {
        const base = fixtureHooks?.length
            ? fixtureHooks
            : (window.mycredLoyaltyWidgetData?.active_hooks || []);
        return filterActiveHooksForWidget(base, { general });
    }, [general?.visiblePointTypes]);

    const previewSettings = {
        design,
        content,
        tabs,
        general,
        faq: faq || { screenTitle: __('FAQs', 'mycred'), items: [] },
        eventtriggers: settings.eventtriggers || window.mycredLoyaltyWidgetData?.settings?.eventtriggers || {},
    };

    const handleNavigate = (screen) => setCurrentScreen(screen);
    const handleBack = () => setCurrentScreen('home');
    const handleClose = () => setIsOpen(false);
    const toggleOpen = () => setIsOpen((open) => !open);

    const renderHome = () => (
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
            ranksEnabled={fixtureAddons.ranks_enabled}
            badgesEnabled={fixtureAddons.badges_enabled}
            onNavigate={handleNavigate}
            onClose={handleClose}
            previewMode
            previewTiers={fixtureTiers}
        />
    );

    const renderScreen = () => {
        const tabProps = {
            settings: previewSettings,
            currentContent,
            user,
            onBack: handleBack,
            onClose: handleClose,
            previewMode: true,
        };

        switch (currentScreen) {
            case 'earn':
                return <EarnTab {...tabProps} activeHooks={previewHooks} previewMode />;
            case 'board':
                return <BoardTab {...tabProps} previewMode previewData={fixtureLeaderboard} />;
            case 'logs':
                return <LogsTab {...tabProps} previewMode previewData={fixtureLogs} />;
            case 'profile':
                return <ProfileTab {...tabProps} previewMode />;
            case 'redeem':
                return <RedeemTab {...tabProps} previewMode previewData={fixtureCoupons} />;
            case 'faq':
                return <FaqTab {...tabProps} />;
            case 'badges':
                return <Badges {...tabProps} previewMode previewData={fixtureBadges} />;
            case 'ranks':
                return <Ranks {...tabProps} previewMode previewData={fixtureRanks} />;
            default:
                return renderHome();
        }
    };

    return (
        <Box
            sx={{
                position: 'fixed',
                right: 24,
                bottom: 24,
                zIndex: 100000,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: '12px',
            }}
        >
            {isOpen && (
                <WidgetShell
                    design={design}
                    showLauncher={false}
                    containerRadius={24}
                    compactHome={currentScreen === 'home'}
                >
                    {renderScreen()}
                </WidgetShell>
            )}
            {!isOpen && (
                <Launcher
                    isOpen={false}
                    onClick={toggleOpen}
                    settings={{ design, general }}
                />
            )}
        </Box>
    );
}
