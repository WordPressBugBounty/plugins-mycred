import React from 'react';
import { Box, Typography } from '@mui/material';

// 3D Glass Illustration using pure CSS/SVG - coin/crystal motif
const GlassIllustration = () => (
  <Box
    sx={{
      position: 'relative',
      width: { xs: 0, md: 260 },
      height: 160,
      display: { xs: 'none', md: 'block' },
      overflow: 'visible',
      flexShrink: 0,
    }}
  >
    {/* Back large orb */}
    <Box sx={{
      position: 'absolute', right: -10, top: -20,
      width: 160, height: 160,
      borderRadius: '50%',
      background: 'linear-gradient(135deg, rgba(139,92,246,0.35) 0%, rgba(167,139,250,0.15) 100%)',
      backdropFilter: 'blur(12px)',
      border: '1.5px solid rgba(255,255,255,0.6)',
      boxShadow: '0 8px 32px rgba(139,92,246,0.15), inset 0 1px 0 rgba(255,255,255,0.6)',
    }} />
    {/* Middle crystal */}
    <Box sx={{
      position: 'absolute', right: 50, top: 10,
      width: 100, height: 120,
      borderRadius: '20px 20px 40px 40px',
      background: 'linear-gradient(160deg, rgba(216,180,254,0.5) 0%, rgba(139,92,246,0.25) 100%)',
      backdropFilter: 'blur(16px)',
      border: '1.5px solid rgba(255,255,255,0.7)',
      boxShadow: '0 4px 24px rgba(139,92,246,0.12), inset 0 1px 0 rgba(255,255,255,0.8)',
      transform: 'rotate(-8deg)',
    }} />
    {/* Front small coin */}
    <Box sx={{
      position: 'absolute', right: 10, bottom: -10,
      width: 72, height: 72,
      borderRadius: '50%',
      background: 'linear-gradient(135deg, rgba(250,204,21,0.5) 0%, rgba(251,146,60,0.3) 100%)',
      backdropFilter: 'blur(10px)',
      border: '1.5px solid rgba(255,255,255,0.7)',
      boxShadow: '0 4px 16px rgba(251,146,60,0.2), inset 0 1px 0 rgba(255,255,255,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Typography sx={{ fontSize: 28, lineHeight: 1 }}>⭐</Typography>
    </Box>
    {/* Small floating dot top-left */}
    <Box sx={{
      position: 'absolute', right: 140, top: 20,
      width: 36, height: 36,
      borderRadius: '50%',
      background: 'rgba(196,181,253,0.5)',
      backdropFilter: 'blur(8px)',
      border: '1px solid rgba(255,255,255,0.6)',
    }} />
  </Box>
);

const WelcomeHero = () => {
  const username = window.mycredDashboardData?.current_user_name || 'Admin';

  return (
    <Box sx={{ px: { xs: 2, md: 3 }, pt: 2, pb: 0 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255,255,255,0.55)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.9)',
          borderRadius: '24px',
          px: { xs: 3, md: 4 },
          py: { xs: 3, md: 3.5 },
          boxShadow: '0 4px 24px rgba(139,92,246,0.07)',
          overflow: 'hidden',
          minHeight: 120,
          position: 'relative',
        }}
      >
        {/* Left: welcome text */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Avatar */}
          <Box sx={{
            width: 52, height: 52, borderRadius: '50%',
            background: 'linear-gradient(135deg, #e9d5ff 0%, #c4b5fd 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid rgba(255,255,255,0.8)',
            flexShrink: 0,
          }}>
            <Typography sx={{ fontSize: 22 }}>👤</Typography>
          </Box>
          <Box>
            <Typography sx={{
              fontWeight: 700,
              fontSize: { xs: '1.2rem', md: '1.45rem' },
              color: '#1e1b4b',
              lineHeight: 1.2,
              fontFamily: 'Poppins, sans-serif',
            }}>
              Welcome back,{' '}
              <Box component="span" sx={{ color: '#7c3aed' }}>{username}!</Box>
              {' '}👋
            </Typography>
            <Typography sx={{
              fontSize: '0.875rem',
              color: '#6b7280',
              fontFamily: 'Poppins, sans-serif',
              mt: 0.4,
            }}>
              Here's your loyalty program overview
            </Typography>
          </Box>
        </Box>

        {/* Right: 3D Glass illustration */}
        <GlassIllustration />
      </Box>
    </Box>
  );
};

export default WelcomeHero;
