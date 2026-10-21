import { Paper } from '@mui/material';
import { useAdminTheme } from '../../../../../src/shared/adminTheme/AdminThemeProvider';
import { COMPONENTS } from '../../../../../src/shared/adminTheme/tokens';

const SettingsCard = ({ children, sx = {}, ...props }) => {
    const { colors } = useAdminTheme();

    return (
        <Paper
            elevation={0}
            sx={{
                ...COMPONENTS.settingsCard,
                bgcolor: colors.paper,
                border: `1px solid ${colors.hookCardBorder || colors.border}`,
                boxShadow: 'none',
                width: '100%',
                boxSizing: 'border-box',
                ...sx,
            }}
            {...props}
        >
            {children}
        </Paper>
    );
};

export default SettingsCard;
