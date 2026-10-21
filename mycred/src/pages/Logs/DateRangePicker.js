import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    IconButton,
    Button
} from '@mui/material';
import {
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import { useLogsTheme } from './ThemeContext';

const daysOfWeek = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
};

const formatDate = (date) => {
    if (!date) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

const isSameDay = (d1, d2) => {
    if (!d1 || !d2) return false;
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
};

const isBefore = (d1, d2) => d1.getTime() < d2.getTime();

const getPresetRange = (preset) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (preset) {
        case 'Today':
            return { start: today, end: today };
        case 'Yesterday': {
            const y = new Date(today);
            y.setDate(y.getDate() - 1);
            return { start: y, end: y };
        }
        case 'This week': {
            const day = today.getDay() || 7;
            const start = new Date(today);
            if (day !== 1) start.setDate(today.getDate() - (day - 1));
            const end = new Date(start);
            end.setDate(start.getDate() + 6);
            return { start, end };
        }
        case 'Last week': {
            const start = new Date(today);
            const day = today.getDay() || 7;
            start.setDate(today.getDate() - day - 6);
            const end = new Date(start);
            end.setDate(start.getDate() + 6);
            return { start, end };
        }
        case 'This month': {
            const start = new Date(today.getFullYear(), today.getMonth(), 1);
            const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            return { start, end };
        }
        case 'Last month': {
            const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const end = new Date(today.getFullYear(), today.getMonth(), 0);
            return { start, end };
        }
        case 'Year to date': {
            const start = new Date(today.getFullYear(), 0, 1);
            return { start, end: today };
        }
        default:
            return null;
    }
};

const DateRangePicker = ({
    onChange,
    onClose,
    initialPreset = 'All Time',
    initialStart = null,
    initialEnd = null
}) => {
    const { colors } = useLogsTheme();
    const [activePreset, setActivePreset] = useState(initialPreset);
    const [viewDate, setViewDate] = useState(new Date());
    const [startDate, setStartDate] = useState(initialStart);
    const [endDate, setEndDate] = useState(initialEnd);
    const [hoverDate, setHoverDate] = useState(null);

    useEffect(() => {
        if (activePreset !== 'Custom range' && activePreset !== 'All Time') {
            const range = getPresetRange(activePreset);
            if (range) {
                setStartDate(range.start);
                setEndDate(range.end);
                setViewDate(new Date(range.start.getFullYear(), range.start.getMonth(), 1));
            }
        } else if (activePreset === 'All Time') {
            setStartDate(null);
            setEndDate(null);
        }
    }, [activePreset]);

    const handleDateClick = (date) => {
        setActivePreset('Custom range');
        if (!startDate || (startDate && endDate)) {
            setStartDate(date);
            setEndDate(null);
        } else if (isBefore(date, startDate)) {
            setStartDate(date);
            setEndDate(startDate);
        } else {
            setEndDate(date);
        }
    };

    const isInRange = (date) => {
        if (startDate && endDate) {
            return date >= startDate && date <= endDate;
        }
        if (startDate && hoverDate && !endDate) {
            const actualStart = isBefore(hoverDate, startDate) ? hoverDate : startDate;
            const actualEnd = isBefore(hoverDate, startDate) ? startDate : hoverDate;
            return date >= actualStart && date <= actualEnd;
        }
        return false;
    };

    const isRangeStart = (date) => isSameDay(date, startDate);
    const isRangeEnd = (date) => isSameDay(date, endDate) || (!endDate && isSameDay(date, hoverDate));

    const CalendarMonth = ({ year, month, isLeft }) => {
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const blanks = Array(firstDay).fill(null);
        const days = Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1));

        return (
            <Box sx={{ width: 284, p: '16px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '12px' }}>
                    {isLeft ? (
                        <IconButton onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))} size="small" sx={{ color: colors.textPrimary }}>
                            <ChevronLeftIcon fontSize="small" />
                        </IconButton>
                    ) : <Box sx={{ width: 34 }} />}

                    <Typography sx={{ fontFamily: 'Poppins', fontWeight: 500, fontSize: '14px', color: colors.textPrimary }}>
                        {monthNames[month]} {year}
                    </Typography>

                    {!isLeft ? (
                        <IconButton onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))} size="small" sx={{ color: colors.textPrimary }}>
                            <ChevronRightIcon fontSize="small" />
                        </IconButton>
                    ) : <Box sx={{ width: 34 }} />}
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', mb: 1 }}>
                    {daysOfWeek.map(d => (
                        <Typography key={d} sx={{ fontFamily: 'Poppins', fontSize: '12px', color: colors.textSecondary, textAlign: 'center', fontWeight: 400 }}>
                            {d}
                        </Typography>
                    ))}
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: '4px' }}>
                    {blanks.map((_, i) => <Box key={`blank-${i}`} />)}
                    {days.map(date => {
                        const inRange = isInRange(date);
                        const isStart = isRangeStart(date);
                        const isEnd = isRangeEnd(date);

                        let bg = 'transparent';
                        let textColor = colors.textPrimary;
                        let borderRadius = '50%';

                        if (inRange) {
                            bg = colors.primaryLight;
                            borderRadius = '0';
                        }
                        if (isStart) {
                            bg = colors.primary;
                            textColor = colors.white;
                            borderRadius = '18px 0 0 18px';
                            if (isEnd || !endDate) borderRadius = '50%';
                        }
                        if (isEnd && endDate) {
                            bg = colors.primary;
                            textColor = colors.white;
                            borderRadius = '0 18px 18px 0';
                            if (isStart) borderRadius = '50%';
                        }

                        return (
                            <Box
                                key={date.toString()}
                                onClick={() => handleDateClick(date)}
                                onMouseEnter={() => setHoverDate(date)}
                                onMouseLeave={() => setHoverDate(null)}
                                sx={{
                                    height: '34px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    bgcolor: bg,
                                    borderRadius: borderRadius,
                                    color: textColor,
                                    fontFamily: 'Poppins',
                                    fontSize: '13px',
                                    fontWeight: (isStart || isEnd) ? 600 : 400,
                                    transition: 'all 0.1s',
                                    '&:hover': {
                                        bgcolor: (isStart || isEnd) ? colors.primary : colors.primaryLight,
                                        borderRadius: (isStart || isEnd) ? borderRadius : '50%',
                                    },
                                }}
                            >
                                {date.getDate()}
                            </Box>
                        );
                    })}
                </Box>
            </Box>
        );
    };

    const handleApply = () => {
        if (onChange) {
            onChange(activePreset, startDate ? formatDate(startDate) : null, endDate ? formatDate(endDate) : (startDate ? formatDate(startDate) : null));
        }
        if (onClose) onClose();
    };

    const nextMonthDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);

    return (
        <Box
            sx={{
                display: 'flex',
                bgcolor: colors.paper,
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: colors.shadow,
                border: `1px solid ${colors.borderPopover}`,
                fontFamily: 'Poppins',
            }}
        >
            <Box sx={{ width: 160, borderRight: `1px solid ${colors.border}`, py: 2 }}>
                {['Today', 'Yesterday', 'This week', 'Last week', 'This month', 'Last month', 'Year to date', 'Custom range', 'All Time'].map(preset => {
                    const isSelected = activePreset === preset;

                    return (
                        <Box
                            key={preset}
                            onClick={() => setActivePreset(preset)}
                            sx={{
                                py: '6px',
                                px: '24px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: isSelected ? 600 : 500,
                                fontFamily: 'Poppins',
                                lineHeight: 1.5,
                                color: isSelected ? colors.white : colors.textSecondary,
                                bgcolor: isSelected ? colors.primary : 'transparent',
                                transition: 'background-color 0.15s ease, color 0.15s ease',
                                '&:hover': {
                                    bgcolor: isSelected ? colors.primary : colors.hover,
                                    color: isSelected ? colors.white : colors.primary,
                                },
                            }}
                        >
                            {preset}
                        </Box>
                    );
                })}
            </Box>

            <Box>
                <Box sx={{ display: 'flex' }}>
                    <CalendarMonth year={viewDate.getFullYear()} month={viewDate.getMonth()} isLeft={true} />
                    <CalendarMonth year={nextMonthDate.getFullYear()} month={nextMonthDate.getMonth()} isLeft={false} />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, p: 2, pt: 1, borderTop: `1px solid ${colors.border}` }}>
                    <Button
                        onClick={onClose}
                        sx={{
                            color: colors.textSecondary,
                            textTransform: 'none',
                            fontSize: '13px',
                            '&:hover': { bgcolor: 'transparent', color: colors.textPrimary },
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleApply}
                        disableElevation
                        sx={{
                            bgcolor: colors.primary,
                            '&:hover': { bgcolor: colors.primaryHover },
                            textTransform: 'none',
                            borderRadius: '6px',
                            px: 3,
                            fontSize: '13px',
                            fontWeight: 500,
                        }}
                    >
                        Apply
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default DateRangePicker;
