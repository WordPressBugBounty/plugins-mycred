import React from 'react';
import {
    Box,
    Typography,
    Button,
    MenuItem,
    Select,
    FormControl,
    Chip,
} from '@mui/material';
import { useToolsColors } from '../theme';
import { useAdminTheme } from '../../../shared/adminTheme/AdminThemeProvider';
import { getSelectSx, fieldColumnSx } from '../formStyles';

const ExportForm = ({
    activeTab,
    exportSettings,
    setExportSettings,
    selectedBadges,
    setSelectedBadges,
    selectedRank,
    setSelectedRank,
    onExport,
    data,
}) => {
    const COLORS = useToolsColors();
    const { colors } = useAdminTheme();
    const selectSx = getSelectSx(colors);
    const fieldLabelSx = { fontSize: '14px', fontWeight: 500, color: COLORS.primaryDark, mb: '8px' };
    const title =
        activeTab === 'points'
            ? 'User Points Export'
            : activeTab === 'badges'
            ? 'User Badges Export'
            : 'User Ranks Export';

    return (
        <Box
            sx={{
                mx: '23px',
                mb: '24px',
                bgcolor: COLORS.surface,
                borderRadius: '8px',
                p: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
            }}
        >
            <Typography sx={{ fontSize: '18px', fontWeight: 600, color: COLORS.primaryDark }}>
                {title}
            </Typography>

            <Box sx={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                <Box sx={fieldColumnSx}>
                    <Typography sx={fieldLabelSx}>
                        User Field in Exported File
                    </Typography>
                    <FormControl fullWidth size="small">
                        <Select
                            value={exportSettings.userField}
                            sx={selectSx}
                            onChange={(e) =>
                                setExportSettings({ ...exportSettings, userField: e.target.value })
                            }
                        >
                            <MenuItem value="id">ID</MenuItem>
                            <MenuItem value="user_name">Username</MenuItem>
                            <MenuItem value="email">Email</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
                {(activeTab === 'badges' || activeTab === 'ranks') && (
                    <Box sx={fieldColumnSx}>
                        <Typography sx={fieldLabelSx}>
                            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Field in Exported File
                        </Typography>
                        <FormControl fullWidth size="small">
                            <Select
                                value={exportSettings.postField}
                                sx={selectSx}
                                onChange={(e) =>
                                    setExportSettings({ ...exportSettings, postField: e.target.value })
                                }
                            >
                                <MenuItem value="id">ID</MenuItem>
                                <MenuItem value="title">Title</MenuItem>
                                <MenuItem value="slug">Slug</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                )}
            </Box>

            {activeTab === 'points' && (
                <Box>
                    <Typography sx={{ fontSize: '14px', fontWeight: 500, mb: 1 }}>
                        Select Point Types to be Exported
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {(data.pointTypes || []).map((pt) => {
                            const selected = exportSettings.pointTypes.includes(pt.id);
                            return (
                                <Chip
                                    key={pt.id}
                                    label={pt.name}
                                    onClick={() =>
                                        setExportSettings((prev) => ({
                                            ...prev,
                                            pointTypes: selected
                                                ? prev.pointTypes.filter((id) => id !== pt.id)
                                                : [...prev.pointTypes, pt.id],
                                        }))
                                    }
                                    sx={{
                                        bgcolor: selected ? COLORS.primaryActive : COLORS.iconBg,
                                        color: selected ? COLORS.white : COLORS.primaryDark,
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                    }}
                                />
                            );
                        })}
                    </Box>
                </Box>
            )}

            {(activeTab === 'badges' || activeTab === 'ranks') && (
                <Box>
                    <Typography sx={{ fontSize: '14px', fontWeight: 500, mb: 1 }}>
                        Select {activeTab} to be Exported
                    </Typography>
                    <FormControl fullWidth size="small">
                        <Select
                            value={activeTab === 'ranks' ? selectedRank : ''}
                            displayEmpty
                            sx={selectSx}
                            onChange={(e) => {
                                if (activeTab === 'ranks') setSelectedRank(e.target.value);
                                else if (!selectedBadges.includes(e.target.value)) {
                                    setSelectedBadges([...selectedBadges, e.target.value]);
                                }
                            }}
                        >
                            <MenuItem value="">Select...</MenuItem>
                            {activeTab === 'badges' &&
                                (data.badges || []).map((badge) => (
                                    <MenuItem key={badge.id} value={badge.id}>
                                        {badge.name}
                                    </MenuItem>
                                ))}
                            {activeTab === 'ranks' &&
                                (data.ranks || []).map((rank) => (
                                    <MenuItem key={rank.id} value={rank.id}>
                                        {rank.name}
                                    </MenuItem>
                                ))}
                        </Select>
                    </FormControl>
                    {activeTab === 'badges' && selectedBadges.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                            {selectedBadges.map((badgeId) => {
                                const badge = (data.badges || []).find((b) => String(b.id) === String(badgeId));
                                return (
                                    badge && (
                                        <Chip
                                            key={badgeId}
                                            label={badge.name}
                                            onDelete={() =>
                                                setSelectedBadges(selectedBadges.filter((id) => id != badgeId))
                                            }
                                            size="small"
                                            sx={{ bgcolor: COLORS.iconBg }}
                                        />
                                    )
                                );
                            })}
                        </Box>
                    )}
                </Box>
            )}

            <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                    variant="contained"
                    onClick={() => onExport('raw')}
                    sx={{ bgcolor: COLORS.button, '&:hover': { bgcolor: COLORS.primaryActive } }}
                >
                    Export Raw
                </Button>
                {activeTab === 'points' && (
                    <Button
                        variant="outlined"
                        onClick={() => onExport('formatted')}
                        sx={{ borderColor: COLORS.button, color: COLORS.button }}
                    >
                        Export Formatted
                    </Button>
                )}
            </Box>
        </Box>
    );
};

export default ExportForm;
