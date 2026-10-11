// js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyDOfW5DXkPq5HDLYqoP1GrNKKt1VdlF2rw",
    authDomain: "cfglobalcargo-a9bcf.firebaseapp.com",
    projectId: "cfglobalcargo-a9bcf",
    storageBucket: "cfglobalcargo-a9bcf.firebasestorage.app",
    messagingSenderId: "482980808360",
    appId: "1:482980808360:web:1ac42bba10072bd9e4649d"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);