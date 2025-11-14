import { useState, useEffect } from "react";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import { adminLogout } from "./utils/authAPI";

function App() {
  // Initialize login state from localStorage so a saved token persists across refresh
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
    () => !!localStorage.getItem("admin_token")
  );

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    // Call logout API to invalidate session on backend
    await adminLogout();
    // Remove stored token when logging out
    localStorage.removeItem("admin_token");
    setIsLoggedIn(false);
  };

  // Keep state in sync if token is added/removed in another tab
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "admin_token") {
        setIsLoggedIn(!!localStorage.getItem("admin_token"));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <>
      {isLoggedIn ? (
        <AdminDashboard onLogout={handleLogout} />
      ) : (
        <AdminLogin onLogin={handleLogin} />
      )}
    </>
  );
}

export default App;
