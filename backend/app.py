import cv2
import numpy as np
import mediapipe as mp
import pyautogui
import os
from tensorflow.keras.models import load_model
import subprocess
import time
from functools import partial
import pygetwindow as gw
import threading

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
pyautogui.FAILSAFE = False

# Initialize mediapipe
mpHands = mp.solutions.hands
hands = mpHands.Hands(max_num_hands=1, min_detection_confidence=0.7)
mpDraw = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles

# Get the directory of the current script
script_dir = os.path.dirname(os.path.abspath(__file__))
# Define the relative paths within your project structure
model_dir = os.path.join(script_dir, 'mp_hand_gesture')
names_file = os.path.join(script_dir, 'gesture.names')
# Load the model
model = load_model(model_dir)

# Load class names
with open(names_file, 'r') as f:
    classNames = f.read().split('\n')
print(classNames)

# Read the configuration file
config_file_path = os.path.join(script_dir, 'conf.txt')
with open(config_file_path, 'r') as config_file:
    lines = config_file.read().split('\n')

# Skip the first line (username)
username = lines[0]

# Assign the other configuration values
scaling_factor = float(lines[2])
deadzone_top = float(lines[3])
deadzone_bottom = float(lines[4])
smoothing_factor = float(lines[5])
delay_time = int(lines[6])
speed_factor = int(lines[7])
keyboard_size = lines[8]

# Initialize the webcam
cap = cv2.VideoCapture(0)
global width, height, screen_height, screen_width, smoothed_cursor_x, smoothed_cursor_y
width = 1920
height = 1080
smoothed_cursor_x = 0
smoothed_cursor_y = 0
dimension_changed = False
cap.set(cv2.CAP_PROP_FRAME_WIDTH, width)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, height)

# Get the screen width and height
screen_width, screen_height = pyautogui.size()

def move_window(window_name, width, height):
    cv2.moveWindow(window_name, screen_width - width, screen_height - height)

def restart_capture(new_width, new_height):
    global cap, width, height, dimension_changed
    if cap is not None:
        cap.release()  # Release the current capture
    # Create a new capture with the updated dimensions
    cap = cv2.VideoCapture(0)
    width = new_width
    height = new_height
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, width)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, height)
    dimension_changed = True
    
def move_cursor():
    global smoothed_cursor_x, smoothed_cursor_y

    index_finger_x, index_finger_y = handLandmarks[8]
    screen_width, screen_height = pyautogui.size()
    target_cursor_x = int((index_finger_x * screen_width * scaling_factor) - (screen_width / 2))
    target_cursor_y = int((index_finger_y * screen_height * scaling_factor) - (screen_height / 2))
    smoothed_cursor_x = smoothing_factor * target_cursor_x + (1 - smoothing_factor) * smoothed_cursor_x
    smoothed_cursor_y = smoothing_factor * target_cursor_y + (1 - smoothing_factor) * smoothed_cursor_y

    pyautogui.moveTo(smoothed_cursor_x, smoothed_cursor_y)

prev_index_finger_x = 0
prev_index_finger_y = 0

# Function to move the cursor based on the index finger movement
def move_cursor2():
    global prev_index_finger_x, prev_index_finger_y
    index_finger_x, index_finger_y = handLandmarks[8]
    if prev_index_finger_x != 0 and prev_index_finger_y != 0:
        # Get the current index finger coordinates
        index_finger_x, index_finger_y = handLandmarks[8]
        
        cursor_x, cursor_y = pyautogui.position()
        # Calculate the movement delta
        delta_x = (index_finger_x - prev_index_finger_x) * speed_factor
        delta_y = (index_finger_y - prev_index_finger_y) * speed_factor
        
        # Calculate the new cursor position
        new_cursor_x = cursor_x + delta_x
        new_cursor_y = cursor_y + delta_y
        
        # Move the cursor
        pyautogui.moveTo(new_cursor_x, new_cursor_y)
    
    # Update the previous index finger position
    prev_index_finger_x = index_finger_x
    prev_index_finger_y = index_finger_y

def click():
    pyautogui.click()

def press_left():
    pyautogui.press('left')
    time.sleep(delay_time)

def press_up():
    pyautogui.press('up')
    time.sleep(delay_time)

def press_down():
    pyautogui.press('down')
    time.sleep(delay_time)

def press_right():
    pyautogui.press('right')
    time.sleep(delay_time)
    
def right_click():
    pyautogui.rightClick()
    time.sleep(delay_time)

def double_click():
    pyautogui.doubleClick()
    time.sleep(delay_time)

def middle_click():
    pyautogui.middleClick()
    time.sleep(delay_time)

def open_osk():
    subprocess.Popen('osk.exe', shell=True)
    time.sleep(delay_time)

def open_osk_with_size():
    if keyboard_size == 'small':
        keyboard_width = 800
        keyboard_height = 400
    elif keyboard_size == 'medium':
        keyboard_width = 1200
        keyboard_height = 600
    elif keyboard_size == 'large':
        keyboard_width = 1920
        keyboard_height = 800
    open_osk()
    window = gw.getWindowsWithTitle("On-Screen Keyboard")
    
    if len(window) == 0:
        print(f"Window with title osk not found.")
        return
    
    window = window[0]  # Get the first window with the specified title
    window.resizeTo(keyboard_width, keyboard_height)

# Function to close the active window
def close_active_window():
    active_window = gw.getActiveWindow()
    if active_window:
        active_window.close()

# Function to minimize the active window
def minimize_active_window():
    active_window = gw.getActiveWindow()
    if active_window:
        active_window.minimize()

def media_play_pause():
    pyautogui.press('playpause')
    time.sleep(delay_time)

def media_next_track():
    pyautogui.press('nexttrack')
    time.sleep(delay_time)

def media_previous_track():
    pyautogui.press('prevtrack')
    time.sleep(delay_time)

def increase_volume():
    pyautogui.press('volumeup')

def decrease_volume():
    pyautogui.press('volumedown')
    
def null_function():
    pass

def perform_action_with_delay(action, delay_time):
    def delayed_action():
        action()
    
    # Create a timer with the specified delay and start it
    timer = threading.Timer(delay_time, delayed_action)
    timer.start()

function = [None] * len(lines)
for i, line in enumerate(lines[10:]):
    line = line.strip()
    if line == 'move_cursor':
        function[i] = move_cursor
    elif line == 'ham':
        function[i] = move_cursor2
    elif line == 'click':
        function[i] = click
    elif line == 'press_left':
        function[i] = press_left
    elif line == 'press_up':
        function[i] = press_up
    elif line == 'press_down':
        function[i] = press_down
    elif line == 'press_right':
        function[i] = press_right
    elif line == 'right_click':
        function[i] = right_click
    elif line == 'double_click':
        function[i] = double_click
    elif line == 'middle_click':
        function[i] = middle_click
    elif line == 'open_osk':
        function[i] = open_osk
    elif line == 'open_osk_with_size':
        function[i] = open_osk_with_size
    elif line == 'close_active_window':
        function[i] = close_active_window
    elif line == 'minimize_active_window':
        function[i] = minimize_active_window
    elif line == 'media_play_pause':
        function[i] = media_play_pause
    elif line == 'media_next_track':
        function[i] = media_next_track
    elif line == 'media_previous_track':
        function[i] = media_previous_track
    elif line == 'increase_volume':
        function[i] = increase_volume
    elif line == 'decrease_volume':
        function[i] = decrease_volume
    else:
        function[i] = null_function

while True:
    # Read each frame from the webcam
    ret, frame = cap.read()
    if not ret:
        break
    x, y, c = frame.shape
    # Flip the frame vertically
    frame = cv2.flip(frame, 1)
    framergb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    # Get hand landmark prediction
    result = hands.process(framergb)

    fingerCount = 0
    className = ''
    handLandmarks = []
    fingersUp = []
    
    # Deadzone lines
    deadzone_top_pixel = int(deadzone_top * height)
    deadzone_bottom_pixel = int(deadzone_bottom * height)
    cv2.line(frame, (0, deadzone_top_pixel), (width, deadzone_top_pixel), (0, 255, 0), 2)
    cv2.line(frame, (0, deadzone_bottom_pixel), (width, deadzone_bottom_pixel), (0, 255, 0), 2)
    
    # post-process the result
    if result.multi_hand_landmarks:
        landmarks = []
        for handslms in result.multi_hand_landmarks:
            for lm in handslms.landmark:
                lmx = int(lm.x * x)
                lmy = int(lm.y * y)
                landmarks.append([lmx, lmy])

            # Drawing landmarks on frames
            mpDraw.draw_landmarks(frame, handslms, mpHands.HAND_CONNECTIONS)

            # Predict gesture
            prediction = model.predict([landmarks])
            classID = np.argmax(prediction)
            className = classNames[classID]

            # Fill list with x and y positions of each landmark
            for landmarks in handslms.landmark:
                handLandmarks.append([landmarks.x, landmarks.y])

            # Other fingers: TIP y position must be lower than PIP y position,
            # as image origin is in the upper left corner.
            handIndex = result.multi_hand_landmarks.index(handslms)
            handLabel = result.multi_handedness[handIndex].classification[0].label

# Other fingers: TIP y position must be lower than PIP y position,
# as image origin is in the upper left corner.
            hand_y = handLandmarks[0][1]  # Assuming the first landmark is the top of the hand
            base_x = (handLandmarks[5][0] + handLandmarks[9][0] + handLandmarks[13][0] + handLandmarks[17][0]) / 4
            base_y = (handLandmarks[5][1] + handLandmarks[9][1] + handLandmarks[13][1] + handLandmarks[17][1]) / 4
            centroid_x = (base_x + handLandmarks[0][0]) / 2
            centroid_y = (base_y + handLandmarks[0][1]) / 2
            if centroid_y < deadzone_top:
                if handLabel == "Left":
                    if handLandmarks[4][0] > handLandmarks[3][0]:  # Check for left thumb
                        fingerCount += 1
                        fingersUp.append("Left Thumb")
                else:  # Right hand
                    if handLandmarks[4][0] < handLandmarks[3][0]:  # Check for right thumb
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
                    
                if fingerCount == 1 and "Index" in fingersUp:
                    function[0]()
                    """
                elif fingerCount == 2 and all(finger in fingersUp for finger in ["Index", "Middle"]) or className=='peace':
                    function[19]()
                elif fingerCount == 1 and all(finger in fingersUp for finger in ["Right Thumb"]) or className=='thumbs up':
                    function[19]()
                elif fingerCount == 2 and all(finger in fingersUp for finger in ["Index", "Pinky"]):
                    function[19]()
                elif fingerCount == 1 and all(finger in fingersUp for finger in ["Pinky"]):
                    function[19]()
                elif fingerCount == 1 and all(finger in fingersUp for finger in ["Ring"]):
                    function[19]()
                elif fingerCount == 3 and all(finger in fingersUp for finger in ["Index", "Ring", "Pinky"]):
                    function[19]()
                    """
    if dimension_changed:
        # Calculate the center of the frame
        center_x = x // 2
        center_y = y // 2
        # Calculate the cropping boundaries to capture the center portion
        crop_x1 = center_x - (width // 2)
        crop_x2 = center_x + (width // 2)
        crop_y1 = center_y - (height // 2)
        crop_y2 = center_y + (height // 2)
        dimension_changed = False  # Reset the dimension change flag
        
    # show the prediction on the frame
    cv2.putText(frame, str(fingerCount) + str(fingersUp) + className, (10, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2, cv2.LINE_AA)
    # Show the final output
    cv2.imshow("Output", frame)
    if cv2.waitKey(1) == ord('q'):
        break

# release the webcam and destroy all active windows
cap.release()
cv2.destroyAllWindows()
