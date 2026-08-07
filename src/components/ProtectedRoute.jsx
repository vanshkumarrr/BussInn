// ProtectedRoute — placeholder only.
// TODO: Add authentication check here (read user/session from auth context).
// TODO: Redirect to /login when the user is not authenticated.
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = true; // TODO: replace with real auth state

  if (!isAuthenticated) {
    // TODO: use useNavigate() or <Navigate /> equivalent to send user to /login
    return null;
  }

  return children;
};

export default ProtectedRoute;
