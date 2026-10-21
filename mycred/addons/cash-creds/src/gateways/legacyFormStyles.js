const selectChevron = (hex) => {
    const encoded = encodeURIComponent(hex);
    return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='${encoded}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`;
};

export const getLegacyFormSx = (colors) => ({
    '& .form-group': { mb: '28px !important' },
    '& .form-group > label, & h3 + p > label, & .row > div > label': {
        display: 'block !important',
        marginBottom: '10px !important',
        fontWeight: '600 !important',
        fontSize: '14px !important',
        color: `${colors.textPrimary || colors.text} !important`,
        lineHeight: '1.2 !important',
    },
    '& input[type="text"].form-control, & input[type="number"].form-control, & input[type="email"].form-control, & input[type="password"].form-control, & select.form-control, & textarea.form-control': {
        width: '100% !important',
    },
    '& input[type="text"], & input[type="number"], & input[type="email"], & input[type="password"], & select, & textarea:not(.wp-editor-area)': {
        padding: '12px 16px !important',
        border: `1px solid ${colors.borderInput || colors.border} !important`,
        borderRadius: '8px !important',
        fontSize: '14px !important',
        color: `${colors.textPrimary || colors.text} !important`,
        fontFamily: '"Figtree", "Inter", sans-serif !important',
        transition: 'all 0.2s ease !important',
        boxSizing: 'border-box !important',
        backgroundColor: `${colors.paper} !important`,
        minHeight: '44px !important',
        lineHeight: 'normal !important',
        boxShadow: 'none !important',
        '&:focus': {
            borderColor: `${colors.primary} !important`,
            outline: 'none !important',
            boxShadow: `0 0 0 1px ${colors.primary} !important`,
        },
    },
    '& textarea:not(.wp-editor-area)': {
        height: 'auto !important',
        minHeight: '120px !important',
    },
    '& .checkbox, & .radio': {
        mb: '16px !important',
        mt: '0 !important',
        display: 'block !important',
    },
    '& select': {
        width: '100% !important',
        height: '44px !important',
        padding: '0 16px !important',
        borderRadius: '12px !important',
        border: `1px solid ${colors.border} !important`,
        backgroundColor: `${colors.paper} !important`,
        fontSize: '14px !important',
        color: `${colors.textPrimary || colors.text} !important`,
        appearance: 'none !important',
        backgroundImage: `${selectChevron(colors.textSecondary)} !important`,
        backgroundRepeat: 'no-repeat !important',
        backgroundPosition: 'right 12px center !important',
        backgroundSize: '18px !important',
        transition: 'all 0.2s ease !important',
        '&:focus': {
            borderColor: `${colors.primary} !important`,
            boxShadow: `0 0 0 4px ${colors.primary}20 !important`,
            outline: 'none !important',
        },
    },
    '& h3': {
        color: `${colors.textPrimary || colors.text} !important`,
        fontSize: '16px !important',
        fontWeight: '600 !important',
        marginBottom: '16px !important',
        marginTop: '24px !important',
    },
    '& .row': {
        display: 'flex !important',
        flexWrap: 'wrap !important',
        gap: '0 24px !important',
    },
    '& .row.is-hidden, & .row[hidden]': {
        display: 'none !important',
    },
    '& [class*="col-"]': {
        flex: '1 1 280px !important',
        minWidth: '0 !important',
    },
});
