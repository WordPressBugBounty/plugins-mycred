import { useState, useEffect, useMemo } from '@wordpress/element';
import { Box, Typography, Paper, Skeleton, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import { __ } from '@wordpress/i18n';
import { getLeaderboard } from '../../services/frontend-api';

const ASSETS_URL = window.mycredLoyaltyWidget?.assets_url || '';

const MEDALS = {
    1: ASSETS_URL + 'position-1.svg',
    2: ASSETS_URL + 'position-2.svg',
    3: ASSETS_URL + 'position-3.svg'
};

// Rank badge pill styles — matches known rank names, falls back to default
const getRankStyle = (rankName) => {
    if (!rankName || typeof rankName !== 'string') return null;
    const lower = rankName.toLowerCase();
    if (lower.includes('gold')) return { bg: '#FEF0AE', text: '#8B6713' };
    if (lower.includes('silver')) return { bg: '#E6E6E6', text: '#555555' };
    if (lower.includes('bronze')) return { bg: '#FDE4BA', text: '#8C3D27' };
    // Purple/generic fallback for custom rank names
    return { bg: '#EDE8FF', text: '#5E2CED' };
};

export default function BoardTab({ settings, currentContent, user, onBack, onClose }) {
    currentContent = currentContent || {};
    // Addon feature flags
    const addons = window.mycredLoyaltyWidget?.addons || {};
    const ranksEnabled = !!addons.ranks_enabled;
    const badgesEnabled = !!addons.badges_enabled;

    // Get unique point types from localized data
    const availableTypes = useMemo(() => {
        const types = window.mycredLoyaltyWidget?.point_types || {};
        if (Object.keys(types).length === 0) {
            types['mycred_default'] = __('Points', 'mycred');
        }
        return types;
    }, []);

    const pointTypeKeys = Object.keys(availableTypes);

    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [pointType, setPointType] = useState(pointTypeKeys[0] || 'mycred_default');

    const boardSettings = settings.tabs?.boardSettings || {};
    const displayOptions = boardSettings.displayOptions || {
        showUserAvatar: true,
        showUserRank: true,
        showPointsBalance: true,
        highlightCurrentUser: true,
        filterByPointType: true,
        showUserBadge: true,
    };
    const design = settings.design || {};
    const btnColor = design.buttonColor || '#5E2CED';
    const bgColor = design.backgroundColor || '#2D1572';

    const handleSelect = (typeKey) => {
        setPointType(typeKey);
        setIsOpen(false);
    };

    useEffect(() => {
        const fetchBoard = async () => {
            setLoading(true);
            try {
                const response = await getLeaderboard(pointType);
                if (response.success) {
                    setLeaderboard(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch leaderboard:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchBoard();
    }, [pointType]);

    // Close dropdown when clicking outside
    useEffect(() => {
        if (!isOpen) return;
        const close = () => setIsOpen(false);
        document.addEventListener('click', close);
        return () => document.removeEventListener('click', close);
    }, [isOpen]);

    const renderDataCard = (item) => {
        const position = item.position;
        const isCurrentUser = item.is_current_user;
        const medalSrc = MEDALS[position];
        const rankStyle = getRankStyle(item.rank);
        // Gate by both displayOptions AND addon being enabled
        const showRank = ranksEnabled && displayOptions.showUserRank !== false;
        const showAvatar = displayOptions.showUserAvatar !== false;
        const showBadge = badgesEnabled && displayOptions.showUserBadge !== false;
        const highlight = displayOptions.highlightCurrentUser !== false;

        // Dynamic card height: taller if rank/badge shown
        const hasSubInfo = showRank && item.rank;
        const cardHeight = hasSubInfo ? '88px' : '76px';

        return (
            <Paper
                key={item.id}
                elevation={0}
                sx={{
                    minHeight: cardHeight,
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    px: '16px',
                    mb: '10px',
                    bgcolor: (isCurrentUser && highlight) ? '#5E2CED0D' : '#FFFFFF',
                    border: (isCurrentUser && highlight)
                        ? '1.5px solid #5E2CED'
                        : '1.5px solid #F0F0FF',
                    position: 'relative',
                    overflow: 'visible',
                    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04)',
                    transition: 'box-shadow 0.2s',
                    gap: '10px',
                }}
            >
                {/* Medal / Position */}
                <Box sx={{
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                }}>
                    {medalSrc ? (
                        <img src={medalSrc} alt={`#${position}`} style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                    ) : (
                        <Typography sx={{ fontSize: '16px', fontWeight: 700, color: '#9A85D3' }}>
                            #{position}
                        </Typography>
                    )}
                </Box>

                {/* Avatar */}
                {showAvatar && (
                    <Box sx={{ position: 'relative', flexShrink: 0 }}>
                        <Box
                            component="img"
                            src={item.avatar}
                            alt={item.name}
                            onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=EDE8FF&color=5E2CED&size=40`; }}
                            sx={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: '2px solid #F0EEFF',
                            }}
                        />
                        {/* Top badge thumbnail overlaid on avatar */}
                        {showBadge && item.top_badge_image && (
                            <Box
                                component="img"
                                src={item.top_badge_image}
                                alt={item.top_badge_title || 'Badge'}
                                title={item.top_badge_title || 'Badge'}
                                sx={{
                                    position: 'absolute',
                                    bottom: '-4px',
                                    right: '-4px',
                                    width: '18px',
                                    height: '18px',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    border: '1.5px solid #fff',
                                    background: '#fff',
                                }}
                            />
                        )}
                    </Box>
                )}

                {/* Name + Rank Badge */}
                <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '3px' }}>
                    <Typography
                        noWrap
                        sx={{
                            fontSize: '14px',
                            fontWeight: 700,
                            color: '#2D1572',
                            lineHeight: 1.2,
                            fontFamily: "'Instrument Sans', sans-serif",
                        }}
                    >
                        {item.name}
                        {isCurrentUser && highlight && (
                            <Box component="span" sx={{ fontWeight: 400, color: '#5E2CED', ml: '4px', fontSize: '13px' }}>
                                ({__('You', 'mycred')})
                            </Box>
                        )}
                    </Typography>

                    {/* Rank pill */}
                    {showRank && item.rank && rankStyle && (
                        <Box sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            alignSelf: 'flex-start',
                            px: '8px',
                            py: '2px',
                            borderRadius: '20px',
                            bgcolor: rankStyle.bg,
                        }}>
                            <Typography sx={{
                                fontSize: '11px',
                                fontWeight: 600,
                                color: rankStyle.text,
                                lineHeight: 1.4,
                                fontFamily: "'Instrument Sans', sans-serif",
                            }}>
                                {__('Rank:', 'mycred')} {item.rank}
                            </Typography>
                        </Box>
                    )}
                </Box>

                {/* Points */}
                {displayOptions.showPointsBalance !== false && (
                    <Box sx={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
                        <Typography sx={{
                            fontSize: '18px',
                            fontWeight: 700,
                            color: '#2D1572',
                            lineHeight: 1.2,
                            fontFamily: "'Instrument Sans', sans-serif",
                        }}>
                            {item.raw_balance || 0}
                        </Typography>
                        <Typography sx={{
                            fontSize: '11px',
                            fontWeight: 400,
                            color: '#563BA1',
                            opacity: 0.7,
                            fontFamily: "'Instrument Sans', sans-serif",
                        }}>
                            {availableTypes[pointType] || __('Points', 'mycred')}
                        </Typography>
                    </Box>
                )}
            </Paper>
        );
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: bgColor }}>
            {/* Header */}
            <Box sx={{ p: '20px 24px', position: 'relative' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <IconButton size="small" onClick={onBack} sx={{ color: '#fff', p: 0 }}>
                        <ArrowBackIcon sx={{ fontSize: '20px' }} />
                    </IconButton>
                    <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#fff', fontFamily: "'Instrument Sans', sans-serif" }}>
                        {currentContent.boardMessage || __('Board', 'mycred')}
                    </Typography>
                </Box>
                <IconButton
                    size="small"
                    onClick={onClose}
                    sx={{ position: 'absolute', right: '20px', top: '20px', color: '#fff', p: 0 }}
                >
                    <CloseIcon sx={{ fontSize: '20px' }} />
                </IconButton>
            </Box>

            {/* Main Content Area */}
            <Box sx={{
                flex: 1,
                bgcolor: '#F8F6FF',
                borderRadius: '28px 28px 0 0',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
            }}>

                {/* Custom Dropdown */}
                {displayOptions.filterByPointType !== false && pointTypeKeys.length > 1 && (
                    <Box sx={{ px: '20px', pt: '20px', pb: '8px', position: 'relative', zIndex: 10 }}>
                        {/* Trigger */}
                        <Box
                            onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                            sx={{
                                bgcolor: '#fff',
                                border: `1.5px solid ${isOpen ? btnColor : '#E8E2FF'}`,
                                borderRadius: '12px',
                                height: '46px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                px: '14px',
                                cursor: 'pointer',
                                boxShadow: isOpen ? `0 0 0 3px ${bgColor}22` : '0px 2px 6px rgba(94,44,237,0.06)',
                                transition: 'border-color 0.2s, box-shadow 0.2s',
                                userSelect: 'none',
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {/* Coin icon */}
                                <Box sx={{
                                    width: '20px', height: '20px', borderRadius: '50%',
                                    bgcolor: `${btnColor}22`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Box sx={{
                                        width: '10px', height: '10px', borderRadius: '50%',
                                        bgcolor: bgColor,
                                    }} />
                                </Box>
                                <Typography sx={{
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    color: '#2D1572',
                                    fontFamily: "'Instrument Sans', sans-serif",
                                }}>
                                    {availableTypes[pointType] || __('Points', 'mycred')}
                                </Typography>
                            </Box>
                            {/* Chevron SVG */}
                            <Box sx={{
                                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                            }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M6 9l6 6 6-6" stroke={btnColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </Box>
                        </Box>

                        {/* Dropdown Menu */}
                        {isOpen && (
                            <Box
                                onClick={(e) => e.stopPropagation()}
                                sx={{
                                    position: 'absolute',
                                    top: 'calc(100% - 4px)',
                                    left: '20px',
                                    right: '20px',
                                    bgcolor: '#fff',
                                    border: `1.5px solid ${btnColor}33`,
                                    borderRadius: '12px',
                                    boxShadow: '0px 8px 24px rgba(94,44,237,0.12)',
                                    overflow: 'hidden',
                                    zIndex: 20,
                                }}
                            >
                                {pointTypeKeys.map((typeKey, i) => (
                                    <Box
                                        key={typeKey}
                                        onClick={() => handleSelect(typeKey)}
                                        sx={{
                                            px: '14px',
                                            py: '11px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            bgcolor: typeKey === pointType ? `${btnColor}0D` : 'transparent',
                                            borderBottom: i < pointTypeKeys.length - 1 ? '1px solid #F0EEFF' : 'none',
                                            '&:hover': {
                                                bgcolor: `${btnColor}08`,
                                            },
                                            transition: 'background 0.15s',
                                        }}
                                    >
                                        {/* Selected checkmark */}
                                        <Box sx={{ width: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {typeKey === pointType && (
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                                    <path d="M5 13l4 4L19 7" stroke={btnColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            )}
                                        </Box>
                                        <Typography sx={{
                                            fontSize: '14px',
                                            fontWeight: typeKey === pointType ? 600 : 400,
                                            color: typeKey === pointType ? btnColor : '#2D1572',
                                            fontFamily: "'Instrument Sans', sans-serif",
                                        }}>
                                            {availableTypes[typeKey]}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Box>
                )}

                {/* List of Users */}
                <Box sx={{
                    flex: 1,
                    px: '16px',
                    pb: '16px',
                    overflowY: 'auto',
                    scrollbarWidth: 'none',
                    '&::-webkit-scrollbar': { display: 'none' },
                    pt: displayOptions.filterByPointType !== false && pointTypeKeys.length > 1 ? '8px' : '20px',
                }}>
                    {loading ? (
                        [1, 2, 3, 4].map((i) => (
                            <Paper key={i} sx={{ height: '76px', borderRadius: '16px', mb: '10px', p: '16px', display: 'flex', alignItems: 'center', gap: '12px', border: '1.5px solid #F0F0FF' }}>
                                <Skeleton variant="rectangular" width={32} height={32} sx={{ borderRadius: '6px', flexShrink: 0 }} />
                                <Skeleton variant="circular" width={40} height={40} sx={{ flexShrink: 0 }} />
                                <Box sx={{ flex: 1 }}>
                                    <Skeleton variant="text" width="55%" height={16} />
                                    <Skeleton variant="text" width="30%" height={14} sx={{ mt: '4px' }} />
                                </Box>
                                <Box sx={{ textAlign: 'right' }}>
                                    <Skeleton variant="text" width={48} height={20} />
                                    <Skeleton variant="text" width={36} height={12} />
                                </Box>
                            </Paper>
                        ))
                    ) : (
                        <>
                            {leaderboard.map(item => renderDataCard(item))}

                            {leaderboard.length === 0 && (
                                <Box sx={{ textAlign: 'center', py: 5 }}>
                                    <Typography sx={{ color: '#563BA1', fontSize: '14px', fontFamily: "'Instrument Sans', sans-serif" }}>
                                        {boardSettings.leaderboard?.emptyMessage || __('No users to display', 'mycred')}
                                    </Typography>
                                </Box>
                            )}
                        </>
                    )}
                </Box>
            </Box>
        </Box>
    );
}
