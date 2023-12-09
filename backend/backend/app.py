# Import necessary libraries
import cv2
import numpy as np
import mediapipe as mp
import pyautogui
import os
import subprocess
import pygetwindow as gw
import threading
import itertools
import tensorflow as tf
from copy import deepcopy
from flask import Flask
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import base64
import json

# Function to calculate landmark points from the hand landmarks
def calc_landmark_list(frame, landmarks):
    frame_width, frame_height = frame.shape[1], frame.shape[0]
    landmark_point = []

    # Extract x, y coordinates of landmarks and append to list
    for _, landmark in enumerate(landmarks.landmark):
        landmark_x = min(int(landmark.x * frame_width), frame_width - 1)
        landmark_y = min(int(landmark.y * frame_height), frame_height - 1)

        landmark_point.append([landmark_x, landmark_y])

    return landmark_point

# Function to preprocess landmark points
def pre_process_landmark(landmark_list):
    temp_landmark_list = deepcopy(landmark_list)

    # Convert to relative coordinates
    base_x, base_y = 0, 0
    for index, landmark_point in enumerate(temp_landmark_list):
        if index == 0:
            base_x, base_y = landmark_point[0], landmark_point[1]

        temp_landmark_list[index][0] = temp_landmark_list[index][0] - base_x
        temp_landmark_list[index][1] = temp_landmark_list[index][1] - base_y
    # Convert to a one-dimensional list
    temp_landmark_list = list(
        itertools.chain.from_iterable(temp_landmark_list))
    # Normalization
    max_value = max(list(map(abs, temp_landmark_list)))

    def normalize_(n):
        return n / max_value

    temp_landmark_list = list(map(normalize_, temp_landmark_list))
    return temp_landmark_list

# Function for computer vision processing
def computer_vision():
    global skipFrameCounter, cap, fingerCount, className, handLandmarks, fingersUp
    global gestureFunctions, scalingFactor, Deadzone, smoothingFactor, delayFrame, speedFactor, keyboardSize, width, height, smoothedCursorX, smoothedCursorY, prevIndexFingerX, prevIndexFingerY, settingsChangedFlag

    os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
    pyautogui.FAILSAFE = False

    # Initialize mediapipe
    mpHands = mp.solutions.hands
    hands = mpHands.Hands(max_num_hands=1, min_detection_confidence=0.7)
    mpDraw = mp.solutions.drawing_utils
    
    # Get the directory of the current script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    # Define the relative paths within your project structure
    model_dir = os.path.join(script_dir, 'model\keypoint_classifier\keypoint_classifier_model')
    names_file = os.path.join(script_dir, 'gesture.names')
    # Load the model
    model = tf.saved_model.load(model_dir)

    classNames = []
    # Load class names
    with open(names_file, 'r') as f:
        classNames = f.read().split('\n')

    # Initialize the webcam
    cap = cv2.VideoCapture(0)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1920)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 1080)
    skipFrameCounter = 0
    socketio.emit('receive_image', {'image': image_bytes})

    while True:
        # Read each frame from the webcam
        _, frame = cap.read()
        if frame is None:
            continue
        # Flip the frame vertically
        frame = cv2.flip(frame, 1)
        debug_frame = deepcopy(frame)
        framergb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        # Get hand landmark prediction
        result = hands.process(framergb)
        
        readSettingsFromFile()
        
        fingerCount = 0
        className = ''
        handLandmarks = []
        fingersUp = []
        
        # Deadzone line
        Deadzone_top_pixel = int(abs(Deadzone-1) * height)
        cv2.line(frame, (0, Deadzone_top_pixel), (width, Deadzone_top_pixel), (0, 255, 0), 2)
        
        # post-process the result
        if result.multi_hand_landmarks is not None:
            temp_landmarks = []
            for handslms in result.multi_hand_landmarks:
                temp_landmarks = calc_landmark_list(debug_frame, handslms)

                landmarks = pre_process_landmark(temp_landmarks)

                # Drawing landmarks on frames
                mpDraw.draw_landmarks(frame, handslms, mpHands.HAND_CONNECTIONS)

                # Predict gesture
                prediction = model([landmarks])
                classID = np.argmax(prediction)
                if 0 <= classID < len(classNames):
                    className = classNames[classID]
                else:
                    className = "Unknown Gesture"
                
                # Fill list with x and y positions of each landmark
                for landmarks in handslms.landmark:
                    handLandmarks.append([landmarks.x, landmarks.y])
                
                handIndex = result.multi_hand_landmarks.index(handslms)
                handLabel = result.multi_handedness[handIndex].classification[0].label
                
                base_y = (handLandmarks[5][1] + handLandmarks[9][1] + handLandmarks[13][1] + handLandmarks[17][1]) / 4
                centroid_y = (base_y + handLandmarks[0][1]) / 2
                
                # Check if hand is above or below deadzone line
                if centroid_y < abs(Deadzone-1):
                    # If tip of finger/thumb higher than base: finger/thumb is up
                    if handLabel == "Left":
                        # Check for left thumb
                        if handLandmarks[4][0] > handLandmarks[3][0]:
                            fingerCount += 1
                            fingersUp.append("Left Thumb")
                    else:
                        # Check for right thumb
                        if handLandmarks[4][0] < handLandmarks[3][0]:
                            fingerCount += 1
                            fingersUp.append("Right Thumb")
                    if handLandmarks[8][1] < handLandmarks[6][1]:  # Index finger
                        fingerCount += 1
                        fingersUp.append("Index")
                    if handLandmarks[12][1] < handLandmarks[10][1]:  # Middle finger
                        fingerCount += 1
                        fingersUp.append("Middle")
                    if handLandmarks[16][1] < handLandmarks[14][1]:  # Ring finger
                        fingerCount += 1
                        fingersUp.append("Ring")
                    if handLandmarks[20][1] < handLandmarks[18][1]:  # Pinky
                        fingerCount += 1
                        fingersUp.append("Pinky")
                    
                    if skipFrameCounter > 0:
                        skipFrameCounter -= 1
                    
                    # Perform functions depending on ML output and fingers up/down
                    if fingerCount == 0:
                        gestureFunctions[0]()
                    elif fingerCount == 1 and "Index" in fingersUp:
                        gestureFunctions[1]()
                    elif fingerCount == 1 and ("Right Thumb" in fingersUp or "Left Thumb" in fingersUp) and className == 'call me':
                        gestureFunctions[2]()
                    elif className == 'thumbs down':
                        gestureFunctions[3]()
                    elif fingerCount == 2 and all(finger in fingersUp for finger in ["Index", "Middle"]):
                        gestureFunctions[4]()
                    elif fingerCount == 3 and all(finger in fingersUp for finger in ["Index", "Middle", "Ring"]):
                        gestureFunctions[5]()
                    elif fingerCount == 4 and all(finger in fingersUp for finger in ["Index", "Middle", "Ring", "Pinky"]):
                        gestureFunctions[6]()
                    elif fingerCount == 3 and (all(finger in fingersUp for finger in ["Right Thumb", "Index", "Middle"]) or all(finger in fingersUp for finger in ["Left Thumb", "Index", "Middle"])):
                        gestureFunctions[7]()
                    elif fingerCount == 1 and "Pinky" in fingersUp:
                        gestureFunctions[8]()
                    elif fingerCount == 3 and (all(finger in fingersUp for finger in ["Right Thumb", "Index", "Pinky"]) or all(finger in fingersUp for finger in ["Left Thumb", "Index", "Pinky"])):
                        gestureFunctions[9]()
                    elif fingerCount == 2 and (all(finger in fingersUp for finger in ["Right Thumb", "Pinky"]) or all(finger in fingersUp for finger in ["Left Thumb", "Pinky"])):
                        gestureFunctions[10]()
                    elif fingerCount == 2 and (all(finger in fingersUp for finger in ["Right Thumb", "Index"]) or all(finger in fingersUp for finger in ["Left Thumb", "Index"])):
                        gestureFunctions[11]()
        
        # show the prediction on the frame
        cv2.putText(frame, f"Finger Count: {fingerCount}", (10, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (190, 135, 37), 1, cv2.LINE_AA)
        cv2.putText(frame, f"Fingers Up: {fingersUp}", (10, 100), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (190, 135, 37), 1, cv2.LINE_AA)
        cv2.putText(frame, f"ML Prediction: {className}", (10, 150), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (190, 135, 37), 1, cv2.LINE_AA)
        _, buffer = cv2.imencode('.png', frame)
        image_bytes = base64.b64encode(buffer).decode('utf-8')
        socketio.emit('receive_image', {'image': image_bytes})

# Function to move the window from (start_x, start_y) to (end_x, end_y) with a specified duration
def move_window(start_x, start_y, end_x, end_y, duration=1):
    pyautogui.moveTo(start_x, start_y)
    pyautogui.mouseDown()
    pyautogui.moveTo(end_x, end_y, duration=duration)
    pyautogui.mouseUp()

# Function to minimize the active application window
def minimize_app():
    global gestureFunctions
    move_window(1800, 900, 1000, 50)
    # Read and update the 'savedSettings.txt' file to reflect the change from 'minimize_app' to 'maximize_app'
    with open('savedSettings.txt', 'r') as file:
        lines = file.readlines()
    for i, line in enumerate(lines):
        key, value = line.strip().split(':')
        if key.startswith("function") and value == 'minimize_app':
            lines[i] = f'{key}:maximize_app\n'
    with open('savedSettings.txt', 'w') as file:
        file.writelines(lines)

# Function to maximize the active application window
def maximize_app():
    global gestureFunctions
    move_window(1000, 50, 1800, 900)
    # Read and update the 'savedSettings.txt' file to reflect the change from 'maximize_app' to 'minimize_app'
    with open('savedSettings.txt', 'r') as file:
        lines = file.readlines()
    for i, line in enumerate(lines):
        key, value = line.strip().split(':')
        if key.startswith("function") and value == 'maximize_app':
            lines[i] = f'{key}:minimize_app\n'
    with open('savedSettings.txt', 'w') as file:
        file.writelines(lines)

# Function to move the cursor based on hand landmarks
def move_cursor():
    global smoothedCursorX, smoothedCursorY, handLandmarks
    index_finger_x, index_finger_y = handLandmarks[8]
    screenWidth, screenHeight = pyautogui.size()
    target_cursor_x = int(
        (index_finger_x * screenWidth * scalingFactor) - (screenWidth / 2))
    target_cursor_y = int(
        (index_finger_y * screenHeight * scalingFactor) - (screenHeight / 2))
    smoothedCursorX = smoothingFactor * target_cursor_x + \
        (1 - smoothingFactor) * smoothedCursorX
    smoothedCursorY = smoothingFactor * target_cursor_y + \
        (1 - smoothingFactor) * smoothedCursorY
    pyautogui.moveTo(smoothedCursorX, smoothedCursorY)


# Function to perform a mouse click
def click():
    global skipFrameCounter
    if skipFrameCounter == 0:
        pyautogui.click()
        skipFrameCounter = delayFrame

# Function to perform a left arrow key press
def press_left():
    global skipFrameCounter
    if skipFrameCounter == 0:
        pyautogui.press('left')
        skipFrameCounter = delayFrame

# Function to perform a up arrow key press
def press_up():
    global skipFrameCounter
    if skipFrameCounter == 0:
        pyautogui.press('up')
        skipFrameCounter = delayFrame

# Function to perform a down arrow key press
def press_down():
    global skipFrameCounter
    if skipFrameCounter == 0:
        pyautogui.press('down')
        skipFrameCounter = delayFrame

# Function to perform a right arrow key press
def press_right():
    global skipFrameCounter
    if skipFrameCounter == 0:
        pyautogui.press('right')
        skipFrameCounter = delayFrame

# Function to perform a spacebar key press
def press_space():
    global skipFrameCounter
    if skipFrameCounter == 0:
        pyautogui.keyDown('space')
        pyautogui.keyUp('space')
        skipFrameCounter = delayFrame

# Function to perform a mouse right click
def right_click():
    global skipFrameCounter
    if skipFrameCounter == 0:
        pyautogui.rightClick()
        skipFrameCounter = delayFrame

# Function to perform a mouse double click
def double_click():
    global skipFrameCounter
    if skipFrameCounter == 0:
        pyautogui.doubleClick()
        skipFrameCounter = delayFrame

# Function to perform a mouse middle click
def middle_click():
    global skipFrameCounter
    if skipFrameCounter == 0:
        pyautogui.middleClick()
        skipFrameCounter = delayFrame

# Function to open the On-Screen Keyboard with a specified size
def open_osk_with_size():
    global skipFrameCounter
    if skipFrameCounter == 0:
        sizes = {
            'small': {'width': 800, 'height': 400},
            'medium': {'width': 1200, 'height': 400},
            'large': {'width': 1920, 'height': 400}
        }
        keyboard_size = sizes.get(keyboardSize)
        keyboard_width = keyboard_size['width']
        keyboard_height = keyboard_size['height']
        subprocess.Popen('osk.exe', shell=True)
        screen_width = 1920
        screen_height = 1080
        x_position = (screen_width - keyboard_width) // 2
        y_position = screen_height - keyboard_height
        window = gw.getWindowsWithTitle("On-Screen Keyboard")
        if len(window) == 0:
            print("Window with title 'osk' not found.")
            return
        window = window[0]
        window.moveTo(x_position, y_position)
        window.resizeTo(keyboard_width, keyboard_height)
        skipFrameCounter = delayFrame

# Function to close the active window
def close_active_window():
    global skipFrameCounter
    if skipFrameCounter == 0:
        active_window = gw.getActiveWindow()
        if active_window:
            active_window.close()
        skipFrameCounter = delayFrame

# Function to minimize the active window
def minimize_active_window():
    global skipFrameCounter
    if skipFrameCounter == 0:
        active_window = gw.getActiveWindow()
        if active_window:
            active_window.minimize()
        skipFrameCounter = delayFrame

# Function to play/pause track
def media_play_pause():
    global skipFrameCounter
    if skipFrameCounter == 0:
        pyautogui.press('playpause')
        skipFrameCounter = delayFrame

# Function to go next track
def media_next_track():
    global skipFrameCounter
    if skipFrameCounter == 0:
        pyautogui.press('nexttrack')
        skipFrameCounter = delayFrame

# Function to go previous track
def media_previous_track():
    global skipFrameCounter
    if skipFrameCounter == 0:
        pyautogui.press('prevtrack')
        skipFrameCounter = delayFrame

# Function to increase system volume
def increase_volume():
    pyautogui.press('volumeup')

# Function to decrease system volume
def decrease_volume():
    pyautogui.press('volumedown')


def scroll_up(): # Scrolls up 20 notches
    pyautogui.scroll(20)


def scroll_down():
    pyautogui.scroll(-20)  # Scrolls down 20 notches


def zoom_in():
    # Zoom in (assuming you use Ctrl and + for zooming)
    global skipFrameCounter
    if skipFrameCounter == 0:
        pyautogui.hotkey("ctrl", "+")
        skipFrameCounter = delayFrame


def zoom_out():
    # Zoom out (assuming you use Ctrl and - for zooming)
    global skipFrameCounter
    if skipFrameCounter == 0:
        pyautogui.hotkey("ctrl", "-")
        skipFrameCounter = delayFrame


def copyfunc():
    # Copy (assuming you use Ctrl + C for copying)
    global skipFrameCounter
    if skipFrameCounter == 0:
        pyautogui.hotkey("ctrl", "c")
        skipFrameCounter = delayFrame


def paste():
    # Paste (assuming you use Ctrl + V for pasting)
    global skipFrameCounter
    if skipFrameCounter == 0:
        pyautogui.hotkey("ctrl", "v")
        skipFrameCounter = delayFrame


def null_function():
    pass

def socket_communication():
    @socketio.on('gestures-saved')
    def handle_gestures_saved(data):
        global gestureFunctions, settingsChangedFlag
        # Handle the saved gestures here
        print('Gestures saved:', data)
        # Read existing settings from the file
        existing_settings = {}
        with open("savedSettings.txt", 'r') as file:
            lines = file.readlines()
            for line in lines:
                key, value = line.strip().split(':')
                existing_settings[key] = value

        # Update only the gestures in the existing settings
        for i, gesture in enumerate(data):
            existing_settings[f'function{i}'] = gesture

        # Write back the combined settings to the file
        with open("savedSettings.txt", 'w') as file:
            for key, value in existing_settings.items():
                file.write(f'{key}:{value}\n')
        settingsChangedFlag = True
        with open("savedSettings.txt", 'r') as file:
            file_content = file.read()
        settings_dict = {}
        for line in file_content.strip().split('\n'):
            key, value = line.split(':')
            settings_dict[key.strip()] = value.strip()
        # Convert the dictionary to JSON
        json_data = json.dumps(settings_dict)
        # Emit the JSON data
        emit('settings', json_data)
        
    @socketio.on('settings-saved')
    def handle_settings_saved(data):
        global settingsChangedFlag
        # Handle the data received from the React app (data contains the saved settings)
        print('Settings saved:', data)
        # Read existing gestures from the file
        existing_gestures = {}
        with open("savedSettings.txt", 'r') as file:
            lines = file.readlines()
            for line in lines:
                key, value = line.strip().split(':')
                if key.startswith("function"):
                    existing_gestures[key] = value

        # Update the settings to update with new settings from data
        settings_to_update = {
            "keyboardSize": keyboardSize,
            "scalingFactor": scalingFactor,
            "smoothingFactor": smoothingFactor,
            "delayFrame": delayFrame,
            "speedFactor": speedFactor,
            "Deadzone": Deadzone,
            "testingMode": testingMode,
            "width": width,
            "height": height,
        }

        for key, value in data.items():
            if key in settings_to_update:
                settings_to_update[key] = value

        # Write the updated settings to the file
        with open("savedSettings.txt", 'w') as file:
            # Append the existing gestures back to the file
            for key, value in existing_gestures.items():
                file.write(f'{key}:{value}\n')
            
            for key, value in settings_to_update.items():
                file.write(f'{key}:{value}\n')

        settingsChangedFlag = True
        with open("savedSettings.txt", 'r') as file:
            file_content = file.read()
        settings_dict = {}
        for line in file_content.strip().split('\n'):
            key, value = line.split(':')
            settings_dict[key.strip()] = value.strip()

        # Convert the dictionary to JSON
        json_data = json.dumps(settings_dict)
        # Emit the JSON data
        emit('settings', json_data)
    
    @socketio.on('getSettings')
    def handle_settings_saved(data):
        global settingsChangedFlag
        data_value = data['data']
        cleanedData = data_value.replace('{', '').replace('}', '').replace('"', '').replace(' ', '')
        # Write the formatted data to a file
        with open('savedSettings.txt', 'w') as file:
            file.write('\n'.join(cleanedData.split(',')) + '\n')
        settingsChangedFlag = True

# Function to set default values for variables
def setDefaultValues():
    global gestureFunctions, scalingFactor, Deadzone, smoothingFactor, delayFrame, speedFactor, keyboardSize, width, height, smoothedCursorX, smoothedCursorY, prevIndexFingerX, prevIndexFingerY, settingsChangedFlag, testingMode
    with open("savedSettings.txt", 'w') as file:
        file.write(f'function0:null_function\n')
        file.write(f'function1:move_cursor\n')
        file.write(f'function2:scroll_up\n')
        file.write(f'function3:scroll_down\n')
        file.write(f'function4:click\n')
        file.write(f'function5:double_click\n')
        file.write(f'function6:right_click\n')
        file.write(f'function7:null_function\n')
        file.write(f'function8:null_function\n')
        file.write(f'function9:null_function\n')
        file.write(f'function10:null_function\n')
        file.write(f'function11:null_function\n')
        file.write(f'function12:null_function\n')
        file.write(f'scalingFactor:2.1\n')
        file.write(f'Deadzone:0.0\n')
        file.write(f'smoothingFactor:0.4\n')
        file.write(f'delayFrame:medium\n')
        file.write(f'keyboardSize:large\n')
        file.write(f'testingMode:false\n')      
        file.write(f'width:640\n')    
        file.write(f'height:480\n')
    gestureFunctions = [null_function] * 13
    gestureFunctions[1] = move_cursor
    gestureFunctions[2] = scroll_up
    gestureFunctions[3] = scroll_down
    gestureFunctions[4] = click
    gestureFunctions[5] = double_click
    gestureFunctions[6] = right_click
    scalingFactor = 2.1
    Deadzone = 0.0
    smoothingFactor = 0.4
    delayFrame = 0
    speedFactor = 3000
    keyboardSize = "medium"
    width = 1920
    height = 1080
    smoothedCursorX = 0
    smoothedCursorY = 0
    prevIndexFingerX = 1920 // 2
    prevIndexFingerY = 1080 // 2
    testingMode = "false"
    settingsChangedFlag = False

# Function to read settings from file and update variables
def readSettingsFromFile():
    global gestureFunctions, Deadzone, smoothingFactor, delayFrame, speedFactor, keyboardSize, scalingFactor, width, height, settingsChangedFlag, testingMode
    if settingsChangedFlag == True:
        with open("savedSettings.txt", 'r') as file:
            lines = file.readlines()
            for line in lines:
                key, value = line.strip().split(':')
                if key.startswith("function"):
                    index = int(key.replace("function", ""))
                    if value == 'move_cursor' :
                        gestureFunctions[index] = move_cursor
                    elif value == 'click':
                        gestureFunctions[index] = click
                    elif value == 'press_left':
                        gestureFunctions[index] = press_left
                    elif value == 'press_up':
                        gestureFunctions[index] = press_up
                    elif value == 'press_down':
                        gestureFunctions[index] = press_down
                    elif value == 'press_right':
                        gestureFunctions[index] = press_right
                    elif value == 'right_click':
                        gestureFunctions[index] = right_click
                    elif value == 'press_space':
                        gestureFunctions[index] = press_space
                    elif value == 'double_click':
                        gestureFunctions[index] = double_click
                    elif value == 'middle_click':
                        gestureFunctions[index] = middle_click
                    elif value == 'scroll_up':
                        gestureFunctions[index] = scroll_up
                    elif value == 'scroll_down':
                        gestureFunctions[index] = scroll_down
                    elif value == 'open_osk_with_size':
                        gestureFunctions[index] = open_osk_with_size
                    elif value == 'copy':
                        gestureFunctions[index] = copyfunc
                    elif value == 'paste':
                        gestureFunctions[index] = paste
                    elif value == 'zoom_in':
                        gestureFunctions[index] = zoom_in
                    elif value == 'zoom_out':
                        gestureFunctions[index] = zoom_out
                    elif value == 'close_active_window':
                        gestureFunctions[index] = close_active_window
                    elif value == 'minimize_active_window':
                        gestureFunctions[index] = minimize_active_window
                    elif value == 'media_play_pause':
                        gestureFunctions[index] = media_play_pause
                    elif value == 'media_next_track':
                        gestureFunctions[index] = media_next_track
                    elif value == 'media_previous_track':
                        gestureFunctions[index] = media_previous_track
                    elif value == 'increase_volume':
                        gestureFunctions[index] = increase_volume
                    elif value == 'decrease_volume':
                        gestureFunctions[index] = decrease_volume
                    elif value == 'minimize_app':
                        gestureFunctions[index] = minimize_app
                    elif value == 'maximize_app':
                        gestureFunctions[index] = maximize_app
                    else:
                        gestureFunctions[index] = null_function
                elif key == "Deadzone":
                    Deadzone = float(value)
                elif key == "scalingFactor":
                    scalingFactor = float(value)
                elif key == "smoothingFactor":
                    smoothingFactor = float(value)
                elif key == "delayFrame":
                    if value == "low":
                        delayFrame = 0
                    elif value == "medium":
                        delayFrame = 10
                    elif value == "high":
                        delayFrame = 30
                elif key == "speedFactor":
                    speedFactor = int(value)
                elif key == "keyboardSize":
                    keyboardSize = value
                elif key == "width":
                    width = int(value)
                elif key == "height":
                    height = int(value)
                if key == "testingMode":
                    testingMode = value
                    if value == "True":
                        for i in range(13):
                            gestureFunctions[i] = null_function
        settingsChangedFlag = False

# Flask and socket setup 
app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3002"}})
socketio = SocketIO(app, debug=True, cors_allowed_origins="*")

# Main block
if __name__ == '__main__':
    setDefaultValues()
    vision_process = threading.Thread(target=computer_vision)
    socket_process = threading.Thread(target=socket_communication)
    # Start the processes
    vision_process.start()
    socket_process.start()
    # Start the Flask-SocketIO server in the main thread
    socketio.run(app, debug=True, port=5001)
