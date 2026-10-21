import { createTheme } from '@mui/material/styles';
import { COLORS } from '../../../src/shared/adminTheme/tokens';

export { COLORS };

export const getAddonsTheme = () => {
    const colors = COLORS;

    return createTheme({
        palette: {
            mode: 'light',
            primary: {
                main: colors.primary,
                light: colors.primaryLight,
                dark: colors.textPrimary,
            },
            background: {
                default: colors.bg,
                paper: colors.paper,
            },
            text: {
                primary: colors.textPrimary,
                secondary: colors.textSecondary,
            },
            divider: colors.border,
        },
        typography: {
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            button: { textTransform: 'none', fontWeight: 600 },
        },
        components: {
            MuiIconButton: {
                styleOverrides: {
                    root: { borderRadius: '8px' },
                },
            },
            MuiBackdrop: {
                styleOverrides: {
                    root: {
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    },
                },
            },
        },
    });
};
