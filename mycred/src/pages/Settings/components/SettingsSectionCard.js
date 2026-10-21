import { useMemo } from '@wordpress/element';
import { Paper } from '@mui/material';
import { COMPONENTS } from '../../../shared/adminTheme/tokens';

/**
 * Shared Settings section card.
 * variant="nested" — Loyalty-aligned white settings card (8px, 20px pad).
 * default/flat — no outer border (legacy in-card blocks).
 */
export default function SettingsSectionCard({ colors, children, variant = 'flat', sx = {}, ...rest }) {
    const cardSx = useMemo(
        () => {
            if (variant === 'nested') {
                return {
                    ...COMPONENTS.settingsCard,
                    bgcolor: colors.paper,
                    border: `1px solid ${colors.hookCardBorder || colors.border}`,
                    boxShadow: 'none',
                    height: 'auto',
                    minWidth: 0,
                    overflow: 'visible',
                    ...sx,
                };
            }

            return {
                ...COMPONENTS.sectionCard,
                borderRadius: 0,
                border: 'none',
                bgcolor: colors.paper,
                boxShadow: 'none',
                p: 0,
                height: 'auto',
                minWidth: 0,
                overflow: 'hidden',
                ...sx,
            };
        },
        [colors, sx, variant]
    );

    return (
        <Paper elevation={0} sx={cardSx} {...rest}>
            {children}
        </Paper>
    );
}
