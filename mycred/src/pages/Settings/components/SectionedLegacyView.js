import { useEffect, useLayoutEffect, useMemo, useRef, useState } from '@wordpress/element';
import { Box, Typography } from '@mui/material';
import { getSectionedLegacyEmbeddedSx } from '../legacyFormStyles';
import SettingsSectionCard from './SettingsSectionCard';
import LegacyMuiSelect from './LegacyMuiSelect';
import { COMPONENTS } from '../../../shared/adminTheme/tokens';
import {
    initLegacySelect2,
    removeLegacySelect2,
    uniquifyLegacyRadioIds,
} from '../../../shared/legacyEditors/initLegacySelect2';

const setEmbeddedSectionSx = (node) => {
    if (!node) return;
    node.style.width = '100%';
    node.style.maxWidth = '100%';
    node.style.flex = '1 1 auto';
};

const moveNode = (node, slot, moves) => {
    if (!node || !slot) return;
    const originalParent = node.parentNode;
    const originalNextSibling = node.nextSibling;
    moves.push({ node, originalParent, originalNextSibling });
    slot.appendChild(node);
    setEmbeddedSectionSx(node);
};

const isMultiColumnRow = (node) => {
    if (!node || node.tagName !== 'DIV' || !node.classList.contains('row')) return false;
    const cols = Array.from(node.children).filter(
        (child) => child.nodeType === 1 && child.className && /col-/i.test(child.className)
    );
    return cols.length >= 3;
};

const isHeadingInsideColumn = (node) => {
    if (!node || node.tagName !== 'H3') return false;
    const col = node.closest('[class*="col-"]');
    if (!col) return false;
    const row = col.closest('.row');
    return Boolean(row && row.contains(col));
};

const isFullWidthRowHeading = (el) => (
    Boolean(el && el.tagName === 'H3' && /\bcol-12\b/.test(String(el.className || '')))
);

const getRowFullWidthHeading = (node) => {
    if (!node || node.tagName !== 'DIV' || !node.classList.contains('row')) return null;
    const firstEl = Array.from(node.children).find((el) => el.nodeType === 1);
    return isFullWidthRowHeading(firstEl) ? firstEl : null;
};

const headingText = (el) => (el?.textContent || '').replace(/\s+/g, ' ').trim();

const markPromotedHeading = (el) => {
    if (el) el.classList.add('legacy-promoted-heading');
};

const freshSection = (title, nodes, extra = {}) => ({
    title,
    nodes,
    hasMultiColRow: false,
    hasSmtpFollowup: false,
    ...extra,
});

const getDirectRowHeading = (node) => {
    if (!node || node.tagName !== 'DIV' || !node.classList.contains('row')) return null;
    const heading = Array.from(node.children).find(
        (el) => el.nodeType === 1 && (el.tagName === 'H2' || el.tagName === 'H3')
    );
    return heading && headingText(heading) ? heading : null;
};

const extractNestedHeadingRows = (col) => (
    Array.from(col.children).flatMap((row) => {
        if (row.nodeType !== 1 || !row.classList.contains('row')) return [];
        const headed = getHeadingColumns(row);
        if (!headed || headed.length !== 1) return [];
        const { heading, text } = headed[0];
        markPromotedHeading(heading);
        return [freshSection(text, [row], {
            hasSmtpFollowup: Boolean(row.querySelector?.('label[for*="override"]')),
        })];
    })
);

const getHeadingColumns = (node) => {
    if (!node || node.tagName !== 'DIV' || !node.classList.contains('row')) return null;
    if (getDirectRowHeading(node)) return null;
    const cols = Array.from(node.children).filter(
        (child) => child.nodeType === 1 && /col-/i.test(child.className || '')
    );
    if (!cols.length) return null;
    const headed = cols.map((col) => {
        const first = Array.from(col.children).find((el) => el.nodeType === 1);
        if (!first || (first.tagName !== 'H2' && first.tagName !== 'H3')) return null;
        const text = headingText(first);
        return text ? { col, heading: first, text } : null;
    });
    return headed.every(Boolean) ? headed : null;
};

const getUninstallHeadingLabel = (nodes) => {
    for (const node of nodes) {
        const label = node.matches?.('.form-group > label:not([for])')
            ? node
            : node.querySelector?.('.form-group > label:not([for])');
        if (label && (label.textContent || '').trim()) {
            return label;
        }
    }
    return null;
};

const splitSmtpDebugLabels = (root) => {
    if (!root) return;
    root.querySelectorAll('label[for*="override"]').forEach((label) => {
        if (label.dataset.smtpSplit === '1') return;
        const input = label.querySelector('input[type="checkbox"]');
        if (!input) return;

        const raw = Array.from(label.childNodes)
            .filter((node) => node !== input)
            .map((node) => (node.textContent || ''))
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();
        const match = raw.match(/^SMTP Debug\.?\s*(.*)$/i);
        if (!match) return;

        Array.from(label.childNodes).forEach((node) => {
            if (node !== input) node.remove();
        });

        const help = document.createElement('span');
        help.className = 'smtp-debug-help';
        help.textContent = match[1] || 'Enable if you are experiencing issues with wp_mail() or if you use a SMTP plugin for emails.';
        label.appendChild(help);

        const heading = document.createElement('p');
        heading.className = 'smtp-debug-heading';
        heading.textContent = 'SMTP Debug';

        const wrap = document.createElement('div');
        wrap.className = 'smtp-debug-block';
        label.parentNode.insertBefore(wrap, label);
        wrap.appendChild(heading);
        wrap.appendChild(label);
        label.dataset.smtpSplit = '1';
    });
};

/**
 * Split a legacy accordion body into nested-card section groups.
 * Top-level h3, a row's own h2/h3, a column that starts with h2/h3, and
 * label.subheader each become the label above their card.
 */
export const buildLegacySections = (bodyNode, fallbackTitle = 'Settings') => {
    if (!bodyNode) return [];

    const children = Array.from(bodyNode.children).filter((el) => el.nodeType === 1);
    if (!children.length) return [];

    const isDashboard = /^dashboard$/i.test(fallbackTitle);
    const isUninstall = /^uninstall$/i.test(fallbackTitle);
    const sections = [];
    let current = freshSection(null, []);
    let trailing = [];

    const pushCurrent = () => {
        if (current.nodes.length) sections.push(current);
        if (trailing.length) {
            sections.push(...trailing);
            trailing = [];
        }
    };

    children.forEach((child) => {
        const rowHeading = getRowFullWidthHeading(child);
        const isHeading = child.tagName === 'H3'
            && headingText(child).length > 0
            && !isHeadingInsideColumn(child);

        if (isHeading) {
            pushCurrent();
            current = freshSection(headingText(child), [child]);
            return;
        }

        if (rowHeading) {
            pushCurrent();
            current = freshSection(headingText(rowHeading), [child], {
                hasSmtpFollowup: Boolean(child.querySelector?.('label[for*="override"]')),
            });
            return;
        }

        if (child.matches?.('label.subheader') && headingText(child)) {
            pushCurrent();
            markPromotedHeading(child);
            current = freshSection(headingText(child), [child]);
            return;
        }

        const directHeading = !isDashboard ? getDirectRowHeading(child) : null;
        if (directHeading) {
            pushCurrent();
            markPromotedHeading(directHeading);
            current = freshSection(headingText(directHeading), [child], {
                hasSmtpFollowup: Boolean(child.querySelector?.('label[for*="override"]')),
            });
            return;
        }

        const headingColumns = !isDashboard ? getHeadingColumns(child) : null;
        if (headingColumns) {
            pushCurrent();
            headingColumns.forEach(({ col, heading, text }, index) => {
                markPromotedHeading(heading);
                const section = freshSection(text, [col], {
                    hasSmtpFollowup: Boolean(col.querySelector?.('label[for*="override"]')),
                });
                const nested = extractNestedHeadingRows(col);
                if (index < headingColumns.length - 1) {
                    sections.push(section, ...nested);
                } else {
                    current = section;
                    trailing = nested;
                }
            });
            return;
        }

        if (isMultiColumnRow(child) && !isDashboard) {
            current.hasMultiColRow = true;
        }
        if (child.querySelector?.('label[for*="override"]')) {
            current.hasSmtpFollowup = true;
        }
        current.nodes.push(child);
    });

    pushCurrent();

    return sections.map((section, index) => {
        let title = section.title;
        let hideLegacyHeadingLabel = false;

        if (!title && isUninstall && index === 0) {
            const label = getUninstallHeadingLabel(section.nodes);
            if (label) {
                title = (label.textContent || '').trim();
                hideLegacyHeadingLabel = true;
            }
        }

        if (!title) {
            title = index === 0 ? fallbackTitle : `Section ${index + 1}`;
        }

        return {
            id: `section_${index}`,
            title,
            showReactTitle: Boolean(title) && title !== fallbackTitle,
            hideLegacyHeading: Boolean(section.title),
            hideLegacyHeadingLabel,
            hasMultiColRow: section.hasMultiColRow,
            hasSmtpFollowup: section.hasSmtpFollowup,
            nodes: section.nodes,
        };
    });
};

export default function SectionedLegacyView({
    colors,
    bodyNode,
    moduleTitle = 'Settings',
    initLegacyEditors,
    removeLegacyEditors,
}) {
    const rootRef = useRef(null);
    const slotRefs = useRef({});
    const movesRef = useRef([]);
    const [sections, setSections] = useState([]);
    const [muiSelectEls, setMuiSelectEls] = useState([]);

    const embeddedSx = useMemo(() => getSectionedLegacyEmbeddedSx(colors), [colors]);
    const isManagement = /management/i.test(moduleTitle || '');
    const isDashboard = /^dashboard$/i.test(moduleTitle || '');

    useEffect(() => {
        if (!bodyNode) {
            setSections([]);
            return;
        }
        setSections(buildLegacySections(bodyNode, moduleTitle));
    }, [bodyNode, moduleTitle]);

    useLayoutEffect(() => {
        if (!bodyNode || !sections.length) return undefined;

        const moves = [];
        movesRef.current = moves;

        sections.forEach((section) => {
            const slot = slotRefs.current[section.id];
            if (!slot) return;
            section.nodes.forEach((node) => moveNode(node, slot, moves));
        });

        splitSmtpDebugLabels(rootRef.current);
        uniquifyLegacyRadioIds(rootRef.current);

        // Destroy Select2 on single selects, then bridge them with MUI (General Settings look).
        removeLegacySelect2(rootRef.current);
        const singleSelects = Array.from(
            rootRef.current?.querySelectorAll('select:not([multiple])') || []
        ).filter((el) => !el.classList.contains('mycred-native-select-hidden'));
        setMuiSelectEls(singleSelects);

        // Re-init editors; Select2 only runs on multi-selects (singles use MUI).
        const editorTimer = window.setTimeout(() => {
            initLegacyEditors?.(rootRef.current);
            initLegacySelect2(rootRef.current);
        }, 0);

        return () => {
            window.clearTimeout(editorTimer);
            setMuiSelectEls([]);
            removeLegacySelect2(rootRef.current);
            removeLegacyEditors?.(rootRef.current);
            for (let i = movesRef.current.length - 1; i >= 0; i -= 1) {
                const { node, originalParent, originalNextSibling } = movesRef.current[i];
                if (!originalParent) continue;
                if (originalNextSibling && originalNextSibling.parentNode === originalParent) {
                    originalParent.insertBefore(node, originalNextSibling);
                } else {
                    originalParent.appendChild(node);
                }
            }
            movesRef.current = [];
        };
    }, [sections, bodyNode, initLegacyEditors, removeLegacyEditors, isDashboard]);

    if (!bodyNode || !sections.length) return null;

    return (
        <Box
            ref={rootRef}
            className={`sectioned-legacy-embedded${isManagement ? ' management-layout' : ''}${isDashboard ? ' dashboard-layout' : ''}`}
            sx={{
                ...embeddedSx,
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
            }}
        >
            {sections.map((section) => (
                <Box
                    key={section.id}
                    sx={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    {section.showReactTitle && section.title && (
                        <Typography sx={COMPONENTS.sectionLabel}>
                            {section.title}
                        </Typography>
                    )}
                    <SettingsSectionCard colors={colors} variant="nested">
                        <Box
                            ref={(el) => {
                                if (el) {
                                    slotRefs.current[section.id] = el;
                                } else {
                                    delete slotRefs.current[section.id];
                                }
                            }}
                            className={`sectioned-legacy-slot${section.hideLegacyHeading ? ' hide-legacy-h3' : ''}${section.hideLegacyHeadingLabel ? ' hide-legacy-heading-label' : ''}${section.hasSmtpFollowup ? ' multi-col-section' : ''}${isManagement ? ' management-slot' : ''}${isDashboard ? ' dashboard-layout' : ''}`}
                            sx={{ width: '100%', minWidth: 0 }}
                        />
                    </SettingsSectionCard>
                </Box>
            ))}
            {muiSelectEls.map((selectEl, index) => (
                <LegacyMuiSelect
                    key={selectEl.id || selectEl.name || `mui-select-${index}`}
                    selectEl={selectEl}
                />
            ))}
        </Box>
    );
}
