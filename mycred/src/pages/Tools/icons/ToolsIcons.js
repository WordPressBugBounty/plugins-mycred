import React from 'react';

const iconProps = { width: 20, height: 20, fill: 'none', xmlns: 'http://www.w3.org/2000/svg' };

export const DocumentBulkIcon = ({ color = 'currentColor' }) => (
    <svg {...iconProps} viewBox="0 0 24 24" stroke={color} strokeWidth="1.5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="9" y1="15" x2="15" y2="15" />
    </svg>
);

export const UploadDownIcon = ({ color = 'currentColor' }) => (
    <svg {...iconProps} viewBox="0 0 24 24" stroke={color} strokeWidth="1.5">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
);

export const UploadUpIcon = ({ color = 'currentColor' }) => (
    <svg {...iconProps} viewBox="0 0 24 24" stroke={color} strokeWidth="1.5">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);

export const CoinsIcon = ({ color = 'currentColor', size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v8M9 10h6M9 14h6" />
    </svg>
);

export const BadgeIcon = ({ color = 'currentColor', size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
        <path d="M12 2l2.4 4.8L20 8l-4 3.9.9 5.5L12 15.8 7.1 17.4 8 11.9 4 8l5.6-1.2L12 2z" />
    </svg>
);

export const RankingIcon = ({ color = 'currentColor', size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
        <rect x="4" y="14" width="4" height="6" rx="1" />
        <rect x="10" y="8" width="4" height="12" rx="1" />
        <rect x="16" y="11" width="4" height="9" rx="1" />
    </svg>
);

export const SetupIcon = ({ color = 'currentColor', size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
    </svg>
);

export const TrophyIcon = ({ color = 'currentColor', size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
        <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z" />
        <path d="M7 4H5a2 2 0 0 0 0 4h2M17 4h2a2 2 0 0 1 0 4h-2" />
    </svg>
);
