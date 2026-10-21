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
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';

const getRestInfo = () => {
  const root = (window.mycredDashboardData && window.mycredDashboardData.restRoot)
    || (window.wpApiSettings && window.wpApiSettings.root)
    || '/wp-json/';
  const nonce = (window.mycredDashboardData && window.mycredDashboardData.restNonce)
    || (window.wpApiSettings && window.wpApiSettings.nonce)
    || undefined;
  return { root: String(root || '').replace(/\/+$/, ''), nonce };
};

const BadgeRankModal = ({
  open,
  mode = 'award', // 'award' or 'remove'
  onClose,
  user = null,
  badges = [],
  ranks = [],
  isBadgesActive = false,
  isRanksActive = false,
  activePointType = '',
  onSuccess,
  onError,
}) => {
  // Get user's earned badges and rank
  const earnedBadgeIds = React.useMemo(() => {
    if (!user || !user.earned_badges || !Array.isArray(user.earned_badges)) {
      return [];
    }
    return user.earned_badges.map(b => Number(b.id));
  }, [user]);

  const earnedRankId = React.useMemo(() => {
    if (!user || !user.earned_rank || !user.earned_rank.id) {
      return null;
    }
    return Number(user.earned_rank.id);
  }, [user]);

  // Filter badges based on mode
  const availableBadges = React.useMemo(() => {
    if (mode === 'remove') {
      // Show only earned badges
      return badges.filter(badge => {
        const badgeId = Number(badge.id || badge.ID);
        return earnedBadgeIds.includes(badgeId);
      });
    }
    // Award mode: show all badges
    return badges;
  }, [badges, mode, earnedBadgeIds]);

  // Filter ranks based on mode and active point type
  const availableRanks = React.useMemo(() => {
    // First filter by point type
    let filteredRanks = ranks;
    if (activePointType) {
      filteredRanks = ranks.filter(rank => rank.ctype === activePointType);
    }

    if (mode === 'remove') {
      // Show only earned rank (that matches point type)
      return filteredRanks.filter(rank => {
        const rankId = Number(rank.id || rank.ID);
        return rankId === earnedRankId;
      });
    }
    // Award mode: show all ranks for the selected point type
    return filteredRanks;
  }, [ranks, mode, earnedRankId, activePointType]);

  const [awardType, setAwardType] = React.useState('badge');
  const [selectedBadge, setSelectedBadge] = React.useState('');
  const [selectedRank, setSelectedRank] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState({});

  // Determine available options based on active addons and available items
  const canAwardBadge = isBadgesActive && availableBadges.length > 0;
  const canAwardRank = isRanksActive && availableRanks.length > 0;
  const canAwardBoth = canAwardBadge && canAwardRank;

  // Reset state when modal opens
  React.useEffect(() => {
    if (open) {
      // Set default award type based on what's available
      if (canAwardBadge && !canAwardRank) {
        setAwardType('badge');
      } else if (canAwardRank && !canAwardBadge) {
        setAwardType('rank');
      } else if (canAwardBoth) {
        setAwardType('badge');
      }
      setSelectedBadge('');
      setSelectedRank('');
      setErrors({});
      setSubmitting(false);
    }
  }, [open, canAwardBadge, canAwardRank, canAwardBoth]);

  const handleSubmit = async () => {
    const nextErrors = {};

    if (awardType === 'badge' || awardType === 'both') {
      if (!selectedBadge) {
        nextErrors.badge = 'Please select a badge.';
      }
    }

    if (awardType === 'rank' || awardType === 'both') {
      if (!selectedRank) {
        nextErrors.rank = 'Please select a rank.';
      }
    }

    if (!user || !user.id) {
      nextErrors.user = 'User is required.';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      return;
    }

    const { root, nonce } = getRestInfo();
    const url = `${root}/mycred-dashboard/v1/${mode === 'remove' ? 'remove' : 'award'}-badge-rank`;
    const headers = {
      'Content-Type': 'application/json',
      ...(nonce ? { 'X-WP-Nonce': nonce } : {}),
    };

    const payload = {
      user_id: Number(user.id),
      award_type: awardType,
    };

    if (awardType === 'badge' || awardType === 'both') {
      payload.badge_id = selectedBadge;
    }

    if (awardType === 'rank' || awardType === 'both') {
      payload.rank_id = selectedRank;
    }

    setSubmitting(true);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let message = `Unable to ${mode} badge/rank.`;
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
          mode,
          awardType,
          badge: awardType === 'badge' || awardType === 'both' ? selectedBadge : null,
          rank: awardType === 'rank' || awardType === 'both' ? selectedRank : null,
          response: data,
        });
      }
      onClose();
    } catch (err) {
      if (typeof onError === 'function') {
        onError(err.message || `Unable to ${mode} badge/rank.`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const title = mode === 'remove' ? 'Remove Badge / Rank' : 'Award Badge / Rank';
  const actionLabel = mode === 'remove' ? 'Remove' : 'Award';
  const actionColor = mode === 'remove' ? '#CE6565' : '#5E2CED';
  const userName = user?.name || user?.display_name || user?.user_login || '';

  // Show message when no items available (addons inactive or no badges/ranks created)
  const getNoItemsMessage = () => {
    if (!isBadgesActive && !isRanksActive) {
      return 'Please enable Badges or Ranks addon to continue.';
    }
    if (mode === 'award') {
      if (isBadgesActive && !isRanksActive && badges.length === 0) {
        return 'No badges available. Please create badges first.';
      }
      if (isRanksActive && !isBadgesActive && ranks.length === 0) {
        return 'No ranks available. Please create ranks first.';
      }
      if (isBadgesActive && isRanksActive && badges.length === 0 && ranks.length === 0) {
        return 'No badges or ranks available. Please create them first.';
      }
    } else {
      // Remove mode
      if (!canAwardBadge && !canAwardRank) {
        return 'User has no badges or ranks to remove.';
      }
    }
    return null;
  };

  const noItemsMessage = getNoItemsMessage();

  return (
    <Dialog
      open={Boolean(open)}
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
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography sx={{ color: '#2D1572', fontSize: 24, fontWeight: 600 }}>
            {title}
          </Typography>
          <IconButton onClick={onClose} aria-label="close" disabled={submitting}>
            <CloseIcon sx={{ color: '#7F7CA2' }} />
          </IconButton>
        </Box>

        {/* User Field */}
        <Box>
          <Typography sx={{ mb: 1, color: '#2D1572', fontWeight: 600, fontSize: 14 }}>User</Typography>
          <TextField
            value={userName}
            size="small"
            fullWidth
            inputProps={{ readOnly: true, 'aria-readonly': true }}
            sx={{
              '& .MuiOutlinedInput-root': {
                height: 40,
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
        </Box>

        {/* Show message when no items available */}
        {noItemsMessage ? (
          <Box sx={{
            p: 3,
            backgroundColor: '#F8F6FF',
            borderRadius: '10px',
            border: '1px solid #E6E0F8',
            textAlign: 'center'
          }}>
            <Typography sx={{ color: '#756C8C', fontSize: 14 }}>
              {noItemsMessage}
            </Typography>
          </Box>
        ) : (
          <>
            {/* Award Type Selection */}
            <Box>
              <FormLabel sx={{ mb: 1, color: '#2D1572', fontWeight: 600, fontSize: 14, display: 'block' }}>
                What do you want to {mode === 'remove' ? 'remove' : 'award'}?
              </FormLabel>
              <FormControl component="fieldset">
                <RadioGroup
                  value={awardType}
                  onChange={(e) => {
                    setAwardType(e.target.value);
                    setErrors((prev) => ({ ...prev, badge: undefined, rank: undefined }));
                  }}
                  sx={{ gap: 0.5 }}
                >
                  {canAwardBadge && (
                    <FormControlLabel
                      value="badge"
                      control={
                        <Radio
                          sx={{
                            color: '#5E2CED',
                            '&.Mui-checked': {
                              color: '#5E2CED',
                            },
                          }}
                        />
                      }
                      label="Badge"
                      sx={{ color: '#2D1572' }}
                    />
                  )}
                  {canAwardRank && (
                    <FormControlLabel
                      value="rank"
                      control={
                        <Radio
                          sx={{
                            color: '#5E2CED',
                            '&.Mui-checked': {
                              color: '#5E2CED',
                            },
                          }}
                        />
                      }
                      label="Rank"
                      sx={{ color: '#2D1572' }}
                    />
                  )}
                  {canAwardBoth && (
                    <FormControlLabel
                      value="both"
                      control={
                        <Radio
                          sx={{
                            color: '#5E2CED',
                            '&.Mui-checked': {
                              color: '#5E2CED',
                            },
                          }}
                        />
                      }
                      label="Both"
                      sx={{ color: '#2D1572' }}
                    />
                  )}
                </RadioGroup>
              </FormControl>
            </Box>

            {/* Badge Selection */}
            {(awardType === 'badge' || awardType === 'both') && canAwardBadge && (
              <Box>
                <Typography sx={{ mb: 1, color: '#2D1572', fontWeight: 600, fontSize: 14 }}>Select Badge</Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={selectedBadge}
                    onChange={(e) => {
                      setSelectedBadge(e.target.value);
                      setErrors((prev) => ({ ...prev, badge: undefined }));
                    }}
                    displayEmpty
                    sx={{
                      borderRadius: '10px',
                      backgroundColor: '#F8F6FF',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: errors.badge ? '#CE6565' : '#E6E0F8',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: errors.badge ? '#CE6565' : '#D9D0FF',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: errors.badge ? '#CE6565' : '#5E2CED',
                      },
                    }}
                    error={Boolean(errors.badge)}
                  >
                    <MenuItem value="" disabled>
                      Choose a badge to {mode === 'remove' ? 'remove' : 'award'}
                    </MenuItem>
                    {availableBadges.map((badge) => {
                      const badgeId = Number(badge.id || badge.ID);
                      const isEarned = earnedBadgeIds.includes(badgeId);
                      const badgeTitle = badge.title || badge.name || badge.post_title || `Badge #${badgeId}`;
                      return (
                        <MenuItem
                          key={badgeId}
                          value={badgeId}
                          disabled={mode === 'award' && isEarned}
                          sx={{
                            ...(mode === 'award' && isEarned && {
                              opacity: 0.5,
                              cursor: 'not-allowed',
                              '&:hover': {
                                backgroundColor: 'transparent',
                              }
                            })
                          }}
                        >
                          {badgeTitle}{mode === 'award' && isEarned ? ' (Already Earned)' : ''}
                        </MenuItem>
                      );
                    })}
                  </Select>
                  {errors.badge && (
                    <Typography sx={{ color: '#d32f2f', fontSize: 12, mt: 0.5 }}>{errors.badge}</Typography>
                  )}
                </FormControl>
              </Box>
            )}

            {/* Rank Selection */}
            {(awardType === 'rank' || awardType === 'both') && canAwardRank && (
              <Box>
                <Typography sx={{ mb: 1, color: '#2D1572', fontWeight: 600, fontSize: 14 }}>Select Rank</Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={selectedRank}
                    onChange={(e) => {
                      setSelectedRank(e.target.value);
                      setErrors((prev) => ({ ...prev, rank: undefined }));
                    }}
                    displayEmpty
                    sx={{
                      borderRadius: '10px',
                      backgroundColor: '#F8F6FF',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: errors.rank ? '#CE6565' : '#E6E0F8',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: errors.rank ? '#CE6565' : '#D9D0FF',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: errors.rank ? '#CE6565' : '#5E2CED',
                      },
                    }}
                    error={Boolean(errors.rank)}
                  >
                    <MenuItem value="" disabled>
                      Choose a rank to {mode === 'remove' ? 'remove' : 'award'}
                    </MenuItem>
                    {availableRanks.map((rank) => {
                      const rankId = Number(rank.id || rank.ID);
                      const isEarned = rankId === earnedRankId;
                      const rankTitle = rank.title || rank.name || rank.post_title || `Rank #${rankId}`;
                      return (
                        <MenuItem
                          key={rankId}
                          value={rankId}
                          disabled={mode === 'award' && isEarned}
                          sx={{
                            ...(mode === 'award' && isEarned && {
                              opacity: 0.5,
                              cursor: 'not-allowed',
                              '&:hover': {
                                backgroundColor: 'transparent',
                              }
                            })
                          }}
                        >
                          {rankTitle}{mode === 'award' && isEarned ? ' (Already Earned)' : ''}
                        </MenuItem>
                      );
                    })}
                  </Select>
                  {errors.rank && (
                    <Typography sx={{ color: '#d32f2f', fontSize: 12, mt: 0.5 }}>{errors.rank}</Typography>
                  )}
                </FormControl>
              </Box>
            )}
          </>
        )}

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
          <Button
            variant="outlined"
            onClick={onClose}
            fullWidth
            disabled={submitting}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              height: 44,
              borderColor: '#5E2CED',
              color: '#5E2CED',
              '&:hover': {
                borderColor: '#5E2CED',
                backgroundColor: 'rgba(94, 44, 237, 0.04)',
              },
            }}
          >
            Cancel
          </Button>
          {!noItemsMessage && (
            <Button
              variant="contained"
              onClick={handleSubmit}
              fullWidth
              disabled={submitting}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                height: 44,
                backgroundColor: actionColor,
                '&:hover': {
                  backgroundColor: mode === 'remove' ? '#B85555' : '#4E1FCC',
                },
              }}
            >
              {submitting ? (
                <CircularProgress size={20} sx={{ color: '#fff' }} />
              ) : (
                actionLabel
              )}
            </Button>
          )}
        </Box>
      </Box>
    </Dialog>
  );
};

export default BadgeRankModal;

