import { Box, Typography } from '@mui/material';
import { COMPONENTS } from '../adminTheme/tokens';
import { ADMIN_SETTINGS_FONT } from './layout';

const SidebarItem = ({ colors, active, label, icon: Icon, onClick, variant = 'accent' }) => {
    if (variant === 'settings') {
        return (
            <Box
                onClick={onClick}
                sx={{
                    ...COMPONENTS.settingsNavItem,
                    bgcolor: active ? colors.sidebarActive : 'transparent',
                    '&:hover': { bgcolor: active ? colors.sidebarActive : colors.navCardHover },
                }}
            >
                {Icon && <Icon sx={{ fontSize: 20, color: active ? colors.primary : colors.textSecondary }} />}
                <Typography
                    sx={{
                        fontFamily: ADMIN_SETTINGS_FONT,
                        fontSize: 14,
                        fontWeight: active ? 600 : 500,
                        color: active ? colors.primary : colors.textSecondary,
                        lineHeight: '20px',
                    }}
                >
                    {label}
                </Typography>
            </Box>
        );
    }

    return (
        <Box
            onClick={onClick}
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                px: '12px',
                py: '10px',
                mb: '4px',
                cursor: 'pointer',
                borderRadius: '8px',
                borderLeft: active ? `2px solid ${colors.primary}` : '2px solid transparent',
                bgcolor: active ? colors.sidebarActive : 'transparent',
                color: active ? colors.primary : colors.textPrimary,
                '&:hover': { bgcolor: active ? colors.sidebarActive : colors.sidebarHover },
            }}
        >
            {Icon && <Icon sx={{ fontSize: '20px', flexShrink: 0 }} />}
            <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '14px' }}>
                {label}
            </Typography>
        </Box>
    );
};

export default SidebarItem;
