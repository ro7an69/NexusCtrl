import React, { useState, useEffect } from 'react';
import styles from './settings.module.css';
import socketIOClient from 'socket.io-client';

function Settings() {
  const [keyboardSize, setkeyboardSize] = useState('medium');
  const [selectedMode, setSelectedMode] = useState('hands-as-mouse');
  const [scalingFactor, setscalingFactor] = useState(3);
  const [acceleration, setAcceleration] = useState(2);
  const [smoothingFactor, setsmoothingFactor] = useState(0.5);
  const [Deadzone, setDeadzone] = useState(50);
  const [testingMode, setTestingMode] = useState(false);
  const [delayFrame, setDelayFrame] = useState('medium');

  localStorage.removeItem('userSettings');

  useEffect(() => {
    const storedSettings = localStorage.getItem('userSettings');
    if (storedSettings) {
      const parsedSettings = JSON.parse(storedSettings);
      setkeyboardSize(parsedSettings.keyboardSize);
      setSelectedMode(parsedSettings.selectedMode);
      setscalingFactor(parsedSettings.scalingFactor);
      setAcceleration(parsedSettings.acceleration);
      setsmoothingFactor(parsedSettings.smoothingFactor);
      setDeadzone(parsedSettings.Deadzone);
      setTestingMode(parsedSettings.testingMode);
      setDelayFrame(parsedSettings.delayFrame);

    } else {
      // If no settings are found in localStorage, set default values
      setkeyboardSize('medium');
      setSelectedMode('hands-position');
      setscalingFactor(3);
      setAcceleration(2);
      setsmoothingFactor(0);
      setDeadzone(50);
      setTestingMode(false);
      setDelayFrame('medium');
    }
  }, []);
  const handleSizeChange = (size) => {
    setkeyboardSize(size);
  };

  const handleModeChange = (mode) => {
    setSelectedMode(mode);
  };

  const handleScalingFactorChange = (value) => {
    setscalingFactor(value);
  };

  const handleAccelerationChange = (value) => {
    setAcceleration(value);
  };

  const handlesmoothingFactor = (value) => {
    setsmoothingFactor(value);
  };

  const handleDeadzoneChange = (value) => {
    setDeadzone(value);
  };


  const handleTestingModeChange = () => {
    setTestingMode(!testingMode);
  };

  const handleDelayFrameChange = (frame) => {
    setDelayFrame(frame);
  };

  const handleSaveClick = () => {
    const settingsToSave = {
      keyboardSize,
      selectedMode,
      scalingFactor,
      acceleration,
      smoothingFactor,
      Deadzone,
      testingMode,
      delayFrame,
    };
    localStorage.setItem('userSettings', JSON.stringify(settingsToSave));

    const saveMessage = `
      Settings have been saved:
      Keyboard Size: ${keyboardSize}
      Selected Mode: ${selectedMode}
      Sensitivity: ${scalingFactor}
      Acceleration: ${acceleration}
      Smoothing Factor: ${smoothingFactor}
      Deadzone: ${Deadzone}
      Test Mode: ${testingMode ? 'On' : 'Off'} 
      Delay Frame: ${delayFrame} 
    `;
  
    alert(saveMessage);
    // Create a socket connection only when Save button is pressed
  const SERVER_URL = 'http://127.0.0.1:5001';
  const socket = socketIOClient(SERVER_URL);

  // Log the socket connection status
  console.log('Socket connection status:', socket.connected);

  // Wait for the connection to be fully established before emitting the event
    socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
    // Emit the event
    socket.emit('settings-saved', settingsToSave);

    // Terminate the socket connection when not in use
    socket.disconnect();
    console.log('Socket disconnected');
  });
  /*
  saveSettingsToFirebase(settingsToSave)
  .then(() => {
    console.log('Settings saved successfully');
    // Further UI updates or notifications
  })
  .catch(error => {
    console.error('Error saving settings:', error);
    // Handle error in UI
  });
*/
  };

  return (
    <div className={styles.container}>
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

      <div className={styles.selectMode}>
        Cursor Mode: {' '}
        <div className={styles.hands}>
        <label className={styles.radioButton1}>
  <input
    type="radio"
    value="hands-as-mouse"
    checked={selectedMode === 'hands-as-mouse'}
    onChange={() => handleModeChange('hands-as-mouse')}
    className={styles.customRadio} // Add this class to style
  />
  <span className={styles.customRadioIcon}></span> {/* Add this span for custom icon */}
  <span className={styles.radioText}>Hands-as-Mouse</span>
</label>
            <label className={styles.radioButton1}>
              <input
                type="radio"
                value="hands-position"
                checked={selectedMode === 'hands-position'}
                onChange={() => handleModeChange('hands-position')}
                className={styles.customRadio}
              />
              <span className={styles.customRadioIcon}></span>
              <span className={styles.radioText}>Hands-Position</span>
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
            step = "0.5"
            value={scalingFactor}
            onChange={(e) => handleScalingFactorChange(e.target.value)}
          />
          <div className={styles.scrollbarValue}>
            {scalingFactor}
          </div>
        </div>
      </div>

      <div className={styles.sectionBackground2}></div>

      <div className={styles.acceleration}>
        Acceleration:
        <div className={styles.accelerationContainer}>
          <input
            type="range"
            min="0"
            max="5"
            step= "0.5"
            value={acceleration}
            onChange={(e) => handleAccelerationChange(e.target.value)}
          />
          <div className={styles.scrollbarValue}>
            {acceleration}
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
            max="3"
            step="0.5"
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