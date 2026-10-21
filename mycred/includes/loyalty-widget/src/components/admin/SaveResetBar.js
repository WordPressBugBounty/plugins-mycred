import { Box, Button, CircularProgress } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { __ } from '@wordpress/i18n';
import { useAdminTheme } from '../../../../../src/shared/adminTheme/AdminThemeProvider';

const SaveResetBar = ({ onSave, onReset, loading = false, saveLabel, resetLabel }) => {
    const { colors } = useAdminTheme();

    return (
        <Box sx={{ display: 'flex', gap: 1.5, mt: 2 }}>
            <Button
                variant="contained"
                disableElevation
                startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SaveIcon fontSize="small" />}
                onClick={onSave}
                disabled={loading}
                sx={{
                    bgcolor: colors.primary,
                    color: colors.white,
                    '&:hover': { bgcolor: colors.primaryHover },
                }}
            >
                {saveLabel || __('Save Changes', 'mycred')}
            </Button>
            {onReset && (
                <Button
                    variant="outlined"
                    startIcon={<RestartAltIcon fontSize="small" />}
                    onClick={onReset}
                    sx={{
                        borderColor: colors.borderInput,
                        color: colors.textSecondary,
                        '&:hover': { borderColor: colors.primary, bgcolor: colors.paperMuted },
                    }}
                >
                    {resetLabel || __('Reset', 'mycred')}
                </Button>
            )}
        </Box>
    );
};

export default SaveResetBar;
