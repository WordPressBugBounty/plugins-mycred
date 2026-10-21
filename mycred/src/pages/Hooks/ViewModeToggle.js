import { Box } from '@mui/material';
import ViewListIcon from '@mui/icons-material/ViewList';
import GridViewIcon from '@mui/icons-material/GridView';
import { FONTS } from '../../shared/adminTheme/tokens';

const ViewModeToggle = ({ viewMode, setViewMode, colors }) => {
    const pillGroupSx = {
        display: 'flex',
        alignItems: 'center',
        border: `1px solid ${colors.borderInput}`,
        borderRadius: '8px',
        p: '4px',
        gap: '2px',
        height: '40px',
        boxSizing: 'border-box',
        bgcolor: colors.paper,
    };

    const pillItemSx = (active) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '2px',
        px: 2,
        height: '32px',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        bgcolor: active ? colors.filterActiveBg : 'transparent',
        color: active ? colors.primary : colors.textSecondary,
        fontWeight: 500,
        fontSize: '14px',
        fontFamily: FONTS.sans,
    });

    return (
        <Box sx={pillGroupSx}>
            {[
                { val: 'list', label: 'List', icon: <ViewListIcon sx={{ fontSize: '16px' }} /> },
                { val: 'grid', label: 'Grid', icon: <GridViewIcon sx={{ fontSize: '16px' }} /> },
            ].map(({ val, label, icon }) => (
                <Box
                    key={val}
                    onClick={() => setViewMode(val)}
                    sx={pillItemSx(viewMode === val)}
                >
                    {icon}
                    {label}
                </Box>
            ))}
        </Box>
    );
};

export default ViewModeToggle;
