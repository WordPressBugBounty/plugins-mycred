import React from 'react';
import { Box, Paper, Skeleton, Container } from '@mui/material';
import { useAdminTheme } from '../../../../src/shared/adminTheme/AdminThemeProvider';

export const BadgesSkeleton = () => {
    const { colors } = useAdminTheme();

    return (
        <Box sx={{ p: { xs: 1.5, md: 2.5 } }}>
            <Container maxWidth="xl" disableGutters>
                <Paper
                    elevation={0}
                    sx={{
                        bgcolor: colors.paper,
                        border: `1px solid ${colors.border}`,
                        borderRadius: '10px',
                        overflow: 'hidden'
                    }}
                >
                    {/* Header Section Skeleton */}
                    <Box sx={{ p: { xs: '16px 20px', md: '20px 24px' }, borderBottom: `1px solid ${colors.border}` }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Skeleton variant="text" width={140} height={32} sx={{ borderRadius: '4px' }} />
                                <Skeleton variant="rectangular" width={110} height={24} sx={{ borderRadius: '16px' }} />
                            </Box>
                            <Skeleton variant="rectangular" width={130} height={34} sx={{ borderRadius: '6px' }} />
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, pt: 0.5 }}>
                            <Skeleton variant="rectangular" width={220} height={30} sx={{ borderRadius: '6px' }} />
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Skeleton variant="rectangular" width={150} height={34} sx={{ borderRadius: '6px' }} />
                                <Skeleton variant="rectangular" width={120} height={34} sx={{ borderRadius: '6px' }} />
                                <Skeleton variant="rectangular" width={180} height={34} sx={{ borderRadius: '6px' }} />
                            </Box>
                        </Box>
                    </Box>

                    {/* Table Rows Skeleton */}
                    <Box sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', pb: 1.5, mb: 1.5, borderBottom: `1px solid ${colors.border}` }}>
                            <Skeleton variant="rectangular" width={18} height={18} sx={{ mr: 2, borderRadius: '3px' }} />
                            <Skeleton variant="text" width="25%" height={20} sx={{ mr: 4 }} />
                            <Skeleton variant="text" width="10%" height={20} sx={{ mr: 4 }} />
                            <Skeleton variant="text" width="35%" height={20} sx={{ mr: 4 }} />
                            <Skeleton variant="text" width="15%" height={20} />
                        </Box>

                        {[1, 2, 3, 4, 5].map((item) => (
                            <Box
                                key={item}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    py: 1.5,
                                    borderBottom: item !== 5 ? `1px solid ${colors.border}` : 'none'
                                }}
                            >
                                <Skeleton variant="rectangular" width={18} height={18} sx={{ mr: 2, borderRadius: '3px', flexShrink: 0 }} />
                                <Box sx={{ width: '25%', mr: 4 }}>
                                    <Skeleton variant="text" width="80%" height={20} />
                                    <Skeleton variant="text" width="40%" height={14} />
                                </Box>
                                <Box sx={{ width: '10%', mr: 4 }}>
                                    <Skeleton variant="rectangular" width={36} height={36} sx={{ borderRadius: '8px' }} />
                                </Box>
                                <Box sx={{ width: '35%', mr: 4 }}>
                                    <Skeleton variant="rectangular" width="95%" height={32} sx={{ borderRadius: '6px' }} />
                                </Box>
                                <Box sx={{ width: '15%' }}>
                                    <Skeleton variant="rectangular" width={80} height={22} sx={{ borderRadius: '12px' }} />
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};
