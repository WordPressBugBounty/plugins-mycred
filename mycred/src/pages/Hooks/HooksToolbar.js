import { Box, InputBase } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { FONTS } from '../../shared/adminTheme/tokens';

const HooksToolbar = ({
    searchTerm,
    setSearchTerm,
    colors,
}) => {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                flexWrap: 'wrap',
                mb: 2,
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    bgcolor: colors.paper,
                    borderRadius: '8px',
                    px: '12px',
                    height: '40px',
                    width: '100%',
                    maxWidth: '392px',
                    flex: '1 1 280px',
                    border: `1px solid ${colors.borderInput}`,
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                    '&:focus-within': {
                        borderColor: colors.primary,
                    },
                }}
            >
                <SearchIcon sx={{ color: colors.textMuted, mr: 1, fontSize: '24px' }} />
                <InputBase
                    placeholder="Search hooks by name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    fullWidth
                    sx={{
                        fontSize: '14px',
                        color: colors.textPrimary,
                        fontFamily: FONTS.sans,
                        '& .MuiInputBase-input': {
                            border: 'none !important',
                            boxShadow: 'none !important',
                            bgcolor: 'transparent !important',
                            outline: 'none !important',
                            p: 0,
                            m: 0,
                            height: 'auto',
                            minHeight: 0,
                        },
                        '& .MuiInputBase-input::placeholder': {
                            color: colors.textMuted,
                            opacity: 1,
                        },
                    }}
                />
            </Box>
        </Box>
    );
};

export default HooksToolbar;
