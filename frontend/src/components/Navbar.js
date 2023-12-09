import React, { useState } from "react";
import styles from './navbar.module.css';
import { FaHome } from "react-icons/fa";
import { GiSettingsKnobs } from 'react-icons/gi';
import { PiHandWavingFill } from 'react-icons/pi';
import LogoAndText from "../assets/textAndLogo.png";

function Navbar({ onShowHome, onShowGestures, onShowSettings }) {
  const [selectedButton, setSelectedButton] = useState('home');

  const handleButtonClick = (buttonName) => {
    setSelectedButton(buttonName);
  };

  const isButtonSelected = (buttonName) => {
    return selectedButton === buttonName;
  };

  return (
    <header className={styles.navbar}>
      <img src={LogoAndText} alt="Nexus Ctrl Logo" className={styles['logo-image']} />
      <div className={styles['menu']}>
        {/* Hardcoded menu items */}
        <div className={styles['menu-li']}>
          <button
            className={`${styles["menu-link"]} ${isButtonSelected("home") ? styles["selected"] : ""}`}
            onClick={() => {
              handleButtonClick("home");
              onShowHome();
            }}
          >
            <FaHome size={35} strokeWidth={1.5} style={{ marginTop: '6px', marginLeft: '5px', marginBottom: '4px' }} />
            <span>Home</span>
          </button>
        </div>
        <div className={styles['menu-li']}>
          <button
            className={`${styles["menu-link"]} ${isButtonSelected("gestures") ? styles["selected"] : ""}`}
            onClick={() => {
              handleButtonClick("gestures");
              onShowGestures();
            }}
          >
            <PiHandWavingFill size={35} strokeWidth={1.5} style={{ marginTop: '6px', marginLeft: '15px', marginBottom: '4px' }} />
            <span>Gestures</span>
          </button>
        </div>
        <div className={styles['menu-li']}>
          <button
            className={`${styles["menu-link"]} ${isButtonSelected("settings") ? styles["selected"] : ""}`}
            onClick={() => {
              handleButtonClick("settings");
              onShowSettings();
            }}
          >
            <GiSettingsKnobs size={35} strokeWidth={1.5} style={{ marginTop: '6px', marginLeft: '14px', marginBottom: '4px' }} />
            <span>Settings</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
