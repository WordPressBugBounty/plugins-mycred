import React from 'react';
import { Box, Typography } from '@mui/material';
import { useToolsColors } from '../theme';

const ToolsContentHeader = () => {
    const COLORS = useToolsColors();

    return (
        <Box
            sx={{
                borderBottom: `1px solid ${COLORS.border}`,
                px: '24px',
                py: '16px',
                minHeight: 76,
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
            }}
        >
            <Box>
                <Typography variant="h5" sx={{ mb: '4px' }}>
                    Tools
                </Typography>
                <Typography variant="subtitle1">Bulk manage points, badges, and ranks.</Typography>
            </Box>
        </Box>
    );
};

export default ToolsContentHeader;
