import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBTWgv88hZINpU72c1ta3s9oHmPykY2Vao",
  authDomain: "foodies-cd293.firebaseapp.com",
  projectId: "foodies-cd293",
  storageBucket: "foodies-cd293.firebasestorage.app",
  messagingSenderId: "589774229661",
  appId: "1:589774229661:web:3813803947ad1ee90d0474",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
auth.settings.appVerificationDisabledForTesting = true;