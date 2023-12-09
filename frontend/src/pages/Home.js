import React, { useEffect, useState } from 'react';
import { auth } from './sign'; // Importing 'auth' from a file named 'sign'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'; // Firebase authentication methods
import styles from './home.module.css'; // CSS styles
import { FaUser, FaLock } from 'react-icons/fa'; // Icons for username and password fields
import { createUserWithEmailAndPassword } from "firebase/auth"; // Firebase method for creating user accounts
import { getDatabase, ref, get } from "firebase/database"; // Firebase Realtime Database methods
import socketIOClient from 'socket.io-client'; // Socket.io client for WebSocket connections

// ... (previous imports and code)

const Home = () => {
  // State variables using React's useState hook
  const [email, setEmail] = useState(''); // Email state
  const [password, setPassword] = useState(''); // Password state
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [selectedButton, setSelectedButton] = useState('signIn');
  const [authUser, setAuthUser] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [confirmPassword, setConfirmPassword] = useState("");

  // Function to handle user registration (sign up)
  const signUp = async (e) => {
    e.preventDefault();// Prevent default form submission behavior

     // Check if passwords match
    if (password !== confirmPassword) {
      
      setError("Passwords do not match");// Set error message if passwords don't match
      setSuccessMessage(null);
      return;// Exit function if passwords don't match
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("User registered:", user);// Log user information upon successful registration

      setSuccessMessage("Account successfully created");
      setError(null);
    } catch (error) {
      console.error("Sign-up error:", error);
      setError(error.message);
      setSuccessMessage(null);
    }
  };
 // Function to handle user sign-in
  const handleSignIn = async (e) => {
    e.preventDefault();// Prevent default form submission behavior
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      const userName = firebaseUser.email.split('@')[0];// Extract username from email

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
         {/* Buttons for Sign In and Sign Up */}
        <div className={styles.parent}>
           {/* Show buttons only if the user is not authenticated */}
          {!authUser && (
            <>
            {/* Sign In button */}
              <div
                className={`${styles.child} ${styles.buttonWithBorder}`}
                onClick={handleShowSignIn}
                style={{
                  backgroundColor: selectedButton === 'signIn' ? '#84A0BD' : '#DCE6FF47',
                }}
                id="signInButton">
                Sign In
              </div>
              {/* Sign Up button */}
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
            {/* Sign In section */}
          {showSignIn && (
            <div className={styles.signInContainer}>
               {/* If user is authenticated, show success message and logout button */}
              {authUser ? (
                <div className={styles.successMessage}>
                  {<p className={styles.message}>You are logged in as {storedName}</p>}
                  <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
                </div>
              ) : (
                // If user is not authenticated, show Sign In form
                <form onSubmit={handleSignIn}> 
                 {/* Email input */}
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
                  {/* Password input */}
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
                   {/* Login button */}
                  <button type="submit" className={styles.loginButton}>Login</button>
                   {/* Display error message if any */}
                  {error && <div className={styles.errorMessage}>{error}</div>}
                </form>
              )}
            </div>
          )}
          {/* Sign Up section */}
          {showSignUp && (
            <div className={styles.signInContainer}>
            {authUser ? (
              <div className={styles.successMessage}>
                {<p className={styles.message}>You are logged in as {storedName}</p>}
                <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
              </div>
            ) : (
               // Show Sign Up form if user is not authenticated
              <form onSubmit={signUp}>
                 {/* Email input */}
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
                 {/* Password input */}
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
                <div className={styles.formGroup}>
                   {/* Confirm Password input */}
                  <label htmlFor="confirmPassword" className={styles.iconLabel}>

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
                 {/* Register button */}
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