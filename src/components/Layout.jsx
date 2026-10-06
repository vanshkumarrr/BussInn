import "../styles/Layout.css";

// Generic page layout wrapper — placeholder only, no styling.
// TODO: Add shared header / safe-area / page transitions here later.
const Layout = ({ children, footer }) => {
  return (
    <div className="layout">
      <div className="layout-content">{children}</div>
      {footer ? <div className="layout-footer">{footer}</div> : null}
    </div>
  );
};

export default Layout;
