import { Box, TextField, InputAdornment, CircularProgress, Popper, Paper, List, ListItemButton, Typography, Avatar, Select, MenuItem, Button, Menu, ListItemIcon, ListItemText, Popover, IconButton, Chip } from '@mui/material';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import { Search as SearchIcon, Settings as SettingsIcon, ArrowDropDown as ArrowDropDownIcon } from '@mui/icons-material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import React from 'react';
import FilterModal from './modal/FilterModal';
import DashboardSettingsModal from './modal/DashboardSettingsModal';
import DateRangePicker from './DateRangePicker';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MenuIcon from '@mui/icons-material/Menu';
// Quick Action SVGs
import { ReactComponent as AwardIcon } from '../assets/quick-actions/award-icon.svg';
import { ReactComponent as DeductIcon } from '../assets/quick-actions/deduct-icon.svg';
import { ReactComponent as HooksIcon } from '../assets/quick-actions/mycred-hooks.svg';
import { ReactComponent as QuickSettingsIcon } from '../assets/quick-actions/mycred-settings.svg';
import { ReactComponent as LightningIcon } from '../assets/quick-actions/lightning-icon.svg';
import PointsTransferModal from './modal/PointsTransferModal';
import UpgradeDialog from './UpgradeDialog';
import toast from 'react-hot-toast';

const FREE_ALLOWED_DATE_RANGE = 'This Month';

const FilterBar = ({
  visibility,
  setVisibility,
  onSearchSubmit,
  loading,
  userFilterEnabled = true,
  pointTypes,
  defaultPointType,
  pointType,
  dateRange,
  onChangePointType,
  onChangeDateRange,
  onCustomRangeChange,
  // Quick Action Props
  onActionComplete,
  isProActive = false,
  pointTypeLabel = 'Points',
  activePointType,
  // Single User Props
  onBack,
  showQuickActions = true,
  disableSettings = false
}) => {
  const allowedTypes = pointTypes;
  const ptRaw = pointTypes;
  const [customStartDate, setCustomStartDate] = React.useState('');
  const [customEndDate, setCustomEndDate] = React.useState('');

  const pointTypesDeriv = React.useMemo(() => {
    const map = (typeof window !== 'undefined' && window.mycredDashboardData && window.mycredDashboardData.pointTypesMap) || {};
    let items = Array.isArray(allowedTypes) && allowedTypes.length ? allowedTypes : null;

    if (!items && typeof window !== 'undefined' && window.mycredDashboardData) {
      items = window.mycredDashboardData.dashboard_settings?.dashboard_point_types || Object.keys(map);
    }

    if (Array.isArray(items)) {
      return items.map((item) => {
        if (typeof item === 'string') {
          return { id: item, label: map[item] || (item.charAt(0).toUpperCase() + item.slice(1).replace(/_/g, ' ')) };
        }
        const id = item.id || item.value || item.slug || '';
        const label = item.label || item.name || item.title || map[id] || (id ? (id.charAt(0).toUpperCase() + id.slice(1).replace(/_/g, ' ')) : '');
        return { id, label: label || id };
      }).filter(i => i.id);
    }
    return [];
  }, [allowedTypes]);

  const firstAllowed = React.useMemo(() => {
    if (!Array.isArray(pointTypesDeriv) || !pointTypesDeriv.length) return '';
    const first = pointTypesDeriv[0];
    return typeof first === 'string' ? first : (first?.id || first?.value || '');
  }, [pointTypesDeriv]);

  const effectivePointType = pointType || defaultPointType || firstAllowed;

  React.useEffect(() => {
    if (dateRange !== 'Custom Range') {
      setCustomStartDate('');
      setCustomEndDate('');
    }
  }, [dateRange]);

  React.useEffect(() => {
    if (
      dateRange === 'Custom Range' &&
      customStartDate &&
      customEndDate &&
      customStartDate <= customEndDate &&
      typeof onCustomRangeChange === 'function'
    ) {
      onCustomRangeChange(customStartDate, customEndDate);
    }
    // intentionally omit onCustomRangeChange from deps to avoid infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customStartDate, customEndDate, dateRange, effectivePointType]);

  const [filterAnchor, setFilterAnchor] = React.useState(null);
  const [filterRect, setFilterRect] = React.useState(null);

  const handleOpenFilters = (e) => {
    setFilterAnchor(e.currentTarget);
    const rect = e.currentTarget.getBoundingClientRect();
    setFilterRect({ left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: rect.width, height: rect.height });
  };

  const handleCloseFilters = () => {
    setFilterAnchor(null);
    setFilterRect(null);
  };

  const open = Boolean(filterAnchor);
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  // Quick Action Menu State
  const [quickActionAnchor, setQuickActionAnchor] = React.useState(null);
  const openQuickAction = Boolean(quickActionAnchor);
  const handleQuickActionClick = (event) => setQuickActionAnchor(event.currentTarget);
  const handleQuickActionClose = () => setQuickActionAnchor(null);

  // --- Quick Action Logics ---
  const [modalMode, setModalMode] = React.useState(null);

  const ensureTrailingSlash = React.useCallback((value) => {
    if (!value) return '/wp-admin/';
    return value.endsWith('/') ? value : `${value}/`;
  }, []);

  const resolveAdminBase = React.useCallback(() => {
    if (typeof window === 'undefined') return '/wp-admin/';
    const direct = window.mycredDashboardData && window.mycredDashboardData.adminBase;
    if (direct) return ensureTrailingSlash(String(direct));
    if (window.ajaxurl) {
      try {
        const parsed = new URL(window.ajaxurl, window.location.origin);
        const cleaned = parsed.pathname.replace(/admin-ajax\.php.*$/i, '');
        return ensureTrailingSlash(`${parsed.origin}${cleaned}`);
      } catch (e) {
        const fallback = String(window.ajaxurl).replace(/admin-ajax\.php.*$/i, '');
        return ensureTrailingSlash(fallback);
      }
    }
    const match = window.location.pathname.match(/^(.*\/wp-admin\/)\b/i);
    if (match && match[1]) {
      return ensureTrailingSlash(`${window.location.origin}${match[1]}`);
    }
    return ensureTrailingSlash(`${window.location.origin}/wp-admin/`);
  }, [ensureTrailingSlash]);

  const resolvedPointTypes = React.useMemo(() => {
    if (Array.isArray(ptRaw) && ptRaw.length) {
      return ptRaw.map((item) => {
        if (typeof item === 'string') {
          const map = (typeof window !== 'undefined' && window.mycredDashboardData && window.mycredDashboardData.pointTypesMap) || {};
          const label = map[item] || item;
          return { value: item, label };
        }
        if (item && typeof item === 'object') {
          const value = item.value || item.id || item.slug || '';
          const label = item.label || item.name || item.title || value;
          return value ? { value, label } : null;
        }
        return null;
      }).filter(Boolean);
    }
    const map = (typeof window !== 'undefined' && window.mycredDashboardData && window.mycredDashboardData.pointTypesMap) || {};
    return Object.keys(map).map((slug) => ({ value: slug, label: map[slug] }));
  }, [ptRaw]);

  const resolvedDefaultType = React.useMemo(() => {
    if (defaultPointType) return defaultPointType;
    if (resolvedPointTypes.length) return resolvedPointTypes[0].value;
    return 'mycred_default';
  }, [defaultPointType, resolvedPointTypes]);

  const handleOpenModal = (mode) => () => {
    setModalMode(mode);
    handleQuickActionClose();
  };
  const handleCloseModal = () => setModalMode(null);

  const handleSuccess = React.useCallback((payload) => {
    const { mode, amount, userCount, response, appliedToAll } = payload || {};
    const allApplied = Boolean(appliedToAll || (response && response.apply_to === 'all'));
    const verb = mode === 'deduct' ? 'Deducted' : 'Awarded';
    const userSummary = allApplied ? 'for all customers' : (userCount ? `to ${userCount} user${userCount > 1 ? 's' : ''}` : '');
    const message = `${verb} ${amount} ${pointTypeLabel.toLowerCase()} ${userSummary}`.trim();
    if (response && Array.isArray(response.failed) && response.failed.length > 0) {
      toast.error(message);
    } else {
      toast.success(message);
      handleCloseModal();
    }
    if (typeof onActionComplete === 'function') onActionComplete();
  }, [onActionComplete, pointTypeLabel]);

  const handleError = React.useCallback((message) => {
    toast.error(message || 'Unable to process request.');
  }, []);

  const resolvePageSlug = React.useCallback((suffix) => {
    const pt = activePointType || resolvedDefaultType || 'mycred_default';
    const trimmed = String(pt || '').toLowerCase().replace(/^mycred_/, '');
    if (!trimmed || trimmed === 'default') return `mycred-${suffix}`;
    return `mycred_${trimmed}-${suffix}`;
  }, [activePointType, resolvedDefaultType]);

  const navigateToAdminPage = React.useCallback((suffix) => () => {
    handleQuickActionClose();
    if (typeof window === 'undefined') return;
    const base = resolveAdminBase();
    const page = resolvePageSlug(suffix);
    const url = `${base}admin.php?page=${encodeURIComponent(page)}`;
    window.open(url, '_blank', 'noopener');
  }, [resolveAdminBase, resolvePageSlug]);
  // --- End Quick Action Logics ---

  // Date Picker State
  const [dateAnchor, setDateAnchor] = React.useState(null);
  const [upgradeOpen, setUpgradeOpen] = React.useState(false);
  const openDatePopover = Boolean(dateAnchor);
  const handleDateClick = (event) => setDateAnchor(event.currentTarget);
  const handleDateClose = () => setDateAnchor(null);
  const handleOpenUpgrade = () => {
    handleDateClose();
    setUpgradeOpen(true);
  };
  const handleCloseUpgrade = () => setUpgradeOpen(false);

  const handleDateRangeApply = (label, start, end) => {
    if (!isProActive && label !== FREE_ALLOWED_DATE_RANGE) {
      handleOpenUpgrade();
      return;
    }

    // Map labels to backend values where possible
    let backendValue = label;
    if (label === 'Today') backendValue = 'today';
    if (label === 'This Week') backendValue = 'this_week';
    if (label === 'This Month') backendValue = 'this_month';

    // For custom ranges (Yesterday, Last Week, etc.), we might need to pass the explicit dates
    // depending on how the backend handles it.
    // If backend only supports specific strings, we might need a 'custom' type + date params

    if (['Yesterday', 'Last Week', 'Last Month', 'Year to date', 'Custom Range'].includes(label)) {
      backendValue = 'custom';
      setCustomStartDate(start);
      setCustomEndDate(end);
      if (onCustomRangeChange) {
        onCustomRangeChange(start, end);
      }
    }

    if (onChangeDateRange) {
      onChangeDateRange(backendValue); // Update the label/value state in parent
    }
    handleDateClose();
  };

  const [query, setQuery] = React.useState('');
  const [suggestions, setSuggestions] = React.useState([]);
  const [openSug, setOpenSug] = React.useState(false);
  const [typingLoading, setTypingLoading] = React.useState(false);
  const inputRef = React.useRef(null);
  const abortRef = React.useRef(null);

  React.useEffect(() => {
    const q = query.trim();
    if (q.length < 3) {
      setOpenSug(false);
      setSuggestions([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        setTypingLoading(true);
        const root = (window.mycredDashboardData && window.mycredDashboardData.restRoot)
          || (window.wpApiSettings && window.wpApiSettings.root)
          || '/wp-json/';
        const nonce = (window.mycredDashboardData && window.mycredDashboardData.restNonce)
          || (window.wpApiSettings && window.wpApiSettings.nonce)
          || undefined;
        const url = `${root.replace(/\/$/, '/')}mycred-dashboard/v1/search-users?search=${encodeURIComponent(q)}&per_page=6`;
        const res = await fetch(url, { headers: { ...(nonce ? { 'X-WP-Nonce': nonce } : {}) }, signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setSuggestions(Array.isArray(data) ? data : []);
        setOpenSug(true);
      } catch (err) {
        if (err.name !== 'AbortError') console.warn('Type search failed', err);
      } finally {
        setTypingLoading(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [query]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && onSearchSubmit) {
      onSearchSubmit(query.trim());
    }
  };

  return (
    <Box sx={{ width: '100%', boxSizing: 'border-box' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
          px: 0,
          pt: 0,
          pb: 2.5,
          mb: 3.5,
          borderBottom: '1px solid rgba(226, 221, 238, 0.8)',
          backgroundColor: 'transparent',
          maxWidth: '100%',
          width: '100%',
        }}
      >
        {/* Left Side: Welcome or Go Back */}
        {onBack ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <IconButton onClick={onBack} size="small" sx={{ color: '#5E2CED', p: 0 }}>
              <ArrowBackIosNewIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <Typography
              onClick={onBack}
              sx={{
                color: '#5E2CED',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 500,
                fontSize: { xs: '16px', md: '20px' },
                cursor: 'pointer',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              Go back to all users
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              alt={window.mycredDashboardData?.current_user_name || 'User'}
              src={window.mycredDashboardData?.current_user_avatar}
              sx={{
                width: 56,
                height: 56,
                bgcolor: '#F3EDFF',
                color: '#5E2CED',
                fontSize: '22px',
                fontWeight: 600,
                fontFamily: 'Poppins, sans-serif'
              }}
            >
              {(window.mycredDashboardData?.current_user_name || 'User')
                .split(' ')
                .map((n) => n[0])
                .join('')
                .substring(0, 2)
                .toUpperCase()}
            </Avatar>
            <Box>
              <Box component="div" sx={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 600,
                fontSize: '20px',
                color: '#241249',
                lineHeight: 1.2
              }}>
                Welcome, <Box component="span" sx={{ color: '#5E2CED' }}>{window.mycredDashboardData?.current_user_name || 'User'}!</Box>
              </Box>
              <Box component="div" sx={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: '14px',
                color: '#6F6F6F',
                mt: 0.5
              }}>
                Here is your loyalty program overview
              </Box>
            </Box>
          </Box>
        )}

        {/* Right Side: Filters */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>

          {/* Quick Action (Lightning) */}
          {showQuickActions && (
            <Box
              onClick={handleQuickActionClick}
              sx={{
                width: 40,
                height: 40,
                bgcolor: '#fff',
                borderRadius: '8px',
                border: '1px solid #E6E0F8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#5E2CED',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': { bgcolor: '#F3EDFF', borderColor: '#D9D0FF' }
              }}
            >
              <LightningIcon />
            </Box>
          )}
          <Menu
            anchorEl={quickActionAnchor}
            open={openQuickAction}
            onClose={handleQuickActionClose}
            PaperProps={{
              elevation: 4,
              sx: {
                mt: 1,
                borderRadius: '12px',
                minWidth: '190px',
                border: '1px solid rgba(226, 221, 238, 0.85)',
                boxShadow: '0px 8px 24px rgba(45, 21, 114, 0.1)',
                fontFamily: 'Figtree, Poppins, sans-serif',
                p: 0.5,
              }
            }}
            transformOrigin={{ horizontal: 'left', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
          >
            <MenuItem onClick={handleOpenModal('award')} sx={{ gap: 1.5, py: 1, borderRadius: '8px', '&:hover': { bgcolor: '#F8F6FF' } }}>
              <AwardIcon style={{ width: 20, height: 20 }} />
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#2D1572', fontSize: '13px', fontFamily: 'Figtree, Poppins, sans-serif' }}>Award Points</Typography>
            </MenuItem>
            <MenuItem onClick={handleOpenModal('deduct')} sx={{ gap: 1.5, py: 1, borderRadius: '8px', '&:hover': { bgcolor: '#F8F6FF' } }}>
              <DeductIcon style={{ width: 20, height: 20 }} />
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#2D1572', fontSize: '13px', fontFamily: 'Figtree, Poppins, sans-serif' }}>Deduct Points</Typography>
            </MenuItem>
            <MenuItem onClick={navigateToAdminPage('hooks')} sx={{ gap: 1.5, py: 1, borderRadius: '8px', '&:hover': { bgcolor: '#F8F6FF' } }}>
              <HooksIcon style={{ width: 20, height: 20 }} />
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#2D1572', fontSize: '13px', fontFamily: 'Figtree, Poppins, sans-serif' }}>Hooks</Typography>
            </MenuItem>
            <MenuItem onClick={navigateToAdminPage('settings')} sx={{ gap: 1.5, py: 1, borderRadius: '8px', '&:hover': { bgcolor: '#F8F6FF' } }}>
              <QuickSettingsIcon style={{ width: 20, height: 20 }} />
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#2D1572', fontSize: '13px', fontFamily: 'Figtree, Poppins, sans-serif' }}>Settings</Typography>
            </MenuItem>
          </Menu>

          {userFilterEnabled == 1 && (
            <TextField
              variant="outlined"
              size="small"
              placeholder="Search user by name"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              inputRef={inputRef}
              sx={{
                minWidth: { xs: 220, sm: 250 },
                bgcolor: '#ffffff',
                borderRadius: '8px',
                '& .MuiOutlinedInput-root': {
                  height: 40,
                  borderRadius: '8px',
                  backgroundColor: '#ffffff !important',
                  transition: 'all 0.2s ease-in-out',
                  boxShadow: 'none !important',
                  outline: 'none !important',
                  '& fieldset': {
                    borderColor: '#E6E0F8 !important',
                    borderWidth: '1px !important',
                  },
                  '&:hover fieldset': {
                    borderColor: '#C4B5F5 !important',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#5E2CED !important',
                    borderWidth: '1.5px !important',
                    boxShadow: 'none !important',
                  },
                  '& .MuiOutlinedInput-input': {
                    padding: '8px 12px 8px 4px',
                    fontSize: '13.5px',
                    color: '#2D1572',
                    fontFamily: 'Figtree, Poppins, sans-serif',
                    fontWeight: 500,
                    boxShadow: 'none !important',
                    outline: 'none !important',
                    border: 'none !important',
                    backgroundColor: 'transparent !important',
                    '&:focus': {
                      boxShadow: 'none !important',
                      outline: 'none !important',
                      borderColor: 'transparent !important',
                    }
                  }
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {loading || typingLoading ? (
                      <CircularProgress size={16} sx={{ color: '#5E2CED' }} />
                    ) : (
                      <SearchIcon sx={{ color: '#8A85A5', fontSize: 19 }} />
                    )}
                  </InputAdornment>
                ),
              }}
            />)}
          {userFilterEnabled == 1 && (
            <Popper open={openSug} anchorEl={inputRef.current} placement="bottom-start" style={{ zIndex: 1300 }}>
              <ClickAwayListener onClickAway={() => setOpenSug(false)}>
                <Paper
                  elevation={4}
                  sx={{
                    mt: 1,
                    minWidth: 280,
                    borderRadius: '14px',
                    border: '1px solid rgba(226, 221, 238, 0.85)',
                    boxShadow: '0px 12px 36px rgba(45, 21, 114, 0.12)',
                    overflow: 'hidden',
                    bgcolor: '#ffffff',
                    fontFamily: 'Figtree, Poppins, sans-serif',
                  }}
                >
                  <List dense disablePadding sx={{ py: 1 }}>
                    {suggestions.length > 0 ? (
                      suggestions.map((u) => {
                        const initial = u.name ? u.name.charAt(0).toUpperCase() : (u.handle ? u.handle.charAt(0).toUpperCase() : 'U');
                        const secondaryInitial = u.name && u.name.split(' ').length > 1 ? u.name.split(' ')[1].charAt(0).toUpperCase() : '';
                        const initials = initial + secondaryInitial;

                        return (
                          <ListItemButton
                            key={u.id}
                            onClick={() => {
                              setQuery(u.name);
                              setOpenSug(false);
                              if (onSearchSubmit) onSearchSubmit(u);
                            }}
                            sx={{
                              py: 1.2,
                              px: 1.8,
                              mx: 0.8,
                              my: 0.3,
                              borderRadius: '10px',
                              transition: 'all 0.18s ease',
                              '&:hover': {
                                bgcolor: '#F8F6FF',
                              }
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1.5 }}>
                              <Avatar
                                sx={{
                                  bgcolor: '#F3EDFF',
                                  color: '#5E2CED',
                                  width: 36,
                                  height: 36,
                                  fontSize: '13px',
                                  fontWeight: 700,
                                  fontFamily: 'Figtree, Poppins, sans-serif',
                                }}
                              >
                                {initials}
                              </Avatar>

                              <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                                <Typography sx={{ color: '#2D1572', fontWeight: 700, fontSize: '13.5px', lineHeight: 1.3, fontFamily: 'Figtree, Poppins, sans-serif' }}>
                                  {u.name}
                                </Typography>
                                {u.handle ? (
                                  <Typography sx={{ color: '#7F7CA2', fontSize: '12px', lineHeight: 1.3, fontFamily: 'Figtree, Poppins, sans-serif' }}>
                                    @{u.handle.replace(/^@/, '')}
                                  </Typography>
                                ) : null}
                              </Box>
                              <Typography sx={{ color: '#8C57FF', fontSize: '11.5px', fontWeight: 600, fontFamily: 'Figtree, Poppins, sans-serif' }}>
                                View →
                              </Typography>
                            </Box>
                          </ListItemButton>
                        );
                      })
                    ) : (
                      <ListItemButton disabled sx={{ py: 2.5 }}>
                        <Typography sx={{ color: '#7F7CA2', fontSize: 13, textAlign: 'center', width: '100%', fontFamily: 'Figtree, Poppins, sans-serif' }}>
                          No user found
                        </Typography>
                      </ListItemButton>
                    )}
                  </List>
                </Paper>
              </ClickAwayListener>
            </Popper>)}

          {/* Point Type Selector */}
          <Select
            value={effectivePointType || ''}
            onChange={onChangePointType}
            size="small"
            displayEmpty
            IconComponent={(props) => <ArrowDropDownIcon {...props} style={{ color: '#5E2CED' }} />}
            sx={{
              height: 40,
              minWidth: '120px',
              bgcolor: '#fff',
              borderRadius: '8px',
              color: '#6B57A1',
              fontWeight: 500,
              fontSize: '14px',
              // Border styling via fieldset
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#E6E0F8',
                borderWidth: '1px',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#D9D0FF',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#5E2CED',
                borderWidth: '1px',
              },
              // Remove default padding issue if present
              '& .MuiSelect-select': {
                paddingRight: '32px !important', // space for icon
              }
            }}
            MenuProps={{
              PaperProps: {
                elevation: 4,
                sx: {
                  mt: 1,
                  borderRadius: '12px',
                  bgcolor: '#fff',
                  boxShadow: '0px 4px 20px rgba(0,0,0,0.08)',
                  minWidth: '140px',
                  '& .MuiMenuItem-root': {
                    fontSize: 14,
                    fontWeight: 500,
                    color: '#241249',
                    fontFamily: 'Poppins, sans-serif',
                    py: 1,
                    '&.Mui-selected': {
                      bgcolor: '#F3EDFF',
                      color: '#5E2CED',
                      fontWeight: 600,
                      '&:hover': { bgcolor: '#F3EDFF' }
                    },
                    '&:hover': {
                      bgcolor: '#F8F6FF',
                      color: '#5E2CED'
                    }
                  }
                }
              }
            }}
          >
            {pointTypesDeriv.map((pt) => {
              const val = typeof pt === 'string' ? pt : pt.id;
              const lab = typeof pt === 'string' ? pt : pt.label;
              return <MenuItem key={val} value={val}>{lab}</MenuItem>;
            })}
          </Select>

          {/* Date Range Picker (Button Trigger) */}
          <Button
            variant="outlined"
            onClick={handleDateClick}
            sx={{
              bgcolor: '#fff',
              borderColor: '#E6E0F8',
              borderRadius: '8px',
              color: '#6B57A1',
              textTransform: 'none',
              height: '40px',
              px: 2,
              minWidth: '160px',
              justifyContent: 'space-between',
              '&:hover': {
                borderColor: '#D9D0FF',
                bgcolor: '#fff'
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarTodayIcon sx={{ fontSize: 18, color: '#6B57A1' }} />
              <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
                {(() => {
                  if (!isProActive) return FREE_ALLOWED_DATE_RANGE;
                  const isCustom = dateRange === 'Custom Range' || dateRange === 'custom';
                  if (isCustom && customStartDate && customEndDate) {
                    return `${new Date(customStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(customEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
                  }
                  const labelMap = { 'today': 'Today', 'this_week': 'This Week', 'this_month': 'This Month', 'custom': 'Custom' };
                  return labelMap[dateRange] || dateRange;
                })()}
              </Typography>
              {!isProActive && (
                <Chip
                  label="PRO"
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: '9px',
                    fontWeight: 800,
                    bgcolor: '#EDE9FE',
                    color: '#5E2CED',
                    borderRadius: '4px',
                  }}
                />
              )}
            </Box>
            <ArrowDropDownIcon sx={{ fontSize: 20, color: '#6B57A1' }} />
          </Button>
          <Popover
            open={openDatePopover}
            anchorEl={dateAnchor}
            onClose={handleDateClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            PaperProps={{
              elevation: 4,
              sx: {
                borderRadius: '16px',
                mt: 1,
                boxShadow: '0px 12px 40px rgba(45, 21, 114, 0.14)',
                border: '1px solid rgba(226, 221, 238, 0.85)',
                overflow: 'hidden',
                maxWidth: 'calc(100vw - 32px)',
              }
            }}
          >
            <DateRangePicker
              onChange={handleDateRangeApply}
              onClose={handleDateClose}
              isProActive={isProActive}
              onLockedPresetClick={handleOpenUpgrade}
              initialRange={dateRange === 'Custom Range' ? 'Custom Range' : (
                dateRange === 'today' ? 'Today' :
                  dateRange === 'this_week' ? 'This Week' :
                    dateRange === 'this_month' ? 'This Month' : 'This Month'
              )}
            />
          </Popover>
          <UpgradeDialog open={upgradeOpen} handleClose={handleCloseUpgrade} source="date-range" />

          {/* Menu Button (Settings) */}
          <Box
            onClick={() => !disableSettings && setSettingsOpen(true)}
            sx={{
              width: 40,
              height: 40,
              bgcolor: '#fff',
              borderRadius: '8px',
              border: '1px solid #EBEBEB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6B57A1',
              cursor: disableSettings ? 'default' : 'pointer',
              opacity: disableSettings ? 0.6 : 1,
              '&:hover': {
                bgcolor: disableSettings ? '#fff' : '#F3EDFF',
                borderColor: disableSettings ? '#EBEBEB' : '#D9D0FF'
              }
            }}>
            <MenuIcon />
          </Box>

        </Box>
      </Box>

      {/* Hidden/Modals */}
      <FilterModal
        anchorEl={filterAnchor}
        open={open}
        onClose={handleCloseFilters}
        pointTypes={pointTypesDeriv}
        anchorRect={filterRect}
        pointType={effectivePointType}
        onChangePointType={onChangePointType}
        dateRange={dateRange}
        onChangeDateRange={onChangeDateRange}
        customStartDate={customStartDate}
        customEndDate={customEndDate}
        onChangeCustomStartDate={e => setCustomStartDate(e.target.value)}
        onChangeCustomEndDate={e => setCustomEndDate(e.target.value)}
      />

      <DashboardSettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        visibility={visibility}
        onChangeVisibility={setVisibility}
      />

      <PointsTransferModal
        open={Boolean(modalMode)}
        mode={modalMode}
        onClose={handleCloseModal}
        pointTypes={resolvedPointTypes}
        defaultPointType={resolvedDefaultType}
        activePointType={activePointType}
        allowAll={isProActive}
        onSuccess={handleSuccess}
        onError={handleError}
      />
    </Box >
  );
};

export default FilterBar;