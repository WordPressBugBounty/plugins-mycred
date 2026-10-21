import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Avatar,
  Divider,
  Pagination
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const ActivityRow = ({ item, pointTypeLabel }) => {
  // Get initials from user name - take first letter of first name and last name
  const getInitials = (name) => {
    if (!name) return '??';
    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    // Take first letter of first word and first letter of last word
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(item.user_name);
  const positive = item.type === 'credit';

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
        <Avatar
          sx={{
            width: 40,
            height: 40,
            bgcolor: '#EBE4FF',
            color: '#8559FF',
            borderRadius: '24px',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 500,
            fontSize: 14,
            lineHeight: '100%'
          }}
        >
          {initials}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 14, lineHeight: '20px', color: '#2D1572', display: 'inline' }}>
            {item.user_name}{' '}
          </Typography>
          <Typography sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500, fontSize: 14, lineHeight: '20px', color: '#2D1572', display: 'inline' }}>
            {item.description}
          </Typography>
          <Typography sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 400, fontSize: 13, lineHeight: '18px', color: '#7F7CA2', display: 'block', mt: 0.5 }}>
            {item.time_ago}
          </Typography>
        </Box>
        <Typography sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500, fontSize: 14, lineHeight: '20px', color: positive ? '#2F6D3A' : '#C30000', textAlign: 'right' }}>
          {positive ? `+${item.points_formatted ?? item.points}` : `-${item.points_formatted ?? item.points}`}
        </Typography>
      </Box>
      <Divider sx={{ borderColor: '#E8E2F6' }} />
    </>
  );
};

const RecentActivityModal = ({ open, onClose, activities, pointTypeLabel }) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil((activities?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentActivities = activities?.slice(startIndex, endIndex) || [];

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  React.useEffect(() => {
    if (open) {
      setCurrentPage(1);
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          maxHeight: '80vh'
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #E8E2F6',
          fontFamily: 'Vollkorn',
          fontWeight: 600,
          fontSize: '24px',
          color: '#2D1572',
          px: 3,
          py: 2
        }}
      >
        Recent Activity
        <IconButton
          onClick={onClose}
          sx={{
            color: '#7F7CA2',
            '&:hover': {
              bgcolor: '#EBE4FF'
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ px: 3, py: 2 }}>
        {currentActivities.length === 0 ? (
          <Typography sx={{ textAlign: 'center', py: 4, color: '#7F7CA2' }}>
            No activities to display.
          </Typography>
        ) : (
          <>
            <Box>
              {currentActivities.map((item, index) => (
                <ActivityRow key={item.id || index} item={item} pointTypeLabel={pointTypeLabel} />
              ))}
            </Box>
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 1 }}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  sx={{
                    '& .MuiPaginationItem-root': {
                      fontFamily: 'Poppins, sans-serif',
                      '&.Mui-selected': {
                        bgcolor: '#7C55F3',
                        color: '#fff',
                        '&:hover': {
                          bgcolor: '#6844E0'
                        }
                      }
                    }
                  }}
                />
              </Box>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RecentActivityModal;
