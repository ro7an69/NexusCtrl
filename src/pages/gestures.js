// gesture.js

import React, { useState } from "react";
import Webcam from "react-webcam";
import styles from "./gesture.module.css";

function Gestures() {
  const [selectedOptions, setSelectedOptions] = useState(Array(12).fill("Option 1"));

  const handleDropdownChange = (index, event) => {
    const updatedOptions = [...selectedOptions];
    updatedOptions[index] = event.target.value;
    setSelectedOptions(updatedOptions);
  };

  // Array of dropdown menu names
  const dropdownNames = [
    "Dropdown 1",
    "Dropdown 2",
    "Dropdown 3",
    "Dropdown 4",
    "Dropdown 5",
    "Dropdown 6",
    "Dropdown 7",
    "Dropdown 8",
    "Dropdown 9",
    "Dropdown 10",
    "Dropdown 11",
    "Dropdown 12",
  ];

  // Function to divide the dropdownNames array into rows
  const chunkArray = (array, chunkSize) => {
    const chunkedArray = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunkedArray.push(array.slice(i, i + chunkSize));
    }
    return chunkedArray;
  };

  // Divide the dropdownNames into rows of three
  const dropdownRows = chunkArray(dropdownNames, 3);

  return (
    <div className={styles.container}>
      <div className={`${styles.cameraContainer} ${styles.gestureContainer}`}>
        <h1>Camera Feed</h1>
        <Webcam
          audio={false}
          mirrored={true}
        />
      </div>
      <div className={styles.gestureContainer}>
        <h1>Gestures</h1>
        {/* Render Dropdowns in Rows */}
        {dropdownRows.map((row, rowIndex) => (
          <div key={rowIndex} className={styles.dropdownRow}>
            {row.map((name, index) => (
              <div key={index} className={styles.dropdown}>
                <label htmlFor={`dropdown-${rowIndex}-${index}`}>{name}:</label>
                <select
                  id={`dropdown-${rowIndex}-${index}`}
                  value={selectedOptions[rowIndex * 3 + index]}
                  onChange={(event) => handleDropdownChange(rowIndex * 3 + index, event)}
                >
                  <option value="Option 1">Option 1</option>
                  <option value="Option 2">Option 2</option>
                  <option value="Option 3">Option 3</option>
                  {/* Add more options if needed */}
                </select>
              </div>
            ))}
          </div>
        ))}
        {/* Add your sign-up form or content here */}
      </div>
    </div>
  );
}

export default Gestures;

