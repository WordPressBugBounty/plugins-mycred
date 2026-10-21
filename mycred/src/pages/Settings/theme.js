import { createTheme } from '@mui/material/styles';
import { COLORS } from '../../shared/adminTheme/tokens';

export { COLORS };

export const getSettingsTheme = () => {
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
            fontFamily: '"Figtree", "Inter", sans-serif',
            h5: { fontFamily: '"Figtree", "Inter", sans-serif', fontWeight: 600, fontSize: '20px', color: colors.textPrimary },
            h6: { fontFamily: '"Figtree", "Inter", sans-serif', fontWeight: 600, fontSize: '16px', color: colors.textPrimary },
            subtitle1: { fontFamily: '"Figtree", "Inter", sans-serif', fontSize: '14px', fontWeight: 400, color: colors.textSecondary },
            body1: { fontFamily: '"Figtree", "Inter", sans-serif', fontSize: '14px', fontWeight: 400, color: colors.textPrimary },
            body2: { fontFamily: '"Figtree", "Inter", sans-serif', fontSize: '14px', fontWeight: 400, color: colors.textSecondary },
            button: { fontFamily: '"Figtree", "Inter", sans-serif', textTransform: 'none', fontWeight: 600 },
        },
        components: {
            MuiButton: {
                styleOverrides: {
                    root: { borderRadius: '8px', padding: '10px 24px' },
                    contained: {
                        boxShadow: 'none',
                        '&:hover': { boxShadow: 'none', backgroundColor: colors.primaryHover },
                    },
                },
            },
            MuiSkeleton: {
                styleOverrides: {
                    root: {
                        backgroundColor: colors.paperMuted,
                    },
                },
            },
            MuiDivider: {
                styleOverrides: {
                    root: {
                        borderColor: colors.border,
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none',
                    },
                },
            },
        },
    });
};
