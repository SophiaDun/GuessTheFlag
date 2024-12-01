import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { db } from './FirebaseConfig';

// Function to sign up a user
export const signUp = async (email, password, username) => {
  try {
    const auth = getAuth();  
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userRef = ref(db, `users/${user.uid}`);
    await set(userRef, {
      email: email,
      username: username, 
    });

    return user;
  } catch (error) {
    throw error;
  }
};

// Function to log in a user
export const login = async (email, password) => {
  try {
    const auth = getAuth(); 
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user; 
  } catch (error) {
    throw error; 
  }
};
