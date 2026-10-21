import { Box, FormControl, Select, MenuItem, Typography } from '@mui/material';
import { FONTS } from '../../shared/adminTheme/tokens';

const BASED_LABELS = {
    role: 'Select Role',
    badge: 'Select Badge',
    rank: 'Select Rank',
};

const LevelCredSelector = ({ value, onChange, levelCred, colors }) => {
    if (!levelCred?.enabled || !levelCred?.options?.length) {
        return null;
    }

    const label = BASED_LABELS[levelCred.based] || 'Select Level';

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                mb: 3,
                flexWrap: 'wrap',
            }}
        >
            <Typography
                sx={{
                    color: colors.textSecondary,
                    fontSize: '14px',
                    fontFamily: FONTS.sans,
                    fontWeight: 500,
                }}
            >
                {label}
            </Typography>
            <FormControl
                size="small"
                sx={{
                    minWidth: 220,
                    '& .MuiOutlinedInput-root': {
                        bgcolor: colors.paper,
                        borderRadius: '8px',
                        fontFamily: FONTS.sans,
                        fontSize: '14px',
                        color: colors.textPrimary,
                        '& fieldset': {
                            borderColor: colors.borderInput,
                        },
                        '&:hover fieldset': {
                            borderColor: colors.primary,
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: colors.primary,
                        },
                    },
                    '& .MuiSelect-icon': {
                        color: colors.textMuted,
                    },
                }}
            >
                <Select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    displayEmpty
                >
                    {levelCred.options.map((option) => (
                        <MenuItem
                            key={option.value || '__default__'}
                            value={option.value}
                            sx={{
                                fontFamily: FONTS.sans,
                                fontSize: '14px',
                            }}
                        >
                            {option.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>
    );
};

export default LevelCredSelector;
