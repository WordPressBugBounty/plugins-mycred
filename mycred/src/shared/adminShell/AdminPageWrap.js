import { Box } from '@mui/material';
import { ADMIN_PAGE_WRAP_SX } from './layout';

export default function AdminPageWrap({ children, sx = {} }) {
    return (
        <Box sx={{ ...ADMIN_PAGE_WRAP_SX, ...sx }}>
            {children}
        </Box>
    );
}
