import { Box, Typography } from '@mui/material';
import { useAdminTheme } from '../../../../../src/shared/adminTheme/AdminThemeProvider';

const SectionHeader = ({ icon: Icon, title, desc, action }) => {
    const { colors } = useAdminTheme();

    return (
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    {Icon && <Icon sx={{ color: colors.primary, fontSize: 20 }} />}
                    <Typography sx={{ fontSize: '18px', fontWeight: 600, color: colors.textPrimary }}>{title}</Typography>
                </Box>
                {desc && (
                    <Typography sx={{ fontSize: '14px', color: colors.textSecondary }}>{desc}</Typography>
                )}
            </Box>
            {action && <Box>{action}</Box>}
        </Box>
    );
};

export default SectionHeader;
