// Import necessary React hooks and components
import React, { useState, useEffect, useRef } from "react";
import Navbar from './components/Navbar'; // Import Navbar component
import './App.css'; // Import CSS styles
import Home from "./pages/Home"; // Import Home page component
import Gestures from "./pages/gestures"; // Import Gestures page component
import Settings from "./pages/setting"; // Import Settings page component
import socketIOClient from 'socket.io-client'; // Import socket.io-client library for WebSocket connections
import { UserProvider } from "./components/auth/UserContext"; // Import UserProvider from UserContext for authentication

function App() {
  // State variables to manage component visibility and image data
  const [showHome, setShowHome] = useState(true);
  const [showGestures, setShowGestures] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [receivedImage, setReceivedImage] = useState('');
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const imageRef = useRef(null);

  // Callback functions to update state based on Navbar events
  const handleShowHome = () => {
    setShowHome(true);
    setShowGestures(false);
    setShowSettings(false);
  };

  const handleShowSettings = () => {
    setShowSettings(true);
    setShowGestures(false);
    setShowHome(false);
  };

  const handleShowGestures = () => {
    setShowHome(false);
    setShowGestures(true);
    setShowSettings(false);
  };

  useEffect(() => {
    const socket = socketIOClient('http://localhost:5001'); 
    socket.on('receive_image', (data) => {
      const imageData = data.image;
      setReceivedImage('data:image/png;base64,' + imageData);
    });

    // Clean up the socket connection when the component unmounts
    return () => {
      socket.disconnect();
    };
  }, []);

  // Function to handle image load
  const handleImageLoad = () => {
    const width = imageRef.current.naturalWidth;
    const height = imageRef.current.naturalHeight;
    setImageDimensions({ width, height });
  };
 // Render components based on state variables
  return (
    <UserProvider>
    <div className="app">
         {/* Navbar component */}
      <header>
        <Navbar
          onShowHome={handleShowHome}
          onShowGestures={handleShowGestures}
          onShowSettings={handleShowSettings}
        />
      </header>
       {/* Main content */}
      <main className="main-content">
        <div className="flex-container left-flexbox">
        <div className="cameraTitle">Camera Feed</div>
        {/* Display received image if available */}
          {receivedImage && <img ref={imageRef} onLoad={handleImageLoad} src={receivedImage} alt="Received" />}
        </div>
        <div className="flex-container right-flexbox">
           {/* Render different pages based on state */}
          {showHome && <div><Home /></div>}
          {showGestures && <div><Gestures /></div>}
          {showSettings && <div><Settings imageDimensions={imageDimensions} /></div>}
        </div>
      </main>
    </div>
    </UserProvider>
  );
};

export default App;
