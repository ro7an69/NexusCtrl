import React, { useEffect, useState } from 'react';
import { auth } from './sign';
import {signInWithEmailAndPassword, signOut } from 'firebase/auth';
import styles from './home.module.css';
import { FaUser, FaLock } from 'react-icons/fa';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { getDatabase, ref, get } from "firebase/database";
import socketIOClient from 'socket.io-client';

// ... (previous imports and code)

const Home = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState("");
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [selectedButton, setSelectedButton] = useState('signIn');
  const [authUser, setAuthUser] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [confirmPassword, setConfirmPassword] = useState("");

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

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      const userName = firebaseUser.email.split('@')[0];

      // Success message with user name
      setSuccessMessage(`Logged in as ${userName}`);
      localStorage.setItem('userName', userName);

      // Selectively create an object with the required user information
      const userToSave = {
        uid: firebaseUser.uid,  // User's UID
        email: firebaseUser.email, // User's email
        // Add any other necessary information here
      };

      setAuthUser(userToSave);
      localStorage.setItem('authUser', JSON.stringify(userToSave)); // Save the selected user information to local storage
     
      const db = getDatabase();
      const dataRef = ref(db, userToSave.uid);

      const snapshot = await get(dataRef);
      if (snapshot.exists()) {
        const userGestures = [];
        const jsonData = JSON.parse(snapshot.val().data);

        // Iterate over the function keys and add their values to the userGestures array
        for (let i = 0; i <= 12; i++) {
            const functionName = jsonData[`function${i}`];
            if (functionName !== undefined) {
                userGestures.push(functionName);
            }
        }
        localStorage.setItem('userGestures', JSON.stringify(userGestures)); // Save the selected user information to local storage
        localStorage.setItem('userSettings', JSON.stringify(jsonData));

        const SERVER_URL = 'http://127.0.0.1:5001';
        const socket = socketIOClient(SERVER_URL);
        socket.on('connect', () => {
          console.log('Socket connected:', socket.id);
          // Emit the event
          socket.emit('getSettings', jsonData);
          // Terminate the socket connection when not in use
          socket.disconnect();
          console.log('Socket disconnected');
        });
      } else {
        console.log('uid doesnt exist')
        localStorage.removeItem('userSettings');
        localStorage.removeItem('userGestures');
      }
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

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setAuthUser(null);
      localStorage.removeItem('authUser'); // Remove user from local storage
      localStorage.removeItem('userName');
      localStorage.removeItem('userSettings');
      localStorage.removeItem('userGestures');
    } catch (error) {
      setError("Error logging out: " + error.message); // Set logout error
    }

    // If the user is authenticated, do not render the SignIn component
    if (authUser) {
      return (
        <div className={styles.successMessage}>
          {successMessage && <p className={styles.message}>{successMessage}</p>}
          {/* You can add further content or redirect the user here */}
        </div>
      );
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('authUser');
    if (storedUser) {
      setAuthUser(JSON.parse(storedUser));
    }
    handleShowSignIn();
  }, [])

  const storedName = localStorage.getItem('userName');

  const handleShowSignIn = () => {
    setSelectedButton('signIn');
    setShowSignIn(!showSignIn);
    setShowSignUp(false);
  };

  const handleShowSignUp = () => {
    setSelectedButton('signUp');
    setShowSignUp(!showSignUp);
    setShowSignIn(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.right}>
        <div className={styles.homeHeader}>
          <div className={styles.homeTitle}>Home</div>
        </div>
        <div className={styles.parent}>
          {!authUser && (
            <>
              <div
                className={`${styles.child} ${styles.buttonWithBorder}`}
                onClick={handleShowSignIn}
                style={{
                  backgroundColor: selectedButton === 'signIn' ? '#84A0BD' : '#DCE6FF47',
                }}
                id="signInButton">
                Sign In
              </div>
              <div
                className={`${styles.child} ${styles.buttonWithBorder}`}
                onClick={handleShowSignUp}
                style={{
                  backgroundColor: selectedButton === 'signUp' ? '#84A0BD' : '#DCE6FF47',
                }}
                id="signUpButton">
                Sign Up
              </div>
            </>
          )}
        </div>
        <div>
          {showSignIn && (
            <div className={styles.signInContainer}>
              {authUser ? (
                <div className={styles.successMessage}>
                  {<p className={styles.message}>You are logged in as {storedName}</p>}
                  <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
                </div>
              ) : (
                <form onSubmit={handleSignIn}>
                  <div className={styles.formGroup}>
                    <label htmlFor="email" className={styles.iconLabel}>
                      <FaUser className={styles.inputIcon} />
                      <span className={styles.inputText}>Username:</span>
                      <input
                        type="email"
                        id="email"
                        className={styles.placeholderStyling5}
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </label>
                  </div>
                  <div className={styles.line}></div>
                  <div className={styles.formGroup}>
                    <label htmlFor="password" className={styles.iconLabel}>
                      <FaLock className={styles.inputIcon} />
                      <span className={styles.inputText}>Password:</span>
                      <input
                        type="password"
                        id="password"
                        className={styles.placeholderStyling5}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </label>
                  </div>
                  <div className={styles.line}></div>
                  <button type="submit" className={styles.loginButton}>Login</button>
                  {error && <div className={styles.errorMessage}>{error}</div>}
                </form>
              )}
            </div>
          )}
          {showSignUp && (
            <div className={styles.signInContainer}>
            {authUser ? (
              <div className={styles.successMessage}>
                {<p className={styles.message}>You are logged in as {storedName}</p>}
                <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
              </div>
            ) : (
              <form onSubmit={signUp}>
                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.iconLabel}>
                    {/* Assuming you have a user icon similar to the login form */}
                    <FaUser className={styles.inputIcon} />
                    <span className={styles.inputText}>Username:</span>
                    <input
                      type="email"
                      id="email"
                      className={styles.placeholderStyling5}
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </label>
                </div>
                <div className={styles.line}></div>
                <div className={styles.formGroup}>
                  <label htmlFor="password" className={styles.iconLabel}>
                    {/* Assuming you have a lock icon similar to the login form */}
                    <FaLock className={styles.inputIcon} />
                    <span className={styles.inputText}>Password:</span>
                    <input
                      type="password"
                      id="password"
                      className={styles.placeholderStyling5}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </label>
                </div>
                <div className={styles.line}></div>
                <div className={styles.formGroup}>
                  <label htmlFor="confirmPassword" className={styles.iconLabel}>
                    {/* Assuming you have a lock icon similar to the login form */}
                    <FaLock className={styles.inputIcon} />
                    <span className={styles.inputText}>Confirm Password:</span>
                    <input
                      type="password"
                      id="confirmPassword"
                      className={styles.placeholderStyling5}
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </label>
                </div>
                <div className={styles.line}></div>
                <button type="submit" className={styles.loginButton}>Register</button>
                {successMessage && <p className={styles.message}>{successMessage}</p>}
                {error && <p className={styles.errorMessage}>{error}</p>}
              </form>
            )}
          </div>          
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;