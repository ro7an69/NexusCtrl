import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { auth } from "../../pages/sign";
import { FaUser, FaLock } from "react-icons/fa";
import styles from './SignIn.css';

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authUser, setAuthUser] = useState(null);
  const [isSignInVisible, setIsSignInVisible] = useState(true); // Set to true to display the content initially

  const handleSignIn = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      setAuthUser(user);
    } catch (error) {
      console.error("Sign-in error:", error);
    }
  };

  return (
    <div className="sign-in-container">
      {isSignInVisible && (
        <form onSubmit={handleSignIn}>
          <div className="form-group">
            <label htmlFor="email" className="icon-label">
              <span className="input-text">Username:</span>
              <FaUser className="input-icon" />
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
              <span className="input-text">Password:</span>
              <FaLock className="input-icon" />
              <input
                type="password"
                id="password"
                placeholder="****"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
          </div>
          <div className="line"></div>
          <button type="submit" className="login-button">Login</button>
        </form>
      )}
    </div>
  );
};

export default SignIn;
