import React from 'react';
import {
    Box,
    Typography,
    Button,
    MenuItem,
    Select,
    FormControl,
    Chip,
    Autocomplete,
    TextField,
} from '@mui/material';
import { useToolsColors } from '../theme';
import { useAdminTheme } from '../../../shared/adminTheme/AdminThemeProvider';
import { getTextFieldSx, getAutocompleteTextFieldSx, getSelectSx } from '../formStyles';
import { CoinsIcon, TrophyIcon, UploadUpIcon } from '../icons/ToolsIcons';
import IncludeDataToggle from './IncludeDataToggle';

const SectionCard = ({ icon, title, subtitle, children, COLORS }) => (
    <Box
        sx={{
            border: `1px solid ${COLORS.cardBorder}`,
            borderRadius: '8px',
            p: '19px',
            bgcolor: COLORS.white,
        }}
    >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', mb: '24px' }}>
            <Box
                sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '8px',
                    bgcolor: COLORS.iconBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: COLORS.primaryActive,
                }}
            >
                {icon}
            </Box>
            <Box>
                <Typography variant="h6">{title}</Typography>
                <Typography variant="body2">{subtitle}</Typography>
            </Box>
        </Box>
        {children}
    </Box>
);

const ExportSetupForm = ({ setupState, setSetupState, onExport, data }) => {
    const COLORS = useToolsColors();
    const { colors } = useAdminTheme();
    const textFieldSx = getTextFieldSx(colors);
    const autocompleteSx = getAutocompleteTextFieldSx(colors);
    const selectSx = getSelectSx(colors);
    const allPointIds = (data.pointTypes || []).map((pt) => pt.id);
    const selectedCount = setupState.pointTypes.length;
    const totalPoints = allPointIds.length;

    const update = (patch) => setSetupState((prev) => ({ ...prev, ...patch }));

    return (
        <Box sx={{ mx: '23px', mb: '24px' }}>
            <Typography
                sx={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: COLORS.primaryDark,
                    mb: '16px',
                }}
            >
                Bulk Export
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <SectionCard
                    COLORS={COLORS}
                    icon={<CoinsIcon size={24} color={COLORS.primaryActive} />}
                    title="Points"
                    subtitle="Export your points system data"
                >
                    <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                        Export Scope
                    </Typography>
                    <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                        <Select
                            value={setupState.pointsScope}
                            onChange={(e) => update({ pointsScope: e.target.value })}
                            sx={{
                                ...selectSx,
                                bgcolor:
                                    setupState.pointsScope === 'specific'
                                        ? COLORS.surface
                                        : COLORS.white,
                                ...(setupState.pointsScope === 'specific' && {
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderWidth: '2px !important',
                                        borderColor: `${COLORS.button} !important`,
                                    },
                                }),
                            }}
                        >
                            <MenuItem value="all">All Point Types</MenuItem>
                            <MenuItem value="specific">Specific Point Types</MenuItem>
                        </Select>
                    </FormControl>

                    {setupState.pointsScope === 'specific' && (
                        <>
                            <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                                Point Type Selection
                            </Typography>
                            <Autocomplete
                                multiple
                                options={data.pointTypes || []}
                                getOptionLabel={(opt) => opt.name}
                                value={(data.pointTypes || []).filter((pt) =>
                                    setupState.pointTypes.includes(pt.id)
                                )}
                                onChange={(_, val) =>
                                    update({ pointTypes: val.map((pt) => pt.id) })
                                }
                                renderTags={(value, getTagProps) =>
                                    value.map((option, index) => (
                                        <Chip
                                            {...getTagProps({ index })}
                                            key={option.id}
                                            label={option.name}
                                            size="small"
                                            sx={{
                                                bgcolor: COLORS.iconBg,
                                                fontWeight: 600,
                                                fontSize: '12px',
                                            }}
                                        />
                                    ))
                                }
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        placeholder="Select point types..."
                                        size="small"
                                        sx={{ ...autocompleteSx, mb: 1 }}
                                    />
                                )}
                            />
                            <Typography variant="body2" sx={{ mb: 2 }}>
                                {selectedCount} of {totalPoints} selected
                            </Typography>
                        </>
                    )}

                    <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                        Include Data
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <IncludeDataToggle
                            label="Hooks"
                            checked={setupState.includeHooks}
                            onChange={(v) => update({ includeHooks: v })}
                        />
                        {data.isRanksEnabled && (
                            <IncludeDataToggle
                                label="Ranks"
                                checked={setupState.includeRanks}
                                onChange={(v) => update({ includeRanks: v })}
                            />
                        )}
                    </Box>
                </SectionCard>

                {(data.badgeCategories?.length > 0 || data.hasUncategorizedBadges) && (
                    <SectionCard
                        COLORS={COLORS}
                        icon={<TrophyIcon color={COLORS.primaryActive} />}
                        title="Achievement Types"
                        subtitle="Export your achievement system data"
                    >
                        <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                            Export Scope
                        </Typography>
                        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                            <Select
                                value={setupState.achievementsScope}
                                sx={selectSx}
                                onChange={(e) => update({ achievementsScope: e.target.value })}
                            >
                                <MenuItem value="all">All Achievement Types</MenuItem>
                                <MenuItem value="specific">Specific Categories</MenuItem>
                            </Select>
                        </FormControl>

                        {setupState.achievementsScope === 'specific' && (
                            <Box sx={{ mb: 2 }}>
                                <Autocomplete
                                    multiple
                                    options={data.badgeCategories || []}
                                    getOptionLabel={(opt) => opt.name}
                                    value={(data.badgeCategories || []).filter((c) =>
                                        setupState.achievementCategories.includes(c.id)
                                    )}
                                    onChange={(_, val) =>
                                        update({ achievementCategories: val.map((c) => c.id) })
                                    }
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            placeholder="Select categories..."
                                            size="small"
                                            sx={autocompleteSx}
                                        />
                                    )}
                                />
                            </Box>
                        )}

                        <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                            Include Data
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                            <IncludeDataToggle
                                label="myCred Badges"
                                checked={setupState.includeBadges}
                                onChange={(v) => update({ includeBadges: v })}
                            />
                            <IncludeDataToggle
                                label="Levels"
                                checked={setupState.includeLevels}
                                onChange={(v) => update({ includeLevels: v })}
                            />
                            {data.hasUncategorizedBadges && (
                                <IncludeDataToggle
                                    label="Uncategorized"
                                    checked={setupState.includeUncategorized}
                                    onChange={(v) => update({ includeUncategorized: v })}
                                />
                            )}
                        </Box>

                        <Button
                            fullWidth
                            variant="contained"
                            onClick={onExport}
                            startIcon={<UploadUpIcon color="#fff" />}
                            sx={{
                                bgcolor: COLORS.button,
                                height: 44,
                                '&:hover': { bgcolor: COLORS.primaryActive },
                            }}
                        >
                            Export Data
                        </Button>
                        <Typography
                            variant="body2"
                            sx={{ textAlign: 'center', mt: 1.5 }}
                        >
                            Exports your selected points and achievements data
                        </Typography>
                    </SectionCard>
                )}

                {!(data.badgeCategories?.length > 0 || data.hasUncategorizedBadges) && (
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={onExport}
                        startIcon={<UploadUpIcon color="#fff" />}
                        sx={{
                            bgcolor: COLORS.button,
                            height: 44,
                            '&:hover': { bgcolor: COLORS.primaryActive },
                        }}
                    >
                        Export Data
                    </Button>
                )}
            </Box>
        </Box>
    );
};

export default ExportSetupForm;
