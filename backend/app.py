import cv2
import numpy as np
import mediapipe as mp
import tensorflow as tf
from tensorflow.keras.models import load_model
import os
from mp_hand_gesture import test  # Import gesture_names

# Initialize mediapipe
mpHands = mp.solutions.hands
hands = mpHands.Hands(max_num_hands=1, min_detection_confidence=0.7)
mpDraw = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles

# Load the gesture recognizer model
model = load_model(test)
with open('gesture.names', 'r') as f:
    classNames = f.read().split('\n')

print(classNames)

# Initialize the webcam
cap = cv2.VideoCapture(0)

while True:
    # Read each frame from the webcam
    _, frame = cap.read()

    x, y, c = frame.shape

    # Flip the frame vertically
    frame = cv2.flip(frame, 1)
    framergb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    # Get hand landmark prediction
    result = hands.process(framergb)

    # print(result)
    
    className = ''

    # post process the result
    if result.multi_hand_landmarks:
        landmarks = []
        for handslms in result.multi_hand_landmarks:
            for lm in handslms.landmark:
                # print(id, lm)
                lmx = int(lm.x * x)
                lmy = int(lm.y * y)

                landmarks.append([lmx, lmy])

            # Drawing landmarks on frames
            mpDraw.draw_landmarks(frame, handslms, mpHands.HAND_CONNECTIONS)

            # Predict gesture
            prediction = model.predict([landmarks])
            # print(prediction)
            classID = np.argmax(prediction)
            className = classNames[classID]
    # Initially set finger count to 0 for each cap
    fingerCount = 0

    if result.multi_hand_landmarks:
        for hand_landmarks in result.multi_hand_landmarks:
            # Get hand index to check label (left or right)
            handIndex = result.multi_hand_landmarks.index(hand_landmarks)
            handLabel = result.multi_handedness[handIndex].classification[0].label

            # Set variable to keep landmarks positions (x and y)
            handLandmarks = []

            # Fill list with x and y positions of each landmark
            for landmarks in hand_landmarks.landmark:
                handLandmarks.append([landmarks.x, landmarks.y])

            # Test conditions for each finger: Count is increased if finger is 
            #considered raised.
            #Thumb: TIP x position must be greater or lower than IP x position, 
            #deppeding on hand label.
            if handLabel == "Left" and handLandmarks[4][0] > handLandmarks[3][0]:
                fingerCount = fingerCount+1
            elif handLabel == "Right" and handLandmarks[4][0] < handLandmarks[3][0]:
                fingerCount = fingerCount+1

            # Other fingers: TIP y position must be lower than PIP y position, 
            #   as image origin is in the upper left corner.
            if handLandmarks[8][1] < handLandmarks[6][1]:       #Index finger
                fingerCount = fingerCount+1
            if handLandmarks[12][1] < handLandmarks[10][1]:     #Middle finger
                fingerCount = fingerCount+1
            if handLandmarks[16][1] < handLandmarks[14][1]:     #Ring finger
                fingerCount = fingerCount+1
            if handLandmarks[20][1] < handLandmarks[18][1]:     #Pinky
                fingerCount = fingerCount+1

    # show the prediction on the frame
    cv2.putText(frame, str(fingerCount)+className, (10, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0,0,255), 2, cv2.LINE_AA)

    cv2.putText(frame, str(fingerCount), (50, 450), cv2.FONT_HERSHEY_SIMPLEX, 3, (255, 0, 0), 10)

    # Show the final output
    cv2.imshow("Output", frame) 

    if cv2.waitKey(1) == ord('q'):
        break

# release the webcam and destroy all active windows
cap.release()

cv2.destroyAllWindows()
