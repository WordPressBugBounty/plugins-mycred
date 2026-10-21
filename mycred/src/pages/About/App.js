import { createElement } from '@wordpress/element';
import AboutScreenIcon from './icons/about-screen.svg';
import AwardIcon from './icons/award-digital.svg';
import PurchaseIcon from './icons/purchase-mycred.svg';
import CashIcon from './icons/point-to-cash.svg';
import CouponIcon from './icons/coupon.svg';
import EmailIcon from './icons/email.svg';
import PaymentIcon from './icons/payment.svg';
import StatusIcon from './icons/status.svg';
import SellIcon from './icons/sell-content.svg';
import StatsIcon from './icons/statistics.svg';
import CTABlockIcon from './icons/cta-block.svg';
import FooterBg from './icons/footer-bg.svg';

const styles = {
    wrapper: {
        background: '#F8F6FF',
        width: 'calc(100% + 20px)',
        minHeight: '100vh',
        margin: 0,
        padding: 0,
        marginLeft: '-20px'
    },
    container: {
        maxWidth: '1275px',
        margin: '0 auto',
        padding: '40px 150px',
        fontFamily: 'Inter, sans-serif',
        boxSizing: 'border-box'
    },
    heroSection: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '40px',
        marginBottom: '100px',
        flexWrap: 'wrap'
    },
    heroLeft: {
        flex: 1,
        maxWidth: '600px'
    },
    heroTitle: {
        color: 'var(--Black, #2E1572)',
        fontFamily: 'Epilogue',
        fontSize: '36px',
        fontWeight: 600,
        lineHeight: '1.2',
        marginBottom: '20px',
        marginTop: 0
    },
    heroDescription: {
        width: '100%',
        maxWidth: '413px',
        color: '#6B57A1',
        fontFamily: 'Inter, sans-serif',
        fontSize: '16px',
        fontStyle: 'normal',
        fontWeight: 400,
        lineHeight: '1.5',
        marginBottom: '40px'
    },
    heroButtons: {
        display: 'flex',
        gap: '16px'
    },
    btnPrimary: {
        display: 'inline-flex',
        padding: '16px 36px',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '12px',
        background: '#8559FF',
        color: '#FFF',
        fontFamily: 'Inter, sans-serif',
        fontSize: '16px',
        fontWeight: 600,
        textDecoration: 'none',
        border: 'none',
        cursor: 'pointer'
    },
    btnSecondary: {
        display: 'inline-flex',
        padding: '16px 36px',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '12px',
        border: '1px solid #B09FDF',
        background: 'transparent',
        color: '#6B57A1',
        fontFamily: 'Inter, sans-serif',
        fontSize: '16px',
        fontWeight: 600,
        textDecoration: 'none',
        cursor: 'pointer'
    },
    heroRight: {
        flex: 1,
        display: 'flex',
        justifyContent: 'flex-end'
    },
    heroImage: {
        maxWidth: '100%',
        height: 'auto'
    },
    // Features Section Styles
    featuresHeader: {
        textAlign: 'center',
        marginBottom: '60px'
    },
    featuresBadge: {
        display: 'inline-block',
        padding: '8px 24px',
        borderRadius: '100px',
        border: '1px solid #E9E6F2',
        color: '#8559FF',
        fontSize: '14px',
        fontWeight: 500,
        marginBottom: '20px',
        backgroundColor: '#FFF'
    },
    featuresTitle: {
        color: '#2E1572',
        fontFamily: 'Epilogue',
        fontSize: '32px',
        fontWeight: 600,
        lineHeight: '1.3',
        maxWidth: '600px',
        margin: '0 auto'
    },
    featuresGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '24px',
        marginBottom: '60px',
        justifyItems: 'center'
    },
    featureCard: {
        borderRadius: '6.65px',
        border: '1px solid #E5DFF6',
        background: 'radial-gradient(84.88% 100% at 50% 100%, #F8F6FF 0%, #EEE9FB 100%)',
        padding: '24px 16px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxSizing: 'border-box'
    },
    iconWrapper: {
        width: '66.502px',
        height: '66.502px',
        background: '#FFF',
        border: '1px solid #E5DFF6',
        borderRadius: '50% 0 50% 50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '16px',
        boxSizing: 'border-box'
    },
    featureCardTitle: {
        color: '#2E1572',
        fontSize: '16px',
        fontWeight: 600,
        marginBottom: '12px',
        marginTop: 0
    },
    featureCardDesc: {
        color: '#6B57A1',
        fontSize: '14px',
        lineHeight: '1.5',
        margin: 0
    },
    viewAddonsLink: {
        display: 'block',
        textAlign: 'center',
        color: '#8559FF',
        fontSize: '16px',
        fontWeight: 600,
        textDecoration: 'none',
        marginBottom: '60px'
    },
    planBanner: {
        width: '970px',
        height: '448px',
        margin: '60px auto',
        borderRadius: '8px',
        background: 'radial-gradient(84.88% 100% at 50% 100%, #3811A6 0%, #2D0F83 25%, #230D60 50%, #180B3E 75%, #0E091B 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '60px',
        color: '#FFF',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden'
    },
    planLeft: {
        flex: 1,
        maxWidth: '450px',
        zIndex: 2
    },
    planTitle: {
        fontSize: '32px',
        fontFamily: 'Epilogue',
        fontWeight: 600,
        marginBottom: '20px',
        marginTop: 0,
        background: 'linear-gradient(172.057deg, #FFFFFF 0%, #FFFFFF 36.065%, #9573F6 72.129%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        lineHeight: '1.2'
    },
    planDesc: {
        fontSize: '16px',
        lineHeight: '1.5',
        color: '#c1b8db',
        marginBottom: '30px',
        maxWidth: '396px'
    },
    planList: {
        listStyle: 'none',
        padding: 0,
        margin: 0
    },
    planListItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '12px',
        fontSize: '16px',
        fontWeight: 500,
        color: '#FFFFFF'
    },
    checkCircle: {
        width: '16px',
        height: '16px',
        background: '#2A9B39',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '10px',
        color: '#FFF'
    },
    planRight: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        zIndex: 2,
        minWidth: '200px'
    },
    pricingInfo: {
        textAlign: 'center',
        marginBottom: '20px',
        position: 'relative'
    },
    pricingLabel: {
        fontSize: '14px',
        color: '#FFFFFF',
        display: 'block',
        marginBottom: '4px'
    },
    pricingAmount: {
        fontSize: '72px',
        fontWeight: 700,
        lineHeight: 1,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        background: 'linear-gradient(156.258deg, #FFFFFF 0%, #FFFFFF 36.065%, #9573F6 72.129%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        margin: '10px 0'
    },
    pricingPeriod: {
        fontSize: '14px',
        color: '#c1b8db'
    },
    planButton: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(-14.204deg, #FFB31B 25.242%, #FFCE6B 78.039%)',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '8px',
        color: '#000000',
        fontWeight: 600,
        fontSize: '16px',
        cursor: 'pointer',
        width: '160px',
        height: '40px',
        boxShadow: '0px 8px 20px rgba(255, 179, 27, 0.2)',
        textDecoration: 'none',
        boxSizing: 'border-box',
    },
    bannerDecor: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: '100%',
        height: '100%',
        backgroundImage: `url(${CTABlockIcon})`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right center',
        backgroundSize: 'contain',
        opacity: 0.3,
        zIndex: 1,
        pointerEvents: 'none',
    },
    // Testimonials Styles
    testimonialHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: '60px',
        marginTop: '120px'
    },
    testimonialTitle: {
        color: '#2E1572',
        fontFamily: 'Epilogue',
        fontSize: '36px',
        fontWeight: 600,
        margin: '16px 0 0 0',
        lineHeight: '1.2'
    },
    ratingBox: {
        background: '#FFF',
        padding: '12px 24px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.05)'
    },
    testimonialGrid: {
        display: 'flex',
        gap: '24px'
    },
    testimonialCol: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
    },
    testimonialCard: {
        background: '#FFF',
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid #E9E6F2',
        boxSizing: 'border-box',
        boxShadow: '0px 10px 25px rgba(46, 21, 114, 0.04)'
    },
    testimonialUser: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '16px'
    },
    testimonialAvatar: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: '#6B57A1',
        color: '#FFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        fontWeight: 600,
        flexShrink: 0,
    },
    testimonialInfo: {
        display: 'flex',
        flexDirection: 'column'
    },
    testimonialName: {
        color: '#2E1572',
        fontSize: '14px',
        fontWeight: 600,
        margin: 0
    },
    testimonialRole: {
        color: '#6B57A1',
        fontSize: '12px',
        margin: 0
    },
    testimonialText: {
        color: '#6B57A1',
        fontSize: '14px',
        lineHeight: '1.6',
        margin: '0 0 16px 0'
    },
    testimonialHeadline: {
        color: '#2E1572',
        fontSize: '14px',
        fontWeight: 700,
        lineHeight: '1.5',
        margin: '0 0 8px 0'
    },
    testimonialStars: {
        color: '#F47B5A',
        fontSize: '14px',
        letterSpacing: '2px'
    },
    // Footer Styles
    footerSection: {
        textAlign: 'center',
        padding: '80px 0 40px 0',
        marginTop: '60px'
    },
    footerImage: {
        maxWidth: '100%',
        height: 'auto',
        opacity: 1.0,
        pointerEvents: 'none'
    }
};

const features = [
    {
        title: 'Award Digital Badges',
        desc: 'Award users with digital badges based on their points history',
        icon: AwardIcon
    },
    {
        title: 'Purchase myCred Points',
        desc: 'Allow users to purchase myCred points using money',
        icon: PurchaseIcon
    },
    {
        title: 'Point into Cash',
        desc: 'Allow your users to redeem myCred points for actual money',
        icon: CashIcon
    },
    {
        title: 'Create Discount Coupons',
        desc: 'Create coupons that your users can redeem for points',
        icon: CouponIcon
    },
    {
        title: 'Display Email Notifications',
        desc: 'Allow users to purchase myCred points using money',
        icon: EmailIcon
    },
    {
        title: 'Integrate Payment Gateways',
        desc: 'Let shopper pay with myCred points on your online store',
        icon: PaymentIcon
    },
    {
        title: 'Real-time Status Updates',
        desc: 'Enable popup notifications that display status updates',
        icon: StatusIcon
    },
    {
        title: 'Sell Content For Points',
        desc: 'Sell your website content in exchange for myCred points',
        icon: SellIcon
    },
    {
        title: 'Display Statistical Data',
        desc: 'Convert log data into charts to help visualize point usage and',
        icon: StatsIcon
    }
];

const testimonials = [
    [
        {
            name: 'Alex Harper',
            text: 'The best points system on WordPress. The best points system I’ve found on WordPress due to the flexibility and number of integrations. Support has been very responsive and helpful, which has made all the difference.',
            stars: 5,
        },
        {
            name: 'Khaled A Mohamed',
            headline: 'Great Gamification Plugin and Great Support',
            text: 'As an expert in gamification, I can say this plugin is great. I also dealt with the customer support team and found them real support.',
            stars: 5,
        },
    ],
    [
        {
            name: 'Soheib Kohneposhi',
            headline: 'Best Customer Service Ever',
            text: 'I cannot speak highly enough about the exceptional customer service I received from this team. From the moment I reached out, they were swift in their response, incredibly accurate in addressing my issues, and left no question unanswered. It’s rare to find such dedication and efficiency, and I genuinely appreciate their commitment to excellence. A heartfelt thank you to the team for making my experience seamless and stress-free. 5 stars without a doubt!',
            stars: 5,
        },
        {
            name: 'Pako Herrera',
            headline: 'Great user support.',
            text: 'I installed the plugin with the add-on for Amelia booking plugin. Even though it worked the way I expected with the points, the plugin had an issue where I was constantly getting an error when trying to save a page (invalid JSON). I reached out to the team to let them know that the add-on wasn’t working properly, and they were super fast to address the issue and install an updated version of the add-on for the proper functioning of my site.',
            stars: 5,
        },
    ],
    [
        {
            name: 'Doremdou',
            text: 'I am impressed how complete and awesome this plugin is. It has a lot of features, it is intuitive, easy to use, it supports many plugins and does not slow down the website at all. Great work! I would like to give the dev a hug!',
            stars: 5,
        },
        {
            name: 'meowlx',
            text: 'The plugin is intuitive, really easy to use and versatile: it has several hooks available for free which you can expand by buying premium add-ons – at a very reasonable price! I already bought a premium add-on.',
            stars: 5,
        },
        {
            name: 'Daniel Lemes',
            text: 'It’s VERY rare to see such kind of free product with so high quality and support. It’s full of configurations, highly customizable and many of important add-ons are free too; only those for very specific usage being premium.',
            stars: 5,
        },
    ],
];

const App = () => {
    return (
        <div style={styles.wrapper}>
            <div style={styles.container}>
                <style>
                    {`@import url('https://fonts.googleapis.com/css2?family=Epilogue:wght@600&family=Inter:wght@400;600&display=swap');`}
                </style>

                {/* Hero Section */}
                <div style={styles.heroSection}>
                    <div style={styles.heroLeft}>
                        <h1 style={styles.heroTitle}>
                            Supercharge user <br />
                            engagement
                        </h1>
                        <p style={styles.heroDescription}>
                            The most powerful points management system for WordPress. Reward your users, drive growth, and build a thriving community with myCred's flexible hooks and add-ons.
                        </p>
                        <div style={styles.heroButtons}>
                            <a
                                href="https://mycred.me/?utm_source=plugin&utm_medium=about_page"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={styles.btnPrimary}
                            >
                                Explore Now
                            </a>
                            <a
                                href="https://codex.mycred.me/?utm_source=plugin&utm_medium=about_page"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={styles.btnSecondary}
                            >
                                Read Docs
                            </a>
                        </div>
                    </div>
                    <div style={styles.heroRight}>
                        <img src={AboutScreenIcon} alt="Supercharge user engagement" style={styles.heroImage} />
                    </div>
                </div>

                {/* Features Section */}
                <div style={styles.featuresHeader}>
                    <span style={styles.featuresBadge}>Features</span>
                    <h2 style={styles.featuresTitle}>
                        Why Choose myCred as Your Points Management System
                    </h2>
                </div>

                <div style={styles.featuresGrid}>
                    {features.map((feature, index) => (
                        <div key={index} style={styles.featureCard}>
                            <img
                                src={feature.icon}
                                alt={feature.title}
                                style={{
                                    width: '66.502px',
                                    height: '66.502px',
                                    background: '#FFF',
                                    border: '1px solid #EEE9FB',
                                    borderRadius: '50% 0 50% 50%',
                                    boxSizing: 'border-box',
                                    marginBottom: '16px'
                                }}
                            />
                            <h3 style={styles.featureCardTitle}>{feature.title}</h3>
                            <p style={styles.featureCardDesc}>{feature.desc}</p>
                        </div>
                    ))}
                </div>

                <a
                    href="https://mycred.me/store/?utm_source=plugin&utm_medium=about_page"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.viewAddonsLink}
                >
                    View All myCred Addons &rarr;
                </a>

                {/* Pricing Banner */}
                <div style={styles.planBanner}>
                    {/* Background Decoration */}
                    <div style={styles.bannerDecor}></div>

                    <div style={styles.planLeft}>
                        <h2 style={styles.planTitle}>Choose Value-filled myCred Plans!</h2>
                        <p style={styles.planDesc}>
                            Join 10,000+ WordPress site owners to boost user engagement and convert casual users into repeated buyers. <span style={{ color: '#FFD569', fontWeight: 700 }}>Save 75%</span> on all LIFETIME Plans.
                        </p>

                        <ul style={styles.planList}>
                            <li style={styles.planListItem}>
                                <span style={styles.checkCircle}>✓</span> Premium Addons
                            </li>
                            <li style={styles.planListItem}>
                                <span style={styles.checkCircle}>✓</span> WooCommerce Integration
                            </li>
                            <li style={styles.planListItem}>
                                <span style={styles.checkCircle}>✓</span> Priority Technical Support
                            </li>
                            <li style={styles.planListItem}>
                                <span style={styles.checkCircle}>✓</span> Regular security updates
                            </li>
                        </ul>
                    </div>

                    <div style={styles.planRight}>
                        <div style={styles.pricingInfo}>
                            <span style={styles.pricingLabel}>Starting from</span>
                            <div style={styles.pricingAmount}>
                                <span style={{ fontSize: '32px', verticalAlign: 'top', marginTop: '10px' }}>$</span>
                                99
                            </div>
                            <span style={styles.pricingPeriod}>per year</span>
                        </div>
                        <a
                            href="https://mycred.me/pricing/?utm_source=plugin&utm_medium=about_page"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={styles.planButton}
                        >
                            See All Plans
                        </a>
                    </div>
                </div>

                {/* Testimonials Section */}
                <div style={styles.testimonialHeader}>
                    <div>
                        <span style={styles.featuresBadge}>Testimonials</span>
                        <h2 style={styles.testimonialTitle}>Why WordPress<br /> Community ❤️ myCred</h2>
                    </div>
                    <div style={styles.ratingBox}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '18px', fontWeight: 600, color: '#555' }}>4.6 Rating</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderLeft: '1px solid #EEE', paddingLeft: '16px' }}>
                            <span style={{ color: '#00B67A', fontSize: '24px' }}>★</span>
                            <span style={{ fontSize: '20px', fontWeight: 700, color: '#000' }}>Trustpilot</span>
                        </div>
                    </div>
                </div>

                <div style={styles.testimonialGrid}>
                    {testimonials.map((column, colIndex) => (
                        <div key={colIndex} style={styles.testimonialCol}>
                            {column.map((testimonial, tIndex) => (
                                <div key={tIndex} style={styles.testimonialCard}>
                                    <div style={styles.testimonialUser}>
                                        <div style={styles.testimonialAvatar}>
                                            {(testimonial.name || '?').charAt(0).toUpperCase()}
                                        </div>
                                        <div style={styles.testimonialInfo}>
                                            <h4 style={styles.testimonialName}>{testimonial.name}</h4>
                                        </div>
                                    </div>
                                    {testimonial.headline && (
                                        <p style={styles.testimonialHeadline}>{testimonial.headline}</p>
                                    )}
                                    <p style={styles.testimonialText}>{testimonial.text}</p>
                                    <div style={styles.testimonialStars}>{'★'.repeat(testimonial.stars)}</div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>

                {/* Footer Section */}
                <div style={styles.footerSection}>
                    <img src={FooterBg} style={styles.footerImage} alt="Branding" />
                </div>
            </div>
        </div>
    );
};

export default App;
