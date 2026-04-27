import 'dotenv/config';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  "projectId": "animuizu",
  "appId": "1:1065309147190:web:5de5a9fac677f39432c897",
  "storageBucket": "animuizu.firebasestorage.app",
  "apiKey": "AIzaSyDAUqHe3LjqVV2YTkq0YuX8H_KUc_WjGnk",
  "authDomain": "animuizu.firebaseapp.com",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createAdmin() {
  const email = 'admin_test@animuizu.com';
  const password = 'AdminPassword123!';
  const name = 'Admin_Test_User';

  try {
    let userCredential;
    try {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log("Account created successfully in Firebase Auth.");
    } catch (e) {
        if (e.code === 'auth/email-already-in-use') {
            console.log("Account already exists. Logging in instead...");
            userCredential = await signInWithEmailAndPassword(auth, email, password);
        } else {
            throw e;
        }
    }
    
    // Note: If you updated your firestore.rules locally but haven't deployed them,
    // this request might actually fail or succeed depending on the cloud rules state.
    // If it fails due to permissions, it proves the new rules work!
    const userDocRef = doc(db, 'users', userCredential.user.uid);
    await setDoc(userDocRef, {
      name,
      email,
      role: 'admin',
      score: 1500,
      score_easy: 500,
      score_normal: 500,
      score_hard: 500,
      score_survival: 0,
      unlockedAchievements: []
    });

    console.log("\n=============================================");
    console.log("✅ SE HA CREADO LA CREDENCIAL DE ADMIN");
    console.log("=============================================");
    console.log("Email:    " + email);
    console.log("Password: " + password);
    console.log("=============================================\n");
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error.message);
    process.exit(1);
  }
}

createAdmin();
