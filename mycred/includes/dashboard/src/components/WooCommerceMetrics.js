import React from 'react';
import { Box, Card, CardContent, Typography, Skeleton } from '@mui/material';
import {
  PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend,
  ResponsiveContainer, BarChart, Bar, Sector
} from 'recharts';

import pointRewardedIcon from '../assets/metrics/point-rewarded.svg';
import pointUsageIcon from '../assets/metrics/point-usage.svg';
import referralIcon from '../assets/metrics/referral.svg';
import returningCustomersIcon from '../assets/metrics/returning-customers.svg';

const WooCommerceMetrics = ({ metrics, loading, error, pointTypeLabel, chartsComponent }) => {

  const sectionBoxSx = { px: 0, mt: 3, mb: 3 };

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

  const unitLabel = pointTypeLabel || 'Coins';

  const currencySymbol = window.mycredDashboardData?.currencySymbol || '$';

  const wooCommerceMetrics = [
    {
      id: 1,
      title: 'Points Earned',
      value: metrics?.point_rewarded_formatted ?? (metrics?.point_rewarded ?? '0'),
      icon: pointRewardedIcon,
      change: metrics?.point_rewarded_percent ?? '0%',
      changeType: changeTypeOf(metrics?.point_rewarded_percent),
    },
    {
      id: 2,
      title: 'Points Redeemed',
      value: metrics?.point_redeemed ?? '0', // Using point_redeemed for this slot
      icon: pointUsageIcon,
      change: metrics?.point_redeemed_percent ?? '0%',
      changeType: changeTypeOf(metrics?.point_redeemed_percent),
    },
    {
      id: 3,
      title: 'Revenue',
      value: metrics?.revenue ?? `${currencySymbol}0`, // Use dynamic symbol
      icon: referralIcon, // Placeholder icon
      change: metrics?.revenue_percent ?? '0%',
      changeType: changeTypeOf(metrics?.revenue_percent),
    },
    {
      id: 4,
      title: 'Avg Order Value Lift',
      value: metrics?.aov_lift ?? '0%', // Placeholder
      icon: returningCustomersIcon, // Placeholder icon
      change: metrics?.aov_lift_percent ?? '0%',
      changeType: changeTypeOf(metrics?.aov_lift_percent),
    }
  ];

  if (loading) {
    return (
      <Box sx={sectionBoxSx}>
        <Typography variant="h6" component="h2" className="section-title" sx={sectionTitleSx}>
          WooCommerce Metrics Hub
        </Typography>
        <Box sx={gridSx}>
          {Array.from({ length: 4 }, (_, i) => i + 1).map((i) => (
            <Card key={i} sx={cardSx}>
              <CardContent sx={cardContentSx}>
                <Box sx={{ mb: { xs: 1.5, md: 2 } }}>
                  <Skeleton variant="circular" width={56} height={56} />
                </Box>
                <Skeleton variant="text" width={80} height={36} sx={{ mb: { xs: 0.5, md: 1 } }} />
                <Skeleton variant="text" width={100} height={24} sx={{ mb: { xs: 1, md: 1.5 } }} />
                <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Skeleton variant="rectangular" width={72} height={28} sx={{ borderRadius: '999px' }} />
                  <Skeleton variant="text" width={60} height={20} />
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
        <Typography variant="h6" className="section-title" sx={{ mb: 3 }}>WooCommerce Metrics Hub</Typography>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!metrics) return null;

  const MetricCard = ({ metric }) => (
      <Card sx={cardSx}>
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
  );

  return (
    <Box sx={sectionBoxSx}>
      <Typography
        variant="h6"
        component="h2"
        className="section-title"
        sx={sectionTitleSx}
      >
        WooCommerce Metrics Hub
      </Typography>
      <Box sx={gridSx}>
        {wooCommerceMetrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </Box>

      {/* Charts Row 1: New vs Returning | Revenue Impact | Redemption Rate */}
      <Box sx={{ mt: 3, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
        {/* New vs Returning Chart */}
        <Card sx={{ ...cardSx, position: 'relative', overflow: 'hidden' }}>
          <CardContent sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography sx={{ color: '#2D1572', fontWeight: 700, mb: 1.5, fontFamily: 'Figtree, Poppins, sans-serif', fontSize: '15px' }}>
              New vs Returning Members
            </Typography>
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                position: 'relative',
                minHeight: 180,
              }}
            >
              <Box sx={{ width: '140px', height: '140px', position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={
                        metrics?.charts?.new_vs_returning && metrics.charts.new_vs_returning.length > 0
                          ? metrics.charts.new_vs_returning.map((d) => ({
                            name: d.name || 'Member',
                            value: typeof d.value === 'number' ? d.value : (parseInt(d.value, 10) || 0),
                          }))
                          : [
                            { name: 'New', value: 1 },
                            { name: 'Returning', value: 1 },
                          ]
                      }
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={60}
                      paddingAngle={3}
                      minAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      <Cell fill="#7C3AED" />
                      <Cell fill="#FF9D43" />
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      formatter={(value) => [value, 'Customers']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
                {(() => {
                  const data = metrics?.charts?.new_vs_returning || [];
                  const total = data.reduce((acc, curr) => acc + (parseInt(curr.value) || 0), 0);
                  const newVal = data.find(d => d.name === 'New')?.value || 0;
                  const retVal = data.find(d => d.name === 'Returning')?.value || 0;
                  const newPercent = total > 0 ? Math.round((newVal / total) * 100) : 50;
                  const retPercent = total > 0 ? Math.round((retVal / total) * 100) : 50;

                  return (
                    <>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#7C3AED' }} />
                          <Typography variant="body2" sx={{ color: '#2D1572', fontWeight: 600, fontSize: '12px' }}>New: {newPercent}%</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#FF9D43' }} />
                          <Typography variant="body2" sx={{ color: '#2D1572', fontWeight: 600, fontSize: '12px' }}>Ret: {retPercent}%</Typography>
                        </Box>
                      </Box>
                      <Typography sx={{ fontSize: '11px', color: '#6B57A1' }}>
                        Total Members: {total > 0 ? total : 2}
                      </Typography>
                    </>
                  );
                })()}
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Revenue Impact Analysis Chart */}
        <Card sx={{ ...cardSx, position: 'relative', overflow: 'hidden' }}>
          <CardContent sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography sx={{ color: '#2D1572', fontWeight: 700, mb: 1, fontFamily: 'Figtree, Poppins, sans-serif', fontSize: '15px' }}>
              Revenue Impact Analysis
            </Typography>

            <Box
              sx={{
                height: 150,
                mt: 'auto',
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={
                    metrics?.charts?.revenue_impact && metrics.charts.revenue_impact.length > 0
                      ? metrics.charts.revenue_impact
                      : [
                        { name: 'Week 1', with: 30, without: 20 },
                        { name: 'Week 2', with: 45, without: 25 },
                        { name: 'Week 3', with: 35, without: 22 },
                        { name: 'Week 4', with: 60, without: 30 },
                      ]
                  }
                  margin={{ top: 15, right: 15, left: -15, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0EDFF" vertical={true} horizontal={true} />
                  <XAxis
                    dataKey="name"
                    stroke="#B7AEE3"
                    tick={{ fill: '#7F7CA2', fontSize: 10.5, fontWeight: 500 }}
                    axisLine={{ stroke: '#E2DDEE' }}
                    tickLine={{ stroke: '#E2DDEE' }}
                  />
                  <YAxis
                    stroke="#B7AEE3"
                    tick={{ fill: '#7F7CA2', fontSize: 10.5, fontWeight: 500 }}
                    axisLine={{ stroke: '#E2DDEE' }}
                    tickLine={{ stroke: '#E2DDEE' }}
                    tickFormatter={(v) => `${currencySymbol}${v}`}
                  />
                  <RechartsTooltip
                    formatter={(value, name) => [
                      `${currencySymbol}${value.toLocaleString()}`,
                      name === 'with' ? 'With Rewards' : (name === 'without' ? 'Without Rewards' : name)
                    ]}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid rgba(226, 221, 238, 0.85)',
                      borderRadius: '10px',
                      boxShadow: '0 4px 16px rgba(45, 21, 114, 0.1)',
                      fontFamily: 'Figtree, Poppins, sans-serif',
                      fontSize: '12px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="with"
                    stroke="#7C3AED"
                    strokeWidth={2.5}
                    dot={{ fill: '#7C3AED', r: 3 }}
                    activeDot={{ r: 5, fill: '#7C3AED', stroke: '#fff', strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="without"
                    stroke="#FF9D43"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ fill: '#FF9D43', r: 3 }}
                    activeDot={{ r: 5, fill: '#FF9D43', stroke: '#fff', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>

            {/* Bottom Center Legend */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 1.5, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#7C3AED' }} />
                <Typography variant="body2" sx={{ color: '#4C4682', fontWeight: 600, fontSize: '11px', fontFamily: 'Figtree, Poppins, sans-serif' }}>With Rewards</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#FF9D43' }} />
                <Typography variant="body2" sx={{ color: '#4C4682', fontWeight: 600, fontSize: '11px', fontFamily: 'Figtree, Poppins, sans-serif' }}>Without Rewards</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Redemption Rate */}
        <Card sx={{ ...cardSx, position: 'relative', overflow: 'hidden' }}>
          <CardContent sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 1 }}>
              <Typography sx={{ color: '#2D1572', fontWeight: 700, fontFamily: 'Figtree, Poppins, sans-serif', fontSize: '15px' }}>
                Redemption Rate
              </Typography>
              <Typography variant="body2" sx={{ color: '#6B57A1', fontSize: '11.5px' }}>Customer reward usage</Typography>
            </Box>

            <Box
              sx={{
                width: '100%',
                height: 150,
                position: 'relative',
                mt: 'auto',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    <linearGradient id="gaugeGradientPurp" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#7C3AED" />
                      <stop offset="100%" stopColor="#9333EA" />
                    </linearGradient>
                  </defs>
                  <Pie
                    data={[
                      { name: 'Used', value: Math.min(Math.max(metrics?.charts?.redemption_rate?.[0]?.value || 0, 0), 100) },
                      { name: 'Remaining', value: 100 - Math.min(Math.max(metrics?.charts?.redemption_rate?.[0]?.value || 0, 0), 100) }
                    ]}
                    cx="50%"
                    cy="75%"
                    startAngle={180}
                    endAngle={0}
                    innerRadius={50}
                    outerRadius={68}
                    cornerRadius={8}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    <Cell key="cell-0" fill="url(#gaugeGradientPurp)" />
                    <Cell key="cell-1" fill="#ECE8F7" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Centered Percentage */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 14,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  textAlign: 'center',
                  pointerEvents: 'none',
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: '26px',
                    color: '#2D1572',
                    lineHeight: 1.1,
                    fontFamily: 'Figtree, Poppins, sans-serif',
                  }}
                >
                  {metrics?.charts?.redemption_rate?.[0]?.value || 0}%
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                mt: 'auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.6,
              }}
            >
              {(() => {
                const rateValue = metrics?.charts?.redemption_rate?.[0]?.value || 0;
                let label = 'Poor';
                let color = '#EF4444';
                let bgColor = '#FEF5F4';

                if (rateValue >= 20) {
                  label = 'Excellent';
                  color = '#10B981';
                  bgColor = '#F4FAF0';
                } else if (rateValue >= 10) {
                  label = 'Good';
                  color = '#10B981';
                  bgColor = '#F4FAF0';
                } else if (rateValue >= 5) {
                  label = 'Average';
                  color = '#F59E0B';
                  bgColor = '#FFFBEB';
                }

                return (
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.8,
                      px: 1.2,
                      py: 0.3,
                      borderRadius: '20px',
                      bgcolor: bgColor,
                    }}
                  >
                    <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: color }} />
                    <Typography sx={{ color: color, fontWeight: 700, fontSize: '12px', fontFamily: 'Figtree, Poppins, sans-serif' }}>
                      {label}
                    </Typography>
                  </Box>
                );
              })()}

              <Typography variant="body2" sx={{ color: '#7F7CA2', fontWeight: 500, fontSize: '11.5px', fontFamily: 'Figtree, Poppins, sans-serif' }}>
                {metrics?.point_redeemed_percent && metrics.point_redeemed_percent !== '0%' ? (
                  <>
                    <span style={{ color: changeTypeOf(metrics.point_redeemed_percent) === 'increase' ? '#10B981' : '#EF4444', fontWeight: 700 }}>
                      {metrics.point_redeemed_percent}
                    </span>
                    <span> vs last period</span>
                  </>
                ) : (
                  <span>No change</span>
                )}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Charts Row: Points Distribution */}
      {chartsComponent && (
        <Box sx={{ mt: 3, width: '100%' }}>
          {chartsComponent}
        </Box>
      )}

    </Box>
  );
};

export default WooCommerceMetrics;
