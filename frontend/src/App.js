import React, { useState, useEffect, useRef } from "react";
import Navbar from './components/Navbar';
import './App.css';
import Home from "./pages/Home";
import Gestures from "./pages/gestures";
import Settings from "./pages/setting";
import socketIOClient from 'socket.io-client';

function App() {
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
      console.log('Received image')
      const imageData = data.image;
      setReceivedImage('data:image/png;base64,' + imageData);
    });

    socket.on('checker', (data) => {
      console.log(data)
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

  return (
    <div className="app">
      <header>
        <Navbar
          onShowHome={handleShowHome}
          onShowGestures={handleShowGestures}
          onShowSettings={handleShowSettings}
        />
      </header>
      <main className="main-content">
        <div className="flex-container left-flexbox">
        <div className="cameraTitle">Camera Feed</div>
          {receivedImage && <img ref={imageRef} onLoad={handleImageLoad} src={receivedImage} alt="Received" />}
        </div>
        <div className="flex-container right-flexbox">
          {showHome && <div><Home /></div>}
          {showGestures && <div><Gestures /></div>}
          {showSettings && <div><Settings imageDimensions={imageDimensions} /></div>}
        </div>
      </main>
    </div>
  );
};

export default App;
