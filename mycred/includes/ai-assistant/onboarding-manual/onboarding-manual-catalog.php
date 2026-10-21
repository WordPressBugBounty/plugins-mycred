<?php
/**
 * Hardcoded Manual Setup hook and add-on labels. Not used by AI.
 *
 * @package myCred
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

return array (
  'hooks' => 
  array (
    'advanced_ads_expiration' => 
    array (
      'label' => 'Advanced Ads Expiration',
      'description' => 'Advanced Ads Expiration',
      'creds' => '10',
      'addon' => 'mycred-advanced-ads',
    ),
    'advanced_ads_publication' => 
    array (
      'label' => 'Advanced Ads Publication',
      'description' => 'Advanced Ads Publication',
      'creds' => '10',
      'addon' => 'mycred-advanced-ads',
    ),
    'advanced_ads_unpublication' => 
    array (
      'label' => 'Advanced Ads Unpublication',
      'description' => 'Advanced Ads Unpublication',
      'creds' => '10',
      'addon' => 'mycred-advanced-ads',
    ),
    'affiliate' => 
    array (
      'label' => 'Points for referrals',
      'description' => 'Award signup or visitor referrals. Links via [mycred_affiliate_link] / [mycred_affiliate_id].',
      'creds' => '10',
      'addon' => 'mycred',
    ),
    'affiliatewp' => 
    array (
      'label' => 'AffiliateWP',
      'description' => 'AffiliateWP',
      'creds' => '10',
      'addon' => 'mycred',
    ),
    'anniversary' => 
    array (
      'label' => 'Points for Anniversary',
      'description' => 'Award points for each year of membership.',
      'creds' => '10',
      'addon' => 'mycred',
    ),
    'anniversary_pro' => 
    array (
      'label' => 'Points for Anniversary',
      'description' => 'Points for Anniversary',
      'creds' => '10',
      'addon' => 'mycred-anniversary-pro',
    ),
    'anspress_after_new_answer' => 
    array (
      'label' => 'Posting an answer',
      'description' => 'Posting an answer',
      'creds' => '10',
      'addon' => 'mycred-anspress-integration',
    ),
    'anspress_after_new_question' => 
    array (
      'label' => 'Asking a question',
      'description' => 'Asking a question',
      'creds' => '10',
      'addon' => 'mycred-anspress-integration',
    ),
    'anspress_ap_get_best_answer' => 
    array (
      'label' => 'Getting best answer',
      'description' => 'Awarded to the answer author.',
      'creds' => '10',
      'addon' => 'mycred-anspress-integration',
    ),
    'anspress_ap_select_answer' => 
    array (
      'label' => 'Selecting best answer',
      'description' => 'Awarded to the user who selects the best answer.',
      'creds' => '10',
      'addon' => 'mycred-anspress-integration',
    ),
    'anspress_get_vote_down' => 
    array (
      'label' => 'Getting a vote down',
      'description' => 'Awarded to the post author. Negative deducts.',
      'creds' => '10',
      'addon' => 'mycred-anspress-integration',
    ),
    'anspress_get_vote_up' => 
    array (
      'label' => 'Getting a vote up',
      'description' => 'Awarded to the post author.',
      'creds' => '10',
      'addon' => 'mycred-anspress-integration',
    ),
    'anspress_publish_comment' => 
    array (
      'label' => 'Publishing a comment',
      'description' => 'Publishing a comment',
      'creds' => '10',
      'addon' => 'mycred-anspress-integration',
    ),
    'anspress_vote_down' => 
    array (
      'label' => 'Voting down',
      'description' => 'Awarded to the voter. Negative deducts.',
      'creds' => '10',
      'addon' => 'mycred-anspress-integration',
    ),
    'anspress_vote_up' => 
    array (
      'label' => 'Voting up',
      'description' => 'Awarded to the voter.',
      'creds' => '10',
      'addon' => 'mycred-anspress-integration',
    ),
    'approved_pull_request_hook' => 
    array (
      'label' => 'Points for approved pull request',
      'description' => 'Points for approved pull request',
      'creds' => '10',
      'addon' => 'mycred-github',
    ),
    'arforms_field_value_submit' => 
    array (
      'label' => 'Field Value Submissions (ARForms)',
      'description' => 'Field Value Submissions (ARForms)',
      'creds' => '10',
      'addon' => 'mycred-arforms',
    ),
    'arforms_successful_submit' => 
    array (
      'label' => 'Form Submissions (ARForms)',
      'description' => 'Form Submissions (ARForms)',
      'creds' => '10',
      'addon' => 'mycred-arforms',
    ),
    'badgeos' => 
    array (
      'label' => 'BadgeOS',
      'description' => 'BadgeOS',
      'creds' => '10',
      'addon' => 'mycred',
    ),
    'birthday' => 
    array (
      'label' => 'Points for Birthdays',
      'description' => 'Points for Birthdays',
      'creds' => '10',
      'addon' => 'birthday',
    ),
    'birthday_pro' => 
    array (
      'label' => 'Points for Birthday',
      'description' => 'Points for Birthday',
      'creds' => '10',
      'addon' => 'mycred-birthday-plus',
    ),
    'bitform_successful_submit_form' => 
    array (
      'label' => 'Form Submissions (Bit Form)',
      'description' => 'Form Submissions (Bit Form)',
      'creds' => '10',
      'addon' => 'mycred-bitform',
    ),
    'booking_confirmation' => 
    array (
      'label' => 'Booking Confirmation',
      'description' => 'Booking Confirmation',
      'creds' => '10',
      'addon' => 'mycred-gravity-form-booking',
    ),
    'bookingcalendar_successful_booking_complete' => 
    array (
      'label' => 'Compleing a Booking (Booking Calendar)',
      'description' => 'Compleing a Booking (Booking Calendar)',
      'creds' => '10',
      'addon' => 'mycred-bookingcalendar',
    ),
    'bookingpress_successful_booking_complete' => 
    array (
      'label' => 'Compleing a Booking (BookingPress)',
      'description' => 'Compleing a Booking (BookingPress)',
      'creds' => '10',
      'addon' => 'mycred-bookingpress',
    ),
    'bookly_successful_booking_complete' => 
    array (
      'label' => 'Compleing a Booking (Bookly)',
      'description' => 'Compleing a Booking (Bookly)',
      'creds' => '10',
      'addon' => 'mycred-bookly',
    ),
    'booknetic_successful_booking_complete' => 
    array (
      'label' => 'Compleing a Booking (Booknetic)',
      'description' => 'Compleing a Booking (Booknetic)',
      'creds' => '10',
      'addon' => 'mycred-booknetic',
    ),
    'bp-compliments' => 
    array (
      'label' => 'BuddyPress Compliments',
      'description' => 'BuddyPress Compliments',
      'creds' => '10',
      'addon' => 'mycred-for-buddypress-compliments',
    ),
    'buycred_reward' => 
    array (
      'label' => 'Reward for Buying Points',
      'description' => 'Reward for Buying Points',
      'creds' => '10',
      'addon' => 'buy-creds',
    ),
    'comments' => 
    array (
      'label' => 'Points for comments',
      'description' => 'Award approved comments; deduct spam/trash. Disqus title if Disqus is active.',
      'creds' => '10',
      'addon' => 'mycred',
    ),
    'complete_pay' => 
    array (
      'label' => 'Simple Pay: Completing a Purchase',
      'description' => 'Simple Pay: Completing a Purchase',
      'creds' => '10',
      'addon' => 'mycred-simple-pay-integration',
    ),
    'completing_buddyboss_activity_stream_events' => 
    array (
      'label' => 'BuddyBoss: Activity Stream Events',
      'description' => 'BuddyBoss: Activity Stream Events',
      'creds' => '10',
      'addon' => 'mycred-buddyboss',
    ),
    'completing_buddyboss_email_invites_events' => 
    array (
      'label' => 'BuddyBoss: Email Invite Events',
      'description' => 'BuddyBoss: Email Invite Events',
      'creds' => '10',
      'addon' => 'mycred-buddyboss',
    ),
    'completing_buddyboss_follow_events' => 
    array (
      'label' => 'BuddyBoss: Follow Events',
      'description' => 'BuddyBoss: Follow Events',
      'creds' => '10',
      'addon' => 'mycred-buddyboss',
    ),
    'completing_buddyboss_forum_events' => 
    array (
      'label' => 'BuddyBoss: Forum Events',
      'description' => 'BuddyBoss: Forum Events',
      'creds' => '10',
      'addon' => 'mycred-buddyboss',
    ),
    'completing_buddyboss_friendship_events' => 
    array (
      'label' => 'BuddyBoss: Friendship Events',
      'description' => 'BuddyBoss: Friendship Events',
      'creds' => '10',
      'addon' => 'mycred-buddyboss',
    ),
    'completing_buddyboss_group_events' => 
    array (
      'label' => 'BuddyBoss: Group Events',
      'description' => 'BuddyBoss: Group Events',
      'creds' => '10',
      'addon' => 'mycred-buddyboss',
    ),
    'completing_buddyboss_message_events' => 
    array (
      'label' => 'BuddyBoss: Message Events',
      'description' => 'BuddyBoss: Message Events',
      'creds' => '10',
      'addon' => 'mycred-buddyboss',
    ),
    'completing_buddyboss_profile_events' => 
    array (
      'label' => 'BuddyBoss: Profile Events',
      'description' => 'BuddyBoss: Profile Events',
      'creds' => '10',
      'addon' => 'mycred-buddyboss',
    ),
    'completing_h5p_content_general' => 
    array (
      'label' => 'Points for Completing H5P Content',
      'description' => 'Points for Completing H5P Content',
      'creds' => '10',
      'addon' => 'mycred-h5p',
    ),
    'completing_h5p_content_specific' => 
    array (
      'label' => 'Points for Completing H5P Specific Content',
      'description' => 'Points for Completing H5P Specific Content',
      'creds' => '10',
      'addon' => 'mycred-h5p',
    ),
    'contact_form7' => 
    array (
      'label' => 'Contact Form 7 Form Submissions',
      'description' => 'Points for successful CF7 submits.',
      'creds' => '10',
      'addon' => 'mycred',
    ),
    'courseware' => 
    array (
      'label' => 'Courseware',
      'description' => 'Courseware',
      'creds' => '10',
      'addon' => 'mycred-for-courseware',
    ),
    'deleted_content' => 
    array (
      'label' => 'Points for trashed content',
      'description' => 'Award or deduct when content is trashed. Repeats per public post type.',
      'creds' => '10',
      'addon' => 'mycred',
    ),
    'dokrateprofile' => 
    array (
      'label' => 'Dokan Rating Vendor Profile',
      'description' => 'Dokan Rating Vendor Profile',
      'creds' => '10',
      'addon' => 'mycred-dokan',
    ),
    'et_purchase_ticket' => 
    array (
      'label' => 'Event Tickets - Purchase Ticket',
      'description' => 'Event Tickets - Purchase Ticket',
      'creds' => '10',
      'addon' => 'mycred-event-tickets',
    ),
    'et_rsvp_confirm' => 
    array (
      'label' => 'Event Tickets - Confirm RSVP',
      'description' => 'Event Tickets - Confirm RSVP',
      'creds' => '10',
      'addon' => 'mycred-event-tickets',
    ),
    'eventsmanager' => 
    array (
      'label' => 'Events Manager',
      'description' => 'Events Manager',
      'creds' => '10',
      'addon' => 'mycred',
    ),
    'everestform_successful_submit_form' => 
    array (
      'label' => 'Form Submissions (Everest Form)',
      'description' => 'Form Submissions (Everest Form)',
      'creds' => '10',
      'addon' => 'mycred-everestform',
    ),
    'favorites_author' => 
    array (
      'label' => 'Favorites - Author Receives',
      'description' => 'Favorites - Author Receives',
      'creds' => '10',
      'addon' => 'mycred-favorites',
    ),
    'favorites_author_unfavorite' => 
    array (
      'label' => 'Favorites - Author Receives Unfavorite',
      'description' => 'Favorites - Author Receives Unfavorite',
      'creds' => '10',
      'addon' => 'mycred-favorites',
    ),
    'favorites_favorite' => 
    array (
      'label' => 'Favorites - User Favorites',
      'description' => 'Favorites - User Favorites',
      'creds' => '10',
      'addon' => 'mycred-favorites',
    ),
    'favorites_unfavorite' => 
    array (
      'label' => 'Favorites - User Unfavorites',
      'description' => 'Favorites - User Unfavorites',
      'creds' => '10',
      'addon' => 'mycred-favorites',
    ),
    'fluent_community_course_enrollment' => 
    array (
      'label' => 'Course Enrollment (Fluent Community)',
      'description' => 'Course Enrollment (Fluent Community)',
      'creds' => '10',
      'addon' => 'mycred-fluent-community',
    ),
    'fluent_support_agent_close_ticket' => 
    array (
      'label' => 'Fluent Support - Agent\'s Ticket Gets Closed',
      'description' => 'Fluent Support - Agent\'s Ticket Gets Closed',
      'creds' => '10',
      'addon' => 'mycred-fluent-support',
    ),
    'fluent_support_agent_reply' => 
    array (
      'label' => 'Fluent Support - Agent Reply',
      'description' => 'Fluent Support - Agent Reply',
      'creds' => '10',
      'addon' => 'mycred-fluent-support',
    ),
    'fluent_support_customer_close_ticket' => 
    array (
      'label' => 'Fluent Support - Customer\'s Ticket Gets Closed',
      'description' => 'Fluent Support - Customer\'s Ticket Gets Closed',
      'creds' => '10',
      'addon' => 'mycred-fluent-support',
    ),
    'fluent_support_customer_open_ticket' => 
    array (
      'label' => 'Fluent Support - Customer Opens New Ticket',
      'description' => 'Fluent Support - Customer Opens New Ticket',
      'creds' => '10',
      'addon' => 'mycred-fluent-support',
    ),
    'fluent_support_customer_reply' => 
    array (
      'label' => 'Fluent Support - Customer Reply',
      'description' => 'Fluent Support - Customer Reply',
      'creds' => '10',
      'addon' => 'mycred-fluent-support',
    ),
    'fluent_support_open_ticket' => 
    array (
      'label' => 'Fluent Support - Agents Opens or Gets Assigned to a New Ticket',
      'description' => 'Fluent Support - Agents Opens or Gets Assigned to a New Ticket',
      'creds' => '10',
      'addon' => 'mycred-fluent-support',
    ),
    'fluentbooking_successful_booking_complete' => 
    array (
      'label' => 'Compleing a Booking (Fluent Booking)',
      'description' => 'Compleing a Booking (Fluent Booking)',
      'creds' => '10',
      'addon' => 'mycred-fluentbooking',
    ),
    'fluentcart_order_full_refund' => 
    array (
      'label' => 'Order Fully Refunded (FluentCart)',
      'description' => 'Order Fully Refunded (FluentCart)',
      'creds' => '10',
      'addon' => 'mycred-fluent-cart',
    ),
    'fluentcart_order_partial_refund' => 
    array (
      'label' => 'Order Partially Refunded (FluentCart)',
      'description' => 'Order Partially Refunded (FluentCart)',
      'creds' => '10',
      'addon' => 'mycred-fluent-cart',
    ),
    'fluentcart_product_purchase' => 
    array (
      'label' => 'Product Purchase (FluentCart)',
      'description' => 'Product Purchase (FluentCart)',
      'creds' => '10',
      'addon' => 'mycred-fluent-cart',
    ),
    'fluentcart_subscription_activated' => 
    array (
      'label' => 'Subscription Activated (FluentCart)',
      'description' => 'Subscription Activated (FluentCart)',
      'creds' => '10',
      'addon' => 'mycred-fluent-cart',
    ),
    'fluentcart_subscription_cancelled' => 
    array (
      'label' => 'Subscription Cancelled (FluentCart)',
      'description' => 'Subscription Cancelled (FluentCart)',
      'creds' => '10',
      'addon' => 'mycred-fluent-cart',
    ),
    'fluentcart_subscription_renewed' => 
    array (
      'label' => 'Subscription Renewed (FluentCart)',
      'description' => 'Subscription Renewed (FluentCart)',
      'creds' => '10',
      'addon' => 'mycred-fluent-cart',
    ),
    'fluentcrm_contact_created' => 
    array (
      'label' => 'Contact Created (FluentCRM)',
      'description' => 'Contact Created (FluentCRM)',
      'creds' => '10',
      'addon' => 'mycred-fluentcrm',
    ),
    'fluentcrm_list_added' => 
    array (
      'label' => 'List Added (FluentCRM)',
      'description' => 'List Added (FluentCRM)',
      'creds' => '10',
      'addon' => 'mycred-fluentcrm',
    ),
    'fluentcrm_list_removed' => 
    array (
      'label' => 'List Removed (FluentCRM)',
      'description' => 'List Removed (FluentCRM)',
      'creds' => '10',
      'addon' => 'mycred-fluentcrm',
    ),
    'fluentcrm_tag_added' => 
    array (
      'label' => 'Tag Added (FluentCRM)',
      'description' => 'Tag Added (FluentCRM)',
      'creds' => '10',
      'addon' => 'mycred-fluentcrm',
    ),
    'fluentcrm_tag_removed' => 
    array (
      'label' => 'Tag Removed (FluentCRM)',
      'description' => 'Tag Removed (FluentCRM)',
      'creds' => '10',
      'addon' => 'mycred-fluentcrm',
    ),
    'fluentform_successful_submit_form' => 
    array (
      'label' => 'Form Submissions (Fluent Form)',
      'description' => 'Form Submissions (Fluent Form)',
      'creds' => '10',
      'addon' => 'mycred-fluentform',
    ),
    'frm_form_submit' => 
    array (
      'label' => 'Points for Forminator Forms',
      'description' => 'Points for Forminator Forms',
      'creds' => '10',
      'addon' => 'mycred-forminator',
    ),
    'frm_poll_submit' => 
    array (
      'label' => 'Points for Forminator Polls',
      'description' => 'Points for Forminator Polls',
      'creds' => '10',
      'addon' => 'mycred-forminator',
    ),
    'frm_quiz_submit' => 
    array (
      'label' => 'Points for Forminator Quizzes',
      'description' => 'Points for Forminator Quizzes',
      'creds' => '10',
      'addon' => 'mycred-forminator',
    ),
    'gdstars' => 
    array (
      'label' => 'GD Star Rating',
      'description' => 'GD Star Rating',
      'creds' => '10',
      'addon' => 'mycred-for-gd-star-rating',
    ),
    'geodirectory_category_added' => 
    array (
      'label' => 'GeoDirectory Category Added',
      'description' => 'GeoDirectory Category Added',
      'creds' => '10',
      'addon' => 'mycred-geodirectory',
    ),
    'geodirectory_place_added' => 
    array (
      'label' => 'GeoDirectory Place Added',
      'description' => 'GeoDirectory Place Added',
      'creds' => '10',
      'addon' => 'mycred-geodirectory',
    ),
    'geodirectory_review_posted' => 
    array (
      'label' => 'GeoDirectory Review Posted',
      'description' => 'GeoDirectory Review Posted',
      'creds' => '10',
      'addon' => 'mycred-geodirectory',
    ),
    'gravityform' => 
    array (
      'label' => 'GravityForms Submissions',
      'description' => 'Points for form submits.',
      'creds' => '10',
      'addon' => 'mycred',
    ),
    'gutenaform_successful_submit_form' => 
    array (
      'label' => 'Form Submission (Gutena Forms)',
      'description' => 'Form Submission (Gutena Forms)',
      'creds' => '10',
      'addon' => 'mycred-gutena-forms',
    ),
    'happyform_successful_submit_form' => 
    array (
      'label' => 'Form Submissions (Happyform)',
      'description' => 'Form Submissions (Happyform)',
      'creds' => '10',
      'addon' => 'mycred-happyform',
    ),
    'hook_bbpress' => 
    array (
      'label' => 'bbPress',
      'description' => 'Forums, topics, replies.',
      'creds' => '10',
      'addon' => 'mycred',
    ),
    'hook_bp_groups' => 
    array (
      'label' => 'BuddyPress: Groups',
      'description' => 'Group-related BuddyPress actions.',
      'creds' => '10',
      'addon' => 'mycred',
    ),
    'hook_bp_profile' => 
    array (
      'label' => 'BuddyPress: Members',
      'description' => 'Profile-related BuddyPress actions.',
      'creds' => '10',
      'addon' => 'mycred',
    ),
    'hook_complete_quiz_max_percentage_learndash' => 
    array (
      'label' => 'Complete Quiz with Maximum Percentage (LearnDash)',
      'description' => 'Complete Quiz with Maximum Percentage (LearnDash)',
      'creds' => '10',
      'addon' => 'mycred-learndash',
    ),
    'hook_complete_quiz_percentage_range_learndash' => 
    array (
      'label' => 'Complete Quiz Between Grades (LearnDash)',
      'description' => 'Complete Quiz Between Grades (LearnDash)',
      'creds' => '10',
      'addon' => 'mycred-learndash',
    ),
    'hook_completing_course_learndash' => 
    array (
      'label' => 'Completing a Course (Learndash)',
      'description' => 'Completing a Course (Learndash)',
      'creds' => '10',
      'addon' => 'mycred-learndash',
    ),
    'hook_completing_lesson_learndash' => 
    array (
      'label' => 'Completing a Lesson (Learndash)',
      'description' => 'Completing a Lesson (Learndash)',
      'creds' => '10',
      'addon' => 'mycred-learndash',
    ),
    'hook_completing_quiz_learndash' => 
    array (
      'label' => 'Completing a Quiz (LearnDash)',
      'description' => 'Completing a Quiz (LearnDash)',
      'creds' => '10',
      'addon' => 'mycred-learndash',
    ),
    'hook_completing_topic_learndash' => 
    array (
      'label' => 'Completing a Topic (Learndash)',
      'description' => 'Completing a Topic (Learndash)',
      'creds' => '10',
      'addon' => 'mycred-learndash',
    ),
    'hook_course_enrollment_learndash' => 
    array (
      'label' => 'Enrolling in a Course (LearnDash)',
      'description' => 'Enrolling in a Course (LearnDash)',
      'creds' => '10',
      'addon' => 'mycred-learndash',
    ),
    'hook_join_group_learndash' => 
    array (
      'label' => 'Join Group (LearnDash)',
      'description' => 'Join Group (LearnDash)',
      'creds' => '10',
      'addon' => 'mycred-learndash',
    ),
    'hook_jwplayer' => 
    array (
      'label' => 'Points for JW Player',
      'description' => 'Points for JW Player',
      'creds' => '10',
      'addon' => 'mycred-jwplayer',
    ),
    'hook_learndash' => 
    array (
      'label' => 'LearnDash',
      'description' => 'Combined hook. Also covers assignments. Dedicated hooks below award the same complete/fail events.',
      'creds' => '10',
      'addon' => 'mycred-learndash',
    ),
    'hook_quiz_failed_learndash' => 
    array (
      'label' => 'Failing at Quiz (LearnDash)',
      'description' => 'Failing at Quiz (LearnDash)',
      'creds' => '10',
      'addon' => 'mycred-learndash',
    ),
    'hook_simplepress' => 
    array (
      'label' => 'Simple:Press',
      'description' => 'Simple:Press',
      'creds' => '10',
      'addon' => 'mycred',
    ),
    'invite_anyone' => 
    array (
      'label' => 'Invite Anyone',
      'description' => 'Invite Anyone',
      'creds' => '10',
      'addon' => 'mycred',
    ),
    'jetform_successful_submit_form' => 
    array (
      'label' => 'Form Submissions (Jetformbuilder)',
      'description' => 'Form Submissions (Jetformbuilder)',
      'creds' => '10',
      'addon' => 'mycred-jetformbuilder',
    ),
    'jetpack' => 
    array (
      'label' => 'Jetpack',
      'description' => 'Jetpack',
      'creds' => '10',
      'addon' => 'mycred',
    ),
    'kaliform_successful_submit_form' => 
    array (
      'label' => 'Form Submissions (Kali Form)',
      'description' => 'Form Submissions (Kali Form)',
      'creds' => '10',
      'addon' => 'mycred-kaliform',
    ),
    'link_click' => 
    array (
      'label' => 'Points for clicking on links',
      'description' => 'Award clicks on [mycred_link] shortcode links.',
      'creds' => '10',
      'addon' => 'mycred',
    ),
    'logging_in' => 
    array (
      'label' => 'Points for logins',
      'description' => 'Award points for logging in.',
      'creds' => '10',
      'addon' => 'mycred',
    ),
    'meta_box_save_field_post' => 
    array (
      'label' => 'Meta Box - Save Specific Field (Post)',
      'description' => 'Meta Box - Save Specific Field (Post)',
      'creds' => '10',
      'addon' => 'mycred-meta-box',
    ),
    'meta_box_save_post' => 
    array (
      'label' => 'Meta Box - Save Any Meta Box (Post)',
      'description' => 'Meta Box - Save Any Meta Box (Post)',
      'creds' => '10',
      'addon' => 'mycred-meta-box',
    ),
    'meta_box_save_specific_post' => 
    array (
      'label' => 'Meta Box - Save Specific Meta Box (Post)',
      'description' => 'Meta Box - Save Specific Meta Box (Post)',
      'creds' => '10',
      'addon' => 'mycred-meta-box',
    ),
    'metform_successful_submit_form' => 
    array (
      'label' => 'Form Submissions (Metform)',
      'description' => 'Form Submissions (Metform)',
      'creds' => '10',
      'addon' => 'mycred-metform',
    ),
    'mycred_academylms_course' => 
    array (
      'label' => 'Courses (Academy LMS)',
      'description' => 'Courses (Academy LMS)',
      'creds' => '10',
      'addon' => 'mycred-academy-lms',
    ),
    'mycred_academylms_lesson' => 
    array (
      'label' => 'Lesson (Academy LMS)',
      'description' => 'Lesson (Academy LMS)',
      'creds' => '10',
      'addon' => 'mycred-academy-lms',
    ),
    'mycred_academylms_quiz' => 
    array (
      'label' => 'Quiz (Academy LMS)',
      'description' => 'Quiz (Academy LMS)',
      'creds' => '10',
      'addon' => 'mycred-academy-lms',
    ),
    'mycred_give_wp_multiple' => 
    array (
      'label' => 'Points for GiveWP Donation',
      'description' => 'Points for GiveWP Donation',
      'creds' => '10',
      'addon' => 'mycred-give-wp-addon',
    ),
    'mycred_lifterlms_achievement' => 
    array (
      'label' => 'LifterLMS: Achievements',
      'description' => 'LifterLMS: Achievements',
      'creds' => '10',
      'addon' => 'mycred-lifterlms',
    ),
    'mycred_lifterlms_certificate' => 
    array (
      'label' => 'LifterLMS: Certificates',
      'description' => 'LifterLMS: Certificates',
      'creds' => '10',
      'addon' => 'mycred-lifterlms',
    ),
    'mycred_lifterlms_course' => 
    array (
      'label' => 'LifterLMS: Courses',
      'description' => 'LifterLMS: Courses',
      'creds' => '10',
      'addon' => 'mycred-lifterlms',
    ),
    'mycred_lifterlms_lesson' => 
    array (
      'label' => 'LifterLMS: Lessons',
      'description' => 'LifterLMS: Lessons',
      'creds' => '10',
      'addon' => 'mycred-lifterlms',
    ),
    'mycred_lifterlms_membership' => 
    array (
      'label' => 'LifterLMS: Memberships',
      'description' => 'LifterLMS: Memberships',
      'creds' => '10',
      'addon' => 'mycred-lifterlms',
    ),
    'mycred_lifterlms_plan' => 
    array (
      'label' => 'LifterLMS: Plans / Products',
      'description' => 'LifterLMS: Plans / Products',
      'creds' => '10',
      'addon' => 'mycred-lifterlms',
    ),
    'mycred_lifterlms_quiz' => 
    array (
      'label' => 'LifterLMS: Quizes',
      'description' => 'LifterLMS: Quizes',
      'creds' => '10',
      'addon' => 'mycred-lifterlms',
    ),
    'mycred_lifterlms_section' => 
    array (
      'label' => 'LifterLMS: Sections',
      'description' => 'LifterLMS: Sections',
      'creds' => '10',
      'addon' => 'mycred-lifterlms',
    ),
    'mycred_masteriyolms_course' => 
    array (
      'label' => 'Courses (Masteriyo LMS)',
      'description' => 'Courses (Masteriyo LMS)',
      'creds' => '10',
      'addon' => 'mycred-masteriyo-lms',
    ),
    'mycred_masteriyolms_lesson' => 
    array (
      'label' => 'Lesson (Masteriyo LMS)',
      'description' => 'Lesson (Masteriyo LMS)',
      'creds' => '10',
      'addon' => 'mycred-masteriyo-lms',
    ),
    'mycred_masteriyolms_quiz' => 
    array (
      'label' => 'Quiz (Masteriyo LMS)',
      'description' => 'Quiz (Masteriyo LMS)',
      'creds' => '10',
      'addon' => 'mycred-masteriyo-lms',
    ),
    'mycred_masterstudylms_course' => 
    array (
      'label' => 'Courses (MasterStudyLMS)',
      'description' => 'Courses (MasterStudyLMS)',
      'creds' => '10',
      'addon' => 'mycred-masterstudylms',
    ),
    'mycred_masterstudylms_lesson' => 
    array (
      'label' => 'Lesson (MasterStudyLMS)',
      'description' => 'Lesson (MasterStudyLMS)',
      'creds' => '10',
      'addon' => 'mycred-masterstudylms',
    ),
    'mycred_masterstudylms_quiz' => 
    array (
      'label' => 'Quiz (MasterStudyLMS)',
      'description' => 'Quiz (MasterStudyLMS)',
      'creds' => '10',
      'addon' => 'mycred-masterstudylms',
    ),
    'mycred_pmp_cancel_membership' => 
    array (
      'label' => 'Points for cancel membership',
      'description' => 'Points for cancel membership',
      'creds' => '10',
      'addon' => 'mycred-paid-memberships-pro',
    ),
    'mycred_pmp_expired_membership' => 
    array (
      'label' => 'Points for expired membership',
      'description' => 'Points for expired membership',
      'creds' => '10',
      'addon' => 'mycred-paid-memberships-pro',
    ),
    'mycred_pmp_purchase_membership' => 
    array (
      'label' => 'Points for new purchase membership',
      'description' => 'Points for new purchase membership',
      'creds' => '10',
      'addon' => 'mycred-paid-memberships-pro',
    ),
    'mycred_pmp_renew_membership' => 
    array (
      'label' => 'Points for renew membership',
      'description' => 'Points for renew membership',
      'creds' => '10',
      'addon' => 'mycred-paid-memberships-pro',
    ),
    'mycred_points_cap' => 
    array (
      'label' => 'Cap For Points',
      'description' => 'Cap For Points',
      'creds' => '10',
      'addon' => 'mycred-points-cap',
    ),
    'mycred_senseilms_course' => 
    array (
      'label' => 'Courses (Sensei LMS)',
      'description' => 'Courses (Sensei LMS)',
      'creds' => '10',
      'addon' => 'mycred-senseilms',
    ),
    'mycred_senseilms_lesson' => 
    array (
      'label' => 'Lesson (Sensei LMS)',
      'description' => 'Lesson (Sensei LMS)',
      'creds' => '10',
      'addon' => 'mycred-senseilms',
    ),
    'mycred_senseilms_quiz' => 
    array (
      'label' => 'Quiz (Sensei LMS)',
      'description' => 'Quiz (Sensei LMS)',
      'creds' => '10',
      'addon' => 'mycred-senseilms',
    ),
    'mycred_zoom' => 
    array (
      'label' => 'Points for zoom meeting',
      'description' => 'Points for zoom meeting',
      'creds' => '10',
      'addon' => 'mycred-zoom-rewards',
    ),
    'play_pacman' => 
    array (
      'label' => 'Points for Playing Pacman',
      'description' => 'Points for Playing Pacman',
      'creds' => '10',
      'addon' => 'mycred-pacman',
    ),
    'pms_abandon_subscription' => 
    array (
      'label' => 'Paid Membership Subscriptions - Abandon Subscription',
      'description' => 'Paid Membership Subscriptions - Abandon Subscription',
      'creds' => '10',
      'addon' => 'mycred-paid-membership-subscriptions',
    ),
    'pms_cancel_subscription' => 
    array (
      'label' => 'Paid Membership Subscriptions - Cancel Subscription',
      'description' => 'Paid Membership Subscriptions - Cancel Subscription',
      'creds' => '10',
      'addon' => 'mycred-paid-membership-subscriptions',
    ),
    'pms_change_subscription' => 
    array (
      'label' => 'Paid Membership Subscriptions - Change Subscription',
      'description' => 'Paid Membership Subscriptions - Change Subscription',
      'creds' => '10',
      'addon' => 'mycred-paid-membership-subscriptions',
    ),
    'pms_payment_subscription' => 
    array (
      'label' => 'Paid Membership Subscriptions - Payment on Subscription',
      'description' => 'Paid Membership Subscriptions - Payment on Subscription',
      'creds' => '10',
      'addon' => 'mycred-paid-membership-subscriptions',
    ),
    'pms_purchase_subscription' => 
    array (
      'label' => 'Paid Membership Subscriptions - Purchase Subscription',
      'description' => 'Paid Membership Subscriptions - Purchase Subscription',
      'creds' => '10',
      'addon' => 'mycred-paid-membership-subscriptions',
    ),
    'pms_renewal_subscription' => 
    array (
      'label' => 'Paid Membership Subscriptions - Renew Subscription',
      'description' => 'Paid Membership Subscriptions - Renew Subscription',
      'creds' => '10',
      'addon' => 'mycred-paid-membership-subscriptions',
    ),
    'presto_player_video' => 
    array (
      'label' => 'Presto Player',
      'description' => 'Presto Player',
      'creds' => '10',
      'addon' => 'mycred-presto-player',
    ),
    'presto_player_video_percent' => 
    array (
      'label' => 'Presto Player - Video Percent',
      'description' => 'Presto Player - Video Percent',
      'creds' => '10',
      'addon' => 'mycred-presto-player',
    ),
    'presto_player_video_percent_range' => 
    array (
      'label' => 'Presto Player - Video Percent Range',
      'description' => 'Presto Player - Video Percent Range',
      'creds' => '10',
      'addon' => 'mycred-presto-player',
    ),
    'product_ratings' => 
    array (
      'label' => 'Dokan Vendor Review Product',
      'description' => 'Dokan Vendor Review Product',
      'creds' => '10',
      'addon' => 'mycred-dokan',
    ),
    'product_referral' => 
    array (
      'label' => 'Woocommerce Product Referral',
      'description' => 'Woocommerce Product Referral',
      'creds' => '10',
      'addon' => 'mycred-woocommerce-plus',
    ),
    'publishing_content' => 
    array (
      'label' => 'Points for publishing content',
      'description' => 'Award the author when a post/page (or other type) is published. Repeats per public post type.',
      'creds' => '10',
      'addon' => 'mycred',
    ),
    'rating-form' => 
    array (
      'label' => 'Rating Form',
      'description' => 'Rating Form',
      'creds' => '10',
      'addon' => 'mycred-for-rating-form',
    ),
    'registration' => 
    array (
      'label' => 'Points for registrations',
      'description' => 'Award points when a user registers.',
      'creds' => '10',
      'addon' => 'mycred',
    ),
    'rtmedia' => 
    array (
      'label' => 'rtMedia',
      'description' => 'rtMedia',
      'creds' => '10',
      'addon' => 'mycred',
    ),
    'simplyscheduleappointments_successful_booking_complete' => 
    array (
      'label' => 'Compleing a Booking (Simply Schedule Booking)',
      'description' => 'Compleing a Booking (Simply Schedule Booking)',
      'creds' => '10',
      'addon' => 'mycred-simply-schedule-appointments',
    ),
    'site_visit' => 
    array (
      'label' => 'Points for daily visits',
      'description' => 'Award points once per day for visiting the site.',
      'creds' => '10',
      'addon' => 'mycred',
    ),
    'social_follow' => 
    array (
      'label' => 'Points for Social Follow',
      'description' => 'Points for Social Follow',
      'creds' => '10',
      'addon' => 'mycred-social-shares',
    ),
    'social_share' => 
    array (
      'label' => 'Points for Social Share',
      'description' => 'Points for Social Share',
      'creds' => '10',
      'addon' => 'mycred-social-shares',
    ),
    'specific_field_specific_form' => 
    array (
      'label' => 'Submit: Specific Field Value on Specific Form (Ninja Forms)',
      'description' => 'Submit: Specific Field Value on Specific Form (Ninja Forms)',
      'creds' => '10',
      'addon' => 'mycred-ninjaforms',
    ),
    'specific_field_value' => 
    array (
      'label' => 'Submit: Specific Field Value (Ninja Forms)',
      'description' => 'Submit: Specific Field Value (Ninja Forms)',
      'creds' => '10',
      'addon' => 'mycred-ninjaforms',
    ),
    'specific_product' => 
    array (
      'label' => 'MemberPress: Purchase Subscription Product',
      'description' => 'MemberPress: Purchase Subscription Product',
      'creds' => '10',
      'addon' => 'mycred-memberpress',
    ),
    'studiocart_order_completion' => 
    array (
      'label' => 'StudioCart Order Completed',
      'description' => 'StudioCart Order Completed',
      'creds' => '10',
      'addon' => 'mycred-studiocart',
    ),
    'studiocart_purchase' => 
    array (
      'label' => 'StudioCart Purchase',
      'description' => 'StudioCart Purchase',
      'creds' => '10',
      'addon' => 'mycred-studiocart',
    ),
    'studiocart_refund' => 
    array (
      'label' => 'StudioCart Refund',
      'description' => 'StudioCart Refund',
      'creds' => '10',
      'addon' => 'mycred-studiocart',
    ),
    'studiocart_subscription_canceled' => 
    array (
      'label' => 'StudioCart Subscription Canceled',
      'description' => 'StudioCart Subscription Canceled',
      'creds' => '10',
      'addon' => 'mycred-studiocart',
    ),
    'successful_submit_form' => 
    array (
      'label' => 'Form Submissions (Formidable)',
      'description' => 'Form Submissions (Formidable)',
      'creds' => '10',
      'addon' => 'mycred-formidable',
    ),
    'successful_submit_ninjaform' => 
    array (
      'label' => 'Successful: Submit Form (Ninja Forms)',
      'description' => 'Successful: Submit Form (Ninja Forms)',
      'creds' => '10',
      'addon' => 'mycred-ninjaforms',
    ),
    'surecart_each_order' => 
    array (
      'label' => 'Points for each order (SureCart)',
      'description' => 'Points for each order (SureCart)',
      'creds' => '10',
      'addon' => 'mycred-surecart',
    ),
    'surecart_first_order' => 
    array (
      'label' => 'Points for first order (SureCart)',
      'description' => 'Points for first order (SureCart)',
      'creds' => '10',
      'addon' => 'mycred-surecart',
    ),
    'surecart_numbers_of_orders' => 
    array (
      'label' => 'Points for numbers of order (SureCart)',
      'description' => 'Points for numbers of order (SureCart)',
      'creds' => '10',
      'addon' => 'mycred-surecart',
    ),
    'surecart_order_range' => 
    array (
      'label' => 'Points for order range (SureCart)',
      'description' => 'Points for order range (SureCart)',
      'creds' => '10',
      'addon' => 'mycred-surecart',
    ),
    'sureform_successful_submit_form' => 
    array (
      'label' => 'Form Submissions (Sureform)',
      'description' => 'Form Submissions (Sureform)',
      'creds' => '10',
      'addon' => 'mycred-sureform',
    ),
    'tec_delete_event' => 
    array (
      'label' => 'Deleting an Event (The Events Calendar)',
      'description' => 'Deleting an Event (The Events Calendar)',
      'creds' => '10',
      'addon' => 'mycred-events-calendar',
    ),
    'tec_publish_event' => 
    array (
      'label' => 'Publishing a New Event (The Events Calendar)',
      'description' => 'Publishing a New Event (The Events Calendar)',
      'creds' => '10',
      'addon' => 'mycred-events-calendar',
    ),
    'totalpoll' => 
    array (
      'label' => 'TotalPoll',
      'description' => 'TotalPoll',
      'creds' => '10',
      'addon' => 'mycred-for-totalpoll',
    ),
    'totalsurvey' => 
    array (
      'label' => 'TotalSurvey',
      'description' => 'TotalSurvey',
      'creds' => '10',
      'addon' => 'mycred-for-totalsurvey',
    ),
    'tutor_lms_complete_courses' => 
    array (
      'label' => 'Completing a Course (Tutor LMS)',
      'description' => 'Completing a Course (Tutor LMS)',
      'creds' => '10',
      'addon' => 'mycred-tutor-lms',
    ),
    'tutor_lms_complete_lesson' => 
    array (
      'label' => 'Completing a Lesson (Tutor LMS)',
      'description' => 'Completing a Lesson (Tutor LMS)',
      'creds' => '10',
      'addon' => 'mycred-tutor-lms',
    ),
    'tutor_lms_complete_quiz' => 
    array (
      'label' => 'Completing a Quiz (Tutor LMS)',
      'description' => 'Completing a Quiz (Tutor LMS)',
      'creds' => '10',
      'addon' => 'mycred-tutor-lms',
    ),
    'tutor_lms_enroll_courses' => 
    array (
      'label' => 'Enrolling a Course (Tutor LMS)',
      'description' => 'Enrolling a Course (Tutor LMS)',
      'creds' => '10',
      'addon' => 'mycred-tutor-lms',
    ),
    'tutor_lms_fail_quiz' => 
    array (
      'label' => 'Failing a Quiz (Tutor LMS)',
      'description' => 'Failing a Quiz (Tutor LMS)',
      'creds' => '10',
      'addon' => 'mycred-tutor-lms',
    ),
    'tutor_lms_quiz_pass' => 
    array (
      'label' => 'Passing a Quiz (Tutor LMS)',
      'description' => 'Passing a Quiz (Tutor LMS)',
      'creds' => '10',
      'addon' => 'mycred-tutor-lms',
    ),
    'userpro_follow' => 
    array (
      'label' => 'User Pro: Following Users',
      'description' => 'User Pro: Following Users',
      'creds' => '10',
      'addon' => 'mycred-userpro',
    ),
    'userpro_message' => 
    array (
      'label' => 'User Pro: Messaging',
      'description' => 'User Pro: Messaging',
      'creds' => '10',
      'addon' => 'mycred-userpro',
    ),
    'userpro_verify' => 
    array (
      'label' => 'User Pro: Verification',
      'description' => 'User Pro: Verification',
      'creds' => '10',
      'addon' => 'mycred-userpro',
    ),
    'vendor_sales' => 
    array (
      'label' => 'Points for vendor sales',
      'description' => 'Points for vendor sales',
      'creds' => '10',
      'addon' => 'mycred-dokan',
    ),
    'video_view' => 
    array (
      'label' => 'Points for viewing Videos (Premium)',
      'description' => 'Points for viewing Videos (Premium)',
      'creds' => '10',
      'addon' => 'mycred-videos',
    ),
    'view_contents' => 
    array (
      'label' => 'Points for viewing content',
      'description' => 'Award viewer and optionally the author when a post/page is viewed. Repeats per public post type.',
      'creds' => '10',
      'addon' => 'mycred',
    ),
    'view_contents_specific' => 
    array (
      'label' => 'Points for viewing specific content (Member)',
      'description' => 'Award a logged-in viewer for selected posts.',
      'creds' => '10',
      'addon' => 'mycred',
    ),
    'view_contents_specific_author' => 
    array (
      'label' => 'Points for viewing specific content (Author)',
      'description' => 'Award the author when selected posts are viewed.',
      'creds' => '10',
      'addon' => 'mycred',
    ),
    'weforms_successful_submit_form' => 
    array (
      'label' => 'Form Submission (weForms)',
      'description' => 'Form Submission (weForms)',
      'creds' => '10',
      'addon' => 'mycred-weforms',
    ),
    'woocommerce_each_order' => 
    array (
      'label' => 'Points for each order (WooCommerce)',
      'description' => 'Points for each order (WooCommerce)',
      'creds' => '10',
      'addon' => 'mycred-woocommerce-plus',
    ),
    'woocommerce_first_order' => 
    array (
      'label' => 'Points for first order (WooCommerce)',
      'description' => 'Points for first order (WooCommerce)',
      'creds' => '10',
      'addon' => 'woocommerce',
    ),
    'woocommerce_numbers_of_orders' => 
    array (
      'label' => 'Points for numbers of order (WooCommerce)',
      'description' => 'Points for numbers of order (WooCommerce)',
      'creds' => '10',
      'addon' => 'mycred-woocommerce-plus',
    ),
    'woocommerce_order_range' => 
    array (
      'label' => 'Points for order range (WooCommerce)',
      'description' => 'Points for order range (WooCommerce)',
      'creds' => '10',
      'addon' => 'mycred-woocommerce-plus',
    ),
    'wooreview' => 
    array (
      'label' => 'WooCommerce Product Reviews',
      'description' => 'Points for product reviews.',
      'creds' => '10',
      'addon' => 'mycred',
    ),
    'wp_postratings' => 
    array (
      'label' => 'WP-PostRatings',
      'description' => 'WP-PostRatings',
      'creds' => '10',
      'addon' => 'mycred',
    ),
    'wp_ulike_like' => 
    array (
      'label' => 'WP Ulike - Like Anything',
      'description' => 'WP Ulike - Like Anything',
      'creds' => '10',
      'addon' => 'mycred-wp-ulike',
    ),
    'wp_ulike_post_like' => 
    array (
      'label' => 'WP Ulike - Like Post',
      'description' => 'WP Ulike - Like Post',
      'creds' => '10',
      'addon' => 'mycred-wp-ulike',
    ),
    'wpadverts_contact_author' => 
    array (
      'label' => 'WPAdverts - Contact Author',
      'description' => 'WPAdverts - Contact Author',
      'creds' => '10',
      'addon' => 'mycred-wpadverts',
    ),
    'wpadverts_publish_advert' => 
    array (
      'label' => 'WPAdverts - Publish Advert',
      'description' => 'WPAdverts - Publish Advert',
      'creds' => '10',
      'addon' => 'mycred-wpadverts',
    ),
    'wpadverts_publish_free_advert' => 
    array (
      'label' => 'WPAdverts - Publish Free Advert',
      'description' => 'WPAdverts - Publish Free Advert',
      'creds' => '10',
      'addon' => 'mycred-wpadverts',
    ),
    'wpadverts_publish_paid_advert' => 
    array (
      'label' => 'WPAdverts - Publish Paid Advert',
      'description' => 'WPAdverts - Publish Paid Advert',
      'creds' => '10',
      'addon' => 'mycred-wpadverts',
    ),
    'wpadverts_receive_message' => 
    array (
      'label' => 'WPAdverts - Author Receives Message',
      'description' => 'WPAdverts - Author Receives Message',
      'creds' => '10',
      'addon' => 'mycred-wpadverts',
    ),
    'wpadverts_renew_advert' => 
    array (
      'label' => 'WPAdverts - Renew Advert',
      'description' => 'WPAdverts - Renew Advert',
      'creds' => '10',
      'addon' => 'mycred-wpadverts',
    ),
    'wpfavorite' => 
    array (
      'label' => 'WP Favorite Posts',
      'description' => 'WP Favorite Posts',
      'creds' => '10',
      'addon' => 'mycred',
    ),
    'wppolls' => 
    array (
      'label' => 'WP-Polls',
      'description' => 'WP-Polls',
      'creds' => '10',
      'addon' => 'mycred',
    ),
    'wppostviews' => 
    array (
      'label' => 'WP-PostViews',
      'description' => 'WP-PostViews',
      'creds' => '10',
      'addon' => 'mycred-for-wp-postviews',
    ),
    'wptravel_successful_booking_complete' => 
    array (
      'label' => 'Compleing a Booking (WP Travel)',
      'description' => 'Compleing a Booking (WP Travel)',
      'creds' => '10',
      'addon' => 'mycred-wptravel',
    ),
    'wpum_avatar_change' => 
    array (
      'label' => 'WP User Manager: Change Avatar',
      'description' => 'WP User Manager: Change Avatar',
      'creds' => '10',
      'addon' => 'mycred-wp-user-manager',
    ),
    'wpum_avatar_remove' => 
    array (
      'label' => 'WP User Manager: Remove Avatar',
      'description' => 'WP User Manager: Remove Avatar',
      'creds' => '10',
      'addon' => 'mycred-wp-user-manager',
    ),
    'wpum_cover_change' => 
    array (
      'label' => 'WP User Manager: Change Cover',
      'description' => 'WP User Manager: Change Cover',
      'creds' => '10',
      'addon' => 'mycred-wp-user-manager',
    ),
    'wpum_update_bio' => 
    array (
      'label' => 'WP User Manager: Update Bio',
      'description' => 'WP User Manager: Update Bio',
      'creds' => '10',
      'addon' => 'mycred-wp-user-manager',
    ),
  ),
  'addons' => 
  array (
    'badge-editor' => 
    array (
      'label' => 'Badge Editor',
      'description' => 'Visual designer for custom badge artwork; own Badge Editor submenu (mycred-badge-editor); no point-type settings and no Hooks.',
      'source' => 'core',
    ),
    'badge-plus' => 
    array (
      'label' => 'Badge Plus',
      'description' => 'Upgraded badges with sequential requirements, max earning, open badges, and types; Badge Plus CPT plus Earners submenu; no General Settings and no Hooks.',
      'source' => 'core',
    ),
    'badges' => 
    array (
      'label' => 'Badges',
      'description' => 'Creates visual achievement badges (automatic or manual); General Settings control display (levels, earners, BuddyPress/bbPress); Badges CPT menu manages badges; no Hooks.',
      'source' => 'core',
    ),
    'banking' => 
    array (
      'label' => 'Central Deposit',
      'description' => 'Central bank account for adding/deducting points plus scheduled deposits; own Central Deposit menu (mycred-banking); no point-type General Settings and no Hooks.',
      'source' => 'core',
    ),
    'birthday' => 
    array (
      'label' => 'Birthdays',
      'description' => 'Awards or deducts points on a userâ€™s birthday via a Hook on each point typeâ€™s Hooks screen; no General Settings and no separate menu.',
      'source' => 'core',
    ),
    'buy-creds' => 
    array (
      'label' => 'buyCRED',
      'description' => 'Lets users buy points with real money; General Settings cover sale setup per point type, checkout, and thank-you pages; buyCred Gateways menu plus Pending Payments; includes a purchase Hook.',
      'source' => 'core',
    ),
    'cash-creds' => 
    array (
      'label' => 'cashCRED',
      'description' => 'Lets users withdraw points as cash; General Settings plus cashCred Gateways menu and Withdrawals CPT; no Hooks.',
      'source' => 'core',
    ),
    'coupons' => 
    array (
      'label' => 'Coupons',
      'description' => 'Coupon codes redeemable for points; General Settings hold log/messages; Coupons CPT menu to create codes; no Hooks.',
      'source' => 'core',
    ),
    'email-notices' => 
    array (
      'label' => 'Email Notices',
      'description' => 'Sends point-related emails to users or admins; General Settings cover HTML, sender, and templates; Email Notices CPT menu; no Hooks.',
      'source' => 'core',
    ),
    'gateway' => 
    array (
      'label' => 'Gateway',
      'description' => 'Uses points as payment in WP eCommerce, Event Espresso, and Events Manager (and legacy WooCommerce if the Woo add-on is off); gateway settings live in those plugins, not myCred General Settings; no own menu and no Hooks.',
      'source' => 'core',
    ),
    'mycred-2co' => 
    array (
      'label' => '2Checkout (buyCred)',
      'description' => 'Adds 2Checkout as a buyCred gateway; configured on the buyCred Gateways menu; no point-type settings and no Hooks.',
      'source' => 'toolkit-pro',
    ),
    'mycred-academy-lms' => 
    array (
      'label' => 'Academy LMS',
      'description' => 'Awards points for Academy LMS course, lesson, and quiz events via Hooks on each point type; no General Settings and no separate menu.',
      'source' => 'toolkit',
    ),
    'mycred-advanced-ads' => 
    array (
      'label' => 'Advanced Ads',
      'description' => 'Awards points for Advanced Ads events via Hooks on each point type; no General Settings and no separate menu.',
      'source' => 'toolkit',
    ),
    'mycred-anniversary-pro' => 
    array (
      'label' => 'Anniversary Pro',
      'description' => 'Awards anniversary points for consecutive or non-consecutive years via a Hook on each point type; no General Settings and no separate menu.',
      'source' => 'toolkit-pro',
    ),
    'mycred-anspress-integration' => 
    array (
      'label' => 'AnsPress',
      'description' => 'Awards points for AnsPress Q&A actions (ask, answer, vote, and related events) via Hooks; no General Settings and no separate menu.',
      'source' => 'toolkit',
    ),
    'mycred-arforms' => 
    array (
      'label' => 'ARForms',
      'description' => 'Awards points for ARForms submissions via Hooks on each point type; no General Settings and no separate menu.',
      'source' => 'toolkit',
    ),
    'mycred-asgaros-forum' => 
    array (
      'label' => 'Asgaros Forum',
      'description' => 'Asgaros Forum integration is incomplete in this build (assets only); no Hooks, settings, or menu are registered.',
      'source' => 'toolkit',
    ),
    'mycred-badgr' => 
    array (
      'label' => 'Badgr',
      'description' => 'Syncs myCred badges with Badgr; General Settings store admin email, tokens, and issuer IDs; no own menu and no Hooks.',
      'source' => 'toolkit',
    ),
    'mycred-beaver-builder' => 
    array (
      'label' => 'Beaver Builder',
      'description' => 'Adds myCred shortcodes as Beaver Builder modules; no myCred General Settings, no own menu, and no Hooks.',
      'source' => 'toolkit-pro',
    ),
    'mycred-birthday-plus' => 
    array (
      'label' => 'Birthday Plus',
      'description' => 'Enhanced birthday rewards via a Hook on each point typeâ€™s Hooks screen; no General Settings and no separate menu.',
      'source' => 'toolkit-pro',
    ),
    'mycred-bitform' => 
    array (
      'label' => 'Bit Form',
      'description' => 'Awards points for Bit Form submissions via a Hook on each point type; no General Settings and no separate menu.',
      'source' => 'toolkit',
    ),
    'mycred-bookify' => 
    array (
      'label' => 'Bookify',
      'description' => 'Awards points for Bookify bookings via a Hook on each point type; no General Settings and no separate menu.',
      'source' => 'toolkit',
    ),
    'mycred-bookingcalendar' => 
    array (
      'label' => 'Booking Calendar',
      'description' => 'Awards points for Booking Calendar bookings via a Hook on each point type; no General Settings and no separate menu.',
      'source' => 'toolkit',
    ),
    'mycred-bookingpress' => 
    array (
      'label' => 'BookingPress',
      'description' => 'Awards points for BookingPress appointments via a Hook on each point type; no General Settings and no separate menu.',
      'source' => 'toolkit',
    ),
    'mycred-bookly' => 
    array (
      'label' => 'Bookly',
      'description' => 'Awards points for Bookly appointments via a Hook on each point type; no General Settings and no separate menu.',
      'source' => 'toolkit',
    ),
    'mycred-booknetic' => 
    array (
      'label' => 'Booknetic',
      'description' => 'Awards points for Booknetic appointments via a Hook on each point type; no General Settings and no separate menu.',
      'source' => 'toolkit',
    ),
    'mycred-bp-charges' => 
    array (
      'label' => 'BuddyPress Charges',
      'description' => 'Charges points for selected BuddyPress actions; own BuddyPress Charges menu plus General Settings; no Hooks.',
      'source' => 'toolkit-pro',
    ),
    'mycred-bp-group-leaderboards' => 
    array (
      'label' => 'BP Group Leaderboards',
      'description' => 'Shows myCred leaderboards inside BuddyPress groups; Settings â†’ Leaderboards screen (bp-leaderboards); no point-type General Settings and no Hooks.',
      'source' => 'toolkit',
    ),
    'mycred-buddyboss' => 
    array (
      'label' => 'BuddyBoss',
      'description' => 'Rewards BuddyBoss activity (profile, messages, groups, friends, forums, events, invites, activity) via Hooks, and General Settings control showing points/badges/ranks on avatar, profile, activity, and forums; no separate menu.',
      'source' => 'toolkit',
    ),
    'mycred-cashcred-paypal' => 
    array (
      'label' => 'cashCred PayPal',
      'description' => 'PayPal payout gateway for cashCred withdrawals; configured on the cashCred Gateways menu; no point-type settings and no Hooks.',
      'source' => 'toolkit-pro',
    ),
    'mycred-cashcred-paystack' => 
    array (
      'label' => 'cashCred Paystack',
      'description' => 'Paystack payout gateway for cashCred withdrawals; configured on the cashCred Gateways menu; no point-type settings and no Hooks.',
      'source' => 'toolkit-pro',
    ),
    'mycred-cashcred-stripe' => 
    array (
      'label' => 'cashCred Stripe',
      'description' => 'Stripe payout gateway for cashCred withdrawals; configured on the cashCred Gateways menu; no point-type settings and no Hooks.',
      'source' => 'toolkit-pro',
    ),
    'mycred-coinbase' => 
    array (
      'label' => 'Coinbase (buyCred)',
      'description' => 'Adds Coinbase Commerce as a buyCred gateway; configured on the buyCred Gateways menu; no point-type settings and no Hooks.',
      'source' => 'toolkit-pro',
    ),
    'mycred-coinpayment' => 
    array (
      'label' => 'CoinPayments (buyCred)',
      'description' => 'Adds CoinPayments as a buyCred gateway; configured on the buyCred Gateways menu; no point-type settings and no Hooks.',
      'source' => 'toolkit-pro',
    ),
    'mycred-coupons-plus' => 
    array (
      'label' => 'Coupon Plus',
      'description' => 'Extends the Coupons CPT with bulk generate/import/export tools on the coupons screen; no extra General Settings and no Hooks.',
      'source' => 'toolkit-pro',
    ),
    'mycred-credly' => 
    array (
      'label' => 'Credly',
      'description' => 'Syncs myCred badges with Credly; General Settings hold access token and organization ID; no own menu and no Hooks.',
      'source' => 'toolkit',
    ),
    'mycred-daily-login-rewards' => 
    array (
      'label' => 'Daily Login Rewards',
      'description' => 'Creates login-streak reward calendars; Daily Login Rewards CPT menu (mycred-login-reward); no General Settings and no Hooks.',
      'source' => 'toolkit-pro',
    ),
    'mycred-dokan' => 
    array (
      'label' => 'Dokan',
      'description' => 'Awards points for Dokan vendor/marketplace events via Hooks; extra options appear in Dokan settings, not myCred General Settings; no separate myCred menu.',
      'source' => 'toolkit-pro',
    ),
    'mycred-ee' => 
    array (
      'label' => 'Event Espresso',
      'description' => 'Adds myCred as an Event Espresso payment gateway so tickets can be paid with points; settings live in Event Espresso, not myCred General Settings; no own menu and no Hooks.',
      'source' => 'toolkit',
    ),
    'mycred-email-digest' => 
    array (
      'label' => 'Email Digest',
      'description' => 'Sends scheduled point/activity digest emails; Email Digest CPT menu for creating and scheduling digests; no General Settings and no Hooks.',
      'source' => 'toolkit-pro',
    ),
    'mycred-email-plus' => 
    array (
      'label' => 'Email Plus',
      'description' => 'Extends Email Notices with extra templates and delivery options on the Email Notices CPT; no extra General Settings and no Hooks.',
      'source' => 'toolkit-pro',
    ),
    'mycred-event-tickets' => 
    array (
      'label' => 'Event Tickets',
      'description' => 'Awards points for Event Tickets purchases/attendance via Hooks on each point type; no General Settings and no separate menu.',
      'source' => 'toolkit',
    ),
    'mycred-events-calendar' => 
    array (
      'label' => 'The Events Calendar',
      'description' => 'Awards points for The Events Calendar events via Hooks on each point type; no General Settings and no separate menu.',
      'source' => 'toolkit',
    ),
    'mycred-everestform' => 
    array (
      'label' => 'Everest Forms',
      'description' => 'Awards points for Everest Forms submissions via a Hook on each point type; no General Settings and no separate menu.',
      'source' => 'toolkit',
    ),
    'mycred-expiration-addon' => 
    array (
      'label' => 'Expiration',
      'description' => 'Expires unused point balances after a set period so members spend or re-earn points instead of holding a stagnant balance; creates urgency that supports loyalty, repeat activity, and an active rewards currency. Point-type settings plus an expiration Hook; General Settings include the expiry display format; no separate menu.',
      'source' => 'toolkit-pro',
    ),
    'mycred-favorites' => 
    array (
      'label' => 'Favorites',
      'description' => 'Awards points for favoriting content via Hooks on each point type; no General Settings and no separate menu.',
      'source' => 'toolkit',
    ),
    'mycred-fluent-cart' => 
    array (
      'label' => 'FluentCart',
      'description' => 'Awards points for FluentCart orders (including first/repeat/range style rewards) via Hooks; no General Settings and no separate menu.',
      'source' => 'toolkit',
    ),
    'mycred-fluent-community' => 
    array (
      'label' => 'FluentCommunity',
      'description' => 'Awards points for FluentCommunity actions via a Hook on each point type; no General Settings and no separate menu.',
      'source' => 'toolkit',
    ),
    'mycred-fluent-support' => 
    array (
      'label' => 'Fluent Support',
      'description' => 'Awards points for Fluent Support ticket events via Hooks on each point type; no General Settings and no separate menu.',
      'source' => 'toolkit',
    ),
    'mycred-fluentbooking' => 
    array (
      'label' => 'Fluent Booking',
      'description' => 'Awards points for Fluent Booking appointments via a Hook on each point type; no General Settings and no separate menu.',
      'source' => 'toolkit',
    ),
    'mycred-fluentcrm' => 
    array (
      'label' => 'FluentCRM',
      'description' => 'Awards points for FluentCRM contact/automation events via Hooks on each point type; no General Settings and no separate menu.',
      'source' => 'toolkit',
    ),
    'mycred-fluentform' => 
    array (
      'label' => 'Fluent Forms',
      'description' => 'Awards points for Fluent Forms submissions via a Hook on each point type; no General Settings and no separate menu.',
      'source' => 'toolkit',
    ),
    'mycred-for-buddypress-compliments' => 
    array (
      'label' => 'BuddyPress Compliments',
      'description' => 'Awards points when users send BuddyPress Compliments via a Hook on each point type; no General Settings and no separate menu.',
      'source' => 'toolkit',
    ),
    'mycred-for-courseware' => 
    array (
      'label' => 'Courseware',
      'description' => 'Awards points for WP Courseware completions via a Hook on each point type; no General Settings and no separate menu.',
      'source' => 'toolkit',
    ),
    'mycred-for-events-manager-pro' => 
    array (
      'label' => 'Events Manager Pro',
      'description' => 'Adds myCred as an Events Manager Pro payment gateway for tickets; settings live in Events Manager gateways, not myCred General Settings; no own menu and no Hooks.',
      'source' => 'toolkit',
    ),
    'mycred-for-gd-star-rating' => 
    array (
      'label' => 'GD Star Rating',
      'description' => 'Awards points for GD Star Rating votes via a Hook on each point type; no General Settings and no separate menu.',
      'source' => 'toolkit',
    ),
    'mycred-for-rating-form' => 
    array (
      'label' => 'Rating Form',
      'description' => 'Awards points for Rating Form submissions via a Hook on each point type; no General Settings and no separate menu.',
      'source' => 'toolkit',
    ),
    'mycred-for-totalpoll' => 
    array (
      'label' => 'TotalPoll',
      'description' => 'Awards points for TotalPoll votes via a Hook on each point type; no General Settings and no separate menu.',
      'source' => 'toolkit',
    ),
    'mycred-for-totalsurvey' => 
    array (
      'label' => 'TotalSurvey',
      'description' => 'Awards points for TotalSurvey completions via a Hook on each point type; no General Settings and no separate menu.',
      'source' => 'toolkit',
    ),
    'mycred-for-wp-postviews' => 
    array (
      'label' => 'WP-PostViews',
      'description' => 'Awards points for post views tracked by WP-PostViews via a Hook on each point type; no General Settings and no separate menu.',
      'source' => 'toolkit',
    ),
    'mycred-formidable' => 
    array (
      'label' => 'Formidable Forms',
      'description' => 'Awards points for Formidable Forms submissions via a Hook on each point type; no General Settings and no separate menu.',
      'source' => 'toolkit',
    ),
    'mycred-forminator' => 
    array (
      'label' => 'Forminator',
      'description' => 'Awards points for Forminator submissions (including field-value variants) via Hooks on each point type; no General Settings and no separate menu.',
      'source' => 'toolkit',
    ),
    'mycred-formmaker' => 
    array (
      'label' => 'Form Maker',
      'description' => 'Awards points for Form Maker submissions via a Hook on each point type; no General Settings and no separate menu.',
      'source' => 'toolkit',
    ),
    'mycred-gamipress-importer' => 
    array (
      'label' => 'GamiPress Importer',
      'description' => 'Migrates GamiPress points, logs, achievements, and ranks into myCred; importer UI sits on the point-type Settings page; no Hooks and no separate menu.',
      'source' => 'toolkit',
    ),
    'mycred-gateway-edd' => 
    array (
      'label' => 'Easy Digital Downloads',
      'description' => 'Adds myCred as an EDD payment gateway and can reward EDD purchases; settings live in EDD â†’ Settings â†’ Gateways; no myCred General Settings and no Hooks.',
      'source' => 'toolkit-pro',
    ),
    'mycred-geodirectory' => 
    array (
      'label' => 'GeoDirectory',
      'description' => 'Awards points for GeoDirectory listing events via Hooks on each point type; no General Settings and no separate menu.',
      'source' => 'toolkit',
    ),
    'mycred-github' => 
    array (
      'label' => 'GitHub',
      'description' => 'Awards points for approved GitHub pull requests; General Settings store GitHub App client ID/secret; GitHub submenu configures token and repositories; one approved-PR Hook.',
      'source' => 'toolkit',
    ),
    'mycred-give-wp-addon' => 
    array (
      'label' => 'GiveWP',
      'description' => 'Awards points for GiveWP donations via a Hook on each point type; no General Settings and no separate menu.',
      'source' => 'toolkit',
    ),
    'mycred-gravity-form-booking' => 
    array (
      'label' => 'Gravity Form Booking',
      'description' => 'Awards points for Gravity Forms Booking submissions via a Hook on each point type; no General Settings and no separate menu.',
      'source' => 'toolkit',
    ),
    'mycred-gutena-forms' => 
    array (
      'label' => 'Gutena Forms',
      'description' => 'Awards points for Gutena Forms submissions via a Hook on each point type; no General Settings and no separate menu.',
      'source' => 'toolkit',
    ),
    'mycred-h5p' => 
    array (
      'label' => 'H5P',
      'description' => 'Awards points for completing H5P content via Hooks on each point type; no General Settings and no separate menu.',
      'source' => 'toolkit',
    ),
    'mycred-happyform' => 
    array (
      'label' => 'HappyForms',
      'description' => 'Awards points for HappyForms submissions via a Hook on each point type; no General Settings and no separate menu.',
      'source' => 'toolkit',
    ),
    'mycred-jetformbuilder' => 
    array (
      'label' => 'JetFormBuilder',
      'description' => 'Awards points for JetFormBuilder submissions via a Hook on each point type; no General Settings and no separate menu.',
      'source' => 'toolkit',
    ),
    'mycred-jwplayer' => 
    array (
      'label' => 'JW Player',
      'description' => 'Awards points for watching JW Player videos via a Hook on each point type; no General Settings and no separate menu.',
      'source' => 'toolkit-pro',
    ),
    'mycred-kaliform' => 
    array (
      'label' => 'Kali Forms',
      'description' => 'Awards points for Kali Forms submissions via a Hook on each point type; no General Settings and no separate menu.',
      'source' => 'toolkit',
    ),
    'mycred-learndash' => 
    array (
      'label' => 'LearnDash',
      'description' => 'Awards points for LearnDash course, lesson, topic, quiz, enrollment, and group events via Hooks; also adds a Leaderboard CPT menu; no General Settings.',
      'source' => 'toolkit',
    ),
    'mycred-learndash-points-importer' => 
    array (
      'label' => 'LearnDash Points Importer',
      'description' => 'Imports LearnDash points into myCred; importer UI sits on the point-type Settings page; no Hooks and no separate menu.',
      'source' => 'toolkit',
    ),
    'mycred-level-cred' => 
    array (
      'label' => 'LevelCred',
      'description' => 'Limits which Hooks fire by user role, rank, or badge level; point-type Settings control the restriction mode; no own menu and no extra Hooks.',
      'source' => 'toolkit-pro',
    ),
    'mycred-lifterlms' => 
    array (
      'label' => 'LifterLMS',
      'description' => 'Awards points for LifterLMS course, lesson, section, quiz, membership, plan, achievement, and certificate events via Hooks, plus a LifterLMS points payment gateway; no myCred General Settings and no separate myCred menu.',
      'source' => 'toolkit',
    ),
    'mycred-masteriyo-lms' => 
    array (
      'label' => 'Masteriyo LMS',
      'description' => 'Awards points for Masteriyo course, lesson, and quiz events via Hooks on each point type; no General Settings and no separate menu.',
      'source' => 'toolkit',
    ),
    'mycred-masterstudylms' => 
    array (
      'label' => 'MasterStudy LMS',
      'description' => 'Awards points for MasterStudy course, lesson, and quiz events via Hooks on each point type; no General Settings and no separate menu.',
      'source' => 'toolkit',
    ),
    'mycred-memberpress' => 
    array (
      'label' => 'MemberPress',
      'description' => 'Awards points for MemberPress membership events via Hooks on each point type; no General Settings and no separate menu.',
      'source' => 'toolkit',
    ),
    'mycred-meta-box' => 
    array (
      'label' => 'Meta Box',
      'description' => 'Awards points when Meta Box posts are saved (any post, specific post, or field value) via Hooks on each point type; no General Settings and no separate menu.',
      'source' => 'toolkit',
    ),
    'mycred-metform' => 
    array (
      'label' => 'MetForm',
      'description' => 'Awards points for MetForm submissions via a Hook on each point type; no General Settings and no separate menu.',
      'source' => 'toolkit',
    ),
    'mycred-ninjaforms' => 
    array (
      'label' => 'Ninja Forms',
      'description' => 'Awards points for Ninja Forms submissions (including field-value variants) via Hooks on each point type; no General Settings and no separate menu.',
      'source' => 'toolkit',
    ),
    'mycred-nominations' => 
    array (
      'label' => 'Nominations',
      'description' => 'Lets users nominate others for points, badges, or ranks; Nominations CPT menu; no General Settings and no Hooks.',
      'source' => 'toolkit-pro',
    ),
    'mycred-notice-plus' => 
    array (
      'label' => 'Notifications Plus',
      'description' => 'Instant rank/badge notifications; General Settings for position, padding, and delivery type; uses a notify-plus CPT; no Hooks.',
      'source' => 'toolkit-pro',
    ),
    'mycred-pacman' => 
    array (
      'label' => 'Pacman',
      'description' => 'Pacman arcade that awards points for play; General Settings (stored in pacman_settings) cover lives, colors, popup/page, and high scores; one play Hook; no separate menu.',
      'source' => 'toolkit-pro',
    ),
    'mycred-paid-membership-subscriptions' => 
    array (
      'label' => 'Paid Member Subscriptions',
      'description' => 'Awards points for Paid Member Subscriptions events via Hooks on each point type; no General Settings and no separate menu.',
      'source' => 'toolkit',
    ),
    'mycred-paid-memberships-pro' => 
    array (
      'label' => 'Paid Memberships Pro',
      'description' => 'Awards points for Paid Memberships Pro membership events via Hooks on each point type; no General Settings and no separate menu.',
      'source' => 'toolkit',
    ),
    'mycred-payfast' => 
    array (
      'label' => 'PayFast (buyCred)',
      'description' => 'Adds PayFast as a buyCred gateway; configured on the buyCred Gateways menu; no point-type settings and no Hooks.',
      'source' => 'toolkit-pro',
    ),
    'mycred-paymentwall' => 
    array (
      'label' => 'Paymentwall (buyCred)',
      'description' => 'Adds Paymentwall as a buyCred gateway; configured on the buyCred Gateways menu; no point-type settings and no Hooks.',
      'source' => 'toolkit-pro',
    ),
    'mycred-paystack' => 
    array (
      'label' => 'Paystack (buyCred)',
      'description' => 'Adds Paystack as a buyCred gateway; configured on the buyCred Gateways menu; no point-type settings and no Hooks.',
      'source' => 'toolkit-pro',
    ),
    'mycred-pending-points' => 
    array (
      'label' => 'Pending Points',
      'description' => 'Holds Hook awards as pending until an admin releases them; point-type Settings plus a Pending Points review menu; no extra Hooks.',
      'source' => 'toolkit-pro',
    ),
    'mycred-points-cap' => 
    array (
      'label' => 'Points Cap',
      'description' => 'Caps how many points a user can earn (daily/weekly/monthly/lifetime) via a Hook on each point type; no General Settings and no separate menu.',
      'source' => 'toolkit-pro',
    ),
    'mycred-presto-player' => 
    array (
      'label' => 'Presto Player',
      'description' => 'Awards points for watching Presto Player videos via Hooks on each point type; no General Settings and no separate menu.',
      'source' => 'toolkit',
    ),
    'mycred-progress-bar' => 
    array (
      'label' => 'Progress Bar',
      'description' => 'Front-end shortcodes for rank/badge progress bars; no General Settings, no own menu, and no Hooks.',
      'source' => 'toolkit-pro',
    ),
    'mycred-progress-map' => 
    array (
      'label' => 'Progress Map',
      'description' => 'Visual timeline of badge progress; General Settings for colors, direction, alignment, and visible items; no own menu and no Hooks.',
      'source' => 'toolkit-pro',
    ),
    'mycred-reset-points' => 
    array (
      'label' => 'Reset Points',
      'description' => 'Resets user balances by role from a panel on the point-type Settings page; no own menu and no Hooks.',
      'source' => 'toolkit-pro',
    ),
    'mycred-rest' => 
    array (
      'label' => 'REST API',
      'description' => 'Exposes myCred via REST; Settings (API key and URL, stored in mycred_rest_api) appear on the point-type Settings page; no own menu and no Hooks.',
      'source' => 'toolkit-pro',
    ),
    'mycred-retro' => 
    array (
      'label' => 'Retro',
      'description' => 'Retroactively awards points for existing users, content, and comments via WordPress importers; no General Settings, no own menu, and no Hooks.',
      'source' => 'toolkit',
    ),
    'mycred-robokassa' => 
    array (
      'label' => 'Robokassa (buyCred)',
      'description' => 'Adds Robokassa as a buyCred gateway; configured on the buyCred Gateways menu; no point-type settings and no Hooks.',
      'source' => 'toolkit-pro',
    ),
    'mycred-senseilms' => 
    array (
      'label' => 'Sensei LMS',
      'description' => 'Awards points for Sensei LMS course, lesson, and quiz events via Hooks on each point type; no General Settings and no separate menu.',
      'source' => 'toolkit',
    ),
    'mycred-simple-pay-integration' => 
    array (
      'label' => 'WP Simple Pay',
      'description' => 'Awards points for WP Simple Pay payments via a Hook on each point type; no General Settings and no separate menu.',
      'source' => 'toolkit',
    ),
    'mycred-simply-schedule-appointments' => 
    array (
      'label' => 'Simply Schedule Appointments',
      'description' => 'Awards points for Simply Schedule Appointments bookings via a Hook on each point type; no General Settings and no separate menu.',
      'source' => 'toolkit',
    ),
    'mycred-sms-payments' => 
    array (
      'label' => 'SMS Payments',
      'description' => 'Lets users check balances and transfer points by SMS (Twilio); General Settings hold Twilio credentials and transfer rules; no own menu and no Hooks.',
      'source' => 'toolkit-pro',
    ),
    'mycred-social-proof' => 
    array (
      'label' => 'Social Proof',
      'description' => 'Live popups of recent point activity; settings on the point-type Settings page (enable, timing, theme, references); no own menu and no Hooks.',
      'source' => 'toolkit-pro',
    ),
    'mycred-social-shares' => 
    array (
      'label' => 'Social Share',
      'description' => 'Awards points when users share content; own Social Shares settings menu plus a share Hook; no point-type General Settings.',
      'source' => 'toolkit-pro',
    ),
    'mycred-square' => 
    array (
      'label' => 'Square (buyCred)',
      'description' => 'Adds Square as a buyCred payment gateway; configured on the buyCred Gateways menu; no point-type settings and no Hooks.',
      'source' => 'toolkit',
    ),
    'mycred-stripe' => 
    array (
      'label' => 'Stripe (buyCred)',
      'description' => 'Adds Stripe as a buyCred gateway; configured on the buyCred Gateways menu; no point-type settings and no Hooks.',
      'source' => 'toolkit-pro',
    ),
    'mycred-studiocart' => 
    array (
      'label' => 'Studiocart',
      'description' => 'Awards or deducts points for Studiocart orders, refunds, and subscription cancellations via Hooks; no General Settings and no separate menu.',
      'source' => 'toolkit',
    ),
    'mycred-submission' => 
    array (
      'label' => 'Submissions',
      'description' => 'Users submit work for admin review to earn rewards; Submissions CPT menu; no General Settings and no Hooks.',
      'source' => 'toolkit-pro',
    ),
    'mycred-surecart' => 
    array (
      'label' => 'SureCart',
      'description' => 'Awards points for SureCart orders (each, first, number of orders, order range) via Hooks; no General Settings and no separate menu.',
      'source' => 'toolkit',
    ),
    'mycred-sureform' => 
    array (
      'label' => 'SureForm',
      'description' => 'Awards points for SureForm submissions via a Hook on each point type; no General Settings and no separate menu.',
      'source' => 'toolkit',
    ),
    'mycred-time-based-reward' => 
    array (
      'label' => 'Time Based Reward',
      'description' => 'Claimable rewards that unlock after a wait; Time Based Reward CPT menu; no General Settings and no Hooks.',
      'source' => 'toolkit-pro',
    ),
    'mycred-todo-list' => 
    array (
      'label' => 'ToDo List',
      'description' => 'Task lists users mark complete for points; ToDo List and Sequence CPT menus; no General Settings and no Hooks.',
      'source' => 'toolkit-pro',
    ),
    'mycred-transfer-plus' => 
    array (
      'label' => 'Transfer Plus',
      'description' => 'Extends Transfers with extra rules and pending transfers; General Settings plus a pending_transfer CPT; no Hooks.',
      'source' => 'toolkit-pro',
    ),
    'mycred-tutor-lms' => 
    array (
      'label' => 'Tutor LMS',
      'description' => 'Awards points for Tutor LMS enroll, complete course/lesson/quiz, and pass/fail quiz via Hooks on each point type; no General Settings and no separate menu.',
      'source' => 'toolkit',
    ),
    'mycred-userpro' => 
    array (
      'label' => 'UserPro',
      'description' => 'Shows points/ranks/badges on UserPro profiles and awards profile actions via Hooks; General Settings for display; no separate menu.',
      'source' => 'toolkit-pro',
    ),
    'mycred-usersultra' => 
    array (
      'label' => 'Users Ultra',
      'description' => 'Awards or charges points for Users Ultra community actions via Hooks, with General Settings for the integration; no separate menu.',
      'source' => 'toolkit-pro',
    ),
    'mycred-vc' => 
    array (
      'label' => 'WPBakery Page Builder',
      'description' => 'Adds myCred shortcodes to the WPBakery / Visual Composer element list; no General Settings, no own menu, and no Hooks.',
      'source' => 'toolkit-pro',
    ),
    'mycred-videos' => 
    array (
      'label' => 'Video (Vimeo)',
      'description' => 'Awards points for watching Vimeo videos via a Hook on each point type; no General Settings and no separate menu.',
      'source' => 'toolkit-pro',
    ),
    'mycred-weforms' => 
    array (
      'label' => 'weForms',
      'description' => 'Awards points for weForms submissions via a Hook on each point type; no General Settings and no separate menu.',
      'source' => 'toolkit',
    ),
    'mycred-wepay' => 
    array (
      'label' => 'WePay (buyCred)',
      'description' => 'Adds WePay as a buyCred gateway; configured on the buyCred Gateways menu; no point-type settings and no Hooks.',
      'source' => 'toolkit-pro',
    ),
    'mycred-wheel-of-fortune' => 
    array (
      'label' => 'Spin Wheel',
      'description' => 'Fortune wheel that awards points for spins; Spin Wheel CPT (mycred_fortunewheels) plus stats; no General Settings and no Hooks.',
      'source' => 'toolkit-pro',
    ),
    'mycred-woocommerce-plus' => 
    array (
      'label' => 'WooCommerce Plus',
      'description' => 'Advanced WooCommerce rewards (partial payment, rank discounts, product rewards, AutomateWoo triggers); point-type settings plus WooCommerce Plus modules and extra order Hooks.',
      'source' => 'toolkit-pro',
    ),
    'mycred-wp-ulike' => 
    array (
      'label' => 'WP ULike',
      'description' => 'Awards points for WP ULike likes on posts and content via Hooks on each point type; no General Settings and no separate menu.',
      'source' => 'toolkit',
    ),
    'mycred-wp-user-manager' => 
    array (
      'label' => 'WP User Manager',
      'description' => 'Awards points for WP User Manager avatar, cover, and profile updates via Hooks on each point type; no General Settings and no separate menu.',
      'source' => 'toolkit',
    ),
    'mycred-wpadverts' => 
    array (
      'label' => 'WPAdverts',
      'description' => 'Awards points for publishing, renewing, messaging, and contacting via WPAdverts Hooks on each point type; no General Settings and no separate menu.',
      'source' => 'toolkit',
    ),
    'mycred-wpforms' => 
    array (
      'label' => 'WPForms',
      'description' => 'Awards points for WPForms submissions, specific field values, and field values on a specific form via Hooks; no General Settings and no separate menu.',
      'source' => 'toolkit',
    ),
    'mycred-wptravel' => 
    array (
      'label' => 'WP Travel',
      'description' => 'Awards points for completing WP Travel bookings via a Hook on each point type; no General Settings and no separate menu.',
      'source' => 'toolkit',
    ),
    'mycred-wsform' => 
    array (
      'label' => 'WS Form',
      'description' => 'Awards points for WS Form submissions and specific field values via Hooks on each point type; no General Settings and no separate menu.',
      'source' => 'toolkit',
    ),
    'mycred-zapier' => 
    array (
      'label' => 'Zapier',
      'description' => 'Connects myCred events to Zapier; General Settings hold the Zapier API key; no own menu and no Hooks.',
      'source' => 'toolkit',
    ),
    'mycred-zoom-rewards' => 
    array (
      'label' => 'Zoom Rewards',
      'description' => 'Awards points for Zoom meeting attendance via a Hook on each point type; no General Settings and no separate menu.',
      'source' => 'toolkit',
    ),
    'notifications' => 
    array (
      'label' => 'Notifications',
      'description' => 'Front-end popups when points change; General Settings for template, lifetime, duration, and CSS; no own menu and no Hooks.',
      'source' => 'core',
    ),
    'rank-plus' => 
    array (
      'label' => 'Rank Plus',
      'description' => 'Multi-type ranks with requirements, default rank, and priority; Rank Plus CPT plus Earners submenu; no General Settings and no Hooks.',
      'source' => 'core',
    ),
    'ranks' => 
    array (
      'label' => 'Ranks',
      'description' => 'Assigns ranks from current or total balance; point-type settings for rank base, order, and BuddyPress/bbPress display; Ranks CPT menu; no Hooks.',
      'source' => 'core',
    ),
    'sell-content' => 
    array (
      'label' => 'Sell Content',
      'description' => 'Sells post/page access for points; General Settings plus per-point-type price/expiry/profit-share and per-post-type filters; no own menu and no Hooks.',
      'source' => 'core',
    ),
    'stats' => 
    array (
      'label' => 'Statistics',
      'description' => 'Turns log data into charts; point-type settings for colors, animation, and caching; no own menu and no Hooks.',
      'source' => 'core',
    ),
    'transfer' => 
    array (
      'label' => 'Transfers',
      'description' => 'Lets users send points to each other; General Settings for allowed types, limits, and templates; no own menu and no Hooks.',
      'source' => 'core',
    ),
    'woocommerce' => 
    array (
      'label' => 'WooCommerce',
      'description' => 'Pay WooCommerce orders with points and reward purchases; own WooCommerce menu for reward settings plus a Woo payment gateway; four order Hooks (each, first, number of orders, order range).',
      'source' => 'core',
    ),
  ),
);
