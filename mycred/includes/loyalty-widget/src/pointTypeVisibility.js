/**
 * Widget-wide point type visibility (settings.general.visiblePointTypes).
 * Empty selection = show all types on the site.
 */

export const getVisiblePointTypeKeys = (settings = {}, pointTypesMap = {}) => {
    const selected = settings?.general?.visiblePointTypes;
    const allKeys = Object.keys(pointTypesMap || {});
    const fallback = allKeys.length ? allKeys : ['mycred_default'];

    if (!Array.isArray(selected) || selected.length === 0) {
        return fallback;
    }

    const allowed = new Set(fallback);
    const visible = selected.filter((key) => allowed.has(key));
    return visible.length ? visible : fallback;
};

export const isPointTypeVisible = (typeKey, settings, pointTypesMap) => {
    if (!typeKey) {
        return false;
    }
    return getVisiblePointTypeKeys(settings, pointTypesMap).includes(typeKey);
};

export const filterPointTypesMap = (map = {}, settings = {}) => {
    const visible = getVisiblePointTypeKeys(settings, map);
    const filtered = {};
    visible.forEach((key) => {
        if (map[key] != null) {
            filtered[key] = map[key];
        }
    });
    return filtered;
};

export const filterByVisiblePointTypes = (items = [], settings = {}, getKey = (item) => item?.point_type) => {
    const visible = new Set(getVisiblePointTypeKeys(settings, getPointTypesMapFromWindow()));
    return (items || []).filter((item) => visible.has(getKey(item)));
};

export const getPointTypesMapFromWindow = () => {
    if (typeof window !== 'undefined') {
        if (window.mycredLoyaltyWidget?.point_types) {
            return window.mycredLoyaltyWidget.point_types;
        }
        if (window.mycredLoyaltyWidgetData?.point_types) {
            return window.mycredLoyaltyWidgetData.point_types;
        }
    }
    return { mycred_default: 'Points' };
};

export const getVisiblePointTypesMap = (settings = {}) => {
    return filterPointTypesMap(getPointTypesMapFromWindow(), settings);
};

export const getVisibleBalances = (allBalances = [], settings = {}) => {
    return filterByVisiblePointTypes(allBalances, settings, (b) => b?.type);
};

export const getDefaultVisiblePointType = (settings = {}, balances = []) => {
    const fromBalances = (balances || []).map((b) => b.type).filter(Boolean);
    if (fromBalances.length) {
        return fromBalances[0];
    }
    const keys = getVisiblePointTypeKeys(settings, getPointTypesMapFromWindow());
    return keys[0] || 'mycred_default';
};

export const filterActiveHooksForWidget = (hooks = [], settings = {}) => {
    return filterByVisiblePointTypes(hooks, settings, (h) => h?.point_type);
};