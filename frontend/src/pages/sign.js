import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase, ref, push  } from 'firebase/database';



const firebaseConfig = {
  apiKey: 'AIzaSyDqucx-1iwoHp9rr2qjkrHTm1_VSpsqK1M',
  authDomain: 'gesture-control-e6ff9.firebaseapp.com',
  projectId: 'gesture-control-e6ff9',
  storageBucket: 'gesture-control-e6ff9.appspot.com',
  messagingSenderId: '319506208149',
  appId: '1:319506208149:web:1f1867e589ef3076f9129c',
  measurementId: 'G-2NMC48PMP7',
  databaseURL: "https://gesture-control-e6ff9-default-rtdb.firebaseio.com",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const database = getDatabase(app); // Initialize the Firebase Realtime Database

export const saveUserGestures = (gesturesData) => {
  const user = auth.currentUser;
  if (user) {
    const gesturesRef = ref(database, `gestures/${user.uid}`);
    return push(gesturesRef, gesturesData);
  } else {
    console.log('User is not logged in.');
  }
};

// Function to save user settings
export const saveUserSettings = (settingsData) => {
  const user = auth.currentUser;
  if (user) {
    const settingsRef = ref(database, `userSettings/${user.uid}`);
    return push(settingsRef, settingsData);
  } else {
    console.log('User is not logged in.');
  }
};

export { auth, provider, database };