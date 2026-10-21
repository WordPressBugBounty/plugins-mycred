import React from 'react';
import { Box } from '@mui/material';
import FilterBar from '../FilterBar';
// import SingleUserToolbar from './SingleUserToolbar';
import UserSummaryCard from './UserSummaryCard';
import UserQuickActions from './UserQuickActions';
import Charts from '../Charts';
import TopMembers from '../TopMembers';
import FilterModal from '../modal/FilterModal';

const TwoCol = ({ children }) => (
  <Box sx={{
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', lg: '1.85fr 1.15fr' },
    gap: { xs: '16px', md: '24px' },
    mt: 3,
    width: '100%',
  }}>
    {children}
  </Box>
);

const SingleUserDashboard = ({
  user,
  onBack,
  onSearchSubmit,
  loading,
  insights,
  insightsLoading,
  insightsError,
  pointTypeLabel,
  chartVariant,
  onFiltersChange,
  currentPointType,
  currentDateRange,
  onActionComplete,
  isProActive = false,
  visibility,
  setVisibility,
  pointTypes: propPointTypes,
}) => {
  const distribution = insights?.distribution;
  const members = insights?.top_members;
  const summary = insights?.summary;

  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [pointType, setPointType] = React.useState(currentPointType || '');
  const [dateRange, setDateRange] = React.useState(currentDateRange || 'this_month');
  const [customStartDate, setCustomStartDate] = React.useState('');
  const [customEndDate, setCustomEndDate] = React.useState('');

  React.useEffect(() => {
    if (currentPointType !== undefined && currentPointType !== pointType) {
      setPointType(currentPointType);
    }
  }, [currentPointType]);

  React.useEffect(() => {
    if (currentDateRange !== undefined && currentDateRange !== dateRange) {
      setDateRange(currentDateRange);
    }
  }, [currentDateRange]);

  const pointTypes = React.useMemo(() => {
    if (propPointTypes && propPointTypes.length) return propPointTypes;
    return (typeof window !== 'undefined' && window.mycredDashboardData && window.mycredDashboardData.dashboard_settings?.dashboard_point_types) || [];
  }, [propPointTypes]);

  const handlePointTypeChange = (e) => {
    const newPointType = e.target.value;
    setPointType(newPointType);
    if (onFiltersChange && typeof onFiltersChange === 'function') {
      onFiltersChange({ pointType: newPointType, dateRange, customStartDate, customEndDate });
    }
  };

  const handleDateRangeChange = (newDateRange) => {
    setDateRange(newDateRange);
    if (newDateRange !== 'custom' && onFiltersChange && typeof onFiltersChange === 'function') {
      onFiltersChange({ pointType, dateRange: newDateRange });
    }
  };

  const handleCustomRangeSelected = (start, end) => {
    setCustomStartDate(start);
    setCustomEndDate(end);
    if (onFiltersChange && typeof onFiltersChange === 'function' && start && end) {
      onFiltersChange({ pointType, dateRange: 'custom', customStartDate: start, customEndDate: end });
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <FilterBar
        visibility={visibility}
        setVisibility={setVisibility}
        onSearchSubmit={onSearchSubmit}
        loading={loading}
        pointTypes={pointTypes}
        pointType={pointType}
        dateRange={dateRange}
        onChangePointType={handlePointTypeChange}
        onChangeDateRange={handleDateRangeChange}
        onCustomRangeChange={handleCustomRangeSelected}
        onBack={onBack}
        showQuickActions={false}
        disableSettings={true}
        pointTypeLabel={pointTypeLabel}
        isProActive={isProActive}
      />

      <TwoCol>
        <UserSummaryCard user={user} summary={summary} pointTypeLabel={pointTypeLabel} />
        <UserQuickActions
          pointTypeLabel={pointTypeLabel}
          user={user}
          isProActive={isProActive}
          pointTypes={pointTypes}
          defaultPointType={pointType || (pointTypes[0]?.value || '')}
          activePointType={pointType}
          onActionComplete={onActionComplete}
        />
      </TwoCol>

      <Box sx={{ mt: 3, width: '100%' }}>
        <Charts variant={chartVariant || 'bar'} data={distribution} loading={insightsLoading} error={insightsError} pointTypeLabel={pointTypeLabel} />
      </Box>

      <Box sx={{ mt: 3, width: '100%' }}>
        <TopMembers
          members={members}
          loading={insightsLoading}
          error={insightsError}
          pointTypeLabel={pointTypeLabel}
          highlightUserId={user?.id}
        />
      </Box>

      <FilterModal
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        pointTypes={pointTypes}
        pointType={pointType}
        onChangePointType={handlePointTypeChange}
        dateRange={dateRange}
        onChangeDateRange={handleDateRangeChange}
        customStartDate={customStartDate}
        customEndDate={customEndDate}
        onChangeCustomStartDate={(e) => setCustomStartDate(e.target.value)}
        onChangeCustomEndDate={(e) => setCustomEndDate(e.target.value)}
        onCustomRangeSelected={handleCustomRangeSelected}
      />
    </Box>
  );
};

export default SingleUserDashboard;
