import ReactDOM from 'react-dom';
import App from './App';

// Pull localized settings from PHP (see mycred-dashboard.php wp_localize_script)
const localized = (typeof window !== 'undefined' && window.mycredDashboardData && window.mycredDashboardData.dashboard_settings) || {};
ReactDOM.render(<App settings={localized} />, document.getElementById('mycred-dashboard'));
