import React from 'react';
import { Box, Dialog, Typography, FormControl, Select, MenuItem, TextField } from '@mui/material';

// Clean, minimal, fixed-top-right modal


const width = 320;
const FilterModal = ({
  open,
  onClose,
  pointTypes = [],
  pointType,
  onChangePointType,
  dateRange,
  onChangeDateRange,
  customStartDate,
  customEndDate,
  onChangeCustomStartDate,
  onChangeCustomEndDate,
  onCustomRangeSelected, // (start, end) => void
}) => {
  const isCustom = dateRange === 'Custom Range';
  const today = new Date().toISOString().split('T')[0];

  // Call API only when both dates are selected and changed
  React.useEffect(() => {
    if (isCustom && customStartDate && customEndDate && onCustomRangeSelected) {
      onCustomRangeSelected(customStartDate, customEndDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customStartDate, customEndDate]);
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width,
          borderRadius: '8px',
          p: 2.5,
          bgcolor: '#fff',
          position: 'fixed',
          top: 32,
          right: 32,
        },
      }}
      hideBackdrop
      disableScrollLock
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box>
          <Typography sx={{ fontWeight: 600, fontSize: 14, mb: 1 }}>Point Type:</Typography>
          <FormControl fullWidth size="small" sx={{ borderRadius: '8px' }}>
            <Select
              value={pointType}
              onChange={onChangePointType}
              displayEmpty
              sx={{ borderRadius: '8px' }}
            >
              {pointTypes.map((it) => {
                const val = typeof it === 'string' ? it : it.value || it.id || it.slug;
                const label = typeof it === 'string' ? it : it.label || it.name || it.title || String(it);
                return (
                  <MenuItem key={String(val)} value={val}>{label}</MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 600, fontSize: 14, mb: 1 }}>Date Range:</Typography>
          <FormControl fullWidth size="small" sx={{ borderRadius: '8px' }}>
            <Select
              value={dateRange}
              onChange={onChangeDateRange}
              displayEmpty
              sx={{ borderRadius: '8px' }}
            >
              <MenuItem value="Today">Today</MenuItem>
              <MenuItem value="This Week">This Week</MenuItem>
              <MenuItem value="This Month">This Month</MenuItem>
              <MenuItem value="Custom Range">Custom Range</MenuItem>
            </Select>
          </FormControl>
          {isCustom && (
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              mt: 2.5,
              p: 2,
              borderRadius: '12px',
              backgroundColor: '#F8F7FF',
              border: '1px solid #E8E4F8'
            }}>
              <TextField
                label="Start Date"
                type="date"
                fullWidth
                size="small"
                value={customStartDate || ''}
                onChange={onChangeCustomStartDate}
                InputLabelProps={{ shrink: true }}
                inputProps={{ max: customEndDate || today }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    backgroundColor: '#fff',
                    '& fieldset': {
                      borderColor: '#E0DAF2 !important',
                      borderWidth: '1px !important',
                      transition: 'none !important'
                    },
                    '&:hover fieldset': {
                      borderColor: '#D0C8F0 !important',
                      borderWidth: '1px !important'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#5E2CED !important',
                      borderWidth: '1px !important'
                    },
                    '&.Mui-focused': {
                      outline: 'none !important',
                      boxShadow: 'none !important',
                      border: 'none !important'
                    },
                    '&:before, &:after': {
                      display: 'none !important'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: '#2D1572 !important',
                    fontSize: '15px !important',
                    fontWeight: '600 !important',
                    backgroundColor: '#fff !important',
                    padding: '0 8px !important', // Increased padding to mask more border
                    marginLeft: '-4px !important', // Offset padding
                    transform: 'translate(12px, -11px) scale(0.85) !important',
                    '&.Mui-focused': { color: '#5E2CED !important' }
                  },
                  '& .MuiOutlinedInput-input': {
                    fontSize: '14px',
                    color: '#2D1572',
                    outline: 'none !important',
                    boxShadow: 'none !important',
                    border: 'none !important',
                    '&:focus': {
                      outline: 'none !important',
                      boxShadow: 'none !important',
                      border: 'none !important'
                    }
                  }
                }}
              />
              <TextField
                label="End Date"
                type="date"
                fullWidth
                size="small"
                value={customEndDate || ''}
                onChange={onChangeCustomEndDate}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: customStartDate || undefined, max: today }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    backgroundColor: '#fff',
                    '& fieldset': {
                      borderColor: '#E0DAF2 !important',
                      borderWidth: '1px !important',
                      transition: 'none !important'
                    },
                    '&:hover fieldset': {
                      borderColor: '#D0C8F0 !important',
                      borderWidth: '1px !important'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#5E2CED !important',
                      borderWidth: '1px !important'
                    },
                    '&.Mui-focused': {
                      outline: 'none !important',
                      boxShadow: 'none !important',
                      border: 'none !important'
                    },
                    '&:before, &:after': {
                      display: 'none !important'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: '#2D1572 !important',
                    fontSize: '15px !important',
                    fontWeight: '600 !important',
                    backgroundColor: '#fff !important',
                    padding: '0 8px !important',
                    marginLeft: '-4px !important',
                    transform: 'translate(12px, -11px) scale(0.85) !important',
                    '&.Mui-focused': { color: '#5E2CED !important' }
                  },
                  '& .MuiOutlinedInput-input': {
                    fontSize: '14px',
                    color: '#2D1572',
                    outline: 'none !important',
                    boxShadow: 'none !important',
                    border: 'none !important',
                    '&:focus': {
                      outline: 'none !important',
                      boxShadow: 'none !important',
                      border: 'none !important'
                    }
                  }
                }}
              />
            </Box>
          )}
        </Box>
      </Box>
    </Dialog>
  );
};

export default FilterModal;
