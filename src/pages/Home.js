import React, { useEffect, useState } from 'react';
import { auth, provider } from "./sign";
import { signInWithPopup, signOut } from "firebase/auth";
import styles from './home.module.css';
import CameraFeed from './CameraFeed';
import googleLogo from "../assets/Google_Logo.png";
import SignIn from '../components/auth/SignIn';
import SignUp from '../components/auth/SignUp';

function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  const handleClick = () => {
    signInWithPopup(auth, provider)
      .then((data) => {
        setEmail(data.user.email);
        localStorage.setItem("email", data.user.email);
        setIsLoggedIn(true);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        localStorage.removeItem("email");
        setIsLoggedIn(false);
        setEmail('');
      })
      .catch((error) => {
        console.error(error);
      });
  }

  useEffect(() => {
    const storedEmail = localStorage.getItem('email');
    if (storedEmail) {
      setEmail(storedEmail);
      setIsLoggedIn(true);
    }
  }, []);

  const handleShowSignIn = () => {
    setShowSignIn(!showSignIn); // Toggle the state
    setShowSignUp(false); // Close the "Sign Up" component
  }

  const handleShowSignUp = () => {
    setShowSignUp(!showSignUp); // Toggle the state
    setShowSignIn(false); // Close the "Sign In" component
  }

  return (
    <div className={`${styles.container} ${styles.pageTransition} mt-8`}>
      <div className={`${styles.cameraContainer} ${styles.cameraTransition} ml-16`}>
        <h1 className={styles.CameraTitle}>Camera Feed</h1>
        <CameraFeed />
      </div>
      <div className={`${styles.signUpContainer} flex justify-center items-center`} style={{ backgroundColor: '#DCE6FF47', minHeight: '60vh' }}>
        <h1 className={`${styles.welcomeTitle} text-4xl mb-4`}>Welcome</h1>
        <div className={styles.parent}>
          <div className={styles.child} onClick={handleShowSignIn}>Sign In</div>
          <div className={styles.child} onClick={handleShowSignUp}>Sign Up</div>
        </div>
        {showSignIn && <SignIn />}
        {showSignUp && <SignUp />}

        {isLoggedIn ? (
          <div>
            <p>Welcome, {email}</p>
            <button onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <div className={styles.googleSignInContainer}>
            <div className={styles.loginButtonContainer} style={{ marginRight: '10px' }}>
              <button onClick={handleClick} className={`${styles.loginButton} bg-white text-black px-4 py-2 rounded hover-bg-gray-300`}>
                <img src={googleLogo} alt="Google Logo" className={styles.googleLogo} />
                Login with Google
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
