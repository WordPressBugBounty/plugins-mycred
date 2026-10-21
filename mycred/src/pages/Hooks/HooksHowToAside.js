import { Box, Typography, Link } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { FONTS } from '../../shared/adminTheme/tokens';

const VIDEO_ID = 'ZD5al90h9Js';
const VIDEO_URL = `https://www.youtube.com/watch?v=${VIDEO_ID}`;
const EMBED_PARAMS = new URLSearchParams({
    modestbranding: '1',
    controls: '0',
    rel: '0',
    iv_load_policy: '3',
    fs: '0',
    disablekb: '1',
    cc_load_policy: '0',
    playsinline: '1',
}).toString();
const EMBED_URL = `https://www.youtube-nocookie.com/embed/${VIDEO_ID}?${EMBED_PARAMS}`;

const HooksHowToAside = ({ colors }) => (
    <Box
        component="aside"
        sx={{
            bgcolor: colors.paper,
            border: `1px solid ${colors.hookCardBorder}`,
            borderRadius: '14px',
            p: '18px',
            boxShadow: 'none',
            position: { lg: 'sticky' },
            top: { lg: 24 },
        }}
    >
        <Typography
            sx={{
                m: 0,
                fontSize: '15px',
                fontWeight: 700,
                lineHeight: '22px',
                color: colors.textPrimary,
                fontFamily: FONTS.sans,
            }}
        >
            How Hooks Work
        </Typography>
        <Typography
            sx={{
                mt: '6px',
                mb: '14px',
                fontSize: '13px',
                fontWeight: 400,
                lineHeight: '18px',
                color: colors.textSecondary,
                fontFamily: FONTS.sans,
            }}
        >
            Award points automatically when members take actions on your site.
        </Typography>

        <Box
            sx={{
                borderRadius: '8px',
                overflow: 'hidden',
                border: `1px solid ${colors.hookCardBorder}`,
                bgcolor: colors.textPrimary,
                aspectRatio: '16 / 10',
                position: 'relative',
            }}
        >
            <Box
                component="iframe"
                src={EMBED_URL}
                title="myCred Setup Hooks"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '112%',
                    height: '112%',
                    transform: 'translate(-50%, -50%)',
                    border: 0,
                    pointerEvents: 'auto',
                }}
            />
        </Box>

        <Link
            href={VIDEO_URL}
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
            sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                mt: '12px',
                fontSize: '13px',
                fontWeight: 600,
                color: colors.primary,
                fontFamily: FONTS.sans,
            }}
        >
            Watch on YouTube
            <OpenInNewIcon sx={{ fontSize: 14 }} />
        </Link>
    </Box>
);

export default HooksHowToAside;
