import { useState, useEffect } from "react";
import LoginPage from "./pages/LoginPage";
import PortfolioSummary from "./components/PortfolioSummary";

function App() {
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("loggedInUser");
    if (savedUser) {
      setUser(savedUser);
    }
  }, []);

  const handleLogin = (username: string) => {
    setUser(username);
  };

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    setUser(null);
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div>
      <header style={{ display: "flex", justifyContent: "space-between", padding: "1rem" }}>
        <h1>folio-fast-track</h1>
        <div>
          <span>Welcome, {user}</span>
          <button onClick={handleLogout} style={{ marginLeft: "1rem" }}>
            Logout
          </button>
        </div>
      </header>
      <PortfolioSummary />
    </div>
  );
}

export default App;
