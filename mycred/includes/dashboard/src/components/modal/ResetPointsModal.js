import React from 'react';
import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

const getRestInfo = () => {
  const root = (window.mycredDashboardData && window.mycredDashboardData.restRoot)
    || (window.wpApiSettings && window.wpApiSettings.root)
    || '/wp-json/';
  const nonce = (window.mycredDashboardData && window.mycredDashboardData.restNonce)
    || (window.wpApiSettings && window.wpApiSettings.nonce)
    || undefined;
  return { root: String(root || '').replace(/\/+$/, ''), nonce };
};

const ResetPointsModal = ({
  open,
  onClose,
  user,
  pointType = '',
  pointTypeLabel = 'Points',
  onSuccess,
  onError,
}) => {
  const [submitting, setSubmitting] = React.useState(false);

  const handleReset = async () => {
    if (!user || !user.id) {
      if (typeof onError === 'function') {
        onError('User information is missing.');
      }
      return;
    }

    const { root, nonce } = getRestInfo();
    const url = `${root}/mycred-dashboard/v1/points/reset`;
    const headers = {
      'Content-Type': 'application/json',
      ...(nonce ? { 'X-WP-Nonce': nonce } : {}),
    };

    const payload = {
      user_id: Number(user.id),
    };

    if (pointType) {
      payload.point_type = pointType;
    }

    setSubmitting(true);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let message = 'Unable to reset points balance.';
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
          user,
          pointType,
          response: data,
        });
      }
      onClose();
    } catch (err) {
      if (typeof onError === 'function') {
        onError(err.message || 'Unable to reset points balance.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const userName = user?.name || user?.display_name || user?.user_login || 'this user';

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
            Reset {pointTypeLabel} Balance
          </Typography>
          <IconButton onClick={onClose} aria-label="close" disabled={submitting}>
            <CloseIcon sx={{ color: '#7F7CA2' }} />
          </IconButton>
        </Box>

        <Box>
          <Typography sx={{ color: '#7F7CA2', fontSize: 14, lineHeight: 1.6, mb: 1 }}>
            Are you sure you want to reset {userName}'s {pointTypeLabel.toLowerCase()} balance?
          </Typography>
          <Typography sx={{ color: '#7F7CA2', fontSize: 14, lineHeight: 1.6 }}>
            This action cannot be undone.
          </Typography>
        </Box>

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
          <Button
            variant="contained"
            onClick={handleReset}
            fullWidth
            disabled={submitting}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              height: 44,
              backgroundColor: '#CE6565',
              '&:hover': {
                backgroundColor: '#B85555',
              },
            }}
          >
            {submitting ? (
              <CircularProgress size={20} sx={{ color: '#fff' }} />
            ) : (
              'Reset Balance'
            )}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

export default ResetPointsModal;

