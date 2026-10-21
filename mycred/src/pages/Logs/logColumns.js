export const CORE_COLUMNS = [
    { key: 'id', label: 'LOG ID', field: 'id', sortable: true, group: 'core' },
    { key: 'user_id', label: 'USER', field: 'user_id', sortable: true, group: 'core' },
    { key: 'ref', label: 'REFERENCE', field: 'ref', sortable: true, group: 'core' },
    { key: 'creds', label: 'AMOUNT', field: 'creds', sortable: true, group: 'core' },
    { key: 'entry', label: 'ENTRY', field: 'entry', sortable: true, group: 'core' },
    { key: 'time', label: 'ENTRY DATE', field: 'time', sortable: true, group: 'core' },
];

export const buildAllColumns = (extraColumns = []) => {
    const loyaltyColumns = (extraColumns || []).map((column) => ({
        key: column.key,
        label: (column.label || column.key).toUpperCase(),
        field: column.key,
        sortable: false,
        group: column.group || 'loyalty',
    }));

    return [...CORE_COLUMNS, ...loyaltyColumns];
};

export const getStorageKey = (pointType) => `mycred_logs_visible_columns_${pointType}`;

export const loadVisibleColumns = (allColumns, pointType) => {
    const allKeys = allColumns.map((column) => column.key);

    try {
        const stored = localStorage.getItem(getStorageKey(pointType));
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
                const valid = parsed.filter((key) => allKeys.includes(key));
                if (valid.length > 0) {
                    return valid;
                }
            }
        }
    } catch (error) {
        // Ignore invalid storage.
    }

    return allKeys;
};

export const saveVisibleColumns = (pointType, keys) => {
    try {
        localStorage.setItem(getStorageKey(pointType), JSON.stringify(keys));
    } catch (error) {
        // Ignore storage failures.
    }
};
