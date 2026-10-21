import React from 'react';
import { Box, Typography } from '@mui/material';
import { useToolsColors } from '../theme';
import { CoinsIcon, BadgeIcon, RankingIcon, SetupIcon } from '../icons/ToolsIcons';

const ToolsTabs = ({ activeTab, onChange, activeSidebar, data }) => {
    const COLORS = useToolsColors();
    const tabs = [{ id: 'points', label: 'Points', Icon: CoinsIcon }];

    if (activeSidebar === 'bulk' || activeSidebar === 'import' || activeSidebar === 'export') {
        if (data.isBadgesEnabled) {
            tabs.push({ id: 'badges', label: 'Badges', Icon: BadgeIcon });
        }
        if (data.isRanksEnabled) {
            tabs.push({ id: 'ranks', label: 'Ranks', Icon: RankingIcon });
        }
    }

    if (activeSidebar === 'import' || activeSidebar === 'export') {
        tabs.push({ id: 'setup', label: 'Setup', Icon: SetupIcon });
    }

    return (
        <Box sx={{ display: 'flex', gap: 0, mb: '24px', mt: '24px', px: '23px' }}>
            {tabs.map(({ id, label, Icon }) => {
                const isActive = activeTab === id;
                return (
                    <Box
                        key={id}
                        onClick={() => onChange(id)}
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            gap: '8px',
                            cursor: 'pointer',
                            mr: '8px',
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', px: '12px' }}>
                            <Icon
                                color={isActive ? COLORS.primaryActive : COLORS.primaryDark}
                                size={20}
                            />
                            <Typography
                                sx={{
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    color: isActive ? COLORS.primaryActive : COLORS.primaryDark,
                                }}
                            >
                                {label}
                            </Typography>
                        </Box>
                        {isActive && (
                            <Box
                                sx={{
                                    width: '100%',
                                    height: '2px',
                                    bgcolor: COLORS.primaryActive,
                                }}
                            />
                        )}
                    </Box>
                );
            })}
        </Box>
    );
};

export default ToolsTabs;
