# NexusCtrl

The NexusCtrl application offers a wireless, gesture-based control system for cursor and keyboard interactions, providing an accessible solution for users with limited fine motor skills, for interactive learning in classrooms, and controlling PowerPoint presentations.

## Project Setup

### Frontend (NodeJS)

To run the frontend using NodeJS, make sure npm is installed.

1. Open a terminal and navigate to the frontend directory:

    ```bash
    cd yourpath/frontend
    ```

2. Run the following command to install react-scripts:

   ```bash
   npm install react-scripts
   ```

3. Run the following command to start the frontend:

    ```bash
    npm start
    ```

### Backend (Python)

To run the backend using Python, follow these steps:

1. Create a virtual environment by navigating to the project's root directory:

    ```bash
    cd yourpath/backend
    python -m venv venv
    ```

2. Activate the virtual environment:

    - On Windows:

        ```bash
        .\venv\Scripts\activate
        ```

    - On Unix or MacOS:

        ```bash
        source venv/bin/activate
        ```

3. Install the required libraries:

    ```bash
    pip install -r backend/requirements.txt
    ```

4. Ensure that line 87 in `backend/app.py` containing "socketio.emit('receive_image', {'image': image_bytes})" is not commented out.

5. Run the backend application:

    ```bash
    python backend/app.py
    ```

6. Wait for 1 minute for the application to execute. Note that you may encounter an error twice regarding 'image_bytes' not being defined.

7. After 1 minute, comment out line 87 in `backend/app.py` that contains "#socketio.emit('receive_image', {'image': image_bytes})" and save (Ctrl+S).

Now, both the frontend and backend components of NexusCtrl should be running successfully.

Feel free to customize this README.md to provide additional information or instructions specific to your project.
