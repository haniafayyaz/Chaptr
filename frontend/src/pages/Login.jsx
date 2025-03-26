import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/login.css"; // Ensure correct import

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    alert("Login successful!");
  };

  return (
    <div>
      <div className="login-container">
        <div className="login-card">
          <h1 className="app-name">Chaptr</h1>
          <h2 className="heading">Login</h2>
          <p className="text">Enter your credentials to access your account</p>

          {error && <div className="error-alert">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="label">Email</label>
              <input
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input"
              />
            </div>

            <div className="input-group">
              <label className="label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input"
              />
            </div>

            <button type="submit" className="button">Login</button>
          </form>

          <div className="signup-text">
            Don't have an account? <Link to="/register" className="link">Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
