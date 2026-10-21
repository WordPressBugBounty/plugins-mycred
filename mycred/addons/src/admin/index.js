import React from 'react';
import ReactDOM from 'react-dom';
import { AdminThemeProvider } from '../../../src/shared/adminTheme/AdminThemeProvider';
import App from './App';

ReactDOM.render(
    <AdminThemeProvider>
        <App />
    </AdminThemeProvider>,
    document.getElementById('mycred-addons')
);
