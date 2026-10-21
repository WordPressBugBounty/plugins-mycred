import React, { useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Select,
    MenuItem,
    TextField,
    InputAdornment,
    Chip,
    IconButton,
    Popover,
    FormControlLabel,
    Checkbox
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import { useAdminTheme } from '../../../../../src/shared/adminTheme/AdminThemeProvider';

const COLUMN_OPTIONS = [
    { key: 'slug', label: 'Slug' },
    { key: 'description', label: 'Description' },
    { key: 'count', label: 'Assigned Badges' }
];

export const AchievementTypesHeader = ({
    totalCount,
    searchQuery,
    onSearchChange,
    bulkAction,
    onBulkActionChange,
    onApplyBulkAction,
    onOpenAddModal,
    visibleColumns,
    onToggleColumn
}) => {
    const { colors } = useAdminTheme();
    const [settingsAnchor, setSettingsAnchor] = useState(null);
    const settingsOpen = Boolean(settingsAnchor);

    return (
        <Box sx={{ p: { xs: '16px 20px', md: '20px 24px' }, borderBottom: `1px solid ${colors.border}` }}>
            {/* Top Row: Title & Add Button */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 2,
                    flexWrap: 'wrap',
                    gap: 1.5
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 700,
                            color: colors.textPrimary,
                            fontSize: '22px',
                            fontFamily: "'Figtree', sans-serif",
                            letterSpacing: '-0.01em'
                        }}
                    >
                        Achievement Types
                    </Typography>
                    <Chip
                        label={`${totalCount} Total Types`}
                        size="small"
                        sx={{
                            bgcolor: colors.primaryLight,
                            color: colors.primary,
                            fontWeight: 600,
                            fontSize: '12px',
                            fontFamily: "'Figtree', sans-serif",
                            height: '24px',
                            borderRadius: '16px'
                        }}
                    />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon sx={{ fontSize: '18px !important', color: '#ffffff !important' }} />}
                        onClick={onOpenAddModal}
                        size="small"
                        sx={{
                            bgcolor: `${colors.primary} !important`,
                            color: '#ffffff !important',
                            borderRadius: '6px',
                            px: '16px',
                            py: '7px',
                            fontWeight: 600,
                            fontSize: '14px',
                            fontFamily: "'Figtree', sans-serif",
                            textTransform: 'none',
                            boxShadow: 'none',
                            '&:hover': {
                                bgcolor: `${colors.primary} !important`,
                                color: '#ffffff !important',
                                boxShadow: 'none',
                            }
                        }}
                    >
                        Add Achievement Type
                    </Button>

                    {/* Settings Icon */}
                    <IconButton
                        onClick={(e) => setSettingsAnchor(e.currentTarget)}
                        size="small"
                        sx={{
                            border: `1px solid ${colors.borderInput}`,
                            borderRadius: '6px',
                            width: 34,
                            height: 34,
                            color: colors.textSecondary,
                            '&:hover': {
                                bgcolor: colors.hover,
                                borderColor: colors.primary,
                                color: colors.primary
                            }
                        }}
                    >
                        <SettingsIcon sx={{ fontSize: 18 }} />
                    </IconButton>

                    {/* Settings Popover */}
                    <Popover
                        open={settingsOpen}
                        anchorEl={settingsAnchor}
                        onClose={() => setSettingsAnchor(null)}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                        slotProps={{
                            paper: {
                                sx: {
                                    borderRadius: '8px',
                                    border: `1px solid ${colors.border}`,
                                    boxShadow: '0 4px 20px rgba(45, 21, 114, 0.08)',
                                    minWidth: 220,
                                    mt: 1
                                }
                            }
                        }}
                    >
                        <Box sx={{ p: 2 }}>
                            <Typography sx={{ fontWeight: 700, fontSize: '12px', fontFamily: "'Figtree', sans-serif", color: colors.textPrimary, mb: 1.5, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                Columns
                            </Typography>
                            {COLUMN_OPTIONS.map(col => (
                                <FormControlLabel
                                    key={col.key}
                                    control={
                                        <Checkbox
                                            size="small"
                                            checked={visibleColumns[col.key] !== false}
                                            onChange={() => onToggleColumn(col.key)}
                                            sx={{
                                                p: 0.5,
                                                color: colors.borderInput,
                                                '&.Mui-checked': { color: colors.primary }
                                            }}
                                        />
                                    }
                                    label={col.label}
                                    sx={{
                                        display: 'flex',
                                        m: 0,
                                        mb: 0.5,
                                        '& .MuiFormControlLabel-label': {
                                            fontSize: '14px',
                                            fontFamily: "'Figtree', sans-serif",
                                            color: colors.textPrimary,
                                            fontWeight: 500,
                                            ml: 0.5
                                        }
                                    }}
                                />
                            ))}
                        </Box>
                    </Popover>
                </Box>
            </Box>

            {/* Filter Toolbar Row */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 1.5,
                    pt: 0.5
                }}
            >
                {/* Bulk Actions */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Select
                        value={bulkAction}
                        onChange={(e) => onBulkActionChange(e.target.value)}
                        displayEmpty
                        size="small"
                        sx={{
                            minWidth: 140,
                            height: '34px',
                            bgcolor: colors.paper,
                            fontSize: '14px',
                            fontFamily: "'Poppins', sans-serif",
                            borderRadius: '6px',
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: colors.borderInput
                            }
                        }}
                    >
                        <MenuItem value="" sx={{ fontSize: '14px', fontFamily: "'Poppins', sans-serif" }}>Bulk Actions</MenuItem>
                        <MenuItem value="delete" sx={{ fontSize: '14px', fontFamily: "'Poppins', sans-serif" }}>Delete</MenuItem>
                    </Select>

                    <Button
                        variant="outlined"
                        onClick={onApplyBulkAction}
                        disabled={!bulkAction}
                        size="small"
                        sx={{
                            borderColor: colors.borderInput,
                            color: colors.textPrimary,
                            borderRadius: '6px',
                            height: '34px',
                            px: 1.5,
                            fontWeight: 600,
                            fontSize: '14px',
                            fontFamily: "'Poppins', sans-serif",
                            textTransform: 'none',
                            '&:hover': {
                                borderColor: colors.primary,
                                bgcolor: colors.hover
                            }
                        }}
                    >
                        Apply
                    </Button>
                </Box>

                {/* Search Input */}
                <TextField
                    size="small"
                    placeholder="Search achievement types..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start" sx={{ mr: 0.5 }}>
                                <SearchIcon sx={{ color: colors.textMuted, fontSize: 18 }} />
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        minWidth: 220,
                        '& .MuiInputBase-root': {
                            height: '34px',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontFamily: "'Poppins', sans-serif",
                            bgcolor: colors.paper,
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: colors.borderInput
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: colors.primary
                        },
                        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: colors.primary,
                            borderWidth: '1px'
                        }
                    }}
                />
            </Box>
        </Box>
    );
};

export default AchievementTypesHeader;
