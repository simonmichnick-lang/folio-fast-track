import { useState } from "react";

export default function LoginPage({ onLogin }: { onLogin: (user: string) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // For now: accept a hardcoded "demo" login
    if (username === "demo" && password === "1234") {
      localStorage.setItem("loggedInUser", username);
      onLogin(username); // tell parent app we logged in
    } else {
      setError("Invalid credentials");
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 320, margin: "auto" }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">Log In</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
