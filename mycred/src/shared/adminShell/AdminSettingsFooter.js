import { Box } from '@mui/material';
import { useAdminTheme } from '../adminTheme/AdminThemeProvider';

export default function AdminSettingsFooter({ children, sx = {} }) {
    const { colors } = useAdminTheme();

    return (
        <Box
            sx={{
                width: '100%',
                boxSizing: 'border-box',
                flex: '0 0 auto',
                flexShrink: 0,
                position: 'relative',
                bgcolor: colors.paper,
                px: 3,
                py: 2,
                mt: 1,
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'center',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 24,
                    right: 24,
                    height: '1px',
                    bgcolor: colors.hookCardBorder || colors.border,
                },
                ...sx,
            }}
        >
            {children}
        </Box>
    );
}
