import "../styles/Button.css";

// Reusable button — placeholder only, no styling.
// TODO: Add variants (primary / secondary / ghost) when designing.
const Button = ({ children, onClick, type = "button" }) => {
  return (
    <button className="button" type={type} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
