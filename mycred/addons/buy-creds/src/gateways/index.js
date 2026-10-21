import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { AdminThemeProvider } from '../../../../src/shared/adminTheme/AdminThemeProvider';

document.addEventListener('DOMContentLoaded', () => {
    const rootElement = document.getElementById('mycred-buycred-gateways-root');

    if (rootElement) {
        const root = createRoot(rootElement);
        const config = window.mycredBuycredGateways || {};

        root.render(
            <AdminThemeProvider>
                <App config={config} />
            </AdminThemeProvider>
        );
    }
});
