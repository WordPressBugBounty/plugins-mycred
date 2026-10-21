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
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import { useAdminTheme } from '../../../../../src/shared/adminTheme/AdminThemeProvider';

const COLUMN_OPTIONS = [
    { key: 'buyer', label: 'Buyer' },
    { key: 'amount', label: 'Amount' },
    { key: 'cost', label: 'Cost' },
    { key: 'gateway', label: 'Gateway' },
    { key: 'ctype', label: 'Point Type' },
    { key: 'date', label: 'Date' }
];

export const WithdrawalsHeader = ({
    totalCount,
    activeTab,
    onTabChange,
    searchQuery,
    onSearchChange,
    counts,
    mycredStatus,
    onMycredStatusChange,
    gatewayFilter,
    onGatewayFilterChange,
    bulkAction,
    onBulkActionChange,
    onApplyBulkAction,
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
                        cashCred Withdrawals
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
            </Box>

            {/* Filter Tabs & Action Controls Bar */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 2
                }}
            >
                {/* Tabs */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        onClick={() => onTabChange('all')}
                        sx={{
                            textTransform: 'none',
                            fontWeight: activeTab === 'all' ? 600 : 500,
                            color: activeTab === 'all' ? colors.primary : colors.textSecondary,
                            bgcolor: activeTab === 'all' ? colors.primaryLight : 'transparent',
                            borderRadius: '8px',
                            px: 2,
                            py: 0.75,
                            fontSize: '13px',
                            fontFamily: "'Figtree', sans-serif",
                            '&:hover': {
                                bgcolor: activeTab === 'all' ? colors.primaryLight : colors.sidebarHover
                            }
                        }}
                    >
                        All ({counts.all || 0})
                    </Button>
                    <Button
                        onClick={() => onTabChange('publish')}
                        sx={{
                            textTransform: 'none',
                            fontWeight: activeTab === 'publish' ? 600 : 500,
                            color: activeTab === 'publish' ? colors.primary : colors.textSecondary,
                            bgcolor: activeTab === 'publish' ? colors.primaryLight : 'transparent',
                            borderRadius: '8px',
                            px: 2,
                            py: 0.75,
                            fontSize: '13px',
                            fontFamily: "'Figtree', sans-serif",
                            '&:hover': {
                                bgcolor: activeTab === 'publish' ? colors.primaryLight : colors.sidebarHover
                            }
                        }}
                    >
                        Published ({counts.publish || counts.all || 0})
                    </Button>
                    <Button
                        onClick={() => onTabChange('trash')}
                        sx={{
                            textTransform: 'none',
                            fontWeight: activeTab === 'trash' ? 600 : 500,
                            color: activeTab === 'trash' ? colors.primary : colors.textSecondary,
                            bgcolor: activeTab === 'trash' ? colors.primaryLight : 'transparent',
                            borderRadius: '8px',
                            px: 2,
                            py: 0.75,
                            fontSize: '13px',
                            fontFamily: "'Figtree', sans-serif",
                            '&:hover': {
                                bgcolor: activeTab === 'trash' ? colors.primaryLight : colors.sidebarHover
                            }
                        }}
                    >
                        Trash ({counts.trash || 0})
                    </Button>
                </Box>

                {/* Right controls: Filters, Search, Bulk Actions, Column Visibility */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                    
                    {/* Status filter */}
                    <Select
                        value={mycredStatus || 'all'}
                        onChange={(e) => onMycredStatusChange(e.target.value)}
                        size="small"
                        sx={{
                            height: '38px',
                            borderRadius: '8px',
                            bgcolor: colors.paper,
                            fontSize: '13px',
                            fontFamily: "'Figtree', sans-serif",
                            minWidth: 120,
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.border }
                        }}
                    >
                        <MenuItem value="all" sx={{ fontSize: '13px' }}>All Status</MenuItem>
                        <MenuItem value="Approved" sx={{ fontSize: '13px' }}>Approved</MenuItem>
                        <MenuItem value="Pending" sx={{ fontSize: '13px' }}>Pending</MenuItem>
                        <MenuItem value="Cancelled" sx={{ fontSize: '13px' }}>Cancelled</MenuItem>
                    </Select>

                    {/* Gateway filter */}
                    <Select
                        value={gatewayFilter || 'all'}
                        onChange={(e) => onGatewayFilterChange(e.target.value)}
                        size="small"
                        sx={{
                            height: '38px',
                            borderRadius: '8px',
                            bgcolor: colors.paper,
                            fontSize: '13px',
                            fontFamily: "'Figtree', sans-serif",
                            minWidth: 130,
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.border }
                        }}
                    >
                        <MenuItem value="all" sx={{ fontSize: '13px' }}>All Gateway</MenuItem>
                        <MenuItem value="bank" sx={{ fontSize: '13px' }}>Bank Transfer</MenuItem>
                        {/* We could inject dynamic gateways here from window.mycredCashcredGateways if it exists */}
                    </Select>

                    <TextField
                        placeholder="Search withdrawals..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        size="small"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ fontSize: 18, color: colors.textSecondary }} />
                                </InputAdornment>
                            )
                        }}
                        sx={{
                            width: { xs: '100%', sm: 220 },
                            '& .MuiOutlinedInput-root': {
                                height: '38px',
                                borderRadius: '8px',
                                bgcolor: colors.paper,
                                fontSize: '13px',
                                fontFamily: "'Figtree', sans-serif",
                                '& fieldset': { borderColor: colors.border },
                                '&:hover fieldset': { borderColor: colors.primary },
                                '&.Mui-focused fieldset': { borderColor: colors.primary }
                            },
                            '& input': {
                                resize: 'none !important',
                                border: 'none !important',
                                boxShadow: 'none !important',
                                outline: 'none !important',
                                padding: '8px 0 !important',
                                height: 'auto !important'
                            }
                        }}
                    />

                    {/* Bulk Action selector */}
                    <Select
                        value={bulkAction}
                        onChange={(e) => onBulkActionChange(e.target.value)}
                        displayEmpty
                        size="small"
                        sx={{
                            height: '38px',
                            borderRadius: '8px',
                            bgcolor: colors.paper,
                            fontSize: '13px',
                            fontFamily: "'Figtree', sans-serif",
                            minWidth: 140,
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.border }
                        }}
                    >
                        <MenuItem value="" disabled sx={{ fontSize: '13px' }}>
                            Bulk actions
                        </MenuItem>
                        {activeTab !== 'trash' ? (
                            <MenuItem value="trash" sx={{ fontSize: '13px' }}>
                                Move to Trash
                            </MenuItem>
                        ) : (
                            [
                                <MenuItem key="restore" value="restore" sx={{ fontSize: '13px' }}>
                                    Restore
                                </MenuItem>,
                                <MenuItem key="delete" value="delete" sx={{ fontSize: '13px', color: colors.danger }}>
                                    Delete Permanently
                                </MenuItem>
                            ]
                        )}
                    </Select>

                    <Button
                        variant="outlined"
                        size="small"
                        onClick={onApplyBulkAction}
                        disabled={!bulkAction}
                        sx={{
                            height: '38px',
                            minWidth: '70px',
                            px: 2,
                            py: 0,
                            textTransform: 'none',
                            borderRadius: '8px',
                            fontWeight: 600,
                            fontSize: '13px',
                            fontFamily: "'Figtree', sans-serif",
                            borderColor: colors.border,
                            color: colors.textPrimary,
                            '&:hover': { borderColor: colors.primary, bgcolor: colors.primaryLight }
                        }}
                    >
                        Apply
                    </Button>

                    {/* Column Visibility Settings Button */}
                    <IconButton
                        onClick={(e) => setSettingsAnchor(e.currentTarget)}
                        size="small"
                        sx={{
                            height: '38px',
                            width: '38px',
                            p: 0,
                            border: `1px solid ${colors.border}`,
                            borderRadius: '8px',
                            color: colors.textSecondary,
                            '&:hover': { color: colors.primary, bgcolor: colors.primaryLight }
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
                        PaperProps={{
                            sx: {
                                p: 2,
                                borderRadius: '12px',
                                boxShadow: colors.shadowLg,
                                border: `1px solid ${colors.border}`,
                                width: 200
                            }
                        }}
                    >
                        <Typography sx={{ fontWeight: 700, fontSize: '13px', mb: 1, color: colors.textPrimary }}>
                            Toggle Columns
                        </Typography>
                        {COLUMN_OPTIONS.map((col) => (
                            <FormControlLabel
                                key={col.key}
                                control={
                                    <Checkbox
                                        checked={!!visibleColumns[col.key]}
                                        onChange={() => onToggleColumn(col.key)}
                                        size="small"
                                        sx={{ color: colors.primary, '&.Mui-checked': { color: colors.primary } }}
                                    />
                                }
                                label={col.label}
                                sx={{
                                    display: 'flex',
                                    width: '100%',
                                    m: 0,
                                    '& .MuiFormControlLabel-label': {
                                        fontSize: '13px',
                                        color: colors.textSecondary,
                                        fontFamily: "'Figtree', sans-serif"
                                    }
                                }}
                            />
                        ))}
                    </Popover>
                </Box>
            </Box>
        </Box>
    );
};
