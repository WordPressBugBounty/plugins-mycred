/**
 * Build setup_types[] payload for export-setup AJAX (matches legacy mycred-tools.js).
 */
export function buildSetupTypes(setupState, data) {
    const types = [];
    const allPointIds = (data.pointTypes || []).map((pt) => pt.id);
    const pointTypeIds =
        setupState.pointsScope === 'all' ? allPointIds : setupState.pointTypes;

    pointTypeIds.forEach((ptId) => {
        types.push({ point_type: ptId });
        if (setupState.includeHooks) {
            types.push({ hooks: ptId });
        }
        if (setupState.includeRanks && data.isRanksEnabled) {
            types.push({ ranks: ptId });
        }
    });

    const categories =
        setupState.achievementsScope === 'all'
            ? data.badgeCategories || []
            : (data.badgeCategories || []).filter((cat) =>
                  setupState.achievementCategories.includes(cat.id)
              );

    categories.forEach((cat) => {
        const catId = cat.id;
        const badges = cat.badges || [];

        if (setupState.includeBadges) {
            types.push({ achievements: catId });
            badges.forEach((badge) => {
                types.push({ [`badge_${catId}`]: badge.id });
            });
        }

        if (setupState.includeLevels) {
            if (!setupState.includeBadges) {
                types.push({ achievements: catId });
            }
            badges.forEach((badge) => {
                types.push({ [`levels_${catId}`]: badge.id });
            });
        }
    });

    if (setupState.includeUncategorized && data.uncategorizedBadges?.length) {
        types.push({ uncat_achievements: 'uncat-achievements' });
        data.uncategorizedBadges.forEach((badge) => {
            if (setupState.includeBadges) {
                types.push({ badge: badge.id });
            }
            if (setupState.includeLevels) {
                types.push({ levels: badge.id });
            }
        });
    }

    return types;
}

/**
 * Append setup_types array to a FormData or hidden form inputs container.
 */
export function appendSetupTypesToForm(form, setupTypes) {
    setupTypes.forEach((entry, index) => {
        Object.keys(entry).forEach((key) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = `setup_types[${index}][${key}]`;
            input.value = entry[key];
            form.appendChild(input);
        });
    });
}
