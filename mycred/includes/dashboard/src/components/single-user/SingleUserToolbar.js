import React from 'react';
import { Box, IconButton, TextField, InputAdornment, Typography, CircularProgress, Popper, Paper, List, ListItemButton } from '@mui/material';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { Search as SearchIcon, Settings as SettingsIcon } from '@mui/icons-material';
import FilterAltIcon from '@mui/icons-material/FilterAlt';

const SingleUserToolbar = ({ onBack, onSearchSubmit, loading, onOpenFilters, disableSettings = true, selectedUser }) => {
  const [query, setQuery] = React.useState('');
  const [suggestions, setSuggestions] = React.useState([]);
  const [openSug, setOpenSug] = React.useState(false);
  const [typingLoading, setTypingLoading] = React.useState(false);
  const inputRef = React.useRef(null);
  const abortRef = React.useRef(null);
  
  // Initialize query with selected user's name
  React.useEffect(() => {
    if (selectedUser?.name) {
      setQuery(selectedUser.name);
    }
  }, [selectedUser]);
  // Debounced suggestions (>= 3 chars)
  React.useEffect(() => {
    const q = query.trim();

    // Guard: when viewing a selected user, initializing the input with
    // that user's name should NOT trigger another search request.
    if (selectedUser?.name && q === selectedUser.name.trim()) {
      setOpenSug(false);
      setSuggestions([]);
      return;
    }

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
        const url = `${root.replace(/\/$/, '/') }mycred-dashboard/v1/search-users?search=${encodeURIComponent(q)}&per_page=6`;
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
  }, [query, selectedUser]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && onSearchSubmit) {
      onSearchSubmit(query.trim());
    }
  };

  return (
    <Box sx={{ px: { xs: 1, md: 3 }, pt: 2, pb: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <IconButton onClick={onBack} size="small" sx={{ color: '#5E2CED' }}>
            <ArrowBackIosNewIcon fontSize="small" />
          </IconButton>
          <Typography sx={{ color: '#5F2CED', fontFamily: 'Poppins, sans-serif', fontWeight: 500, fontSize: 20 }}>
            Go back to all users
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <TextField
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            variant="outlined"
            size="small"
            placeholder="Search by user name or email..."
            sx={{
              minWidth: { xs: 220, sm: 340 },
              '& .MuiOutlinedInput-root': {
                height: 40,
                borderRadius: '10px',
                backgroundColor: '#fff !important',
                '& fieldset': { borderColor: '#E6E0F8 !important', borderWidth: '1px !important' },
                '&:hover fieldset': { borderColor: '#D9D0FF !important' },
                '&.Mui-focused fieldset': { borderColor: '#5E2CED !important' },
              },
              '& .MuiOutlinedInput-input::placeholder': { color: '#B7AEE3', opacity: 1 },
              '& .MuiOutlinedInput-input': {
                padding: '10px 12px',
                background: 'transparent !important',
                border: 'none !important',
                boxShadow: 'none !important',
                outline: 'none !important',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                appearance: 'none',
              },
              '&& .MuiOutlinedInput-input': {
                border: '0 !important',
                background: 'transparent !important',
                backgroundColor: 'transparent !important',
                boxShadow: 'none !important',
                outline: 'none !important',
              },
              '& .MuiOutlinedInput-input::placeholder': {
                color: '#B7AEE3',
                opacity: 1,
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {loading || typingLoading ? (
                    <CircularProgress size={16} sx={{ color: '#B7AEE3' }} />
                  ) : (
                    <SearchIcon sx={{ color: '#B7AEE3', fontSize: 18 }} />
                  )}
                </InputAdornment>
              ),
            }}
            inputRef={inputRef}
          />

          {/* Suggestions Popper */}
          <Popper open={openSug && suggestions.length > 0} anchorEl={inputRef.current} placement="bottom-start" style={{ zIndex: 1300 }}>
            <ClickAwayListener onClickAway={() => setOpenSug(false)}>
              <Paper elevation={2} sx={{ mt: 0.5, minWidth: 280, border: '1px solid #EEE8FB' }}>
                <List dense disablePadding>
                  {suggestions.map((u) => (
                    <ListItemButton key={u.id} onClick={() => { setQuery(u.name); setOpenSug(false); if (onSearchSubmit) onSearchSubmit(u); }} sx={{ py: 1 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography sx={{ color: '#2D1572', fontWeight: 600, lineHeight: '20px' }}>{u.name}</Typography>
                        {u.handle ? <Typography sx={{ color: '#7F7CA2', fontSize: 12 }}>{u.handle}</Typography> : null}
                      </Box>
                    </ListItemButton>
                  ))}
                </List>
              </Paper>
            </ClickAwayListener>
          </Popper>

          <IconButton aria-label="filters" sx={{ width: 36, height: 36, borderRadius: '8px', color: '#B7AEE3' }} onClick={onOpenFilters}>
            <FilterAltIcon fontSize="small" />
          </IconButton>

          <IconButton aria-label="settings" sx={{ width: 36, height: 36, borderRadius: '8px', color: '#B7AEE3' }} disabled={disableSettings}>
            <SettingsIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default SingleUserToolbar;
