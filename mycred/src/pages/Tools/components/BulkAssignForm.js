import React from 'react';
import {
    Box,
    Typography,
    Button,
    TextField,
    MenuItem,
    Select,
    FormControl,
    Autocomplete,
    Chip,
    CircularProgress,
} from '@mui/material';
import { useToolsColors } from '../theme';
import { useAdminTheme } from '../../../shared/adminTheme/AdminThemeProvider';
import { getTextFieldSx, getAutocompleteTextFieldSx, getSelectSx, fieldColumnSx } from '../formStyles';
import FigmaCheckbox from './FigmaCheckbox';

const BulkAssignForm = ({
    activeTab,
    awardToAll,
    setAwardToAll,
    addLogEntry,
    setAddLogEntry,
    selectedUsers,
    setSelectedUsers,
    selectedRoles,
    setSelectedRoles,
    pointType,
    setPointType,
    points,
    setPoints,
    logEntryText,
    setLogEntryText,
    selectedBadges,
    setSelectedBadges,
    selectedRank,
    setSelectedRank,
    userSearchTerm,
    setUserSearchTerm,
    userSearchResults,
    isSearching,
    isProcessing,
    onAward,
    data,
}) => {
    const COLORS = useToolsColors();
    const { colors } = useAdminTheme();
    const textFieldSx = getTextFieldSx(colors);
    const autocompleteSx = getAutocompleteTextFieldSx(colors);
    const selectSx = getSelectSx(colors);
    const fieldLabelSx = { fontSize: '14px', fontWeight: 500, color: COLORS.primaryDark, mb: '8px' };

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
        <FigmaCheckbox
            checked={awardToAll}
            onChange={setAwardToAll}
            label="Award to all users"
        />

        {!awardToAll && (
            <Box sx={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                <Box sx={{ ...fieldColumnSx, position: 'relative' }}>
                    <Typography sx={fieldLabelSx}>Select Users (Name/Email)</Typography>
                    <Autocomplete
                        multiple
                        fullWidth
                        options={userSearchResults}
                        getOptionLabel={(opt) => (typeof opt === 'string' ? opt : `${opt.name} (${opt.email})`)}
                        value={selectedUsers}
                        inputValue={userSearchTerm}
                        onInputChange={(_, val) => setUserSearchTerm(val)}
                        onChange={(_, val) => setSelectedUsers(val)}
                        filterOptions={(x) => x}
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                                <Chip
                                    {...getTagProps({ index })}
                                    key={option.email || index}
                                    label={option.name || option.email}
                                    size="small"
                                    sx={{ bgcolor: COLORS.iconBg, color: COLORS.primaryDark }}
                                />
                            ))
                        }
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                placeholder="Search users..."
                                size="small"
                                sx={autocompleteSx}
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <>
                                            {isSearching ? <CircularProgress size={16} /> : null}
                                            {params.InputProps.endAdornment}
                                        </>
                                    ),
                                }}
                            />
                        )}
                    />
                </Box>
                <Box sx={fieldColumnSx}>
                    <Typography sx={fieldLabelSx}>Select Roles</Typography>
                    <Autocomplete
                        multiple
                        fullWidth
                        options={data.roles || []}
                        getOptionLabel={(opt) => opt.name}
                        value={(data.roles || []).filter((r) => selectedRoles.includes(r.id))}
                        onChange={(_, val) => setSelectedRoles(val.map((r) => r.id))}
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                                <Chip
                                    {...getTagProps({ index })}
                                    key={option.id}
                                    label={option.name}
                                    size="small"
                                    sx={{ bgcolor: COLORS.iconBg, color: COLORS.primaryDark }}
                                />
                            ))
                        }
                        renderInput={(params) => (
                            <TextField {...params} placeholder="Search roles..." size="small" sx={autocompleteSx} />
                        )}
                    />
                </Box>
            </Box>
        )}

        <Box sx={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <Box sx={fieldColumnSx}>
                <Typography sx={fieldLabelSx}>
                    {activeTab === 'points'
                        ? 'Point Type'
                        : activeTab === 'badges'
                        ? 'Select Badge(s)'
                        : 'Select Rank'}
                </Typography>
                <FormControl fullWidth size="small">
                    <Select
                        value={
                            activeTab === 'points'
                                ? pointType
                                : activeTab === 'ranks'
                                ? selectedRank
                                : ''
                        }
                        displayEmpty
                        sx={selectSx}
                        onChange={(e) => {
                            if (activeTab === 'points') setPointType(e.target.value);
                            else if (activeTab === 'ranks') setSelectedRank(e.target.value);
                            else if (
                                activeTab === 'badges' &&
                                !selectedBadges.includes(e.target.value)
                            ) {
                                setSelectedBadges([...selectedBadges, e.target.value]);
                            }
                        }}
                    >
                        <MenuItem value="">Select...</MenuItem>
                        {activeTab === 'points' &&
                            (data.pointTypes || []).map((pt) => (
                                <MenuItem key={pt.id} value={pt.id}>
                                    {pt.name}
                                </MenuItem>
                            ))}
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
                {activeTab === 'ranks' && (
                    <Typography sx={{ fontSize: '12px', color: COLORS.textSoft, mt: 1, fontStyle: 'italic', textAlign: 'right' }}>
                        Rank Behaviour should be set to Manual Mode.
                    </Typography>
                )}
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
            {activeTab === 'points' && (
                <Box sx={fieldColumnSx}>
                    <Typography sx={fieldLabelSx}>Points</Typography>
                    <TextField
                        fullWidth
                        size="small"
                        type="number"
                        placeholder="e.g. 10 or -10"
                        value={points}
                        onChange={(e) => setPoints(e.target.value)}
                        sx={textFieldSx}
                    />
                </Box>
            )}
        </Box>

        {activeTab === 'points' && (
            <>
                <FigmaCheckbox checked={addLogEntry} onChange={setAddLogEntry} label="Add Log Entry" />

                {addLogEntry && (
                    <Box>
                        <Typography sx={fieldLabelSx}>Log Entry Text</Typography>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Enter log description..."
                            value={logEntryText}
                            onChange={(e) => setLogEntryText(e.target.value)}
                            sx={textFieldSx}
                        />
                    </Box>
                )}
            </>
        )}

        <Button
            variant="contained"
            onClick={onAward}
            disabled={isProcessing}
            sx={{
                bgcolor: COLORS.button,
                alignSelf: 'flex-start',
                minWidth: 90,
                height: 44,
                px: 3,
                '&:hover': { bgcolor: COLORS.primaryActive },
            }}
        >
            {isProcessing ? 'Processing...' : activeTab === 'badges' ? 'Assign' : 'Award'}
        </Button>
    </Box>
    );
};

export default BulkAssignForm;
