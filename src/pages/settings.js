// settings.js
import React, { useState } from "react";
import Webcam from "react-webcam";
import styles from "./settings.module.css";

function Settings() {
  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user", // "user" for the front camera, "environment" for the rear camera
  };
  const [sensitivity, setSensitivity] = useState(0);
  const [acceleration, setAcceleration] = useState(0);

  const handleSensitivityChange = (event) => {
    setSensitivity(event.target.value);
  };

  const handleAccelerationChange = (event) => {
    setAcceleration(event.target.value);
  };

  return (
    <div className={styles.container}>
      <div className={styles.cameraContainer}>
        <h1 className={styles.cameraHeading}>Camera Feed</h1>
        <Webcam audio={false} mirrored={true} />
      </div>
      <div className={styles.gestures}>
        <h2 className={styles.settingsHeading}>Settings</h2>
        {/* Select Keyboard Size */}
        <div className={styles.keyboardSize}>
          <span>Select Keyboard Size:</span>
          <button>Small</button>
          <button>Medium</button>
          <button>Large</button>
        </div>

        {/* Select Mode */}
        <div className={styles.keyboardSize}>
          <span>Select Mode:</span>
          <button>Hand-as-Mouse</button>
          <button>Hands Position</button>
        </div>

        {/* Sensitivity Slider */}
        <div className={styles["slider-container"]}>
          <label htmlFor="sensitivity" className={styles["slider-label"]}>
            Sensitivity:
          </label>
          <input
            type="range"
            id="sensitivity"
            className={styles.slider}
            value={sensitivity}
            onChange={handleSensitivityChange}
            min={0}
            max={100}
            step={1}
          />
          <span className={styles["slider-value"]}>{sensitivity}</span>
        </div>

        {/* Acceleration Slider */}
        <div className={styles["slider-container"]}>
          <label htmlFor="acceleration" className={styles["slider-label"]}>
            Acceleration:
          </label>
          <input
            type="range"
            id="acceleration"
            className={styles.slider}
            value={acceleration}
            onChange={handleAccelerationChange}
            min={0}
            max={100}
            step={1}
          />
          <span className={styles["slider-value"]}>{acceleration}</span>
        </div>
      </div>
    </div>
  );
}

export default Settings;
