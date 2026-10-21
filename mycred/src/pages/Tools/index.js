import { render } from '@wordpress/element';
import App from './App';
import { AdminThemeProvider } from '../../shared/adminTheme/AdminThemeProvider';

const root = document.getElementById('mycred-tools-ui-root');
if (root) {
    render(
        <AdminThemeProvider>
            <App />
        </AdminThemeProvider>,
        root
    );
}
