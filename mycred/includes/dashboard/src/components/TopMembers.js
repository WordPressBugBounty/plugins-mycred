import React from 'react';
import { Box, Card, CardContent, Typography, Avatar, Skeleton } from '@mui/material';

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

const RankBadge = ({ rank }) => {
  const badgeColors = {
    1: '#F59E0B', // Gold
    2: '#94A3B8', // Silver
    3: '#D97706', // Bronze
  };

  const bgColor = badgeColors[rank] || '#E8E2F6';
  const textColor = rank <= 3 ? '#FFFFFF' : '#7F7CA2';

  return (
    <Box
      sx={{
        width: 26,
        height: 26,
        borderRadius: '50%',
        bgcolor: bgColor,
        color: textColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Figtree, Poppins, sans-serif',
        fontWeight: 700,
        fontSize: '11px',
        flexShrink: 0,
      }}
    >
      {rank}
    </Box>
  );
};

const MemberRow = ({ m, highlighted }) => {
  const getInitials = (name) => {
    if (!name) return '??';
    const words = name.trim().split(' ');
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(m.user_name);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        bgcolor: highlighted ? 'rgba(124, 85, 243, 0.08)' : '#ffffff',
        borderRadius: '12px',
        border: highlighted ? '1px solid #CFC6F3' : '1px solid rgba(226, 221, 238, 0.7)',
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
        <RankBadge rank={m.rank} />
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
            {m.user_name}
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
            {m.user_handle}
          </Typography>
        </Box>
      </Box>
      <Typography
        sx={{
          fontFamily: 'Figtree, Poppins, sans-serif',
          fontWeight: 800,
          fontSize: '15px',
          color: '#1E1B4B',
          pl: 1,
          flexShrink: 0,
          whiteSpace: 'nowrap',
        }}
      >
        {m.points_formatted ?? m.points.toLocaleString()}
      </Typography>
    </Box>
  );
};

const TopMembers = ({ members, loading, error, pointTypeLabel, highlightUserId }) => {
  if (loading) {
    return (
      <Card sx={{ ...cardSx, height: '100%', minHeight: { md: 440 } }}>
        <CardContent sx={{ p: 3 }}>
          <Skeleton variant="text" width={200} height={32} sx={{ mb: 2 }} />
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Box key={i} sx={{ bgcolor: '#ffffff', borderRadius: '12px', border: '1px solid rgba(226, 221, 238, 0.7)', p: 1.5, mb: 1.2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Skeleton variant="circular" width={26} height={26} />
              <Skeleton variant="circular" width={34} height={34} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="60%" height={18} />
                <Skeleton variant="text" width="40%" height={14} />
              </Box>
              <Skeleton variant="text" width={50} height={20} />
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
          <Typography sx={sectionTitleSx}>Top Members Leaderboard</Typography>
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            Failed to load members: {error}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (!members || members.length === 0) {
    return (
      <Card sx={{ ...cardSx, height: '100%', minHeight: { md: 440 } }}>
        <CardContent sx={{ p: 3 }}>
          <Typography sx={sectionTitleSx}>Top Members Leaderboard</Typography>
          <Typography variant="body2" sx={{ color: '#7F7CA2', textAlign: 'center', py: 8 }}>
            No members found with positive balances.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const highlightId = highlightUserId ? Number(highlightUserId) : null;

  const displayMembers = React.useMemo(() => {
    const list = Array.isArray(members) ? members : [];
    const MAX = 6;
    if (!list.length) return [];
    if (!highlightId) return list.slice(0, MAX);

    let targetIndex = list.findIndex((m) => Number(m.user_id) === highlightId);
    if (targetIndex === -1) {
      targetIndex = list.findIndex((m) => m?.is_target);
    }

    if (targetIndex === -1) {
      return list.slice(0, MAX);
    }

    if (targetIndex <= 4) {
      return list.slice(0, MAX);
    }

    const top5 = list.slice(0, 5);
    const target = list[targetIndex];
    const exists = top5.some((m) => Number(m.user_id) === Number(target.user_id));
    return exists ? top5 : [...top5, target];
  }, [members, highlightId]);

  return (
    <Card sx={{ ...cardSx, height: '100%', minHeight: { md: 440 } }}>
      <CardContent sx={{ p: 3 }}>
        <Typography sx={{ ...sectionTitleSx, mb: 2 }}>Top Members Leaderboard</Typography>
        <Box>
          {displayMembers.map((m) => {
            const isHighlighted = Boolean(m?.is_target || (highlightId && Number(m.user_id) === highlightId));
            return (
              <MemberRow
                key={m.user_id}
                m={m}
                highlighted={isHighlighted}
              />
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
};

export default TopMembers;
