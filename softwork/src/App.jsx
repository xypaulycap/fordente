import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [email, setEmail] = useState('');
  const [emails, setEmails] = useState([]);
  const [tradingTips, setTradingTips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  // Sample trading tips (fallback if API fails)
  const sampleTips = [
    {
      symbol: 'AAPL',
      tip: 'Apple stock shows strong support at $150. Consider buying on dips with stop loss at $145.',
      type: 'BUY',
      confidence: 'High'
    },
    {
      symbol: 'TSLA',
      tip: 'Tesla breaking above $200 resistance. Momentum traders might find opportunities.',
      type: 'WATCH',
      confidence: 'Medium'
    },
    {
      symbol: 'SPY',
      tip: 'S&P 500 ETF approaching key resistance. Watch for breakout or reversal signals.',
      type: 'WATCH',
      confidence: 'High'
    },
    {
      symbol: 'NVDA',
      tip: 'NVIDIA showing consolidation pattern. Wait for clear direction before entry.',
      type: 'HOLD',
      confidence: 'Medium'
    },
    {
      symbol: 'MSFT',
      tip: 'Microsoft maintaining uptrend. Good for long-term portfolio allocation.',
      type: 'BUY',
      confidence: 'High'
    }
  ];

  // Fetch trading tips from a free API (using Alpha Vantage free tier)
  const fetchTradingTips = async () => {
    setLoading(true);
    console.log('Fetching trading tips...');
    try {
      // Using Alpha Vantage free API for market data
      const symbols = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA'];
      const tips = [];
      
      for (let i = 0; i < 5; i++) { // Fetch all 5 symbols for better rotation
        const symbol = symbols[i];
        try {
          const response = await fetch(
            `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=5IMC8MU26RK3T5YY`
          );
          const data = await response.json();
          console.log(`API response for ${symbol}:`, data);
          
          if (data['Global Quote'] && Object.keys(data['Global Quote']).length > 0) {
            const quote = data['Global Quote'];
            const price = parseFloat(quote['05. price']);
            const change = parseFloat(quote['09. change']);
            const changePercent = quote['10. change percent'];
            
            let tip, type;
            if (change > 0) {
              tip = `${symbol} is up ${changePercent} today at $${price.toFixed(2)}. Positive momentum detected.`;
              type = 'BUY';
            } else {
              tip = `${symbol} is down ${changePercent} today at $${price.toFixed(2)}. Watch for support levels.`;
              type = 'WATCH';
            }
            
            tips.push({
              symbol,
              tip,
              type,
              confidence: 'Medium',
              price: price.toFixed(2),
              change: changePercent
            });
          } else {
            console.log(`No valid data for ${symbol}, API might be rate limited`);
          }
        } catch (error) {
          console.log(`Error fetching ${symbol}:`, error);
        }
        
        // Add delay between API calls to avoid rate limiting
        if (i < 4) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
      
      console.log('Fetched tips from API:', tips);
      
      if (tips.length > 0) {
        setTradingTips(tips);
        console.log('Using API tips:', tips.length);
      } else {
        // Fallback to sample tips
        console.log('Using sample tips as fallback');
        setTradingTips(sampleTips);
      }
    } catch (error) {
      console.error('Error fetching trading tips:', error);
      console.log('Using sample tips due to error');
      setTradingTips(sampleTips);
    }
    setLoading(false);
  };

  // Load tips on component mount
  useEffect(() => {
    fetchTradingTips();
  }, []);

  // Rotate tips every 5 seconds (reduced for better visibility)
  useEffect(() => {
    if (tradingTips.length > 1) {
      console.log(`Setting up rotation for ${tradingTips.length} tips`);
      const interval = setInterval(() => {
        setCurrentTipIndex((prev) => {
          const newIndex = (prev + 1) % tradingTips.length;
          console.log(`Rotating tip from ${prev} to ${newIndex}`);
          return newIndex;
        });
      }, 5000); // Changed to 5 seconds for faster rotation
      return () => {
        console.log('Clearing tip rotation interval');
        clearInterval(interval);
      };
    } else {
      console.log('Not setting up rotation - only one or no tips available');
    }
  }, [tradingTips]);

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      if (!emails.includes(email)) {
        setEmails([...emails, email]);
        setMessage('✅ Successfully subscribed! You\'ll receive trading tips.');
        setEmail('');
      } else {
        setMessage('📧 This email is already subscribed!!');
      }
    } else {
      setMessage('❌ Please enter a valid email address.');
    }
    
    setTimeout(() => setMessage(''), 3000);
  };

  const currentTip = tradingTips[currentTipIndex];

  return (
    <div className="app">
      <header className="header">
        <div className="container">
          <h1 className="logo">📈 SoftWork</h1>
          <p className="tagline">Smart Trading Tips for Smart Investors</p>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <section className="hero">
            <h2>Get Free Market Trading Tips</h2>
            <p>Join thousands of traders receiving daily market insights and trading opportunities directly to their inbox.</p>
          </section>

          <section className="tip-display">
            <h3>💡 Latest Trading Tip</h3>
            {loading ? (
              <div className="loading">Loading market data...</div>
            ) : currentTip ? (
              <div className={`tip-card ${currentTip.type.toLowerCase()}`}>
                <div className="tip-header">
                  <span className="symbol">{currentTip.symbol}</span>
                  <span className={`type ${currentTip.type.toLowerCase()}`}>{currentTip.type}</span>
                  <span className="confidence">Confidence: {currentTip.confidence}</span>
                </div>
                <p className="tip-content">{currentTip.tip}</p>
                {currentTip.price && (
                  <div className="price-info">
                    <span>Current Price: ${currentTip.price}</span>
                    {currentTip.change && <span className="change">{currentTip.change}</span>}
                  </div>
                )}
              </div>
            ) : (
              <div className="no-tips">No tips available at the moment.</div>
            )}
            
            {tradingTips.length > 1 && (
              <div className="tip-navigation">
                <div className="tip-dots">
                  {tradingTips.map((_, index) => (
                    <button
                      key={index}
                      className={`dot ${index === currentTipIndex ? 'active' : ''}`}
                      onClick={() => setCurrentTipIndex(index)}
                    />
                  ))}
                </div>
                <p className="tip-counter">
                  Tip {currentTipIndex + 1} of {tradingTips.length}
                </p>
              </div>
            )}
          </section>

          <section className="subscription">
            <h3>📧 Subscribe for Daily Tips</h3>
            <form onSubmit={handleEmailSubmit} className="email-form">
              <div className="input-group">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="email-input"
                  required
                />
                <button type="submit" className="subscribe-btn">
                  Subscribe
                </button>
              </div>
            </form>
            {message && <div className="message">{message}</div>}
          </section>

          <section className="features">
            <h3>Why Choose SoftWork?</h3>
            <div className="features-grid">
              <div className="feature">
                <div className="feature-icon">🎯</div>
                <h4>Accurate Analysis</h4>
                <p>Our tips are based on technical analysis and market trends</p>
              </div>
              <div className="feature">
                <div className="feature-icon">⚡</div>
                <h4>Real-time Updates</h4>
                <p>Get the latest market movements and opportunities</p>
              </div>
              <div className="feature">
                <div className="feature-icon">🔒</div>
                <h4>Completely Free</h4>
                <p>No hidden fees, no premium subscriptions required</p>
              </div>
            </div>
          </section>

          {emails.length > 0 && (
            <section className="subscribers">
              <h3>📊 Subscribers ({emails.length})</h3>
              <div className="subscriber-list">
                {emails.map((subscriberEmail, index) => (
                  <div key={index} className="subscriber">
                    {subscriberEmail}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <p>&copy; 2024 SoftWork. All rights reserved.</p>
          <p className="disclaimer">
            ⚠️ Disclaimer: Trading tips are for educational purposes only. Always do your own research before making investment decisions.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;