import { Button, CircularProgress } from '@mui/material';
import { COMPONENTS, RADIUS } from '../adminTheme/tokens';

export default function AdminPrimaryButton({
    colors,
    children,
    onClick,
    type = 'button',
    disabled = false,
    loading = false,
    sx = {},
    ...rest
}) {
    return (
        <Button
            variant="contained"
            color="primary"
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            sx={{
                ...COMPONENTS.primaryButton,
                height: 40,
                minWidth: 152,
                borderRadius: RADIUS.control,
                fontWeight: 600,
                fontSize: '14px',
                boxShadow: 'none',
                px: 3,
                py: 1.25,
                bgcolor: colors.primary,
                '&:hover': { bgcolor: colors.configure, boxShadow: 'none' },
                ...sx,
            }}
            {...rest}
        >
            {loading ? <CircularProgress size={20} color="inherit" /> : children}
        </Button>
    );
}
