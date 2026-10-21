import React from 'react';
import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';

const getRestInfo = () => {
  const root = (window.mycredDashboardData && window.mycredDashboardData.restRoot)
    || (window.wpApiSettings && window.wpApiSettings.root)
    || '/wp-json/';
  const nonce = (window.mycredDashboardData && window.mycredDashboardData.restNonce)
    || (window.wpApiSettings && window.wpApiSettings.nonce)
    || undefined;
  return { root: String(root || '').replace(/\/+$/, ''), nonce };
};

const getMessages = (mode, label = 'Points') => {
  const lowerLabel = label.toLowerCase();
  return {
    award: {
      title: `Award ${label} to User`,
      description: `Select a point type, users, and specify the number of ${lowerLabel} to award.`,
      actionLabel: `Award ${label}`,
      buttonColor: '#7C55F3'
    },
    deduct: {
      title: `Deduct ${label} from User`,
      description: `Select a point type, users, and specify the number of ${lowerLabel} to deduct.`,
      actionLabel: `Deduct ${label}`,
      buttonColor: '#CE6565'
    }
  }[mode] || {
    title: `Award ${label} to User`,
    description: `Select a point type, users, and specify the number of ${lowerLabel} to award.`,
    actionLabel: `Award ${label}`,
    buttonColor: '#7C55F3'
  };
};

const normalizeUser = (candidate) => {
  if (!candidate || typeof candidate !== 'object') return null;

  let id = candidate.id;
  if (id !== 'all') {
    id = id ? Number(id) : 0;
    if (!id) return null;
  }

  const name = candidate.name || candidate.display_name || candidate.user_login || String(id);
  const baseHandle = candidate.handle || candidate.user_nicename || '';
  const handle = baseHandle ? (baseHandle.startsWith('@') ? baseHandle : `@${baseHandle}`) : null;
  return {
    ...candidate,
    id,
    name,
    handle,
  };
};

const ALL_USERS_OPTION = {
  id: 'all',
  name: 'All Users',
  handle: '@all',
};

const inputRootStyles = {
  borderRadius: '10px',
  backgroundColor: '#fff',
  transition: 'border-color 120ms ease, box-shadow 120ms ease',
  '& fieldset': {
    borderColor: '#E6E0F8',
    borderWidth: '1px',
  },
  '&:hover fieldset': {
    borderColor: '#D9D0FF',
  },
  '&.Mui-focused fieldset': {
    borderColor: '#5E2CED',
    borderWidth: '1px',
  },
  '&.Mui-focused': {
    boxShadow: 'none',
  },
};

const inputTextStyles = {
  color: '#2D1572',
};

const helperTextStyles = {
  marginLeft: 0,
  marginRight: 0,
};

const PointsTransferModal = ({
  open,
  mode,
  onClose,
  pointTypes = [],
  defaultPointType,
  activePointType,
  onSuccess,
  onError,
  allowAll = false,
  preselectedUser = null
}) => {
  const effectiveMode = mode === 'deduct' ? 'deduct' : 'award';
  const [selectedPointType, setSelectedPointType] = React.useState(defaultPointType || '');
  const [selectedUsers, setSelectedUsers] = React.useState(preselectedUser ? [preselectedUser] : []);
  const [userInput, setUserInput] = React.useState('');
  const [userOptions, setUserOptions] = React.useState([]);
  const [loadingUsers, setLoadingUsers] = React.useState(false);
  const [amount, setAmount] = React.useState('');
  const [errors, setErrors] = React.useState({});
  const [submitting, setSubmitting] = React.useState(false);
  const [logEntry, setLogEntry] = React.useState('');
  const abortRef = React.useRef(null);

  const resolvedPointTypes = React.useMemo(() => {
    if (Array.isArray(pointTypes) && pointTypes.length) {
      return pointTypes
        .map((item) => {
          if (typeof item === 'string') {
            const map = (window.mycredDashboardData && window.mycredDashboardData.pointTypesMap) || {};
            const label = map[item] || item;
            return { value: item, label };
          }
          if (item && typeof item === 'object') {
            const value = item.value || item.id || item.slug || '';
            const label = item.label || item.name || item.title || value;
            if (!value) return null;
            return { value, label };
          }
          return null;
        })
        .filter(Boolean);
    }
    const map = (window.mycredDashboardData && window.mycredDashboardData.pointTypesMap) || {};
    const fallback = Object.keys(map).map((slug) => ({ value: slug, label: map[slug] }));
    if (!fallback.length) {
      return [{ value: 'mycred_default', label: 'Standard Points' }];
    }
    return fallback;
  }, [pointTypes]);

  const currentPointTypeLabel = React.useMemo(() => {
    if (!selectedPointType) return 'Points';
    const found = resolvedPointTypes.find(pt => pt.value === selectedPointType);
    return found ? found.label : 'Points';
  }, [selectedPointType, resolvedPointTypes]);

  const copy = React.useMemo(() => getMessages(effectiveMode, currentPointTypeLabel), [effectiveMode, currentPointTypeLabel]);

  const resetState = React.useCallback(() => {
    const initialType = activePointType || defaultPointType || (resolvedPointTypes[0] ? resolvedPointTypes[0].value : '');
    setSelectedPointType(initialType || '');
    setSelectedUsers(preselectedUser ? [preselectedUser] : []);
    setUserInput('');
    setUserOptions(preselectedUser ? [preselectedUser] : []);
    setAmount('');
    setErrors({});
    setSubmitting(false);
    setLogEntry('');
  }, [activePointType, defaultPointType, resolvedPointTypes, preselectedUser]);

  React.useEffect(() => {
    if (open) {
      resetState();
    } else if (abortRef.current) {
      abortRef.current.abort();
    }
  }, [open, resetState]);

  // Update point type if it becomes available after modal opens
  React.useEffect(() => {
    if (open && resolvedPointTypes.length > 0 && !selectedPointType) {
      const initialType = activePointType || defaultPointType || (resolvedPointTypes[0] ? resolvedPointTypes[0].value : '');
      if (initialType) {
        setSelectedPointType(initialType);
      }
    }
  }, [open, resolvedPointTypes, activePointType, defaultPointType, selectedPointType]);

  React.useEffect(() => () => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
  }, []);

  const mergeOptions = React.useCallback((nextOptions) => {
    const combined = new Map();
    selectedUsers.forEach((user) => {
      if (!user || typeof user !== 'object') return;
      combined.set(user.id, user);
    });
    nextOptions.forEach((raw) => {
      const normalized = normalizeUser(raw);
      if (!normalized) return;
      combined.set(normalized.id, normalized);
    });
    setUserOptions(Array.from(combined.values()));
  }, [selectedUsers]);

  React.useEffect(() => {
    if (!open) return;
    const query = userInput.trim();
    if (allowAll) {
      const lower = query.toLowerCase();
      if (lower === '@all' || lower === 'all') {
        const hasAll = userOptions.some(opt => opt.id === ALL_USERS_OPTION.id);
        if (!hasAll) {
          setUserOptions([ALL_USERS_OPTION]);
        }
        setLoadingUsers(false);
        return;
      }
    }
    if (query.length < 2) {
      mergeOptions([]);
      if (abortRef.current) abortRef.current.abort();
      setLoadingUsers(false);
      return;
    }
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;
    const { root, nonce } = getRestInfo();
    const url = `${root}/mycred-dashboard/v1/search-users?search=${encodeURIComponent(query)}&per_page=8`;
    const headers = nonce ? { 'X-WP-Nonce': nonce } : {};
    setLoadingUsers(true);
    fetch(url, { headers, signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) {
          const message = `HTTP ${res.status}`;
          throw new Error(message);
        }
        const data = await res.json();
        const list = Array.isArray(data) ? data.map(normalizeUser).filter(Boolean) : [];
        mergeOptions(list);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        mergeOptions([]);
        if (typeof onError === 'function') {
          onError('Unable to fetch users.');
        }
      })
      .finally(() => {
        setLoadingUsers(false);
      });
  }, [userInput, open, mergeOptions, onError]);

  React.useEffect(() => {
    mergeOptions([]);
  }, [selectedUsers, mergeOptions]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    const positiveAmount = parseFloat(amount);
    if (!selectedPointType) {
      nextErrors.pointType = 'Select a point type.';
    }
    if (!selectedUsers.length) {
      nextErrors.users = 'Select at least one user.';
    }
    if (!Number.isFinite(positiveAmount) || positiveAmount <= 0) {
      nextErrors.amount = 'Enter a value greater than zero.';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      return;
    }

    const hasAllUsers = allowAll && selectedUsers.some((user) => user.id === ALL_USERS_OPTION.id);
    const trimmedLogEntry = logEntry.trim();

    const payload = {
      point_type: selectedPointType,
      amount: positiveAmount,
    };

    if (hasAllUsers) {
      payload.apply_to = 'all';
    } else {
      const ids = selectedUsers
        .map((user) => Number(user.id))
        .filter((id) => Number.isFinite(id) && id > 0);
      if (!ids.length) {
        setErrors((prev) => ({ ...prev, users: 'Select at least one user.' }));
        return;
      }
      payload.user_ids = ids;
    }

    if (trimmedLogEntry) {
      payload.message = trimmedLogEntry;
    }

    const { root, nonce } = getRestInfo();
    const url = `${root}/mycred-dashboard/v1/points/${effectiveMode === 'deduct' ? 'deduct' : 'award'}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(nonce ? { 'X-WP-Nonce': nonce } : {}),
    };

    setSubmitting(true);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        let message = 'Unable to process request.';
        try {
          const errorBody = await res.json();
          if (errorBody && errorBody.message) {
            message = errorBody.message;
          }
        } catch (err) {
          message = res.statusText || message;
        }
        throw new Error(message);
      }
      const data = await res.json();
      if (typeof onSuccess === 'function') {
        onSuccess({
          mode: effectiveMode,
          amount: positiveAmount,
          userCount: hasAllUsers ? null : selectedUsers.length,
          appliedToAll: hasAllUsers,
          response: data,
        });
      }
    } catch (err) {
      if (typeof onError === 'function') {
        onError(err.message || 'Unable to process request.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const primaryColor = copy.buttonColor;

  return (
    <Dialog
      open={Boolean(open && mode)}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: { xs: 2.5, sm: 4 },
          width: '100%',
          backgroundColor: '#ffffff',
          zIndex: 1400,
          position: 'relative',
        },
      }}
      slotProps={{ backdrop: { sx: { backgroundColor: 'rgba(12, 8, 32, 0.5)' } } }}
      disableScrollLock
    >
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography sx={{ color: '#2D1572', fontSize: 24, fontWeight: 600 }}>{copy.title}</Typography>
            <Typography sx={{ color: '#7F7CA2', mt: 1, fontSize: 14, lineHeight: 1.5 }}>{copy.description}</Typography>
          </Box>
          <IconButton onClick={onClose} aria-label="close">
            <CloseIcon sx={{ color: '#7F7CA2' }} />
          </IconButton>
        </Box>

        <FormControl fullWidth size="small">
          <Typography sx={{ mb: 1, color: '#2D1572', fontWeight: 600, fontSize: 14 }}>Point Type</Typography>
          <Select
            value={selectedPointType}
            onChange={(event) => {
              setSelectedPointType(event.target.value);
              setErrors((prev) => ({ ...prev, pointType: undefined }));
            }}
            sx={{ borderRadius: '10px', backgroundColor: '#F8F6FF' }}
            error={Boolean(errors.pointType)}
          >
            <MenuItem value="" disabled>Select point type</MenuItem>
            {resolvedPointTypes.map((option) => (
              <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
            ))}
          </Select>
          {errors.pointType ? (
            <Typography sx={{ color: '#d32f2f', fontSize: 12, mt: 0.5 }}>{errors.pointType}</Typography>
          ) : null}
        </FormControl>

        <Box>
          <Typography sx={{ mb: 1, color: '#2D1572', fontWeight: 600, fontSize: 14 }}>Users</Typography>
          {preselectedUser ? (
            <TextField
              value={preselectedUser.name || preselectedUser.email || preselectedUser.handle || ''}
              size="small"
              fullWidth
              inputProps={{ readOnly: true, 'aria-readonly': true }}
              sx={{
                minWidth: { xs: 220, sm: 340 },
                '& .MuiOutlinedInput-root': {
                  minHeight: 40,
                  borderRadius: '10px',
                  backgroundColor: '#F8F6FF',
                  '& fieldset': {
                    borderColor: '#E6E0F8',
                    borderWidth: '1px',
                  },
                  '&:hover fieldset': {
                    borderColor: '#D9D0FF',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#5E2CED',
                  },
                },
                '& .MuiOutlinedInput-input': {
                  padding: '10px 12px',
                  background: 'transparent',
                  border: 'none',
                  boxShadow: 'none',
                  outline: 'none',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  appearance: 'none',
                },
                '& .MuiOutlinedInput-input::placeholder': {
                  color: '#B7AEE3',
                  opacity: 1,
                },
                // Keep default pointer events so the field doesn't interfere with sibling inputs
              }}
            />
          ) : (
            <Autocomplete
              multiple
              value={selectedUsers}
              options={userOptions}
              loading={loadingUsers}
              filterOptions={(options) => options}
              getOptionLabel={(option) => option?.name || String(option?.id || '')}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              onChange={(_, value) => {
                let normalized = value.map(normalizeUser).filter(Boolean);
                if (allowAll) {
                  const hasAll = normalized.some((user) => user.id === ALL_USERS_OPTION.id);
                  if (hasAll) {
                    normalized = [ALL_USERS_OPTION];
                  }
                }
                setSelectedUsers(normalized);
                setErrors((prev) => ({ ...prev, users: undefined }));
              }}
              inputValue={userInput}
              onInputChange={(_, value, reason) => {
                if (reason === 'reset') return;
                if (allowAll && selectedUsers.some((user) => user.id === ALL_USERS_OPTION.id)) {
                  setUserInput('');
                  return;
                }
                setUserInput(value);
              }}
              noOptionsText={allowAll ? "Type '@all' to include everyone" : (userInput.trim().length < 2 ? 'Type at least 2 characters' : 'No users found')}
              renderTags={(value, getTagProps) => value.map((option, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={option.id}
                  label={option.id === ALL_USERS_OPTION.id ? 'All Users' : option.name}
                  size="small"
                  sx={{ borderRadius: '8px', backgroundColor: '#EEE8FB', color: '#2D1572' }}
                />
              ))}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Search by name or email..."
                  size="small"
                  error={Boolean(errors.users)}
                  helperText={errors.users}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <InputAdornment position="end" sx={{ pr: 1 }}>
                        {loadingUsers ? (
                          <CircularProgress size={16} sx={{ color: '#B7AEE3' }} />
                        ) : (
                          <SearchIcon sx={{ color: '#B7AEE3' }} />
                        )}
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    minWidth: { xs: 220, sm: 340 },
                    '& .MuiOutlinedInput-root': {
                      minHeight: 40,
                      borderRadius: '10px',
                      backgroundColor: '#fff !important',
                      p: '4px 8px', // Add some padding for chips
                      '& fieldset': {
                        borderColor: '#E6E0F8 !important',
                        borderWidth: '1px !important',
                      },
                      '&:hover fieldset': {
                        borderColor: '#D9D0FF !important',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#5E2CED !important',
                      },
                    },
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
                />
              )}
              renderOption={(props, option) => (
                <Box
                  component="li"
                  {...props}
                  sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', py: 1 }}
                >
                  <Typography sx={{ fontWeight: 600, color: '#2D1572' }}>{option.id === ALL_USERS_OPTION.id ? 'All Users' : option.name}</Typography>
                  {(option.id === ALL_USERS_OPTION.id ? option.handle : (option.handle || option.email)) ? (
                    <Typography sx={{ color: '#7F7CA2', fontSize: 12 }}>
                      {option.id === ALL_USERS_OPTION.id ? option.handle : (option.handle || option.email)}
                    </Typography>
                  ) : null}
                </Box>
              )}
            />
          )}
        </Box>

        <Box>
          <Typography sx={{ mb: 1, color: '#2D1572', fontWeight: 600, fontSize: 14 }}>{currentPointTypeLabel} Amount</Typography>
          <TextField
            type="number"
            value={amount}
            onChange={(event) => {
              setAmount(event.target.value);
              setErrors((prev) => ({ ...prev, amount: undefined }));
            }}
            placeholder={`Enter ${currentPointTypeLabel.toLowerCase()} amount`}
            size="small"
            error={Boolean(errors.amount)}
            helperText={errors.amount}
            inputProps={{ min: 0, step: '0.01' }}
            sx={{
              width: '100%',
              '& .MuiOutlinedInput-root': {
                ...inputRootStyles,
                minHeight: 44,
              },
              '& .MuiOutlinedInput-input': { ...inputTextStyles, outline: 'none' },
              '& .MuiFormHelperText-root': helperTextStyles,
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
              // debug hooks
              cursor: 'text',
            }}
          />
        </Box>

        <Box>
          <Typography sx={{ mb: 1, color: '#2D1572', fontWeight: 600, fontSize: 14 }}>Log Entry</Typography>
          <TextField
            value={logEntry}
            onChange={(event) => setLogEntry(event.target.value)}
            placeholder="%plural% for completing a task. Use template tags."
            size="small"
            multiline
            minRows={2}
            InputProps={{ sx: { alignItems: 'flex-start' } }}
            sx={{
              width: '100%',
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                backgroundColor: '#fff',
                minHeight: 64,
                alignItems: 'flex-start',
                transition: 'border-color 120ms ease, box-shadow 120ms ease',
                '& fieldset': {
                  borderColor: '#E6E0F8',
                  borderWidth: '1px',
                },
                '&:hover fieldset': {
                  borderColor: '#D9D0FF',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#5E2CED',
                  borderWidth: '1px',
                },
                '&.Mui-focused': {
                  boxShadow: 'none',
                },
                py: 0,
              },
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
          />
          <Typography
            sx={{
              mb: 1,
              color: '#2D1572',
              fontWeight: 500,
              fontSize: 12
            }}>
            Log Available Template Tags:
            <a href="https://codex.mycred.me/category/template-tags/temp-general/" target="_blank"
              style={{
                color: '#5f2ced',
                fontSize: 12,
                textDecoration: 'none',
              }}>
              General
            </a>
          </Typography>

        </Box>

        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
          <Button
            variant="outlined"
            onClick={onClose}
            fullWidth
            sx={{ borderRadius: '10px', textTransform: 'none', height: 44 }}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={submitting}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              height: 44,
              backgroundColor: primaryColor,
              '&:hover': { backgroundColor: primaryColor },
            }}
          >
            {submitting ? 'Processing...' : copy.actionLabel}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

export default PointsTransferModal;
