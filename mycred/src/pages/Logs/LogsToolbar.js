import React, { useState } from 'react';
import {
    Box,
    InputBase,
    MenuItem,
    Menu,
    Typography,
    Button,
    Popover
} from '@mui/material';
import {
    KeyboardArrowDown as DownIcon,
    CalendarToday as CalendarIcon
} from '@mui/icons-material';
import DateRangePicker from './DateRangePicker';
import { useLogsTheme } from './ThemeContext';

const FilterButton = ({ label, value, options, onChange, startIcon }) => {
    const { colors } = useLogsTheme();
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const [searchQuery, setSearchQuery] = useState('');

    const handleClick = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => {
        setAnchorEl(null);
        setSearchQuery('');
    };

    const handleSelect = (val) => {
        onChange(val);
        handleClose();
    };

    const filteredOptions = Object.entries(options).filter(([_, name]) =>
        name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const displayLabel = options[value] || label;

    return (
        <>
            <Button
                variant="outlined"
                onClick={handleClick}
                startIcon={startIcon}
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
                    py: 1,
                    borderRadius: '8px',
                    '&:hover': {
                        borderColor: colors.primary,
                        background: colors.paperMuted,
                    },
                    textTransform: 'none',
                    fontWeight: 400,
                    fontSize: '14px',
                    fontFamily: "'Poppins', sans-serif",
                    minWidth: '160px',
                    justifyContent: 'space-between',
                }}
            >
                {displayLabel}
            </Button>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                slotProps={{
                    paper: {
                        sx: {
                            mt: 1,
                            borderRadius: '8px',
                            boxShadow: colors.shadow,
                            border: `1px solid ${colors.border}`,
                            minWidth: '220px',
                            maxHeight: '400px',
                            display: 'flex',
                            flexDirection: 'column',
                            backgroundColor: colors.paper,
                            backgroundImage: 'none',
                            opacity: 1,
                        },
                    },
                }}
            >
                <Box sx={{ p: 1, position: 'sticky', top: 0, bgcolor: colors.paper, zIndex: 1 }}>
                    <InputBase
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        fullWidth
                        sx={{
                            fontSize: '13px',
                            p: '6px 12px',
                            bgcolor: colors.paperMuted,
                            borderRadius: '6px',
                            border: `1px solid ${colors.borderPopover}`,
                            fontFamily: "'Poppins', sans-serif",
                            color: colors.textPrimary,
                        }}
                    />
                </Box>
                <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map(([val, name]) => (
                            <MenuItem
                                key={val}
                                onClick={() => handleSelect(val)}
                                selected={value === val}
                                sx={{
                                    fontSize: '14px',
                                    py: 1,
                                    color: colors.textPrimary,
                                    '&.Mui-selected': {
                                        bgcolor: colors.paperMuted,
                                        color: colors.primary,
                                    },
                                    '&:hover': {
                                        bgcolor: colors.rowHover,
                                    },
                                }}
                            >
                                {name}
                            </MenuItem>
                        ))
                    ) : (
                        <Typography sx={{ p: 2, fontSize: '13px', color: colors.textMuted, textAlign: 'center' }}>
                            No results found
                        </Typography>
                    )}
                </Box>
            </Menu>
        </>
    );
};

const LogsToolbar = ({ filters, onFilterChange, references }) => {
    const { colors } = useLogsTheme();
    const [dateAnchorEl, setDateAnchorEl] = useState(null);
    const dateOpen = Boolean(dateAnchorEl);

    const handleSearch = (e) => {
        onFilterChange({ search: e.target.value });
    };

    const refOptions = {
        'all': 'All References',
        ...(references || {})
    };

    const handleDateClick = (event) => setDateAnchorEl(event.currentTarget);
    const handleDateClose = () => setDateAnchorEl(null);

    const handleDateChange = (preset, from, to) => {
        onFilterChange({
            time: preset === 'All Time' ? 'all' : preset,
            from: preset === 'All Time' ? null : from,
            to: preset === 'All Time' ? null : to,
        });
        handleDateClose();
    };

    const getDateLabel = () => {
        if (filters.time === 'all' || !filters.time) return 'All Time';

        const format = (d) => {
            const parts = d.split('-');
            if (parts.length < 3) return d;
            const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
            return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        };

        if (filters.from) {
            const end = filters.to || filters.from;
            if (end === filters.from) return format(filters.from);
            return `${format(filters.from)} - ${format(end)}`;
        }

        return filters.time;
    };

    return (
        <Box sx={{
            display: 'flex',
            gap: 1.5,
            alignItems: 'center',
            background: 'transparent',
        }}>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    bgcolor: colors.paper,
                    borderRadius: '8px',
                    px: '12px',
                    height: '40px',
                    width: '320px',
                    border: `1px solid ${colors.borderInput}`,
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                    '&:focus-within': { borderColor: colors.primary },
                    '&:hover': { borderColor: colors.primary },
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="7"></circle>
                        <line x1="21" y1="21" x2="16" y2="16"></line>
                    </svg>
                </Box>
                <InputBase
                    placeholder="Search for logs..."
                    value={filters.search}
                    onChange={handleSearch}
                    fullWidth
                    sx={{
                        fontSize: '14px',
                        color: colors.textMuted,
                        fontFamily: "'Poppins', sans-serif",
                        '& .MuiInputBase-input': {
                            border: 'none !important',
                            boxShadow: 'none !important',
                            bgcolor: 'transparent !important',
                            outline: 'none !important',
                            p: 0,
                            m: 0,
                            height: 'auto',
                            minHeight: 0,
                            color: colors.textPrimary,
                        },
                        '& .MuiInputBase-input:focus': {
                            border: 'none !important',
                            boxShadow: 'none !important',
                            outline: 'none !important',
                        },
                        '& .MuiInputBase-input::placeholder': { color: colors.textMuted, opacity: 1 },
                    }}
                />
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5 }}>
                <FilterButton
                    label="All References"
                    value={filters.ref}
                    options={refOptions}
                    onChange={(val) => onFilterChange({ ref: val })}
                />

                <Button
                    variant="outlined"
                    onClick={handleDateClick}
                    startIcon={<CalendarIcon sx={{ fontSize: '18px', color: colors.textMuted }} />}
                    endIcon={<DownIcon sx={{
                        transition: 'transform 0.2s',
                        transform: dateOpen ? 'rotate(180deg)' : 'none',
                        color: colors.textSecondary,
                    }} />}
                    sx={{
                        borderColor: colors.borderInput,
                        color: colors.textSecondary,
                        background: colors.paper,
                        px: 2,
                        minWidth: '160px',
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
                    {getDateLabel()}
                </Button>

                <Popover
                    open={dateOpen}
                    anchorEl={dateAnchorEl}
                    onClose={handleDateClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    sx={{ mt: 1 }}
                    slotProps={{
                        paper: {
                            sx: {
                                boxShadow: colors.shadow,
                                borderRadius: '12px',
                                border: 'none',
                                backgroundColor: colors.paper,
                                backgroundImage: 'none',
                                opacity: 1,
                            },
                        },
                    }}
                >
                    <DateRangePicker
                        initialPreset={filters.time === 'all' ? 'All Time' : filters.time}
                        initialStart={filters.from ? new Date(filters.from) : null}
                        initialEnd={filters.to ? new Date(filters.to) : null}
                        onChange={handleDateChange}
                        onClose={handleDateClose}
                    />
                </Popover>
            </Box>
        </Box>
    );
};

export default LogsToolbar;
