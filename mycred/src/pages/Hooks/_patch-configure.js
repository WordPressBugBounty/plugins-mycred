const fs = require('fs');
const path = 'c:/Users/user/Local Sites/mycred-react/app/public/wp-content/plugins/mycred/src/pages/Hooks/hooks-pointics-mockup.html';
let text = fs.readFileSync(path, 'utf8');

const newConfigure = `      <!-- ========== SCREEN 3: CONFIGURE ========== -->
      <section class="screen" id="screen-configure" data-screen-panel="configure">
        <div class="configure-wrap">
          <button type="button" class="back-to-hooks" data-go="list">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Back to Hooks
          </button>

          <div class="form-card">
            <h3 class="configure-hook-title" id="configure-hook-title">Points for registrations</h3>
            <p class="configure-hook-desc" id="configure-hook-desc">Award points for users joining your website.</p>
            <a class="configure-docs" href="https://codex.mycred.me/" target="_blank" rel="noopener">
              View documentation
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </a>
          </div>

          <div class="form-card is-settings">
            <div class="settings-tabs">
              <button type="button" class="settings-tab">General Settings</button>
            </div>

            <div class="settings-body" id="hook-prefs-body">
              <div class="prefs-row">
                <div class="field">
                  <label for="pref-points">Points</label>
                  <input id="pref-points" type="text" value="10" inputmode="decimal" />
                </div>
                <div class="field">
                  <label for="pref-log">Log Template</label>
                  <input id="pref-log" type="text" value="%plural% for becoming a member" />
                  <p class="field-hint">
                    Available Template Tags:
                    <a href="#">General</a>,
                    <a href="#">User Related</a>
                  </p>
                </div>
              </div>
            </div>

            <div class="settings-footer">
              <button type="button" class="btn btn-outline btn-sm" data-go="list">Cancel</button>
              <button type="button" class="btn btn-configure btn-sm" id="btn-save-hook">Update Settings</button>
            </div>
          </div>
        </div>
      </section>
`;

const start = text.indexOf('      <!-- ========== SCREEN 3: CONFIGURE ========== -->');
const endMarker = '\n\n    </div>\n  </div>\n\n  <script>';
const end = text.indexOf(endMarker, start);
if (start < 0 || end < 0) {
  console.error('markers not found', start, end);
  process.exit(1);
}
text = text.slice(0, start) + newConfigure + text.slice(end);

// Align CSS class names with HTML (existing CSS used slightly different names)
const cssRenames = [
  ['.form-card.is-settings', '.form-card.is-settings'],
  ['.settings-tabs', '.settings-tabs'],
  ['.settings-tab', '.settings-tab'],
  ['.settings-body', '.settings-body'],
  ['.settings-footer', '.settings-footer'],
  ['.configure-docs', '.configure-docs'],
  ['.field-hint', '.field-hint'],
  ['.prefs-row', '.prefs-row'],
  ['.back-to-hooks', '.back-to-hooks'],
  ['.configure-wrap', '.configure-wrap'],
];

// Map OLD css (from earlier write) -> NEW html class names
const realRenames = [
  ['.form-card.is-settings', '.form-card.is-settings'],
  ['.settings-tabs {', '.settings-tabs {'],
  ['.settings-tab {', '.settings-tab {'],
  ['.settings-body {', '.settings-body {'],
  ['.settings-footer {', '.settings-footer {'],
  ['.configure-docs {', '.configure-docs {'],
  ['.field-hint {', '.field-hint {'],
  ['.field-hint strong,', '.field-hint strong,'],
  ['.field-hint a {', '.field-hint a {'],
  ['.field-hint a:hover', '.field-hint a:hover'],
  ['.prefs-row {', '.prefs-row {'],
  ['.prefs-row { grid-template-columns: 1fr; }', '.prefs-row { grid-template-columns: 1fr; }'],
  ['.back-to-hooks {', '.back-to-hooks {'],
  ['.back-to-hooks:hover', '.back-to-hooks:hover'],
  ['.configure-wrap {', '.configure-wrap {'],
];

// Actual existing CSS from file read:
// .configure-wrap OR .configure-wrap?
// From read: .configure-wrap - NO, it was .configure-wrap in my failed replace
// Actual file has: .configure-wrap? Let me check what's actually in CSS

const checks = [
  'configure-wrap',
  'configure-wrap',
  'back-to-hooks',
  'back-to-hooks',
  'is-settings',
  'is-settings',
  'settings-tabs',
  'settings-tabs',
  'settings-body',
  'settings-body',
  'configure-docs',
  'configure-docs',
  'field-hint',
  'field-hint',
  'prefs-row',
  'prefs-row',
  'btn-configure',
  'btn-outline',
];
for (const c of checks) {
  console.log(c, text.includes('.' + c) || text.includes('class="' + c) || text.includes(' ' + c));
}

fs.writeFileSync(path, text, 'utf8');
console.log('Wrote configure HTML');
