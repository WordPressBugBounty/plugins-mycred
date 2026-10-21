import React from 'react';
import { Box, Typography } from '@mui/material';
import { useToolsColors } from '../theme';
import { DocumentBulkIcon, UploadDownIcon, UploadUpIcon } from '../icons/ToolsIcons';
import SidebarPromoCard from '../../../shared/components/SidebarPromoCard';
import { ADMIN_SIDEBAR_SX, ADMIN_SIDEBAR_NAV_SX, ADMIN_SIDEBAR_PROMO_SX } from '../../../shared/adminShell/layout';

const items = [
    { id: 'bulk', label: 'Bulk Assign', Icon: DocumentBulkIcon },
    { id: 'import', label: 'Import', Icon: UploadDownIcon },
    { id: 'export', label: 'Export', Icon: UploadUpIcon },
];

const ToolsSidebar = ({ active, onChange }) => {
    const COLORS = useToolsColors();
    const showPromoCard = !window.mycredToolsData?.isProActive;

    return (
        <Box
            sx={{
                ...ADMIN_SIDEBAR_SX,
                width: 288,
                borderRight: `1px solid ${COLORS.border}`,
                p: '15px',
                bgcolor: COLORS.sidebarBg,
            }}
        >
            <Box sx={ADMIN_SIDEBAR_NAV_SX}>
                {items.map(({ id, label, Icon }) => {
                    const isActive = active === id;
                    return (
                        <Box
                            key={id}
                            onClick={() => onChange(id)}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                px: '12px',
                                py: '12px',
                                mb: '8px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                bgcolor: isActive ? COLORS.surface : 'transparent',
                                borderLeft: isActive ? `2px solid ${COLORS.primaryActive}` : '2px solid transparent',
                                color: isActive ? COLORS.primaryActive : COLORS.primaryDark,
                            }}
                        >
                            <Icon color={isActive ? COLORS.primaryActive : COLORS.primaryDark} />
                            <Typography sx={{ fontSize: '14px', fontWeight: 500 }}>{label}</Typography>
                        </Box>
                    );
                })}
            </Box>

            {showPromoCard && (
                <Box sx={{ ...ADMIN_SIDEBAR_PROMO_SX, pt: '16px', px: 0 }}>
                    <SidebarPromoCard utmMedium="tools_sidebar" />
                </Box>
            )}
        </Box>
    );
};

export default ToolsSidebar;
