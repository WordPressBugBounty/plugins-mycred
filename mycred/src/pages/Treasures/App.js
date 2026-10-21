import React from 'react';

const TreasuresApp = () => {
  const treasurePacks = [
    {
      id: 'badges',
      title: 'Badges',
      description: '40 unique and beautifully designed Badge designs available in Gold, Silver and Bronze to gamify user achievements.',
      image: 'badges.png',
      link: 'https://mycred.me/treasure/badges/?utm_source=plugin&utm_medium=treasure_page'
    },
    {
      id: 'ranks',
      title: 'Ranks',
      description: '40 unique and beautifully designed virtual Ranks are available in Red, Silver and Gold to visualize user progression.',
      image: 'rank.png',
      link: 'https://mycred.me/treasure/ranks/?utm_source=plugin&utm_medium=treasure_page'
    },
    {
      id: 'currency',
      title: 'Currency',
      description: '17 unique and beautifully designed Currency designs available in Gold, Silver & Bronze for your virtual economy.',
      image: 'currency.png',
      link: 'https://mycred.me/treasure/currency/?utm_source=plugin&utm_medium=treasure_page'
    },
    {
      id: 'learning',
      title: 'Learning',
      description: '30 unique and beautifully designed Learning icons available in four different shapes for educational platforms.',
      image: 'learning.png',
      link: 'https://mycred.me/treasure/learning/?utm_source=plugin&utm_medium=treasure_page'
    },
    {
      id: 'fitness',
      title: 'Fitness',
      description: '30 unique and beautifully designed Fitness icons available in three different shapes for health and wellness apps.',
      image: 'fitness.png',
      link: 'https://mycred.me/treasure/fitness/?utm_source=plugin&utm_medium=treasure_page'
    },
    {
      id: 'gems',
      title: 'Gems',
      description: '500 unique and beautifully designed gem icons available in four different shapes to reward user milestones.',
      image: 'gems.png',
      link: 'https://mycred.me/treasure/gems/?utm_source=plugin&utm_medium=treasure_page'
    }
  ];

  return (
    <div style={{
      backgroundColor: '#F8F6FF',
      minHeight: '100vh',
      padding: '60px 20px 100px 20px',
      fontFamily: "'Inter', sans-serif",
      marginLeft: '-20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Epilogue:wght@600;700&family=Inter:wght@400;500;600;700&display=swap');
          
          .treasures-container {
            max-width: 1000px;
            margin: 0 auto;
            position: relative;
            z-index: 2;
          }

          .features-badge {
            background: white;
            border: 1px solid #DBD0FB;
            color: #5E2CED;
            padding: 10px 20px;
            border-radius: 100px;
            font-size: 14px;
            font-weight: 500;
            display: inline-block;
            margin-bottom: 24px;
            letter-spacing: 0.02em;
            box-shadow: 0 2px 10px rgba(94, 44, 237, 0.05);
          }

          .main-title {
            font-family: 'Epilogue', sans-serif;
            font-size: 36px;
            font-weight: 600;
            color: #2E1572;
            margin: 0 0 24px 0;
            line-height: 1.2;
          }

          .subtitle {
            color: #6B57A1;
            font-size: 16px;
            line-height: 1.6;
            max-width: 650px;
            margin: 0 auto 60px auto;
          }

          .treasures-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
            margin-bottom: 80px;
          }

          @media (max-width: 1024px) {
            .treasures-grid {
              grid-template-columns: repeat(2, 1fr);
            }
          }

          @media (max-width: 640px) {
            .treasures-grid {
              grid-template-columns: 1fr;
            }
          }

          .treasure-card {
            background: radial-gradient(100% 100% at 50% 100%, #F8F6FF 0%, #EEE9FB 100%);
            border: 1.5px solid #E5DFF6;
            border-radius: 12px;
            padding: 24px;
            text-align: left;
            display: flex;
            flex-direction: column;
          }

          .image-box {
            background: white;
            border: 1px solid #E5DFF6;
            border-radius: 8px;
            height: 150px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;
            overflow: hidden;
            padding: 12px;
          }

          .image-box img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
          }

          .card-title {
            font-size: 16px;
            font-weight: 600;
            color: #2E1572;
            margin-bottom: 12px;
          }

          .card-desc {
            font-size: 13px;
            line-height: 1.6;
            color: #6B57A1;
            margin-bottom: 24px;
            flex-grow: 1;
            opacity: 0.9;
          }

          .get-asset-btn {
            background: #8559FF;
            color: white;
            padding: 14px;
            border-radius: 8px;
            font-weight: 600;
            text-decoration: none;
            font-size: 14px;
            text-align: center;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          }

          .get-asset-btn:hover {
            background: #6D43E0;
            transform: translateY(-1px);
            box-shadow: 0 5px 15px rgba(133, 89, 255, 0.3);
          }

          .footer-section {
            text-align: center;
            padding: 80px 0 40px 0;
            margin-top: 60px;
            position: relative;
          }

          .footer-bg-wrapper {
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 100%;
            max-width: 1200px;
            pointer-events: none;
            z-index: 1;
          }

          .footer-bg-img {
            width: 100%;
            height: auto;
            opacity: 0.15;
          }

          .footer-text {
            color: #BFB1E8;
            font-size: 16px;
            font-weight: 600;
            position: relative;
            z-index: 2;
          }
        `}
      </style>

      <div className="treasures-container">
        <div style={{ textAlign: 'center' }}>
          <div className="features-badge">Features</div>
          <h1 className="main-title">Elevate Your Gamification Experience</h1>
          <p className="subtitle">
            Transform your loyalty program with our professionally crafted visual assets. Our exclusive collection of high-quality badges, ranks, and icons is designed to captivate users and drive long-term engagement.
          </p>
        </div>

        <div className="treasures-grid">
          {treasurePacks.map((pack) => (
            <div key={pack.id} className="treasure-card">
              <div className="image-box">
                <img
                  src={`${window.mycredTreasuresData.assetsUrl}${pack.image}`}
                  alt={pack.title}
                />
              </div>
              <div className="card-title">{pack.title}</div>
              <div className="card-desc">{pack.description}</div>
              <a
                href={pack.link}
                target="_blank"
                rel="noopener noreferrer"
                className="get-asset-btn"
              >
                Get this Asset &rarr;
              </a>
            </div>
          ))}
        </div>

        <div className="footer-section">
          <img
            src={window.mycredTreasuresData.footerBgUrl}
            style={{
              maxWidth: '100%',
              height: 'auto',
              opacity: 0.8, // Match About page look
              pointerEvents: 'none'
            }}
            alt="Branding"
          />
        </div>
      </div>
    </div>
  );
};

export default TreasuresApp;
