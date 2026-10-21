import React from 'react';
import { Box, Card, CardContent, Typography, Skeleton, IconButton } from '@mui/material';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import ShowChartOutlinedIcon from '@mui/icons-material/ShowChartOutlined';

const fontFamily = 'Figtree, Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

const cardSx = {
  borderRadius: '16px',
  border: '1px solid rgba(226, 221, 238, 0.85)',
  boxShadow: '0 4px 20px rgba(45, 21, 114, 0.05)',
  backgroundColor: '#ffffff',
  width: '100%',
  overflow: 'hidden',
};

const sectionTitleSx = {
  fontWeight: 700,
  fontFamily,
  color: '#2D1572',
  fontSize: '15px',
};

// Human-friendly label formatting for database reference keys
const formatKeyName = (key) => {
  if (!key) return '';
  const lower = key.toLowerCase();
  const map = {
    'buy_creds_with_bank': 'Bank Purchases',
    'buy creds with bank': 'Bank Purchases',
    'buy_creds_with_paypal_standard': 'PayPal Purchases',
    'buy creds with paypal standard': 'PayPal Purchases',
    'woocommerce_payment': 'WooCommerce',
    'woocommerce payment': 'WooCommerce',
    'cashcred_withdrawal': 'CashCred Withdrawals',
    'cashcred withdrawal': 'CashCred Withdrawals',
    'store_credit_purchase': 'Store Credit Purchases',
    'store credit purchase': 'Store Credit Purchases',
    'points_to_coupon': 'Coupon Redemptions',
    'points to coupon': 'Coupon Redemptions',
    'partial_payment': 'Partial Payments',
    'partial payment': 'Partial Payments',
    'site_visit': 'Site Visits',
    'site visit': 'Site Visits',
    'registration': 'Registrations',
    'reward': 'Rewards',
    'transfer': 'Transfers',
  };
  return map[lower] || (key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '));
};

const PALETTE = [
  '#7C3AED', // Royal Purple
  '#F59E0B', // Amber Gold
  '#10B981', // Emerald Green
  '#3B82F6', // Sky Blue
  '#EC4899', // Rose Pink
  '#06B6D4', // Modern Cyan
  '#8B5CF6', // Soft Violet
  '#F97316', // Orange
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const validEntries = payload.filter((e) => e.dataKey !== 'Total' && (Number(e.value) > 0 || payload.length === 1));
    const totalVal = validEntries.reduce((sum, e) => sum + (Number(e.value) || 0), 0);

    return (
      <Box
        sx={{
          p: 1.5,
          bgcolor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid rgba(226, 221, 238, 0.85)',
          boxShadow: '0 8px 24px rgba(45, 21, 114, 0.12)',
          fontFamily,
          minWidth: 160,
        }}
      >
        <Typography sx={{ fontWeight: 700, color: '#2D1572', mb: 1, fontSize: '13px', fontFamily }}>
          {label}
        </Typography>

        {validEntries.map((entry, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 0.6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: entry.color, flexShrink: 0 }} />
              <Typography sx={{ color: '#6B57A1', fontSize: '12px', fontFamily }}>
                {formatKeyName(entry.name || entry.dataKey)}
              </Typography>
            </Box>
            <Typography sx={{ color: '#2D1572', fontWeight: 700, fontSize: '12px', fontFamily }}>
              {Number(entry.value).toLocaleString()}
            </Typography>
          </Box>
        ))}

        {validEntries.length > 1 && (
          <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid #F1EDFA', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography sx={{ color: '#2D1572', fontSize: '12px', fontWeight: 700, fontFamily }}>
              Total
            </Typography>
            <Typography sx={{ color: '#7C3AED', fontSize: '13px', fontWeight: 800, fontFamily }}>
              {totalVal.toLocaleString()}
            </Typography>
          </Box>
        )}
      </Box>
    );
  }
  return null;
};

const Charts = ({ data, loading, error, pointTypeLabel, variant }) => {
  const [chartType, setChartType] = React.useState(variant || 'line');
  const valueLabel = pointTypeLabel || 'Points';

  const chartData = React.useMemo(() => {
    if (!Array.isArray(data) || !data.length) return null;

    const keys = new Set();
    data.forEach((item) => {
      Object.keys(item).forEach((key) => {
        if (key !== 'name' && key !== 'Total' && !key.includes('_formatted')) {
          keys.add(key);
        }
      });
    });

    return data.map((item) => {
      const normalized = { ...item };
      keys.forEach((key) => {
        if (normalized[key] === undefined) normalized[key] = 0;
      });
      return normalized;
    });
  }, [data]);

  // Extract only active categories (where sum > 0 across intervals)
  const dataKeys = React.useMemo(() => {
    if (!chartData || !chartData.length) return [];
    const keys = new Set();
    chartData.forEach((item) => {
      Object.keys(item).forEach((key) => {
        if (key !== 'name' && key !== 'Total' && !key.includes('_formatted')) {
          keys.add(key);
        }
      });
    });

    // Filter out categories with all 0s so legend stays clean
    return Array.from(keys).filter((key) => {
      const sum = chartData.reduce((acc, row) => acc + (Number(row[key]) || 0), 0);
      return sum > 0;
    });
  }, [chartData]);

  if (loading) {
    return (
      <Box sx={{ mt: 3, width: '100%' }}>
        <Card sx={cardSx}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Skeleton variant="text" width={180} height={32} />
              <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 1 }} />
            </Box>
            <Skeleton variant="rounded" height={320} sx={{ mt: 2 }} />
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (error || !chartData) {
    return (
      <Box sx={{ mt: 3, width: '100%' }}>
        <Card sx={cardSx}>
          <CardContent sx={{ p: 3 }}>
            <Typography sx={sectionTitleSx}>{valueLabel} Distribution</Typography>
            <Box sx={{ py: 8, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: error ? 'error.main' : '#6B57A1', fontFamily }}>
                {error ? `Failed to load chart data: ${error}` : 'No data available for the selected period.'}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 3, width: '100%' }}>
      <Card sx={cardSx}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography sx={sectionTitleSx}>
              {valueLabel} Distribution
            </Typography>

            <Box sx={{ display: 'flex', gap: 0.8, bgcolor: '#F5F3FF', p: 0.5, borderRadius: '8px' }}>
              <IconButton
                size="small"
                onClick={() => setChartType('bar')}
                sx={{
                  borderRadius: '6px',
                  bgcolor: chartType === 'bar' ? '#7C3AED' : 'transparent',
                  color: chartType === 'bar' ? '#ffffff' : '#6B57A1',
                  transition: 'all 0.2s ease',
                  '&:hover': { bgcolor: chartType === 'bar' ? '#6D28D9' : '#EDE9FE' },
                }}
              >
                <BarChartOutlinedIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => setChartType('line')}
                sx={{
                  borderRadius: '6px',
                  bgcolor: chartType === 'line' ? '#7C3AED' : 'transparent',
                  color: chartType === 'line' ? '#ffffff' : '#6B57A1',
                  transition: 'all 0.2s ease',
                  '&:hover': { bgcolor: chartType === 'line' ? '#6D28D9' : '#EDE9FE' },
                }}
              >
                <ShowChartOutlinedIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          <Box sx={{ width: '100%', height: 300, position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' ? (
                <BarChart data={chartData} margin={{ top: 10, right: 15, left: -15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0ECFC" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6B57A1', fontSize: 12, fontWeight: 500, fontFamily }}
                    dy={8}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6B57A1', fontSize: 12, fontWeight: 500, fontFamily }}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(124, 58, 237, 0.04)' }} />
                  {dataKeys.map((key, index) => (
                    <Bar
                      key={key}
                      dataKey={key}
                      name={formatKeyName(key)}
                      stackId="points_stack"
                      fill={PALETTE[index % PALETTE.length]}
                      radius={index === dataKeys.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                      barSize={40}
                    />
                  ))}
                </BarChart>
              ) : (
                <LineChart data={chartData} margin={{ top: 10, right: 15, left: -15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0ECFC" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6B57A1', fontSize: 12, fontWeight: 500, fontFamily }}
                    dy={8}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6B57A1', fontSize: 12, fontWeight: 500, fontFamily }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  {dataKeys.map((key, index) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      name={formatKeyName(key)}
                      stroke={PALETTE[index % PALETTE.length]}
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: PALETTE[index % PALETTE.length], strokeWidth: 2, stroke: '#ffffff' }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  ))}
                </LineChart>
              )}
            </ResponsiveContainer>
          </Box>

          {/* Clean Curated Legend */}
          {dataKeys.length > 0 && (
            <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #F5F3FF', display: 'flex', flexWrap: 'wrap', gap: '8px 18px', justifyContent: 'center' }}>
              {dataKeys.map((key, index) => (
                <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 9,
                      height: 9,
                      borderRadius: '50%',
                      bgcolor: PALETTE[index % PALETTE.length],
                      flexShrink: 0,
                    }}
                  />
                  <Typography sx={{ color: '#524B70', fontSize: '12px', fontWeight: 600, fontFamily }}>
                    {formatKeyName(key)}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Charts;

