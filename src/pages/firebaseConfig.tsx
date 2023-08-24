import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyCXfFri0ug50qd_oia_O3VsEQA1ss1vdZI",
  authDomain: "movie-app-d2ba9.firebaseapp.com",
  databaseURL:
    "https://movie-app-d2ba9-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "movie-app-d2ba9",
  storageBucket: "movie-app-d2ba9.appspot.com",
  messagingSenderId: "118250717195",
  appId: "1:118250717195:web:7b08522f88556b14c0c70e",
  measurementId: "G-YYYNK9GGMW",
};

const firebaseApp = initializeApp(firebaseConfig);

export default firebaseApp;
