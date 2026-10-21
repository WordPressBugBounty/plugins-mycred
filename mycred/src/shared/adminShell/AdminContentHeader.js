import { Box, Typography, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAdminTheme } from '../adminTheme/AdminThemeProvider';
import { ADMIN_CONTENT_HEADER_HEIGHT, ADMIN_SETTINGS_FONT } from './layout';

export default function AdminContentHeader({
    title,
    subtitle,
    showBack = false,
    onBack,
}) {
    const { colors } = useAdminTheme();

    return (
        <Box
            sx={{
                bgcolor: colors.paper,
                borderBottom: `1px solid ${colors.shellChrome || colors.border}`,
                height: ADMIN_CONTENT_HEADER_HEIGHT,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                px: 3,
                flexShrink: 0,
                gap: 1.5,
                boxSizing: 'border-box',
            }}
        >
            {showBack && (
                <IconButton
                    onClick={onBack}
                    aria-label="Back"
                    sx={{
                        p: 0,
                        width: 20,
                        height: 20,
                        color: colors.primary,
                        flexShrink: 0,
                    }}
                >
                    <ArrowBackIcon sx={{ fontSize: 20 }} />
                </IconButton>
            )}
            <Box sx={{ minWidth: 0 }}>
                <Typography
                    sx={{
                        fontFamily: ADMIN_SETTINGS_FONT,
                        fontSize: '20px',
                        fontWeight: 600,
                        color: colors.textPrimary,
                        lineHeight: '20px',
                    }}
                >
                    {title}
                </Typography>
                {subtitle ? (
                    <Typography
                        sx={{
                            fontFamily: ADMIN_SETTINGS_FONT,
                            fontSize: '14px',
                            fontWeight: 400,
                            color: colors.textSecondary,
                            mt: 0.5,
                            lineHeight: '20px',
                        }}
                    >
                        {subtitle}
                    </Typography>
                ) : null}
            </Box>
        </Box>
    );
}
