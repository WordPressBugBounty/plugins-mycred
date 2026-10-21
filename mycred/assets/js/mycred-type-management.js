/**
 * myCRED Management Scripts
 * @since 1.3
 * @version 1.4
 */
jQuery(function($) {


    var ChangeDefaultImageButton = $('#point-type-change-default-image');

    var LevelImageSelector;
    var DefaultImageSelector;

    var wWidth = $(window).width();
    var dWidth = wWidth * 0.75;

    /**
     * Make sure new point type key is
     * correctly formatted. Only lowercase letters and underscores
     * are allowed. Warn user if needed.
     */
    $(document).on('input', '#mycred-new-ctype-key-value, #mycred-new-ctype-key-singular, #mycred-new-ctype-key-label', function() {
        if ($.trim($(this).val() || '') !== '') {
            $(this).css('border-color', '');
        }
    });

    $(document).on('change', '#mycred-new-ctype-key-value', function() {

        var ctype_key = $(this).val();
        var re = /^[a-z_]+$/;
        if (ctype_key !== '' && !re.test(ctype_key)) {
            $(this).css('border-color', 'red');
            $('#mycred-ctype-warning').css('color', 'red');
        } else {
            $(this).css('border-color', '');
            $('#mycred-ctype-warning').css('color', '');
        }

    });

    /**
     * Replace point types list HTML from AJAX response
     */
    var mycred_refresh_point_types_list = function(html) {
        var $list = $('#mycred-point-types-list');
        if ($list.length && typeof html === 'string') {
            $list.html(html);
        }
    };

    var mycred_settings_notice = function(message) {
        if (window.mycredSettingsToast && typeof window.mycredSettingsToast.error === 'function') {
            window.mycredSettingsToast.error(message);
            return;
        }
        window.alert(message);
    };

    var mycred_point_type_notice = mycred_settings_notice;

    var mycred_settings_confirm = function(message) {
        if (window.mycredSettingsToast && typeof window.mycredSettingsToast.confirm === 'function') {
            return window.mycredSettingsToast.confirm({ message: message });
        }
        return Promise.resolve(window.confirm(message));
    };

    var mycred_join_field_labels = function(labels) {
        if (labels.length < 2) {
            return labels[0] || '';
        }
        if (labels.length === 2) {
            return (myCREDmanage.field_and || '%1$s and %2$s')
                .replace('%1$s', labels[0])
                .replace('%2$s', labels[1]);
        }
        return (myCREDmanage.field_and_more || '%1$s, and %2$s')
            .replace('%1$s', labels.slice(0, -1).join(', '))
            .replace('%2$s', labels[labels.length - 1]);
    };

    var mycred_required_fields_message = function(labels) {
        var template = labels.length === 1
            ? (myCREDmanage.field_is_required || '%s is required.')
            : (myCREDmanage.fields_are_required || '%s are required.');
        return template.replace('%s', mycred_join_field_labels(labels));
    };

    /**
     * Add Point Type AJAX Caller
     */
    var mycred_action_add_point_type = function(button) {

        var key = $.trim($('#mycred-new-ctype-key-value').val() || '');
        var singular = $.trim($('#mycred-new-ctype-key-singular').val() || '');
        var plural = $.trim($('#mycred-new-ctype-key-label').val() || '');
        var label = button.text();
        var fields = [
            { value: key, id: '#mycred-new-ctype-key-value', name: myCREDmanage.field_meta_key || 'Meta key' },
            { value: singular, id: '#mycred-new-ctype-key-singular', name: myCREDmanage.field_singular || 'Singular' },
            { value: plural, id: '#mycred-new-ctype-key-label', name: myCREDmanage.field_plural || 'Plural' }
        ];
        var missing = [];

        fields.forEach(function(field) {
            $(field.id).css('border-color', field.value ? '' : 'red');
            if (!field.value) {
                missing.push(field.name);
            }
        });

        if (missing.length) {
            mycred_point_type_notice(mycred_required_fields_message(missing));
            return;
        }

        if (!/^[a-z_]+$/.test(key)) {
            mycred_point_type_notice(myCREDmanage.add_type_invalid || 'Meta key must be lowercase letters and underscores only.');
            $('#mycred-new-ctype-key-value').css('border-color', 'red');
            $('#mycred-ctype-warning').css('color', 'red');
            return;
        }

        $.ajax({
            type: 'POST',
            data: {
                action: 'mycred-action-add-point-type',
                token: myCREDmanage.token,
                key: key,
                singular: singular,
                plural: plural
            },
            dataType: 'JSON',
            url: myCREDmanage.ajaxurl,
            beforeSend: function() {
                button.prop('disabled', true).text(myCREDmanage.working);
            },
            success: function(response) {
                if (response.success) {
                    mycred_refresh_point_types_list(response.data.html);
                    $('#mycred-new-ctype-key-value, #mycred-new-ctype-key-singular, #mycred-new-ctype-key-label').val('').css('border-color', '');
                    $('#mycred-ctype-warning').css('color', '');

                    var message = response.data.message || 'Point type added successfully.';
                    var linkLabel = myCREDmanage.added_go_settings || myCREDmanage.open_settings || 'Open settings';
                    if (window.mycredSettingsToast && typeof window.mycredSettingsToast.success === 'function') {
                        window.mycredSettingsToast.success(message, {
                            actionLabel: response.data.url ? linkLabel : '',
                            actionUrl: response.data.url || ''
                        });
                    } else if (response.data.url) {
                        window.alert(message + '\n' + response.data.url);
                    } else {
                        window.alert(message);
                    }
                } else {
                    if (window.mycredSettingsToast && typeof window.mycredSettingsToast.error === 'function') {
                        window.mycredSettingsToast.error(response.data || 'Error');
                    } else {
                        alert(response.data || 'Error');
                    }
                }
            },
            error: function() {
                if (window.mycredSettingsToast && typeof window.mycredSettingsToast.error === 'function') {
                    window.mycredSettingsToast.error('Error');
                } else {
                    alert('Error');
                }
            },
            complete: function() {
                button.prop('disabled', false).text(label);
            }
        });

    };

    /**
     * Add Point Type Trigger
     */
    $(document).on('click', '#mycred-add-point-type', function(e) {
        e.preventDefault();
        mycred_action_add_point_type($(this));
    });

    /**
     * Delete Point Type AJAX Caller
     */
    var mycred_action_delete_point_type = function(button) {

        var type = button.attr('data-type');
        var label = button.text();

        if (!type) {
            return;
        }

        $.ajax({
            type: 'POST',
            data: {
                action: 'mycred-action-delete-point-type',
                token: myCREDmanage.token,
                type: type
            },
            dataType: 'JSON',
            url: myCREDmanage.ajaxurl,
            beforeSend: function() {
                button.prop('disabled', true).text(myCREDmanage.working);
            },
            success: function(response) {
                if (response.success) {
                    mycred_refresh_point_types_list(response.data.html);
                } else {
                    mycred_settings_notice(response.data || 'Error');
                    button.prop('disabled', false).text(label);
                }
            },
            error: function() {
                mycred_settings_notice('Error');
                button.prop('disabled', false).text(label);
            }
        });

    };

    /**
     * Delete Point Type Trigger
     */
    $(document).on('click', '.mycred-delete-point-type', function(e) {
        e.preventDefault();
        var button = $(this);
        mycred_settings_confirm(myCREDmanage.confirm_delete_type || 'Delete this point type?').then(function(ok) {
            if (ok) {
                mycred_action_delete_point_type(button);
            }
        });
    });

    /**
     * Update Point Type Label on blur
     */
    $(document).on('focus', '.mycred-point-type-label', function() {
        var $input = $(this);
        if ($input.data('original') === undefined) {
            $input.data('original', $input.val());
        }
    });

    $(document).on('blur', '.mycred-point-type-label', function() {
        var $input = $(this);
        var type = $input.attr('data-type') || $input.data('type');
        var label = $.trim($input.val() || '');
        var original = $input.attr('data-original');
        if (original === undefined) {
            original = $input.data('original') || '';
        }

        if (!type) {
            return;
        }

        if (label === '') {
            mycred_settings_notice(myCREDmanage.label_empty || 'Label cannot be empty.');
            $input.val(original);
            return;
        }

        if (label === original) {
            return;
        }

        $.ajax({
            type: 'POST',
            data: {
                action: 'mycred-action-update-point-type-label',
                token: myCREDmanage.token,
                type: type,
                label: label
            },
            dataType: 'JSON',
            url: myCREDmanage.ajaxurl,
            beforeSend: function() {
                $input.prop('disabled', true);
            },
            success: function(response) {
                if (response.success) {
                    var saved = response.data.label || label;
                    $input.val(saved);
                    $input.attr('data-original', saved);
                    $input.data('original', saved);
                } else {
                    mycred_settings_notice(response.data || 'Error');
                    $input.val(original);
                }
            },
            error: function() {
                mycred_settings_notice('Error');
                $input.val(original);
            },
            complete: function() {
                $input.prop('disabled', false);
            }
        });
    });

    /**
     * Empty Log AJAX Caller
     */
    var mycred_action_empty_log = function(button) {

        var label = button.val();
        $.ajax({
            type: "POST",
            data: {
                action: 'mycred-action-empty-log',
                token: myCREDmanage.token,
                type: button.attr('data-type')
            },
            dataType: "JSON",
            url: myCREDmanage.ajaxurl,
            beforeSend: function() {
                button.attr('value', myCREDmanage.working);
                button.attr('disabled', 'disabled');
            },
            success: function(response) {

                if (response.success) {
                    $('input#mycred-manage-table-rows').val(response.data);
                    button.val(myCREDmanage.done);
                    button.removeClass('button-primary');
                } else {
                    button.val(label);
                    button.removeAttr('disabled');
                    mycred_settings_notice(response.data);
                }

            }
        });

    };

    /**
     * Empty Log Trigger
     */
    $('#mycred-manage-action-empty-log').click(function() {
        var button = $(this);
        mycred_settings_confirm(myCREDmanage.confirm_log).then(function(ok) {
            if (ok) {
                mycred_action_empty_log(button);
            }
        });
    });

    /**
     * Reset Balance AJAX Caller
     */
    var mycred_action_reset_balance = function(button) {

        var label = button.val();

        $.ajax({
            type: "POST",
            data: {
                action: 'mycred-action-reset-accounts',
                token: myCREDmanage.token,
                type: button.attr('data-type')
            },
            dataType: "JSON",
            url: myCREDmanage.ajaxurl,
            beforeSend: function() {
                button.attr('value', myCREDmanage.working);
                button.attr('disabled', 'disabled');
            },
            success: function(response) {

                console.log(response);
                if (response.success) {
                    button.text(response.data);
                    button.removeClass('button-primary');
                } else {
                    button.text(label);
                    button.removeAttr('disabled');
                    mycred_settings_notice(response.data);
                }

            }
        });

    };

    /**
     * Reset Balance Trigger
     */
    $('#mycred-manage-action-reset-accounts').click(function() {
        var button = $(this);
        mycred_settings_confirm(myCREDmanage.confirm_reset).then(function(ok) {
            if (ok) {
                mycred_action_reset_balance(button);
            }
        });
    });

    $(document).ready(function() {

        // Set / Change Point Image Action
        $('#mycred-image-setup').on('click', '#point-type-change-default-image', function(e) {

            console.log('Change point type image button');

            var button = $(this);

            var buttonDiv = $('.point-image-buttons');

            fieldName = myCREDmanage.fieldName.replace('[]', '');

            LevelImageSelector = wp.media.frames.file_frame = wp.media({
                title: myCREDmanage.uploadtitle,
                button: {
                    text: myCREDmanage.uploadbutton
                },
                multiple: false
            });

            // When a file is selected, grab the URL and set it as the text field's value
            LevelImageSelector.on('select', function() {

                attachment = LevelImageSelector.state().get('selection').first().toJSON();
                if (attachment.url != '') {

                    $('.point-type-image-wrapper').fadeOut(function() {
                        $('.point-type-image-wrapper').empty().removeClass('default-image dashicons').html(`<img src="${attachment.url}" alt="Point type image" \/><input type="hidden" name="${fieldName}[attachment_id]" value="${attachment.id}" \/>`).fadeIn();
                        $(buttonDiv).html(`
								<button type="button" class="button button-secondary" id="point-type-change-default-image">${myCREDmanage.uploadImage || myCREDmanage.changeImage}</button>
								<button type="button" id="point-type-remove-image">${myCREDmanage.removeImage || 'Remove'}</button>
							`);
                    });

                }

            });

            // Open the uploader dialog
            LevelImageSelector.open();

        });

        $('#mycred-image-setup').on('click', '#point-type-remove-image', function(e) {
            e.preventDefault();

            var name = (typeof myCREDmanage !== 'undefined' && myCREDmanage.fieldName)
                ? myCREDmanage.fieldName.replace('[]', '')
                : '';
            var $wrapper = $('.point-type-image-wrapper');

            $wrapper.find('img').remove();
            $wrapper.find('.empty, .dashicons').remove();

            var $input = $wrapper.find('input[type="hidden"]');
            if ($input.length) {
                $input.val('0');
            } else if (name) {
                $wrapper.append('<input type="hidden" name="' + name + '[attachment_id]" value="0" />');
            }
        });



        // Point type ends
        if (dWidth < 250)
            dWidth = wWidth;

        if (dWidth > 960)
            dWidth = 960;

        /**
         * Export Balances Modal
         */
        $('#export-points').dialog({
            dialogClass: 'mycred-export-points mycred-ui-wrap',
            draggable: true,
            autoOpen: false,
            title: myCREDmanage.export_title,
            closeText: myCREDmanage.export_close,
            modal: true,
            width: dWidth,
            height: 'auto',
            resizable: false,
            position: { my: "center", at: "top+25%", of: window },
            show: {
                effect: 'fadeIn',
                duration: 250
            },
            hide: {
                effect: 'fadeOut',
                duration: 250
            }
        });

        /**
         * Export balances Modal Trigger
         */
        $('#mycred-export-users-points').click(function() {

            $(this).blur();

            $('#export-points').dialog('open');

        });

    });

    /**
     * Export Balances AJAX Caller
     */
    var mycred_action_export_balances = function(button) {

        var label = button.val();
        $.ajax({
            type: "POST",
            data: {
                action: 'mycred-action-export-balances',
                token: myCREDmanage.token,
                identify: $('#mycred-export-identify-by').val(),
                log_temp: $('#mycred-export-log-template').val(),
                type: button.attr('data-type')
            },
            dataType: "JSON",
            url: myCREDmanage.ajaxurl,
            beforeSend: function() {
                button.attr('value', myCREDmanage.working);
                button.attr('disabled', 'disabled');
            },
            success: function(response) {

                if (response.success) {
                    setTimeout(function() {
                        window.location.href = response.data;
                        button.val(myCREDmanage.done);
                    }, 2000);
                    setTimeout(function() {
                        button.removeAttr('disabled');
                        button.val(label);
                    }, 4000);
                } else {
                    button.val(label);
                    button.before(response.data);
                }

            }
        });

    };

    /**
     * Balance Export Trigger
     */
    $('#mycred-run-exporter').click(function() {

        mycred_action_export_balances($(this));

    });

    /**
     * Generate Key AJAX Caller
     */
    var mycred_generate_key = function() {

        $.ajax({
            type: "POST",
            data: {
                action: 'mycred-action-generate-key',
                token: myCREDmanage.token
            },
            dataType: "JSON",
            url: myCREDmanage.ajaxurl,
            success: function(response) {
                $('#myCRED-remote-key').val(response.data);
                $('#mycred-length-counter').text(response.data.length);
                $('#mycred-remote-key-length').css('color', response.data.length >= 12 ? 'green' : 'red');
            }
        });

    };

    /**
     * Generate Key Trigger
     */
    jQuery('.mycred-remote-key-wrapper').on('click', '#mycred-generate-api-key', function() {
        mycred_generate_key();
    });

    /**
     * Key Length Indicator
     */
    var mycred_update_remote_key_length = function($input) {
        var length = $input.val().length;
        var color = length === 0 ? 'gray' : (length >= 12 ? 'green' : 'red');

        $('#mycred-length-counter').text(length);
        $('#mycred-remote-key-length').css('color', color);
    };

    $(document).on('change keyup input', '#myCRED-remote-key', function() {
        mycred_update_remote_key_length($(this));
    });

    /**
     * Adjust Decimals AJAX Caller
     */
    var mycred_adjust_max_decimals = function(button, label, decval) {

        $.ajax({
            type: "POST",
            data: {
                action: 'mycred-action-max-decimals',
                token: myCREDmanage.token,
                decimals: decval
            },
            dataType: "JSON",
            url: myCREDmanage.ajaxurl,
            beforeSend: function() {
                button.attr('value', myCREDmanage.working);
                button.attr('disabled', 'disabled');
            },
            success: function(response) {

                if (response.success) {
                    button.val(response.data.label);
                    setTimeout(function() {
                        window.location.href = response.data.url;
                    }, 4000);
                } else {
                    button.val(response.data);
                    setTimeout(function() {
                        button.removeAttr('disabled');
                        button.val(label);
                    }, 4000);
                }

            }
        });

    };

    /**
     * Show / Hide Update Button
     */
    $('#mycred-adjust-decimal-places').change(function() {

        var originaldec = $(this).data('org');
        var newvalue = $(this).val();

        if (originaldec != newvalue)
            $('#mycred-update-log-decimals').show();
        else
            $('#mycred-update-log-decimals').hide();

    });

    /**
     * Update Log Decimals Trigger
     */
    $('#mycred-update-log-decimals').click(function() {
        var button = $(this);
        mycred_settings_confirm(myCREDmanage.decimals).then(function(ok) {
            if (ok) {
                mycred_adjust_max_decimals(button, button.val(), $('#mycred-adjust-decimal-places').val());
            }
        });
    });

    var clearing_cache = false;

    /**
     * Cache Clearing
     */
    var mycred_clear_the_cache = function(button, label) {

        if (clearing_cache) return false;

        clearing_cache = true;

        $.ajax({
            type: "POST",
            data: {
                action: 'mycred-action-clear-cache',
                token: myCREDmanage.cache,
                ctype: button.attr('data-type'),
                cache: button.attr('data-cache')
            },
            dataType: "JSON",
            url: myCREDmanage.ajaxurl,
            beforeSend: function() {
                button.html(myCREDmanage.working);
                button.attr('disabled', 'disabled');
            },
            success: function(response) {

                alert(response.data);
                button.html(label);

            },
            complete: function() {
                clearing_cache = false;
                button.html(label);
                button.removeAttr('disabled');
            }
        });

    };

    /**
     * Clear Cache Trigger
     */
    $(document).on('click', 'button.clear-type-cache-button', function() {

        mycred_clear_the_cache($(this), $(this).html());

    });

    /**
     * Select2 Exclude User by ID and Roles
     * @since 2.3
     */
    jQuery('#generalexcludelist').select2({

        ajax: {
            url: ajaxurl,
            dataType: 'json',
            data: function(params) {
                var query = {
                    search: params.term,
                    token: myCREDmanage.token,
                    action: 'mycred-get-users-to-exclude'
                }

                // Query parameters will be ?search=[term]&type=public
                return query;
            }
        },
        processResults: function(data, params) {
            return {
                results: data.results
            };
        },
        data: myCREDmanage.excludedUsers,
        minimumInputLength: 3
    });

    jQuery('#generalexcludebyroles').select2();

});