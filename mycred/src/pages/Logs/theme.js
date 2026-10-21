import { createTheme } from '@mui/material/styles';
import { COLORS } from '../../shared/adminTheme/tokens';

export { COLORS };

export const getLogsTheme = () => {
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
            fontFamily: "'Poppins', 'Figtree', sans-serif",
            h4: {
                fontFamily: "'Vollkorn', serif",
                fontWeight: 600,
                color: colors.textPrimary,
                fontSize: '20px',
            },
            subtitle1: {
                fontWeight: 600,
                color: colors.textPrimary,
            },
            body2: {
                color: colors.textSecondary,
            },
        },
        shape: {
            borderRadius: 8,
        },
        components: {
            MuiButton: {
                styleOverrides: {
                    root: {
                        textTransform: 'none',
                        fontWeight: 500,
                        borderRadius: 8,
                        padding: '8px 16px',
                        fontSize: '14px',
                    },
                    outlined: {
                        borderColor: colors.borderInput,
                        color: colors.textSecondary,
                        '&:hover': {
                            borderColor: colors.primary,
                            background: colors.paperMuted,
                        },
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        boxShadow: 'none',
                        border: `1px solid ${colors.border}`,
                        backgroundColor: colors.paper,
                        backgroundImage: 'none',
                    },
                },
            },
            MuiMenu: {
                styleOverrides: {
                    paper: {
                        backgroundColor: colors.paper,
                        border: `1px solid ${colors.border}`,
                        backgroundImage: 'none',
                        opacity: 1,
                    },
                },
            },
            MuiPopover: {
                styleOverrides: {
                    paper: {
                        backgroundColor: colors.paper,
                        backgroundImage: 'none',
                        opacity: 1,
                    },
                },
            },
            MuiDialog: {
                styleOverrides: {
                    paper: {
                        backgroundColor: colors.paper,
                        backgroundImage: 'none',
                        opacity: 1,
                    },
                },
            },
            MuiTableCell: {
                styleOverrides: {
                    root: {
                        borderColor: colors.border,
                    },
                },
            },
            MuiOutlinedInput: {
                styleOverrides: {
                    root: {
                        backgroundColor: colors.paper,
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: colors.border,
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: colors.primary,
                        },
                    },
                },
            },
            MuiIconButton: {
                styleOverrides: {
                    root: {
                        color: colors.textSecondary,
                    },
                },
            },
        },
    });
};
