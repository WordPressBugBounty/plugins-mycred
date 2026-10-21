import { Box, Typography, Button, Select, MenuItem, Stack } from '@mui/material';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import { FONTS } from '../../shared/adminTheme/tokens';

const getVisiblePages = (page, totalPages) => {
    if (totalPages <= 3) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (page <= 2) {
        return [1, 2, 3];
    }

    if (page >= totalPages - 1) {
        return [totalPages - 2, totalPages - 1, totalPages];
    }

    return [page - 1, page, page + 1];
};

const HooksPagination = ({
    totalCount,
    page,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange,
    colors,
}) => {
    const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage));
    const start = totalCount === 0 ? 0 : (page - 1) * rowsPerPage + 1;
    const end = Math.min(page * rowsPerPage, totalCount);
    const visiblePages = getVisiblePages(page, totalPages);

    const navBtnSx = {
        minWidth: 36,
        height: 32,
        borderRadius: '4px',
        color: colors.textSecondary,
        '&:hover': { bgcolor: 'transparent', color: colors.textSecondary },
        '&.Mui-disabled': { color: colors.textMuted },
    };

    const pageBtnSx = (active) => ({
        minWidth: 36,
        height: 32,
        borderRadius: '4px',
        fontSize: '14px',
        fontWeight: active ? 500 : 400,
        fontFamily: FONTS.sans,
        bgcolor: active ? colors.filterActiveBg : 'transparent',
        color: active ? colors.primary : colors.textSecondary,
        boxShadow: 'none',
        '&:hover': {
            bgcolor: active ? colors.filterActiveBg : 'transparent',
            color: active ? colors.primary : colors.textSecondary,
            boxShadow: 'none',
        },
    });

    return (
        <Box
            sx={{
                mt: 0,
                mb: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 2,
            }}
        >
            <Stack direction="row" spacing={2} alignItems="center">
                <Typography
                    variant="body2"
                    sx={{
                        color: colors.textSecondary,
                        fontFamily: FONTS.sans,
                        fontSize: '14px',
                    }}
                >
                    Rows per page
                </Typography>
                <Select
                    value={rowsPerPage}
                    onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
                    size="small"
                    sx={{
                        bgcolor: colors.paper,
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontFamily: FONTS.sans,
                        color: colors.textSecondary,
                        height: '40px',
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: colors.borderInput,
                        },
                    }}
                >
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={25}>25</MenuItem>
                    <MenuItem value={50}>50</MenuItem>
                </Select>
            </Stack>

            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0,
                    bgcolor: colors.paper,
                    p: '4px',
                    borderRadius: '8px',
                    border: `1px solid ${colors.borderInput}`,
                    height: '40px',
                    boxSizing: 'border-box',
                }}
            >
                <Button
                    size="small"
                    variant="text"
                    sx={navBtnSx}
                    disabled={page === 1}
                    onClick={() => onPageChange(1)}
                >
                    <KeyboardDoubleArrowLeftIcon fontSize="small" />
                </Button>
                <Button
                    size="small"
                    variant="text"
                    sx={navBtnSx}
                    disabled={page === 1}
                    onClick={() => onPageChange(page - 1)}
                >
                    <KeyboardArrowLeftIcon fontSize="small" />
                </Button>

                {visiblePages.map((pageNum) => (
                    <Button
                        key={pageNum}
                        size="small"
                        variant={page === pageNum ? 'contained' : 'text'}
                        onClick={() => onPageChange(pageNum)}
                        sx={pageBtnSx(page === pageNum)}
                    >
                        {pageNum}
                    </Button>
                ))}

                <Button
                    size="small"
                    variant="text"
                    sx={navBtnSx}
                    disabled={page === totalPages}
                    onClick={() => onPageChange(page + 1)}
                >
                    <KeyboardArrowRightIcon fontSize="small" />
                </Button>
                <Button
                    size="small"
                    variant="text"
                    sx={navBtnSx}
                    disabled={page === totalPages}
                    onClick={() => onPageChange(totalPages)}
                >
                    <KeyboardDoubleArrowRightIcon fontSize="small" />
                </Button>
            </Box>

            <Typography
                variant="body2"
                sx={{
                    color: colors.textSecondary,
                    fontFamily: FONTS.sans,
                    fontSize: '14px',
                }}
            >
                {`${start}-${end} of ${totalCount} entries`}
            </Typography>
        </Box>
    );
};

export default HooksPagination;
