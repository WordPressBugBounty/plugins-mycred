/**
 * myCred Onboarding wizard.
 *
 * Handles step navigation, selection states, and AI add-on recommendations.
 * Point type, hooks, and checkout remain dummy in this slice.
 */
document.addEventListener('DOMContentLoaded', function () {
	var wizard = document.getElementById('mycred-ob-wizard');
	if (!wizard) {
		return;
	}

	var screen = 1;
	var mode = '';
	var program = '';
	var screens = Array.prototype.slice.call(wizard.querySelectorAll('.mycred-ob-screen'));
	var bars = Array.prototype.slice.call(wizard.querySelectorAll('.mycred-ob-bar'));
	var navItems = Array.prototype.slice.call(document.querySelectorAll('.mycred-ob-nav-item'));
	var nextBtn = document.getElementById('mycred-ob-next');
	var backBtn = document.getElementById('mycred-ob-back');
	var skipBtn = document.getElementById('mycred-ob-skip');
	var stepper = document.getElementById('mycred-ob-nav');
	var footer = wizard.querySelector('.mycred-ob-footer');
	var privacyNote = document.getElementById('mycred-ob-privacy-note');
	var label = document.getElementById('mycred-ob-step-label');
	var prompt = document.getElementById('mycred-ob-prompt');
	var promptCount = document.getElementById('mycred-ob-prompt-count');
	var promptMax = parseInt(window.mycredOnboarding && window.mycredOnboarding.promptMax, 10) || 1000;
	if (prompt) {
		prompt.setAttribute('maxlength', String(promptMax));
	}
	var loading = document.getElementById('mycred-ob-loading');
	var siteType = document.getElementById('mycred-ob-site-type');
	var platform = document.getElementById('mycred-ob-platform');
	var goal = document.getElementById('mycred-ob-goal');
	var manualSiteType = document.getElementById('mycred-ob-manual-site-type');
	var manualPlatform = document.getElementById('mycred-ob-manual-platform');
	var manualGoal = document.getElementById('mycred-ob-manual-goal');
	var strings = (window.mycredOnboarding && window.mycredOnboarding.strings) ? window.mycredOnboarding.strings : {};
	var siteTypes = (window.mycredOnboarding && window.mycredOnboarding.siteTypes) ? window.mycredOnboarding.siteTypes : {};
	var platformStatus = (window.mycredOnboarding && window.mycredOnboarding.platformStatus) ? window.mycredOnboarding.platformStatus : {};
	var toolkitProActive = !!(window.mycredOnboarding && window.mycredOnboarding.toolkitProActive);
	var lastRecommendation = null;
	var generating = false;
	var applying = false;
	var loadStepsTimer = null;
	var loadStepIndex = 0;
	var promptScreen = wizard.querySelector('.mycred-ob-screen[data-screen="3"]');
	var loadSteps = document.getElementById('mycred-ob-load-steps');

	function t(key, fallback) {
		return strings[key] || fallback;
	}

	function formatQuotaNumber(value) {
		var n = parseInt(value, 10) || 0;
		try {
			return n.toLocaleString();
		} catch (e) {
			return String(n);
		}
	}

	function quotaPercent(quota) {
		var used = parseInt(quota.used, 10) || 0;
		var total = parseInt(quota.total, 10) || 0;
		if (total <= 0) {
			return 0;
		}
		var pct = (used / total) * 100;
		if (pct > 100) {
			pct = 100;
		}
		return Math.round(pct * 10) / 10;
	}

	function quotaPeriodCopy(reset) {
		if (reset === 'yearly') {
			return { period: t('thisYear', 'This year:'), refresh: t('refreshYear', 'refreshes every year') };
		}
		if (reset === 'lifetime') {
			return { period: t('lifetime', 'Lifetime:'), refresh: '' };
		}
		if (reset === 'never') {
			return { period: t('usedLabel', 'Used:'), refresh: '' };
		}
		return { period: t('thisMonth', 'This month:'), refresh: t('refreshMonth', 'refreshes every month') };
	}

	function syncQuotaChipLabels(box) {
		if (!box || box.hidden) {
			return;
		}
		var isTokens = box.getAttribute('data-quota-type') !== 'credits';
		var pct = box.getAttribute('data-quota-pct') || '0%';
		var title = box.querySelector('[data-quota-title]');
		var pctEl = box.querySelector('[data-quota-pct]');
		var chip = box.querySelector('.mycred-quota-chip');
		if (title) {
			title.textContent = isTokens ? t('tokensLabel', 'AI tokens') : t('creditsLabel', 'AI credits');
		}
		if (pctEl) {
			pctEl.textContent = pct;
		}
		if (chip) {
			chip.setAttribute('aria-expanded', box.classList.contains('is-open') ? 'true' : 'false');
		}
	}

	var lastQuota = (window.mycredOnboarding && window.mycredOnboarding.quota)
		? window.mycredOnboarding.quota
		: { type: 'tokens', used: 0, total: 60000, reset: 'monthly' };

	function paintQuota(quota) {
		if (quota && typeof quota === 'object') {
			lastQuota = quota;
		}
		var boxes = document.querySelectorAll('.mycred-ob-quota');
		var show = mode === 'ai' && lastQuota && lastQuota.total;
		boxes.forEach(function (box) {
			if (!show) {
				box.hidden = true;
				box.classList.remove('is-open');
				return;
			}
			var isTokens = lastQuota.type === 'tokens';
			var pct = quotaPercent(lastQuota);
			var pctText = pct.toFixed(1).replace(/\.0$/, '') + '%';
			var copy = quotaPeriodCopy(lastQuota.reset || 'never');
			box.setAttribute('data-quota-type', isTokens ? 'tokens' : 'credits');
			box.setAttribute('data-quota-pct', pctText);
			var bar = box.querySelector('[data-quota-bar]');
			var usedEl = box.querySelector('[data-quota-used]');
			var totalEl = box.querySelector('[data-quota-total]');
			var periodEl = box.querySelector('[data-quota-period]');
			var refreshEl = box.querySelector('[data-quota-refresh]');
			if (bar) {
				bar.style.width = pct + '%';
			}
			if (usedEl) {
				usedEl.textContent = formatQuotaNumber(lastQuota.used);
			}
			if (totalEl) {
				totalEl.textContent = formatQuotaNumber(lastQuota.total);
			}
			if (periodEl) {
				periodEl.textContent = copy.period;
			}
			if (refreshEl) {
				refreshEl.textContent = copy.refresh;
			}
			box.hidden = false;
			syncQuotaChipLabels(box);
		});
	}

	document.addEventListener('click', function (event) {
		var wrap = event.target.closest('.mycred-ob-quota');
		var chip = event.target.closest('.mycred-quota-chip');
		document.querySelectorAll('.mycred-ob-quota.is-open').forEach(function (box) {
			if (box === wrap) {
				return;
			}
			box.classList.remove('is-open');
			syncQuotaChipLabels(box);
		});
		if (!chip || !wrap || wrap.hidden) {
			return;
		}
		event.preventDefault();
		wrap.classList.toggle('is-open');
		syncQuotaChipLabels(wrap);
	});

	function refreshLiveQuota() {
		var ajaxUrl = window.mycredOnboarding && window.mycredOnboarding.ajaxUrl;
		var nonce = window.mycredOnboarding && window.mycredOnboarding.quotaNonce;
		if (!ajaxUrl || !nonce) {
			return;
		}
		var body = new FormData();
		body.append('action', 'mycred_ai_quota');
		body.append('nonce', nonce);
		body.append('onboarding', '1');
		fetch(ajaxUrl, { method: 'POST', body: body, credentials: 'same-origin' })
			.then(function (response) {
				return response.json();
			})
			.then(function (json) {
				if (json && json.success && json.data) {
					paintQuota(json.data);
				}
			})
			.catch(function () {});
	}

	refreshLiveQuota();

	function fillSelect(select, items, selected, placeholder) {
		if (!select) {
			return;
		}
		select.innerHTML = '';
		if (placeholder) {
			var empty = document.createElement('option');
			empty.value = '';
			empty.textContent = placeholder;
			select.appendChild(empty);
		}
		Object.keys(items || {}).forEach(function (key) {
			var option = document.createElement('option');
			option.value = key;
			option.textContent = items[key];
			if (key === selected) {
				option.selected = true;
			}
			select.appendChild(option);
		});
		enhanceSelect(select);
	}

	var customSelectSeq = 0;

	function getCustomSelectMenu(wrap) {
		if (!wrap) {
			return null;
		}
		var local = wrap.querySelector('.mycred-ob-select-menu');
		if (local) {
			return local;
		}
		var id = wrap.getAttribute('data-select-id');
		if (!id) {
			return null;
		}
		return document.querySelector('.mycred-ob-select-menu[data-select-id="' + id + '"]');
	}

	function closeCustomSelects(exceptWrap) {
		wizard.querySelectorAll('.mycred-ob-select.is-open').forEach(function (wrap) {
			if (wrap === exceptWrap) {
				return;
			}
			wrap.classList.remove('is-open');
			var trigger = wrap.querySelector('.mycred-ob-select-trigger');
			var menu = getCustomSelectMenu(wrap);
			if (trigger) {
				trigger.setAttribute('aria-expanded', 'false');
			}
			if (menu) {
				menu.hidden = true;
			}
		});
	}

	function customSelectLabel(select) {
		var opt = select.options[select.selectedIndex];
		return opt ? opt.textContent : '';
	}

	function rebuildCustomSelect(select) {
		var wrap = select && select.closest ? select.closest('.mycred-ob-select') : null;
		if (!wrap) {
			return;
		}
		var trigger = wrap.querySelector('.mycred-ob-select-trigger');
		var menu = getCustomSelectMenu(wrap);
		if (!trigger || !menu) {
			return;
		}
		trigger.textContent = customSelectLabel(select);
		menu.innerHTML = '';
		Array.prototype.forEach.call(select.options, function (opt, index) {
			var item = document.createElement('button');
			item.type = 'button';
			item.className = 'mycred-ob-select-option' + (opt.selected || select.selectedIndex === index ? ' is-selected' : '');
			item.setAttribute('role', 'option');
			item.textContent = opt.textContent;
			item.addEventListener('click', function (event) {
				event.preventDefault();
				event.stopPropagation();
				select.selectedIndex = index;
				select.dispatchEvent(new Event('change', { bubbles: true }));
				rebuildCustomSelect(select);
				closeCustomSelects();
			});
			menu.appendChild(item);
		});
	}

	function placeCustomSelectMenu(wrap, menu) {
		var trigger = wrap.querySelector('.mycred-ob-select-trigger');
		var rect = (trigger || wrap).getBoundingClientRect();
		if (menu.parentNode !== document.body) {
			document.body.appendChild(menu);
		}
		menu.style.position = 'fixed';
		menu.style.left = Math.round(rect.left) + 'px';
		menu.style.top = Math.round(rect.bottom + 4) + 'px';
		menu.style.width = Math.round(rect.width) + 'px';
		menu.style.zIndex = '100000';
	}

	function repositionOpenCustomSelects(event) {
		if (event && event.target && event.target.closest && event.target.closest('.mycred-ob-select-menu')) {
			return;
		}
		wizard.querySelectorAll('.mycred-ob-select.is-open').forEach(function (wrap) {
			var menu = getCustomSelectMenu(wrap);
			if (menu && !menu.hidden) {
				placeCustomSelectMenu(wrap, menu);
			}
		});
	}

	function enhanceSelect(select) {
		if (!select) {
			return;
		}
		if (select.closest('.mycred-ob-select')) {
			rebuildCustomSelect(select);
			return;
		}
		var wrap = document.createElement('div');
		wrap.className = 'mycred-ob-select';
		customSelectSeq += 1;
		wrap.setAttribute('data-select-id', 'ob-sel-' + customSelectSeq);
		select.parentNode.insertBefore(wrap, select);
		wrap.appendChild(select);
		select.classList.add('mycred-ob-native-select');
		select.setAttribute('tabindex', '-1');
		select.setAttribute('aria-hidden', 'true');

		var trigger = document.createElement('button');
		trigger.type = 'button';
		trigger.className = 'mycred-ob-select-trigger';
		trigger.setAttribute('aria-haspopup', 'listbox');
		trigger.setAttribute('aria-expanded', 'false');

		var menu = document.createElement('div');
		menu.className = 'mycred-ob-select-menu';
		menu.setAttribute('role', 'listbox');
		menu.setAttribute('data-select-id', wrap.getAttribute('data-select-id'));
		menu.hidden = true;

		wrap.appendChild(trigger);
		wrap.appendChild(menu);

		trigger.addEventListener('click', function (event) {
			event.preventDefault();
			event.stopPropagation();
			var willOpen = !wrap.classList.contains('is-open');
			closeCustomSelects();
			if (willOpen) {
				rebuildCustomSelect(select);
				wrap.classList.add('is-open');
				trigger.setAttribute('aria-expanded', 'true');
				placeCustomSelectMenu(wrap, menu);
				menu.hidden = false;
			}
		});

		select.addEventListener('change', function () {
			rebuildCustomSelect(select);
		});

		rebuildCustomSelect(select);
	}

	document.addEventListener('click', function (event) {
		if (!event.target.closest) {
			return;
		}
		if (event.target.closest('.mycred-ob-select') || event.target.closest('.mycred-ob-select-menu')) {
			return;
		}
		closeCustomSelects();
	});
	document.addEventListener('keydown', function (event) {
		if (event.key === 'Escape') {
			closeCustomSelects();
		}
	});
	window.addEventListener('scroll', repositionOpenCustomSelects, true);
	window.addEventListener('resize', repositionOpenCustomSelects);

	function currentType() {
		return siteTypes[siteType && siteType.value] || null;
	}

	function syncPlatformAndGoal(preferredPlatform, preferredGoal) {
		var type = currentType();
		if (!type) {
			fillSelect(platform, {}, '', t('selectPlatform', 'Select a platform'));
			fillSelect(goal, {}, '');
			return;
		}
		var platforms = type.platforms || {};
		var goals = type.goals || {};
		var platformKeys = Object.keys(platforms);
		var goalKeys = Object.keys(goals);
		var nextPlatform = preferredPlatform && platforms[preferredPlatform] ? preferredPlatform : platformKeys[0] || '';
		var nextGoal = preferredGoal && goals[preferredGoal] ? preferredGoal : goalKeys[0] || '';
		fillSelect(platform, platforms, nextPlatform);
		if (nextPlatform && platform) {
			platform.value = nextPlatform;
		}
		fillSelect(goal, goals, nextGoal);
		if (nextGoal && goal) {
			goal.value = nextGoal;
		}
		updateState();
	}

	function aiFieldsReady() {
		return !!(siteType && siteType.value && platform && platform.value && goal && goal.value);
	}

	function initSiteFields() {
		if (!siteType) {
			return;
		}
		var typeLabels = {};
		Object.keys(siteTypes).forEach(function (key) {
			typeLabels[key] = siteTypes[key].label || key;
		});
		fillSelect(siteType, typeLabels, 'store');
		syncPlatformAndGoal('woocommerce', 'repeat_purchases');
		siteType.addEventListener('change', function () {
			syncPlatformAndGoal();
		});
		if (platform) {
			platform.addEventListener('change', updateState);
		}
		if (goal) {
			goal.addEventListener('change', updateState);
		}
	}

	function currentManualType() {
		return siteTypes[manualSiteType && manualSiteType.value] || null;
	}

	function syncManualPlatformAndGoal(preferredPlatform, preferredGoal) {
		var type = currentManualType();
		if (!type) {
			fillSelect(manualPlatform, {}, '', t('selectPlatform', 'Select a platform'));
			fillSelect(manualGoal, {}, '');
			return;
		}
		var platforms = type.platforms || {};
		var goals = type.goals || {};
		var platformKeys = Object.keys(platforms);
		var goalKeys = Object.keys(goals);
		var nextPlatform = preferredPlatform && platforms[preferredPlatform] ? preferredPlatform : platformKeys[0] || '';
		var nextGoal = preferredGoal && goals[preferredGoal] ? preferredGoal : goalKeys[0] || '';
		fillSelect(manualPlatform, platforms, nextPlatform);
		if (nextPlatform && manualPlatform) {
			manualPlatform.value = nextPlatform;
		}
		fillSelect(manualGoal, goals, nextGoal);
		if (nextGoal && manualGoal) {
			manualGoal.value = nextGoal;
		}
		updateState();
	}

	function manualFieldsReady() {
		return !!(manualSiteType && manualSiteType.value && manualPlatform && manualPlatform.value && manualGoal && manualGoal.value);
	}

	function initManualSiteFields() {
		if (!manualSiteType) {
			return;
		}
		var typeLabels = {};
		Object.keys(siteTypes).forEach(function (key) {
			typeLabels[key] = siteTypes[key].label || key;
		});
		fillSelect(manualSiteType, typeLabels, 'store');
		syncManualPlatformAndGoal('woocommerce', 'repeat_purchases');
		manualSiteType.addEventListener('change', function () {
			syncManualPlatformAndGoal();
		});
		if (manualPlatform) {
			manualPlatform.addEventListener('change', updateState);
		}
		if (manualGoal) {
			manualGoal.addEventListener('change', updateState);
		}
	}

	function setModeUi() {
		wizard.classList.toggle('is-manual', mode === 'manual');
		wizard.classList.toggle('is-ai', mode === 'ai');
		var aiAnswer = document.getElementById('mycred-ob-ai-answer');
		if (aiAnswer) {
			aiAnswer.style.display = mode === 'ai' ? '' : 'none';
		}
		var overviewTitle = document.getElementById('mycred-ob-overview-title');
		if (overviewTitle) {
			overviewTitle.textContent = mode === 'manual'
				? t('manualOverview', 'Setup overview')
				: t('aiOverview', 'AI setup overview');
		}
		paintQuota();
	}

	function syncNav() {
		var step = wizardStep(screen);
		navItems.forEach(function (item) {
			var nav = parseInt(item.getAttribute('data-nav'), 10);
			item.classList.toggle('is-active', nav === step);
			item.classList.toggle('is-done', nav < step);
			item.disabled = !step || nav > step;
		});
	}

	function screenFromNav(nav) {
		if (nav === 1) {
			return mode === 'ai' ? 3 : 2;
		}
		if (nav === 2) {
			return 4;
		}
		if (nav === 3) {
			return 5;
		}
		return 1;
	}

	function wizardStep(n) {
		if (n <= 1) {
			return 0;
		}
		if (n === 2 || n === 3) {
			return 1;
		}
		if (n === 4) {
			return 2;
		}
		return 3;
	}

	function suggestedPointTypeName() {
		var input = document.getElementById('mycred-ob-point-name');
		var fromInput = input ? String(input.value || '').trim() : '';
		if (fromInput) {
			return fromInput;
		}
		var rec = lastRecommendation && lastRecommendation.point_type && lastRecommendation.point_type.name;
		rec = String(rec || '').trim();
		return rec || t('pointsFallback', 'Points');
	}

	function looksLikeExchangeRateField(item) {
		return /(^|\.)exchange_rate$/.test(String((item && item.key) || '').toLowerCase());
	}

	function exchangeRateSuffixText() {
		return t('exchangeRateEquals', '= 1 %s').replace('%s', suggestedPointTypeName());
	}

	function appendExchangeRateSuffix(line) {
		if (!line) {
			return;
		}
		line.classList.add('mycred-ob-edit-line--rate');
		var suffix = document.createElement('span');
		suffix.className = 'mycred-ob-rate-suffix';
		suffix.textContent = exchangeRateSuffixText();
		line.appendChild(suffix);
	}

	function syncExchangeRateSuffixes() {
		var text = exchangeRateSuffixText();
		document.querySelectorAll('.mycred-ob-rate-suffix').forEach(function (el) {
			el.textContent = text;
		});
	}

	function syncFinishPointName() {
		var card = document.querySelector('#mycred-ob-mini-cards .mycred-ob-mini[data-point-name]');
		var input = document.getElementById('mycred-ob-point-name');
		if (card && input) {
			var name = String(input.value || '').trim();
			var span = card.querySelector('span');
			if (span && name) {
				span.textContent = name;
			}
		}
		syncExchangeRateSuffixes();
	}

	function show(n) {
		screen = n;
		if (n === 5) {
			syncFinishPointName();
		}
		screens.forEach(function (el) {
			el.classList.toggle('is-active', parseInt(el.getAttribute('data-screen'), 10) === n);
		});
		var step = wizardStep(n);
		bars.forEach(function (bar, i) {
			bar.classList.toggle('is-active', i < step);
		});
		if (label) {
			label.hidden = true;
		}
		backBtn.hidden = !(n > 1 && n < 5);
		nextBtn.hidden = n === 1;
		if (footer) {
			footer.hidden = n === 1;
		}
		syncPrivacyNote();
		if (stepper) {
			stepper.hidden = n === 1;
		}
		wizard.classList.toggle('has-panel', n !== 1);
		if (skipBtn) {
			skipBtn.hidden = n >= 5;
		}
		syncNav();
		updateState();
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	navItems.forEach(function (item) {
		item.addEventListener('click', function () {
			if (item.disabled) {
				return;
			}
			var nav = parseInt(item.getAttribute('data-nav'), 10);
			if (wizardStep(screen) < nav) {
				return;
			}
			show(screenFromNav(nav));
		});
	});

	function clipPrompt() {
		if (!prompt) {
			return '';
		}
		var value = prompt.value || '';
		if (value.length > promptMax) {
			prompt.value = value.slice(0, promptMax);
		}
		return prompt.value;
	}

	function updatePromptCount() {
		var used = clipPrompt().length;
		if (promptCount) {
			promptCount.textContent = t('promptCount', '%1$s / %2$s')
				.replace('%1$s', String(used))
				.replace('%2$s', String(promptMax));
			promptCount.classList.toggle('is-limit', used >= promptMax);
		}
	}

	function syncPrivacyNote() {
		if (!privacyNote) {
			return;
		}
		privacyNote.hidden = !(screen === 3 && !generating);
	}

	function updateState() {
		nextBtn.disabled = false;

		if (screen === 1) {
			nextBtn.disabled = true;
			nextBtn.textContent = t('next', 'Next');
		} else if (screen === 2) {
			nextBtn.disabled = !manualFieldsReady();
			nextBtn.textContent = t('showRecommended', 'Show recommended setup');
		} else if (screen === 3) {
			nextBtn.disabled = !aiFieldsReady();
			nextBtn.textContent = t('generate', 'Generate recommendations');
		} else if (screen === 4) {
			nextBtn.textContent = t('apply', 'Apply selected settings');
		} else {
			nextBtn.textContent = t('openDashboard', 'Open myCred Dashboard');
		}
		updatePromptCount();
	}

	function selectChoice(card) {
		wizard.querySelectorAll('.mycred-ob-choice').forEach(function (el) {
			el.classList.remove('is-selected');
		});
		card.classList.add('is-selected');
		mode = card.getAttribute('data-mode') || '';
		setModeUi();
		updateState();
	}

	function startChoice(card) {
		selectChoice(card);
		if (mode === 'manual') {
			show(2);
			return;
		}
		show(3);
	}

	wizard.querySelectorAll('.mycred-ob-choice').forEach(function (card) {
		card.addEventListener('click', function (event) {
			if (event.target.closest('[data-choice-go]')) {
				return;
			}
			selectChoice(card);
		});
		card.addEventListener('keydown', function (event) {
			if (event.key === 'Enter' || event.key === ' ') {
				event.preventDefault();
				startChoice(card);
			}
		});
		var goBtn = card.querySelector('[data-choice-go]');
		if (goBtn) {
			goBtn.addEventListener('click', function (event) {
				event.preventDefault();
				event.stopPropagation();
				startChoice(card);
			});
		}
	});

	var pointNameField = document.getElementById('mycred-ob-point-name');
	if (pointNameField) {
		pointNameField.addEventListener('input', syncFinishPointName);
	}

	if (prompt) {
		prompt.addEventListener('input', updateState);
	}

	var examples = {
		store: {
			prompt: t(
				'exampleStore',
				'I run a WooCommerce fashion store. Customers should earn 1 point for every $1 spent, 20 points for approved product reviews, and 100 points after a successful referral. They should use points as a checkout discount, but points should cover no more than 50% of an order.'
			),
			siteType: 'store',
			platform: 'woocommerce',
			goal: 'repeat_purchases'
		},
		community: {
			prompt: t(
				'exampleCommunity',
				'I run a member community. Reward registration, daily login, publishing posts, useful comments and receiving likes. Add ranks and badges, but do not let members convert points to cash.'
			),
			siteType: 'community',
			platform: 'buddyboss',
			goal: 'engagement'
		},
		courses: {
			prompt: t(
				'exampleCourses',
				'I sell online courses. Students should earn points when completing lessons, passing quizzes and finishing a course. Let them use points to unlock bonus content and show progress with ranks.'
			),
			siteType: 'lms',
			platform: 'learndash',
			goal: 'course_completion'
		}
	};

	wizard.querySelectorAll('.mycred-ob-example').forEach(function (button) {
		button.addEventListener('click', function () {
			var key = button.getAttribute('data-example');
			var example = examples[key];
			if (!example) {
				return;
			}
			prompt.value = example.prompt.slice(0, promptMax);
			if (siteType && example.siteType) {
				siteType.value = example.siteType;
				enhanceSelect(siteType);
				syncPlatformAndGoal(example.platform, example.goal);
			}
			updateState();
		});
	});

	function hideRecommendError() {
		var notice = document.getElementById('mycred-ob-recommend-error');
		if (!notice) {
			return;
		}
		notice.hidden = true;
		notice.textContent = '';
	}

	function showRecommendError(message, isHtml) {
		var notice = document.getElementById('mycred-ob-recommend-error');
		if (!notice) {
			window.alert(message || t('recommendError', 'Could not generate add-on recommendations. Please try again.'));
			return;
		}
		if (isHtml) {
			notice.innerHTML = message || t('recommendError', 'Could not generate add-on recommendations. Please try again.');
			var link = notice.querySelector('.mycred-ob-open-manual');
			if (link) {
				link.addEventListener('click', function (event) {
					event.preventDefault();
					var card = wizard.querySelector('.mycred-ob-choice[data-mode="manual"]');
					if (card) {
						startChoice(card);
					}
				});
			}
		} else {
			notice.textContent = message || t('recommendError', 'Could not generate add-on recommendations. Please try again.');
		}
		notice.hidden = false;
	}

	function normalizeAddonSlug(slug) {
		return String(slug || '').toLowerCase().replace(/_/g, '-');
	}

	function foldChildAddonSlug(slug) {
		slug = normalizeAddonSlug(slug);
		return slug === 'mycred-woocommerce-plus' ? 'woocommerce' : slug;
	}

	function itemRequiresPro(item) {
		if (!item) {
			return false;
		}
		if (item.requires_pro) {
			return true;
		}
		return !toolkitProActive && normalizeAddonSlug(item.addon) === 'mycred-woocommerce-plus';
	}

	function appendRequiresProBadge(titleEl) {
		if (!titleEl) {
			return;
		}
		var requires = document.createElement('span');
		requires.className = 'mycred-ob-badge mycred-ob-badge--missing';
		requires.textContent = t('requiresPlugin', 'Requires %s').replace('%s', t('addonsPro', 'myCred Addons Pro'));
		titleEl.appendChild(document.createTextNode(' '));
		titleEl.appendChild(requires);
	}

	function markRequiresProRow(row, item) {
		if (!itemRequiresPro(item) || !row) {
			return;
		}
		row.setAttribute('data-requires-pro', '1');
		row.classList.add('has-missing-plugin');
	}

	function addonSlugSet(addons) {
		var set = {};
		(addons || []).forEach(function (addon) {
			if (addon && addon.slug) {
				set[foldChildAddonSlug(addon.slug)] = true;
			}
		});
		return set;
	}

	function itemAddonSlug(item) {
		return foldChildAddonSlug((item && item.addon) || '');
	}

	function settingUi(item) {
		return String((item && item.ui) || '').toLowerCase();
	}

	var HIDDEN_DEFAULT_POINT_TYPE_KEYS = {
		'leaderboard_default.leaderboard_pt_type': 'mycred-learndash',
		'bboss.avatar.types': 'mycred-buddyboss',
		'bboss.avatar.ranks': 'mycred-buddyboss',
		'bboss.profile.types': 'mycred-buddyboss',
		'bboss.profile.ranks': 'mycred-buddyboss',
		'bboss.activity.types': 'mycred-buddyboss',
		'bboss.activity.ranks': 'mycred-buddyboss',
		'bboss.forum.types': 'mycred-buddyboss',
		'bboss.forum.ranks': 'mycred-buddyboss'
	};

	function isHiddenDefaultPointTypeSetting(item) {
		return !!HIDDEN_DEFAULT_POINT_TYPE_KEYS[String((item && item.key) || '').toLowerCase()];
	}

	var HIDDEN_SKIP_SETTING_KEYS = {
		'bboss.avatar.badges': true,
		'bboss.profile.badges': true,
		'bboss.activity.badges': true,
		'bboss.forum.badges': true
	};

	function isForcedHiddenSetting(item) {
		var key = String((item && item.key) || '').toLowerCase();
		return isHiddenDefaultPointTypeSetting(item) || !!HIDDEN_SKIP_SETTING_KEYS[key];
	}

	function isVisibleSetting(item) {
		if (isForcedHiddenSetting(item)) {
			return false;
		}
		return settingUi(item) === 'show';
	}

	function bareSettingTitle(title) {
		return String(title || '')
			.toLowerCase()
			.replace(/\s+/g, ' ')
			.trim()
			.replace(/^[^:]{1,40}:\s*/, '')
			.trim();
	}

	function isPartialPaymentSettingKey(key) {
		key = String(key || '').toLowerCase();
		return /^mwp_partial_payments(\.|$)/.test(key) || /^partial_payment_settings(\.|$)/.test(key);
	}

	function isPartialPaymentEnableKey(key) {
		return String(key || '').toLowerCase() === 'mwp_partial_payments.enable';
	}

	function isPartialPaymentVisibleSetting(item) {
		var key = String((item && item.key) || '').toLowerCase();
		if (isPartialPaymentEnableKey(key)) {
			return true;
		}
		return PARTIAL_PAYMENT_VISIBLE_CHILDREN.some(function (spec) {
			return spec.key === key;
		});
	}

	function defaultPartialPaymentEnable(addonSlug, existing) {
		var item = Object.assign({}, existing || {
			addon: addonSlug || 'woocommerce',
			key: 'mwp_partial_payments.enable',
			title: 'Cart discount with points (Partial Payments)',
			description: 'Allows shoppers to pay part of the cart with points.',
			type: 'checkbox',
			value: '1',
			priority: 'recommended',
			checked: true
		});
		item.ui = 'show';
		item.key = 'mwp_partial_payments.enable';
		item.type = item.type || 'checkbox';
		item.addon = item.addon || addonSlug || 'woocommerce';
		if (item.checked == null) {
			item.checked = true;
		}
		if (!item.priority) {
			item.priority = 'recommended';
		}
		return item;
	}

	function setupHasPartialPaymentsEnabled(settings) {
		return (settings || []).some(function (row) {
			return isPartialPaymentEnableKey(row && row.key)
				&& ['1', 'yes', 'true', 'on'].indexOf(String((row && row.value) || '').toLowerCase()) !== -1;
		});
	}

	var PARTIAL_PAYMENT_VISIBLE_CHILDREN = [
		{
			key: 'partial_payment_settings.exchange_rate',
			title: 'Exchange Rate',
			value: '1',
			description: 'Store currency per 1 point.'
		},
		{
			key: 'partial_payment_settings.mwp_max',
			title: 'Maximum',
			value: '100',
			description: 'Max percent of the cart that can be paid with points (cap 100).'
		}
	];

	var PARTIAL_PAYMENT_HIDDEN_DEFAULTS = [
		{ key: 'mwp_partial_payments.change_position', title: 'Select Template to Display', value: 'both' },
		{ key: 'mwp_partial_payments.position', title: 'Position', value: 'after' },
		{ key: 'mwp_partial_payments.multiple', title: 'Multiple Payment', value: 'no' },
		{ key: 'mwp_partial_payments.undo', title: 'Undo', value: 'Yes' },
		{ key: 'mwp_partial_payments.rewards', title: 'Store Rewards', value: '3' },
		{ key: 'mwp_partial_payments.free_shipping', title: 'Pay for: Shipping', value: 'no' },
		{ key: 'mwp_partial_payments.sale_items', title: 'Pay for: Sale Items', value: 'Yes' },
		{ key: 'mwp_partial_payments.selecttype', title: 'Selector Type', value: 'slider' },
		{ key: 'mwp_partial_payments.step', title: 'Steps', value: '1' },
		{ key: 'mwp_partial_payments.title', title: 'Partial Payment Title', value: 'Partial Payment' },
		{ key: 'mwp_partial_payments.desc', title: 'Partial Payment Description', value: '' },
		{ key: 'mwp_partial_payments.button', title: 'Partial Payment Button Label', value: 'Apply discount' },
		{ key: 'mwp_partial_payments.checkout_total', title: 'Point Cost', value: 'both' },
		{ key: 'mwp_partial_payments.checkout_total_label', title: 'Total Label', value: 'Total' },
		{ key: 'mwp_partial_payments.checkout_balance', title: 'Users Balance', value: 'cart' },
		{ key: 'mwp_partial_payments.checkout_balance_label', title: 'Balance Label', value: 'Balance' },
		{ key: 'partial_payment_settings.enable_pointtype', title: 'Enable Point Type', value: '1' },
		{ key: 'partial_payment_settings.mwp_min', title: 'Minimum', value: '1' }
	];

	function enrichPartialPaymentSettings(items) {
		var settings = (items || []).slice();
		var enableIdx = -1;
		var enableAddon = 'woocommerce';
		settings.forEach(function (item, i) {
			if (isPartialPaymentEnableKey(item && item.key)) {
				enableIdx = i;
				enableAddon = item.addon || enableAddon;
			}
		});
		if (enableIdx === -1) {
			return settings;
		}
		var pulled = {};
		settings = settings.filter(function (item) {
			var key = String((item && item.key) || '').toLowerCase();
			var spec = PARTIAL_PAYMENT_VISIBLE_CHILDREN.filter(function (row) {
				return row.key === key;
			})[0];
			if (!spec) {
				return true;
			}
			pulled[key] = item;
			return false;
		});
		enableIdx = -1;
		settings.forEach(function (item, i) {
			if (isPartialPaymentEnableKey(item && item.key)) {
				enableIdx = i;
			}
		});
		if (enableIdx === -1) {
			return settings;
		}
		var children = PARTIAL_PAYMENT_VISIBLE_CHILDREN.map(function (spec) {
			var item = Object.assign({}, pulled[spec.key] || {
				addon: enableAddon,
				key: spec.key,
				title: spec.title,
				description: spec.description,
				value: spec.value,
				type: 'number',
				priority: 'recommended',
				checked: true
			});
			item.ui = 'show';
			item.depends_on = 'mwp_partial_payments.enable';
			item.depends_values = ['1'];
			item.addon = item.addon || enableAddon;
			item.key = spec.key;
			item.title = item.title || spec.title;
			item.type = item.type || 'number';
			if (spec.key === 'partial_payment_settings.exchange_rate') {
				item.value = spec.value;
			} else if (item.value == null || item.value === '') {
				item.value = spec.value;
			}
			return item;
		});
		settings.splice.apply(settings, [enableIdx + 1, 0].concat(children));
		return settings;
	}

	var WOO_PAYMENT_SETTING_KEYS = {
		enabled: true,
		title: true,
		description: true,
		log_template: true,
		log_template_refund: true,
		exchange_rate: true,
		show_total: true,
		total_label: true,
		balance_format: true,
		profit_sharing_percent: true,
		profit_sharing_log: true,
		profit_sharing_refund_log: true,
		product_restriction: true,
		category_restriction: true,
		tag_restriction: true
	};

	function isWooPaymentSettingKey(key) {
		return !!WOO_PAYMENT_SETTING_KEYS[String(key || '').toLowerCase()];
	}

	function isWooPaymentSetting(item, addonSlug) {
		var slug = foldChildAddonSlug((item && item.addon) || addonSlug || '');
		return slug === 'woocommerce' && isWooPaymentSettingKey(item && item.key);
	}

	function isWooPaymentEnableKey(key) {
		return String(key || '').toLowerCase() === 'enabled';
	}

	function isWooPaymentVisibleSetting(item, addonSlug) {
		if (!isWooPaymentSetting(item, addonSlug)) {
			return false;
		}
		var key = String((item && item.key) || '').toLowerCase();
		if (isWooPaymentEnableKey(key)) {
			return true;
		}
		return WOO_PAYMENT_VISIBLE_CHILDREN.some(function (spec) {
			return spec.key === key;
		});
	}

	function setupHasWooPaymentsEnabled(settings) {
		return (settings || []).some(function (row) {
			return isWooPaymentSetting(row)
				&& isWooPaymentEnableKey(row && row.key)
				&& ['1', 'yes', 'true', 'on'].indexOf(String((row && row.value) || '').toLowerCase()) !== -1;
		});
	}

	function defaultWooPaymentEnable(addonSlug, existing) {
		var item = Object.assign({}, existing || {
			addon: addonSlug || 'woocommerce',
			key: 'enabled',
			title: 'Enable/Disable',
			group: 'WooCommerce Payments',
			description: 'Enable Pay with Points at checkout.',
			type: 'checkbox',
			value: '1',
			priority: 'recommended',
			checked: true
		});
		item.ui = 'show';
		item.key = 'enabled';
		item.type = 'checkbox';
		item.addon = item.addon || addonSlug || 'woocommerce';
		item.group = item.group || 'WooCommerce Payments';
		if (item.checked == null) {
			item.checked = true;
		}
		if (!item.priority) {
			item.priority = 'recommended';
		}
		return item;
	}

	var WOO_PAYMENT_VISIBLE_CHILDREN = [
		{
			key: 'exchange_rate',
			title: 'Exchange Rate',
			type: 'number',
			value: '1',
			description: 'Store currency per 1 point, when the store currency is not a point type.'
		}
	];

	var WOO_PAYMENT_HIDDEN_DEFAULTS = [
		{ key: 'title', title: 'Title', value: 'Pay with Points' },
		{ key: 'description', title: 'Customer Message', value: 'Deduct the amount from your Points balance.' },
		{ key: 'log_template', title: 'Log Template', value: 'Payment for Order: #%order_id%' },
		{ key: 'log_template_refund', title: 'Refund Log Template', value: 'Payment refund for order #%order_id% Reason: %reason%' },
		{ key: 'show_total', title: 'Show Total', value: 'checkout' },
		{ key: 'total_label', title: 'Label', value: 'Order Total in Points' },
		{ key: 'balance_format', title: 'Balance Label', value: 'Your Balance' },
		{ key: 'profit_sharing_percent', title: 'Profit Sharing', value: '0' },
		{ key: 'profit_sharing_log', title: 'Log Template', value: 'Sale of %post_title%' },
		{ key: 'profit_sharing_refund_log', title: 'Refund Log Template', value: 'Refund for order #%order_id%' },
		{ key: 'product_restriction', title: 'Product Restriction', value: '' },
		{ key: 'category_restriction', title: 'Category Restriction', value: '' },
		{ key: 'tag_restriction', title: 'Tag Restriction', value: '' }
	];

	function enrichWooPaymentSettings(items, addonSlug) {
		var settings = (items || []).filter(function (item) {
			return isWooPaymentVisibleSetting(item, addonSlug);
		}).map(function (item) {
			item = Object.assign({}, item || {});
			item.ui = 'show';
			item.addon = item.addon || addonSlug || 'woocommerce';
			if (!isWooPaymentEnableKey(item.key)) {
				item.depends_on = item.depends_on || 'enabled';
				item.depends_values = item.depends_values && item.depends_values.length ? item.depends_values : ['1'];
			}
			return item;
		});
		var enableIdx = -1;
		settings.forEach(function (item, i) {
			if (isWooPaymentEnableKey(item && item.key)) {
				enableIdx = i;
			}
		});
		if (enableIdx === -1) {
			return settings;
		}
		var pulled = {};
		settings = settings.filter(function (item) {
			var key = String((item && item.key) || '').toLowerCase();
			if (isWooPaymentEnableKey(key)) {
				return true;
			}
			var spec = WOO_PAYMENT_VISIBLE_CHILDREN.filter(function (row) {
				return row.key === key;
			})[0];
			if (!spec) {
				return true;
			}
			pulled[key] = item;
			return false;
		});
		enableIdx = -1;
		settings.forEach(function (item, i) {
			if (isWooPaymentEnableKey(item && item.key)) {
				enableIdx = i;
			}
		});
		if (enableIdx === -1) {
			return settings;
		}
		var children = WOO_PAYMENT_VISIBLE_CHILDREN.map(function (spec) {
			var item = Object.assign({}, spec, pulled[spec.key] || {});
			item.ui = 'show';
			item.addon = item.addon || addonSlug || 'woocommerce';
			item.key = spec.key;
			item.title = item.title || spec.title;
			item.type = item.type || spec.type;
			item.group = item.group || 'WooCommerce Payments';
			item.depends_on = 'enabled';
			item.depends_values = ['1'];
			if (spec.multiple) {
				item.multiple = true;
			}
			if (spec.options && (!item.options || !Object.keys(item.options).length)) {
				item.options = spec.options;
			}
			if (item.value == null || item.value === '') {
				item.value = spec.value;
			}
			return item;
		});
		settings.splice.apply(settings, [enableIdx + 1, 0].concat(children));
		return settings;
	}

	function isProductReferralHook(item) {
		return String((item && (item.hook_id || item.id)) || '').toLowerCase() === 'product_referral';
	}

	function isProductReferralSettingKey(key) {
		return String(key || '').toLowerCase().indexOf('mwp_product_referral.') === 0;
	}

	function isProductReferralVisibleSetting(item) {
		return String((item && item.key) || '').toLowerCase() === 'mwp_product_referral.referral_link_type';
	}

	function setupHasProductReferralHook(hooks) {
		return (hooks || []).some(function (row) {
			return String((row && row.hook_id) || '').toLowerCase() === 'product_referral';
		});
	}

	function defaultProductReferralHook(addonSlug) {
		return {
			hook_id: 'product_referral',
			title: 'WooCommerce Product Referral',
			description: 'Award points on the first referred product sale.',
			creds: '10',
			priority: 'recommended',
			checked: true,
			addon: addonSlug || 'woocommerce'
		};
	}

	function defaultProductReferralLinkType(addonSlug, existing) {
		var item = Object.assign({}, existing || {
			addon: addonSlug || 'woocommerce',
			key: 'mwp_product_referral.referral_link_type',
			title: 'Referral ID Type',
			type: 'radio',
			value: 'id',
			options: {
				id: 'Assign numeric referral IDs to each user',
				username: 'Assign usernames as IDs for each user'
			},
			priority: 'recommended',
			checked: true
		});
		item.ui = 'show';
		item.depends_on_hook = 'product_referral';
		item.key = 'mwp_product_referral.referral_link_type';
		item.type = item.type || 'radio';
		item.title = item.title || 'Referral ID Type';
		if (!item.options || typeof item.options !== 'object' || !Object.keys(item.options).length) {
			item.options = {
				id: 'Assign numeric referral IDs to each user',
				username: 'Assign usernames as IDs for each user'
			};
		}
		if (item.value == null || item.value === '') {
			item.value = 'id';
		}
		item.addon = item.addon || addonSlug || 'woocommerce';
		return item;
	}

	var PRODUCT_REFERRAL_HIDDEN_DEFAULTS = [
		{ key: 'mwp_product_referral.can_cookie_expire', title: 'Make cookie expire', value: '1' },
		{ key: 'mwp_product_referral.cookie_expiration_days', title: 'Cookie Expiration in days', value: '10' },
		{ key: 'mwp_product_referral.ref_cookie_name', title: 'Referral Cookie name', value: 'mycred_woo_product_ref' }
	];

	function appendProductReferralAutoSettings(settings, hooks) {
		if (!setupHasProductReferralHook(hooks)) {
			return;
		}
		var enableRow = (settings || []).filter(function (row) {
			return isProductReferralVisibleSetting(row);
		})[0];
		var addon = (enableRow && enableRow.addon) || 'woocommerce';
		function hasKey(key) {
			return (settings || []).some(function (row) {
				return String((row && row.key) || '').toLowerCase() === key;
			});
		}
		function pushRow(spec) {
			if (hasKey(spec.key)) {
				return;
			}
			var fromRec = (lastRecommendation.settings || []).filter(function (row) {
				return String((row && row.key) || '').toLowerCase() === spec.key;
			})[0];
			settings.push({
				addon: (fromRec && fromRec.addon) || addon,
				key: spec.key,
				title: (fromRec && fromRec.title) || spec.title,
				value: fromRec && fromRec.value != null && fromRec.value !== '' ? fromRec.value : spec.value,
				options: (fromRec && fromRec.options) || {}
			});
		}
		if (!hasKey('mwp_product_referral.referral_link_type')) {
			var link = defaultProductReferralLinkType(addon);
			pushRow({ key: link.key, title: link.title, value: link.value });
		}
		PRODUCT_REFERRAL_HIDDEN_DEFAULTS.forEach(pushRow);
	}

	function appendPartialPaymentAutoSettings(settings) {
		if (!setupHasPartialPaymentsEnabled(settings)) {
			return;
		}
		var enableRow = (settings || []).filter(function (row) {
			return isPartialPaymentEnableKey(row && row.key);
		})[0];
		var addon = (enableRow && enableRow.addon) || 'woocommerce';
		function hasKey(key) {
			return (settings || []).some(function (row) {
				return String((row && row.key) || '').toLowerCase() === key;
			});
		}
		function pushRow(spec, ui) {
			if (hasKey(spec.key)) {
				return;
			}
			var fromRec = (lastRecommendation.settings || []).filter(function (row) {
				return String((row && row.key) || '').toLowerCase() === spec.key;
			})[0];
			settings.push({
				addon: (fromRec && fromRec.addon) || addon,
				key: spec.key,
				title: (fromRec && fromRec.title) || spec.title,
				value: fromRec && fromRec.value != null && fromRec.value !== '' ? fromRec.value : spec.value,
				options: (fromRec && fromRec.options) || {},
				ui: ui || ''
			});
		}
		PARTIAL_PAYMENT_VISIBLE_CHILDREN.forEach(function (spec) {
			pushRow(spec, 'show');
		});
		PARTIAL_PAYMENT_HIDDEN_DEFAULTS.forEach(function (spec) {
			pushRow(spec, '');
		});
	}

	function appendWooPaymentAutoSettings(settings) {
		if (!setupHasWooPaymentsEnabled(settings)) {
			return;
		}
		var enableRow = (settings || []).filter(function (row) {
			return isWooPaymentSetting(row) && isWooPaymentEnableKey(row && row.key);
		})[0];
		var addon = (enableRow && enableRow.addon) || 'woocommerce';
		function hasKey(key) {
			return (settings || []).some(function (row) {
				return isWooPaymentSetting(row) && String((row && row.key) || '').toLowerCase() === key;
			});
		}
		function pushRow(spec, ui) {
			if (hasKey(spec.key)) {
				return;
			}
			var fromRec = (lastRecommendation.settings || []).filter(function (row) {
				return isWooPaymentSetting(row) && String((row && row.key) || '').toLowerCase() === spec.key;
			})[0];
			settings.push({
				addon: (fromRec && fromRec.addon) || addon,
				key: spec.key,
				title: (fromRec && fromRec.title) || spec.title,
				value: fromRec && fromRec.value != null && fromRec.value !== '' ? fromRec.value : spec.value,
				options: (fromRec && fromRec.options) || {},
				ui: ui || ''
			});
		}
		WOO_PAYMENT_VISIBLE_CHILDREN.forEach(function (spec) {
			pushRow(spec, 'show');
		});
		WOO_PAYMENT_HIDDEN_DEFAULTS.forEach(function (spec) {
			pushRow(spec, '');
		});
	}

	function isStoreCheckoutItem(item) {
		var key = String((item && item.key) || '').toLowerCase();
		var title = bareSettingTitle(item && item.title);
		if (/^mwp_(partial_payments|coupons|my_account)(\.|$)/.test(key)) {
			return true;
		}
		return title === 'enable partial payments'
			|| title === 'enable coupons'
			|| title === 'enable my account tab'
			|| title === 'enable coupon generator';
	}

	function checkoutCopiesVisibleSetting(item, settings) {
		var itemKey = String((item && item.key) || '').toLowerCase().trim();
		var itemTitle = bareSettingTitle(item && item.title);
		return (settings || []).some(function (setting) {
			if (!isVisibleSetting(setting)) {
				return false;
			}
			var settingKey = String(setting.key || '').toLowerCase().trim();
			if (itemKey && settingKey && itemKey === settingKey) {
				return true;
			}
			var settingTitle = bareSettingTitle(setting.title);
			return itemTitle !== '' && itemTitle === settingTitle;
		});
	}

	function createProductRewardInfoRow() {
		var row = document.createElement('div');
		row.className = 'mycred-ob-setting mycred-ob-setting--info';
		var body = document.createElement('div');
		var title = document.createElement('p');
		title.className = 'mycred-ob-setting-title';
		title.textContent = t('productRewardInfoTitle', 'Single Product Reward');
		var desc = document.createElement('p');
		desc.className = 'mycred-ob-setting-desc';
		desc.textContent = t(
			'productRewardInfo',
			'You can set a point reward on each product later from the product edit screen.'
		);
		body.appendChild(title);
		body.appendChild(desc);
		row.appendChild(body);
		return row;
	}

	function appendProductRewardAutoSettings(settings, addons) {
		var hasWoo = (addons || []).some(function (slug) {
			return foldChildAddonSlug(slug) === 'woocommerce';
		});
		if (!hasWoo) {
			return;
		}
		var key = 'reward.types.{type}';
		var already = (settings || []).some(function (row) {
			return String((row && row.key) || '') === key || /^reward\.types\./.test(String((row && row.key) || ''));
		});
		if (already) {
			return;
		}
		settings.push({
			addon: 'woocommerce',
			key: key,
			title: 'Single Product Reward',
			value: '1',
			options: {}
		});
	}

	function createAddonAboutPane(addon) {
		var purpose = String((addon && (addon.purpose || addon.description)) || '').trim();
		if (!purpose) {
			return null;
		}
		var pane = document.createElement('div');
		pane.className = 'mycred-ob-addon-about mycred-ob-addon-pane';
		var p = document.createElement('p');
		p.className = 'mycred-ob-addon-purpose';
		p.textContent = purpose;
		pane.appendChild(p);
		return pane;
	}

	function partitionByAddon(items, addonSlugs) {
		var standalone = [];
		var byAddon = {};
		(items || []).forEach(function (item) {
			var slug = itemAddonSlug(item);
			if (slug && addonSlugs[slug]) {
				if (!byAddon[slug]) {
					byAddon[slug] = [];
				}
				byAddon[slug].push(item);
			} else {
				standalone.push(item);
			}
		});
		return { standalone: standalone, byAddon: byAddon };
	}

	function firstAddonHost(addonSlugs) {
		if (addonSlugs.woocommerce) {
			return 'woocommerce';
		}
		var host = '';
		Object.keys(addonSlugs || {}).some(function (slug) {
			host = slug;
			return true;
		});
		return host;
	}

	function isCoreStandaloneSetting(item) {
		var slug = itemAddonSlug(item);
		return slug === '' || slug === 'mycred';
	}

	function foldStandaloneIntoAddons(grouped, addonSlugs) {
		var host = firstAddonHost(addonSlugs);
		function fold(kind) {
			var leftover = (grouped[kind] && grouped[kind].standalone) || [];
			leftover.forEach(function (item) {
				var slug = itemAddonSlug(item);
				if (slug && addonSlugs[slug]) {
					if (!grouped[kind].byAddon[slug]) {
						grouped[kind].byAddon[slug] = [];
					}
					grouped[kind].byAddon[slug].push(item);
					return;
				}
				if (kind === 'settings' && isCoreStandaloneSetting(item)) {
					return;
				}
				if (!host) {
					return;
				}
				if (!grouped[kind].byAddon[host]) {
					grouped[kind].byAddon[host] = [];
				}
				grouped[kind].byAddon[host].push(item);
			});
			grouped[kind].standalone = [];
		}
		fold('settings');
		fold('checkout');
	}

	function createAddonSubhead(label, count) {
		var heading = document.createElement('div');
		heading.className = 'mycred-ob-addon-panel-head';
		var title = document.createElement('span');
		title.className = 'mycred-ob-addon-subhead';
		title.textContent = label;
		heading.appendChild(title);
		if (count) {
			var badge = document.createElement('span');
			badge.className = 'mycred-ob-addon-count';
			badge.textContent = String(count);
			heading.appendChild(badge);
		}
		return heading;
	}

	function createAddonPaneLayout(panes, options) {
		options = options || {};
		var layout = document.createElement('div');
		layout.className = 'mycred-ob-addon-layout';
		var nav = document.createElement('nav');
		nav.className = 'mycred-ob-addon-nav';
		var stage = document.createElement('div');
		stage.className = 'mycred-ob-addon-stage';
		var stageHead = document.createElement('div');
		stageHead.className = 'mycred-ob-addon-stage-head';
		var stageTitle = document.createElement('span');
		stageTitle.className = 'mycred-ob-addon-stage-title';
		stageHead.appendChild(stageTitle);
		stage.appendChild(stageHead);

		var tabNote = document.createElement('p');
		tabNote.className = 'mycred-ob-plugin-note';
		tabNote.hidden = true;

		function showPane(id) {
			panes.forEach(function (tab) {
				var on = tab.id === id;
				tab.btn.classList.toggle('is-active', on);
				tab.pane.hidden = !on;
				tab.btn.setAttribute('aria-selected', on ? 'true' : 'false');
			});
			var current = null;
			panes.forEach(function (tab) {
				if (tab.id === id) {
					current = tab;
				}
			});
			if (!current) {
				return;
			}
			if (current.id === 'about') {
				stageTitle.textContent = t('addonAboutTitle', 'What this add-on does');
			} else {
				stageTitle.textContent = t('addonConfigTitle', '%s configuration').replace('%s', current.label);
			}
			var extra = current.note || '';
			if (extra) {
				tabNote.textContent = extra;
				tabNote.hidden = false;
			} else {
				tabNote.textContent = '';
				tabNote.hidden = true;
			}
		}

		panes.forEach(function (tab, index) {
			var btn = document.createElement('button');
			btn.type = 'button';
			btn.className = 'mycred-ob-addon-nav-btn' + (index === 0 ? ' is-active' : '');
			btn.setAttribute('data-tab', tab.id);
			btn.setAttribute('role', 'tab');
			var navLabel = document.createElement('span');
			navLabel.className = 'mycred-ob-addon-nav-label';
			navLabel.textContent = tab.label;
			btn.appendChild(navLabel);
			if (tab.id === 'hooks') {
				var rulesChip = document.createElement('span');
				rulesChip.className = 'mycred-ob-badge mycred-ob-badge--rec';
				rulesChip.textContent = t('addonHooks', 'Hooks');
				btn.appendChild(rulesChip);
			}
			btn.addEventListener('click', function (event) {
				event.preventDefault();
				event.stopPropagation();
				showPane(tab.id);
			});
			tab.btn = btn;
			tab.pane.hidden = index !== 0;
			nav.appendChild(btn);
			stage.appendChild(tab.pane);
		});

		if (options.note) {
			var pluginNote = document.createElement('p');
			pluginNote.className = 'mycred-ob-plugin-note';
			pluginNote.textContent = options.note;
			nav.appendChild(pluginNote);
		}
		nav.appendChild(tabNote);

		layout.appendChild(nav);
		layout.appendChild(stage);
		if (panes[0]) {
			showPane(panes[0].id);
		}
		return layout;
	}

	function createAddonAccordion(addon, nested) {
		nested = nested || {};
		var hooks = nested.hooks || [];
		var settings = (nested.settings || []).filter(isVisibleSetting);
		var checkoutItems = nested.checkout || [];
		var earningHooks = hooks.filter(function (hook) {
			return !isProductReferralHook(hook);
		});
		var referralHooks = hooks.filter(isProductReferralHook);
		var otherSettings = settings.filter(function (item) {
			return !isProductReferralVisibleSetting(item)
				&& !isPartialPaymentVisibleSetting(item)
				&& !isWooPaymentSetting(item, addon.slug);
		});
		var referralSettings = settings.filter(isProductReferralVisibleSetting);
		var partialPaymentSettings = settings.filter(isPartialPaymentVisibleSetting);
		var wooPaymentSettings = settings.filter(function (item) {
			return isWooPaymentVisibleSetting(item, addon.slug);
		});
		if (foldChildAddonSlug(addon.slug) === 'woocommerce') {
			if (!partialPaymentSettings.some(function (item) {
				return isPartialPaymentEnableKey(item.key);
			})) {
				partialPaymentSettings = enrichPartialPaymentSettings(
					[defaultPartialPaymentEnable(addon.slug)].concat(partialPaymentSettings)
				);
			}
			if (!wooPaymentSettings.some(function (item) {
				return isWooPaymentEnableKey(item.key);
			})) {
				wooPaymentSettings = [defaultWooPaymentEnable(addon.slug)].concat(wooPaymentSettings);
			}
			wooPaymentSettings = enrichWooPaymentSettings(wooPaymentSettings, addon.slug);
		}
		if (foldChildAddonSlug(addon.slug) === 'woocommerce' && !referralHooks.length) {
			referralHooks = [defaultProductReferralHook(addon.slug)];
		}
		if (referralHooks.length) {
			referralSettings = [defaultProductReferralLinkType(addon.slug, referralSettings[0])];
		}
		var recommended = addon.priority === 'recommended';
		var canApply = addon.can_apply !== false;
		var wrap = document.createElement('div');
		var missingPlugin = addon.missing_plugin || null;
		var enabled = recommended && canApply;
		wrap.className = 'mycred-ob-addon-acc' + (enabled ? ' is-open is-enabled' : '') + (missingPlugin ? ' has-missing-plugin' : '');
		wrap.setAttribute('data-addon-slug', addon.slug || '');
		wrap.setAttribute('data-source', addon.source || '');
		wrap.setAttribute('data-can-apply', canApply ? '1' : '0');

		var head = document.createElement('div');
		head.className = 'mycred-ob-addon-acc-head';

		var body = document.createElement('div');
		var title = document.createElement('p');
		title.className = 'mycred-ob-setting-title';
		title.appendChild(document.createTextNode(addon.label || addon.slug || ''));

		var badge = document.createElement('span');
		badge.className = 'mycred-ob-badge ' + (recommended ? 'mycred-ob-badge--rec' : 'mycred-ob-badge--addon');
		badge.textContent = recommended
			? t('recommended', 'Recommended')
			: t('optional', 'Optional');
		title.appendChild(document.createTextNode(' '));
		title.appendChild(badge);
		if (missingPlugin && missingPlugin.label) {
			var requires = document.createElement('span');
			requires.className = 'mycred-ob-badge mycred-ob-badge--missing';
			requires.textContent = t('requiresPlugin', 'Requires %s').replace('%s', missingPlugin.label);
			title.appendChild(document.createTextNode(' '));
			title.appendChild(requires);
		}
		body.appendChild(title);

		if (addon.reason) {
			var reason = document.createElement('p');
			reason.className = 'mycred-ob-setting-desc';
			reason.textContent = addon.reason;
			body.appendChild(reason);
		}

		var toggle = document.createElement('label');
		toggle.className = 'mycred-ob-switch mycred-ob-addon-acc-toggle';
		var input = document.createElement('input');
		input.type = 'checkbox';
		input.checked = enabled;
		var slider = document.createElement('span');
		slider.className = 'mycred-ob-slider';
		toggle.appendChild(input);
		toggle.appendChild(slider);

		head.appendChild(body);
		head.appendChild(toggle);

		var panel = document.createElement('div');
		panel.className = 'mycred-ob-addon-acc-body';

		var ranks = Array.isArray(addon.ranks) ? addon.ranks : [];
		var badgesList = Array.isArray(addon.badges) ? addon.badges : [];
		var panes = [];

		function makePane(className, items, factory) {
			if (!items.length) {
				return null;
			}
			var pane = document.createElement('div');
			pane.className = className + ' mycred-ob-addon-pane';
			items.forEach(function (item) {
				pane.appendChild(factory(item));
			});
			return pane;
		}

		var hooksPane = makePane('mycred-ob-addon-hooks', earningHooks, function (hook) {
			return createHookRow(hook, true);
		});
		if (foldChildAddonSlug(addon.slug) === 'woocommerce') {
			if (!hooksPane) {
				hooksPane = document.createElement('div');
				hooksPane.className = 'mycred-ob-addon-hooks mycred-ob-addon-pane';
			}
			hooksPane.appendChild(createProductRewardInfoRow());
		}
		var settingsPane = makePane('mycred-ob-addon-settings', otherSettings, createSettingRow);
		var checkoutPane = null;
		if (wooPaymentSettings.length || partialPaymentSettings.length || checkoutItems.length) {
			checkoutPane = document.createElement('div');
			checkoutPane.className = 'mycred-ob-addon-checkout mycred-ob-addon-pane';
			wooPaymentSettings.forEach(function (item) {
				checkoutPane.appendChild(createSettingRow(item));
			});
			partialPaymentSettings.forEach(function (item) {
				checkoutPane.appendChild(createSettingRow(item));
			});
			checkoutItems.forEach(function (item) {
				checkoutPane.appendChild(createCheckoutRow(item));
			});
		}
		var referralPane = null;
		if (referralHooks.length) {
			referralPane = document.createElement('div');
			referralPane.className = 'mycred-ob-addon-referral mycred-ob-addon-pane';
			referralHooks.forEach(function (hook) {
				referralPane.appendChild(createHookRow(hook, true));
			});
			referralSettings.forEach(function (item) {
				referralPane.appendChild(createSettingRow(item));
			});
		}
		var ranksPane = makePane('mycred-ob-addon-ranks', ranks, createRankRow);
		var badgesPane = makePane('mycred-ob-addon-badges', badgesList, createBadgeRow);
		var aboutPane = createAddonAboutPane(addon);

		if (ranksPane) {
			panes.push({
				id: 'ranks',
				label: t('addonRanks', 'Ranks & Tiers'),
				pane: ranksPane,
				note: t('ranksAiNote', 'These ranks are AI generated. You can change names and point ranges later.')
			});
		}
		if (badgesPane) {
			panes.push({
				id: 'badges',
				label: t('addonBadges', 'Badges'),
				pane: badgesPane,
				note: t('badgesAiNote', 'These badges are AI generated. You can change names later.')
			});
		}
		if (hooksPane) {
			panes.push({ id: 'hooks', label: t('earningRules', 'Earning Rules'), pane: hooksPane });
		}
		if (aboutPane && !settingsPane) {
			panes.push({ id: 'about', label: t('addonAbout', 'About'), pane: aboutPane });
		}
		if (settingsPane) {
			panes.push({ id: 'settings', label: t('addonSettings', 'Settings'), pane: settingsPane });
		}
		if (referralPane) {
			panes.push({ id: 'referral', label: t('addonProductReferral', 'Product Referral'), pane: referralPane });
		}
		if (checkoutPane) {
			panes.push({ id: 'checkout', label: t('addonCheckout', 'Checkout'), pane: checkoutPane });
		}

		if (!panes.length) {
			var empty = document.createElement('p');
			empty.className = 'mycred-ob-setting-desc';
			empty.textContent = t('addonNoDetails', 'No extra hooks or settings for this add-on.');
			panel.appendChild(empty);
		} else {
			panel.appendChild(createAddonPaneLayout(panes, {
				note: missingPlugin && missingPlugin.note ? missingPlugin.note : ''
			}));
		}

		head.addEventListener('click', function (event) {
			if (event.target.closest('.mycred-ob-switch')) {
				return;
			}
			wrap.classList.toggle('is-open');
		});
		toggle.addEventListener('click', function (event) {
			event.stopPropagation();
		});
		input.addEventListener('change', function () {
			wrap.classList.toggle('is-enabled', input.checked);
			if (input.checked) {
				wrap.classList.add('is-open');
			} else {
				wrap.classList.remove('is-open');
			}
		});

		wrap.appendChild(head);
		wrap.appendChild(panel);
		return wrap;
	}

	function sortRecommendedFirst(items) {
		return (items || []).slice().sort(function (a, b) {
			var aRec = a && (a.priority === 'recommended' || a.checked) ? 0 : 1;
			var bRec = b && (b.priority === 'recommended' || b.checked) ? 0 : 1;
			return aRec - bRec;
		});
	}

	function mergeWooCommercePlus(addons, grouped) {
		var plus = 'mycred-woocommerce-plus';
		var parent = 'woocommerce';
		grouped = grouped || { hooks: {}, settings: {}, checkout: {} };
		function moveGroup(map) {
			if (!map || !map[plus] || !map[plus].length) {
				return;
			}
			map[parent] = (map[parent] || []).concat(map[plus]);
			delete map[plus];
		}
		moveGroup(grouped.hooks);
		moveGroup(grouped.settings);
		moveGroup(grouped.checkout);

		var plusAddon = null;
		var parentAddon = null;
		var rest = [];
		(addons || []).forEach(function (addon) {
			var slug = foldChildAddonSlug(addon && addon.slug);
			if (normalizeAddonSlug(addon && addon.slug) === plus) {
				plusAddon = addon;
				return;
			}
			if (slug === parent && !parentAddon) {
				parentAddon = addon;
				return;
			}
			rest.push(addon);
		});
		if (plusAddon && !parentAddon) {
			parentAddon = {
				slug: parent,
				label: 'WooCommerce',
				description: plusAddon.description || '',
				source: 'core',
				reason: plusAddon.reason || '',
				priority: plusAddon.priority || 'recommended',
				can_apply: true,
				ranks: plusAddon.ranks || [],
				badges: plusAddon.badges || []
			};
		} else if (plusAddon && parentAddon && plusAddon.priority === 'recommended') {
			parentAddon.priority = 'recommended';
		}
		if (parentAddon) {
			rest.unshift(parentAddon);
		}
		return { addons: rest, grouped: grouped };
	}

	function renderRecommendedAddons(addons, grouped) {
		var list = document.getElementById('mycred-ob-addons-list');
		if (!list) {
			return;
		}
		grouped = grouped || { hooks: {}, settings: {}, checkout: {} };
		var merged = mergeWooCommercePlus(addons, grouped);
		addons = merged.addons;
		grouped = merged.grouped;
		addons = sortRecommendedFirst(addons);
		list.innerHTML = '';
		if (!addons || !addons.length) {
			var empty = document.createElement('p');
			empty.className = 'mycred-ob-setting-desc';
			empty.textContent = t('noAddons', 'No matching add-ons were returned. Try a more specific prompt.');
			list.appendChild(empty);
			return;
		}
		addons.forEach(function (addon) {
			var slug = foldChildAddonSlug(addon.slug);
			list.appendChild(createAddonAccordion(addon, {
				hooks: grouped.hooks[slug] || [],
				settings: grouped.settings[slug] || [],
				checkout: grouped.checkout[slug] || []
			}));
		});
	}

	function selectedPlatformKey() {
		if (mode === 'manual' && manualPlatform) {
			return manualPlatform.value || '';
		}
		if (platform) {
			return platform.value || '';
		}
		return '';
	}

	function selectedPlatformMissingNote() {
		var key = selectedPlatformKey();
		var status = key && platformStatus[key] ? platformStatus[key] : null;
		if (!status || status.active !== false || !status.label) {
			return '';
		}
		return t(
			'platformPluginMissing',
			'%s is not installed. Setup will still complete, but %s features will not appear until you install and activate it.'
		).replace(/%s/g, status.label);
	}

	function selectedPlatformLabel() {
		if (mode === 'manual') {
			var manualType = currentManualType();
			if (manualType && manualPlatform && manualPlatform.value && manualType.platforms) {
				return manualType.platforms[manualPlatform.value] || manualType.label || '';
			}
			return (manualType && manualType.label) || '';
		}
		var type = currentType();
		if (mode === 'ai' && type && platform && platform.value && type.platforms) {
			return type.platforms[platform.value] || type.label || '';
		}
		return program || (type && type.label) || '';
	}

	function createHookRow(hook, compact) {
		hook = hook || {};
		var recommended = hook.priority === 'recommended' || !!hook.checked;
		var row = document.createElement('div');
		row.className = 'mycred-ob-setting' + (compact ? ' mycred-ob-setting--compact' : '');
		if (hook.hook_id) {
			row.setAttribute('data-hook-id', hook.hook_id);
		}

		var body = document.createElement('div');
		var title = document.createElement('p');
		title.className = 'mycred-ob-setting-title';
		title.appendChild(document.createTextNode(hook.title || hook.hook_id || ''));

		var badge = document.createElement('span');
		badge.className = 'mycred-ob-badge ' + (recommended ? 'mycred-ob-badge--rec' : 'mycred-ob-badge--addon');
		badge.textContent = recommended
			? t('recommended', 'Recommended')
			: t('optional', 'Optional');
		title.appendChild(document.createTextNode(' '));
		title.appendChild(badge);
		if (itemRequiresPro(hook)) {
			appendRequiresProBadge(title);
		}
		body.appendChild(title);

		if (hook.description) {
			var desc = document.createElement('p');
			desc.className = 'mycred-ob-setting-desc';
			desc.textContent = hook.description;
			body.appendChild(desc);
		}
		if (!compact && hook.reason && hook.reason !== hook.description) {
			var reason = document.createElement('p');
			reason.className = 'mycred-ob-setting-desc';
			reason.textContent = hook.reason;
			body.appendChild(reason);
		}

		var toggle = document.createElement('label');
		toggle.className = 'mycred-ob-switch';
		var checkbox = document.createElement('input');
		checkbox.type = 'checkbox';
		checkbox.checked = recommended;
		var slider = document.createElement('span');
		slider.className = 'mycred-ob-slider';
		toggle.appendChild(checkbox);
		toggle.appendChild(slider);

		row.appendChild(body);
		if (hook.creds) {
			var line = document.createElement('div');
			line.className = 'mycred-ob-edit-line';
			var input = document.createElement('input');
			input.type = 'text';
			input.value = hook.creds;
			line.appendChild(input);
			if (compact) {
				row.appendChild(line);
			} else {
				body.appendChild(line);
			}
		}
		row.appendChild(toggle);
		markRequiresProRow(row, hook);
		return row;
	}

	function createRankRow(rank) {
		rank = rank || {};
		var row = document.createElement('div');
		row.className = 'mycred-ob-setting';
		row.setAttribute('data-rank-title', rank.title || '');
		row.setAttribute('data-rank-min', String(rank.minimum != null ? rank.minimum : ''));
		row.setAttribute('data-rank-max', String(rank.maximum != null ? rank.maximum : ''));
		if (rank.description) {
			row.setAttribute('data-rank-desc', rank.description);
		}

		var body = document.createElement('div');
		var title = document.createElement('p');
		title.className = 'mycred-ob-setting-title';
		title.appendChild(document.createTextNode(rank.title || ''));
		var badge = document.createElement('span');
		badge.className = 'mycred-ob-badge mycred-ob-badge--rec';
		badge.textContent = t('recommended', 'Recommended');
		title.appendChild(document.createTextNode(' '));
		title.appendChild(badge);
		body.appendChild(title);

		var range = document.createElement('p');
		range.className = 'mycred-ob-setting-desc';
		range.textContent = t('rankPointsRange', '%1$s – %2$s points')
			.replace('%1$s', String(rank.minimum != null ? rank.minimum : '0'))
			.replace('%2$s', String(rank.maximum != null ? rank.maximum : '0'));
		body.appendChild(range);
		if (rank.description) {
			var desc = document.createElement('p');
			desc.className = 'mycred-ob-setting-desc';
			desc.textContent = rank.description;
			body.appendChild(desc);
		}

		var toggle = document.createElement('label');
		toggle.className = 'mycred-ob-switch';
		var checkbox = document.createElement('input');
		checkbox.type = 'checkbox';
		checkbox.checked = true;
		var slider = document.createElement('span');
		slider.className = 'mycred-ob-slider';
		toggle.appendChild(checkbox);
		toggle.appendChild(slider);

		row.appendChild(body);
		row.appendChild(toggle);
		return row;
	}

	function createBadgeRow(item) {
		item = item || {};
		var row = document.createElement('div');
		row.className = 'mycred-ob-setting';
		row.setAttribute('data-badge-title', item.title || '');
		row.setAttribute('data-badge-desc', item.description || '');
		row.setAttribute('data-badge-manual', item.manual ? '1' : '0');
		row.setAttribute('data-badge-reference', item.reference || '');
		row.setAttribute('data-badge-amount', item.amount || '');
		row.setAttribute('data-badge-by', item.by || 'count');

		var body = document.createElement('div');
		var title = document.createElement('p');
		title.className = 'mycred-ob-setting-title';
		title.appendChild(document.createTextNode(item.title || ''));
		var badge = document.createElement('span');
		badge.className = 'mycred-ob-badge mycred-ob-badge--rec';
		badge.textContent = t('recommended', 'Recommended');
		title.appendChild(document.createTextNode(' '));
		title.appendChild(badge);
		body.appendChild(title);

		if (item.description) {
			var desc = document.createElement('p');
			desc.className = 'mycred-ob-setting-desc';
			desc.textContent = item.description;
			body.appendChild(desc);
		}
		if (item.manual) {
			var manual = document.createElement('p');
			manual.className = 'mycred-ob-setting-desc';
			manual.textContent = t('badgeManual', 'Awarded manually');
			body.appendChild(manual);
		}

		var toggle = document.createElement('label');
		toggle.className = 'mycred-ob-switch';
		var checkbox = document.createElement('input');
		checkbox.type = 'checkbox';
		checkbox.checked = true;
		var slider = document.createElement('span');
		slider.className = 'mycred-ob-slider';
		toggle.appendChild(checkbox);
		toggle.appendChild(slider);

		row.appendChild(body);
		row.appendChild(toggle);
		return row;
	}

	function settingNameFromKey(key) {
		var map = {
			'mwp_partial_payments.enable': 'Enable Partial Payments',
			'mwp_coupons.module_enable': 'Enable Coupons',
			'mwp_coupons.enable': 'Enable Coupon Generator',
			'mwp_my_account.enable': 'Enable My Account Tab',
			'mwp_restrict_product_pref.enable': 'Enable Product Restriction'
		};
		return map[String(key || '')] || '';
	}

	function usefulSettingDescription(text) {
		var value = String(text || '').replace(/\s+/g, ' ').trim();
		return value.length > 2 ? value : '';
	}

	function settingDisplayTitle(item) {
		var title = String((item && (item.title || item.key)) || '').trim();
		var named = settingNameFromKey(item && item.key);
		var bare = title.replace(/^[^:]{1,40}:\s*/, '').trim();
		if (named && (!bare || /^(enable|enabled)$/i.test(bare))) {
			title = named;
		}
		var group = String((item && item.group) || '').trim();
		if (!group || !title) {
			return title || group;
		}
		if (title.toLowerCase().indexOf(group.toLowerCase()) !== -1) {
			return title;
		}
		return group + ': ' + title;
	}

	function userRoleOptions() {
		var roles = (window.mycredOnboarding && window.mycredOnboarding.userRoles) ? window.mycredOnboarding.userRoles : {};
		return roles && typeof roles === 'object' ? roles : {};
	}

	function looksLikeUserRoleField(item) {
		return String((item && item.key) || '').toLowerCase() === 'bboss.excluded_profiles';
	}

	function enrichSettingOptions(item) {
		item = Object.assign({}, item || {});
		item.options = item.options && typeof item.options === 'object' ? Object.assign({}, item.options) : {};
		if (looksLikeUserRoleField(item)) {
			var roles = userRoleOptions();
			Object.keys(roles).forEach(function (key) {
				if (item.options[key] == null) {
					item.options[key] = roles[key];
				}
			});
			item.multiple = true;
			item.type = 'select';
		}
		return item;
	}

	function createSettingRow(item) {
		item = enrichSettingOptions(item || {});
		var recommended = item.priority === 'recommended' || !!item.checked;
		var row = document.createElement('div');
		row.className = 'mycred-ob-setting';
		if (item.addon) {
			row.setAttribute('data-setting-addon', item.addon);
		}
		if (item.key) {
			row.setAttribute('data-setting-key', item.key);
		}
		row.setAttribute('data-setting-type', String(item.type || 'text').toLowerCase());
		if (item.depends_on) {
			row.setAttribute('data-depends-on', item.depends_on);
			row.setAttribute('data-depends-values', (item.depends_values || []).join(','));
		}
		if (item.depends_on_hook) {
			row.setAttribute('data-depends-on-hook', item.depends_on_hook);
		}
		if (item.multiple) {
			row.setAttribute('data-setting-multiple', '1');
		}
		if (item.options && typeof item.options === 'object') {
			try {
				row.setAttribute('data-setting-options', JSON.stringify(item.options));
			} catch (err) {}
		}

		var body = document.createElement('div');
		var heading = document.createElement('p');
		heading.className = 'mycred-ob-setting-title';
		heading.appendChild(document.createTextNode(settingDisplayTitle(item)));

		if (!item.depends_on && !item.depends_on_hook) {
			var badge = document.createElement('span');
			badge.className = 'mycred-ob-badge ' + (recommended ? 'mycred-ob-badge--rec' : 'mycred-ob-badge--addon');
			badge.textContent = recommended
				? t('recommended', 'Recommended')
				: t('optional', 'Optional');
			heading.appendChild(document.createTextNode(' '));
			heading.appendChild(badge);
		}
		if (itemRequiresPro(item)) {
			appendRequiresProBadge(heading);
		}
		body.appendChild(heading);

		if (item.group && settingDisplayTitle(item).toLowerCase().indexOf(String(item.group).toLowerCase()) === -1) {
			var group = document.createElement('p');
			group.className = 'mycred-ob-setting-desc';
			group.textContent = item.group;
			body.appendChild(group);
		}
		var description = usefulSettingDescription(item.description);
		if (description) {
			var desc = document.createElement('p');
			desc.className = 'mycred-ob-setting-desc';
			desc.textContent = description;
			body.appendChild(desc);
		}
		if (item.reason) {
			var reason = document.createElement('p');
			reason.className = 'mycred-ob-setting-desc';
			reason.textContent = item.reason;
			body.appendChild(reason);
		}
		var control = createSettingControl(item);
		if (control) {
			body.appendChild(control);
		}

		row.appendChild(body);
		if (settingHasToggle(item.type)) {
			var toggle = document.createElement('label');
			toggle.className = 'mycred-ob-switch';
			var checkbox = document.createElement('input');
			checkbox.type = 'checkbox';
			checkbox.checked = recommended;
			var slider = document.createElement('span');
			slider.className = 'mycred-ob-slider';
			toggle.appendChild(checkbox);
			toggle.appendChild(slider);
			row.appendChild(toggle);
		}
		markRequiresProRow(row, item);
		return row;
	}

	function settingHasToggle(type) {
		return String(type || 'text').toLowerCase() === 'checkbox';
	}

	function createTagsControl(value, placeholder) {
		var line = document.createElement('div');
		line.className = 'mycred-ob-edit-line mycred-ob-tags';
		var list = document.createElement('div');
		list.className = 'mycred-ob-tags-list';
		var input = document.createElement('input');
		input.type = 'text';
		input.className = 'mycred-ob-tags-input';
		input.placeholder = placeholder || t('addReference', 'Type a reference and press Enter');
		var hidden = document.createElement('input');
		hidden.type = 'hidden';
		hidden.className = 'mycred-ob-tags-value';
		hidden.value = value || '';

		function tokens() {
			return String(hidden.value || '').split(',').map(function (part) {
				return part.trim();
			}).filter(Boolean);
		}

		function renderChips() {
			list.innerHTML = '';
			tokens().forEach(function (tok) {
				var chip = document.createElement('span');
				chip.className = 'mycred-ob-tag';
				chip.appendChild(document.createTextNode(tok));
				var remove = document.createElement('button');
				remove.type = 'button';
				remove.className = 'mycred-ob-tag-remove';
				remove.setAttribute('aria-label', 'Remove');
				remove.textContent = '×';
				remove.addEventListener('click', function () {
					hidden.value = tokens().filter(function (item) {
						return item !== tok;
					}).join(',');
					renderChips();
				});
				chip.appendChild(remove);
				list.appendChild(chip);
			});
		}

		function addToken(raw) {
			var tok = String(raw || '').replace(/,/g, '').trim();
			if (!tok) {
				return;
			}
			var current = tokens();
			if (current.indexOf(tok) !== -1) {
				input.value = '';
				return;
			}
			current.push(tok);
			hidden.value = current.join(',');
			input.value = '';
			renderChips();
		}

		input.addEventListener('keydown', function (event) {
			if (event.key === 'Enter' || event.key === ',') {
				event.preventDefault();
				addToken(input.value);
			}
		});
		input.addEventListener('blur', function () {
			addToken(input.value);
		});

		renderChips();
		line.appendChild(list);
		line.appendChild(input);
		line.appendChild(hidden);
		return line;
	}

	function logReferenceOptions() {
		var refs = (window.mycredOnboarding && window.mycredOnboarding.logReferences) ? window.mycredOnboarding.logReferences : {};
		return refs && typeof refs === 'object' ? refs : {};
	}

	function looksLikeReferenceField(item) {
		var key = String((item && item.key) || '').toLowerCase();
		var title = String((item && (item.title || item.label)) || '').toLowerCase();
		return /exp_references/.test(key) || /(^|\s)add reference/.test(title);
	}

	function resolveReferenceTokens(value, options) {
		var selected = String(value || '').split(/[,;\n]+/).map(function (part) {
			return part.trim();
		}).filter(Boolean);
		var labelToKey = {};
		Object.keys(options || {}).forEach(function (key) {
			labelToKey[String(options[key] || '').toLowerCase()] = key;
			labelToKey[String(key).toLowerCase()] = key;
		});
		return selected.map(function (token) {
			var lower = token.toLowerCase();
			if (options && options[token] != null) {
				return token;
			}
			if (labelToKey[lower]) {
				return labelToKey[lower];
			}
			return token.replace(/\s+/g, '_').toLowerCase();
		});
	}

	function createMultiSelectControl(options, value) {
		var selected = resolveReferenceTokens(value, options);
		var selectedMap = {};
		selected.forEach(function (key) {
			selectedMap[key] = true;
		});

		var line = document.createElement('div');
		line.className = 'mycred-ob-edit-line mycred-ob-multiselect';
		var hidden = document.createElement('input');
		hidden.type = 'hidden';
		hidden.className = 'mycred-ob-tags-value';

		var search = document.createElement('input');
		search.type = 'search';
		search.className = 'mycred-ob-multiselect-search';
		search.placeholder = t('searchReferences', 'Search references');

		var list = document.createElement('div');
		list.className = 'mycred-ob-multiselect-list';

		Object.keys(options).forEach(function (key) {
			var label = document.createElement('label');
			label.className = 'mycred-ob-multiselect-option';
			label.setAttribute('data-filter', String(options[key] || key).toLowerCase() + ' ' + String(key).toLowerCase());
			var checkbox = document.createElement('input');
			checkbox.type = 'checkbox';
			checkbox.value = key;
			checkbox.checked = !!selectedMap[key];
			var text = document.createElement('span');
			text.textContent = options[key] || key;
			label.appendChild(checkbox);
			label.appendChild(text);
			list.appendChild(label);
		});

		function syncHidden() {
			var vals = [];
			list.querySelectorAll('input[type="checkbox"]').forEach(function (box) {
				if (box.checked) {
					vals.push(box.value);
				}
			});
			hidden.value = vals.join(',');
		}

		list.addEventListener('change', syncHidden);
		search.addEventListener('input', function () {
			var query = search.value.toLowerCase();
			list.querySelectorAll('.mycred-ob-multiselect-option').forEach(function (option) {
				option.hidden = query !== '' && (option.getAttribute('data-filter') || '').indexOf(query) === -1;
			});
		});

		syncHidden();
		line.appendChild(search);
		line.appendChild(list);
		line.appendChild(hidden);
		return line;
	}

	function createSettingControl(item) {
		item = item || {};
		var type = String(item.type || 'text').toLowerCase();
		var value = item.value == null ? '' : String(item.value);
		var options = item.options && typeof item.options === 'object' ? item.options : {};
		var keys = Object.keys(options);
		var multiple = !!item.multiple || looksLikeReferenceField(item) || looksLikeUserRoleField(item);
		var line = document.createElement('div');
		line.className = 'mycred-ob-edit-line';

		if (multiple) {
			var merged = {};
			keys.forEach(function (key) {
				merged[key] = options[key];
			});
			if (looksLikeReferenceField(item)) {
				var refs = logReferenceOptions();
				Object.keys(refs).forEach(function (key) {
					if (merged[key] == null) {
						merged[key] = refs[key];
					}
				});
			}
			if (looksLikeUserRoleField(item)) {
				var roles = userRoleOptions();
				Object.keys(roles).forEach(function (key) {
					if (merged[key] == null) {
						merged[key] = roles[key];
					}
				});
			}
			if (Object.keys(merged).length) {
				return createMultiSelectControl(merged, value);
			}
			return createTagsControl(value);
		}

		if ((type === 'select' || type === 'radio') && !keys.length) {
			type = /^-?\d+(\.\d+)?$/.test(value) ? 'number' : 'text';
		}

		if (type === 'select' || type === 'radio') {
			var select = document.createElement('select');
			if (!keys.length) {
				var emptyOpt = document.createElement('option');
				emptyOpt.value = value;
				emptyOpt.textContent = value || '—';
				emptyOpt.selected = true;
				select.appendChild(emptyOpt);
			} else {
				keys.forEach(function (key) {
					var opt = document.createElement('option');
					opt.value = key;
					opt.textContent = options[key];
					if (key === value) {
						opt.selected = true;
					}
					select.appendChild(opt);
				});
				if (value && keys.indexOf(value) === -1) {
					select.value = keys[0];
				}
			}
			line.appendChild(select);
			enhanceSelect(select);
			return line;
		}

		if (type === 'checkbox') {
			return null;
		}

		if (type === 'number') {
			var number = document.createElement('input');
			number.type = 'number';
			number.value = value;
			line.appendChild(number);
			if (looksLikeExchangeRateField(item)) {
				appendExchangeRateSuffix(line);
			}
			return line;
		}

		if (type === 'textarea') {
			var area = document.createElement('textarea');
			area.rows = 3;
			area.value = value;
			line.appendChild(area);
			return line;
		}

		var input = document.createElement('input');
		input.type = 'text';
		input.value = value;
		line.appendChild(input);
		if (looksLikeExchangeRateField(item)) {
			appendExchangeRateSuffix(line);
		}
		return line;
	}

	function settingControlValue(row) {
		if ((row.getAttribute('data-setting-type') || '') === 'checkbox') {
			return '1';
		}
		var tags = row.querySelector('.mycred-ob-tags-value');
		if (tags) {
			return tags.value;
		}
		var select = row.querySelector('.mycred-ob-edit-line select');
		if (select) {
			return select.value;
		}
		var area = row.querySelector('.mycred-ob-edit-line textarea');
		if (area) {
			return area.value;
		}
		var box = row.querySelector('.mycred-ob-edit-line input[type="checkbox"]');
		if (box) {
			return box.checked ? '1' : '0';
		}
		var input = row.querySelector('.mycred-ob-edit-line input');
		return input ? input.value : '';
	}

	function parentSettingValue(row) {
		var type = row.getAttribute('data-setting-type') || '';
		if (type === 'checkbox') {
			var box = row.querySelector('.mycred-ob-switch input[type="checkbox"]');
			return box && box.checked ? '1' : '0';
		}
		return settingControlValue(row);
	}

	function findParentSettingRow(row) {
		var key = row.getAttribute('data-depends-on');
		if (!key) {
			return null;
		}
		var addon = row.getAttribute('data-setting-addon') || '';
		var scope = row.closest('.mycred-ob-addon-acc') || row.closest('.mycred-ob-section') || document;
		var match = null;
		scope.querySelectorAll('.mycred-ob-setting[data-setting-key]').forEach(function (candidate) {
			if (match || candidate === row) {
				return;
			}
			if (candidate.getAttribute('data-setting-key') !== key) {
				return;
			}
			if (foldChildAddonSlug(candidate.getAttribute('data-setting-addon') || '') !== foldChildAddonSlug(addon)) {
				return;
			}
			match = candidate;
		});
		return match;
	}

	function findParentHookRow(row) {
		var hookId = row.getAttribute('data-depends-on-hook');
		if (!hookId) {
			return null;
		}
		var scope = row.closest('.mycred-ob-addon-acc') || row.closest('.mycred-ob-section') || document;
		return scope.querySelector('.mycred-ob-setting[data-hook-id="' + hookId + '"]');
	}

	function updateDependentVisibility(row) {
		var hookParent = findParentHookRow(row);
		if (hookParent) {
			var hookBox = hookParent.querySelector('.mycred-ob-switch input[type="checkbox"]');
			row.hidden = !(hookBox && hookBox.checked);
			return;
		}
		var parent = findParentSettingRow(row);
		if (!parent) {
			row.hidden = false;
			return;
		}
		var allowed = (row.getAttribute('data-depends-values') || '').split(',').map(function (part) {
			return part.trim();
		}).filter(Boolean);
		var value = parentSettingValue(parent);
		row.hidden = allowed.length > 0 && allowed.indexOf(value) === -1;
	}

	function bindSettingDependencies() {
		var dependents = document.querySelectorAll('.mycred-ob-setting[data-depends-on], .mycred-ob-setting[data-depends-on-hook]');
		dependents.forEach(function (row) {
			var parent = findParentHookRow(row) || findParentSettingRow(row);
			updateDependentVisibility(row);
			if (!parent || parent.getAttribute('data-dep-bound') === '1') {
				return;
			}
			parent.setAttribute('data-dep-bound', '1');
			parent.addEventListener('change', function () {
				document.querySelectorAll('.mycred-ob-setting[data-depends-on], .mycred-ob-setting[data-depends-on-hook]').forEach(updateDependentVisibility);
			});
		});
	}

	function createCheckoutRow(item) {
		item = item || {};
		var type = String(item.type || 'text').toLowerCase();
		if (type === 'text' && /\b(enable|disable|enabled|disabled)\b/i.test(item.title || '')) {
			type = 'checkbox';
		}
		var recommended = item.priority === 'recommended' || !!item.checked;
		var row = document.createElement('div');
		row.className = 'mycred-ob-setting';
		if (item.id) {
			row.setAttribute('data-checkout-id', item.id);
		}
		if (item.addon) {
			row.setAttribute('data-setting-addon', item.addon);
		}
		row.setAttribute('data-setting-type', type);

		var body = document.createElement('div');
		var heading = document.createElement('p');
		heading.className = 'mycred-ob-setting-title';
		heading.appendChild(document.createTextNode(settingDisplayTitle(item)));

		var badge = document.createElement('span');
		badge.className = 'mycred-ob-badge ' + (recommended ? 'mycred-ob-badge--rec' : 'mycred-ob-badge--addon');
		badge.textContent = recommended
			? t('recommended', 'Recommended')
			: t('optional', 'Optional');
		heading.appendChild(document.createTextNode(' '));
		heading.appendChild(badge);
		if (itemRequiresPro(item)) {
			appendRequiresProBadge(heading);
		}
		body.appendChild(heading);

		if (item.description) {
			var desc = document.createElement('p');
			desc.className = 'mycred-ob-setting-desc';
			desc.textContent = item.description;
			body.appendChild(desc);
		}
		if (item.reason) {
			var reason = document.createElement('p');
			reason.className = 'mycred-ob-setting-desc';
			reason.textContent = item.reason;
			body.appendChild(reason);
		}
		var control = createSettingControl(Object.assign({}, item, { type: type }));
		if (control) {
			body.appendChild(control);
		}

		row.appendChild(body);
		if (settingHasToggle(type)) {
			var toggle = document.createElement('label');
			toggle.className = 'mycred-ob-switch';
			var checkbox = document.createElement('input');
			checkbox.type = 'checkbox';
			checkbox.checked = recommended;
			var slider = document.createElement('span');
			slider.className = 'mycred-ob-slider';
			toggle.appendChild(checkbox);
			toggle.appendChild(slider);
			row.appendChild(toggle);
		}
		markRequiresProRow(row, item);
		return row;
	}

	function addOverviewItem(list, ok, text) {
		var item = document.createElement('li');
		var mark = document.createElement('span');
		mark.className = ok ? 'mycred-ob-ok' : 'mycred-ob-warn';
		mark.textContent = ok ? '✓' : '!';
		item.appendChild(mark);
		item.appendChild(document.createTextNode(' ' + text));
		list.appendChild(item);
	}

	function renderRecommendation(data) {
		data = data || {};
		lastRecommendation = data;
		data.settings = enrichPartialPaymentSettings(data.settings || []);
		lastRecommendation.settings = data.settings;
		var point = data.point_type || {};
		var hooks = sortRecommendedFirst(data.hooks || []);
		var settings = sortRecommendedFirst((data.settings || []).filter(isVisibleSetting));
		var checkout = data.checkout || {};
		var checkoutItems = sortRecommendedFirst(checkout.items || []).filter(function (item) {
			return !isStoreCheckoutItem(item) && !checkoutCopiesVisibleSetting(item, settings);
		});
		var addons = data.addons || [];

		var understood = document.getElementById('mycred-ob-understood');
		if (understood) {
			understood.textContent = data.understood || '';
		}

		var title = document.getElementById('mycred-ob-recommend-title');
		var platformLabel = selectedPlatformLabel();
		if (title) {
			title.textContent = t('recommendedSetup', 'Recommended %s setup').replace('%s', platformLabel || '');
		}

		var sub = document.getElementById('mycred-ob-recommend-sub');
		if (sub) {
			sub.textContent = t('recommendedSub', 'Review the point type, hooks and relevant add-ons before applying them.');
		}

		var pointIntro = document.getElementById('mycred-ob-point-intro');
		if (pointIntro) {
			pointIntro.textContent = point.description || '';
		}
		var pointTitle = document.getElementById('mycred-ob-point-title');
		if (pointTitle) {
			pointTitle.textContent = point.name || '';
		}
		var pointDesc = document.getElementById('mycred-ob-point-desc');
		if (pointDesc) {
			pointDesc.textContent = point.description || '';
		}
		var pointNameInput = document.getElementById('mycred-ob-point-name');
		if (pointNameInput) {
			pointNameInput.value = point.name || '';
		}
		syncExchangeRateSuffixes();
		// var pointKeyInput = document.getElementById('mycred-ob-point-key');
		// if (pointKeyInput) {
		// 	pointKeyInput.value = point.key || '';
		// }

		var addonSlugs = addonSlugSet(addons);
		var groupedHooks = partitionByAddon(hooks, addonSlugs);
		var groupedSettings = partitionByAddon(settings, addonSlugs);
		var groupedCheckout = partitionByAddon(checkoutItems, addonSlugs);
		foldStandaloneIntoAddons({
			settings: groupedSettings,
			checkout: groupedCheckout
		}, addonSlugs);
		if (addonSlugs.woocommerce) {
			var referralStandalone = [];
			var otherStandalone = [];
			(groupedHooks.standalone || []).forEach(function (hook) {
				if (isProductReferralHook(hook)) {
					referralStandalone.push(hook);
				} else {
					otherStandalone.push(hook);
				}
			});
			if (referralStandalone.length) {
				groupedHooks.byAddon.woocommerce = (groupedHooks.byAddon.woocommerce || []).concat(referralStandalone);
			}
			groupedHooks.standalone = otherStandalone;
		}
		var standaloneHooks = (groupedHooks.standalone || []).filter(function (hook) {
			return !isProductReferralHook(hook);
		});

		var hooksSection = document.getElementById('mycred-ob-hooks-section');
		var hooksIntro = document.getElementById('mycred-ob-hooks-intro');
		if (hooksIntro) {
			hooksIntro.textContent = data.hooks_intro || '';
		}
		if (hooksSection) {
			hooksSection.hidden = standaloneHooks.length === 0;
		}
		var hooksList = document.getElementById('mycred-ob-hooks-list');
		if (hooksList) {
			hooksList.innerHTML = '';
			if (!standaloneHooks.length) {
				var emptyHooks = document.createElement('p');
				emptyHooks.className = 'mycred-ob-setting-desc';
				emptyHooks.textContent = t('noHooks', 'No matching hooks were returned. Try a more specific prompt.');
				hooksList.appendChild(emptyHooks);
			} else {
				standaloneHooks.forEach(function (hook) {
					hooksList.appendChild(createHookRow(hook, true));
				});
			}
		}

		var checkoutExampleCard = document.getElementById('mycred-ob-checkout-example-card');
		var checkoutExample = document.getElementById('mycred-ob-checkout-example');
		if (checkoutExampleCard) {
			checkoutExampleCard.hidden = !checkout.example;
		}
		if (checkoutExample) {
			checkoutExample.textContent = checkout.example || '';
		}

		renderRecommendedAddons(addons, {
			hooks: groupedHooks.byAddon,
			settings: groupedSettings.byAddon,
			checkout: groupedCheckout.byAddon
		});
		bindSettingDependencies();

		var why = document.getElementById('mycred-ob-why-text');
		if (why) {
			why.textContent = data.why || '';
		}

		var overview = document.getElementById('mycred-ob-overview-list');
		if (overview) {
			overview.innerHTML = '';
			var platformMissing = selectedPlatformMissingNote();
			if (platformMissing) {
				addOverviewItem(overview, false, platformMissing);
			}
			if (data.overview && data.overview.length) {
				data.overview.forEach(function (item) {
					addOverviewItem(overview, true, item);
				});
			} else {
				if (platformLabel) {
					addOverviewItem(overview, true, t('platformSelected', '%s selected').replace('%s', platformLabel));
				}
				if (point.name) {
					addOverviewItem(overview, true, point.name);
				}
				var selectedOverview = collectSelectedSetup();
				addOverviewItem(overview, true, t('hooksSelected', '%s earning hooks selected').replace('%s', String(selectedOverview.hooks.length)));
				if (selectedOverview.settings.length) {
					addOverviewItem(overview, true, t('settingsSuggested', '%s add-on settings suggested').replace('%s', String(selectedOverview.settings.length)));
				}
				if (selectedOverview.addons.length) {
					addOverviewItem(overview, true, t('addonsSuggested', '%s add-ons recommended').replace('%s', String(selectedOverview.addons.length)));
				}
			}
		}

		var minis = document.getElementById('mycred-ob-mini-cards');
		if (minis) {
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
			var selectedMinis = collectSelectedSetup();
			if (point.name) {
				addMini(t('pointTypeProposed', '1 point type proposed'), point.name);
				var pointCard = minis.lastElementChild;
				if (pointCard) {
					pointCard.setAttribute('data-point-name', '1');
				}
			}
			addMini(t('hooksSelected', '%s earning hooks selected').replace('%s', String(selectedMinis.hooks.length)), '');
			// if (selectedMinis.settings.length) {
			// 	addMini(t('settingsSuggested', '%s add-on settings suggested').replace('%s', String(selectedMinis.settings.length)), '');
			// }
			if (selectedMinis.checkout.length) {
				addMini(t('checkoutSuggested', '%s checkout settings suggested').replace('%s', String(selectedMinis.checkout.length)), '');
			}
			if (selectedMinis.addons.length) {
				addMini(t('addonsSuggested', '%s add-ons recommended').replace('%s', String(selectedMinis.addons.length)), '');
			}
		}
	}

	function applyRecommendation(data) {
		renderRecommendation(data || {});
		if (data && data.quota) {
			paintQuota(data.quota);
		}
	}

	function loadStepItems() {
		return loadSteps ? Array.prototype.slice.call(loadSteps.querySelectorAll('li')) : [];
	}

	function paintLoadSteps(activeIndex) {
		loadStepItems().forEach(function (item, index) {
			item.classList.toggle('is-done', index < activeIndex);
			item.classList.toggle('is-active', index === activeIndex);
		});
	}

	function stopLoadSteps() {
		if (loadStepsTimer) {
			clearInterval(loadStepsTimer);
			loadStepsTimer = null;
		}
	}

	function resetLoadSteps() {
		stopLoadSteps();
		loadStepIndex = 0;
		loadStepItems().forEach(function (item) {
			item.classList.remove('is-active', 'is-done');
		});
	}

	function startLoadSteps() {
		resetLoadSteps();
		paintLoadSteps(0);
		loadStepsTimer = setInterval(function () {
			var items = loadStepItems();
			if (!items.length || loadStepIndex >= items.length - 1) {
				return;
			}
			loadStepIndex += 1;
			paintLoadSteps(loadStepIndex);
		}, 1600);
	}

	function finishLoadSteps(success, done) {
		stopLoadSteps();
		if (!success) {
			resetLoadSteps();
			done();
			return;
		}

		var items = loadStepItems();
		function markNext() {
			if (loadStepIndex < items.length) {
				loadStepIndex += 1;
				paintLoadSteps(Math.min(loadStepIndex, items.length - 1));
				if (loadStepIndex < items.length) {
					window.setTimeout(markNext, 160);
					return;
				}
			}
			items.forEach(function (item) {
				item.classList.remove('is-active');
				item.classList.add('is-done');
			});
			window.setTimeout(done, 220);
		}

		markNext();
	}

	function setGenerating(on) {
		generating = !!on;
		syncPrivacyNote();
		if (promptScreen) {
			promptScreen.classList.toggle('is-generating', generating);
		}
		if (loading) {
			loading.classList.toggle('is-visible', generating);
		}
		if (backBtn) {
			backBtn.disabled = generating;
		}
		if (generating) {
			startLoadSteps();
			return;
		}
		stopLoadSteps();
	}

	function finishGenerate(success) {
		setGenerating(false);
		resetLoadSteps();
		nextBtn.disabled = !success && screen === 3 ? !aiFieldsReady() : false;
		if (!success && screen === 3) {
			updateState();
		}
	}

	function prepareAI() {
		var ajaxUrl = window.mycredOnboarding && window.mycredOnboarding.ajaxUrl;
		var nonce = window.mycredOnboarding && window.mycredOnboarding.recommendNonce;
		hideRecommendError();

		if (!ajaxUrl || !nonce) {
			showRecommendError(t('recommendConfigError', 'Could not load AI setup. Refresh the page and try again.'));
			return;
		}
		if (!aiFieldsReady()) {
			showRecommendError(t('recommendFieldsError', 'Please select a website type, platform, and primary goal.'));
			return;
		}

		var extraPrompt = clipPrompt();

		setGenerating(true);
		nextBtn.disabled = true;

		var body = new FormData();
		body.append('action', 'mycred_ai_onboarding_recommend');
		body.append('nonce', nonce);
		body.append('site_type', siteType.value);
		body.append('platform', platform.value);
		body.append('goal', goal.value);
		body.append('prompt', extraPrompt);

		fetch(ajaxUrl, {
			method: 'POST',
			body: body,
			credentials: 'same-origin'
		})
			.then(function (response) {
				return response.text().then(function (text) {
					var json = null;
					try {
						json = JSON.parse(text);
					} catch (e) {
						json = null;
					}
					return { ok: response.ok, json: json };
				});
			})
			.then(function (result) {
				if (!generating) {
					return;
				}
				var json = result.json;
				if (!json) {
					showRecommendError(t('recommendTimeout', 'The AI request timed out or returned an invalid response. Please try again.'));
					finishGenerate(false);
					return;
				}
				if (!json.success) {
					var message = t('recommendError', 'Could not generate add-on recommendations. Please try again.');
					if (typeof json.data === 'string' && json.data) {
						message = json.data;
					} else if (json.data && json.data.message) {
						message = json.data.message;
					}
					if (json.data && json.data.quota) {
						paintQuota(json.data.quota);
					}
					showRecommendError(message, !!(json.data && json.data.is_html));
					finishGenerate(false);
					return;
				}
				applyRecommendation(json.data || {});
				finishLoadSteps(true, function () {
					if (!generating) {
						return;
					}
					finishGenerate(true);
					show(4);
				});
			})
			.catch(function () {
				if (!generating) {
					return;
				}
				showRecommendError(t('recommendTimeout', 'The AI request timed out or returned an invalid response. Please try again.'));
				finishGenerate(false);
			});
	}

	function hideNotice(id) {
		var notice = document.getElementById(id);
		if (!notice) {
			return;
		}
		notice.hidden = true;
		notice.textContent = '';
	}

	function showNotice(id, message, fallback) {
		var notice = document.getElementById(id);
		if (!notice) {
			window.alert(message || fallback);
			return;
		}
		notice.textContent = message || fallback;
		notice.hidden = false;
	}

	function prepareManual() {
		var ajaxUrl = window.mycredOnboarding && window.mycredOnboarding.ajaxUrl;
		var nonce = window.mycredOnboarding && window.mycredOnboarding.manualNonce;
		hideNotice('mycred-ob-manual-error');

		if (!ajaxUrl || !nonce) {
			showNotice('mycred-ob-manual-error', t('recommendConfigError', 'Could not load AI setup. Refresh the page and try again.'), '');
			return;
		}
		if (!manualFieldsReady()) {
			showNotice('mycred-ob-manual-error', t('manualFieldsError', 'Please select a website type, platform, and primary goal.'), '');
			return;
		}

		nextBtn.disabled = true;

		var body = new FormData();
		body.append('action', 'mycred_ai_onboarding_manual');
		body.append('nonce', nonce);
		body.append('site_type', manualSiteType.value);
		body.append('platform', manualPlatform.value);
		body.append('goal', manualGoal.value);

		fetch(ajaxUrl, {
			method: 'POST',
			body: body,
			credentials: 'same-origin'
		})
			.then(function (response) {
				return response.json();
			})
			.then(function (json) {
				if (!json || !json.success) {
					var message = t('recommendError', 'Could not generate add-on recommendations. Please try again.');
					if (json && typeof json.data === 'string' && json.data) {
						message = json.data;
					} else if (json && json.data && json.data.message) {
						message = json.data.message;
					}
					showNotice('mycred-ob-manual-error', message, '');
					nextBtn.disabled = false;
					updateState();
					return;
				}
				setModeUi();
				applyRecommendation(json.data || {});
				show(4);
			})
			.catch(function () {
				showNotice('mycred-ob-manual-error', t('recommendTimeout', 'The AI request timed out or returned an invalid response. Please try again.'), '');
				nextBtn.disabled = false;
				updateState();
			});
	}

	function appendCheckedHooks(root, hooks) {
		if (!root) {
			return;
		}
		root.querySelectorAll('.mycred-ob-setting[data-hook-id]').forEach(function (row) {
			var input = row.querySelector('.mycred-ob-switch input[type="checkbox"]');
			if (!input || !input.checked) {
				return;
			}
			var credsInput = row.querySelector('.mycred-ob-edit-line input');
			var titleEl = row.querySelector('.mycred-ob-setting-title');
			hooks.push({
				hook_id: row.getAttribute('data-hook-id'),
				creds: credsInput ? credsInput.value : '',
				title: titleEl ? titleEl.childNodes[0] && titleEl.childNodes[0].textContent : ''
			});
		});
	}

	function appendIncludedValueRows(root, into) {
		if (!root) {
			return;
		}
		root.querySelectorAll('.mycred-ob-setting').forEach(function (row) {
			if (row.hidden || row.getAttribute('data-hook-id') || !row.getAttribute('data-setting-key')) {
				return;
			}
			var include = row.querySelector('.mycred-ob-switch input[type="checkbox"]');
			if (include && !include.checked) {
				return;
			}
			var titleEl = row.querySelector('.mycred-ob-setting-title');
			var options = {};
			try {
				options = JSON.parse(row.getAttribute('data-setting-options') || '{}') || {};
			} catch (err) {
				options = {};
			}
			var value = settingControlValue(row);
			if (options && typeof options === 'object') {
				var keys = Object.keys(options);
				if (keys.length) {
					var mapped = String(value || '').split(',').map(function (part) {
						var token = part.trim();
						if (!token) {
							return '';
						}
						if (options[token] != null) {
							return token;
						}
						var lower = token.toLowerCase();
						var hit = '';
						keys.forEach(function (key) {
							if (hit) {
								return;
							}
							if (String(key).toLowerCase() === lower || String(options[key] || '').toLowerCase() === lower) {
								hit = key;
							}
						});
						return hit || token;
					}).filter(Boolean);
					value = mapped.join(',');
				}
			}
			into.push({
				addon: row.getAttribute('data-setting-addon') || '',
				key: row.getAttribute('data-setting-key') || '',
				title: titleEl ? titleEl.childNodes[0] && titleEl.childNodes[0].textContent : '',
				value: value,
				options: options
			});
		});
	}

	function collectSelectedSetup() {
		var addons = [];
		var addonRows = [];
		document.querySelectorAll('#mycred-ob-addons-list .mycred-ob-addon-acc[data-addon-slug]').forEach(function (acc) {
			var input = acc.querySelector('.mycred-ob-addon-acc-head input[type="checkbox"]');
			if (!input || !input.checked || !acc.getAttribute('data-addon-slug')) {
				return;
			}
			addons.push(acc.getAttribute('data-addon-slug'));
			var titleEl = acc.querySelector('.mycred-ob-addon-acc-head .mycred-ob-setting-title');
			var reasonEl = acc.querySelector('.mycred-ob-addon-acc-head .mycred-ob-setting-desc');
			addonRows.push({
				slug: acc.getAttribute('data-addon-slug'),
				label: titleEl ? titleEl.childNodes[0] && titleEl.childNodes[0].textContent : acc.getAttribute('data-addon-slug'),
				reason: reasonEl ? reasonEl.textContent : ''
			});
		});
		var hooks = [];
		appendCheckedHooks(document.getElementById('mycred-ob-hooks-list'), hooks);
		var settings = [];
		appendIncludedValueRows(document.getElementById('mycred-ob-settings-list'), settings);
		var checkout = [];
		appendIncludedValueRows(document.getElementById('mycred-ob-checkout-list'), checkout);
		document.querySelectorAll('#mycred-ob-addons-list .mycred-ob-addon-acc.is-enabled').forEach(function (acc) {
			appendCheckedHooks(acc.querySelector('.mycred-ob-addon-hooks'), hooks);
			appendCheckedHooks(acc.querySelector('.mycred-ob-addon-referral'), hooks);
			appendIncludedValueRows(acc.querySelector('.mycred-ob-addon-settings'), settings);
			appendIncludedValueRows(acc.querySelector('.mycred-ob-addon-referral'), settings);
			appendIncludedValueRows(acc.querySelector('.mycred-ob-addon-checkout'), settings);
		});
		(lastRecommendation.settings || []).forEach(function (item) {
			var ui = settingUi(item);
			if (ui === 'show') {
				return;
			}
			if (HIDDEN_SKIP_SETTING_KEYS[String(item.key || '').toLowerCase()]) {
				return;
			}
			if (isPartialPaymentSettingKey(item.key) && !setupHasPartialPaymentsEnabled(settings)) {
				return;
			}
			if (isWooPaymentSetting(item) && !setupHasWooPaymentsEnabled(settings)) {
				return;
			}
			if (isProductReferralSettingKey(item.key) && !setupHasProductReferralHook(hooks)) {
				return;
			}
			var slug = foldChildAddonSlug(item.addon || '');
			var isCoreHidden = slug === 'mycred';
			if (!isCoreHidden && (!slug || addons.indexOf(slug) === -1)) {
				return;
			}
			var already = settings.some(function (row) {
				return foldChildAddonSlug(row.addon || '') === slug && String(row.key || '') === String(item.key || '');
			});
			if (already) {
				return;
			}
			var value = item.value;
			if (ui === 'addon_toggle') {
				value = '1';
			}
			if (String(item.type || '').toLowerCase() === 'checkbox' && (value === true || value === 'true' || value === '')) {
				value = '1';
			}
			if (String(item.key || '') === 'level_cred.based') {
				value = 'rank';
			}
			settings.push({
				addon: slug,
				key: item.key,
				title: item.title || item.key,
				value: value,
				options: item.options || {}
			});
		});
		appendPartialPaymentAutoSettings(settings);
		appendWooPaymentAutoSettings(settings);
		appendProductReferralAutoSettings(settings, hooks);
		appendProductRewardAutoSettings(settings, addons);
		Object.keys(HIDDEN_DEFAULT_POINT_TYPE_KEYS).forEach(function (key) {
			var slug = HIDDEN_DEFAULT_POINT_TYPE_KEYS[key];
			if (addons.indexOf(slug) === -1) {
				return;
			}
			var found = false;
			settings.forEach(function (row) {
				if (String((row && row.key) || '') === key) {
					row.value = 'mycred_default';
					found = true;
				}
			});
			if (!found) {
				settings.push({
					addon: slug,
					key: key,
					title: key,
					value: 'mycred_default',
					options: {}
				});
			}
		});
		[
			{ key: 'dashboard.dashboard_enable', title: 'Enable Dashboard', value: '1' },
			{ key: 'dashboard.enable_user_filter', title: 'Enable User Filter', value: '1' },
			{ key: 'dashboard.dashboard_default_point', title: 'Select Default Point Type', value: 'mycred_default' }
		].forEach(function (item) {
			var already = settings.some(function (row) {
				return String(row.key || '') === item.key;
			});
			if (already) {
				return;
			}
			settings.push({
				addon: 'mycred',
				key: item.key,
				title: item.title,
				value: item.value,
				options: {}
			});
		});
		if (addons.indexOf('mycred-level-cred') !== -1) {
			var hasEnable = settings.some(function (row) {
				return String(row.key || '') === 'level_cred.enable';
			});
			if (!hasEnable) {
				settings.push({
					addon: 'mycred-level-cred',
					key: 'level_cred.enable',
					title: 'Enable Multilevel points assignment functionality',
					value: '1',
					options: {}
				});
			}
			var hasBased = settings.some(function (row) {
				return String(row.key || '') === 'level_cred.based';
			});
			if (!hasBased) {
				settings.push({
					addon: 'mycred-level-cred',
					key: 'level_cred.based',
					title: 'Select Reference For Rewarding Points on Multiple Levels',
					value: 'rank',
					options: {}
				});
			}
		}
		var ranks = [];
		document.querySelectorAll('#mycred-ob-addons-list .mycred-ob-addon-acc.is-enabled .mycred-ob-addon-ranks .mycred-ob-setting[data-rank-title]').forEach(function (row) {
			var input = row.querySelector('.mycred-ob-switch input[type="checkbox"]');
			if (!input || !input.checked) {
				return;
			}
			ranks.push({
				title: row.getAttribute('data-rank-title') || '',
				minimum: row.getAttribute('data-rank-min') || '0',
				maximum: row.getAttribute('data-rank-max') || '0',
				description: row.getAttribute('data-rank-desc') || ''
			});
		});
		var badges = [];
		document.querySelectorAll('#mycred-ob-addons-list .mycred-ob-addon-acc.is-enabled .mycred-ob-addon-badges .mycred-ob-setting[data-badge-title]').forEach(function (row) {
			var input = row.querySelector('.mycred-ob-switch input[type="checkbox"]');
			if (!input || !input.checked) {
				return;
			}
			badges.push({
				title: row.getAttribute('data-badge-title') || '',
				description: row.getAttribute('data-badge-desc') || '',
				manual: row.getAttribute('data-badge-manual') === '1',
				reference: row.getAttribute('data-badge-reference') || '',
				amount: row.getAttribute('data-badge-amount') || '',
				by: row.getAttribute('data-badge-by') || 'count'
			});
		});
		var pointNameInput = document.getElementById('mycred-ob-point-name');
		// var pointKeyInput = document.getElementById('mycred-ob-point-key');
		return {
			addons: addons,
			hooks: hooks,
			settings: settings,
			checkout: checkout,
			ranks: ranks,
			badges: badges,
			addonRows: addonRows,
			pointName: pointNameInput ? pointNameInput.value : '',
			// pointKey: pointKeyInput ? pointKeyInput.value : ''
		};
	}

	function applySelectedSetup() {
		var ajaxUrl = window.mycredOnboarding && window.mycredOnboarding.ajaxUrl;
		var nonce = window.mycredOnboarding && window.mycredOnboarding.applyNonce;
		hideNotice('mycred-ob-apply-error');

		if (!ajaxUrl || !nonce) {
			show(5);
			return;
		}

		applying = true;
		nextBtn.disabled = true;
		nextBtn.textContent = t('applying', 'Applying selected settings…');

		var selected = collectSelectedSetup();
		var body = new FormData();
		body.append('action', 'mycred_ai_onboarding_apply');
		body.append('nonce', nonce);
		body.append('addons', JSON.stringify(selected.addons));
		body.append('hooks', JSON.stringify(selected.hooks));
		body.append('settings', JSON.stringify(selected.settings));
		body.append('checkout', JSON.stringify(selected.checkout));
		body.append('ranks', JSON.stringify(selected.ranks));
		body.append('badges', JSON.stringify(selected.badges));
		body.append('point_name', selected.pointName);
		body.append('point_key', selected.pointKey);

		fetch(ajaxUrl, {
			method: 'POST',
			body: body,
			credentials: 'same-origin'
		})
			.then(function (response) {
				return response.json();
			})
			.then(function (json) {
				applying = false;
				if (!json || !json.success) {
					var message = t('applyError', 'Could not apply the selected settings. Please try again.');
					if (json && json.data && json.data.message) {
						message = json.data.message;
					}
					showNotice('mycred-ob-apply-error', message, '');
					updateState();
					return;
				}
				var completeCopy = document.getElementById('mycred-ob-complete-copy');
				if (completeCopy) {
					completeCopy.textContent = t('manualComplete', 'Selected add-ons and hooks have been enabled. You can fine-tune amounts on the Hooks screen.');
				}
				show(5);
			})
			.catch(function () {
				applying = false;
				showNotice('mycred-ob-apply-error', t('applyError', 'Could not apply the selected settings. Please try again.'), '');
				updateState();
			});
	}

	function leaveOnboarding(url) {
		if (url) {
			window.location.href = url;
		}
	}

	function completeThenLeave(url, options) {
		options = options || {};
		var enableAddons = options.enableAddons ? '1' : '0';
		var markComplete = options.markComplete === false ? '0' : '1';
		var ajaxUrl = window.mycredOnboarding && window.mycredOnboarding.ajaxUrl;
		var nonce = window.mycredOnboarding && window.mycredOnboarding.completeNonce;
		if (!ajaxUrl || !nonce) {
			leaveOnboarding(url);
			return;
		}

		var body = new FormData();
		body.append('action', 'mycred_complete_tour_guide');
		body.append('nonce', nonce);
		body.append('enable_addons', enableAddons);
		body.append('mark_complete', markComplete);

		fetch(ajaxUrl, {
			method: 'POST',
			body: body,
			credentials: 'same-origin'
		}).finally(function () {
			leaveOnboarding(url);
		});
	}

	function dashboardUrl() {
		return (window.mycredOnboarding && window.mycredOnboarding.dashboardUrl) ? window.mycredOnboarding.dashboardUrl : '';
	}

	function tourUrl() {
		return (window.mycredOnboarding && window.mycredOnboarding.manualSetupUrl) ? window.mycredOnboarding.manualSetupUrl : '';
	}

	nextBtn.addEventListener('click', function () {
		if (applying) {
			return;
		}
		if (screen === 1) {
			if (mode === 'manual') {
				show(2);
				return;
			}
			show(3);
			return;
		}

		if (screen === 2) {
			prepareManual();
			return;
		}

		if (screen === 3) {
			prepareAI();
			return;
		}

		if (screen === 4) {
			applySelectedSetup();
			return;
		}

		completeThenLeave(dashboardUrl(), { enableAddons: false, markComplete: true });
	});

	backBtn.addEventListener('click', function () {
		if (applying) {
			return;
		}
		if (generating) {
			finishGenerate(false);
		}
		if (screen === 2 || screen === 3) {
			show(1);
			return;
		}
		if (screen === 4) {
			setModeUi();
			show(mode === 'manual' ? 2 : 3);
		}
	});

	skipBtn.addEventListener('click', function () {
		completeThenLeave(tourUrl(), { enableAddons: true, markComplete: true });
	});

	var regenerateBtn = document.getElementById('mycred-ob-regenerate');
	if (regenerateBtn) {
		regenerateBtn.addEventListener('click', function () {
			var aiAnswer = document.getElementById('mycred-ob-ai-answer');
			if (aiAnswer) {
				aiAnswer.style.display = '';
			}
			show(3);
		});
	}

	initSiteFields();
	initManualSiteFields();
	nextBtn.hidden = true;
	if (footer) {
		footer.hidden = true;
	}
	if (stepper) {
		stepper.hidden = true;
	}
	updateState();
});
