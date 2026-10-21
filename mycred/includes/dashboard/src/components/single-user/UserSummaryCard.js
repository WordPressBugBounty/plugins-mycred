import React from 'react';
import { Box, Card, CardContent, Typography, Avatar, Chip } from '@mui/material';
import adminRoleIcon from '../../assets/single-user/admin-role.svg';
import registrationDateIcon from '../../assets/single-user/registration-date.svg';
import userIdIcon from '../../assets/single-user/user-id.svg';
import awardRankIcon from '../../assets/single-user/award-rank.svg';
import badgeLevelIcon from '../../assets/single-user/award-rank.svg';

const fontFamily = 'Figtree, Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

const cardStyles = {
  borderRadius: '16px',
  border: '1px solid rgba(226, 221, 238, 0.85)',
  boxShadow: '0 4px 20px rgba(45, 21, 114, 0.05)',
  backgroundColor: '#ffffff',
  height: '100%',
  fontFamily,
};

const StatCard = ({ label, value, color, bgColor, borderColor }) => (
  <Box
    sx={{
      flex: 1,
      minWidth: 0,
      p: 2,
      bgcolor: bgColor,
      border: `1px solid ${borderColor}`,
      borderRadius: '12px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      transition: 'all 0.2s ease',
    }}
  >
    <Typography
      sx={{
        color: color || '#2D1572',
        fontWeight: 800,
        fontSize: { xs: '22px', md: '26px' },
        lineHeight: 1.2,
        fontFamily,
      }}
    >
      {value}
    </Typography>
    <Typography
      sx={{
        color: '#6B57A1',
        fontSize: '12.5px',
        mt: 0.5,
        fontWeight: 600,
        fontFamily,
      }}
    >
      {label}
    </Typography>
  </Box>
);

const DetailCard = ({ iconSrc, label, value, isAddonDisabled = false }) => (
  <Box
    sx={{
      p: '12px 14px',
      bgcolor: '#FAF9FD',
      borderRadius: '12px',
      border: '1px solid rgba(226, 221, 238, 0.7)',
      display: 'flex',
      flexDirection: 'column',
      gap: 0.6,
      minWidth: 0,
      justifyContent: 'space-between',
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
      <Box component="img" src={iconSrc} sx={{ width: 14, height: 14, opacity: 0.8 }} />
      <Typography sx={{ color: '#7F7CA2', fontSize: '11.5px', fontWeight: 600, fontFamily }}>
        {label}
      </Typography>
    </Box>
    {isAddonDisabled ? (
      <Box
        component="a"
        href="admin.php?page=mycred-addons"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          textDecoration: 'none',
          bgcolor: '#F3EDFF',
          color: '#5E2CED',
          border: '1px solid #E2D9FF',
          borderRadius: '6px',
          px: 1,
          py: 0.25,
          fontSize: '11.5px',
          fontWeight: 700,
          fontFamily,
          width: 'fit-content',
          cursor: 'pointer',
          transition: 'all 0.18s ease',
          '&:hover': {
            bgcolor: '#EDE5FF',
            borderColor: '#C4B5F5',
          }
        }}
      >
        Enable Add-on
      </Box>
    ) : (
      <Typography
        sx={{
          color: '#2D1572',
          fontWeight: 700,
          fontSize: '14px',
          fontFamily,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {value || '—'}
      </Typography>
    )}
  </Box>
);

const formatValue = (value) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '—';
  }
  return value.toLocaleString();
};

const UserSummaryCard = ({ user, summary = {}, pointTypeLabel = 'Points' }) => {
  const initials = (user?.name || 'User')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const primaryRole = Array.isArray(user?.roles) && user.roles.length ? user.roles[0] : null;
  const roleLabel = primaryRole ? (primaryRole.charAt(0).toUpperCase() + primaryRole.slice(1)) : null;
  const registered = user?.registered ? new Date(user.registered) : null;
  const registeredLabel = registered ? registered.toLocaleDateString() : '--';

  const totalEarned = summary?.earned_formatted ?? formatValue(summary?.earned);
  const totalSpent = summary?.spent_formatted ?? formatValue(summary?.spent);
  const balanceValue = typeof summary?.balance === 'number' ? summary.balance : user?.balance;
  const pointsBalance = summary?.balance_formatted ?? formatValue(balanceValue);

  return (
    <Card sx={cardStyles}>
      <CardContent sx={{ p: { xs: 2.5, md: 3 }, display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
        {/* Header Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              bgcolor: '#F3EDFF',
              color: '#5E2CED',
              borderRadius: '50%',
              fontWeight: 800,
              fontSize: '20px',
              fontFamily,
              border: '2px solid #EBE4FF',
              flexShrink: 0,
            }}
          >
            {initials}
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.3, flexWrap: 'wrap' }}>
              <Typography
                sx={{
                  color: '#2D1572',
                  fontFamily,
                  fontWeight: 800,
                  fontSize: { xs: '20px', md: '24px' },
                  lineHeight: 1.2,
                }}
              >
                {user?.name || '—'}
              </Typography>
              {roleLabel && (
                <Chip
                  label={roleLabel}
                  size="small"
                  sx={{
                    height: 22,
                    borderRadius: '6px',
                    bgcolor: '#F3EDFF',
                    color: '#5E2CED',
                    fontWeight: 700,
                    fontSize: '11px',
                    fontFamily,
                    px: 0.5,
                  }}
                />
              )}
            </Box>
            <Typography sx={{ color: '#6B57A1', fontSize: '13px', fontWeight: 500, fontFamily }}>
              {user?.handle ? `@${user.handle.replace(/^@/, '')}` : '@user'}
              {user?.email && ` · ${user.email}`}
            </Typography>
          </Box>
        </Box>

        {/* Info Cards Row (4 Columns) */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' },
            gap: 1.5,
            mb: 3,
          }}
        >
          <DetailCard iconSrc={userIdIcon} label="User ID" value={user?.id ?? '—'} />
          <DetailCard iconSrc={registrationDateIcon} label="Registration Date" value={registeredLabel} />
          <DetailCard
            iconSrc={awardRankIcon}
            label="Rank"
            value={user?.earned_rank?.title || '—'}
            isAddonDisabled={!user?.rank_addon_enabled}
          />
          <DetailCard
            iconSrc={badgeLevelIcon}
            label="Badge Level"
            value={user?.earned_badges?.[0]?.title || '—'}
            isAddonDisabled={!user?.badge_addon_enabled}
          />
        </Box>

        {/* Stats Section (3 Columns) */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
            gap: 1.5,
            mt: 'auto',
          }}
        >
          <StatCard
            label={`Total ${pointTypeLabel} Earned`}
            value={totalEarned}
            color="#10B981"
            bgColor="#F4FAF0"
            borderColor="rgba(16, 185, 129, 0.2)"
          />
          <StatCard
            label={`Total ${pointTypeLabel} Spent`}
            value={totalSpent}
            color="#EF4444"
            bgColor="#FEF5F4"
            borderColor="rgba(239, 68, 68, 0.2)"
          />
          <StatCard
            label={`${pointTypeLabel} Balance`}
            value={pointsBalance}
            color="#7C3AED"
            bgColor="#F5F0FF"
            borderColor="rgba(124, 58, 237, 0.2)"
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default UserSummaryCard;

