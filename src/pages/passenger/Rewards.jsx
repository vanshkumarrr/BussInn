import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  BriefcaseBusiness,
  BusFront,
  Check,
  Coins,
  Languages,
  Play,
  X
} from "lucide-react";
import PassengerBottomNav from "../../components/PassengerBottomNav";
import "../../styles/Rewards.css";

const DAILY_REWARDS = [2, 5, 7, 10, 15, 20, 30];
const CHECK_IN_STORAGE_KEY = "bussinn_daily_checkin";

const getDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getYesterdayKey = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return getDateKey(yesterday);
};

const getCheckInData = () => {
  try {
    const savedData = localStorage.getItem(CHECK_IN_STORAGE_KEY);

    if (!savedData) {
      return {
        streak: 0,
        lastClaimDate: "",
        lastReward: 0,
        doubleClaimed: false
      };
    }

    return JSON.parse(savedData);
  } catch {
    return {
      streak: 0,
      lastClaimDate: "",
      lastReward: 0,
      doubleClaimed: false
    };
  }
};

const BussInnMark = () => (
  <span className="reward-brand-mark">
    <BusFront aria-hidden="true" />
    <strong>BussInn</strong>
  </span>
);

const RewardVisual = ({ type }) => {
  if (type === "voucher") {
    return (
      <div className="product-visual">
        <img 
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6R8PhQpzg_Hzb5E4B-Tw_7EIbBI4qXL04cvkKB23yAA&s=10" 
          alt="Amazon Voucher" 
          className="custom-reward-image" 
        />
      </div>
    );
  }

  if (type === "white-shirt") {
    return (
      <div className="product-visual merch-visual">
        <img 
          src="https://i.postimg.cc/5yQQ9gDF/e548f7e9-7509-4760-a146-5c56cefddf9d.png" 
          alt="White T-Shirt" 
          className="custom-reward-image" 
        />
      </div>
    );
  }

  if (type === "black-shirt") {
    return (
      <div className="product-visual merch-visual dark-product-bg">
        <img 
          src="https://i.postimg.cc/X7FxQkqP/5d0d93eb-b1d3-43a0-8e4b-2c89ceda3650.png" 
          alt="Black T-Shirt" 
          className="custom-reward-image" 
        />
      </div>
    );
  }

  if (type === "cap") {
    return (
      <div className="product-visual merch-visual">
        <img 
          src="https://i.postimg.cc/YqmQt2wj/fb75313a-39a9-4906-98a8-a7f2f4ed3bb6.png" 
          alt="Cap" 
          className="custom-reward-image" 
        />
      </div>
    );
  }

  if (type === "bottle") {
    return (
      <div className="product-visual merch-visual">
        <img 
          src="https://i.postimg.cc/3whXLsVg/57808676-6fe4-44d2-b37e-2281af762e0e.png" 
          alt="Bottle" 
          className="custom-reward-image" 
        />
      </div>
    );
  }

  // Fallback for laptop bag since no image was provided
  return (
    <div className="product-visual merch-visual">
      <div className="bag-product">
        <BriefcaseBusiness aria-hidden="true" />
        <BussInnMark />
      </div>
    </div>
  );
};

const Rewards = () => {
  const [userCoins, setUserCoins] = useState(() => {
    const savedCoins = localStorage.getItem("passenger_coins");
    return savedCoins !== null ? Number(savedCoins) : 0;
  });

  const [checkInData, setCheckInData] = useState(getCheckInData);
  const [redeemSuccess, setRedeemSuccess] = useState("");
  const [rewardAnimation, setRewardAnimation] = useState(null);
  const [isWatchingAd, setIsWatchingAd] = useState(false);

  const rewardsList = [
    {
      id: "amazon-voucher",
      title: "₹100 Amazon Voucher",
      description: "A digital gift voucher delivered after redemption.",
      cost: 10000,
      type: "voucher"
    },
    {
      id: "white-tshirt",
      title: "BussInn White T-shirt",
      description: "Classic white cotton T-shirt with BussInn branding.",
      cost: 15000,
      type: "white-shirt"
    },
    {
      id: "black-tshirt",
      title: "BussInn Black T-shirt",
      description: "Black cotton T-shirt with a clean BussInn print.",
      cost: 15000,
      type: "black-shirt"
    },
    {
      id: "bussinn-cap",
      title: "BussInn Logo Cap",
      description: "Everyday cap with the BussInn logo on the front.",
      cost: 12000,
      type: "cap"
    },
    {
      id: "bussinn-bottle",
      title: "BussInn Water Bottle",
      description: "Reusable travel bottle for daily journeys.",
      cost: 9000,
      type: "bottle"
    },
    {
      id: "bussinn-bag",
      title: "BussInn Laptop Bag",
      description: "A practical laptop bag with BussInn branding.",
      cost: 20000,
      type: "laptop-bag"
    }
  ];

  const currentPath = useRouterState({
    select: (state) => state.location.pathname
  });

  const isDriverSection = currentPath.startsWith("/driver");

  const closeDestination = isDriverSection
    ? "/driver/dashboard"
    : "/passenger/search";

  const today = getDateKey();
  const claimedToday = checkInData.lastClaimDate === today;

  const nextDayIndex =
    checkInData.lastClaimDate === getYesterdayKey()
      ? checkInData.streak >= 7
        ? 0
        : checkInData.streak
      : claimedToday
        ? Math.max(0, checkInData.streak - 1)
        : 0;

  const nextReward = DAILY_REWARDS[nextDayIndex];

  useEffect(() => {
    localStorage.setItem("passenger_coins", String(userCoins));
  }, [userCoins]);

  useEffect(() => {
    localStorage.setItem(
      CHECK_IN_STORAGE_KEY,
      JSON.stringify(checkInData)
    );
  }, [checkInData]);

  const handleClaimDailyReward = () => {
    if (claimedToday) return;

    const updatedData = {
      streak: nextDayIndex + 1,
      lastClaimDate: today,
      lastReward: nextReward,
      doubleClaimed: false
    };

    setUserCoins((current) => current + nextReward);
    setCheckInData(updatedData);

    setRewardAnimation({
      amount: nextReward,
      doubled: false
    });
  };

  const handleDoubleReward = () => {
    if (!claimedToday || checkInData.doubleClaimed || isWatchingAd) {
      return;
    }

    setIsWatchingAd(true);

    window.setTimeout(() => {
      setUserCoins((current) => current + checkInData.lastReward);

      setCheckInData((current) => ({
        ...current,
        doubleClaimed: true
      }));

      setIsWatchingAd(false);

      setRewardAnimation({
        amount: checkInData.lastReward * 2,
        doubled: true
      });
    }, 1800);
  };

  const handleRedeem = (reward) => {
    if (userCoins < reward.cost) {
      setRedeemSuccess("You need more coins to redeem this reward.");
      window.setTimeout(() => setRedeemSuccess(""), 3500);
      return;
    }

    setUserCoins((current) => current - reward.cost);

    setRedeemSuccess(
      `${reward.title} redeemed successfully.`
    );

    window.setTimeout(() => setRedeemSuccess(""), 3500);
  };

  return (
    <main className="rewards-page">
      <section className="rewards-app">
        <header className="rewards-blue-header">
          <div className="rewards-top-bar">
            <div className="rewards-brand" aria-label="BussInn">
              <BusFront aria-hidden="true" />
              <span>BussInn</span>
            </div>

            <div className="rewards-top-actions">
              <button className="lang-toggle-pill" type="button">
                <Languages aria-hidden="true" />
                EN / HI
              </button>

              <Link
                to={closeDestination}
                className="close-btn-circle"
                aria-label="Close rewards"
              >
                <X aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="redeem-hero-banner">
            <div>
              <span className="rewards-kicker">BUSSINN REWARDS</span>
              <h1>Spend your journey coins</h1>
              <p>Check in daily and redeem useful travel goodies.</p>
            </div>

            <div className="coins-badge-pill">
              <Coins aria-hidden="true" />
              <span>{userCoins.toLocaleString()} Coins</span>
            </div>
          </div>
        </header>

        <main className="rewards-scroll-body">
          <section className="daily-checkin-card">
            <div className="daily-checkin-header">
              <div>
                <span className="daily-checkin-kicker">DAILY CHECK-IN</span>
                <h2>Collect journey coins</h2>
                <p>Return every day to grow your rewards.</p>
              </div>

              <div className="daily-reward-preview">
                <Coins aria-hidden="true" />
                <strong>+{nextReward}</strong>
              </div>
            </div>

            <div className="checkin-days-row">
              {DAILY_REWARDS.map((coins, index) => {
                const completed =
                  claimedToday
                    ? index < checkInData.streak
                    : checkInData.lastClaimDate === getYesterdayKey() &&
                      index < checkInData.streak;

                const isToday = index === nextDayIndex;

                return (
                  <div
                    className={`checkin-day ${
                      completed ? "completed-day" : ""
                    } ${isToday ? "today-day" : ""}`}
                    key={`day-${index + 1}`}
                  >
                    <span>Day {index + 1}</span>

                    <div className="day-coin">
                      {completed ? (
                        <Check aria-hidden="true" />
                      ) : (
                        <Coins aria-hidden="true" />
                      )}
                    </div>

                    <strong>+{coins}</strong>
                  </div>
                );
              })}
            </div>

            {!claimedToday ? (
              <button
                type="button"
                className="claim-reward-button"
                onClick={handleClaimDailyReward}
              >
                <Coins aria-hidden="true" />
                Claim {nextReward} coins
              </button>
            ) : checkInData.doubleClaimed ? (
              <div className="claimed-reward-status">
                <Check aria-hidden="true" />
                Reward collected for today
              </div>
            ) : (
              <button
                type="button"
                className="double-reward-button"
                onClick={handleDoubleReward}
                disabled={isWatchingAd}
              >
                <Play aria-hidden="true" />
                {isWatchingAd
                  ? "Watching ad..."
                  : `Watch ad to double +${checkInData.lastReward}`}
              </button>
            )}
          </section>

          {redeemSuccess && (
            <div
              className={`redeem-message ${
                redeemSuccess.includes("need") ? "redeem-error" : ""
              }`}
              role="status"
            >
              {redeemSuccess}
            </div>
          )}

          <div className="rewards-list-container">
            {rewardsList.map((item) => (
              <article key={item.id} className="reward-card-image-style">
                <RewardVisual type={item.type} />

                <div className="reward-card-content">
                  <div>
                    <h2 className="reward-title-large">{item.title}</h2>
                    <p className="reward-description">
                      {item.description}
                    </p>
                  </div>

                  <div className="reward-footer-flex">
                    <div className="reward-coin-tag">
                      <Coins aria-hidden="true" />
                      <span className="coin-amount-text">
                        {item.cost.toLocaleString()}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRedeem(item)}
                      className="redeem-btn-pill"
                    >
                      Redeem
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </main>

        {!isDriverSection && <PassengerBottomNav />}
      </section>

      {rewardAnimation && (
        <div className="reward-animation-overlay">
          <div className="reward-animation-card">
            <div className="reward-confetti confetti-one" />
            <div className="reward-confetti confetti-two" />
            <div className="reward-confetti confetti-three" />
            <div className="reward-confetti confetti-four" />

            <div className="reward-animation-coin">
              <Coins aria-hidden="true" />
            </div>

            <span className="reward-animation-kicker">
              {rewardAnimation.doubled
                ? "REWARD DOUBLED"
                : "DAILY REWARD CLAIMED"}
            </span>

            <h2>+{rewardAnimation.amount} Coins</h2>

            <p>
              {rewardAnimation.doubled
                ? "Your ad reward has been added to your wallet."
                : "Your coins have been added to your wallet."}
            </p>

            <button
              type="button"
              onClick={() => setRewardAnimation(null)}
            >
              Great!
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default Rewards;