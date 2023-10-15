import React, { useEffect, startTransition } from 'react';
import Webcam from 'react-webcam';

function CameraFeed() {
  useEffect(() => {
    const cleanupWebcam = () => {
      // Clean up the webcam or any other resources here
    };

    startTransition(() => {
      // Initialize any resources (e.g., webcam) here
      // This code will be treated as a low-priority update
    });

    return () => {
      cleanupWebcam();
    };
  }, []);

  return (
    <div>
      <Webcam audio={false} mirrored={true} />
    </div>
  );
}

export default CameraFeed;
