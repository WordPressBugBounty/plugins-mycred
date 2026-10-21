import React from 'react';
import { Box, Paper, Skeleton, Container } from '@mui/material';

export const CouponsSkeleton = () => {
    return (
        <Box sx={{ p: { xs: 1.5, md: 2.5 } }}>
            <Container maxWidth="xl" disableGutters>
                <Paper
                    elevation={0}
                    sx={{
                        bgcolor: '#ffffff',
                        border: '1px solid #e2d9f7',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        boxShadow: '0 2px 12px rgba(45, 21, 114, 0.03)'
                    }}
                >
                    {/* Header Skeleton */}
                    <Box sx={{ p: { xs: '16px 20px', md: '20px 24px' }, borderBottom: '1px solid #ebe5f7' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Skeleton variant="rectangular" width={140} height={28} sx={{ borderRadius: '6px' }} />
                                <Skeleton variant="rectangular" width={110} height={24} sx={{ borderRadius: '16px' }} />
                            </Box>
                            <Skeleton variant="rectangular" width={160} height={34} sx={{ borderRadius: '6px' }} />
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 0.5 }}>
                            <Skeleton variant="rectangular" width={220} height={34} sx={{ borderRadius: '6px' }} />
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Skeleton variant="rectangular" width={150} height={34} sx={{ borderRadius: '6px' }} />
                                <Skeleton variant="rectangular" width={140} height={34} sx={{ borderRadius: '6px' }} />
                                <Skeleton variant="rectangular" width={200} height={34} sx={{ borderRadius: '6px' }} />
                            </Box>
                        </Box>
                    </Box>

                    {/* Table Rows Skeleton */}
                    <Box sx={{ p: 2 }}>
                        {[1, 2, 3, 4, 5].map((item) => (
                            <Box
                                key={item}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    py: 1.8,
                                    borderBottom: '1px solid #ebe5f7',
                                    gap: 2
                                }}
                            >
                                <Skeleton variant="circular" width={16} height={16} />
                                <Skeleton variant="text" width="20%" height={22} />
                                <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: '6px' }} />
                                <Skeleton variant="text" width="12%" height={22} />
                                <Skeleton variant="text" width="18%" height={22} />
                                <Skeleton variant="rectangular" width={100} height={22} sx={{ borderRadius: '12px' }} />
                                <Skeleton variant="rectangular" width={110} height={22} sx={{ borderRadius: '4px' }} />
                            </Box>
                        ))}
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default CouponsSkeleton;
