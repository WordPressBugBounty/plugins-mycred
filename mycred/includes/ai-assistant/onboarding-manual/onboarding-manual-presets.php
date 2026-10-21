<?php
/**
 * Hardcoded Manual Setup maps (website type, platform, goal).
 * Not used by AI onboarding.
 *
 * Three axes:
 * - platforms: integration slug is always recommended. `also` = extra required companions
 *   (Dokan). `extra` = companion add-ons (WooCommerce Plus) when their hooks match the
 *   goal. `include_ids` = core/external hooks that belong to that platform
 *   (wooreview, BuddyPress, Events Manager, Gravity Forms). `checkout` only if the
 *   platform has a points payment gateway.
 * - site_types: optional hook-less core add-ons (badges / ranks / notifications).
 * - goals: hook roles plus hook-less add-ons (coupons, sell-content, transfer, ranks).
 *   Platform-tagged rows only appear on those integrations.
 *   Do not list a platform slug here — that comes from the platform axis.
 *
 * @package myCred
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$addon = function ( $slug, $priority, $reason, $platforms = array() ) {
	$row = array(
		'slug'     => $slug,
		'priority' => $priority,
		'reason'   => $reason,
	);
	if ( ! empty( $platforms ) ) {
		$row['platforms'] = $platforms;
	}
	return $row;
};

$woo = array( 'woocommerce', 'dokan' );

return array(
	'platforms'  => array(
		'woocommerce'     => array( 'slug' => 'woocommerce', 'extra' => array( 'mycred-woocommerce-plus' ), 'include_ids' => array( 'wooreview' ), 'checkout' => true ),
		'surecart'        => array( 'slug' => 'mycred-surecart' ),
		'fluentcart'      => array( 'slug' => 'mycred-fluent-cart' ),
		'studiocart'      => array( 'slug' => 'mycred-studiocart' ),
		'edd'             => array( 'slug' => 'mycred-gateway-edd', 'checkout' => true ),
		'simplepay'       => array( 'slug' => 'mycred-simple-pay-integration' ),
		'dokan'           => array( 'slug' => 'woocommerce', 'also' => array( 'mycred-dokan' ), 'extra' => array( 'mycred-woocommerce-plus' ), 'include_ids' => array( 'wooreview' ), 'checkout' => true ),
		'learndash'       => array( 'slug' => 'mycred-learndash', 'skip_ids' => array( 'hook_learndash' ) ),
		'lifterlms'       => array( 'slug' => 'mycred-lifterlms' ),
		'tutor'           => array( 'slug' => 'mycred-tutor-lms' ),
		'sensei'          => array( 'slug' => 'mycred-senseilms' ),
		'academy'         => array( 'slug' => 'mycred-academy-lms' ),
		'masteriyo'       => array( 'slug' => 'mycred-masteriyo-lms' ),
		'masterstudy'     => array( 'slug' => 'mycred-masterstudylms' ),
		'courseware'      => array( 'slug' => 'mycred-for-courseware' ),
		'h5p'             => array( 'slug' => 'mycred-h5p' ),
		'memberpress'     => array( 'slug' => 'mycred-memberpress' ),
		'pmpro'           => array( 'slug' => 'mycred-paid-memberships-pro' ),
		'pms'             => array( 'slug' => 'mycred-paid-membership-subscriptions' ),
		'buddyboss'       => array( 'slug' => 'mycred-buddyboss' ),
		'buddypress'      => array( 'slug' => 'mycred', 'include_ids' => array( 'hook_bp_profile', 'hook_bp_groups' ) ),
		'fluentcommunity' => array( 'slug' => 'mycred-fluent-community' ),
		'anspress'        => array( 'slug' => 'mycred-anspress-integration' ),
		'userpro'         => array( 'slug' => 'mycred-userpro' ),
		'usersultra'      => array( 'slug' => 'mycred-usersultra' ),
		'wp_user_manager' => array( 'slug' => 'mycred-wp-user-manager' ),
		'wpforms'         => array( 'slug' => 'mycred-wpforms' ),
		'fluentforms'     => array( 'slug' => 'mycred-fluentform' ),
		'formidable'      => array( 'slug' => 'mycred-formidable' ),
		'forminator'      => array( 'slug' => 'mycred-forminator' ),
		'ninjaforms'      => array( 'slug' => 'mycred-ninjaforms' ),
		'gravity'         => array( 'slug' => 'mycred-gravity-form-booking', 'include_ids' => array( 'gravityform' ) ),
		'everest'         => array( 'slug' => 'mycred-everestform' ),
		'sureform'        => array( 'slug' => 'mycred-sureform' ),
		'weforms'         => array( 'slug' => 'mycred-weforms' ),
		'wsform'          => array( 'slug' => 'mycred-wsform' ),
		'arforms'         => array( 'slug' => 'mycred-arforms' ),
		'bitform'         => array( 'slug' => 'mycred-bitform' ),
		'formmaker'       => array( 'slug' => 'mycred-formmaker' ),
		'gutena'          => array( 'slug' => 'mycred-gutena-forms' ),
		'happyforms'      => array( 'slug' => 'mycred-happyform' ),
		'jetform'         => array( 'slug' => 'mycred-jetformbuilder' ),
		'kaliforms'       => array( 'slug' => 'mycred-kaliform' ),
		'metform'         => array( 'slug' => 'mycred-metform' ),
		'totalsurvey'     => array( 'slug' => 'mycred-for-totalsurvey' ),
		'totalpoll'       => array( 'slug' => 'mycred-for-totalpoll' ),
		'ratingform'      => array( 'slug' => 'mycred-for-rating-form' ),
		'bookly'          => array( 'slug' => 'mycred-bookly' ),
		'bookingpress'    => array( 'slug' => 'mycred-bookingpress' ),
		'booknetic'       => array( 'slug' => 'mycred-booknetic' ),
		'bookify'         => array( 'slug' => 'mycred-bookify' ),
		'bookingcalendar' => array( 'slug' => 'mycred-bookingcalendar' ),
		'fluentbooking'   => array( 'slug' => 'mycred-fluentbooking' ),
		'ssa'             => array( 'slug' => 'mycred-simply-schedule-appointments' ),
		'wptravel'        => array( 'slug' => 'mycred-wptravel' ),
		'tec'             => array( 'slug' => 'mycred-events-calendar' ),
		'event_tickets'   => array( 'slug' => 'mycred-event-tickets' ),
		'event_espresso'  => array( 'slug' => 'mycred-ee', 'checkout' => true ),
		'events_manager'  => array( 'slug' => 'mycred-for-events-manager-pro', 'include_ids' => array( 'eventsmanager' ), 'checkout' => true ),
		'zoom'            => array( 'slug' => 'mycred-zoom-rewards' ),
		'givewp'          => array( 'slug' => 'mycred-give-wp-addon' ),
		'geodirectory'    => array( 'slug' => 'mycred-geodirectory' ),
		'wpadverts'       => array( 'slug' => 'mycred-wpadverts' ),
		'wordpress'       => array( 'slug' => 'mycred' ),
		'favorites'       => array( 'slug' => 'mycred-favorites' ),
		'wpulike'         => array( 'slug' => 'mycred-wp-ulike' ),
		'postviews'       => array( 'slug' => 'mycred-for-wp-postviews' ),
		'gdstarrating'    => array( 'slug' => 'mycred-for-gd-star-rating' ),
		'presto'          => array( 'slug' => 'mycred-presto-player' ),
		'jwplayer'        => array( 'slug' => 'mycred-jwplayer' ),
		'vimeo'           => array( 'slug' => 'mycred-videos' ),
		'custom'          => array( 'slug' => 'mycred' ),
	),
	'site_types' => array(
		'store'      => array(
			'point_type' => array(
				'name'        => 'Reward Points',
				'key'         => 'reward_points',
				'description' => 'A customer-facing currency for purchases, reviews and loyalty.',
			),
			'core_hooks' => array( 'registration', 'logging_in' ),
			'addons'     => array(
				$addon( 'badges', 'optional', 'Give shoppers a visible reward for orders and milestones.' ),
				$addon( 'ranks', 'optional', 'VIP ranks for repeat buyers.' ),
				$addon( 'notifications', 'optional', 'Show a popup when points are earned or spent.' ),
			),
		),
		'lms'        => array(
			'point_type' => array(
				'name'        => 'Learning Points',
				'key'         => 'learning_points',
				'description' => 'Points students earn for lessons, quizzes and course completions.',
			),
			'core_hooks' => array( 'registration', 'logging_in' ),
			'addons'     => array(
				$addon( 'badges', 'optional', 'Badges for course and quiz milestones.' ),
				$addon( 'ranks', 'optional', 'Learner ranks from beginner to expert.' ),
				$addon( 'notifications', 'optional', 'Celebrate lesson and quiz completions.' ),
			),
		),
		'membership' => array(
			'point_type' => array(
				'name'        => 'Member Points',
				'key'         => 'member_points',
				'description' => 'Points for signups, renewals and member activity.',
			),
			'core_hooks' => array( 'registration', 'logging_in', 'anniversary' ),
			'addons'     => array(
				$addon( 'badges', 'optional', 'Recognize tenure and member milestones.' ),
				$addon( 'ranks', 'optional', 'Map ranks to membership progress.' ),
				$addon( 'notifications', 'optional', 'Notify members when they earn points.' ),
			),
		),
		'community'  => array(
			'point_type' => array(
				'name'        => 'Community Points',
				'key'         => 'community_points',
				'description' => 'Points for posts, comments, logins and member activity.',
			),
			'core_hooks' => array( 'registration', 'logging_in', 'comments' ),
			'addons'     => array(
				$addon( 'badges', 'optional', 'Achievement badges for community actions.' ),
				$addon( 'ranks', 'optional', 'Public ranks that reward engagement.' ),
				$addon( 'notifications', 'optional', 'Front-end popups for earned points.' ),
			),
		),
		'forms'      => array(
			'point_type' => array(
				'name'        => 'Reward Points',
				'key'         => 'reward_points',
				'description' => 'Points awarded when visitors complete forms and surveys.',
			),
			'core_hooks' => array( 'registration' ),
			'addons'     => array(
				$addon( 'notifications', 'optional', 'Confirm points after a form is submitted.' ),
			),
		),
		'bookings'   => array(
			'point_type' => array(
				'name'        => 'Loyalty Points',
				'key'         => 'loyalty_points',
				'description' => 'Points for completed bookings and returning clients.',
			),
			'core_hooks' => array( 'registration', 'logging_in' ),
			'addons'     => array(
				$addon( 'badges', 'optional', 'Badges for repeat appointments.' ),
				$addon( 'notifications', 'optional', 'Notify clients when booking points land.' ),
			),
		),
		'events'     => array(
			'point_type' => array(
				'name'        => 'Event Points',
				'key'         => 'event_points',
				'description' => 'Points for tickets, attendance and session rewards.',
			),
			'core_hooks' => array( 'registration' ),
			'addons'     => array(
				$addon( 'badges', 'optional', 'Attendance and speaker-style badges.' ),
				$addon( 'notifications', 'optional', 'Confirm points after an event action.' ),
			),
		),
		'donations'  => array(
			'point_type' => array(
				'name'        => 'Donor Points',
				'key'         => 'donor_points',
				'description' => 'Points that recognize donors and repeat giving.',
			),
			'core_hooks' => array( 'registration' ),
			'addons'     => array(
				$addon( 'badges', 'optional', 'Recognize donors with a visible badge.' ),
				$addon( 'ranks', 'optional', 'Donor tiers based on giving.' ),
				$addon( 'notifications', 'optional', 'Thank donors when points are awarded.' ),
			),
		),
		'directory'  => array(
			'point_type' => array(
				'name'        => 'Listing Points',
				'key'         => 'listing_points',
				'description' => 'Points for new listings, renewals and inquiries.',
			),
			'core_hooks' => array( 'registration', 'publishing_content' ),
			'addons'     => array(
				$addon( 'badges', 'optional', 'Badges for active listing owners.' ),
				$addon( 'notifications', 'optional', 'Notify when listing activity earns points.' ),
			),
		),
		'blog'       => array(
			'point_type' => array(
				'name'        => 'Reader Points',
				'key'         => 'reader_points',
				'description' => 'Points for publishing, comments, reads and returning visits.',
			),
			'core_hooks' => array( 'registration', 'logging_in', 'comments', 'publishing_content' ),
			'addons'     => array(
				$addon( 'badges', 'optional', 'Badges for authors and active readers.' ),
				$addon( 'notifications', 'optional', 'Show points earned on comments and posts.' ),
			),
		),
		'other'      => array(
			'point_type' => array(
				'name'        => 'Reward Points',
				'key'         => 'reward_points',
				'description' => 'A flexible point type you can refine after setup.',
			),
			'core_hooks' => array( 'registration', 'logging_in', 'site_visit' ),
			'addons'     => array(
				$addon( 'badges', 'optional', 'A simple achievement layer to start with.' ),
				$addon( 'notifications', 'optional', 'Show points as they are earned.' ),
			),
		),
	),
	'goals'      => array(
		'repeat_purchases'  => array(
			'roles'  => array( 'purchase', 'order_count', 'login' ),
			'addons' => array(
				$addon( 'ranks', 'recommended', 'VIP ranks give shoppers a reason to come back.' ),
				$addon( 'coupons', 'recommended', 'Point coupons win back lapsed buyers.' ),
				$addon( 'email-notices', 'optional', 'Remind customers they have unused points.' ),
			),
		),
		'loyalty'           => array(
			'roles'  => array( 'purchase', 'login', 'anniversary', 'booking' ),
			'addons' => array(
				$addon( 'badges', 'recommended', 'Visible badges make loyalty feel earned.' ),
				$addon( 'ranks', 'recommended', 'Tiered ranks are the core of a loyalty program.' ),
			),
		),
		'aov'               => array(
			'roles'  => array( 'order_range', 'purchase' ),
			'addons' => array(
				$addon( 'mycred-woocommerce-plus', 'recommended', 'WooCommerce Plus adds extra order-range bands and percentage rewards.', $woo ),
			),
		),
		'reviews'           => array(
			'roles'  => array( 'review' ),
			'addons' => array(
				$addon( 'notifications', 'recommended', 'Confirm points as soon as a review is approved.' ),
			),
		),
		'referrals'         => array(
			'roles'  => array( 'referral' ),
			'addons' => array(
				$addon( 'email-notices', 'recommended', 'Notify both sides when a referral pays out.' ),
				$addon( 'mycred-woocommerce-plus', 'recommended', 'Product referral hook (referrer and referee on first referred sale). Requires the WooCommerce add-on.', $woo ),
			),
		),
		'pay_with_points'   => array(
			'roles'    => array( 'purchase' ),
			'addons'   => array(
				$addon( 'mycred-woocommerce-plus', 'recommended', 'Partial payments so points can cover part of the cart.', $woo ),
			),
			'checkout' => true,
		),
		'first_purchase'    => array(
			'roles'  => array( 'first_order', 'registration' ),
			'addons' => array(
				$addon( 'coupons', 'optional', 'A first-order coupon can sit next to a first-order bonus.' ),
			),
		),
		'vendor_rewards'    => array(
			'roles'  => array( 'vendor', 'purchase', 'review' ),
			'addons' => array(
				$addon( 'mycred-dokan', 'recommended', 'Vendor profile ratings, product ratings, and sales-target hooks.', array( 'dokan' ) ),
			),
		),
		'course_completion' => array(
			'roles' => array( 'course', 'lesson' ),
		),
		'quiz_engagement'   => array(
			'roles' => array( 'quiz' ),
		),
		'enrollments'       => array(
			'roles' => array( 'enroll', 'registration' ),
		),
		'gamify_learning'   => array(
			'roles'  => array( 'course', 'lesson', 'quiz' ),
			'addons' => array(
				$addon( 'badges', 'recommended', 'Course badges make progress visible.' ),
				$addon( 'ranks', 'recommended', 'Learner ranks turn study into a progression.' ),
			),
		),
		'unlock_content'    => array(
			'roles'  => array( 'course', 'lesson' ),
			'addons' => array(
				$addon( 'sell-content', 'recommended', 'Sell post or lesson access for points.' ),
			),
		),
		'reduce_dropout'    => array(
			'roles'  => array( 'login', 'visit', 'lesson' ),
			'addons' => array(
				$addon( 'email-notices', 'recommended', 'Email when a student stops earning points.' ),
			),
		),
		'signups'           => array(
			'roles' => array( 'registration', 'membership' ),
		),
		'reduce_churn'      => array(
			'roles'  => array( 'login', 'anniversary', 'membership' ),
			'addons' => array(
				$addon( 'email-notices', 'recommended', 'Bring inactive members back with unused-point emails.' ),
				$addon( 'ranks', 'recommended', 'Progress they would lose is a reason to stay.' ),
			),
		),
		'gate_content'      => array(
			'roles'  => array( 'membership' ),
			'addons' => array(
				$addon( 'sell-content', 'recommended', 'Charge points to unlock members-only content.' ),
			),
		),
		'member_activity'   => array(
			'roles' => array( 'login', 'community', 'comments' ),
		),
		'upgrades'          => array(
			'roles'  => array( 'membership' ),
			'addons' => array(
				$addon( 'ranks', 'recommended', 'Ranks map cleanly onto higher membership plans.' ),
			),
		),
		'engagement'        => array(
			'roles' => array( 'community', 'comments', 'publish', 'login' ),
		),
		'daily_activity'    => array(
			'roles'  => array( 'login', 'visit' ),
			'addons' => array(
				$addon( 'mycred-daily-login-rewards', 'optional', 'Login-streak calendars on top of the daily login hook.' ),
			),
		),
		'gamify'            => array(
			'roles'  => array( 'community', 'login' ),
			'addons' => array(
				$addon( 'badges', 'recommended', 'Badges are the visible game layer.' ),
				$addon( 'ranks', 'recommended', 'Ranks turn points into status.' ),
			),
		),
		'transfers'         => array(
			'roles'  => array( 'community', 'login' ),
			'addons' => array(
				$addon( 'transfer', 'recommended', 'Lets members send points to each other.' ),
			),
		),
		'top_members'       => array(
			'roles'  => array( 'community' ),
			'addons' => array(
				$addon( 'ranks', 'recommended', 'Ranks surface the top members.' ),
				$addon( 'stats', 'optional', 'Charts of circulation and top balances.' ),
			),
		),
		'submissions'       => array(
			'roles' => array( 'submit' ),
		),
		'field_values'      => array(
			'roles' => array( 'field_value' ),
		),
		'leads'             => array(
			'roles'  => array( 'submit', 'registration' ),
			'addons' => array(
				$addon( 'email-notices', 'recommended', 'Follow up after a lead form awards points.' ),
			),
		),
		'surveys'           => array(
			'roles' => array( 'submit' ),
		),
		'quiz_forms'        => array(
			'roles'  => array( 'quiz', 'submit' ),
			'addons' => array(
				$addon( 'badges', 'recommended', 'Quiz badges make form quizzes feel like a game.' ),
			),
		),
		'completed'         => array(
			'roles' => array( 'booking' ),
		),
		'repeat'            => array(
			'roles'  => array( 'booking', 'login', 'donate' ),
			'addons' => array(
				$addon( 'ranks', 'recommended', 'Loyalty ranks for returning clients or donors.' ),
			),
		),
		'tickets'           => array(
			'roles' => array( 'purchase', 'event' ),
		),
		'attendance'        => array(
			'roles' => array( 'event' ),
		),
		'zoom'              => array(
			'roles' => array( 'event' ),
		),
		'donors'            => array(
			'roles' => array( 'donate' ),
		),
		'major_donors'      => array(
			'roles'  => array( 'donate' ),
			'addons' => array(
				$addon( 'ranks', 'recommended', 'Donor tiers recognize major giving.' ),
			),
		),
		'listings'          => array(
			'roles' => array( 'listing', 'publish' ),
		),
		'renewals'          => array(
			'roles' => array( 'listing', 'membership', 'anniversary' ),
		),
		'inquiries'         => array(
			'roles' => array( 'inquiry' ),
		),
		'comments'          => array(
			'roles' => array( 'comments', 'publish' ),
		),
		'reads'             => array(
			'roles' => array( 'read' ),
		),
		'video'             => array(
			'roles' => array( 'video' ),
		),
		'returning'         => array(
			'roles' => array( 'login', 'visit' ),
		),
	),
	'checkout'   => array(
		'intro'   => 'Accept points as payment at checkout, with an exchange rate so customers know what a point is worth.',
		'example' => 'Exchange rate 1 means 1 point = 1.00 in store currency. Show the order total in points on the checkout page.',
		'items'   => array(
			array(
				'title'       => 'Enable points payment',
				'description' => 'Let logged-in customers pay with their point balance.',
				'reason'      => 'Gives points a real spend so balances do not sit unused.',
				'value'       => '',
				'priority'    => 'recommended',
			),
			array(
				'title'       => 'Exchange rate',
				'description' => 'How much 1 point is worth in store currency.',
				'reason'      => 'Matches the WooCommerce / Gateway exchange rate field (default 1).',
				'value'       => '1',
				'priority'    => 'recommended',
			),
			array(
				'title'       => 'Show total in points',
				'description' => 'Show the order total converted to points on checkout.',
				'reason'      => 'Customers understand the cost before they pay.',
				'value'       => 'checkout',
				'priority'    => 'optional',
			),
		),
	),
);
