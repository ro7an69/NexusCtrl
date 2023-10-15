import React, { useState } from "react";
import styles from './gesture.module.css'
import CameraFeed from './CameraFeed';
import gif1 from "../assets/gif1.gif"
import gif2 from "../assets/gif2.gif"
import gif3 from "../assets/gif3.gif"
import gif4 from "../assets/gif4.gif"
import gif5 from "../assets/gif5.gif"
import gif6 from "../assets/gif6.gif"

function Gestures() {
  const [selectedOptions, setSelectedOptions] = useState(Array(6).fill("Not Assigned"));

  const handleDropdownChange = (index, event) => {
    const updatedOptions = [...selectedOptions];
    updatedOptions[index] = event.target.value;
    setSelectedOptions(updatedOptions);
  };

  const gifs = [gif1, gif2, gif3, gif4, gif5, gif6];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
      <div className="border p-4">
      <h1 className={`transition-opacity duration-200 ${styles.welcomeTitle} text-4xl mb-4`}> Camera Feed</h1>
        <CameraFeed />
      </div>
      <div className="border p-4" style={{ backgroundColor: '#DCE6FF47' }}>
        <div class name="right">
        <h1 className={`transition-opacity duration-200 ${styles.welcomeTitle} text-4xl mb-4`}> Gestures</h1>

        </div>
      

        {/* Render GIFs in Rows */}
        <div className="flex flex-wrap">
          {gifs.map((gif, index) => (
            <div key={index} className="w-1/3 p-4">
              {/* Render your gifs here */}
              <div className={styles.gif}> {/* Apply the updated styles */}
                <img src={gif} alt={`gif-${index}`} className="w-32 h-32" />
              </div>
              {/* Dropdown goes here */}
              <select
                value={selectedOptions[index]}
                onChange={(e) => handleDropdownChange(index, e)}
                className="mt-2 border p-2 rounded-md"
              >
                <option value="Not Assigned">Not Assigned</option>
                <option value="Single Click">Single Click</option>
                <option value="Double Click">Double Click</option>
                <option value="Right Click">Right Click</option>
                <option value="Scroll Click">Scroll Click</option>
                <option value="Hover">Hover</option>
                <option value="Open Keyboard">Open Keyboard</option>
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Gestures;