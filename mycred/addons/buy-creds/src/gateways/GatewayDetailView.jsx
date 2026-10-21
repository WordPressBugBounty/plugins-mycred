import React, { useEffect, useMemo, useRef } from 'react';
import {
    Box,
    Typography,
    Button,
    Divider,
    Chip,
} from '@mui/material';
import {
    OpenInNew as OpenInNewIcon,
    SettingsOutlined as SettingsIcon,
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import { getLegacyFormSx } from './legacyFormStyles';
import { initLegacyEditors, removeLegacyEditors } from '../../../../src/shared/legacyEditors/initLegacyEditors';

const ADMIN_FORM_MAX_WIDTH = '1000px';

export default function GatewayDetailView({ colors, gateway, allGateways = [], onSaveSuccess }) {
    const legacyFormSx = useMemo(() => getLegacyFormSx(colors), [colors]);
    const prefsRef = useRef(null);

    useEffect(() => {
        const container = prefsRef.current;
        if (!container || !gateway?.preferences_html) {
            return undefined;
        }

        // React does not execute <script> tags from dangerouslySetInnerHTML.
        container.querySelectorAll('script').forEach((oldScript) => {
            const newScript = document.createElement('script');
            Array.from(oldScript.attributes).forEach((attr) => {
                newScript.setAttribute(attr.name, attr.value);
            });
            newScript.textContent = oldScript.textContent;
            oldScript.parentNode.replaceChild(newScript, oldScript);
        });

        const initTimer = window.setTimeout(() => {
            initLegacyEditors(container);
        }, 0);

        return () => {
            window.clearTimeout(initTimer);
            removeLegacyEditors(container);
        };
    }, [gateway?.id, gateway?.preferences_html]);

    const handleSave = async (e) => {
        e.preventDefault();

        if (window.tinymce?.triggerSave) {
            window.tinymce.triggerSave();
        }

        const form = document.querySelector('form[action="options.php"]');
        if (!form) {
            toast.error('Settings form not found.');
            return;
        }

        const formData = new FormData(form);

        // Detail view only posts the current Enable checkbox — keep other active gateways.
        allGateways.forEach((gw) => {
            if (!gw?.id || gw.id === gateway.id || !gw.is_active) return;
            formData.append('mycred_pref_buycreds[active][]', gw.id);
        });

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

    if (!gateway) return null;

    const isActive = gateway.is_active;
    const isSandbox = gateway.sandbox_mode;

    return (
        <Box sx={{ p: '40px', maxWidth: ADMIN_FORM_MAX_WIDTH }}>
            {/* Header row */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                        sx={{
                            bgcolor: isActive
                                ? (isSandbox ? 'rgba(245,158,11,0.12)' : colors.primaryLight)
                                : 'rgba(0,0,0,0.05)',
                            color: isActive
                                ? (isSandbox ? '#f59e0b' : colors.primary)
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
                                {gateway.title}
                            </Typography>
                            <Chip
                                label={isActive ? (isSandbox ? 'Sandbox' : 'Active') : 'Disabled'}
                                size="small"
                                sx={{
                                    height: 22,
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    borderRadius: '4px',
                                    bgcolor: isActive
                                        ? (isSandbox ? 'rgba(245,158,11,0.15)' : colors.primaryLight)
                                        : 'rgba(0,0,0,0.08)',
                                    color: isActive
                                        ? (isSandbox ? '#f59e0b' : colors.primary)
                                        : colors.textSecondary,
                                }}
                            />
                        </Box>
                        <Typography variant="body2" sx={{ color: colors.textSecondary, mt: 0.5 }}>
                            Configure {gateway.title} credentials and exchange rates
                        </Typography>
                    </Box>
                </Box>

                {gateway.documentation_url && (
                    <Button
                        href={gateway.documentation_url}
                        target="_blank"
                        size="small"
                        endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                        sx={{
                            color: colors.primary,
                            fontWeight: 600,
                            fontSize: '13px',
                            textTransform: 'none',
                        }}
                    >
                        Documentation
                    </Button>
                )}
            </Box>

            <Divider sx={{ mb: 4, borderColor: colors.border }} />

            {/* Quick toggles for Enable and Sandbox */}
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
                        id={`buycred-gateway-${gateway.id}`}
                        name="mycred_pref_buycreds[active][]"
                        value={gateway.id}
                        defaultChecked={gateway.is_active}
                        style={{ accentColor: colors.primary, width: 18, height: 18, cursor: 'pointer' }}
                    />
                    <label
                        htmlFor={`buycred-gateway-${gateway.id}`}
                        style={{ color: colors.textPrimary || colors.text, fontSize: '14px', fontWeight: 600, cursor: 'pointer', margin: 0 }}
                    >
                        Enable Gateway
                    </label>
                </Box>

                {gateway.has_sandbox && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <input
                            type="checkbox"
                            id={`buycred-gateway-${gateway.id}-sandbox`}
                            name={`mycred_pref_buycreds[gateway_prefs][${gateway.id}][sandbox]`}
                            value={gateway.id}
                            defaultChecked={gateway.sandbox_mode}
                            style={{ accentColor: '#f59e0b', width: 18, height: 18, cursor: 'pointer' }}
                        />
                        <label
                            htmlFor={`buycred-gateway-${gateway.id}-sandbox`}
                            style={{ color: colors.textPrimary || colors.text, fontSize: '14px', fontWeight: 600, cursor: 'pointer', margin: 0 }}
                        >
                            Sandbox / Test Mode
                        </label>
                    </Box>
                )}
            </Box>

            {/* Legacy Form Fields container */}
            {gateway.preferences_html && (
                <Box
                    ref={prefsRef}
                    sx={legacyFormSx}
                    dangerouslySetInnerHTML={{ __html: gateway.preferences_html }}
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
                    Update Settings
                </Button>
            </Box>
        </Box>
    );
}
