import React from 'react';
import { Box, Typography } from '@mui/material';
import { useToolsColors } from '../theme';

const FigmaCheckbox = ({ checked, onChange, label, sx = {} }) => {
    const COLORS = useToolsColors();

    return (
        <Box
            onClick={() => onChange(!checked)}
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                userSelect: 'none',
                ...sx,
            }}
        >
            <Box
                sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '2px',
                    border: `1px solid ${COLORS.button}`,
                    bgcolor: checked ? COLORS.button : COLORS.white,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                }}
            >
                {checked && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                )}
            </Box>
            {label && (
                <Typography sx={{ fontSize: '14px', fontWeight: 400, color: COLORS.primaryDark }}>
                    {label}
                </Typography>
            )}
        </Box>
    );
};

export default FigmaCheckbox;
