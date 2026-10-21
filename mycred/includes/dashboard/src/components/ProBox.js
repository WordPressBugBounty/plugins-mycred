import React from 'react';
import { Box, Card, CardContent, Typography, Button } from '@mui/material';
import proBg from '../assets/cta-block.svg';
import checkIcon from '../assets/quick-actions/check.svg';

const cardBase = {
  borderRadius: '8px',
  border: '1px solid #E8E2F6',
  boxShadow: 'none',
  backgroundColor: '#ffffff',
};

const ProBox = ({ container = true }) => {
  const features = [
    { text: 'Advanced Badge System & Custom Ranks', key: 'badges' },
    { text: 'Leaderboards & Rankings', key: 'leaderboards' },
    { text: 'Multi-Payment Gateway Support', key: 'payments' },
    { text: 'Advanced Reward Conditions', key: 'rewards' },
    { text: 'WooCommerce Plus Integration', key: 'woocommerce' },
    { text: 'Advanced Analytics Dashboard', key: 'analytics' },
    { text: 'CashCred Payouts (PayPal, Stripe, Paystack)', key: 'payouts' },
    { text: 'Treasure Assets Suite', key: 'treasure' }
  ];

  const card = (
    <Card sx={{
      width: '100%',
      // maxWidth: '1224px', // Removed to match Charts width
      minHeight: { xs: 'auto', md: '320px' },
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      color: '#fff',
      backgroundColor: '#140833',
      backgroundImage: `url(${proBg})`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: { xs: 'top right', md: 'center right' },
      backgroundSize: 'cover',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <CardContent sx={{ p: { xs: 3, md: 5 }, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
          {/* Left Content */}
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 600,
                fontSize: { xs: '24px', md: '32px' },
                lineHeight: 1.2,
                color: '#FFFFFF',
                mb: 4,
                maxWidth: '750px',
                whiteSpace: 'pre-line'
              }}
            >
              Join Our Membership Club & Gain Access {'\n'}
              to <Box component="span" sx={{ color: '#FEC700' }}>50+ Features</Box> & Numerous Benefits.
            </Typography>

            {/* Features 3 Columns */}
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1.2fr 1fr 1.2fr' },
              gap: 2,
              rowGap: 1.5,
              mb: { md: 2 } // Spacing below points
            }}>
              {features.map((feat) => (
                <Box key={feat.key} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    bgcolor: '#4CAF50',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Box>
                  <Typography sx={{ fontSize: '14px', color: '#E0E0E0', fontWeight: 500 }}>
                    {feat.text}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Right Content: Button */}
          <Box sx={{ mt: { md: 18 } }}>
            <Button
              variant="contained"
              onClick={() => window.open('http://mycred.me/pricing', '_blank', 'noopener')}
              sx={{
                width: { md: '246px' },
                height: { md: '56px' },
                background: 'linear-gradient(90deg, #FDD02E 0%, #FA9F1B 100%)',
                color: '#241249',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 700,
                fontSize: '16px',
                borderRadius: '12px',
                textTransform: 'none',
                boxShadow: '0 4px 14px rgba(250, 159, 27, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(90deg, #FACB20 0%, #F09410 100%)',
                  boxShadow: '0 6px 20px rgba(250, 159, 27, 0.5)',
                }
              }}
            >
              Get myCred Pro Today
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (!container) return card;

  return (
    <Box sx={{ px: { xs: 1, md: 3 }, mt: 4, mb: 4 }}>
      {card}
    </Box>
  );
};

export default ProBox;
