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
import { useAdminTheme } from '../../../../src/shared/adminTheme/AdminThemeProvider';

const COLUMN_OPTIONS = [
    { key: 'status', label: 'Status' },
    { key: 'setup', label: 'Setup' },
    { key: 'point_type', label: 'Point Type' }
];

export const EmailNoticesHeader = ({
    totalCount,
    activeTab,
    onTabChange,
    searchQuery,
    onSearchChange,
    counts,
    bulkAction,
    onBulkActionChange,
    onApplyBulkAction,
    addNewUrl,
    visibleColumns,
    onToggleColumn
}) => {
    const { colors } = useAdminTheme();
    const [settingsAnchor, setSettingsAnchor] = useState(null);
    const settingsOpen = Boolean(settingsAnchor);

    return (
        <Box sx={{ p: { xs: '16px 20px', md: '20px 24px' }, borderBottom: `1px solid ${colors.border}` }}>
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
                        Email Notifications
                    </Typography>
                    <Chip
                        label={`${totalCount} Total`}
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
                        href={addNewUrl}
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
                        Add New
                    </Button>

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
                                    minWidth: 240,
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
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        bgcolor: colors.bg,
                        p: '3px',
                        borderRadius: '6px',
                        border: `1px solid ${colors.border}`
                    }}
                >
                    <Button
                        onClick={() => onTabChange('all')}
                        size="small"
                        sx={{
                            bgcolor: activeTab === 'all' ? colors.paper : 'transparent',
                            color: activeTab === 'all' ? colors.primary : colors.textSecondary,
                            fontWeight: 600,
                            fontSize: '14px',
                            fontFamily: "'Poppins', sans-serif",
                            borderRadius: '4px',
                            px: 1.5,
                            py: 0.4,
                            minWidth: 'auto',
                            textTransform: 'none',
                            '&:hover': {
                                bgcolor: activeTab === 'all' ? colors.paper : 'rgba(94, 44, 237, 0.05)',
                            }
                        }}
                    >
                        All ({counts.all || 0})
                    </Button>
                    <Button
                        onClick={() => onTabChange('publish')}
                        size="small"
                        sx={{
                            bgcolor: activeTab === 'publish' ? colors.paper : 'transparent',
                            color: activeTab === 'publish' ? colors.primary : colors.textSecondary,
                            fontWeight: 600,
                            fontSize: '14px',
                            fontFamily: "'Poppins', sans-serif",
                            borderRadius: '4px',
                            px: 1.5,
                            py: 0.4,
                            minWidth: 'auto',
                            textTransform: 'none',
                            '&:hover': {
                                bgcolor: activeTab === 'publish' ? colors.paper : 'rgba(94, 44, 237, 0.05)',
                            }
                        }}
                    >
                        Published ({counts.publish || 0})
                    </Button>
                    <Button
                        onClick={() => onTabChange('trash')}
                        size="small"
                        sx={{
                            bgcolor: activeTab === 'trash' ? colors.paper : 'transparent',
                            color: activeTab === 'trash' ? colors.primary : colors.textSecondary,
                            fontWeight: 600,
                            fontSize: '14px',
                            fontFamily: "'Poppins', sans-serif",
                            borderRadius: '4px',
                            px: 1.5,
                            py: 0.4,
                            minWidth: 'auto',
                            textTransform: 'none',
                            '&:hover': {
                                bgcolor: activeTab === 'trash' ? colors.paper : 'rgba(94, 44, 237, 0.05)',
                            }
                        }}
                    >
                        Trash ({counts.trash || 0})
                    </Button>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Select
                        value={bulkAction}
                        onChange={(e) => onBulkActionChange(e.target.value)}
                        displayEmpty
                        size="small"
                        sx={{
                            minWidth: 125,
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
                        <MenuItem value="trash" sx={{ fontSize: '14px', fontFamily: "'Poppins', sans-serif" }}>Move to Trash</MenuItem>
                        {activeTab === 'trash' && <MenuItem value="restore" sx={{ fontSize: '14px', fontFamily: "'Poppins', sans-serif" }}>Restore</MenuItem>}
                        {activeTab === 'trash' && <MenuItem value="delete" sx={{ fontSize: '14px', fontFamily: "'Poppins', sans-serif" }}>Delete Permanently</MenuItem>}
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

                    <TextField
                        size="small"
                        placeholder="Search subject..."
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
                            minWidth: 200,
                            '& .MuiInputBase-root': {
                                height: '34px',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontFamily: "'Poppins', sans-serif",
                                bgcolor: colors.paper,
                                boxShadow: 'none',
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: colors.borderInput,
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: colors.primary,
                            },
                            '& .MuiOutlinedInput-root.Mui-focused': {
                                boxShadow: 'none',
                            },
                            '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: colors.primary,
                                borderWidth: '1px',
                            },
                            '& .MuiInputBase-input': {
                                outline: 'none !important',
                                boxShadow: 'none !important',
                            },
                            '& .MuiInputBase-input:focus': {
                                outline: 'none !important',
                                boxShadow: 'none !important',
                                borderColor: 'transparent !important',
                            },
                        }}
                    />
                </Box>
            </Box>
        </Box>
    );
};
