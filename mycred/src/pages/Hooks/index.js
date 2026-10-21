import { render } from '@wordpress/element';
import App from './App';
import { AdminThemeProvider } from '../../shared/adminTheme/AdminThemeProvider';

const container = document.getElementById('mycred-hooks-app');
if (container) {
    render(
        <AdminThemeProvider>
            <App />
        </AdminThemeProvider>,
        container
    );
}
