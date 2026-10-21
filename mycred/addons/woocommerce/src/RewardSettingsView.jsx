import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Switch,
    FormGroup,
    FormControlLabel,
    MenuItem,
    Select,
    FormControl,
    Chip,
} from '@mui/material';
import { useAdminTheme } from '../../../src/shared/adminTheme/AdminThemeProvider';
import SettingsSectionCard from '../../../src/pages/Settings/components/SettingsSectionCard';
import {
    LEGACY_MULTI_SELECT_SX,
    LEGACY_SELECT_MENU_PROPS,
} from '../../../src/pages/Settings/components/LegacyMuiSelect';

const sectionTitleSx = (colors) => ({
    fontSize: 16,
    fontWeight: 500,
    color: colors.textPrimary,
    lineHeight: '20px',
});

const helperSx = (colors) => ({
    fontSize: 13,
    fontWeight: 400,
    color: colors.textSecondary,
    lineHeight: '18px',
    mt: '4px',
    mb: '16px',
});

const fieldLabelSx = (colors) => ({
    fontSize: 14,
    fontWeight: 500,
    color: colors.textPrimary,
    mb: '8px',
    lineHeight: '20px',
});

const switchSx = (colors) => ({
    width: 32,
    height: 16,
    padding: 0,
    '& .MuiSwitch-switchBase': {
        padding: '2px',
        '&.Mui-checked': {
            transform: 'translateX(16px)',
            color: colors.white,
            '& + .MuiSwitch-track': {
                backgroundColor: colors.configure,
                opacity: 1,
            },
        },
    },
    '& .MuiSwitch-thumb': {
        width: 12,
        height: 12,
        boxShadow: '0 1px 3px rgba(16,24,40,0.1)',
    },
    '& .MuiSwitch-track': {
        borderRadius: 9,
        backgroundColor: colors.toggleOff || colors.switchTrackOff,
        opacity: 1,
    },
});

export default function RewardSettingsView({ data }) {
    const { colors } = useAdminTheme();
    const [selectedStatuses, setSelectedStatuses] = useState(
        Array.isArray(data.reward_setting?.status) ? data.reward_setting.status : []
    );

    useEffect(() => {
        setSelectedStatuses(
            Array.isArray(data.reward_setting?.status) ? data.reward_setting.status : []
        );
    }, [data.reward_setting?.status]);

    const handleStatusChange = (event) => {
        const { target: { value } } = event;
        setSelectedStatuses(
            typeof value === 'string' ? value.split(',') : value,
        );
    };

    return (
        <SettingsSectionCard colors={colors} variant="nested">
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) minmax(0, 1fr)' },
                    gap: '24px',
                    alignItems: 'start',
                    width: '100%',
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: 0 }}>
                    <Box>
                        <Typography sx={sectionTitleSx(colors)}>Single Product Reward</Typography>
                        <Typography sx={helperSx(colors)}>
                            Enable this option if you want to give a reward for single product.
                        </Typography>
                    </Box>
                    <FormGroup>
                        {data.point_types.map((pt) => {
                            const isEnabled = data.reward_setting?.types?.[pt.id] == 1 || data.reward_setting?.types?.[pt.id] == 'yes';
                            return (
                                <Box key={pt.id} sx={{ mb: 0.5 }}>
                                    <input type="hidden" name={pt.name} value="0" />
                                    <FormControlLabel
                                        sx={{
                                            ml: 0,
                                            mr: 0,
                                            gap: '12px',
                                            '& .MuiFormControlLabel-label': { fontSize: 14, fontWeight: 400 },
                                        }}
                                        control={
                                            <Switch
                                                defaultChecked={isEnabled}
                                                name={pt.name}
                                                value="1"
                                                sx={switchSx(colors)}
                                            />
                                        }
                                        label={
                                            <Typography sx={{ color: colors.textPrimary, fontSize: 14, fontWeight: 400, lineHeight: '18px' }}>
                                                {pt.label}
                                            </Typography>
                                        }
                                    />
                                </Box>
                            );
                        })}
                    </FormGroup>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: 0 }}>
                    <Box>
                        <Typography sx={sectionTitleSx(colors)}>Reward On Order Statuses</Typography>
                        <Typography sx={helperSx(colors)}>
                            Select the order status on which you want to give points.
                        </Typography>
                    </Box>
                    <Box>
                        <Typography sx={fieldLabelSx(colors)}>Status</Typography>
                        <FormControl fullWidth size="small">
                            <Select
                                multiple
                                displayEmpty
                                value={selectedStatuses}
                                onChange={handleStatusChange}
                                MenuProps={LEGACY_SELECT_MENU_PROPS}
                                renderValue={(selected) => {
                                    if (!selected.length) {
                                        return (
                                            <Typography sx={{ color: colors.textSecondary, fontSize: 14 }}>
                                                Select statuses
                                            </Typography>
                                        );
                                    }
                                    return (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((value) => {
                                                const statusObj = data.order_statuses.find((s) => s.id === value);
                                                return (
                                                    <Chip
                                                        key={value}
                                                        label={statusObj ? statusObj.label : value}
                                                        size="small"
                                                        sx={{
                                                            height: 24,
                                                            fontSize: 12,
                                                            bgcolor: colors.sidebarActive || '#f3edff',
                                                            color: colors.textPrimary,
                                                        }}
                                                    />
                                                );
                                            })}
                                        </Box>
                                    );
                                }}
                                sx={LEGACY_MULTI_SELECT_SX}
                            >
                                {data.order_statuses.map((status) => (
                                    <MenuItem key={status.id} value={status.id}>
                                        {status.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    {selectedStatuses.map((statusValue) => (
                        <input
                            key={statusValue}
                            type="hidden"
                            name={data.status_field_name}
                            value={statusValue}
                        />
                    ))}
                    {selectedStatuses.length === 0 && (
                        <input type="hidden" name={data.status_field_name} value="" />
                    )}
                </Box>
            </Box>
        </SettingsSectionCard>
    );
}
