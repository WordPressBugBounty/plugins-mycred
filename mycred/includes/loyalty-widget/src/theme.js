import { createTheme } from '@mui/material/styles';
import { COLORS } from '../../../src/shared/adminTheme/tokens';

export { COLORS };

export const getLoyaltyWidgetTheme = () => {
    const colors = COLORS;

    const inputOutline = {
        borderColor: `${colors.borderInput} !important`,
        borderWidth: '1px !important',
    };

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
            h5: { fontWeight: 600, fontSize: '20px', color: colors.textPrimary },
            h6: { fontWeight: 600, fontSize: '16px', color: colors.textPrimary },
            subtitle1: { fontSize: '14px', color: colors.textSecondary },
            body1: { fontSize: '14px', fontWeight: 500, color: colors.textPrimary },
            button: { textTransform: 'none', fontWeight: 600 },
        },
        components: {
            MuiButton: {
                styleOverrides: {
                    root: { borderRadius: '8px', padding: '10px 24px', textTransform: 'none', fontWeight: 600 },
                    contained: {
                        boxShadow: 'none',
                        '&:hover': { boxShadow: 'none', backgroundColor: colors.primaryHover },
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none',
                        borderRadius: '8px',
                        boxShadow: 'none',
                        boxSizing: 'border-box',
                        border: `1px solid ${colors.border}`,
                        backgroundColor: colors.paper,
                    },
                },
            },
            MuiOutlinedInput: {
                styleOverrides: {
                    root: {
                        borderRadius: '10px',
                        backgroundColor: colors.paper,
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
                        fontSize: '14px',
                        padding: '10px 14px',
                        color: `${colors.textPrimary} !important`,
                        WebkitTextFillColor: `${colors.textPrimary} !important`,
                        '&::placeholder': {
                            color: colors.textMuted,
                            opacity: 1,
                        },
                    },
                },
            },
            MuiSelect: {
                styleOverrides: {
                    select: {
                        padding: '10px 14px',
                        fontSize: '14px',
                        color: `${colors.textPrimary} !important`,
                        WebkitTextFillColor: `${colors.textPrimary} !important`,
                    },
                },
            },
            MuiMenuItem: {
                styleOverrides: {
                    root: {
                        fontSize: '14px',
                        color: colors.textPrimary,
                        '&.Mui-selected': {
                            backgroundColor: colors.primaryLight,
                            '&:hover': {
                                backgroundColor: colors.primaryLight,
                            },
                        },
                        '&:hover': {
                            backgroundColor: colors.rowHover,
                        },
                    },
                },
            },
            MuiFormLabel: {
                styleOverrides: {
                    root: {
                        color: colors.textPrimary,
                        '&.Mui-focused': {
                            color: colors.primary,
                        },
                    },
                },
            },
            MuiInputLabel: {
                styleOverrides: {
                    root: {
                        color: colors.textSecondary,
                        '&.Mui-focused': {
                            color: colors.primary,
                        },
                    },
                },
            },
            MuiAccordion: {
                styleOverrides: {
                    root: {
                        backgroundColor: colors.paper,
                        border: `1px solid ${colors.border}`,
                        borderRadius: '8px !important',
                        boxShadow: 'none',
                        '&:before': { display: 'none' },
                        '&.Mui-expanded': {
                            margin: 0,
                        },
                    },
                },
            },
            MuiAccordionSummary: {
                styleOverrides: {
                    root: {
                        backgroundColor: colors.paperMuted,
                        borderRadius: '8px',
                        minHeight: 48,
                        '&.Mui-expanded': {
                            minHeight: 48,
                        },
                    },
                    content: {
                        margin: '12px 0',
                        '&.Mui-expanded': {
                            margin: '12px 0',
                        },
                    },
                },
            },
            MuiAccordionDetails: {
                styleOverrides: {
                    root: {
                        backgroundColor: colors.paper,
                        color: colors.textPrimary,
                    },
                },
            },
            MuiIconButton: {
                styleOverrides: {
                    root: {
                        color: colors.textMuted,
                    },
                },
            },
            MuiSwitch: {
                styleOverrides: {
                    switchBase: {
                        '&.Mui-checked': {
                            '& + .MuiSwitch-track': {
                                backgroundColor: colors.primary,
                                opacity: 1,
                            },
                        },
                    },
                    track: {
                        backgroundColor: colors.switchTrackOff,
                        opacity: 1,
                    },
                },
            },
            MuiTabs: {
                styleOverrides: {
                    indicator: { backgroundColor: colors.primary },
                },
            },
            MuiTab: {
                styleOverrides: {
                    root: {
                        textTransform: 'none',
                        fontWeight: 500,
                        color: colors.textSecondary,
                        '&.Mui-selected': { color: colors.primary },
                    },
                },
            },
            MuiDivider: {
                styleOverrides: {
                    root: { borderColor: colors.border },
                },
            },
            MuiCheckbox: {
                styleOverrides: {
                    root: {
                        color: colors.borderInput,
                        '&.Mui-checked': {
                            color: colors.primary,
                        },
                    },
                },
            },
        },
    });
};
