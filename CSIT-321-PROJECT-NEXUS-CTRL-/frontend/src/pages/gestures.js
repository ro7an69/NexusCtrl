import React, { useState, useEffect } from "react";
import styles from './gesture.module.css';
import png1 from "../assets/Picture2.png";
import png2 from "../assets/Picture3.png";
import png3 from "../assets/Picture4.png";
import png4 from "../assets/Picture5.png";
import png5 from "../assets/Picture6.png";
import png6 from "../assets/Picture7.png";
import png7 from "../assets/Picture8.png";
import png8 from "../assets/Picture9.png";
import png9 from "../assets/Picture10.png";
import png10 from "../assets/Picture11.png";
import png11 from "../assets/Picture12.png";
import png12 from "../assets/Picture13.png";
import socketIOClient from 'socket.io-client';
import { saveSettingsToFirebase } from './firebaseSaveUtils'

function Gestures() {
  const [selectedOptions, setSelectedOptions] = useState(Array(12).fill("Not Assigned"));
  const [showAlert, setShowAlert] = useState(false);

  const handleDropdownChange = (index, event) => {
    const updatedOptions = [...selectedOptions];
    updatedOptions[index] = event.target.value;
    setSelectedOptions(updatedOptions);
  };

  useEffect(() => {
    // Load saved gestures from local storage
    const storedGestures = localStorage.getItem('userGestures');
    console.log(storedGestures);
    if (storedGestures) {
      const parsedGestures = JSON.parse(storedGestures);
      setSelectedOptions(parsedGestures);
    }
    else {
      const defaultGestures = [
        "Not Assigned",
        "move_cursor",
        "scroll_up",
        "scroll_down",
        "click",
        "double_click",
        "right_click",
        "Not Assigned",
        "Not Assigned",
        "Not Assigned",
        "Not Assigned",
        "Not Assigned",
        "Not Assigned"
      ];
      setSelectedOptions(defaultGestures);
    }
  }, []);
  const handleSaveClick = () => {

    setShowAlert(true);

    setTimeout(() => {
      const alertElement = document.querySelector('.customAlert');
      if (alertElement) {
        alertElement.classList.add('fadeOut');
      }
    }, 1500);

    setTimeout(() => {
      setShowAlert(false);
    }, 2000);

    const SERVER_URL = 'http://127.0.0.1:5001';
    const socket = socketIOClient(SERVER_URL);

    // Log the socket connection status
    console.log('Socket connection status:', socket.connected);
    const storedUser = localStorage.getItem('authUser');
    if (storedUser) {
      socket.emit('gestures-saved', selectedOptions);
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
        socket.emit('gestures-saved', selectedOptions);
        localStorage.setItem('userGestures', JSON.stringify(selectedOptions));
        // Terminate the socket connection when not in use
        socket.disconnect();
        console.log('Socket disconnected');
      });
    }
  };

  const pngs = [png1, png2, png3, png4, png5, png6, png7, png8, png9, png10, png11, png12];

  return (
    <div className={styles.container}>
      {showAlert && (
        <div className={styles.customAlert}>
          Gesture Functions have been saved!
        </div>
      )}
      <div className={styles.right}>
      <div className={styles.gestureHeader}>
        <div className={styles.gestureTitle}>Gestures</div>
    <div className={styles.saveButton} onClick={handleSaveClick}>
      Save
    </div>
      </div>
      <div className={styles.gestureList}>
        {pngs.map((png, index) => (
          <div key={index} className={styles.gestureItem}>
            <div className={styles.png} style={{ marginBottom: '20px' }}>
            <img src={png} alt={`png-${index}`} className="w-32 h-32" />
            </div>
            <select
              value={selectedOptions[index]}
              onChange={(e) => handleDropdownChange(index, e)}
              >
              <option value="Not Assigned">Not Assigned</option>
              <optgroup label="Mouse Functions">
                <option value="move_cursor">Move Cursor</option>
                <option value="click">Single Left-Click</option>
                <option value="right_click">Right Click</option>
                <option value="double_click">Double Click</option>
                <option value="middle_click">Middle Click</option>
                <option value="scroll_up">Scroll Up</option>
                <option value="scroll_down">Scroll Down</option>
              </optgroup>
              <optgroup label="Keyboard">
                <option value="open_osk_with_size">Open Keyboard</option>
                <option value="press_left">Press Left</option>
                <option value="press_up">Press Up</option>
                <option value="press_down">Press Down</option>
                <option value="press_right">Press Right</option>
                <option value="press_space">Press Space</option>
                <option value="copy">Copy</option>
                <option value="paste">Paste</option>
                <option value="zoom_in">Zoom in</option>
                <option value="zoom_out">Zoom out</option>
              </optgroup>
              <optgroup label="Media Control">
                <option value="media_play_pause">Play/Pause</option>
                <option value="media_next_track">Next Track</option>
                <option value="media_previous_track">Previous Track</option>
                <option value="increase_volume">Volume Up</option>
                <option value="decrease_volume">Volume Down</option>
              </optgroup>
              <optgroup label="Misc">
                <option value="close_active_window">Close Active Window</option>
                <option value="minimize_active_window">Minimize Active Window</option>
                <option value="minimize_app">Resize Window</option>
              </optgroup>
            </select>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}

export default Gestures;