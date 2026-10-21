import React, { useEffect, useMemo, useRef } from 'react';
import { Box } from '@mui/material';
import { useAdminTheme } from '../../../src/shared/adminTheme/AdminThemeProvider';
import { getLegacyFormSx } from '../../../src/pages/Settings/legacyFormStyles';
import SectionedLegacyView from '../../../src/pages/Settings/components/SectionedLegacyView';
import SettingsSectionCard from '../../../src/pages/Settings/components/SettingsSectionCard';
import { initLegacyEditors, removeLegacyEditors } from '../../../src/shared/legacyEditors/initLegacyEditors';
import {
    initLegacySelect2,
    removeLegacySelect2,
    uniquifyLegacyRadioIds,
} from '../../../src/shared/legacyEditors/initLegacySelect2';

export default function LegacyFormViewer({ module }) {
    const { colors } = useAdminTheme();
    const legacyFormSx = useMemo(() => getLegacyFormSx(colors), [colors]);
    const bodyNode = module?.bodyNode || null;
    const hasSections = Boolean(bodyNode && bodyNode.children && bodyNode.children.length > 0);
    const fallbackRef = useRef(null);

    useEffect(() => {
        if (hasSections || !module?.bodyNode || !fallbackRef.current) return undefined;

        const legacyNode = module.bodyNode;
        const originalParent = module.originalParent;
        const originalNextSibling = module.originalNextSibling;
        legacyNode.style.display = 'block';
        fallbackRef.current.appendChild(legacyNode);
        uniquifyLegacyRadioIds(fallbackRef.current);

        const selectTimer = window.setTimeout(() => {
            initLegacySelect2(fallbackRef.current);
        }, 0);

        return () => {
            window.clearTimeout(selectTimer);
            removeLegacySelect2(fallbackRef.current);
            if (originalParent && legacyNode) {
                legacyNode.style.display = 'none';
                if (originalNextSibling) {
                    originalParent.insertBefore(legacyNode, originalNextSibling);
                } else {
                    originalParent.appendChild(legacyNode);
                }
            }
        };
    }, [hasSections, module]);

    if (!module) return null;

    return (
        <Box sx={{ ...legacyFormSx, overflowX: 'hidden', maxWidth: '100%' }}>
            {hasSections ? (
                <SectionedLegacyView
                    colors={colors}
                    bodyNode={bodyNode}
                    moduleTitle={module.title}
                    initLegacyEditors={initLegacyEditors}
                    removeLegacyEditors={removeLegacyEditors}
                />
            ) : (
                <SettingsSectionCard colors={colors} variant="nested">
                    <Box ref={fallbackRef} sx={{ width: '100%', minWidth: 0 }} />
                </SettingsSectionCard>
            )}
        </Box>
    );
}
