import { Box, Card, CardContent, Typography, Skeleton } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';
import totalMembersIcon from '../assets/metrics/total-members.svg';
import pointsAwardedIcon from '../assets/metrics/points-awarded.svg';
import pointsDeductedIcon from '../assets/metrics/points-deducted.svg';
import totalTransactionsIcon from '../assets/metrics/total-transactions.svg';

const LoyaltyMetrics = ({ metrics, loading, error, pointTypeLabel }) => {

  const sectionBoxSx = { px: 0, mt: 2, mb: 3 };

  const sectionTitleSx = {
    fontWeight: 700,
    fontFamily: 'Figtree, Poppins, sans-serif',
    color: '#2D1572',
    mb: 2,
    fontSize: '16px'
  };
  const gridSx = {
    display: 'grid',
    gridTemplateColumns: {
      xs: 'repeat(1, minmax(0, 1fr))',
      sm: 'repeat(2, minmax(0, 1fr))',
      md: 'repeat(2, minmax(0, 1fr))',
      lg: 'repeat(4, minmax(0, 1fr))'
    },
    gap: 2
  };
  const cardSx = {
    width: '100%',
    borderRadius: '12px',
    border: '1px solid rgba(226, 221, 238, 0.8)',
    boxShadow: '0 4px 14px rgba(45, 21, 114, 0.03)',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      boxShadow: '0 8px 24px rgba(45, 21, 114, 0.08)',
      transform: 'translateY(-2px)',
      backgroundColor: '#ffffff',
    }
  };
  const cardContentSx = { p: 2, '&:last-child': { pb: 2 }, display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' };

  const changeTypeOf = (val) => (val && String(val).startsWith('-') ? 'decrease' : 'increase');

  const awardedLabel = pointTypeLabel ? `${pointTypeLabel} Awarded` : 'Points Awarded';
  const deductedLabel = pointTypeLabel ? `${pointTypeLabel} Deducted` : 'Points Deducted';

  const cards = [
    {
      id: 1,
      title: 'Active Members',
      value: metrics?.total_members ?? '0',
      icon: totalMembersIcon,
      change: metrics?.total_members_percent ?? '0%',
      changeType: changeTypeOf(metrics?.total_members_percent),
    },
    {
      id: 2,
      title: awardedLabel,
      value: metrics?.points_awarded_formatted ?? (metrics?.points_awarded ?? '0'),
      icon: pointsAwardedIcon,
      change: metrics?.points_awarded_percent ?? '0%',
      changeType: changeTypeOf(metrics?.points_awarded_percent),
    },
    {
      id: 3,
      title: deductedLabel,
      value: metrics?.points_deducted_formatted ?? (metrics?.points_deducted ?? '0'),
      icon: pointsDeductedIcon,
      change: metrics?.points_deducted_percent ?? '0%',
      changeType: changeTypeOf(metrics?.points_deducted_percent),
    },
    {
      id: 4,
      title: 'Outstanding Points',
      value: metrics?.outstanding_points_formatted ?? (metrics?.outstanding_points ?? '0'),
      icon: totalTransactionsIcon,
      change: metrics?.outstanding_points_percent ?? '0%',
      changeType: changeTypeOf(metrics?.outstanding_points_percent),
    },
  ];

  if (loading) {
    return (
      <Box sx={sectionBoxSx}>
        <Typography variant="h6" component="h2" className="section-title" sx={sectionTitleSx}>
          Loyalty Metrics Hub
        </Typography>
        <Box sx={gridSx}>
          {Array.from({ length: 4 }, (_, i) => i + 1).map((i) => (
            <Card key={i} sx={cardSx}>
              <CardContent sx={cardContentSx}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Skeleton variant="text" width={100} />
                  <Skeleton variant="circular" width={40} height={40} />
                </Box>
                <Skeleton variant="text" width={80} height={40} sx={{ mb: 2 }} />
                <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between' }}>
                  <Skeleton variant="rounded" width={60} height={24} />
                  <Skeleton variant="circular" width={20} height={20} />
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={sectionBoxSx}>
        <Typography variant="h6" className="section-title" sx={{ mb: 3 }}>Loyalty Metrics Hub</Typography>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!metrics) return null;

  return (
    <Box sx={sectionBoxSx}>
      <Typography variant="h6" component="h2" className="section-title" sx={sectionTitleSx}>
        Loyalty Metrics Hub
      </Typography>
      <Box sx={gridSx}>
        {cards.map((metric) => (
          <Card key={metric.id} sx={cardSx}>
            <CardContent sx={cardContentSx}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Typography
                    sx={{
                      color: '#6B57A1',
                      fontWeight: 500,
                      fontSize: '13px',
                      lineHeight: 1.3
                    }}
                  >
                    {metric.title}
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      color: '#2D1572',
                      fontSize: '24px',
                      lineHeight: 1.2,
                      mt: 0.5
                    }}
                  >
                    {metric.value}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: '10px',
                    bgcolor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid rgba(226, 221, 238, 0.8)',
                    boxShadow: '0 2px 8px rgba(94, 44, 237, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <img
                    src={metric.icon}
                    alt={metric.title}
                    style={{ width: '22px', height: '22px', objectFit: 'contain' }}
                  />
                </Box>
              </Box>

              <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center' }}>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    px: 1.2,
                    py: 0.4,
                    borderRadius: '6px',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    color: metric.changeType === 'increase' ? '#2F6D3A' : '#D32F2F',
                    backgroundColor: metric.changeType === 'increase' ? '#E7F2E5' : '#FBEEEE',
                  }}
                >
                  {metric.change} {metric.changeType === 'increase' ? '↑' : '↓'}
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default LoyaltyMetrics;

