import React from 'react';
import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import upGraphIcon from '../../assets/single-user/ugraph.svg';
import downGraphIcon from '../../assets/single-user/dgraph.svg';

const getRestInfo = () => {
  const root = (window.mycredDashboardData && window.mycredDashboardData.restRoot)
    || (window.wpApiSettings && window.wpApiSettings.root)
    || '/wp-json/';
  const nonce = (window.mycredDashboardData && window.mycredDashboardData.restNonce)
    || (window.wpApiSettings && window.wpApiSettings.nonce)
    || undefined;
  return { root: String(root || '').replace(/\/+$/, ''), nonce };
};

const formatDate = (raw) => {
  if (!raw) return '';
  try {
    let date;
    // Support UNIX timestamps (seconds or milliseconds) and ISO strings
    if (typeof raw === 'number') {
      const ms = raw < 1e12 ? raw * 1000 : raw; // seconds -> ms
      date = new Date(ms);
    } else if (typeof raw === 'string' && /^\d+$/.test(raw.trim())) {
      const num = Number(raw.trim());
      const ms = num < 1e12 ? num * 1000 : num;
      date = new Date(ms);
    } else {
      date = new Date(raw);
    }

    if (Number.isNaN(date.getTime())) return '';

    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    };
    return date.toLocaleString('en-US', options);
  } catch (e) {
    return '';
  }
};

const PointsHistoryModal = ({
  open,
  onClose,
  user,
  pointType = '',
  pointTypeLabel = 'Points',
}) => {
  const [loading, setLoading] = React.useState(false);
  const [history, setHistory] = React.useState([]);
  const [filter, setFilter] = React.useState('most_recent');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [error, setError] = React.useState(null);
  
  const fetchHistory = React.useCallback(async () => {
    if (!user || !user.id) return;

    setLoading(true);
    setError(null);

    const { root, nonce } = getRestInfo();
    const url = new URL(`${root}/mycred-dashboard/v1/users/${user.id}/history`);
    
    if (pointType) {
      url.searchParams.set('point_type', pointType);
    }
   
    url.searchParams.set('filter', filter);
    url.searchParams.set('page', currentPage);
    url.searchParams.set('per_page', 10);

    const headers = nonce ? { 'X-WP-Nonce': nonce } : {};

    try {
      const res = await fetch(url.toString(), { headers });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      setHistory(Array.isArray(data.items) ? data.items : []);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      setError(err.message || 'Unable to load points history.');
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, [user, pointType, filter, currentPage]);

  React.useEffect(() => {
    if (open && user?.id) {
      setCurrentPage(1);
      fetchHistory();
    }
  }, [open, user, filter]);

  React.useEffect(() => {
    if (open && user?.id) {
      fetchHistory();
    }
  }, [currentPage, fetchHistory]);

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
    setCurrentPage(1);
  };

  const userName = user?.name || user?.display_name || user?.user_login || 'User';

  return (
    <Dialog
      open={Boolean(open)}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: { xs: 2.5, sm: 4 },
          width: '100%',
          height: '80%',
          backgroundColor: '#ffffff',
          zIndex: 1400,
          position: 'relative',
        },
      }}
      slotProps={{ backdrop: { sx: { backgroundColor: 'rgba(12, 8, 32, 0.5)' } } }}
      disableScrollLock
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Typography sx={{ color: '#2D1572', fontSize: 24, fontWeight: 600 }}>
            {pointTypeLabel} History - {userName}
          </Typography>
          <IconButton onClick={onClose} aria-label="close">
            <CloseIcon sx={{ color: '#7F7CA2' }} />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ color: '#756C8C', fontSize: 14 }}>Filter:</Typography>
            <FormControl size="small" sx={{ minWidth: 160  }}>
              <Select
                value={filter}
                onChange={handleFilterChange}
                displayEmpty
                sx={{
                  borderRadius: '4px',
                  width: 136,
                  height: 40,
                  backgroundColor: '#fff',
                  color: '#2D1572',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#E6E0F8',
                    borderWidth: '1px',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#E2DDEE',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#E2DDEE',
                  },
                }}
              >
                <MenuItem value="most_recent" sx={{ color: '#2D1572' }}>Most Recent</MenuItem>
                <MenuItem value="oldest_first" sx={{ color: '#2D1572' }}>Oldest First</MenuItem>
                <MenuItem value="highest_first" sx={{ color: '#2D1572' }}>Highest First</MenuItem>
                <MenuItem value="lowest_first" sx={{ color: '#2D1572' }}>Lowest First</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        <Box sx={{ 
          flex: 1,
          overflowY: 'auto',
          position: 'relative',
          mb: 3,
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: '#F8F6FF',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#D9D0FF',
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: '#B7AEE3',
            },
          },
        }}>
          {error ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography sx={{ color: '#CE6565', fontSize: 14 }}>{error}</Typography>
            </Box>
          ) : history.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography sx={{ color: '#7F7CA2', fontSize: 14 }}>No history found.</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {history.map((entry, index) => {
                const isPositive = entry.creds > 0;
                const points = Math.abs(entry.creds || 0);
                
                return (
                  <Box
                    key={entry.id || index}
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 2,
                      p: 3,
                      borderRadius: '4px',
                      backgroundColor: '#F8F6FF',
                      border: '1px solid #E2DDEE',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0px 4px 12px rgba(94, 44, 237, 0.1)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <img 
                        src={isPositive ? upGraphIcon : downGraphIcon} 
                        alt={isPositive ? 'Awarded' : 'Deducted'} 
                        style={{ width: 24, height: 24 }}
                      />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ color: '#2D1572', fontWeight: 600, fontSize: 16, mb: 0.5 }}>
                        {entry.entry || entry.description || 'No description'}
                      </Typography>
                      <Typography sx={{ color: '#756C8C', fontSize: 12 }}>
                        {formatDate(entry.time || entry.date)}
                      </Typography>
                    </Box>
                    <Typography
                      sx={{
                        color: isPositive ? '#178700' : '#C30000',
                        fontWeight: 500,
                        fontSize: 15,
                        flexShrink: 0,
                      }}
                    >
                      {isPositive ? '+' : '-'}{points} {pointTypeLabel.toLowerCase()}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          )}
          {loading && (
            <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.4)' }}>
              <CircularProgress sx={{ color: '#5E2CED' }} />
            </Box>
          )}
        </Box>

        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1.25, mb: 3, flexWrap: 'nowrap' }}>
            <Button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1 || loading}
              sx={{
                textTransform: 'none',
                color: '#756C8C',
                minWidth: 36,
                px: 1,
                '&:disabled': { color: '#B7AEE3' },
              }}
            >
              <ChevronLeftIcon sx={{ fontSize: 20, mr: 0.5 }} />
              Previous
            </Button>

            {(() => {
              const pages = [];
              if (totalPages <= 2) {
                for (let i = 1; i <= totalPages; i += 1) pages.push(i);
              } else if (currentPage <= 1) {
                pages.push(1, 2);
              } else if (currentPage >= totalPages) {
                pages.push(totalPages - 1, totalPages);
              } else {
                pages.push(currentPage - 1, currentPage, currentPage + 1);
              }
              return pages.map((page) => (
                <Button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  disabled={loading}
                  sx={{
                    minWidth: 36,
                    textTransform: 'none',
                    border: currentPage === page ? '1px solid #E6E0F8' : '1px solid transparent',
                    borderRadius: '8px',
                    color: currentPage === page ? '#2D1572' : '#756C8C',
                    backgroundColor: currentPage === page ? '#F8F6FF' : 'transparent',
                    '&:hover': {
                      backgroundColor: currentPage === page ? '#F0ECFF' : 'rgba(94, 44, 237, 0.08)',
                    },
                  }}
                >
                  {page}
                </Button>
              ));
            })()}

            <Button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || loading}
              sx={{
                textTransform: 'none',
                color: '#2D1572',
                minWidth: 36,
                px: 1,
                '&:disabled': { color: '#B7AEE3' },
              }}
            >
              Next
              <ChevronRightIcon sx={{ fontSize: 20, ml: 0.5 }} />
            </Button>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{
              borderRadius: '4px',
              textTransform: 'none',
              height: 40,
              width: 92,
              borderColor: '#E2DDEE',
              color: '#2D1572',
              '&:hover': {
                borderColor: '#E2DDEE',
                backgroundColor: 'white',
              },
            }}
          >
            Close
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

export default PointsHistoryModal;

