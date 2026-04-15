import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCfUldZcWL2Zz1lhcCHkiMYnURR_G658H0",
  authDomain: "dolcevita-1ccce.firebaseapp.com",
  projectId: "dolcevita-1ccce",
  storageBucket: "dolcevita-1ccce.firebasestorage.app",
  messagingSenderId: "272493165543",
  appId: "1:272493165543:web:2969101bf1a58e44e7db42",
  measurementId: "G-WDNVXEE59X"
};

const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
