import { useRouter } from "@tanstack/react-router";
import { X, ArrowLeft } from "lucide-react";
import "../styles/BackButton.css";

/**
 * Aesthetic close / back control for pages that have no other way back.
 * variant: "cross" (default) | "arrow"
 * fallback: route to go to when there is no history to go back to.
 */
const BackButton = ({ variant = "cross", fallback = "/", label = "Go back" }) => {
  const router = useRouter();

  const handleClick = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.history.back();
    } else {
      router.navigate({ to: fallback });
    }
  };

  return (
    <button type="button" className="bn-back-btn" onClick={handleClick} aria-label={label}>
      {variant === "arrow" ? <ArrowLeft size={18} /> : <X size={18} />}
    </button>
  );
};

export default BackButton;
