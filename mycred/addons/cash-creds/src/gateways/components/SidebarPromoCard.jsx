import React from 'react';
import { Box, Typography, Button } from '@mui/material';

const DEFAULT_DEMO_URL = 'https://mycred.me/demo/?utm_source=plugin&utm_medium=settings_sidebar';

const SidebarPromoCard = ({ colors }) => {
    const proDemoUrl = window.mycredSettingsData?.proDemoUrl || DEFAULT_DEMO_URL;

    const handleClick = () => {
        window.open(proDemoUrl, '_blank', 'noopener');
    };

    return (
        <Box
            sx={{
                border: '1px solid #e1d6ff',
                borderRadius: '12px',
                px: '24px',
                py: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                background: 'radial-gradient(ellipse at 50% 100%, rgba(216, 204, 251, 0.6) 0%, rgba(252, 251, 255, 1) 70%), linear-gradient(90deg, #f6f3ff 0%, #f6f3ff 100%)',
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Box
                    sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '8px',
                        background: colors.primary || '#7c3aed',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        fontWeight: 700,
                        flexShrink: 0,
                    }}
                >
                    💎
                </Box>
                <Box>
                    <Typography
                        sx={{
                            fontSize: '16px',
                            lineHeight: 1.2,
                            color: colors.primary || '#7c3aed',
                            fontWeight: 400,
                        }}
                    >
                        Supercharge with
                    </Typography>
                    <Typography
                        sx={{
                            fontSize: '16px',
                            lineHeight: 1.2,
                            color: colors.primary || '#7c3aed',
                            fontWeight: 600,
                        }}
                    >
                        myCred Pro
                    </Typography>
                </Box>
            </Box>

            <Typography
                sx={{
                    fontSize: '12px',
                    lineHeight: '18px',
                    letterSpacing: '0.24px',
                    color: '#8065cc',
                }}
            >
                Explore myCred in action with your own private demo site—preloaded with members, protected content, and premium Add Ons.
            </Typography>

            <Button
                variant="contained"
                onClick={handleClick}
                fullWidth
                sx={{
                    bgcolor: colors.primary || '#7c3aed',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: 600,
                    lineHeight: 1,
                    borderRadius: '8px',
                    py: '14px',
                    px: '24px',
                    boxShadow: 'none',
                    textTransform: 'none',
                    '&:hover': {
                        bgcolor: colors.primaryHover || '#6d28d9',
                        boxShadow: 'none',
                    },
                }}
            >
                Try myCred Pro Today
            </Button>
        </Box>
    );
};

export default SidebarPromoCard;
