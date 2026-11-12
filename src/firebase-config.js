/* Firebase settings for login + cross-device sync.
   Paste the config object from Firebase console → Project settings → Your apps → Web app (SDK setup and configuration → Config).
   These values identify the project; they are not secrets. Access is protected by the Firestore rules in README.md.
   Leave it as null to run the app without login. */
window.TRIADA_FIREBASE = window.TRIADA_FIREBASE || null;
/* Example:
window.TRIADA_FIREBASE = window.TRIADA_FIREBASE || {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  appId: "1:1234567890:web:abc123"
};
*/
