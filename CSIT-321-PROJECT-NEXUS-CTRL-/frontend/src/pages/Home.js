import React, { useEffect, useState, useRef } from 'react';

import { auth, provider } from './sign';
import { signInWithPopup} from 'firebase/auth';
import styles from './home.module.css';
import SignIn from '../components/auth/SignIn';
import SignUp from '../components/auth/SignUp';
import AuthDetails from '../components/auth/AuthDetails';
import socketIOClient from 'socket.io-client';


function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [selectedButton, setSelectedButton] = useState('signIn'); // Default to SignIn
  const [receivedImage, setReceivedImage] = useState('');

  const handleClick = () => {
    
    signInWithPopup(auth, provider)
      .then((data) => {
        setEmail(data.user.email);
        localStorage.setItem('email', data.user.email);
        setIsLoggedIn(true);
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
    const socket = socketIOClient('http://localhost:5001'); 
    socket.on('receive_image', (data) => {
      const imageData = data.image;
      setReceivedImage('data:image/png;base64,' + imageData);
    });
    handleShowSignIn();
  
    // Clean up the socket connection when the component unmounts
    return () => {
      socket.disconnect();
    };
  }, [])
  

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
        </div>
        <div>
            {showSignIn && <SignIn />}
            {showSignUp && <SignUp />}
          </div>
        </div>
      </div>
    );
}

export default Home;