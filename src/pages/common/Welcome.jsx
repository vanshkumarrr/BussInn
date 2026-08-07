import { Link } from "@tanstack/react-router";
import "../../styles/Welcome.css";

const Welcome = () => {
  return (
    <div className="mobile-page-container">
      <div className="app-content welcome-layout">
        
        {/* Hero Image Area */}
        <div className="hero-image-area">
          <div 
            className="hero-background"
            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAHyloe2pZwb5-FkiY5jGeAhKtPl37rSAUw8OnDq1wwEu8NQHvNKLOV4LHKbtGb1mrlqovMEHlZpZydBViCQBmhM2JBZjFf5ac182cIweSuouYV6DF14zRwyzr4RjkcG9nONbTGrrFYqhjkK75_YO5xd5BnFn6kE63tJIgB4HoQN_tbMsIFqk_28EAJNvlPT5f5CSwdhQh-GLK-7ZcU1e0k6m00pnSBZLRvZMZKyREuFoBC6OePvohj')" }}
            title="A modern electric bus in an urban environment"
          ></div>
          <div className="hero-gradient-overlay"></div>
          
          {/* Top Brand Name */}
          <div className="welcome-brand">
            <span className="brand-text">BussInn</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="welcome-content-area">
          <div className="welcome-text-container">
            <h1 className="welcome-headline">Re-imagining Urban Transit</h1>
            <p className="welcome-subtext">
              Experience seamless, predictable, and rewarding travel across the city.
            </p>
          </div>

          {/* Action Button */}
          <div className="welcome-actions">
            <Link to="/login" className="btn-get-started">
              Get Started
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Welcome;