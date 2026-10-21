import { createTheme } from '@mui/material/styles';
import { COLORS as SHARED_COLORS } from '../../shared/adminTheme/tokens';
import { useAdminTheme } from '../../shared/adminTheme/AdminThemeProvider';

export { SHARED_COLORS as COLORS };

export const mapToolsColors = (colors) => ({
    primary: colors.primary,
    primaryActive: colors.primary,
    primaryDark: colors.textPrimary,
    textSoft: colors.textSecondary,
    border: colors.border,
    inputBorder: colors.borderInput,
    surface: colors.paperMuted,
    iconBg: colors.primaryLight,
    button: colors.configure,
    cardBorder: colors.border,
    white: colors.paper,
    bg: colors.bg,
    contentBg: colors.contentBg,
    sidebarBg: colors.sidebarBg,
    shellBg: colors.shellBg,
    shellShadow: colors.shellShadow,
    textPrimary: colors.textPrimary,
    textSecondary: colors.textSecondary,
    primaryHover: colors.primaryHover,
    hover: colors.hover,
    rowHover: colors.rowHover,
});

export const useToolsColors = () => {
    const { colors } = useAdminTheme();
    return mapToolsColors(colors);
};

export const getToolsTheme = () => {
    const colors = SHARED_COLORS;
    const palette = mapToolsColors(colors);

    const inputOutline = {
        borderColor: `${colors.borderInput} !important`,
        borderWidth: '1px !important',
    };

    return createTheme({
        palette: {
            mode: 'light',
            primary: { main: colors.primary },
            text: { primary: colors.textPrimary, secondary: colors.textSecondary },
            background: { default: colors.bg, paper: colors.paper },
            divider: colors.border,
        },
        typography: {
            fontFamily: '"Figtree", "Inter", sans-serif',
            h5: { fontWeight: 600, fontSize: '20px', color: colors.textPrimary, lineHeight: '20px' },
            h6: { fontWeight: 600, fontSize: '16px', color: colors.textPrimary },
            subtitle1: { fontSize: '14px', color: colors.textSecondary, lineHeight: '20px' },
            body1: { fontSize: '14px', color: colors.textPrimary, fontWeight: 500 },
            body2: { fontSize: '12px', color: colors.textSecondary },
            caption: {
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.48px',
                textTransform: 'uppercase',
                color: colors.textSecondary,
            },
            button: { textTransform: 'none', fontWeight: 600, fontSize: '14px' },
        },
        components: {
            MuiButton: {
                styleOverrides: {
                    root: { borderRadius: '8px', boxShadow: 'none' },
                    contained: {
                        boxShadow: 'none',
                        '&:hover': { boxShadow: 'none', backgroundColor: colors.primaryHover },
                    },
                },
            },
            MuiOutlinedInput: {
                styleOverrides: {
                    root: {
                        borderRadius: '8px',
                        backgroundColor: `${colors.paper} !important`,
                        color: colors.textPrimary,
                        '& .MuiOutlinedInput-notchedOutline': inputOutline,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: `${colors.border} !important`,
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: `${colors.primary} !important`,
                            borderWidth: '1px !important',
                        },
                    },
                    input: {
                        color: `${colors.textPrimary} !important`,
                        WebkitTextFillColor: `${colors.textPrimary} !important`,
                        '&:focus': {
                            boxShadow: 'none !important',
                            borderColor: 'transparent !important',
                            outline: 'none !important',
                        },
                        '&::placeholder': {
                            color: colors.textMuted,
                            opacity: 1,
                        },
                    },
                },
            },
            MuiInputBase: {
                styleOverrides: {
                    root: {
                        backgroundColor: `${colors.paper} !important`,
                        color: colors.textPrimary,
                    },
                    input: {
                        color: `${colors.textPrimary} !important`,
                        WebkitTextFillColor: `${colors.textPrimary} !important`,
                    },
                },
            },
            MuiAutocomplete: {
                styleOverrides: {
                    root: {
                        '& .MuiOutlinedInput-root': {
                            backgroundColor: `${colors.paper} !important`,
                        },
                        '& .MuiOutlinedInput-input, & .MuiInputBase-input': {
                            color: `${colors.textPrimary} !important`,
                            WebkitTextFillColor: `${colors.textPrimary} !important`,
                        },
                    },
                },
            },
            MuiSelect: {
                styleOverrides: {
                    select: {
                        color: `${colors.textPrimary} !important`,
                        WebkitTextFillColor: `${colors.textPrimary} !important`,
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root: { backgroundImage: 'none' },
                },
            },
            MuiLinearProgress: {
                styleOverrides: {
                    root: { backgroundColor: colors.paperMuted },
                    bar: { backgroundColor: colors.primary },
                },
            },
        },
    });
};

// Legacy export for any remaining static imports during migration
export const toolsTheme = getToolsTheme();
