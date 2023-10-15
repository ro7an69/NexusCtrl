import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth"; // Remove the space here

const firebaseConfig = {
  apiKey: "AIzaSyDqucx-1iwoHp9rr2qjkrHTm1_VSpsqK1M",
  authDomain: "gesture-control-e6ff9.firebaseapp.com",
  projectId: "gesture-control-e6ff9",
  storageBucket: "gesture-control-e6ff9.appspot.com",
  messagingSenderId: "319506208149",
  appId: "1:319506208149:web:1f1867e589ef3076f9129c",
  measurementId: "G-2NMC48PMP7"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider }; 