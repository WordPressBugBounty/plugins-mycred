jQuery(function ($) {
    $('button.mycred-send-points-button').click(function () {
        var button = $(this);
        var originalLabel = button.text();

        var amount = button.data('amount');
        var recipient = button.data('to');
        var log = button.data('log');
        var reference = button.data('ref');
        var type = button.data('type');
        var postId = button.data('post-id');
        var token = myCREDsend.token;

        if (!amount || !recipient || !token) {
            alert(myCREDsend.error_missing_data || 'Invalid data provided.');
            return;
        }

        $.ajax({
            type: 'POST',
            url: myCREDsend.ajaxurl,
            data: {
                action: 'mycred-send-points',
                amount: amount,
                recipient: recipient,
                post_id: postId,
                log: log,
                reference: reference,
                type: type,
                token: token
            },
            dataType: 'JSON',
            beforeSend: function () {
                button.attr('disabled', 'disabled').text(myCREDsend.working);
            },
            success: function (data) {
                if (data.status === 'success') {
                    button.text(myCREDsend.done);
                    setTimeout(function () {
                        button.removeAttr('disabled').text(originalLabel);
                    }, 2000);
                } else {
                    button.text(myCREDsend.error || data.message);
                    setTimeout(function () {
                        button.removeAttr('disabled').text(originalLabel);
                    }, 2000);
                }
            },
            error: function (xhr, status, error) {
                console.error('AJAX Error: ', status, error);
                alert(myCREDsend.error || 'An error occurred while processing your request.');
                button.removeAttr('disabled').text(originalLabel);
            }
        });
    });
});
