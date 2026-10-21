import { useState, useEffect } from '@wordpress/element';
import { Box, ThemeProvider, createTheme, GlobalStyles } from '@mui/material';
import Launcher from './components/Launcher';
import WidgetWindow from './components/WidgetWindow';

export default function WidgetApp() {
    const data = window.mycredLoyaltyWidget || {};
    const settings = data.settings || {};
    const general = settings.general || {};
    const design = settings.design || {};
    const tabs = settings.tabs || {};

    const [isOpen, setIsOpen] = useState(false);
    const [currentTab, setCurrentTab] = useState('home'); // 'home', 'earn', 'redeem', 'board', 'logs', 'profile'

    // Create a dynamic theme based on dashboard settings
    const theme = createTheme({
        palette: {
            primary: {
                main: design.buttonColor || '#5E2CED',
                contrastText: design.buttonTextColor || '#FFFFFF',
            },
        },
        typography: {
            fontFamily: "'Instrument Sans', sans-serif",
        },
    });

    const toggleWidget = () => {
        setIsOpen(!isOpen);
    };

    const position = general.widgetPosition || 'bottom-right';

    // Position CSS
    const getPositionStyles = () => {
        const styles = {
            position: 'fixed',
            zIndex: 99999,
        };

        if (position.includes('bottom')) styles.bottom = `${general.marginBottom || 24}px`;
        if (position.includes('top')) styles.top = `${general.marginTop || 24}px`;
        if (position.includes('right')) styles.right = `${general.marginRight || 24}px`;
        if (position.includes('left')) styles.left = `${general.marginLeft || 24}px`;

        return styles;
    };

    return (
        <ThemeProvider theme={theme}>
            <GlobalStyles
                styles={{
                    '#mycred-loyalty-widget-root': {
                        boxSizing: 'border-box',
                        fontFamily: "'Instrument Sans', sans-serif !important",
                        lineHeight: 1.4,
                        color: '#1a1a1a',
                        zIndex: 99999,
                    },
                    '#mycred-loyalty-widget-root *, #mycred-loyalty-widget-root *::before, #mycred-loyalty-widget-root *::after': {
                        boxSizing: 'border-box !important',
                    },
                    '#mycred-loyalty-widget-root p': {
                        margin: '0 !important',
                        padding: '0 !important',
                    },
                    '#mycred-loyalty-widget-root h1, #mycred-loyalty-widget-root h2, #mycred-loyalty-widget-root h3, #mycred-loyalty-widget-root h4, #mycred-loyalty-widget-root h5, #mycred-loyalty-widget-root h6': {
                        margin: '0 !important',
                        padding: '0 !important',
                        fontFamily: "'Instrument Sans', sans-serif !important",
                    },
                    '#mycred-loyalty-widget-root button, #mycred-loyalty-widget-root [role="button"], #mycred-loyalty-widget-root .MuiButtonBase-root': {
                        textTransform: 'none',
                        outline: 'none !important',
                        boxShadow: 'none',
                        border: 'none',
                        fontFamily: 'inherit !important',
                    },
                    '#mycred-loyalty-widget-root button:focus, #mycred-loyalty-widget-root button:active, #mycred-loyalty-widget-root [role="button"]:focus, #mycred-loyalty-widget-root [role="button"]:active': {
                        outline: 'none !important',
                    },
                    '#mycred-loyalty-widget-root .MuiAccordion-root': {
                        backgroundColor: '#ffffff !important',
                        backgroundImage: 'none !important',
                    },
                    '#mycred-loyalty-widget-root .MuiAccordionSummary-root': {
                        backgroundColor: '#ffffff !important',
                        backgroundImage: 'none !important',
                        color: '#1a1a1a !important',
                    },
                    '#mycred-loyalty-widget-root .MuiAccordionSummary-root:focus, #mycred-loyalty-widget-root .MuiAccordionSummary-root:active, #mycred-loyalty-widget-root .MuiAccordionSummary-root.Mui-focusVisible, #mycred-loyalty-widget-root .MuiAccordionSummary-root.Mui-expanded, #mycred-loyalty-widget-root .MuiAccordionSummary-root:hover': {
                        backgroundColor: '#ffffff !important',
                        backgroundImage: 'none !important',
                        color: '#1a1a1a !important',
                        outline: 'none !important',
                        boxShadow: 'none !important',
                    },
                    '#mycred-loyalty-widget-root img': {
                        display: 'inline-block',
                        maxWidth: '100%',
                        height: 'auto',
                        borderStyle: 'none',
                    },
                    '#mycred-loyalty-widget-root svg': {
                        display: 'inline-block',
                        verticalAlign: 'middle',
                    },
                }}
            />
            <Box sx={getPositionStyles()}>
                {/* Launcher Button */}
                <Launcher
                    isOpen={isOpen}
                    onClick={toggleWidget}
                    settings={settings}
                />

                {/* Widget Window */}
                {isOpen && (
                    <WidgetWindow
                        settings={settings}
                        user={data.user}
                        currentTab={currentTab}
                        setCurrentTab={setCurrentTab}
                        onClose={() => setIsOpen(false)}
                    />
                )}
            </Box>
        </ThemeProvider>
    );
}
