import cv2
import numpy as np
import mediapipe as mp
import pyautogui
import os
from tensorflow.keras.models import load_model
import subprocess

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

# Initialize the webcam
cap = cv2.VideoCapture(0)
width = 1280
height = 720
cap.set(cv2.CAP_PROP_FRAME_WIDTH, width)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, height)

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
            if handLandmarks[4][0] < handLandmarks[3][0]:
                fingerCount += 1
                fingersUp.append("Thumb")
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
            cursor_x = int(index_finger_x * screen_width)
            cursor_y = int(index_finger_y * screen_height)
            # Move the cursor to the calculated position
            if fingerCount == 1 and "Index" in fingersUp:
                pyautogui.moveTo(cursor_x, cursor_y)
            if fingerCount == 2 and all(finger in fingersUp for finger in ["Index", "Pinky"]):
                pyautogui.click()
            if fingerCount == 2 and all(finger in fingersUp for finger in ["Index", "Middle"]):
                subprocess.Popen('osk.exe', shell=True)
                
    # show the prediction on the frame
    cv2.putText(frame, str(fingerCount) + str(fingersUp) + className, (10, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2, cv2.LINE_AA)
    cv2.putText(frame, str(fingerCount), (50, 450), cv2.FONT_HERSHEY_SIMPLEX, 3, (255, 0, 0), 10)
    # Show the final output
    cv2.imshow("Output", frame)
    if cv2.waitKey(1) == ord('q'):
        break

# release the webcam and destroy all active windows
cap.release()
cv2.destroyAllWindows()
