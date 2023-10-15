import React from "react";
import { Link } from "react-router-dom";
import styles from './navbar.module.css';
import { AiOutlineHome } from 'react-icons/ai';
import { GiSettingsKnobs } from 'react-icons/gi';
import { PiHandWavingFill } from 'react-icons/pi';
import Logo from "../assets/Nexus_Ctrl_logo.png";

function Navbar() {
  return (
    <header className={styles.navbar}>
      <img src={Logo} alt="Nexus Ctrl Logo" className={styles['logo-image']} />

      <nav>
        <ul className={styles.menu}>
          <li>
            {/* Apply the custom class to the link */}
            <Link to="/home" className={styles["menu-link"]}>
              <AiOutlineHome size={35} strokeWidth={1.5} style={{ marginTop: '6px' }} />
            </Link>
          </li>
          <li>
            {/* Apply the custom class to the link */}
            <Link to="/gestures" className={styles["menu-link"]}>
              <PiHandWavingFill size={35} strokeWidth={1.5} style={{ marginTop: '6px' }} />
            </Link>
          </li>
          <li>
            {/* Apply the custom class to the link */}
            <Link to="/settings" className={styles["menu-link"]}>
              <GiSettingsKnobs size={35} strokeWidth={1.5} style={{ marginTop: '6px' }} /> {/* Use the GiSettingsKnobs icon */}
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Navbar;
