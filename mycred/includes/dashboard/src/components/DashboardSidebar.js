import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import StarIcon from '@mui/icons-material/Star';
import CheckIcon from '@mui/icons-material/Check';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import HeadsetMicOutlinedIcon from '@mui/icons-material/HeadsetMicOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import UpgradeDialog from './UpgradeDialog';

const fontFamily = 'Figtree, Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

const PRO_FEATURES = [
  {
    title: 'WooCommerce loyalty',
    body: 'Reward purchases, milestones.',
  },
  {
    title: '49+ premium add-ons',
    body: 'More ways to grow engagement.',
  },
  {
    title: 'Priority support',
    body: 'Get help when you need it.',
  },
  {
    title: 'Turn points into revenue',
    body: 'Give members more reasons to return.',
  },
];

const DashboardSidebar = ({
  isProActive,
}) => {
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const handleOpenUpgrade = () => setUpgradeOpen(true);
  const handleCloseUpgrade = () => setUpgradeOpen(false);

  const isToolkitProActive = Boolean(isProActive);

  return (
    <Box sx={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', gap: '16px', fontFamily }}>
      {!isToolkitProActive && (
      <Box
        sx={{
          position: 'relative',
          padding: '2.5px',
          borderRadius: '24px',
          overflow: 'hidden',
          backgroundColor: '#FBF6FF',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            backgroundColor: '#FBF6FF',
            borderRadius: '22px',
            border: '1px solid rgba(226, 221, 238, 0.65)',
            padding: { xs: '18px 14px', md: '20px 16px' },
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
              <Box sx={{ mb: '6px' }}>
                <Typography
                  component="div"
                  sx={{
                    fontFamily,
                    fontSize: '20px',
                    fontWeight: 900,
                    lineHeight: 1.15,
                    color: '#1E1148',
                    letterSpacing: '-0.02em',
                  }}
                >
                  <Box component="span" sx={{ display: 'block' }}>
                    Unlock more with
                  </Box>
                  <Box component="span" sx={{ display: 'block' }}>
                    myCred{' '}
                    <Box component="span" sx={{ color: '#5E2CED' }}>PRO</Box>
                  </Box>
                </Typography>
                <Typography sx={{ fontFamily, fontSize: '12px', fontWeight: 400, color: '#6B57A1', lineHeight: 1.45, mt: '10px' }}>
                  Powerful features to grow your loyalty program and boost your business.
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {PRO_FEATURES.map((feature) => (
                  <Box key={feature.title} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <Box sx={{ width: 20, height: 20, minWidth: 20, borderRadius: '50%', bgcolor: '#3D9A4A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', mt: '1px' }}>
                      <CheckIcon sx={{ fontSize: 14 }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontFamily, fontSize: '13px', fontWeight: 700, color: '#2D1572', lineHeight: 1.3 }}>
                        {feature.title}
                      </Typography>
                      <Typography sx={{ fontFamily, fontSize: '12px', color: '#6B57A1', lineHeight: 1.4, mt: '2px' }}>
                        {feature.body}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  borderTop: '1px solid rgba(226, 221, 238, 0.9)',
                  pt: '12px',
                  gap: '8px',
                }}
              >
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                  <VerifiedUserIcon sx={{ fontSize: 18, color: '#3B82F6', flexShrink: 0 }} />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontFamily, fontSize: '11px', fontWeight: 800, color: '#2D1572', lineHeight: 1.2, whiteSpace: 'nowrap' }}>
                      Trusted by 10K+
                    </Typography>
                    <Typography sx={{ fontFamily, fontSize: '10px', color: '#6B57A1', lineHeight: 1.2, whiteSpace: 'nowrap' }}>
                      website owners
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ width: '1px', alignSelf: 'stretch', bgcolor: 'rgba(226, 221, 238, 0.9)', flexShrink: 0 }} />

                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '1px', flexShrink: 0 }}>
                      <StarIcon sx={{ fontSize: 12, color: '#F59E0B' }} />
                      <StarIcon sx={{ fontSize: 12, color: '#F59E0B' }} />
                      <StarIcon sx={{ fontSize: 12, color: '#F59E0B' }} />
                      <StarIcon sx={{ fontSize: 12, color: '#F59E0B' }} />
                      <StarIcon sx={{ fontSize: 12, color: '#F59E0B' }} />
                    </Box>
                    <Typography sx={{ fontFamily, fontSize: '11px', fontWeight: 800, color: '#2D1572', lineHeight: 1.2, whiteSpace: 'nowrap' }}>
                      4.6/5
                    </Typography>
                  </Box>
                  <Typography sx={{ fontFamily, fontSize: '10px', color: '#6B57A1', lineHeight: 1.2, whiteSpace: 'nowrap' }}>
                    based on reviews
                  </Typography>
                </Box>
              </Box>

              <Button
                variant="contained"
                onClick={handleOpenUpgrade}
                fullWidth
                startIcon={<RocketLaunchIcon sx={{ fontSize: 17 }} />}
                sx={{
                  background: 'linear-gradient(135deg, #6A38FF 0%, #5E2CED 100%)',
                  color: '#ffffff',
                  fontFamily,
                  fontSize: '13.5px',
                  fontWeight: 700,
                  borderRadius: '10px',
                  py: '11px',
                  textTransform: 'none',
                  boxShadow: '0 6px 20px rgba(94, 44, 237, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.35)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #6A38FF 0%, #5E2CED 100%)',
                    boxShadow: '0 6px 20px rgba(94, 44, 237, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.35)',
                  },
                }}
              >
                Upgrade to PRO
              </Button>
        </Box>
      </Box>
      )}

      {/* ========================================================
          NEED HELP / SUPPORT CARD (BOTTOM)
          ======================================================== */}
      <Box
        sx={{
          backgroundColor: '#FBF6FF',
          border: '1px solid rgba(226, 221, 238, 0.85)',
          borderRadius: '18px',
          padding: '18px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          boxShadow: '0 4px 14px rgba(45, 21, 114, 0.03)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              backgroundColor: '#EDE9FE',
              color: '#5E2CED',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ChatBubbleOutlineIcon sx={{ fontSize: 18 }} />
          </Box>
          <Box>
            <Typography sx={{ fontFamily, fontSize: '14px', fontWeight: 700, color: '#2D1572' }}>
              Need Help?
            </Typography>
            <Typography sx={{ fontFamily, fontSize: '12px', color: '#6B57A1' }}>
              We&apos;re here to help you succeed.
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <Button
            component="a"
            href="https://mycred.me/docs/"
            target="_blank"
            rel="noopener noreferrer"
            endIcon={<ChevronRightIcon sx={{ fontSize: 13, ml: 'auto' }} />}
            startIcon={<MenuBookOutlinedIcon sx={{ fontSize: 15 }} />}
            sx={{
              backgroundColor: '#F8F6FF',
              border: '1px solid rgba(226, 221, 238, 0.9)',
              borderRadius: '8px',
              color: '#5E2CED',
              fontFamily,
              fontSize: '11.5px',
              fontWeight: 700,
              py: '7px',
              px: '10px',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#EDE9FE',
                borderColor: '#c7d2fe',
                color: '#2D1572',
              },
            }}
          >
            Docs
          </Button>

          <Button
            component="a"
            href="https://mycred.me/support/"
            target="_blank"
            rel="noopener noreferrer"
            endIcon={<ChevronRightIcon sx={{ fontSize: 13, ml: 'auto' }} />}
            startIcon={<HeadsetMicOutlinedIcon sx={{ fontSize: 15 }} />}
            sx={{
              backgroundColor: '#F8F6FF',
              border: '1px solid rgba(226, 221, 238, 0.9)',
              borderRadius: '8px',
              color: '#5E2CED',
              fontFamily,
              fontSize: '11.5px',
              fontWeight: 700,
              py: '7px',
              px: '10px',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#EDE9FE',
                borderColor: '#c7d2fe',
                color: '#2D1572',
              },
            }}
          >
            Support
          </Button>
        </Box>
      </Box>

      {!isToolkitProActive && (
        <UpgradeDialog open={upgradeOpen} handleClose={handleCloseUpgrade} source="sidebar" />
      )}
    </Box>
  );
};

export default DashboardSidebar;
