import { Box } from '@mui/material';
import { useAdminTheme } from '../adminTheme/AdminThemeProvider';
import {
    ADMIN_SETTINGS_SHELL_SX,
    getAdminSettingsShellChromeSx,
} from './layout';

export default function AdminSettingsShell({ children, sx = {} }) {
    const { colors } = useAdminTheme();

    return (
        <Box
            sx={{
                ...ADMIN_SETTINGS_SHELL_SX,
                ...getAdminSettingsShellChromeSx(colors),
                ...sx,
            }}
        >
            {children}
        </Box>
    );
}
