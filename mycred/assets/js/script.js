jQuery(document).ready(() => {
    function mycredSelect2DropdownParent($el) {
        // React Hooks UI: keep dropdown on body so it never expands the card / page width.
        if ($el.closest('#mycred-hooks-app, .hook-settings-rendered').length) {
            return jQuery(document.body);
        }
        var $parent = $el.closest('.widget-content, .hook-instance');
        return $parent.length ? $parent : jQuery(document.body);
    }

    function mycredSafeDestroySelect2($els) {
        if (!jQuery.fn.select2) {
            return;
        }
        $els.each(function() {
            var $el = jQuery(this);
            if ($el.hasClass('select2-hidden-accessible')) {
                try {
                    $el.select2('destroy');
                } catch (err) {
                    // Ignore destroy errors on detached / half-initialized nodes.
                }
            }
            $el.removeClass('select2-hidden-accessible')
                .removeAttr('data-select2-id')
                .removeAttr('aria-hidden')
                .removeAttr('tabindex');
            $el.next('.select2-container').remove();
            $el.siblings('.select2-container').remove();
        });
    }

    function mycredSafeSelect2($els) {
        if (!jQuery.fn.select2) {
            return;
        }
        $els.each(function() {
            var $el = jQuery(this);
            mycredSafeDestroySelect2($el);
            var inHooksUi = $el.closest('#mycred-hooks-app, .hook-settings-rendered').length > 0;
            $el.select2({
                width: '100%',
                closeOnSelect: !$el.prop('multiple'),
                dropdownParent: mycredSelect2DropdownParent($el),
                dropdownCssClass: inHooksUi ? 'mycred-hook-select2-dropdown' : ''
            });
            if (inHooksUi) {
                $el.off('select2:open.mycredHooksOverflow select2:closing.mycredHooksOverflow');
                $el.on('select2:open.mycredHooksOverflow', function() {
                    jQuery('body').addClass('mycred-hooks-select2-open');
                });
                $el.on('select2:closing.mycredHooksOverflow', function() {
                    jQuery('body').removeClass('mycred-hooks-select2-open');
                    jQuery('html, body').css('overflow-x', '');
                });
            }
        });
    }

    function mycredCleanClonedSelect2Markup($hook) {
        $hook.find('.select2-container').remove();
        $hook.find('select.post-options-author, select.post-options-member')
            .removeClass('select2-hidden-accessible')
            .removeAttr('data-select2-id')
            .removeAttr('aria-hidden')
            .removeAttr('tabindex');
    }

    function mycredRewriteSelectPostsName($select, index) {
        var name = $select.attr('name') || '';
        var next = name.replace(/\[select_posts\]\[\d+\]\[\]/, '[select_posts][' + index + '][]');
        if (next === name) {
            next = name.replace(/\[\d+\]\[\]$/, '[' + index + '][]');
        }
        $select.attr('name', next);
    }

    function mycredFrmDisableEmptyOptions($select) {
        $select.find('option').filter(function() {
            var value = jQuery(this).val();
            return value === '' || value === '0';
        }).prop('disabled', true);
    }

    function mycredFrmSelectFirstAvailable($select) {
        var current = $select.val();
        if (Array.isArray(current)) {
            current = current.filter(Boolean)[0] || '';
        }
        if (current && current !== '0') {
            return;
        }
        var $first = $select.find('option:not([disabled])').filter(function() {
            return jQuery(this).val() !== '' && jQuery(this).val() !== '0';
        }).first();
        if ($first.length) {
            if ($select.prop('multiple')) {
                $select.val([$first.val()]);
            } else {
                $select.val($first.val());
            }
        }
    }

    function mycredFrmFillPostsDropdown($dropdown, items, placeholder, selectFirst) {
        mycredSafeDestroySelect2($dropdown);
        $dropdown.empty();
        $dropdown.append('<option value="" disabled>' + placeholder + '</option>');

        if (items && items.length) {
            jQuery.each(items, function(index, item) {
                $dropdown.append('<option value="' + item.ID + '">' + item.title + '</option>');
            });
            if (selectFirst) {
                $dropdown.find('option[value=""]').prop('selected', false);
                $dropdown.find('option:not([disabled])').first().prop('selected', true);
            }
        } else {
            $dropdown.append('<option value="" disabled>No items available</option>');
        }

        mycredFrmDisableEmptyOptions($dropdown);
        mycredSafeSelect2($dropdown);
    }

    function mycredFrmInitSpecificContentDefaults() {
        jQuery('select.specific-content, select.specific-content-author').each(function() {
            var $select = jQuery(this);
            mycredFrmDisableEmptyOptions($select);
            var value = $select.val();
            if (!value || value === '0') {
                mycredFrmSelectFirstAvailable($select);
                $select.trigger('change');
            }
        });
        jQuery('select.post-options-member, select.post-options-author').each(function() {
            var $posts = jQuery(this);
            mycredFrmDisableEmptyOptions($posts);
            mycredFrmSelectFirstAvailable($posts);
        });
    }

    mycredSafeSelect2(jQuery('.post-options-author, .post-options-member'));
    mycredFrmInitSpecificContentDefaults();

    jQuery(document).on('specific-content-select2', function() {
        mycredSafeSelect2(jQuery('.post-options-author, .post-options-member'));
        mycredFrmInitSpecificContentDefaults();
    });

    jQuery('#specific_content_author_0 option[value="0"], #specific_content_0 option[value="0"]').prop('disabled', true);

    jQuery(document).on('click', '.mycred-add-specific-view-content-hook-author', function(e) {
        e.preventDefault();
        var closest = jQuery(this).closest('.content_custom_hook_class_author');
        var $instance = closest.closest('.hook-instance');
        mycredSafeDestroySelect2(closest.find('.post-options-author'));
        var hook = closest.clone();
        mycredCleanClonedSelect2Markup(hook);
        var index = $instance.length
            ? $instance.find('.content_custom_hook_class_author').length
            : jQuery('.content_custom_hook_class_author').length;
        closest.after(hook);
        mycredRewriteSelectPostsName(hook.find('.post-options-author'), index);
        hook.find('.post-options-author').attr('id', 'contents_specific_author_' + index);
        hook.find('select.specific-content-author option:not([disabled])').first().prop('selected', true);
        hook.find('input.mycred-content-specific-creds-author').val('10');
        hook.find('input.mycred-content-specific-log-author').val('%plural% for viewing a specific content (Author)');
        hook.find('select.specific-content-author').trigger('change');

        mycredSafeSelect2(jQuery('.post-options-author'));
        jQuery('select.post-options-author').trigger('change');
    });

    jQuery(document).on('click', '.mycred-add-specific-view-content-hook', function(e) {
        e.preventDefault();
        var closest = jQuery(this).closest('.content_custom_hook_class');
        var $instance = closest.closest('.hook-instance');
        mycredSafeDestroySelect2(closest.find('.post-options-member'));
        var hook = closest.clone();
        mycredCleanClonedSelect2Markup(hook);
        var index = $instance.length
            ? $instance.find('.content_custom_hook_class').length
            : jQuery('.content_custom_hook_class').length;
        closest.after(hook);

        mycredRewriteSelectPostsName(hook.find('.post-options-member'), index);
        hook.find('.post-options-member').attr('id', 'contents_specific_' + index);
        hook.find('select.specific-content option:not([disabled])').first().prop('selected', true);
        hook.find('input.mycred-content-specific-creds').val('10');
        hook.find('input.mycred-content-specific-log').val('%plural% for viewing specific content (Member)');
        hook.find('select.specific-content').trigger('change');

        mycredSafeSelect2(jQuery('.post-options-member'));
        jQuery('select.post-options-member').trigger('change');
    });

    jQuery(document).on('click', '.mycred-remove-specific-view-content-hook-author', function(e) {
        e.preventDefault();
        var container = jQuery(this).closest('.hook-instance');
        if (container.find('.content_custom_hook_class_author').length > 1) {
            var dialog = confirm('Are you sure you want to remove this hook?');
            if (dialog === true) {
                jQuery(this).closest('.content_custom_hook_class_author').remove();
                jQuery('select.post-options-author').trigger('change');
            }
        }
    });

    jQuery(document).on('click', '.mycred-remove-specific-view-content-hook', function(e) {
        e.preventDefault();
        var container = jQuery(this).closest('.hook-instance');
        if (container.find('.content_custom_hook_class').length > 1) {
            var dialog = confirm('Are you sure you want to remove this hook?');
            if (dialog === true) {
                jQuery(this).closest('.content_custom_hook_class').remove();
                jQuery('select.post-options-member').trigger('change');
            }
        }
    });

    jQuery(document).on('change', 'select.post-options-author', function() {
        user_content_enable_disable_options_author(jQuery(this));
    });

    jQuery(document).on('change', 'select.post-options-member', function() {
        user_content_enable_disable_options_member(jQuery(this));
    });

    jQuery(document).on('change', 'select.specific-content-author', function() {
        var _this = jQuery(this);
        var value = _this.val();

        if (!value) {
            return;
        }

        var data = {
            action: 'mycred_specific_posts_for_users_author',
            post_type_author: value,
        };

        var ele = _this.closest('.content_custom_hook_class_author').find('.post-options-author');
        var defaultOptionText = 'Select ' + _this.find('option:selected').text();
        ele.find('option').remove();
        ele.append("<option value='' disabled>Loading...</option>");

        jQuery.post(ajaxurl, data)
            .done(function(response) {
                var items = [];
                if (response && response.length > 0) {
                    items = response;
                }
                mycredFrmFillPostsDropdown(ele, items, defaultOptionText, true);
            })
            .fail(function() {
                ele.find('option').remove();
                ele.append("<option value='' disabled>Error loading posts</option>");
            });
    });

    jQuery(document).on('change', 'select.specific-content', function() {
        var _this = jQuery(this);
        var selectedPostTypeText = _this.find('option:selected').text();

        var postOptionsDropdown = _this
            .closest('.content_custom_hook_class')
            .find('.post-options-member');

        var placeholder = 'Select ' + selectedPostTypeText;

        var data = {
            action: 'mycred_specific_posts_for_users',
            post_type: _this.val(),
        };

        postOptionsDropdown.empty();
        postOptionsDropdown.append("<option value='' disabled>Loading...</option>");

        jQuery.post(ajaxurl, data, function(response) {
            var items = (response && response.success && Array.isArray(response.data)) ? response.data : [];
            mycredFrmFillPostsDropdown(postOptionsDropdown, items, placeholder, true);
        }).fail(function() {
            postOptionsDropdown.empty();
            postOptionsDropdown.append("<option value='' disabled>Error loading posts</option>");
        });
    });
});

function user_content_enable_disable_options_author(ele) {
    var selected = [];
    var container = ele.closest('.hook-instance');
    container.find('select.specific-content-author').each(function() {
        container.find('select.specific-content-author').not(jQuery(this)).find('option[value="' + jQuery(this).val() + '"]').attr('disabled', 'disabled');
        selected.push(jQuery(this).val());
    });
    container.find('option').each(function() {
        if (!selected.includes(jQuery(this).attr('value'))) {
            container.find('select.specific-content-author').find('option[value="' + jQuery(this).val() + '"]').removeAttr('disabled');
        }
    });
}

function user_content_enable_disable_options_member(ele) {
    var selected = [];
    var container = ele.closest('.hook-instance');
    container.find('select.specific-content').each(function() {
        container.find('select.specific-content').not(jQuery(this)).find('option[value="' + jQuery(this).val() + '"]').attr('disabled', 'disabled');
        selected.push(jQuery(this).val());
    });
    container.find('option').each(function() {
        if (!selected.includes(jQuery(this).attr('value'))) {
            container.find('select.specific-content').find('option[value="' + jQuery(this).val() + '"]').removeAttr('disabled');
        }
    });
}
