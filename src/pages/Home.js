import React from 'react';
import Webcam from 'react-webcam';
import { FaEnvelope } from 'react-icons/fa'; // Import the email icon
import styles from './home.module.css';

function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.cameraContainer}>
        <h1>Camera Feed</h1>
        <Webcam 
          audio={false}
          mirrored={true}
        />
      </div>
      <div className={styles.signUpContainer}>
        <h1 className={styles.welcomeTitle}>Welcome to NexusCtrl</h1>
        <div className={styles.emailContainer}>
          <FaEnvelope className={styles.emailIcon} />
          <p className={styles.emailText}>Email:</p>
        </div>
        {/* Add the email input text box */}
        <div className={styles.emailInputContainer}>
          <input
            type="email"
            className={styles.emailInput}
            placeholder="Enter your email"
          />
        </div>
        {/* Add the login button */}
        <div className={styles.loginButtonContainer}>
          <button className={styles.loginButton}>Log In</button>
        </div>
        {/* Add your sign-up form or content here */}
      </div>
    </div>
  );
}

export default Home;
