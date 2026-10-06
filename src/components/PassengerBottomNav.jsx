import { Link, useRouterState } from "@tanstack/react-router";
import "../styles/PassengerBottomNav.css";

const navItems = [
  { label: "Search", to: "/passenger/search" },
  { label: "Ride", to: "/passenger/history" },
  { label: "Rewards", to: "/passenger/rewards" },
  { label: "Profile", to: "/passenger/profile" }
];

const PassengerBottomNav = () => {
  const pathname = useRouterState({
    select: (state) => state.location.pathname
  });

  const activeIndex = Math.max(
    0,
    navItems.findIndex((item) => pathname.startsWith(item.to))
  );

  return (
    <nav className="bottom-nav passenger-bottom-nav">
      <span
        className="bottom-nav-active-indicator"
        style={{
          transform: `translateX(${activeIndex * 100}%)`
        }}
        aria-hidden="true"
      />

      {navItems.map((item, index) => (
        <Link
          key={item.to}
          to={item.to}
          className={`bottom-nav-item ${
            index === activeIndex ? "active-tab" : ""
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
};

export default PassengerBottomNav;