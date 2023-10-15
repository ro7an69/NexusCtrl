// SignUp.js
import { createUserWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { auth } from "../../pages/sign";
import './SignUp.css'; // Import the CSS file

function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState(null);
  const [error, setError] = useState(null);

  const signUp = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setSuccessMessage(null);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("User registered:", user);

      setSuccessMessage("Account successfully created");
      setError(null);
    } catch (error) {
      console.error("Sign-up error:", error);
      setError(error.message);
      setSuccessMessage(null);
    }
  };

  return (
    <div className="sign-in-container">
      <form onSubmit={signUp}>
        <div className="input-label">
          <label>Email:</label>
        </div>
        <div className="input-container">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="input-line"></div>
        </div>
        <div className="input-label">
          <label>Password:</label>
        </div>
        <div className="input-container">
          <input
            type="password"
            placeholder="*********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="input-line"></div>
        </div>
        <div className="input-label">
          <label>Confirm Password:</label>
        </div>
        <div className="input-container">
          <input
            type="password"
            placeholder="***********"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <div className="line"></div>
        </div>
        <button type="submit" className="login-button">Register</button>
        {successMessage && <p className="success-message">{successMessage}</p>}
        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
}

export default SignUp;
