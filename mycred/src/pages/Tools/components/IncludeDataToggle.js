import React from 'react';
import { Box, Typography } from '@mui/material';
import { useToolsColors } from '../theme';

const IncludeDataToggle = ({ label, checked, onChange, sx = {} }) => {
    const COLORS = useToolsColors();

    return (
        <Box
            onClick={() => onChange(!checked)}
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                height: 40,
                px: '13px',
                border: `1px solid ${COLORS.inputBorder}`,
                borderRadius: '8px',
                bgcolor: COLORS.white,
                cursor: 'pointer',
                flex: 1,
                minWidth: 0,
                ...sx,
            }}
        >
            <Box
                sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '8px',
                    border: `1px solid ${COLORS.button}`,
                    bgcolor: checked ? COLORS.button : COLORS.white,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                }}
            >
                {checked && (
                    <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                        <path d="M1 3L3 5L7 1" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                )}
            </Box>
            <Typography sx={{ fontSize: '14px', fontWeight: 500, color: COLORS.primaryDark }}>
                {label}
            </Typography>
        </Box>
    );
};

export default IncludeDataToggle;
