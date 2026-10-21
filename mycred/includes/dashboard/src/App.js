import { ThemeProvider, createTheme } from '@mui/material/styles';
import ScopedCssBaseline from '@mui/material/ScopedCssBaseline';
import { Box, GlobalStyles } from '@mui/material';
import React from 'react';
import { Toaster } from 'react-hot-toast';
import FilterBar from './components/FilterBar';
import LoyaltyMetrics from './components/LoyaltyMetrics';
import WooCommerceMetrics from './components/WooCommerceMetrics';
import Charts from './components/Charts';
import RecentActivity from './components/RecentActivity';
import TopMembers from './components/TopMembers';
import ProBox from './components/ProBox';
import SingleUserDashboard from './components/single-user/SingleUserDashboard';
import DashboardSidebar from './components/DashboardSidebar';

import VollkornRegular from './assets/fonts/Vollkorn/static/Vollkorn-Regular.ttf';

const theme = createTheme({
  palette: {
    primary: {
      main: '#5E2CED',
    },
    secondary: {
      main: '#7B4B2C',
    },
    background: {
      default: '#f4efff',
    },
  },
  components: {
    MuiScopedCssBaseline: {
      styleOverrides: `
        @font-face {
          font-family: 'Vollkorn';
          src: url(${VollkornRegular}) format('truetype');
          font-weight: 400;
          font-style: normal;
        }

        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&display=swap');

        /* Scope dashboard fonts to React subtree only */
        .mycred-react-root, .mycred-react-root * { 
          font-family: 'Figtree', 'Poppins', 'Roboto', 'Helvetica', 'Arial', sans-serif !important; 
        }
        .mycred-react-root .section-title { 
          font-family: 'Figtree', 'Poppins', sans-serif !important; 
        }
      `,
    },
  },
});

const TwoColGrid = ({ children }) => (
  <Box sx={{ display: 'grid', gap: { xs: '16px', md: '24px' }, gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(2, minmax(0, 1fr))' }, width: '100%' }}>
    {children}
  </Box>
);

const Section = ({ children }) => (
  <Box sx={{ px: 0, mt: 3, width: '100%' }}>
    {children}
  </Box>
);

const getRestInfo = () => {
  const root = (window.mycredDashboardData && window.mycredDashboardData.restRoot)
    || (window.wpApiSettings && window.wpApiSettings.root)
    || '/wp-json/';
  const nonce = (window.mycredDashboardData && window.mycredDashboardData.restNonce)
    || (window.wpApiSettings && window.wpApiSettings.nonce)
    || undefined;
  return { root: String(root || '').replace(/\/+$/, ''), nonce };
};

const authHeaders = (nonce) => (nonce ? { 'X-WP-Nonce': nonce } : {});



const LowerSections = ({ visibility, dashboard, pointTypeLabel, showProBox = false }) => {
  const proBoxActive = Boolean(showProBox);

  return (
    <>
      {proBoxActive && (
        <ProBox container={true} />
      )}
      {(visibility.recentActivity || visibility.topMembers) && (
        <Section>
          <TwoColGrid>
            {visibility.recentActivity && (
              <Box sx={{ minWidth: 0, width: '100%' }}>
                <RecentActivity
                  activities={dashboard.data?.recentActivity}
                  loading={dashboard.loading}
                  error={dashboard.error}
                  pointTypeLabel={pointTypeLabel}
                />
              </Box>
            )}
            {visibility.topMembers && (
              <Box sx={{ minWidth: 0, width: '100%' }}>
                <TopMembers
                  members={dashboard.data?.topMembers}
                  loading={dashboard.loading}
                  error={dashboard.error}
                  pointTypeLabel={pointTypeLabel}
                />
              </Box>
            )}
          </TwoColGrid>
        </Section>
      )}
    </>
  );
};

function App({ settings = {} }) {
  const userFilterEnabled = settings?.enable_user_filter;
  const cTypesLabel = window.mycredDashboardData.pointTypesMap || {};

  const allowedPointTypesRaw = Array.isArray(settings?.dashboard_point_types) ? settings.dashboard_point_types : [];
  const allowedPointTypes = allowedPointTypesRaw.length > 0
    ? allowedPointTypesRaw.map((t) => (typeof t === 'string' ? t : (t?.id || t?.value || String(t))))
    : Object.keys(cTypesLabel);
  const configuredDefault = typeof settings?.dashboard_default_point === 'string' ? settings.dashboard_default_point : '';
  const defaultPointType = allowedPointTypes.includes(configuredDefault) ? configuredDefault : (allowedPointTypes[0] || '');
  const chartVariant = (settings?.dashboard_chart_type || 'line').toLowerCase();

  const [pointType, setPointType] = React.useState(defaultPointType);
  const [dateRange, setDateRange] = React.useState('This Month');
  const [customStartDate, setCustomStartDate] = React.useState('');
  const [customEndDate, setCustomEndDate] = React.useState('');
  // Initialize loading to true so skeletons show immediately
  const [dashboard, setDashboard] = React.useState({ loading: true, error: null, data: null });
  const [selectedUser, setSelectedUser] = React.useState(null);
  const [searchLoading, setSearchLoading] = React.useState(false);
  const abortRef = React.useRef(null);
  const [singleUserInsights, setSingleUserInsights] = React.useState({ loading: false, error: null, data: null });
  const singleUserFetchKeyRef = React.useRef('');

  const isToolkitProActive = dashboard.data?.toolkit_pro_enabled !== undefined
    ? Boolean(dashboard.data.toolkit_pro_enabled)
    : Boolean(window.mycredDashboardData?.dashboard_settings?.is_toolkit_pro_active);

  const isThisMonthRange = (label) => {
    const value = String(label || '').toLowerCase();
    return value === 'this month' || value === 'this_month' || value === 'month';
  };

  const mapRange = (label) => {
    const l = String(label || '').toLowerCase();
    if (l.includes('today')) return 'today';
    if (l.includes('week')) return 'this_week';
    if (l.includes('month')) return 'this_month';
    if (l.includes('custom')) return 'custom';
    return '';
  };

  const getPointTypeLabel = (pt) => {
    if (!pt) return '';

    const label = cTypesLabel[pt] || pt;
    return label.charAt(0).toUpperCase() + label.slice(1);
  };

  const pointTypeOptions = React.useMemo(() => {
    const map = cTypesLabel || {};
    if (Array.isArray(allowedPointTypes) && allowedPointTypes.length) {
      return allowedPointTypes.map((slug) => ({
        value: slug,
        label: map[slug] ? map[slug] : slug,
      }));
    }
    return Object.keys(map).map((slug) => ({ value: slug, label: map[slug] }));
  }, [allowedPointTypes, cTypesLabel]);

  const loadDashboard = React.useCallback(async (opts = {}) => {
    const { root, nonce } = getRestInfo();

    const pt = opts.pointType || pointType || defaultPointType;
    let range = mapRange(opts.dateRange || dateRange);
    if (!isToolkitProActive) {
      range = 'this_month';
    }
    const url = new URL(root + '/mycred-dashboard/v1/dashboard');

    if (pt) url.searchParams.set('point_type', pt);
    if (range) url.searchParams.set('range', range);
    if (range === 'custom') {
      if (opts.customStartDate) url.searchParams.set('start', opts.customStartDate);
      if (opts.customEndDate) url.searchParams.set('end', opts.customEndDate);
    }
    // Only set loading true if not already loading or if we want to force UI update
    setDashboard((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await fetch(url.toString(), { headers: { ...authHeaders(nonce) } });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      setDashboard({ loading: false, error: null, data });
    } catch (e) {
      setDashboard({ loading: false, error: e.message || String(e), data: null });
      console.error('Dashboard fetch failed', e);
    }
  }, [pointType, defaultPointType, dateRange, isToolkitProActive]);

  const handleDateRangeChange = React.useCallback((value) => {
    const next = typeof value === 'string' ? value : value?.target?.value;
    if (!isToolkitProActive && !isThisMonthRange(next)) {
      return;
    }
    setDateRange(next);
  }, [isToolkitProActive]);

  React.useEffect(() => {
    if (!isToolkitProActive && !isThisMonthRange(dateRange)) {
      setDateRange('This Month');
      setCustomStartDate('');
      setCustomEndDate('');
    }
  }, [isToolkitProActive, dateRange]);

  const lastFetchKeyRef = React.useRef('');

  React.useEffect(() => {
    // Don't fetch dashboard data if a user is selected (single user view)
    if (selectedUser) return;

    const pt = pointType || defaultPointType;
    if (!pt) return;

    // Don't auto-fetch if range is custom (handled by callbacks/explicit dates)
    const mapped = mapRange(dateRange);
    if (mapped === 'custom' || dateRange === 'Custom Range') return;

    const key = `${pt}|${dateRange}`;
    if (lastFetchKeyRef.current === key) return;
    lastFetchKeyRef.current = key;
    loadDashboard({ pointType: pt, dateRange });
  }, [pointType, dateRange, defaultPointType, loadDashboard, selectedUser]);

  const handleCustomRangeChange = React.useCallback((start, end) => {
    if (!isToolkitProActive) {
      return;
    }
    setCustomStartDate(start);
    setCustomEndDate(end);
    // Only load dashboard data if not in single user view
    if (!selectedUser && pointType && start && end) {
      // Always use 'custom' for API
      loadDashboard({ pointType, dateRange: 'custom', customStartDate: start, customEndDate: end });
    }
  }, [pointType, loadDashboard, selectedUser, isToolkitProActive]);

  React.useEffect(() => {
    if (dateRange !== 'Custom Range') {
      setCustomStartDate('');
      setCustomEndDate('');
    }
  }, [dateRange]);

  const defaultVisibility = {
    loyaltyMetricsHub: true,
    woocommerceMetricsHub: true,
    pointsDistribution: true,
    recentActivity: true,
    quickActions: true,
    topMembers: true,
  };

  // Initialize with defaults to show skeletons immediately
  const [visibility, setVisibilityState] = React.useState(defaultVisibility);
  // visibilityReady is no longer strictly needed for blocking render, 
  // but we can keep it if we want to know when settings are officially loaded.
  // We will simply remove the check from JSX to allow initial render.
  const [visibilityReady, setVisibilityReady] = React.useState(false);

  const saveDashboardSettings = async (newSettings) => {
    try {
      const { root, nonce } = getRestInfo();
      const url = root + '/mycred-dashboard/v1/dashboard-settings';
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(nonce),
        },
        body: JSON.stringify({ settings: newSettings }),
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      // Optionally handle response
    } catch (e) {
      // Optionally show error to user
      console.error('Failed to save dashboard settings', e);
    }
  };

  const setVisibilityLocal = (updater) => {
    setVisibilityState((prev) => (typeof updater === 'function' ? updater(prev || defaultVisibility) : updater));
  };

  const setVisibility = (updater) => {
    setVisibilityState((prev) => {
      const base = prev || defaultVisibility;
      const next = typeof updater === 'function' ? updater(base) : updater;
      saveDashboardSettings(next);
      return next;
    });
  };

  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { root, nonce } = getRestInfo();
        const url = root + '/mycred-dashboard/v1/dashboard-settings';
        const res = await fetch(url, { headers: { ...authHeaders(nonce) } });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        if (data && typeof data === 'object' && Object.keys(data).length > 0) {
          setVisibilityLocal((prev) => ({ ...defaultVisibility, ...data }));
        } else {
          setVisibilityLocal(defaultVisibility);
        }
        setVisibilityReady(true);
      } catch (e) {
        setVisibilityLocal(defaultVisibility);
        setVisibilityReady(true);
        console.warn('Failed to load dashboard settings, using defaults.', e);
      }
    };
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchSubmit = async (queryOrUser) => {
    if (!queryOrUser) return;
    try {
      if (abortRef.current) {
        abortRef.current.abort();
      }
      const controller = new AbortController();
      abortRef.current = controller;
      setSearchLoading(true);
      const { root, nonce } = getRestInfo();
      const base = root + '/';

      if (typeof queryOrUser === 'object' && queryOrUser.id) {
        const detailUrl = `${base}mycred-dashboard/v1/users/${encodeURIComponent(queryOrUser.id)}`;
        const dres = await fetch(detailUrl, { headers: { ...authHeaders(nonce) }, signal: controller.signal });
        if (!dres.ok) throw new Error(`HTTP ${dres.status}`);
        const detail = await dres.json();
        setSelectedUser(detail);
      } else {
        const q = String(queryOrUser);
        const url = `${base}mycred-dashboard/v1/search-users?search=${encodeURIComponent(q)}&per_page=5`;
        const res = await fetch(url, { headers: { ...authHeaders(nonce) }, signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const users = await res.json();
        if (Array.isArray(users) && users.length) {
          const first = users[0];
          const detailUrl = `${base}mycred-dashboard/v1/users/${encodeURIComponent(first.id)}`;
          const dres = await fetch(detailUrl, { headers: { ...authHeaders(nonce) }, signal: controller.signal });
          if (!dres.ok) throw new Error(`HTTP ${dres.status}`);
          const detail = await dres.json();
          setSelectedUser(detail);
        } else {
          setSelectedUser(null);
          Toaster.error('No user found');
          console.warn('No users found for query:', q);
        }
      }
    } catch (e) {
      if (e.name !== 'AbortError') {
        console.error('Search failed:', e);
      }
    }
    finally {
      setSearchLoading(false);
    }
  };

  const loadSingleUserInsights = React.useCallback(async (userId, opts = {}) => {
    if (!userId) {
      return;
    }

    const targetPointType = opts.pointType || pointType || defaultPointType;
    const rangeLabel = opts.dateRange || dateRange;
    const mappedRange = mapRange(rangeLabel);
    const customStart = opts.customStartDate || customStartDate;
    const customEnd = opts.customEndDate || customEndDate;

    const { root, nonce } = getRestInfo();
    const url = new URL(`${root}/mycred-dashboard/v1/users/${encodeURIComponent(userId)}/insights`);

    if (targetPointType) {
      url.searchParams.set('point_type', targetPointType);
    }

    if (mappedRange) {
      url.searchParams.set('range', mappedRange);
      if (mappedRange === 'custom') {
        if (customStart) {
          url.searchParams.set('start', customStart);
        }
        if (customEnd) {
          url.searchParams.set('end', customEnd);
        }
      }
    }

    setSingleUserInsights({ loading: true, error: null, data: null });

    try {
      const res = await fetch(url.toString(), { headers: { ...authHeaders(nonce) } });
      if (!res.ok) {
        throw new Error('HTTP ' + res.status);
      }
      const data = await res.json();
      setSingleUserInsights({ loading: false, error: null, data });
    } catch (err) {
      setSingleUserInsights({ loading: false, error: err.message || String(err), data: null });
      console.error('Failed to load single user insights', err);
    }
  }, [pointType, defaultPointType, dateRange, customStartDate, customEndDate]);

  const refreshDashboard = React.useCallback(async () => {
    if (selectedUser) {
      // Refresh both user data and insights
      loadSingleUserInsights(selectedUser.id);

      // Also refresh the user's basic data (earned_rank, earned_badges, etc.)
      try {
        const { root, nonce } = getRestInfo();
        const pt = pointType || defaultPointType;
        const userUrl = `${root}/mycred-dashboard/v1/users/${encodeURIComponent(selectedUser.id)}?point_type=${pt}`;
        const res = await fetch(userUrl, { headers: { ...authHeaders(nonce) } });
        if (res.ok) {
          const updatedUser = await res.json();
          setSelectedUser(updatedUser);
        }
      } catch (err) {
        console.error('Failed to refresh user data', err);
      }
      return;
    }
    if (dateRange === 'Custom Range' || mapRange(dateRange) === 'custom') {
      if (customStartDate && customEndDate) {
        loadDashboard({ pointType, dateRange: 'custom', customStartDate, customEndDate });
      }
      return;
    }
    loadDashboard({ pointType, dateRange });
  }, [loadDashboard, loadSingleUserInsights, selectedUser, pointType, dateRange, customStartDate, customEndDate, defaultPointType]);

  React.useEffect(() => {
    if (!selectedUser) {
      setSingleUserInsights({ loading: false, error: null, data: null });
      singleUserFetchKeyRef.current = '';
      return;
    }

    const targetId = selectedUser?.id;
    if (!targetId) {
      return;
    }

    const targetPointType = pointType || defaultPointType || '';

    // Check if we need to refresh the user data because point type changed
    if (selectedUser.point_type && targetPointType && selectedUser.point_type !== targetPointType) {
      // Avoid double fetching if we just did this
      // usage of a refined key or just relying on the fact that setSelectedUser will trigger re-render
      // and then point types will match.
      refreshDashboard();
    }

    const rangeLabel = dateRange || '';
    let key = `${targetId}|${targetPointType}|${rangeLabel}`;

    if (rangeLabel === 'Custom Range') {
      key += `|${customStartDate || ''}|${customEndDate || ''}`;
    }

    if (singleUserFetchKeyRef.current === key) {
      return;
    }

    singleUserFetchKeyRef.current = key;

    const opts = {
      pointType: targetPointType,
      dateRange,
    };

    if (dateRange === 'Custom Range') {
      opts.customStartDate = customStartDate;
      opts.customEndDate = customEndDate;
    }

    loadSingleUserInsights(targetId, opts);
  }, [selectedUser, pointType, defaultPointType, dateRange, customStartDate, customEndDate, loadSingleUserInsights, refreshDashboard]);

  const quickActionProps = React.useMemo(() => ({
    pointTypes: pointTypeOptions,
    defaultPointType,
    activePointType: pointType,
    onActionComplete: refreshDashboard,
    isProActive: isToolkitProActive,
    pointTypeLabel: getPointTypeLabel(pointType),
  }), [pointTypeOptions, defaultPointType, pointType, refreshDashboard, isToolkitProActive]);

  return (
    <ThemeProvider theme={theme}>
      <ScopedCssBaseline>
        <GlobalStyles
          styles={{
            '#wpcontent, #wpbody-content, #wpfooter': {
              backgroundColor: '#f4efff !important',
              background: 'radial-gradient(circle at 10% 20%, rgba(205, 185, 255, 0.45) 0%, transparent 60%), radial-gradient(circle at 90% 80%, rgba(185, 160, 255, 0.4) 0%, transparent 60%), #f4efff !important',
            },
          }}
        />
        <Box
          className="mycred-react-root"
          sx={{
            minHeight: '100vh',
            background:
              'radial-gradient(circle at 10% 20%, rgba(205, 185, 255, 0.45) 0%, transparent 60%), radial-gradient(circle at 90% 80%, rgba(185, 160, 255, 0.4) 0%, transparent 60%), radial-gradient(circle at 50% 50%, rgba(255, 235, 245, 0.3) 0%, transparent 70%), #f4efff',
            pb: 4,
          }}
        >


          <Box
            sx={{
              maxWidth: '1440px',
              mx: 'auto',
              px: { xs: 2, md: 3 },
              pt: { xs: 2, md: 2.5 },
            }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 280px' },
                gap: { xs: '16px', md: '20px' },
                alignItems: 'start',
              }}
            >
              {/* LEFT MAIN UNIFIED GLASS CARD CONTAINER */}
              <Box
                sx={{
                  background: 'rgba(255, 255, 255, 0.65)',
                  backdropFilter: 'blur(24px) saturate(190%)',
                  WebkitBackdropFilter: 'blur(24px) saturate(190%)',
                  border: '1px solid rgba(255, 255, 255, 0.85)',
                  borderRadius: '20px',
                  boxShadow: '0 20px 40px rgba(45, 21, 114, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.95)',
                  p: { xs: 2.5, md: 3 },
                  overflow: 'hidden',
                }}
              >
                {selectedUser ? (
                  <SingleUserDashboard
                    user={selectedUser}
                    onBack={() => {
                      setSelectedUser(null);
                      setSingleUserInsights({ loading: false, error: null, data: null });
                      singleUserFetchKeyRef.current = '';
                    }}
                    onSearchSubmit={handleSearchSubmit}
                    loading={searchLoading}
                    insights={singleUserInsights.data}
                    insightsLoading={singleUserInsights.loading}
                    insightsError={singleUserInsights.error}
                    pointTypeLabel={getPointTypeLabel(pointType)}
                    chartVariant={chartVariant}
                    currentPointType={pointType}
                    currentDateRange={dateRange}
                    onActionComplete={refreshDashboard}
                    onFiltersChange={(filters) => {
                      if (filters.pointType !== undefined && filters.pointType !== pointType) {
                        setPointType(filters.pointType);
                      }
                      if (filters.dateRange !== undefined && filters.dateRange !== dateRange) {
                        setDateRange(filters.dateRange);
                      }
                      if (filters.customStartDate !== undefined) {
                        setCustomStartDate(filters.customStartDate);
                      }
                      if (filters.customEndDate !== undefined) {
                        setCustomEndDate(filters.customEndDate);
                      }
                    }}
                    isProActive={isToolkitProActive}
                    visibility={visibility}
                    setVisibility={setVisibility}
                    pointTypes={allowedPointTypes}
                  />
                ) : (
                  <>
                    <FilterBar
                      visibility={visibility || defaultVisibility}
                      setVisibility={setVisibility}
                      onSearchSubmit={handleSearchSubmit}
                      loading={searchLoading}
                      userFilterEnabled={userFilterEnabled}
                      pointTypes={allowedPointTypes}
                      defaultPointType={defaultPointType}
                      pointType={pointType}
                      dateRange={dateRange}
                      onChangePointType={(e) => setPointType(typeof e === 'string' ? e : e?.target?.value)}
                      onChangeDateRange={handleDateRangeChange}
                      onCustomRangeChange={handleCustomRangeChange}
                      {...quickActionProps}
                    />

                    {visibility?.loyaltyMetricsHub && (
                      <LoyaltyMetrics
                        metrics={dashboard.data?.loyalty}
                        loading={dashboard.loading}
                        error={dashboard.error}
                        pointTypeLabel={getPointTypeLabel(pointType)}
                      />
                    )}

                    {visibility?.woocommerceMetricsHub &&
                      window.mycredDashboardData?.dashboard_settings?.is_woocommerce_active &&
                      (dashboard.loading || dashboard.data) && (
                        <WooCommerceMetrics
                          metrics={dashboard.data?.woocommerce}
                          loading={dashboard.loading}
                          error={dashboard.error}
                          pointTypeLabel={getPointTypeLabel(pointType)}
                          chartsComponent={
                            visibility?.pointsDistribution ? (
                              <Charts
                                data={dashboard.data?.chart?.data}
                                loading={dashboard.loading}
                                error={dashboard.error}
                                pointTypeLabel={getPointTypeLabel(pointType)}
                              />
                            ) : null
                          }
                        />
                      )}

                    {/* Standalone Charts fallback when WooCommerce is not active */}
                    {(!visibility?.woocommerceMetricsHub ||
                      !window.mycredDashboardData?.dashboard_settings?.is_woocommerce_active) &&
                      visibility?.pointsDistribution && (dashboard.loading || dashboard.data) && (
                        <Charts
                          data={dashboard.data?.chart?.data}
                          loading={dashboard.loading}
                          error={dashboard.error}
                          pointTypeLabel={getPointTypeLabel(pointType)}
                        />
                      )}

                    {visibility && (
                      <LowerSections
                        visibility={visibility}
                        dashboard={dashboard}
                        pointTypeLabel={getPointTypeLabel(pointType)}
                        showProBox={false}
                      />
                    )}
                  </>
                )}
              </Box>

              {/* RIGHT PROMOTIONAL SIDEBAR STACK (STICKY SCROLL) */}
              <Box
                sx={{
                  position: 'sticky',
                  top: { xs: '48px', md: '56px' },
                  alignSelf: 'start',
                  zIndex: 10,
                }}
              >
                <DashboardSidebar
                  isProActive={isToolkitProActive}
                  onOpenAwardModal={quickActionProps?.onAwardClick}
                  onOpenDeductModal={quickActionProps?.onDeductClick}
                  onOpenHooksModal={() => { window.location.href = 'admin.php?page=mycred-hooks'; }}
                  onOpenSettingsModal={() => { window.location.href = 'admin.php?page=mycred-settings'; }}
                />
              </Box>
            </Box>
          </Box>
        </Box>
        <Toaster position="bottom-right" reverseOrder={false} />
      </ScopedCssBaseline>
    </ThemeProvider>
  );
}

export default App;