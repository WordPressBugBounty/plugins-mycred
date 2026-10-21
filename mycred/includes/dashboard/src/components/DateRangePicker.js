import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Button, List, ListItemButton, ListItemText } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const FREE_ALLOWED_PRESET = 'This Month';
const ALL_PRESETS = ['Today', 'Yesterday', 'This Week', 'Last Week', 'This Month', 'Last Month', 'Year to date', 'Custom Range'];

const fontFamily = 'Figtree, Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

const daysOfWeek = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => {
  const day = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon...
  return day === 0 ? 6 : day - 1; // Adjust to Mo=0, Su=6
};

const formatDate = (date) => {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const formatReadable = (date) => {
  if (!date) return '';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
    case 'This Week': {
      const day = today.getDay() || 7; // 1=Mon, 7=Sun
      const start = new Date(today);
      if (day !== 1) start.setHours(-24 * (day - 1));
      const end = new Date(today);
      if (day !== 7) end.setHours(24 * (7 - day));
      return { start, end };
    }
    case 'Last Week': {
      const start = new Date(today);
      const day = today.getDay() || 7;
      start.setDate(today.getDate() - day - 6);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return { start, end };
    }
    case 'This Month': {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return { start, end };
    }
    case 'Last Month': {
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
  initialRange = 'This Month',
  onClose,
  isProActive = false,
  onLockedPresetClick,
}) => {
  const [activePreset, setActivePreset] = useState(initialRange);
  const [viewDate, setViewDate] = useState(new Date());

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [hoverDate, setHoverDate] = useState(null);

  const purple = '#5E2CED';
  const lightPurple = '#F3EDFF';

  useEffect(() => {
    if (activePreset !== 'Custom Range') {
      const range = getPresetRange(activePreset);
      if (range) {
        setStartDate(range.start);
        setEndDate(range.end);
        setViewDate(new Date(range.start.getFullYear(), range.start.getMonth(), 1));
      }
    }
  }, [activePreset]);

  const isPresetLocked = (preset) => !isProActive && preset !== FREE_ALLOWED_PRESET;

  const handlePresetClick = (preset) => {
    if (isPresetLocked(preset)) {
      if (onLockedPresetClick) onLockedPresetClick();
      return;
    }
    setActivePreset(preset);
  };

  const handleDateClick = (date) => {
    if (!isProActive) {
      if (onLockedPresetClick) onLockedPresetClick();
      return;
    }
    setActivePreset('Custom Range');
    if (!startDate || (startDate && endDate)) {
      setStartDate(date);
      setEndDate(null);
    } else {
      if (isBefore(date, startDate)) {
        setStartDate(date);
        setEndDate(startDate);
      } else {
        setEndDate(date);
      }
    }
  };

  const isInRange = (date) => {
    if (startDate && endDate) {
      return date > startDate && date < endDate;
    }
    if (startDate && hoverDate && !endDate) {
      if (hoverDate < startDate) return false;
      return date > startDate && date < hoverDate;
    }
    return false;
  };

  const isRangeStart = (date) => isSameDay(date, startDate);
  const isRangeEnd = (date) => isSameDay(date, endDate) || (!endDate && isSameDay(date, hoverDate));

  const CalendarMonth = ({ year, month }) => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const blanks = Array(firstDay).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1));

    return (
      <Box sx={{ width: 250, p: 0.5 }}>
        {/* Days of week header */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', mb: 1.5 }}>
          {daysOfWeek.map((d) => (
            <Typography
              key={d}
              sx={{
                fontFamily,
                fontSize: 12,
                color: '#8A85A5',
                textAlign: 'center',
                fontWeight: 600,
              }}
            >
              {d}
            </Typography>
          ))}
        </Box>

        {/* Days grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: '4px' }}>
          {blanks.map((_, i) => (
            <Box key={`blank-${i}`} sx={{ height: 34 }} />
          ))}
          {days.map((date) => {
            const inRange = isInRange(date);
            const isStart = isRangeStart(date);
            const isEnd = isRangeEnd(date);
            const hasEndBound = Boolean(endDate || hoverDate);
            const isSingle = isStart && (!hasEndBound || isSameDay(startDate, endDate || hoverDate));

            let cellBg = 'transparent';
            let textColor = '#2D1572';

            if (!isSingle) {
              if (isStart) {
                cellBg = `linear-gradient(to right, transparent 50%, ${lightPurple} 50%)`;
              } else if (isEnd) {
                cellBg = `linear-gradient(to left, transparent 50%, ${lightPurple} 50%)`;
              } else if (inRange) {
                cellBg = lightPurple;
                textColor = purple;
              }
            }

            return (
              <Box
                key={date.toString()}
                onClick={() => handleDateClick(date)}
                onMouseEnter={() => setHoverDate(date)}
                onMouseLeave={() => setHoverDate(null)}
                sx={{
                  height: 34,
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  background: cellBg,
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: (isStart || isEnd) ? purple : 'transparent',
                    color: (isStart || isEnd) ? '#ffffff' : textColor,
                    fontFamily,
                    fontSize: 13,
                    fontWeight: (isStart || isEnd || inRange) ? 700 : 500,
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      bgcolor: (isStart || isEnd) ? '#4A22C5' : '#EDE9FE',
                      color: (isStart || isEnd) ? '#ffffff' : purple,
                    },
                  }}
                >
                  {date.getDate()}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  };

  const handleApply = () => {
    if (!isProActive && activePreset !== FREE_ALLOWED_PRESET) {
      if (onLockedPresetClick) onLockedPresetClick();
      return;
    }
    if (onChange) {
      if (activePreset !== 'Custom Range') {
        onChange(activePreset, formattedStart, formattedEnd);
      } else {
        onChange('Custom Range', formattedStart, formattedEnd);
      }
    }
    if (onClose) onClose();
  };

  const formattedStart = startDate ? formatDate(startDate) : '';
  const formattedEnd = endDate ? formatDate(endDate) : '';

  const nextMonthDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);

  return (
    <Box
      sx={{
        display: 'flex',
        bgcolor: '#ffffff',
        fontFamily,
        maxWidth: '100%',
      }}
    >
      {/* Sidebar Presets */}
      <Box
        sx={{
          width: 145,
          bgcolor: '#FAF9FD',
          borderRight: '1px solid #ECE7F6',
          py: 2,
          px: 1,
          flexShrink: 0,
        }}
      >
        <List disablePadding>
          {ALL_PRESETS.map((preset) => {
            const isSelected = activePreset === preset;
            const locked = isPresetLocked(preset);
            return (
              <ListItemButton
                key={preset}
                selected={isSelected}
                onClick={() => handlePresetClick(preset)}
                sx={{
                  py: 0.8,
                  px: 1.5,
                  mb: 0.4,
                  borderRadius: '8px',
                  bgcolor: isSelected ? `${purple} !important` : 'transparent',
                  color: isSelected ? '#ffffff !important' : (locked ? '#A799CE' : '#524B70'),
                  opacity: locked ? 0.75 : 1,
                  '&:hover': {
                    bgcolor: isSelected ? purple : (locked ? '#F5F3FF' : '#EDE9FE'),
                    color: isSelected ? '#ffffff' : (locked ? '#A799CE' : purple),
                  },
                }}
              >
                <ListItemText
                  primary={preset}
                  primaryTypographyProps={{
                    fontSize: 12.5,
                    fontWeight: isSelected ? 700 : 500,
                    fontFamily,
                  }}
                />
                {locked && (
                  <LockOutlinedIcon sx={{ fontSize: 13, color: '#A799CE', ml: 0.5 }} />
                )}
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      {/* Calendar Main Area */}
      <Box sx={{ p: 2.5, flex: 1, minWidth: 0 }}>
        {/* Month Navigation Headers */}
        <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
          {/* Month 1 Header */}
          <Box sx={{ width: 250, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <IconButton
              onClick={() => {
                if (!isProActive) {
                  if (onLockedPresetClick) onLockedPresetClick();
                  return;
                }
                setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
              }}
              size="small"
              disabled={!isProActive}
              sx={{
                color: '#524B70',
                bgcolor: '#F5F3FF',
                '&:hover': { bgcolor: '#EDE9FE' },
              }}
            >
              <ArrowBackIosNewIcon sx={{ fontSize: 13 }} />
            </IconButton>
            <Typography sx={{ fontFamily, fontWeight: 700, fontSize: 14, color: '#2D1572' }}>
              {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
            </Typography>
            <Box sx={{ width: 28 }} />
          </Box>

          {/* Month 2 Header */}
          <Box sx={{ width: 250, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ width: 28 }} />
            <Typography sx={{ fontFamily, fontWeight: 700, fontSize: 14, color: '#2D1572' }}>
              {monthNames[nextMonthDate.getMonth()]} {nextMonthDate.getFullYear()}
            </Typography>
            <IconButton
              onClick={() => {
                if (!isProActive) {
                  if (onLockedPresetClick) onLockedPresetClick();
                  return;
                }
                setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
              }}
              size="small"
              disabled={!isProActive}
              sx={{
                color: '#524B70',
                bgcolor: '#F5F3FF',
                '&:hover': { bgcolor: '#EDE9FE' },
              }}
            >
              <ArrowForwardIosIcon sx={{ fontSize: 13 }} />
            </IconButton>
          </Box>
        </Box>

        {/* Dual Calendars */}
        <Box sx={{ display: 'flex', gap: 3, position: 'relative' }}>
          <CalendarMonth year={viewDate.getFullYear()} month={viewDate.getMonth()} />
          <CalendarMonth year={nextMonthDate.getFullYear()} month={nextMonthDate.getMonth()} />
          {!isProActive && (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                bgcolor: 'rgba(255, 255, 255, 0.55)',
                backdropFilter: 'blur(2px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '12px',
                pointerEvents: 'none',
              }}
            >
              <Typography sx={{ fontFamily, fontSize: 12, fontWeight: 600, color: '#6B57A1', bgcolor: '#fff', px: 2, py: 1, borderRadius: '8px', border: '1px solid #ECE7F6' }}>
                Custom ranges require Pro
              </Typography>
            </Box>
          )}
        </Box>

        {/* Bottom Actions Row */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mt: 2.5,
            pt: 1.5,
            borderTop: '1px solid #ECE7F6',
          }}
        >
          <Typography sx={{ color: '#6B57A1', fontSize: 12, fontFamily, fontWeight: 500 }}>
            {startDate ? (
              <span>
                Selected: <strong style={{ color: '#2D1572' }}>{formatReadable(startDate)}</strong>
                {endDate ? <> – <strong style={{ color: '#2D1572' }}>{formatReadable(endDate)}</strong></> : ''}
              </span>
            ) : (
              'Select a date range'
            )}
          </Typography>

          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              onClick={onClose}
              sx={{
                color: '#6B57A1',
                textTransform: 'none',
                fontFamily,
                fontSize: 13,
                fontWeight: 600,
                px: 2,
                '&:hover': { bgcolor: '#F5F3FF' },
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleApply}
              disabled={!startDate}
              disableElevation
              sx={{
                bgcolor: purple,
                textTransform: 'none',
                borderRadius: '8px',
                px: 2.5,
                py: 0.6,
                fontFamily,
                fontSize: 13,
                fontWeight: 700,
                '&:hover': { bgcolor: '#4A22C5' },
              }}
            >
              Apply
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DateRangePicker;

