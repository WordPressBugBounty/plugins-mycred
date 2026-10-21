import { createTheme } from '@mui/material/styles';
import { COLORS, FONTS } from '../../shared/adminTheme/tokens';

export { COLORS };

export const getHooksTheme = () => {
    const colors = COLORS;
    const font = FONTS.sans;

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
            fontFamily: font,
            h5: { fontFamily: font, fontWeight: 600, fontSize: '20px', color: colors.textPrimary },
            h6: { fontFamily: font, fontWeight: 600, fontSize: '16px', color: colors.textPrimary },
            subtitle1: { fontFamily: font, fontSize: '14px', fontWeight: 400, color: colors.textSecondary },
            body1: { fontFamily: font, fontSize: '14px', fontWeight: 400, color: colors.textPrimary },
            body2: { fontFamily: font, fontSize: '14px', fontWeight: 400, color: colors.textSecondary },
            button: { fontFamily: font, textTransform: 'none', fontWeight: 600 },
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
                    root: { backgroundColor: colors.paperMuted },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root: { backgroundImage: 'none' },
                },
            },
            MuiOutlinedInput: {
                styleOverrides: {
                    root: {
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: colors.configure,
                            borderWidth: '1px',
                        },
                        '&.Mui-focused': {
                            boxShadow: 'none',
                        },
                    },
                    notchedOutline: {
                        borderColor: colors.borderInput,
                    },
                },
            },
            MuiInputBase: {
                styleOverrides: {
                    root: {
                        '&.Mui-focused': {
                            boxShadow: 'none',
                        },
                    },
                },
            },
        },
    });
};
