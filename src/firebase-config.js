/* Firebase settings for login + cross-device sync.
   From Firebase console → Project settings → Your apps → Web app (Config).
   These values identify the project; they are not secrets. Access is protected by the Firestore rules in README.md.
   Set it to null to run the app without login. */
window.TRIADA_FIREBASE = window.TRIADA_FIREBASE || {
  apiKey: "AIzaSyCuEMl2bFdq0hkXB5yu9F_K5MRa-VOqUTc",
  authDomain: "triada---reader.firebaseapp.com",
  projectId: "triada---reader",
  storageBucket: "triada---reader.firebasestorage.app",
  messagingSenderId: "366857452199",
  appId: "1:366857452199:web:17008ea94740268baf3982"
};
