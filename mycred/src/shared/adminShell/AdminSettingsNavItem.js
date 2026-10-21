import { Box, Typography } from '@mui/material';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { COMPONENTS } from '../adminTheme/tokens';
import { ADMIN_SETTINGS_FONT } from './layout';

export default function AdminSettingsNavItem({
    colors,
    active,
    label,
    onClick,
    icon: Icon = SettingsOutlinedIcon,
}) {
    return (
        <Box
            onClick={onClick}
            sx={{
                ...COMPONENTS.settingsNavItem,
                bgcolor: active ? colors.sidebarActive : 'transparent',
                '&:hover': { bgcolor: active ? colors.sidebarActive : colors.navCardHover },
            }}
        >
            <Icon sx={{ fontSize: 20, color: active ? colors.primary : colors.textSecondary }} />
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
