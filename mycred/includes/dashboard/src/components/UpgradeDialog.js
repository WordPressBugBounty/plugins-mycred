import React from 'react';
import {
  Dialog,
  DialogContent,
  Typography,
  Button,
  IconButton,
  Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { ReactComponent as MyCredDialogLogo } from '../assets/header/mycred-logo-dialog.svg';
import { ReactComponent as ProBoxBg } from '../assets/quick-actions/pro-box-bg.svg';

const fontFamily = 'Figtree, Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

const UpgradeDialog = ({ open, handleClose, source = 'sidebar' }) => {
  const isDateRangeSource = source === 'date-range';

  const headlinePrimary = isDateRangeSource
    ? 'Unlock full date range history'
    : 'Join Over 10,000+ WordPress Site Owners';

  const headlineSecondary = isDateRangeSource
    ? 'Compare weeks, months & custom periods'
    : 'to Gamify User Engagement';

  const subcopy = isDateRangeSource
    ? 'Free plan shows this month only. Upgrade to Pro for Yesterday, Last Week, Last Month, Year to date and custom ranges.'
    : 'Unlock historical reporting, premium loyalty extensions, and priority support with myCred Pro.';

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          width: '100%',
          maxWidth: '520px',
          borderRadius: '16px',
          boxShadow: '0 12px 40px rgba(45, 21, 114, 0.28)',
          backgroundColor: '#2D1572',
          position: 'relative',
          overflow: 'hidden',
          m: 2,
        },
      }}
    >
      <ProBoxBg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      <IconButton
        aria-label="close"
        onClick={handleClose}
        sx={{
          position: 'absolute',
          top: 12,
          right: 12,
          zIndex: 2,
          width: 32,
          height: 32,
          color: '#fff',
          bgcolor: 'rgba(255,255,255,0.08)',
          '&:hover': { bgcolor: 'rgba(255,255,255,0.16)' },
        }}
      >
        <CloseIcon sx={{ fontSize: 20 }} />
      </IconButton>

      <DialogContent
        sx={{
          position: 'relative',
          zIndex: 1,
          px: { xs: 3, sm: 4 },
          py: { xs: 3.5, sm: 4 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5 }}>
          <MyCredDialogLogo width={170} height={52} />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxWidth: 420 }}>
          <Typography
            sx={{
              color: '#FFC436',
              fontFamily,
              fontWeight: 700,
              fontSize: { xs: '22px', sm: '26px' },
              lineHeight: 1.25,
            }}
          >
            {headlinePrimary}
          </Typography>

          <Typography
            sx={{
              color: '#FFFFFF',
              fontFamily,
              fontWeight: 600,
              fontSize: { xs: '18px', sm: '20px' },
              lineHeight: 1.3,
            }}
          >
            {headlineSecondary}
          </Typography>
        </Box>

        <Typography
          sx={{
            color: 'rgba(255,255,255,0.82)',
            fontFamily,
            fontSize: '14px',
            lineHeight: 1.55,
            maxWidth: 400,
            mt: 0.5,
          }}
        >
          {subcopy}
        </Typography>

        <Button
          onClick={() => {
            window.open('https://mycred.me/pricing/', '_blank');
          }}
          variant="contained"
          sx={{
            mt: 1,
            minWidth: 190,
            height: 48,
            borderRadius: '45px',
            backgroundColor: '#F19C38',
            color: '#341883',
            fontWeight: 700,
            px: 4,
            fontSize: '14px',
            fontFamily,
            textTransform: 'none',
            boxShadow: '0 6px 18px rgba(241, 156, 56, 0.35)',
            '&:hover': { backgroundColor: '#FF9800' },
          }}
        >
          Get myCred Pro
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeDialog;
