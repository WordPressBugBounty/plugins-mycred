/**
 * Manual onboarding only.
 * Refreshes Setup overview and the finish cards from the current selections.
 */
document.addEventListener('DOMContentLoaded', function () {
	var wizard = document.getElementById('mycred-ob-wizard');
	if (!wizard) {
		return;
	}

	var shared = (window.mycredOnboarding && window.mycredOnboarding.strings) ? window.mycredOnboarding.strings : {};
	var local = (window.mycredOnboardingManual && window.mycredOnboardingManual.strings) ? window.mycredOnboardingManual.strings : {};
	var platformStatus = (window.mycredOnboarding && window.mycredOnboarding.platformStatus) ? window.mycredOnboarding.platformStatus : {};

	function t(key, fallback) {
		return local[key] || shared[key] || fallback;
	}

	function isManualReview() {
		if (!wizard.classList.contains('is-manual')) {
			return false;
		}
		var review = wizard.querySelector('.mycred-ob-screen[data-screen="4"]');
		return !!(review && review.classList.contains('is-active'));
	}

	function optionLabel(select) {
		if (!select || select.selectedIndex < 0) {
			return '';
		}
		var option = select.options[select.selectedIndex];
		return option ? String(option.text || '').trim() : '';
	}

	function pointName() {
		var input = document.getElementById('mycred-ob-point-name');
		return input ? String(input.value || '').trim() : '';
	}

	function rowTitle(row) {
		var title = row.querySelector('.mycred-ob-setting-title');
		if (!title || !title.childNodes[0]) {
			return '';
		}
		return String(title.childNodes[0].textContent || '').trim();
	}

	function checkedRows(root, selector) {
		var rows = [];
		if (!root) {
			return rows;
		}
		root.querySelectorAll(selector).forEach(function (row) {
			if (row.hidden) {
				return;
			}
			var input = row.querySelector('.mycred-ob-switch input[type="checkbox"]');
			if (input && !input.checked) {
				return;
			}
			rows.push(row);
		});
		return rows;
	}

	function selectedSetup() {
		var hooks = checkedRows(document.getElementById('mycred-ob-hooks-list'), '.mycred-ob-setting[data-hook-id]');
		var settings = checkedRows(document.getElementById('mycred-ob-settings-list'), '.mycred-ob-setting');
		var checkout = checkedRows(document.getElementById('mycred-ob-checkout-list'), '.mycred-ob-setting');
		var addons = [];
		document.querySelectorAll('#mycred-ob-addons-list .mycred-ob-addon-acc.is-enabled[data-addon-slug]').forEach(function (acc) {
			var input = acc.querySelector('.mycred-ob-addon-acc-head input[type="checkbox"]');
			if (!input || !input.checked) {
				return;
			}
			addons.push(acc);
			hooks = hooks.concat(checkedRows(acc.querySelector('.mycred-ob-addon-hooks'), '.mycred-ob-setting[data-hook-id]'));
			settings = settings.concat(checkedRows(acc.querySelector('.mycred-ob-addon-settings'), '.mycred-ob-setting'));
			checkout = checkout.concat(checkedRows(acc.querySelector('.mycred-ob-addon-checkout'), '.mycred-ob-setting'));
		});
		return { hooks: hooks, settings: settings, checkout: checkout, addons: addons };
	}

	function addItem(list, ok, text) {
		var item = document.createElement('li');
		var mark = document.createElement('span');
		mark.className = ok ? 'mycred-ob-ok' : 'mycred-ob-warn';
		mark.textContent = ok ? '✓' : '!';
		item.appendChild(mark);
		item.appendChild(document.createTextNode(' ' + text));
		list.appendChild(item);
	}

	function missingPlatformNote() {
		var select = document.getElementById('mycred-ob-manual-platform');
		var key = select ? select.value : '';
		var status = key && platformStatus[key] ? platformStatus[key] : null;
		if (!status || status.active !== false || !status.label) {
			return '';
		}
		return t(
			'platformPluginMissing',
			'%s is not installed. Setup will still complete, but %s features will not appear until you install and activate it.'
		).replace(/%s/g, status.label);
	}

	function lockPointTypeLabel() {
		if (!wizard.classList.contains('is-manual')) {
			return;
		}
		var title = document.getElementById('mycred-ob-point-title');
		var label = t('pointTypeName', 'Point type name');
		if (title && title.textContent !== label) {
			title.textContent = label;
		}
	}

	function paint() {
		if (!isManualReview()) {
			return;
		}

		var name = pointName();
		var selected = selectedSetup();
		var overview = document.getElementById('mycred-ob-overview-list');
		if (overview) {
			overview.innerHTML = '';
			var missing = missingPlatformNote();
			if (missing) {
				addItem(overview, false, missing);
			}
			var platform = optionLabel(document.getElementById('mycred-ob-manual-platform'));
			if (platform) {
				addItem(overview, true, t('platformSelected', '%s selected').replace('%s', platform));
			}
			var goal = optionLabel(document.getElementById('mycred-ob-manual-goal'));
			if (goal) {
				addItem(overview, true, t('goalSelected', 'Goal: %s').replace('%s', goal));
			}
			if (name) {
				addItem(overview, true, name);
			}
			addItem(overview, true, t('hooksSelected', '%s earning hooks selected').replace('%s', String(selected.hooks.length)));
			var hookTitles = selected.hooks.map(rowTitle).filter(Boolean).slice(0, 3);
			if (hookTitles.length) {
				addItem(overview, true, t('overviewIncludes', 'Includes: %s').replace('%s', hookTitles.join(', ')));
			}
			if (selected.addons.length) {
				addItem(overview, true, t('addonsSuggested', '%s add-ons recommended').replace('%s', String(selected.addons.length)));
				var addonLabels = selected.addons.map(function (acc) {
					var heading = acc.querySelector('.mycred-ob-addon-acc-head .mycred-ob-setting-title');
					return heading && heading.childNodes[0] ? String(heading.childNodes[0].textContent || '').trim() : '';
				}).filter(Boolean).slice(0, 4);
				if (addonLabels.length) {
					addItem(overview, true, addonLabels.join(', '));
				}
			}
			if (selected.settings.length) {
				addItem(overview, true, t('settingsSuggested', '%s add-on settings suggested').replace('%s', String(selected.settings.length)));
			}
			if (selected.checkout.length) {
				addItem(overview, true, t('checkoutSuggested', '%s checkout settings suggested').replace('%s', String(selected.checkout.length)));
			}
		}

		var minis = document.getElementById('mycred-ob-mini-cards');
		if (!minis) {
			return;
		}
		minis.innerHTML = '';
		function addMini(label, text) {
			var card = document.createElement('div');
			card.className = 'mycred-ob-mini';
			var strong = document.createElement('strong');
			strong.textContent = label;
			var span = document.createElement('span');
			span.textContent = text;
			card.appendChild(strong);
			card.appendChild(span);
			minis.appendChild(card);
		}
		if (name) {
			addMini(t('pointTypeProposed', '1 point type proposed'), name);
		}
		addMini(t('hooksSelected', '%s earning hooks selected').replace('%s', String(selected.hooks.length)), '');
		if (selected.settings.length) {
			addMini(t('settingsSuggested', '%s add-on settings suggested').replace('%s', String(selected.settings.length)), '');
		}
		if (selected.checkout.length) {
			addMini(t('checkoutSuggested', '%s checkout settings suggested').replace('%s', String(selected.checkout.length)), '');
		}
		if (selected.addons.length) {
			addMini(t('addonsSuggested', '%s add-ons recommended').replace('%s', String(selected.addons.length)), '');
		}
	}

	wizard.addEventListener('change', paint);
	wizard.addEventListener('input', paint);

	var pointTitle = document.getElementById('mycred-ob-point-title');
	if (pointTitle) {
		new MutationObserver(lockPointTypeLabel).observe(pointTitle, { childList: true, characterData: true, subtree: true });
	}
	new MutationObserver(lockPointTypeLabel).observe(wizard, { attributes: true, attributeFilter: ['class'] });
	lockPointTypeLabel();
});
