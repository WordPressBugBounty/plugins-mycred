import React, { useState } from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import toast from 'react-hot-toast';
import PointsTransferModal from '../modal/PointsTransferModal';
import ResetPointsModal from '../modal/ResetPointsModal';
import PointsHistoryModal from '../modal/PointsHistoryModal';
import BadgeRankModal from '../modal/BadgeRankModal';
import UpgradeDialog from '../UpgradeDialog';
import addRewardIcon from '../../assets/quick-actions/add-reward-quick-actions.svg';
import deductIcon from '../../assets/quick-actions/deduct-quick-actions..svg';
import awardRankIcon from '../../assets/single-user/award-rank.svg';
import removeRankIcon from '../../assets/single-user/remove-rank.svg';
import resetIcon from '../../assets/single-user/reset.svg';
import pointHistoryIcon from '../../assets/single-user/point-history.svg';

const fontFamily = 'Figtree, Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

const cardSx = {
  borderRadius: '16px',
  border: '1px solid rgba(226, 221, 238, 0.85)',
  boxShadow: '0 4px 20px rgba(45, 21, 114, 0.05)',
  backgroundColor: '#ffffff',
  height: '100%',
  fontFamily,
};

const tileSx = {
  border: '1px solid rgba(226, 221, 238, 0.85)',
  borderRadius: '12px',
  p: '14px 10px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 1,
  minHeight: 96,
  backgroundColor: '#FAF9FD',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    borderColor: '#c4b5f5',
    backgroundColor: '#ffffff',
    boxShadow: '0px 6px 18px rgba(45, 21, 114, 0.08)',
  },
};

const UserQuickActions = ({
  pointTypeLabel = 'Points',
  user,
  isProActive,
  pointTypes = [],
  defaultPointType = '',
  activePointType = '',
  onActionComplete,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('award');
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [badgeRankModalOpen, setBadgeRankModalOpen] = useState(false);
  const [badgeRankModalMode, setBadgeRankModalMode] = useState('award');
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const badges = (window.mycredDashboardData && window.mycredDashboardData.badges) || [];
  const ranks = (window.mycredDashboardData && window.mycredDashboardData.ranks) || [];
  const isBadgesActive = (window.mycredDashboardData && window.mycredDashboardData.isBadgesActive) || false;
  const isRanksActive = (window.mycredDashboardData && window.mycredDashboardData.isRanksActive) || false;

  const actions = [
    {
      id: 'award',
      label: `Award ${pointTypeLabel}`,
      icon: addRewardIcon,
      iconBg: '#F4FAF0',
      iconSize: 28,
    },
    {
      id: 'deduct',
      label: `Deduct ${pointTypeLabel}`,
      icon: deductIcon,
      iconBg: '#FEF5F4',
      iconSize: 28,
    },
    {
      id: 'award-rank',
      label: 'Award Badge / Rank',
      icon: awardRankIcon,
      iconBg: '#F5F0FF',
      iconSize: 24,
    },
    {
      id: 'remove-rank',
      label: 'Remove Badge / Rank',
      icon: removeRankIcon,
      iconBg: '#F5F0FF',
      iconSize: 24,
    },
    {
      id: 'reset',
      label: `Reset ${pointTypeLabel}`,
      icon: resetIcon,
      iconBg: '#F5F0FF',
      iconSize: 24,
    },
    {
      id: 'history',
      label: `View History`,
      icon: pointHistoryIcon,
      iconBg: '#F5F0FF',
      iconSize: 24,
    },
  ];

  const handleActionClick = (actionId) => {
    if (actionId === 'award' || actionId === 'deduct') {
      if (isProActive) {
        setModalMode(actionId);
        setModalOpen(true);
      } else {
        setUpgradeOpen(true);
      }
    } else if (actionId === 'reset') {
      if (isProActive) {
        setResetModalOpen(true);
      } else {
        setUpgradeOpen(true);
      }
    } else if (actionId === 'history') {
      if (isProActive) {
        setHistoryModalOpen(true);
      } else {
        setUpgradeOpen(true);
      }
    } else if (actionId === 'award-rank') {
      if (isProActive) {
        if (!isBadgesActive && !isRanksActive) {
          toast('Please enable Badges or Ranks addon first to award them.', { icon: 'ℹ️' });
          return;
        }
        setBadgeRankModalMode('award');
        setBadgeRankModalOpen(true);
      } else {
        setUpgradeOpen(true);
      }
    } else if (actionId === 'remove-rank') {
      if (isProActive) {
        if (!isBadgesActive && !isRanksActive) {
          toast('Please enable Badges or Ranks addon first to remove them.', { icon: 'ℹ️' });
          return;
        }
        setBadgeRankModalMode('remove');
        setBadgeRankModalOpen(true);
      } else {
        setUpgradeOpen(true);
      }
    }
  };

  const handleSuccess = (payload) => {
    const { mode, amount } = payload || {};
    const verb = mode === 'deduct' ? 'Deducted' : 'Awarded';
    const message = `${verb} ${amount} ${pointTypeLabel.toLowerCase()} successfully.`;
    toast.success(message);
    setModalOpen(false);
    if (typeof onActionComplete === 'function') {
      onActionComplete();
    }
  };

  const handleResetSuccess = (payload) => {
    const { response } = payload || {};
    const message = (response && response.message) ? response.message : 'Points balance reset successfully.';
    toast.success(message);
    setResetModalOpen(false);
    if (typeof onActionComplete === 'function') {
      onActionComplete();
    }
  };

  const handleBadgeRankSuccess = (payload) => {
    const { response } = payload || {};
    const message = (response && response.message) ? response.message : 'Badge/Rank operation completed successfully.';
    toast.success(message);
    setBadgeRankModalOpen(false);
    if (typeof onActionComplete === 'function') {
      onActionComplete();
    }
  };

  const handleError = (message) => {
    toast.error(message || 'Unable to process request.');
  };

  return (
    <>
      <Card sx={cardSx}>
        <CardContent sx={{ p: { xs: 2.5, md: 3 }, display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
          <Typography sx={{ color: '#2D1572', fontWeight: 800, mb: 2.5, fontFamily, fontSize: '15px' }}>
            Quick Actions
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 1.5, flex: 1 }}>
            {actions.map((action) => (
              <Box
                key={action.id}
                sx={tileSx}
                onClick={() => handleActionClick(action.id)}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    bgcolor: action.iconBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(45, 21, 114, 0.04)',
                  }}
                >
                  <Box
                    component="img"
                    src={action.icon}
                    alt={action.label}
                    sx={{ width: action.iconSize, height: action.iconSize }}
                  />
                </Box>
                <Typography
                  sx={{
                    color: '#2D1572',
                    fontWeight: 700,
                    fontSize: '12px',
                    textAlign: 'center',
                    lineHeight: 1.25,
                    fontFamily,
                  }}
                >
                  {action.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      <PointsTransferModal
        open={modalOpen}
        mode={modalMode}
        onClose={() => setModalOpen(false)}
        preselectedUser={user}
        pointTypes={pointTypes}
        defaultPointType={defaultPointType}
        activePointType={activePointType}
        onSuccess={handleSuccess}
        onError={handleError}
      />
      <ResetPointsModal
        open={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        user={user}
        pointType={activePointType}
        pointTypeLabel={pointTypeLabel}
        onSuccess={handleResetSuccess}
        onError={handleError}
      />
      <PointsHistoryModal
        open={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        user={user}
        pointType={activePointType}
        pointTypeLabel={pointTypeLabel}
      />
      <BadgeRankModal
        open={badgeRankModalOpen}
        mode={badgeRankModalMode}
        onClose={() => setBadgeRankModalOpen(false)}
        user={user}
        badges={badges}
        ranks={ranks}
        isBadgesActive={isBadgesActive}
        isRanksActive={isRanksActive}
        activePointType={activePointType}
        onSuccess={handleBadgeRankSuccess}
        onError={handleError}
      />
      <UpgradeDialog open={upgradeOpen} handleClose={() => setUpgradeOpen(false)} />
    </>
  );
};

export default UserQuickActions;


