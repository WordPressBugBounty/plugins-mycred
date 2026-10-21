import { Box, Typography, Button, Chip } from '@mui/material';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { COLORS, RADIUS } from '../adminTheme/tokens';

const DEFAULT_PRICING_BASE = 'https://mycred.me/pricing/?utm_source=plugin&utm_medium=';

const isToolkitProActive = () =>
    Boolean(
        window.mycredSettingsData?.isProActive ||
        window.mycredToolsData?.isProActive ||
        window.mycredWooCommerceSettings?.isProActive ||
        window.mycredBuycredGateways?.isProActive ||
        window.mycredCashcredGateways?.isProActive ||
        window.mycredBankingSettings?.isProActive ||
        window.mycredLoyaltyWidgetData?.isProActive ||
        window.mycredDashboardData?.isProActive ||
        window.mycredLoyaltyCardData?.isPro
    );

/**
 * Shared myCred Pro upsell card used across admin sidebars.
 *
 * @param {object} props
 * @param {object} [props.colors] Optional theme colors; falls back to admin tokens.
 * @param {string} [props.utmMedium='settings_sidebar'] Used for the pricing URL when proDemoUrl is not provided.
 * @param {object} [props.sx] Extra sx merged onto the root Box.
 * @param {boolean} [props.forceShow] Skip the Pro-active hide (tests / overrides).
 */
const SidebarPromoCard = ({
    colors: colorsProp,
    utmMedium = 'settings_sidebar',
    sx = {},
    forceShow = false,
}) => {
    if (!forceShow && isToolkitProActive()) {
        return null;
    }

    const colors = colorsProp || COLORS;

    const demoUrl =
        window.mycredSettingsData?.proDemoUrl ||
        window.mycredToolsData?.proDemoUrl ||
        window.mycredLoyaltyWidgetData?.proDemoUrl ||
        window.mycredLoyaltyCardData?.proDemoUrl ||
        `${DEFAULT_PRICING_BASE}${utmMedium}`;

    const promoImageUrl =
        window.mycredSettingsData?.proPromoImageUrl ||
        window.mycredToolsData?.proPromoImageUrl ||
        window.mycredLoyaltyWidgetData?.proPromoImageUrl ||
        window.mycredWooCommerceSettings?.proPromoImageUrl ||
        window.mycredBuycredGateways?.proPromoImageUrl ||
        window.mycredPendingPaymentsData?.proPromoImageUrl ||
        window.mycredCashcredGateways?.proPromoImageUrl ||
        window.mycredCashcredWithdrawalsData?.proPromoImageUrl ||
        window.mycredLoyaltyCardData?.proPromoImageUrl ||
        '';

    const white = colors.white || COLORS.white;
    const brand = '#5B2EE0';
    const headingDark = '#1E1B4B';
    const bodyText = '#4B4F7A';

    return (
        <Box
            sx={{
                position: 'relative',
                overflow: 'hidden',
                width: '100%',
                height: '520px',
                boxSizing: 'border-box',
                border: '1px solid #E4DAFF',
                borderRadius: RADIUS.card,
                p: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                backgroundColor: '#F4EEFF',
                backgroundImage: promoImageUrl ? `url(${promoImageUrl})` : 'none',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center center',
                backgroundSize: 'cover',
                ...sx,
            }}
        >
            <Chip
                label="PRO"
                size="small"
                sx={{
                    position: 'relative',
                    zIndex: 1,
                    alignSelf: 'flex-start',
                    height: 22,
                    borderRadius: '999px',
                    bgcolor: brand,
                    color: white,
                    fontWeight: 700,
                    fontSize: '11px',
                    letterSpacing: '0.08em',
                    '& .MuiChip-label': {
                        px: '12px',
                    },
                }}
            />

            <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography
                    sx={{
                        fontSize: '22px',
                        lineHeight: 1.2,
                        fontWeight: 800,
                        letterSpacing: '-0.01em',
                        color: headingDark,
                    }}
                >
                    Extract More Out of
                </Typography>
                <Typography
                    sx={{
                        fontSize: '26px',
                        lineHeight: 1.15,
                        fontWeight: 800,
                        letterSpacing: '-0.01em',
                        color: brand,
                    }}
                >
                    myCred Pro
                </Typography>
            </Box>

            <Typography
                sx={{
                    position: 'relative',
                    zIndex: 1,
                    fontSize: '13px',
                    lineHeight: 1.55,
                    color: bodyText,
                }}
            >
                myCred is more than just a points and rewards plugin. Its a complete loyalty and gamification engine. Explore Pro features by clicking the button below.
            </Typography>

            <Box
                aria-hidden="true"
                sx={{
                    flexGrow: 1,
                    minHeight: '130px',
                    pointerEvents: 'none',
                }}
            />

            <Button
                variant="contained"
                onClick={() => window.open(demoUrl, '_blank', 'noopener')}
                fullWidth
                startIcon={<RocketLaunchIcon sx={{ fontSize: 20 }} />}
                endIcon={<ArrowForwardIcon sx={{ fontSize: 18 }} />}
                sx={{
                    position: 'relative',
                    zIndex: 1,
                    background: `linear-gradient(135deg, ${brand} 0%, #4F24D6 100%)`,
                    color: white,
                    fontSize: '14px',
                    fontWeight: 600,
                    lineHeight: 1.2,
                    borderRadius: RADIUS.control,
                    py: '14px',
                    px: '12px',
                    justifyContent: 'center',
                    boxShadow: 'none',
                    textTransform: 'none',
                    whiteSpace: 'nowrap',
                    '& .MuiButton-startIcon': { mr: '8px', ml: 0 },
                    '& .MuiButton-endIcon': { ml: '8px', mr: 0 },
                    '&:hover': {
                        background: 'linear-gradient(135deg, #4B24BE 0%, #3F1DA3 100%)',
                        boxShadow: 'none',
                    },
                }}
            >
                Explore myCred Pro
            </Button>
        </Box>
    );
};

export default SidebarPromoCard;
