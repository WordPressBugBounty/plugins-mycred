import React from 'react';
import { Box, Card, CardContent, Typography, Avatar, Skeleton } from '@mui/material';
import RecentActivityModal from './modal/RecentActivityModal';

const cardSx = {
  borderRadius: '16px',
  border: '1px solid rgba(226, 221, 238, 0.85)',
  boxShadow: '0 4px 20px rgba(45, 21, 114, 0.05)',
  backgroundColor: '#ffffff',
  width: '100%',
  minWidth: 0,
};

const sectionTitleSx = {
  fontWeight: 700,
  fontFamily: 'Figtree, Poppins, sans-serif',
  color: '#2D1572',
  fontSize: '16px',
};

const ActivityRow = ({ item }) => {
  const initials = item.user_name ? item.user_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : '??';
  const positive = item.type === 'credit';

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        bgcolor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid rgba(226, 221, 238, 0.7)',
        p: 1.5,
        mb: 1.2,
        width: '100%',
        boxSizing: 'border-box',
        minWidth: 0,
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: '#c4b5f5',
          boxShadow: '0 2px 8px rgba(45, 21, 114, 0.06)',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0, mr: 1.5 }}>
        <Avatar
          sx={{
            width: 34,
            height: 34,
            bgcolor: '#EBE4FF',
            color: '#5E2CED',
            fontFamily: 'Figtree, Poppins, sans-serif',
            fontWeight: 700,
            fontSize: 13,
            flexShrink: 0,
          }}
        >
          {initials}
        </Avatar>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            sx={{
              fontFamily: 'Figtree, Poppins, sans-serif',
              fontWeight: 700,
              fontSize: '13px',
              color: '#1E1B4B',
              lineHeight: 1.4,
              wordBreak: 'break-word',
            }}
          >
            {item.user_name}
          </Typography>
          <Typography
            sx={{
              fontFamily: 'Figtree, Poppins, sans-serif',
              fontWeight: 400,
              fontSize: '11.5px',
              color: '#6B57A1',
              lineHeight: 1.4,
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
            }}
          >
            {item.description} • {item.time_ago}
          </Typography>
        </Box>
      </Box>
      <Typography
        sx={{
          fontFamily: 'Figtree, Poppins, sans-serif',
          fontWeight: 700,
          fontSize: '14px',
          color: positive ? '#22C55E' : '#EF4444',
          pl: 1,
          flexShrink: 0,
          whiteSpace: 'nowrap',
        }}
      >
        {positive ? `+${item.points_formatted ?? item.points}` : `-${item.points_formatted ?? item.points}`}
      </Typography>
    </Box>
  );
};

const RecentActivity = ({ activities, loading, error, pointTypeLabel }) => {
  const [modalOpen, setModalOpen] = React.useState(false);
  const displayActivities = Array.isArray(activities) && activities.length ? activities.slice(0, 5) : null;

  if (loading) {
    return (
      <Card sx={{ ...cardSx, height: '100%', minHeight: { md: 440 } }}>
        <CardContent sx={{ p: 3 }}>
          <Skeleton variant="text" width={180} height={32} sx={{ mb: 2 }} />
          {[1, 2, 3, 4, 5].map((i) => (
            <Box key={i} sx={{ bgcolor: '#ffffff', borderRadius: '12px', border: '1px solid rgba(226, 221, 238, 0.7)', p: 1.5, mb: 1.2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Skeleton variant="circular" width={34} height={34} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="70%" height={18} />
                <Skeleton variant="text" width="50%" height={14} />
              </Box>
              <Skeleton variant="text" width={40} height={18} />
            </Box>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ ...cardSx, height: '100%', minHeight: { md: 440 } }}>
        <CardContent sx={{ p: 3 }}>
          <Typography sx={sectionTitleSx}>Recent Activity</Typography>
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            Failed to load activities: {error}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (!displayActivities) {
    return (
      <Card sx={{ ...cardSx, height: '100%', minHeight: { md: 440 } }}>
        <CardContent sx={{ p: 3 }}>
          <Typography sx={sectionTitleSx}>Recent Activity</Typography>
          <Typography variant="body2" sx={{ color: '#7F7CA2', textAlign: 'center', py: 8 }}>
            No recent activity for the selected period.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card sx={{ ...cardSx, height: '100%', minHeight: { md: 440 } }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography sx={sectionTitleSx}>Recent Activity</Typography>
            {activities.length > 5 && (
              <Typography
                onClick={() => setModalOpen(true)}
                sx={{
                  fontFamily: 'Figtree, Poppins, sans-serif',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#5E2CED',
                  cursor: 'pointer',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                View All
              </Typography>
            )}
          </Box>
          <Box>
            {displayActivities.map((item) => (
              <ActivityRow key={item.id} item={item} />
            ))}
          </Box>
        </CardContent>
      </Card>
      <RecentActivityModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        activities={activities}
        pointTypeLabel={pointTypeLabel}
      />
    </>
  );
};

export default RecentActivity;
