import React, { useEffect, useState, useRef } from 'react';
import Webcam from 'react-webcam';

function CameraFeed() {
  const webcamRef = useRef(null);
  const [isPiPSupported, setPiPSupported] = useState(false);
  const [isPiPMode, setPiPMode] = useState(false);

  const handlePiPClick = async () => {
    if (isPiPSupported) {
      if (!isPiPMode) {
        try {
          await webcamRef.current.video.requestPictureInPicture();
          setPiPMode(true);
          // Add a class to style the button when PiP mode is enabled
          document.querySelector('.pip-button').classList.add('pip-mode-enabled');
        } catch (error) {
          console.error(error);
        }
      } else {
        try {
          await document.exitPictureInPicture();
          setPiPMode(false);
          // Remove the class when PiP mode is exited
          document.querySelector('.pip-button').classList.remove('pip-mode-enabled');
        } catch (error) {
          console.error(error);
        }
      }
    } else {
      console.log('Picture-in-Picture is not supported in this browser.');
    }
  };

  useEffect(() => {
    if ('pictureInPictureEnabled' in document) {
      setPiPSupported(true);
      const video = webcamRef.current.video;
      video.addEventListener('enterpictureinpicture', () => {
        setPiPMode(true);
      });
      video.addEventListener('leavepictureinpicture', () => {
        setPiPMode(false);
      });
    }
  }, []);

  const pipButtonText = isPiPMode ? 'Exit PiP Mode' : 'Enable PiP Mode';

  return (
    <div>
      {isPiPSupported && (
        <button
          onClick={handlePiPClick}
          className={isPiPMode ? 'pip-button pip-mode-enabled' : 'pip-button'}
          style={{
            fontSize: isPiPMode ? '20px' : '20px',
            backgroundColor: '#84A0BD', // Background color
            color: '#000000', // Text color
            border: '2px solid #84A0BD', // Border
          }}
        >
          {pipButtonText}
        </button>
      )}
      <Webcam audio={false} mirrored={true} ref={webcamRef} />
    </div>
  );
  
          
}

export default CameraFeed;