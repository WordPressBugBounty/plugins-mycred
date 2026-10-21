const fs = require('fs');
const path = 'c:/Users/user/Local Sites/mycred-react/app/public/wp-content/plugins/mycred/src/pages/Hooks/hooks-pointics-mockup.html';
let text = fs.readFileSync(path, 'utf8');

const newScript = `  <script>
    (function () {
      var pills = document.querySelectorAll(".screen-pill");
      var panels = document.querySelectorAll("[data-screen-panel]");
      var configureTitle = document.getElementById("configure-hook-title");
      var configureDesc = document.getElementById("configure-hook-desc");
      var prefsBody = document.getElementById("hook-prefs-body");
      var listEmpty = document.getElementById("list-empty");
      var listFilled = document.getElementById("list-filled");
      var listCounts = document.getElementById("list-counts");
      var btnEmpty = document.getElementById("btn-empty-mode");
      var btnFilled = document.getElementById("btn-filled-mode");

      function simplePrefs(points, log, tags) {
        tags = tags || '<a href="#">General</a>, <a href="#">User Related</a>';
        return '' +
          '<div class="prefs-row">' +
            '<div class="field">' +
              '<label for="pref-points">Points</label>' +
              '<input id="pref-points" type="text" value="' + points + '" inputmode="decimal" />' +
            '</div>' +
            '<div class="field">' +
              '<label for="pref-log">Log Template</label>' +
              '<input id="pref-log" type="text" value="' + log.replace(/"/g, '&quot;') + '" />' +
              '<p class="field-hint">Available Template Tags: ' + tags + '</p>' +
            '</div>' +
          '</div>';
      }

      function limitField(id, value) {
        return '' +
          '<div class="field" style="margin-top:16px;">' +
            '<label for="' + id + '">Limit</label>' +
            '<div class="limit-row">' +
              '<input id="' + id + '" type="text" value="' + value + '" />' +
              '<select aria-label="Limit period">' +
                '<option value="x" selected>No limit</option>' +
                '<option value="/d">Per Day</option>' +
                '<option value="/w">Per Week</option>' +
                '<option value="/m">Per Month</option>' +
              '</select>' +
            '</div>' +
          '</div>';
      }

      function commentBlock(title, pointsId, points, logId, log) {
        return '' +
          '<div class="prefs-block">' +
            '<h4 class="prefs-block-title">' + title + '</h4>' +
            '<div class="prefs-row">' +
              '<div class="field">' +
                '<label for="' + pointsId + '">Points</label>' +
                '<input id="' + pointsId + '" type="text" value="' + points + '" inputmode="decimal" />' +
              '</div>' +
              '<div class="field">' +
                '<label for="' + logId + '">Log Template</label>' +
                '<input id="' + logId + '" type="text" value="' + log.replace(/"/g, '&quot;') + '" />' +
                '<p class="field-hint">Available Template Tags: <a href="#">General</a>, <a href="#">Comment</a></p>' +
              '</div>' +
            '</div>' +
          '</div>';
      }

      var HOOK_PRESETS = {
        'Points for registrations': {
          title: 'Points for registrations',
          desc: 'Award points for users joining your website.',
          html: function () {
            return simplePrefs('10', '%plural% for becoming a member');
          }
        },
        'Create an account': {
          title: 'Points for registrations',
          desc: 'Award points for users joining your website.',
          html: function () {
            return simplePrefs('10', '%plural% for becoming a member');
          }
        },
        'Points for daily visits': {
          title: 'Points for daily visits',
          desc: 'Award points to members for visiting your website daily.',
          html: function () {
            return simplePrefs('1', '%plural% for daily visit') + limitField('pref-limit', '1');
          }
        },
        'Daily visits': {
          title: 'Points for daily visits',
          desc: 'Award points to members for visiting your website daily.',
          html: function () {
            return simplePrefs('1', '%plural% for daily visit');
          }
        },
        'Points for logins': {
          title: 'Points for logins',
          desc: 'Award points every time a member logs in to your website.',
          html: function () {
            return simplePrefs('1', '%plural% for logging in') +
              '<div class="field" style="margin-top:16px;">' +
                '<label for="pref-limit">Limit</label>' +
                '<div class="limit-row">' +
                  '<input id="pref-limit" type="text" value="1" />' +
                  '<select aria-label="Limit period">' +
                    '<option value="/d" selected>Per Day</option>' +
                    '<option value="/w">Per Week</option>' +
                    '<option value="/m">Per Month</option>' +
                    '<option value="x">No limit</option>' +
                  '</select>' +
                '</div>' +
              '</div>';
          }
        },
        'Logins': {
          title: 'Points for logins',
          desc: 'Award points every time a member logs in to your website.',
          html: function () {
            return HOOK_PRESETS['Points for logins'].html();
          }
        },
        'Points for comments': {
          title: 'Points for comments',
          desc: 'Award or deduct points based on comment status.',
          html: function () {
            return commentBlock('Approved Comments', 'pref-approved-points', '1', 'pref-approved-log', '%plural% for Approved Comment') +
              commentBlock('Spam Comments', 'pref-spam-points', '-5', 'pref-spam-log', '%plural% deduction for Comment marked as SPAM') +
              commentBlock('Trashed Comments', 'pref-trash-points', '-1', 'pref-trash-log', '%plural% deduction for deleted / unapproved Comment') +
              '<div class="prefs-block">' +
                '<h4 class="prefs-block-title">Limits</h4>' +
                '<div class="prefs-row">' +
                  '<div class="field">' +
                    '<label for="pref-per-post">Per Post</label>' +
                    '<input id="pref-per-post" type="text" value="0" />' +
                    '<p class="field-hint">Use zero for unlimited.</p>' +
                  '</div>' +
                  '<div class="field">' +
                    '<label for="pref-per-day">Per Day</label>' +
                    '<input id="pref-per-day" type="text" value="0" />' +
                    '<p class="field-hint">Use zero for unlimited.</p>' +
                  '</div>' +
                '</div>' +
              '</div>';
          }
        },
        'Comments': {
          title: 'Points for comments',
          desc: 'Award or deduct points based on comment status.',
          html: function () {
            return HOOK_PRESETS['Points for comments'].html();
          }
        },
        'Publishing content': {
          title: 'Points for publishing content',
          desc: 'Award points for publishing content on your website.',
          html: function () {
            return simplePrefs('10', '%plural% for new Post published', '<a href="#">General</a>, <a href="#">Post Related</a>') +
              '<div class="field" style="margin-top:16px;">' +
                '<label for="pref-limit">Limit</label>' +
                '<div class="limit-row">' +
                  '<input id="pref-limit" type="text" value="0" />' +
                  '<select aria-label="Limit period">' +
                    '<option value="x" selected>No limit</option>' +
                    '<option value="/d">Per Day</option>' +
                    '<option value="/w">Per Week</option>' +
                    '<option value="/m">Per Month</option>' +
                  '</select>' +
                '</div>' +
              '</div>';
          }
        },
        'Place a paid order': {
          title: 'Points for paid WooCommerce orders',
          desc: 'Award points when a customer completes a paid order.',
          html: function () {
            return simplePrefs('10', '%plural% for store purchase', '<a href="#">General</a>, <a href="#">WooCommerce</a>') +
              '<div class="field" style="margin-top:16px;">' +
                '<label for="pref-exchange">Exchange Rate</label>' +
                '<input id="pref-exchange" type="text" value="100" />' +
                '<p class="field-hint">Points awarded per 100 currency units spent. Set 0 to use fixed points above.</p>' +
              '</div>';
          }
        },
        'Write a product review': {
          title: 'Points for product reviews',
          desc: 'Award points for writing a product review.',
          html: function () {
            return simplePrefs('5', '%plural% for product review', '<a href="#">General</a>, <a href="#">WooCommerce</a>');
          }
        },
        'Register at checkout': {
          title: 'Points for checkout registration',
          desc: 'Award points when a guest registers during checkout.',
          html: function () {
            return simplePrefs('10', '%plural% for registering at checkout');
          }
        },
        'New activity update': {
          title: 'Points for BuddyPress activity',
          desc: 'Award points when a member posts an activity update.',
          html: function () {
            return simplePrefs('1', '%plural% for new activity') +
              '<div class="field" style="margin-top:16px;">' +
                '<label for="pref-limit">Limit</label>' +
                '<div class="limit-row">' +
                  '<input id="pref-limit" type="text" value="10" />' +
                  '<select aria-label="Limit period">' +
                    '<option value="/d" selected>Per Day</option>' +
                    '<option value="/w">Per Week</option>' +
                    '<option value="x">No limit</option>' +
                  '</select>' +
                '</div>' +
              '</div>';
          }
        },
        'Profile update': {
          title: 'Points for profile updates',
          desc: 'Award points when a member updates their profile.',
          html: function () {
            return simplePrefs('5', '%plural% for updating profile');
          }
        },
        'Referral signup': {
          title: 'Points for referral signups',
          desc: 'Award points when a referred user creates an account.',
          html: function () {
            return simplePrefs('25', '%plural% for referring a new member', '<a href="#">General</a>, <a href="#">User Related</a>');
          }
        },
        'Referral purchase': {
          title: 'Points for referral purchases',
          desc: 'Award points when a referred user makes a purchase.',
          html: function () {
            return simplePrefs('50', '%plural% for referred purchase', '<a href="#">General</a>, <a href="#">WooCommerce</a>');
          }
        }
      };

      var DEFAULT_PRESET = {
        title: 'Points for registrations',
        desc: 'Award points for users joining your website.',
        html: function () {
          return simplePrefs('10', '%plural% for becoming a member');
        }
      };

      function showScreen(id) {
        panels.forEach(function (panel) {
          panel.classList.toggle("is-active", panel.getAttribute("data-screen-panel") === id);
        });
        pills.forEach(function (pill) {
          pill.classList.toggle("is-active", pill.getAttribute("data-screen") === id);
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
      }

      function seedConfigure(hookKey, desc) {
        var preset = HOOK_PRESETS[hookKey] || DEFAULT_PRESET;
        var title = preset.title || hookKey;
        var description = preset.desc || desc || DEFAULT_PRESET.desc;
        if (configureTitle) configureTitle.textContent = title;
        if (configureDesc) configureDesc.textContent = description;
        if (prefsBody) prefsBody.innerHTML = preset.html();
      }

      pills.forEach(function (pill) {
        pill.addEventListener("click", function () {
          showScreen(pill.getAttribute("data-screen"));
        });
      });

      document.querySelectorAll("[data-go]").forEach(function (el) {
        el.addEventListener("click", function () {
          var target = el.getAttribute("data-go");
          var hook = el.getAttribute("data-hook");
          var desc = el.getAttribute("data-desc");
          if (target === "configure") {
            seedConfigure(hook || "Points for registrations", desc);
          }
          if (el.classList.contains("channel-card")) {
            document.querySelectorAll(".channel-card.is-selected").forEach(function (c) {
              c.classList.remove("is-selected");
            });
            el.classList.add("is-selected");
          }
          showScreen(target);
        });
      });

      var filterTabs = document.querySelectorAll(".filter-tab[data-filter]");
      var sections = document.querySelectorAll(".catalog-section");

      filterTabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
          var filter = tab.getAttribute("data-filter");
          filterTabs.forEach(function (t) { t.classList.remove("is-active"); });
          tab.classList.add("is-active");
          sections.forEach(function (section) {
            var group = section.getAttribute("data-group");
            section.hidden = filter !== "all" && group !== filter;
          });
        });
      });

      function setListMode(filled) {
        listEmpty.hidden = filled;
        listFilled.hidden = !filled;
        btnEmpty.classList.toggle("is-active", !filled);
        btnFilled.classList.toggle("is-active", filled);
        listCounts.textContent = filled
          ? "4 configured · 2 active · 4 total"
          : "0 configured · 0 active · 0 total";
      }
      btnEmpty.addEventListener("click", function () { setListMode(false); });
      btnFilled.addEventListener("click", function () { setListMode(true); });

      document.querySelectorAll(".resource-card .switch").forEach(function (sw) {
        sw.addEventListener("click", function () {
          var card = sw.closest(".resource-card");
          var label = card && card.querySelector(".publish-toggle span");
          var badge = card && card.querySelector(".status-badge");
          var on = !sw.classList.contains("is-on");
          sw.classList.toggle("is-on", on);
          if (card) {
            card.classList.toggle("is-inactive", !on);
            card.setAttribute("data-status", on ? "active" : "inactive");
          }
          if (label) label.textContent = on ? "Published" : "Draft";
          if (badge) {
            badge.textContent = on ? "Active" : "Inactive";
            badge.classList.toggle("is-active", on);
            badge.classList.toggle("is-inactive", !on);
          }
        });
      });

      document.querySelectorAll("[data-list-filter]").forEach(function (tab) {
        tab.addEventListener("click", function () {
          var filter = tab.getAttribute("data-list-filter");
          document.querySelectorAll("[data-list-filter]").forEach(function (t) {
            t.classList.toggle("is-active", t === tab);
          });
          document.querySelectorAll("#list-filled .resource-card").forEach(function (card) {
            var status = card.getAttribute("data-status");
            card.hidden = filter !== "all" && status !== filter;
          });
        });
      });

      var saveBtn = document.getElementById("btn-save-hook");
      if (saveBtn) {
        saveBtn.addEventListener("click", function () {
          var original = saveBtn.textContent;
          saveBtn.textContent = "Saving...";
          saveBtn.disabled = true;
          setTimeout(function () {
            saveBtn.textContent = "Saved!";
            setTimeout(function () {
              saveBtn.textContent = original;
              saveBtn.disabled = false;
            }, 900);
          }, 500);
        });
      }

      // Seed default configure screen with real registration prefs
      seedConfigure("Points for registrations");
    })();
  </script>
</body>
</html>
`;

const scriptStart = text.indexOf('  <script>');
if (scriptStart < 0) {
  console.error('script not found');
  process.exit(1);
}
text = text.slice(0, scriptStart) + newScript;
fs.writeFileSync(path, text, 'utf8');
console.log('JS replaced OK');
