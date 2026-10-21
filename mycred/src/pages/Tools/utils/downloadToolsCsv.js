/**
 * Client-side CSV download (matches legacy mycredToolsDowloadCSV).
 */
export function downloadCsvBlob(csvText, fileName, fileFormat = 'csv') {
    const blob = new Blob(['\ufeff' + csvText], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.${fileFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function appendSetupTypesToFormData(formData, setupTypes) {
    setupTypes.forEach((entry, index) => {
        Object.keys(entry).forEach((key) => {
            formData.append(`setup_types[${index}][${key}]`, entry[key]);
        });
    });
}

/**
 * POST to mycred-tools-import-export and trigger a file download without navigating away.
 */
export async function postToolsCsvDownload(ajaxUrl, params, fileName, setupTypes = null) {
    const formData = new FormData();
    Object.keys(params).forEach((key) => {
        formData.append(key, params[key]);
    });

    if (setupTypes?.length) {
        appendSetupTypesToFormData(formData, setupTypes);
    }

    const response = await fetch(ajaxUrl, {
        method: 'POST',
        body: formData,
        credentials: 'same-origin',
    });

    if (!response.ok) {
        throw new Error('Download request failed');
    }

    const csvText = await response.text();
    if (!csvText?.trim()) {
        throw new Error('Empty export response');
    }

    downloadCsvBlob(csvText, fileName);
}
