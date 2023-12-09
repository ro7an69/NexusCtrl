import React, { useState, useEffect } from 'react';
import styles from './settings.module.css';
import socketIOClient from 'socket.io-client';// Import socket.io-client library for WebSocket connections
import { saveSettingsToFirebase } from './firebaseSaveUtils'// Import function to save settings to Firebase

function Settings() {
  // State variables to manage different settings and alert display
  const [keyboardSize, setkeyboardSize] = useState('medium');
  const [scalingFactor, setscalingFactor] = useState(2);
  const [smoothingFactor, setsmoothingFactor] = useState(0.5);
  const [Deadzone, setDeadzone] = useState(0);
  const [testingMode, setTestingMode] = useState(false);
  const [delayFrame, setDelayFrame] = useState('medium');
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
     // Load saved settings from local storage on component mount
    const storedSettings = localStorage.getItem('userSettings');
    console.log(storedSettings)
    if (storedSettings) {
      const parsedSettings = JSON.parse(storedSettings);
      setkeyboardSize(parsedSettings.keyboardSize);
      setscalingFactor(parsedSettings.scalingFactor);
      setsmoothingFactor(parsedSettings.smoothingFactor);
      setDeadzone(parsedSettings.Deadzone);
      if (parsedSettings.testingMode === false) {
        setTestingMode(false);
      } else {
        setTestingMode(true);
      }
      setDelayFrame(parsedSettings.delayFrame);
    } else {
      // If no settings are found in localStorage, set default values
      setkeyboardSize('medium');
      setscalingFactor(2);
      setsmoothingFactor(0.4);
      setDeadzone(0);
      setTestingMode(false);
      setDelayFrame('medium');
    }
  }, []);
   // Functions to handle changes in different settings
   // Functions to handle changes in keyboard size
  const handleSizeChange = (size) => {
    setkeyboardSize(size);
  };
// Functions to handle changes in senstivity
  const handleScalingFactorChange = (value) => {
    setscalingFactor(value);
  };
// Functions to handle changes in smoothness
  const handlesmoothingFactor = (value) => {
    setsmoothingFactor(value);
  };
// Functions to handle changes in deadzone
  const handleDeadzoneChange = (value) => {
    setDeadzone(value);
  };
// Functions to handle changes in test mode
  const handleTestingModeChange = () => {
    setTestingMode(!testingMode);
  };

  const handleDelayFrameChange = (frame) => {
    setDelayFrame(frame);
  };
  // Function triggered on save button click
  const handleSaveClick = () => {
    // Prepare settings to save
    const settingsToSave = {
      keyboardSize,
      scalingFactor,
      smoothingFactor,
      Deadzone,
      testingMode,
      delayFrame,
    };

    // Save settings to localStorage (or you can save it to Firebase as per your requirement)
    localStorage.setItem('userSettings', JSON.stringify(settingsToSave));

    // Show a confirmation message
    setShowAlert(true);

    setTimeout(() => {
      const alertElement = document.querySelector('.customAlert');
      if (alertElement) {
        alertElement.classList.add('fadeOut');
      }
    }, 1500);
  
    // After 2 seconds (including fade-out duration), hide the alert
    setTimeout(() => {
      setShowAlert(false);
    }, 2000);

    const SERVER_URL = 'http://127.0.0.1:5001';
    const socket = socketIOClient(SERVER_URL);

    // Log the socket connection status
    console.log('Socket connection status:', socket.connected);
    const storedUser = localStorage.getItem('authUser');
    if (storedUser) {
       // Emit settings-saved event and save settings to Firebase if authenticated
      socket.emit('settings-saved', settingsToSave);
      const authUser = JSON.parse(storedUser);
      // Terminate the socket connection when not in use
      socket.on('settings', (data) => {
        const saveData = {
          data,
          uid: authUser.uid,
        };
        saveSettingsToFirebase(saveData).then(() => {
          console.log('Settings saved successfully');
          // Further UI updates or notifications
        })
        .catch(error => {
          console.error('Error saving settings:', error);
        });
        socket.disconnect();
        console.log('Socket disconnected');
      });
    }
    else {
      socket.on('connect', () => {
        console.log('Socket connected:', socket.id);
        // Emit the event
        socket.emit('settings-saved', settingsToSave);
        // Terminate the socket connection when not in use
        socket.disconnect();
        console.log('Socket disconnected');
      });
    }
  };

  return (
    <div className={styles.container}>
       {/* Show alert when showAlert state is true */}
     {showAlert && (
      <div className={styles.customAlert}>
      Settings have been saved!
    </div>
    )}
      <div className={styles.DeadZone}>
        <div className={styles.DeadZoneContainer}>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={Deadzone}
            onChange={(e) => handleDeadzoneChange(e.target.value)}
            className={styles.VerticalRange}
          />
        </div>
      </div>
      <div className={styles.right}>
        <div className={styles.settingsHeader}>
          <div className={styles.settingTitle}>Settings</div>
          <div className={styles.saveButton} onClick={handleSaveClick}>Save</div>
        </div>

        <div className={styles.sectionBackground2}></div>

        <div className={styles.delayFrame}>
          <span className={styles.delayFrameLabel}>Function Interval:</span>
          <div className={styles.delayFrameOptions}>
            <label className={styles.checkboxContainer}>
              <input
                type="radio"
                name="delayFrame"
                checked={delayFrame === 'high'}
                onChange={() => handleDelayFrameChange('high')}
                className={styles.customRadio}
              />
              <span className={styles.customRadioIcon}></span> {/* Custom icon */}
              <span className={styles.radioText}>High Gap</span>
            </label>
            <label className={styles.checkboxContainer}>
              <input
                type="radio"
                name="delayFrame"
                checked={delayFrame === 'medium'}
                onChange={() => handleDelayFrameChange('medium')}
                className={styles.customRadio}
              />
              <span className={styles.customRadioIcon}></span> {/* Custom icon */}
              <span className={styles.radioText}>Medium Gap</span>
            </label>
            <label className={styles.checkboxContainer}>
              <input
                type="radio"
                name="delayFrame"
                checked={delayFrame === 'low'}
                onChange={() => handleDelayFrameChange('low')}
                className={styles.customRadio}
              />
              <span className={styles.customRadioIcon}></span> {/* Custom icon */}
              <span className={styles.radioText}>Low Gap</span>
            </label>
          </div>
        </div>
        <div className={styles.sectionBackground1}></div>

        <div className={styles.scalingFactor}>
          Sensitivity:
          <div className={styles.scrollbarContainer}>
            <input
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={scalingFactor}
              onChange={(e) => handleScalingFactorChange(e.target.value)}
            />
            <div className={styles.scrollbarValue}>
              {scalingFactor}
            </div>
          </div>
        </div>

        <div className={styles.sectionBackground2}></div>

        <div className={styles.smoothingFactor}>
          Smoothing Factor:
          <div className={styles.smoothingFactorContainer}>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={smoothingFactor}
              onChange={(e) => handlesmoothingFactor(e.target.value)}
            />
            <div className={styles.scrollbarValue}>
              {smoothingFactor}
            </div>
          </div>
        </div>

        <div className={styles.sectionBackground2}></div>

        <div className={styles.selectKeyboardSize}>
          On-Screen Keyboard Size: {' '}
          <label className={styles.radioButton}>
            <input
              type="radio"
              value="small"
              checked={keyboardSize === 'small'}
              onChange={() => handleSizeChange('small')}
              className={styles.customRadio} // Add this class to style
            />
            <span className={styles.customRadioIcon}></span>
            <span className={styles.radioText1}>Small</span>
          </label>
          <label className={styles.radioButton}>
            <input
              type="radio"
              value="medium"
              checked={keyboardSize === 'medium'}
              onChange={() => handleSizeChange('medium')}
              className={styles.customRadio}
            />
            <span className={styles.customRadioIcon}></span>
            <span className={styles.radioText1}>Medium</span>
          </label>
          <label className={styles.radioButton}>
            <input
              type="radio"
              value="large"
              checked={keyboardSize === 'large'}
              onChange={() => handleSizeChange('large')}
              className={styles.customRadio}
            />
            <span className={styles.customRadioIcon}></span>
            <span className={styles.radioText1}>Large</span>
          </label>
        </div>

        <div className={styles.sectionBackground1}></div>

        <div className={styles.testingMode}>
          Test Mode:
          <label className={styles.checkboxContainer2}>
            <input
              type="checkbox"
              checked={testingMode}
              onChange={handleTestingModeChange}
            />
            <span className={styles.checkboxLabel2}>{testingMode ? 'On' : 'Off'}</span>
          </label>
        </div>

        <div className={styles.sectionBackground2}></div>
      </div>
    </div>
  );
}

export default Settings;