import { Link } from "@tanstack/react-router";
import "../../styles/Welcome.css";
import { BusFront } from "lucide-react";

const Welcome = () => {
  return (
    <main className="mobile-page-container">
      <section className="app-content welcome-layout">
        <div className="hero-image-area">
          <div
            className="hero-background"
            role="img"
            aria-label="City bus traveling on an urban street"
          />

          <div className="hero-gradient-overlay" />

  <div className="welcome-brand" aria-label="BussInn">
  <svg
    className="brand-bus-icon"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="m21.5,8h-.5v-2c0-2.21-1.79-4-4-4H7c-2.21,0-4,1.79-4,4v2h-.5c-.28,0-.5.22-.5.5v3c0,.28.22.5.5.5h.5v6c0,.74.41,1.37,1,1.72v1.78c0,.28.22.5.5.5h2c.28,0,.5-.22.5-.5v-1.5h10v1.5c0,.28.22.5.5.5h2c.28,0,.5-.22.5-.5v-1.78c.59-.35,1-.98,1-1.72v-6h.5c.28,0,.5-.22.5-.5v-3c0-.28-.22-.5-.5-.5Zm-2.5,10v-6h-6v-5h6v-1,12s0,0,0,0Zm-13-2.5c0-.83.67-1.5,1.5-1.5s1.5.67,1.5,1.5-.67,1.5-1.5,1.5-1.5-.67-1.5-1.5Zm9,0c0-.83.67-1.5,1.5-1.5s1.5.67,1.5,1.5-.67,1.5-1.5,1.5-1.5-.67-1.5-1.5ZM5,7h6v5H5V7Z" />
  </svg>
  <span className="brand-text">BussInn</span>
</div>

          <div className="hero-caption">
            <span className="live-indicator" />
            Live bus locations, powered by the people on board
          </div>
        </div>

        <div className="welcome-content-area">
          <div className="welcome-text-container">
            <span className="welcome-eyebrow">YOUR BUS. IN SIGHT.</span>
            <h1 className="welcome-headline">
              Know when your bus is coming.
            </h1>
            <p className="welcome-subtext">
              Follow local buses in real time with location updates from
              drivers and passengers.
            </p>
          </div>

          <div className="welcome-actions">
            <Link to="/login" className="btn-get-started">
              Get Started
              <span className="button-arrow" aria-hidden="true">
                →
              </span>
            </Link>
            <p className="welcome-footnote">
              A clearer way to get where you’re going.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Welcome;