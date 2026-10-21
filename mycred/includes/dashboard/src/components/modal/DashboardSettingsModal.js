import { Drawer, Box, Typography, IconButton } from '@mui/material';
import Switch from '@mui/material/Switch';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import ProBoxBg from '../../assets/settings/dashboard-pro-box.svg';
import UpgradeDialog from '../UpgradeDialog';

// Drawer settings styled to Figma (360px width)
const DashboardSettingsModal = ({ open, onClose, visibility, onChangeVisibility }) => {
  const handleVisibility = (key) => (e) => onChangeVisibility?.((s) => ({ ...s, [key]: e.target.checked }));

  const [upgradeOpen, setUpgradeOpen] = React.useState(false);
  const isToolkitProActive = Boolean(window.mycredDashboardData?.dashboard_settings?.is_toolkit_pro_active);
  React.useEffect(() => {
    if (!open && upgradeOpen) {
      setUpgradeOpen(false);
    }
  }, [open, upgradeOpen]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        zIndex: 1200,
        '& .MuiDrawer-paper': {
          width: 360,
          boxSizing: 'border-box',
          borderTopLeftRadius: 16,
          borderBottomLeftRadius: 16,
          boxShadow: '-4px 0px 24px rgba(0,0,0,0.1)',
          border: 'none'
        }
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, pt: 8, pb: 3, borderBottom: '1px solid #F3F3F3' }}>
          <Typography
            sx={{
              fontFamily: 'Vollkorn',
              fontWeight: 600,
              fontSize: 22,
              color: '#756C8C',
            }}
          >
            Dashboard Settings
          </Typography>
          <IconButton onClick={onClose} aria-label="close settings">
            <CloseIcon sx={{ color: '#6D5BCF' }} />
          </IconButton>
        </Box>

        {/* Body */}
        <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>

          <Typography sx={{ mt: 1, fontFamily: 'Poppins', fontWeight: 600, fontSize: 16, color: '#2D1572' }}>
            Visibility
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <RowSwitch
              label="Loyalty Metrics Hub"
              checked={!!visibility?.loyaltyMetricsHub}
              onChange={handleVisibility('loyaltyMetricsHub')}
            />
            {window.mycredDashboardData?.dashboard_settings?.is_woocommerce_active && (
              <RowSwitch
                label="WooCommerce Metrics Hub"
                checked={!!visibility?.woocommerceMetricsHub}
                onChange={handleVisibility('woocommerceMetricsHub')}
              />
            )}
            <RowSwitch
              label="PointTypes Distribution"
              checked={!!visibility?.pointsDistribution}
              onChange={handleVisibility('pointsDistribution')}
            />
            <RowSwitch
              label="Recent Activity"
              checked={!!visibility?.recentActivity}
              onChange={handleVisibility('recentActivity')}
            />
            <RowSwitch label="Top Members" checked={!!visibility?.topMembers} onChange={handleVisibility('topMembers')} />
          </Box>

        </Box>

        {/* Footer / Pro Box */}
        <Box sx={{ p: 3, mt: 'auto' }}>
          {!isToolkitProActive ? (
            <Box
              role="button"
              aria-label="Open Upgrade"
              tabIndex={0}
              onClick={() => setUpgradeOpen(true)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setUpgradeOpen(true)}
              sx={{
                width: '100%',
                height: 160,
                borderRadius: '8px',
                backgroundImage: `url(${ProBoxBg})`,
                backgroundSize: '100% 100%',
                backgroundPosition: 'center',
                p: 0,
                display: 'flex',
                alignItems: 'stretch',
                cursor: 'pointer',
                userSelect: 'none',
              }}
            />
          ) : (
            <Box sx={{ height: 20 }} /> // Spacer if pro is active
          )}
        </Box>
      </Box>
      <UpgradeDialog open={upgradeOpen} handleClose={() => setUpgradeOpen(false)} />
    </Drawer>
  );
};

// Styled MUI Toggle (32x16) per spec
const ToggleSwitch = styled(Switch)(({ theme }) => ({
  width: 32,
  height: 16,
  padding: 0,
  display: 'flex',
  '&:active': {
    '& .MuiSwitch-thumb': {
      width: 12,
    },
    '& .MuiSwitch-switchBase.Mui-checked': {
      transform: 'translateX(16px)',
    },
  },
  '& .MuiSwitch-switchBase': {
    padding: 2,
    transform: 'translateX(0px)',
    '&.Mui-checked': {
      transform: 'translateX(16px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: '#5F2CED',
      },
    },
  },
  '& .MuiSwitch-thumb': {
    boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)',
    width: 12,
    height: 12,
    borderRadius: 6,
    transition: theme.transitions.create(['width'], {
      duration: 200,
    }),
  },
  '& .MuiSwitch-track': {
    borderRadius: 9.33,
    opacity: 1,
    backgroundColor: '#E0E0E0',
    boxSizing: 'border-box',
  },
}));

const RowSwitch = ({ label, checked, onChange }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      px: 1.75,
      height: 44,
      borderRadius: 2,
      bgcolor: '#F5F1FF',
    }}
  >
    <Typography sx={{ fontFamily: 'Poppins', fontWeight: 400, fontSize: 14, lineHeight: '100%', color: '#2D1572' }}>
      {label}
    </Typography>
    <ToggleSwitch checked={checked} onChange={onChange} />
  </Box>
);

export default DashboardSettingsModal;
