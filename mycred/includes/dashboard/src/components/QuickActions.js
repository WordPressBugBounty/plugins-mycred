import React from 'react';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Button,
  Snackbar,
  Alert
} from '@mui/material';
import addRewardIcon from '../assets/quick-actions/add-reward-quick-actions.svg';
import deductIcon from '../assets/quick-actions/deduct-quick-actions..svg';
import hookIcon from '../assets/quick-actions/hook.svg';
import settingsIcon from '../assets/quick-actions/settings.svg';
import PointsTransferModal from './modal/PointsTransferModal';

const cardBase = {
  borderRadius: '8px',
  border: '1px solid #E8E2F6',
  boxShadow: 'none',
  backgroundColor: '#ffffff',
};

const ActionCard = ({
  bg,
  icon,
  buttonLabel,
  buttonStyle = 'solid', 
  buttonBg,
  buttonTextColor,
  borderColor,
  onClick,
  alt,
  sx
}) => (
  <Card sx={{
    ...cardBase,
    background: bg,
    transition: 'transform 120ms ease, box-shadow 120ms ease',
    '&:hover': { boxShadow: '0 6px 18px rgba(0,0,0,0.08)', transform: 'translateY(-1px)' },
    border: '1px solid',
    borderColor: borderColor || '#E8E2F6',
    ...sx
  }}>
    <CardActionArea onClick={onClick} sx={{ p: { xs: 2, md: 2.5 }, height: '100%' }}>
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', pt: 1 }}>
          <img src={icon} alt={alt || buttonLabel} style={{ width: 80, height: 80, objectFit: 'contain' }} />
        </Box>
        <Button
          disableElevation
          variant={buttonStyle === 'solid' ? 'contained' : 'outlined'}
          sx={{
            borderRadius: '100px',
            px: '16px',
            py: '8px',
            gap: '4px',
            mb: 0.5,
            bgcolor: buttonStyle === 'solid' ? (buttonBg || '#7C55F3') : '#ffffff',
            color: buttonStyle === 'solid' ? (buttonTextColor || '#ffffff') : '#2D1572',
            borderColor: buttonStyle === 'solid' ? 'transparent' : '#E8E2F6',
            '&:hover': {
              bgcolor: buttonStyle === 'solid' ? (buttonBg || '#6f4de0') : '#ffffff',
              borderColor: buttonStyle === 'solid' ? 'transparent' : '#DCD3F7',
            },
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 500,
            fontSize: 16,
            lineHeight: '24px',
            letterSpacing: 0,
            textAlign: 'center',
            textTransform: 'none'
          }}
        >
          {buttonLabel}
        </Button>
      </Box>
    </CardActionArea>
  </Card>
);

const QuickActions = ({
  container = true,
  pointTypes,
  defaultPointType,
  activePointType,
  onActionComplete,
  isProActive = false,
  pointTypeLabel = 'Points'
}) => {
  const [modalMode, setModalMode] = React.useState(null);
  const [feedback, setFeedback] = React.useState({ open: false, severity: 'success', message: '' });

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
    if (Array.isArray(pointTypes) && pointTypes.length) {
      return pointTypes
        .map((item) => {
          if (typeof item === 'string') {
            const map = (typeof window !== 'undefined' && window.mycredDashboardData && window.mycredDashboardData.pointTypesMap) || {};
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
    const map = (typeof window !== 'undefined' && window.mycredDashboardData && window.mycredDashboardData.pointTypesMap) || {};
    const fallback = Object.keys(map).map((slug) => ({ value: slug, label: map[slug] }));
    if (fallback.length === 0) {
      return [{ value: 'mycred_default', label: 'Standard Points' }];
    }
    return fallback;
  }, [pointTypes]);

  const resolvedDefaultType = React.useMemo(() => {
    if (defaultPointType) return defaultPointType;
    if (resolvedPointTypes.length) return resolvedPointTypes[0].value;
    return 'mycred_default';
  }, [defaultPointType, resolvedPointTypes]);

  const handleOpen = (mode) => () => setModalMode(mode);
  const handleCloseModal = () => setModalMode(null);

  const handleSuccess = React.useCallback((payload) => {
    const { mode, amount, userCount, response, appliedToAll } = payload || {};
    const allApplied = Boolean(appliedToAll || (response && response.apply_to === 'all'));
    const verb = mode === 'deduct' ? 'Deducted' : 'Awarded';
    const userSummary = allApplied
      ? 'for all customers'
      : (userCount ? `for ${userCount} user${userCount > 1 ? 's' : ''}` : '');
    const summary = `${verb} ${amount} points ${userSummary}`.trim();
    const hasFailures = response && Array.isArray(response.failed) && response.failed.length > 0;
    const message = (response && response.message) ? response.message : summary;
    setFeedback({ open: true, severity: hasFailures ? 'warning' : 'success', message });
    if (!hasFailures) {
      handleCloseModal();
    }
    if (typeof onActionComplete === 'function') {
      onActionComplete();
    }
  }, [onActionComplete]);

  const handleError = React.useCallback((message) => {
    setFeedback({ open: true, severity: 'error', message: message || 'Unable to process request.' });
  }, []);

  const snackbarClose = (_, reason) => {
    if (reason === 'clickaway') return;
    setFeedback((prev) => ({ ...prev, open: false }));
  };

  const resolvePageSlug = React.useCallback((suffix) => {
    const pt = activePointType || resolvedDefaultType || 'mycred_default';
    const normalized = String(pt || '').toLowerCase();
    const trimmed = normalized.replace(/^mycred_/, '');
    if (!trimmed || trimmed === 'default') {
      return `mycred-${suffix}`;
    }
    return `mycred_${trimmed}-${suffix}`;
  }, [activePointType, resolvedDefaultType]);

  const navigateToAdminPage = React.useCallback((suffix) => () => {
    if (typeof window === 'undefined') return;
    const base = resolveAdminBase();
    const page = resolvePageSlug(suffix);
    const url = `${base}admin.php?page=${encodeURIComponent(page)}`;
    window.open(url, '_blank', 'noopener');
  }, [resolveAdminBase, resolvePageSlug]);

  const content = (
    <Card sx={{ 
      borderRadius: '8px',
      border: '1px solid #E8E2F6',
      boxShadow: 'none',
      backgroundColor: '#F8F6FF',
      height: '100%',
      minHeight: { md: 440 }
    }}>
      <CardContent sx={{ p: 3 }}>
        <Typography
          variant="h6"
          component="h2"
          className="section-title"
          sx={{ fontWeight: 600, fontFamily: 'Vollkorn, serif', color: '#2D1572', mb: 2, fontSize: '20px' }}
        >
          Quick Actions
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(120px, 1fr))',
              md: 'repeat(2, minmax(140px, 1fr))'
            },
            gap: { xs: '16px', md: '24px' }
          }}
        >
        <ActionCard
          sx={{ minHeight: { md: 208 } }}
          bg="#F3F9EC"
          icon={addRewardIcon}
          buttonLabel={`＋  Award ${pointTypeLabel}`}
          buttonStyle="solid"
          buttonBg="#81906F"
          buttonTextColor="#ffffff"
          borderColor="#CDD6C2"
          alt={`Award ${pointTypeLabel}`}
          onClick={handleOpen('award')}
        />
        <ActionCard
          sx={{ minHeight: { md: 208 } }}
          bg="#FBF3F3"
          icon={deductIcon}
          buttonLabel={`—  Deduct ${pointTypeLabel}`}
          buttonStyle="solid"
          buttonBg="#CE6565"
          buttonTextColor="#ffffff"
          borderColor="#D6C2C2"
          alt={`Deduct ${pointTypeLabel}`}
          onClick={handleOpen('deduct')}
        />
        <ActionCard
          sx={{ minHeight: { md: 208 } }}
          bg="#FFFFFF"
          icon={hookIcon}
          buttonLabel={"Hooks"}
          buttonStyle="outline"
          borderColor="#E2DDEE"
          alt="Hooks"
          onClick={navigateToAdminPage('hooks')}
        />
        <ActionCard
          sx={{ minHeight: { md: 208 } }}
          bg="#FFFFFF"
          icon={settingsIcon}
          buttonLabel={"Settings"}
          buttonStyle="outline"
          borderColor="#E2DDEE"
          alt="Settings"
          onClick={navigateToAdminPage('settings')}
        />
      </Box>
      </CardContent>
    </Card>
  );

  const body = container ? (
    <Box sx={{ px: { xs: 1, md: 3 }, mt: 4 }}>
      {content}
    </Box>
  ) : content;

  return (
    <>
      {body}
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
      <Snackbar
        open={feedback.open}
        autoHideDuration={5000}
        onClose={snackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={snackbarClose} severity={feedback.severity} sx={{ width: '100%' }}>
          {feedback.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default QuickActions;
