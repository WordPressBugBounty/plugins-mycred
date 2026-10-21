import { useEffect, useMemo, useRef, useState } from '@wordpress/element';
import { Box, Typography } from '@mui/material';
import { getCoreSettingsEmbeddedSx } from '../legacyFormStyles';
import SettingsSectionCard from './SettingsSectionCard';
import { uniquifyLegacyRadioIds } from '../../../shared/legacyEditors/initLegacySelect2';
import { COMPONENTS } from '../../../shared/adminTheme/tokens';

const getHeading = (root, text) => {
    const headings = Array.from(root.querySelectorAll('h3'));
    return headings.find((h) => (h.textContent || '').trim().toLowerCase() === text.toLowerCase()) || null;
};

const setEmbeddedSectionSx = (node) => {
    if (!node) return;
    node.style.width = '100%';
    node.style.maxWidth = '100%';
    node.style.flex = '1 1 auto';
};

const relocateSecurityToggles = (securityRoot, moves) => {
    if (!securityRoot) return;
    const groups = Array.from(new Set(
        Array.from(securityRoot.querySelectorAll('label'))
            .filter((label) => /exclude point (editors|administrators)/i.test(label.textContent || ''))
            .map((label) => label.closest('.form-group'))
            .filter(Boolean)
    ));
    if (!groups.length) return;

    const row = document.createElement('div');
    row.className = 'core-security-toggles';
    securityRoot.appendChild(row);
    groups.forEach((group) => moveNode(group, row, moves));
    moves.push({ node: row, removeOnly: true });
};

const moveNode = (node, slot, moves) => {
    if (!node || !slot) return;
    const originalParent = node.parentNode;
    const originalNextSibling = node.nextSibling;
    moves.push({ node, originalParent, originalNextSibling });
    slot.appendChild(node);
    setEmbeddedSectionSx(node);
};

const hasVisibleContent = (node) => {
    if (!node) return false;
    return node.children.length > 0 || (node.textContent || '').trim().length > 0;
};

const NestedSection = ({ colors, title, slotRef, className }) => (
    <Box
        sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
        }}
    >
        {title ? <Typography sx={COMPONENTS.sectionLabel}>{title}</Typography> : null}
        <SettingsSectionCard colors={colors} variant="nested">
            <Box ref={slotRef} className={className} sx={{ width: '100%', minWidth: 0 }} />
        </SettingsSectionCard>
    </Box>
);

export default function CoreSettingsView({
    colors,
    bodyNode,
    initLegacyEditors,
    removeLegacyEditors,
}) {
    const rootRef = useRef(null);
    const labelsRef = useRef(null);
    const formatRef = useRef(null);
    const securityRef = useRef(null);
    const imageRef = useRef(null);
    const otherRef = useRef(null);
    const corePrefsRef = useRef(null);

    const movesRef = useRef([]);
    const [hasCorePrefs, setHasCorePrefs] = useState(false);

    const embeddedSx = useMemo(() => getCoreSettingsEmbeddedSx(colors), [colors]);

    useEffect(() => {
        if (!bodyNode) return undefined;

        const moves = [];
        movesRef.current = moves;

        const labelsH3 = getHeading(bodyNode, 'Labels');
        const formatH3 = getHeading(bodyNode, 'Format');
        const securityH3 = getHeading(bodyNode, 'Security');
        const imageH3 = getHeading(bodyNode, 'Point Type Image');
        const otherH3 = getHeading(bodyNode, 'Other Settings');

        const labelsCol = labelsH3?.closest('[class*="col-"]') || null;
        const labelsRow = labelsCol?.closest('.row') || null;
        const formatCol = labelsRow
            ? Array.from(labelsRow.children).find((child) => child !== labelsCol && child.matches?.('[class*="col-"]')) || null
            : (formatH3?.closest('[class*="col-"]') || null);

        const securityColLeft = securityH3?.closest('[class*="col-"]') || null;
        const securityRow = securityColLeft?.closest('.row') || null;
        const securityRowBlock = securityRow || securityColLeft;

        const imageCol = imageH3?.closest('[class*="col-"]') || null;
        const imageRow = imageCol?.closest('.row') || null;
        const otherCol = imageRow
            ? Array.from(imageRow.children).find((child) => {
                if (child === imageCol) return false;
                if (!child.matches?.('[class*="col-"]')) return false;
                const heading = child.querySelector('h3');
                return heading && (heading.textContent || '').trim().toLowerCase() === 'other settings';
            }) || (otherH3?.closest('[class*="col-"]') || null)
            : (otherH3?.closest('[class*="col-"]') || null);

        const corePrefsCol = imageRow
            ? Array.from(imageRow.children).find((child) => {
                if (child === imageCol || child === otherCol) return false;
                return child.matches?.('[class*="col-"]') && hasVisibleContent(child);
            }) || null
            : null;

        moveNode(labelsCol, labelsRef.current, moves);
        moveNode(formatCol, formatRef.current, moves);
        moveNode(securityRowBlock, securityRef.current, moves);
        relocateSecurityToggles(securityRef.current, moves);
        moveNode(imageCol, imageRef.current, moves);
        moveNode(otherCol, otherRef.current, moves);
        moveNode(corePrefsCol, corePrefsRef.current, moves);
        setHasCorePrefs(Boolean(corePrefsCol));
        uniquifyLegacyRadioIds(rootRef.current);

        const timer = window.setTimeout(() => {
            initLegacyEditors?.(rootRef.current);
            uniquifyLegacyRadioIds(rootRef.current);
        }, 0);

        return () => {
            window.clearTimeout(timer);
            removeLegacyEditors?.(rootRef.current);

            movesRef.current.forEach(({ node, originalParent, originalNextSibling, removeOnly }) => {
                if (removeOnly) {
                    node.remove();
                    return;
                }
                if (!originalParent) return;
                if (originalNextSibling) {
                    originalParent.insertBefore(node, originalNextSibling);
                } else {
                    originalParent.appendChild(node);
                }
            });
            setHasCorePrefs(false);
            movesRef.current = [];
        };
    }, [bodyNode, initLegacyEditors, removeLegacyEditors]);

    return (
        <Box
            ref={rootRef}
            className="core-settings-embedded"
            sx={{
                ...embeddedSx,
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
            }}
        >
            <NestedSection colors={colors} title="Labels" slotRef={labelsRef} className="core-settings-slot" />
            <NestedSection colors={colors} title="Format" slotRef={formatRef} className="core-settings-slot format-slot" />
            <NestedSection colors={colors} title="Security" slotRef={securityRef} className="core-settings-slot security-slot" />
            <Box
                sx={{
                    width: '100%',
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) minmax(0, 1fr)' },
                    gap: '24px',
                    alignItems: 'start',
                }}
            >
                <NestedSection colors={colors} title="Point Type Image" slotRef={imageRef} className="core-settings-slot" />
                <NestedSection colors={colors} title="Other Settings" slotRef={otherRef} className="core-settings-slot" />
            </Box>
            <Box
                sx={{
                    display: hasCorePrefs ? 'flex' : 'none',
                    width: '100%',
                    flexDirection: 'column',
                    gap: '12px',
                }}
            >
                <SettingsSectionCard colors={colors} variant="nested">
                    <Box ref={corePrefsRef} className="core-settings-slot core-prefs-slot" sx={{ width: '100%', minWidth: 0 }} />
                </SettingsSectionCard>
            </Box>
        </Box>
    );
}
