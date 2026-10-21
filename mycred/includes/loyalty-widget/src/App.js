import { useState, useMemo, useCallback } from '@wordpress/element';
import { ThemeProvider } from '@mui/material/styles';
import { Box, Typography, Button, GlobalStyles } from '@mui/material';
import { __ } from '@wordpress/i18n';
import { Toaster } from 'react-hot-toast';
import SettingsIcon from '@mui/icons-material/Settings';
import PaletteIcon from '@mui/icons-material/Palette';
import ArticleIcon from '@mui/icons-material/Article';
import ViewListIcon from '@mui/icons-material/ViewList';
import EventIcon from '@mui/icons-material/Event';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useAdminTheme } from '../../../src/shared/adminTheme/AdminThemeProvider';
import {
    ADMIN_SIDEBAR_SX,
    ADMIN_SIDEBAR_NAV_SX,
    ADMIN_SIDEBAR_PROMO_SX,
    ADMIN_CONTENT_COLUMN_SX,
    ADMIN_SETTINGS_FONT,
    ADMIN_SETTINGS_SIDEBAR_WIDTH,
} from '../../../src/shared/adminShell/layout';
import AdminPageWrap from '../../../src/shared/adminShell/AdminPageWrap';
import AdminSettingsShell from '../../../src/shared/adminShell/AdminSettingsShell';
import AdminContentHeader from '../../../src/shared/adminShell/AdminContentHeader';
import AdminSettingsFooter from '../../../src/shared/adminShell/AdminSettingsFooter';
import AdminSettingsNavItem from '../../../src/shared/adminShell/AdminSettingsNavItem';
import AdminPrimaryButton from '../../../src/shared/adminShell/AdminPrimaryButton';
import { getLoyaltyWidgetTheme } from './theme';
import SidebarPromoCard from '../../../src/shared/components/SidebarPromoCard';
import GeneralSettings from './tabs/GeneralSettings';
import DesignSettings from './tabs/DesignSettings';
import ContentSettings from './tabs/ContentSettings';
import TabsSettings from './tabs/TabsSettings';
import EventTriggersSettings from './tabs/EventTriggersSettings';
import FaqSettings from './tabs/FaqSettings';
import { PreviewSettingsProvider } from './context/PreviewSettingsContext';
import { SaveActionsProvider, useSaveActions } from './context/SaveActionsContext';

const TAB_CONFIG = [
    { id: 'general', hash: '#general', label: __('General', 'mycred'), icon: SettingsIcon, subtitle: __('Enable widget, position, visibility and campaign scheduling', 'mycred') },
    { id: 'design', hash: '#design', label: __('Design', 'mycred'), icon: PaletteIcon, subtitle: __('Colors, templates, launcher and live widget preview', 'mycred') },
    { id: 'content', hash: '#content', label: __('Content', 'mycred'), icon: ArticleIcon, subtitle: __('Guest/member labels, messages and redirect URLs', 'mycred') },
    { id: 'tabs', hash: '#tabs', label: __('Tabs', 'mycred'), icon: ViewListIcon, subtitle: __('Enable/disable widget tabs and leaderboard options', 'mycred') },
    { id: 'faqs', hash: '#faqs', label: __('FAQs', 'mycred'), icon: HelpOutlineIcon, subtitle: __('FAQ screen title and Q&A items', 'mycred') },
    { id: 'event-triggers', hash: '#event-triggers', label: __('Event triggers', 'mycred'), icon: EventIcon, subtitle: __('Which hooks appear in the Earn tab', 'mycred') },
];

const TAB_PANELS = {
    general: GeneralSettings,
    design: DesignSettings,
    content: ContentSettings,
    tabs: TabsSettings,
    faqs: FaqSettings,
    'event-triggers': EventTriggersSettings,
};

function AppContent() {
    const { colors } = useAdminTheme();
    const theme = useMemo(() => getLoyaltyWidgetTheme(), []);
    const { saveActions } = useSaveActions();

    const getInitialTab = useCallback(() => {
        const hash = window.location.hash;
        const match = TAB_CONFIG.find((tab) => tab.hash === hash);
        return match ? match.id : 'general';
    }, []);

    const [activeTab, setActiveTab] = useState(getInitialTab);

    const handleTabChange = (tabId, hash) => {
        setActiveTab(tabId);
        if (window.history.replaceState) {
            window.history.replaceState(null, null, hash);
        } else {
            window.location.hash = hash;
        }
    };

    const activeConfig = TAB_CONFIG.find((tab) => tab.id === activeTab) || TAB_CONFIG[0];
    const ActivePanel = TAB_PANELS[activeTab] || GeneralSettings;
    const showPromoCard = !window.mycredLoyaltyWidgetData?.isProActive;

    const toastOptions = useMemo(() => ({
        style: {
            background: colors.paper,
            color: colors.textPrimary,
            border: `1px solid ${colors.border}`,
            fontFamily: ADMIN_SETTINGS_FONT,
            fontWeight: 500,
        },
        success: {
            iconTheme: { primary: colors.primary, secondary: colors.white },
        },
    }), [colors]);

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
                                        {__('WIDGET SETTINGS', 'mycred')}
                                    </Typography>
                                </Box>

                                <Box sx={{ px: 2 }}>
                                    {TAB_CONFIG.map((tab) => (
                                        <AdminSettingsNavItem
                                            key={tab.id}
                                            colors={colors}
                                            active={activeTab === tab.id}
                                            label={tab.label}
                                            icon={tab.icon}
                                            onClick={() => handleTabChange(tab.id, tab.hash)}
                                        />
                                    ))}
                                </Box>
                            </Box>

                            {showPromoCard && (
                                <Box sx={{ ...ADMIN_SIDEBAR_PROMO_SX, px: 2 }}>
                                    <SidebarPromoCard colors={colors} utmMedium="loyalty_widget_sidebar" />
                                </Box>
                            )}
                        </Box>

                        <Box sx={{ ...ADMIN_CONTENT_COLUMN_SX, bgcolor: colors.paper, flex: 1, minHeight: 0 }}>
                            <AdminContentHeader
                                title={activeConfig.label}
                                subtitle={activeConfig.subtitle}
                            />

                            <Box
                                sx={{
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    minHeight: 0,
                                }}
                            >
                                <Box sx={{ flex: 1, width: '100%' }}>
                                    <PreviewSettingsProvider>
                                        <ActivePanel />
                                    </PreviewSettingsProvider>
                                </Box>

                                <AdminSettingsFooter>
                                    {saveActions?.onReset && (
                                        <Button
                                            variant="outlined"
                                            onClick={saveActions.onReset}
                                            disabled={saveActions.loading}
                                            sx={{
                                                mr: 1.5,
                                                borderColor: colors.borderInput,
                                                color: colors.textSecondary,
                                                fontFamily: ADMIN_SETTINGS_FONT,
                                                fontSize: 14,
                                                '&:hover': {
                                                    borderColor: colors.primary,
                                                    bgcolor: colors.paperMuted,
                                                },
                                            }}
                                        >
                                            {saveActions.resetLabel || __('Reset', 'mycred')}
                                        </Button>
                                    )}
                                    <AdminPrimaryButton
                                        colors={colors}
                                        onClick={saveActions?.onSave}
                                        loading={saveActions?.loading}
                                        disabled={!saveActions?.onSave}
                                    >
                                        {saveActions?.label || __('Update Settings', 'mycred')}
                                    </AdminPrimaryButton>
                                </AdminSettingsFooter>
                            </Box>
                        </Box>
                    </AdminSettingsShell>
                </AdminPageWrap>
            </Box>
        </ThemeProvider>
    );
}

export default function App() {
    return (
        <SaveActionsProvider>
            <AppContent />
        </SaveActionsProvider>
    );
}
