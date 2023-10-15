import cv2
import numpy as np
import mediapipe as mp
import pyautogui
import os
from tensorflow.keras.models import load_model
import subprocess
import time

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
# Initialize the webcam
cap = cv2.VideoCapture(0)
width = 1920
height = 1080
scaling_factor = 2.0
cap.set(cv2.CAP_PROP_FRAME_WIDTH, width)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, height)
smoothed_cursor_x = 0
smoothed_cursor_y = 0
smoothing_factor = 0.5
delay_time = 2

deadzone_top = 0.5
deadzone_bottom = 1

# Get the screen width and height
screen_width, screen_height = pyautogui.size()

while True:
    # Read each frame from the webcam
    _, frame = cap.read()
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
            print(hand_y)
            print(centroid_y)
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
                    
                
                index_finger_x, index_finger_y = handLandmarks[8]
                screen_width, screen_height = pyautogui.size()
                cursor_x = int((index_finger_x * screen_width * scaling_factor) - (screen_width / 2))
                cursor_y = int((index_finger_y * screen_height * scaling_factor) - (screen_height / 2))
                smoothed_cursor_x = (1 - smoothing_factor) * smoothed_cursor_x + smoothing_factor * cursor_x
                smoothed_cursor_y = (1 - smoothing_factor) * smoothed_cursor_y + smoothing_factor * cursor_y

                # Move the cursor to the calculated position
                if fingerCount == 1 and "Index" in fingersUp:
                    pyautogui.moveTo(smoothed_cursor_x, smoothed_cursor_y)
                if fingerCount == 2 and all(finger in fingersUp for finger in ["Index", "Middle"]) or className=='peace':
                    pyautogui.click()
                    time.sleep(delay_time)
                if fingerCount == 1 and all(finger in fingersUp for finger in ["Right Thumb"]) or className=='thumbs up':
                    pyautogui.press('left')
                    time.sleep(delay_time)
                if fingerCount == 2 and all(finger in fingersUp for finger in ["Index", "Pinky"]):
                    pyautogui.rightClick()
                    time.sleep(delay_time)
                if fingerCount == 1 and all(finger in fingersUp for finger in ["Pinky"]):
                    pyautogui.doubleClick()
                    time.sleep(delay_time)
                if fingerCount == 1 and all(finger in fingersUp for finger in ["Ring"]):
                    pyautogui.middleClick()
                    time.sleep(delay_time)
                if fingerCount == 3 and all(finger in fingersUp for finger in ["Index", "Ring", "Pinky"]):
                    subprocess.Popen('osk.exe', shell=True)
                    time.sleep(delay_time)

    # show the prediction on the frame
    cv2.putText(frame, str(fingerCount) + str(fingersUp) + className, (10, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2, cv2.LINE_AA)
    # Show the final output
    cv2.imshow("Output", frame)
    if cv2.waitKey(1) == ord('q'):
        break

# release the webcam and destroy all active windows
cap.release()
cv2.destroyAllWindows()
