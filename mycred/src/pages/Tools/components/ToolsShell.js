import React from 'react';
import { Box } from '@mui/material';
import { useToolsColors } from '../theme';
import { ADMIN_SHELL_SX } from '../../../shared/adminShell/layout';

const ToolsShell = ({ sidebar, children }) => {
    const COLORS = useToolsColors();

    return (
        <Box
            sx={{
                boxSizing: 'border-box',
                width: '100%',
                fontFamily: '"Figtree", "Inter", sans-serif',
            }}
        >
            <Box
                sx={{
                    ...ADMIN_SHELL_SX,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '8px',
                    bgcolor: COLORS.shellBg,
                    boxShadow: COLORS.shellShadow,
                    boxSizing: 'border-box',
                }}
            >
                {sidebar}
                {children}
            </Box>
        </Box>
    );
};

export default ToolsShell;
