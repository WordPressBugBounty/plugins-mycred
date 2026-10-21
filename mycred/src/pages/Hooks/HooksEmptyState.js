import { Box, Typography, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import BoltIcon from '@mui/icons-material/Bolt';
import { FONTS } from '../../shared/adminTheme/tokens';

const HooksEmptyState = ({
    colors,
    onCreate,
    hasHooks = false,
    categories = [],
    onSelectCategory,
}) => (
    <Box
        sx={{
            bgcolor: colors.paper,
            border: `1px solid ${colors.hookCardBorder}`,
            borderRadius: '14px',
            p: { xs: '32px 20px', md: '48px 32px 40px' },
            textAlign: 'center',
            minHeight: 320,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: 'none',
            '&::before': {
                content: '""',
                position: 'absolute',
                inset: '0 0 auto 0',
                height: '4px',
                background: `linear-gradient(90deg, ${colors.primary}, ${colors.configure})`,
            },
        }}
    >
        <Box
            sx={{
                width: 120,
                height: 120,
                borderRadius: '12px',
                bgcolor: colors.primaryLight,
                color: colors.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: '20px',
            }}
            aria-hidden
        >
            <BoltIcon sx={{ fontSize: 48 }} />
        </Box>

        <Typography
            sx={{
                m: 0,
                fontSize: '18px',
                fontWeight: 700,
                lineHeight: '24px',
                color: colors.textPrimary,
                fontFamily: FONTS.sans,
            }}
        >
            {hasHooks
                ? 'No hooks match your search'
                : 'You have not added any hooks yet'}
        </Typography>

        <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onCreate}
            sx={{
                mt: '20px',
                height: 44,
                px: 2.5,
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: 14,
                fontFamily: FONTS.sans,
                bgcolor: colors.primary,
                boxShadow: 'none',
                '&:hover': { bgcolor: colors.primaryHover, boxShadow: 'none' },
            }}
        >
            {hasHooks ? 'Browse Hooks' : 'Add Hook'}
        </Button>

        <Box sx={{ display: 'flex', gap: '20px', mt: 2, justifyContent: 'center' }}>
            <Box
                component="a"
                href="https://codex.mycred.me/"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: colors.primary,
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' },
                }}
            >
                Documentation
            </Box>
            <Box
                component="a"
                href="https://mycred.me/support/"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: colors.primary,
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' },
                }}
            >
                Support
            </Box>
        </Box>

        {!hasHooks && categories.length > 0 && (
            <Box sx={{ mt: '20px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1 }}>
                {categories.map((chip) => (
                    <Box
                        key={chip.id}
                        component="button"
                        type="button"
                        onClick={() => onSelectCategory?.(chip.id)}
                        sx={{
                            appearance: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontFamily: FONTS.sans,
                            fontSize: 12,
                            fontWeight: 500,
                            color: colors.textSecondary,
                            bgcolor: colors.filterActiveBg,
                            borderRadius: '999px',
                            px: '10px',
                            py: '6px',
                            '&:hover': {
                                color: colors.primary,
                                bgcolor: colors.paperMuted || colors.filterActiveBg,
                            },
                        }}
                    >
                        {chip.label}
                    </Box>
                ))}
            </Box>
        )}
    </Box>
);

export default HooksEmptyState;
