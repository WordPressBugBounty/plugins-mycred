import React, { useState } from 'react';
import {
    Box,
    Button,
    Checkbox,
    FormControlLabel,
    Popover,
    Typography,
} from '@mui/material';
import {
    KeyboardArrowDown as DownIcon,
    ViewColumn as ViewColumnIcon,
} from '@mui/icons-material';
import { useLogsTheme } from './ThemeContext';

const ColumnPicker = ({ allColumns, visibleColumns, onChange }) => {
    const { colors } = useLogsTheme();
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleOpen = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const handleToggle = (key) => {
        const isVisible = visibleColumns.includes(key);

        if (isVisible && visibleColumns.length === 1) {
            return;
        }

        const nextKeys = isVisible
            ? visibleColumns.filter((columnKey) => columnKey !== key)
            : [...visibleColumns, key];

        const ordered = allColumns
            .map((column) => column.key)
            .filter((columnKey) => nextKeys.includes(columnKey));

        onChange(ordered);
    };

    const handleSelectAll = () => {
        onChange(allColumns.map((column) => column.key));
    };

    const handleReset = () => {
        onChange(allColumns.map((column) => column.key));
    };

    return (
        <>
            <Button
                variant="outlined"
                onClick={handleOpen}
                startIcon={<ViewColumnIcon sx={{ fontSize: '18px', color: colors.textMuted }} />}
                endIcon={<DownIcon sx={{
                    transition: 'transform 0.2s',
                    transform: open ? 'rotate(180deg)' : 'none',
                    color: colors.textSecondary,
                }} />}
                sx={{
                    borderColor: colors.borderInput,
                    color: colors.textSecondary,
                    background: colors.paper,
                    px: 2,
                    minWidth: '140px',
                    height: '40px',
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 400,
                    fontSize: '14px',
                    fontFamily: "'Poppins', sans-serif",
                    justifyContent: 'space-between',
                    '&:hover': {
                        borderColor: colors.primary,
                        background: colors.paperMuted,
                    },
                }}
            >
                Columns
            </Button>

            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{
                    paper: {
                        className: 'mycred-logs-popover-paper',
                        sx: {
                            mt: 1,
                            borderRadius: '12px',
                            border: `1px solid ${colors.borderPopover}`,
                            boxShadow: colors.shadowMenu,
                            minWidth: 240,
                            // Force opaque surface — WP admin CSS can clear MUI paper backgrounds.
                            backgroundColor: `${colors.paper} !important`,
                            backgroundImage: 'none !important',
                            opacity: '1 !important',
                        },
                    },
                }}
            >
                <Box sx={{ p: 2, backgroundColor: colors.paper }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography sx={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary }}>
                            Show columns
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                size="small"
                                onClick={handleSelectAll}
                                sx={{ textTransform: 'none', minWidth: 0, px: 1 }}
                            >
                                All
                            </Button>
                            <Button
                                size="small"
                                onClick={handleReset}
                                sx={{ textTransform: 'none', minWidth: 0, px: 1 }}
                            >
                                Reset
                            </Button>
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        {allColumns.map((column) => (
                            <FormControlLabel
                                key={column.key}
                                control={(
                                    <Checkbox
                                        size="small"
                                        checked={visibleColumns.includes(column.key)}
                                        onChange={() => handleToggle(column.key)}
                                        sx={{
                                            color: colors.borderInput,
                                            '&.Mui-checked': { color: colors.primary },
                                        }}
                                    />
                                )}
                                label={column.label}
                                sx={{
                                    m: 0,
                                    py: 0.25,
                                    '& .MuiFormControlLabel-label': {
                                        fontSize: 14,
                                        color: colors.textSecondary,
                                        fontFamily: "'Figtree', sans-serif",
                                    },
                                }}
                            />
                        ))}
                    </Box>
                </Box>
            </Popover>
        </>
    );
};

export default ColumnPicker;
