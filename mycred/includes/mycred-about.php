<?php
if (!defined('myCRED_VERSION'))
    exit;

/**
 * About myCRED Page Callback
 * @since 1.3.2
 * @version 2.0
 */
function mycred_about_page()
{
    // Enqueue React app for About page
    wp_enqueue_script(
        'mycred-about-react-app',
        plugins_url('assets/build/about.bundle.js', myCRED_THIS),
        array('wp-element'),
        myCRED_VERSION,
        true
    );

    mycred_render_admin_header();
    ?>

    <div id="mycred-about-ui-root"></div>
    <?php
}
