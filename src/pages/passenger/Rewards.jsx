import { useState, useEffect } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import PassengerBottomNav from "../../components/PassengerBottomNav";
import "../../styles/Rewards.css";

const Rewards = () => {
  const [userCoins, setUserCoins] = useState(() => {
    const savedCoins = localStorage.getItem("passenger_coins");
    return savedCoins !== null ? parseInt(savedCoins, 10) : 0;
  });

  const [redeemSuccess, setRedeemSuccess] = useState("");

  useEffect(() => {
    localStorage.setItem("passenger_coins", userCoins);
    // TODO [DATABASE]: Sync updated coin balance to backend database API
    // axios.put('/api/passenger/coins', { coins: userCoins });
  }, [userCoins]);

  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const isDriverSection = currentPath.startsWith("/driver");
  const closeDestination = isDriverSection ? "/driver/dashboard" : "/passenger/search";

  const [rewardsList] = useState([
    {
      id: "rew-1",
      title: "₹100 INR Amazon/Generic Gift Card",
      cost: 10000,
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "rew-2",
      title: "T-shirt",
      cost: 15000,
      image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "rew-3",
      title: "Free Intercity Bus Pass",
      cost: 20000,
      image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "rew-4",
      title: "₹250 Cashback to Wallet",
      cost: 25000,
      image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80"
    }
  ]);

  const handleRedeem = (reward) => {
    if (userCoins >= reward.cost) {
      const updatedCoins = userCoins - reward.cost;
      setUserCoins(updatedCoins);
      setRedeemSuccess(`Successfully redeemed: ${reward.title}!`);
      setTimeout(() => setRedeemSuccess(""), 4000);
    } else {
      alert("Not enough coins to redeem this reward.");
    }
  };

  return (
    <div className="passenger-choice-page">
      <div className="app-content">
        
        {/* Blue Header Section matching Ride History layout */}
        <header className="rewards-blue-header">
          <div className="rewards-top-bar">
            <h1 className="rewards-main-title">Redeem</h1>
            <div className="rewards-top-actions">
              <button className="lang-toggle-pill" type="button">
                <span className="material-symbols-outlined text-sm">translate</span>
                EN / HI
              </button>
              <Link to={closeDestination} className="close-btn-circle">
                <span className="material-symbols-outlined text-lg">close</span>
              </Link>
            </div>
          </div>

          {/* Redeem Rewards Hero Banner */}
          <div className="redeem-hero-banner">
            <div>
              <h2 className="text-white text-lg font-bold">Redeem Rewards</h2>
              <p className="text-white/80 text-xs mt-1 leading-relaxed">
                Convert your hard-earned coins into cash or goodies.
              </p>
            </div>
            <div className="coins-badge-pill">
              <span className="material-symbols-outlined text-amber-500 text-sm">toll</span>
              <span>{userCoins.toLocaleString()} COINS</span>
            </div>
          </div>
        </header>

        {/* Scrollable Container Content */}
        <div className="rewards-scroll-body">
          {redeemSuccess && (
            <div className="mb-4 p-3 bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-xl text-center">
              {redeemSuccess}
            </div>
          )}

          {/* Reward Cards List */}
          <div className="rewards-list-container">
            {rewardsList.map((item) => (
              <div key={item.id} className="reward-card-image-style">
                <div className="reward-image-wrapper">
                  <img src={item.image} alt={item.title} className="reward-banner-img" />
                </div>
                
                <div className="reward-card-content">
                  <h3 className="reward-title-large">{item.title}</h3>
                  <div className="reward-footer-flex">
                    <div className="reward-coin-tag">
                      <span className="material-symbols-outlined text-amber-500 text-xl">toll</span>
                      <span className="coin-amount-text">{item.cost.toLocaleString()}</span>
                    </div>
                    <button 
                      onClick={() => handleRedeem(item)}
                      className="redeem-btn-pill cursor-pointer"
                    >
                      Redeem
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Navigation Bar */}
        {!isDriverSection && <PassengerBottomNav />}

      </div>
    </div>
  );
};

export default Rewards;