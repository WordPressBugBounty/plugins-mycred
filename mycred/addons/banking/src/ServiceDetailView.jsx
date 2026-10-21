import React, { useEffect } from 'react';
import { Box, Typography, Button, Divider, Chip } from '@mui/material';
import { useAdminTheme } from '../../../src/shared/adminTheme/AdminThemeProvider';
import SettingsIcon from '@mui/icons-material/Settings';
import toast from 'react-hot-toast';
import { getLegacyFormSx } from './legacyFormStyles';
import { ADMIN_FORM_MAX_WIDTH } from '../../../src/shared/adminShell/layout.js';

export default function ServiceDetailView({ service, onSaveSuccess }) {
    const { colors } = useAdminTheme();
    const legacyFormSx = getLegacyFormSx(colors);

    const handleSave = async (e) => {
        e.preventDefault();

        const form = document.querySelector('form[action="options.php"]');
        if (!form) {
            toast.error('Settings form not found.');
            return;
        }

        const formData = new FormData(form);
        const toastId = toast.loading('Saving settings...');

        try {
            const actionUrl = form.getAttribute('action');
            await fetch(actionUrl, {
                method: 'POST',
                body: formData,
                credentials: 'same-origin',
                redirect: 'manual',
            });
            toast.success('Settings updated successfully!', { id: toastId });
            if (onSaveSuccess) onSaveSuccess();
        } catch (err) {
            console.error(err);
            toast.error('Failed to save settings.', { id: toastId });
        }
    };

    if (!service) return null;

    useEffect(() => {
        if (service && service.preferences_html) {
            setTimeout(() => {
                if (window.jQuery && window.jQuery.fn.select2) {
                    const $select = window.jQuery('.mycred_bank_id_select2');
                    if ($select.length) {
                        const nonce = $select.data('nonce') || '';
                        $select.select2({
                            width: '100%',
                            minimumInputLength: 1,
                            placeholder: "Select a user",
                            ajax: {
                                url: window.ajaxurl || '/wp-admin/admin-ajax.php',
                                dataType: 'json',
                                delay: 1000,
                                data: function (params) {
                                    return {
                                        search: params.term,
                                        page: params.page || 1,
                                        action: 'get_bank_accounts_' + (window.mycredBankingSettings?.pointType || 'mycred_default'),
                                        nonce: nonce
                                    };
                                },
                                processResults: function( data ) {
                                    var options = [];
                                    if ( data.users ) {
                                        window.jQuery.each( data.users, function( index, user ) {
                                            options.push( { id: user.ID, text: '#'+user.ID+' - '+user.display_name+' ('+user.user_email+')' } );
                                        });
                                    }
                                    return {
                                        results: options,
                                        pagination: {
                                            'more': data.more
                                        }
                                    };
                                },
                                cache: true
                            }
                        });
                    }
                }
            }, 50);
        }
    }, [service]);

    const isActive = service.is_active;

    return (
        <Box sx={{ p: '40px', maxWidth: ADMIN_FORM_MAX_WIDTH }}>
            {/* Header row */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                        sx={{
                            bgcolor: isActive
                                ? colors.primaryLight
                                : 'rgba(0,0,0,0.05)',
                            color: isActive
                                ? colors.primary
                                : colors.textSecondary,
                            borderRadius: '12px',
                            width: '56px',
                            height: '56px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 3,
                            flexShrink: 0,
                        }}
                    >
                        <SettingsIcon sx={{ fontSize: '28px' }} />
                    </Box>
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Typography variant="h5" sx={{ fontWeight: 600, fontSize: '20px' }}>
                                {service.title}
                            </Typography>
                            <Chip
                                label={isActive ? 'Active' : 'Disabled'}
                                size="small"
                                sx={{
                                    height: 22,
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    borderRadius: '4px',
                                    bgcolor: isActive
                                        ? colors.primaryLight
                                        : 'rgba(0,0,0,0.08)',
                                    color: isActive
                                        ? colors.primary
                                        : colors.textSecondary,
                                }}
                            />
                        </Box>
                        <Typography variant="body2" sx={{ color: colors.textSecondary, mt: 0.5 }}>
                            {service.description}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            <Divider sx={{ mb: 4, borderColor: colors.border }} />

            {/* Quick toggles for Enable */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    p: '16px 20px',
                    mb: 4,
                    bgcolor: colors.paper,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '12px',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <input
                        type="checkbox"
                        id={`banking-service-${service.id}`}
                        name={`${window.mycredBankingSettings?.optionId || 'mycred_pref_bank'}[active][]`}
                        value={service.id}
                        defaultChecked={service.is_active}
                        style={{ accentColor: colors.primary, width: 18, height: 18, cursor: 'pointer' }}
                    />
                    <label
                        htmlFor={`banking-service-${service.id}`}
                        style={{ color: colors.textPrimary || colors.text, fontSize: '14px', fontWeight: 600, cursor: 'pointer', margin: 0 }}
                    >
                        Enable
                    </label>
                </Box>
            </Box>

            {/* Legacy Form Fields container */}
            {service.preferences_html && (
                <Box
                    sx={legacyFormSx}
                    dangerouslySetInnerHTML={{ __html: service.preferences_html }}
                />
            )}

            {/* Submit button */}
            <Box sx={{ mt: 5 }}>
                <Button
                    variant="contained"
                    color="primary"
                    type="button"
                    onClick={handleSave}
                    sx={{
                        px: 4,
                        py: 1.5,
                        borderRadius: '8px',
                        fontWeight: 600,
                        fontSize: '14px',
                        boxShadow: 'none',
                        bgcolor: colors.primary,
                        color: '#fff',
                        '&:hover': {
                            bgcolor: colors.primaryHover,
                            boxShadow: 'none',
                        },
                    }}
                >
                    Update Changes
                </Button>
            </Box>
        </Box>
    );
}
