import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { auth } from "../../pages/sign";
import { FaUser, FaLock } from "react-icons/fa";
import './SignIn.css';

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authUser, setAuthUser] = useState(null);
  const [isSignInVisible] = useState(true);
  const [error, setError] = useState(null); // Add state for error messages

  const handleSignIn = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      setAuthUser(user);
    } catch (error) {
      // Set error messages based on error type
      if (error.code === "auth/wrong-password") {
        setError("Incorrect password. Please try again.");
      } else if (error.code === "auth/user-not-found") {
        setError("Account doesn't exist. Please register.");
      } else {
        setError("Sign-in error: " + error.message);
      }
    }
  };

  // If the user is authenticated, do not render the SignIn component
  if (authUser) {
    return null;
  }

  return (
    <div className="sign-in-container">
      {isSignInVisible && (
        <form onSubmit={handleSignIn}>
          <div className="form-group">
            <label htmlFor="email" className="icon-label">
              <FaUser className="input-icon" />
              <span className="input-text">Username: </span>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
          </div>
          <div className="line"></div>
          <div className="form-group">
            <label htmlFor="password" className="icon-label">
              <FaLock className="input-icon" />
              <span className="input-text">Password:</span>
              <input
                type="password"
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
          </div>
          <div className="line"></div>
          <button type="submit" className="login-button">Login</button>

          {/* Error messages */}
          {error && <div className="error-message">{error}</div>}
        </form>
      )}
    </div>
  );
};

export default SignIn;
