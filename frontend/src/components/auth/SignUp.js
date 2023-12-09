import { createUserWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { auth } from "../../pages/sign";
import './SignUp.css'; 

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
    <div className="sign-up-container">
      <form onSubmit={signUp}>
      <div className="form-group">

              <span className="input-text">Username:</span>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            
          </div>
          <div className="line-sign"></div>
          <div className="form-group">
           
              <span className="input-text">Password:</span>
              
              <input
                type="password"
                id="password"
                placeholder="Enter your password"
               
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            
          </div>
          <div className="line-sign"></div>
          <div className="form-group">
            
              <span className="input-text"> Confirm Password:</span>
              
              <input
              type="password"
              placeholder="Re-enter password"
          
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
           
          </div>
          <div className="line-sign"></div>
          <button type="submit" className="sign-button">Register</button>
        {successMessage && <p className="success-message">{successMessage}</p>}
        {error && <p className="error-message">{error}</p>}
          
       
      </form>
    </div>
  );
}

export default SignUp;
