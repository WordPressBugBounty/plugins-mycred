jQuery(document).ready(function () {
    function buycredRewardContainer($el) {
        var $container = $el.closest('.hook-settings-rendered, .widget-content');
        if (!$container.length) {
            $container = $el.closest('.hook-instance').parent();
        }
        return $container;
    }

    jQuery(document).on('click', '.mycred-add-specific-hook', function (e) {
        e.preventDefault();
        var $row = jQuery(this).closest('.hook-instance');
        var hook = $row.clone();
        hook.find('input.buycred-reward-creds').val('10');
        hook.find('input.buycred-reward-log').val('Reward for Buying %plural%.');
        hook.find('input.buycred-reward-min, select.buycred-reward-min').val('1');
        hook.find('input.buycred-reward-max').val('10');
        $row.after(hook);
    });

    jQuery(document).on('click', '.mycred-remove-specific-hook', function (e) {
        e.preventDefault();
        var $container = buycredRewardContainer(jQuery(this));
        if ($container.find('.hook-instance').length > 1) {
            var dialog = confirm('Are you sure you want to remove this hook?');
            if (dialog === true) {
                jQuery(this).closest('.hook-instance').remove();
            }
        }
    });
});
