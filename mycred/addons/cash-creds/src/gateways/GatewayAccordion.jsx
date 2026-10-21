import React from 'react';
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Box,
    Typography,
    Switch,
    TextField,
    Grid,
    InputAdornment,
    Divider,
    FormControlLabel
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';

export const GatewayAccordion = ({
    gateway,
    colors,
    isExpanded,
    onToggleExpand,
    onChange
}) => {
    const { id, title, icon, is_active, prefs = {} } = gateway;

    const handlePrefChange = (field, value) => {
        onChange(id, {
            ...gateway,
            prefs: {
                ...prefs,
                [field]: value
            }
        });
    };

    const handleActiveToggle = (e) => {
        e.stopPropagation();
        onChange(id, {
            ...gateway,
            is_active: e.target.checked
        });
    };

    return (
        <Accordion
            expanded={isExpanded}
            onChange={onToggleExpand}
            sx={{
                mb: 2,
                borderRadius: '8px !important',
                border: `1px solid ${colors.border}`,
                boxShadow: 'none',
                bgcolor: colors.paper,
                '&:before': { display: 'none' },
                overflow: 'hidden'
            }}
        >
            <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: colors.textSecondary }} />}
                sx={{
                    px: 3,
                    py: 1,
                    bgcolor: isExpanded ? colors.sidebarHover || colors.primaryLight : 'transparent',
                    '&:hover': { bgcolor: colors.sidebarHover }
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', mr: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: '8px',
                                bgcolor: is_active ? colors.primaryLight : colors.border,
                                color: is_active ? colors.primary : colors.textMuted,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <SettingsOutlinedIcon />
                        </Box>
                        <Box>
                            <Typography variant="h6" sx={{ fontSize: '15px', fontWeight: 600, color: colors.textPrimary }}>
                                {title || id}
                            </Typography>
                            <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                                ID: {id}
                            </Typography>
                        </Box>
                    </Box>

                    <FormControlLabel
                        control={
                            <Switch
                                checked={!!is_active}
                                onChange={handleActiveToggle}
                                color="primary"
                            />
                        }
                        label={is_active ? 'Active' : 'Inactive'}
                        sx={{
                            color: is_active ? colors.primary : colors.textMuted,
                            '& .MuiTypography-root': { fontSize: '13px', fontWeight: 600 }
                        }}
                    />
                </Box>
            </AccordionSummary>

            <AccordionDetails sx={{ p: 3, bgcolor: colors.paper }}>
                <Grid container spacing={2.5}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Gateway Title"
                            value={prefs.title || title || ''}
                            onChange={(e) => handlePrefChange('title', e.target.value)}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Exchange Rate"
                            type="number"
                            value={prefs.exchange ?? 1}
                            onChange={(e) => handlePrefChange('exchange', parseFloat(e.target.value) || 0)}
                            size="small"
                            helperText="Cost of 1 point in currency"
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Minimum Withdrawal Limit"
                            type="number"
                            value={prefs.min ?? ''}
                            onChange={(e) => handlePrefChange('min', e.target.value)}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Maximum Withdrawal Limit"
                            type="number"
                            value={prefs.max ?? ''}
                            onChange={(e) => handlePrefChange('max', e.target.value)}
                            size="small"
                        />
                    </Grid>

                    {prefs.fee !== undefined && (
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Withdrawal Fee"
                                value={prefs.fee || ''}
                                onChange={(e) => handlePrefChange('fee', e.target.value)}
                                size="small"
                            />
                        </Grid>
                    )}
                </Grid>
            </AccordionDetails>
        </Accordion>
    );
};
