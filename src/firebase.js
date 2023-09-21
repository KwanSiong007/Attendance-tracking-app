import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
//This line imports a specific function called getAuth from the Firebase Authentication library, which is typically used to create an authentication instance.
import { getAuth } from "firebase/auth";
//This line is importing a specific function getStorage from the Firebase storage module.
//This function helps us access the storage service provided by Firebase, which is a way to store files and data securely.
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_DATABASE_URL,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGE_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
};

const firebaseApp = initializeApp(firebaseConfig);

export const database = getDatabase(firebaseApp);
//firebaseApp is assumed to be a previously configured Firebase app instance. It's important to set up Firebase in your application before using Firebase Authentication.
//getAuth(firebaseApp) calls the getAuth function with your Firebase app instance as an argument. This creates an authentication instance that is associated with your Firebase project.
export const auth = getAuth(firebaseApp);
//getStorage(firebaseApp): This is a function call. It uses the getStorage function from the Firebase storage module.
//It takes an argument firebaseApp, which presumably represents a Firebase app instance.
//This line essentially initializes and configures the Firebase storage service for use in the application.
//In conclusion, This constant, named storage provides methods and functionality to interact with the Firebase storage, such as uploading and retrieving files securely.
export const storage = getStorage(firebaseApp);
