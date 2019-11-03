/* eslint-disable max-len */
import axios from 'axios';

const config = {
  apiKey: process.env.GATSBY_API_KEY,
  authDomain: process.env.GATSBY_AUTH_DOMAIN,
  databaseURL: process.env.GATSBY_DATABASE_URL,
  projectId: process.env.GATSBY_PROJECT_ID,
  storageBucket: process.env.GATSBY_STORAGE_BUCKET,
  messagingSenderId: process.env.GATSBY_MESSAGING_SENDER_ID,
  appId: process.env.GATSBY_APPID,
};

class Firebase {
  constructor(app) {
    console.debug(config);
    app.initializeApp(config);

    /* Helper */

    this.serverValue = app.database.ServerValue;
    this.emailAuthProvider = app.auth.EmailAuthProvider;

    /* Firebase APIs */

    this.auth = app.auth();
    this.db = app.database();
    this.perf = app.performance();

    this.messaging = null;
    try {
      this.messaging = app.messaging();
      this.messaging.usePublicVapidKey(process.env.GATSBY_VAPID_KEY);
    } catch (e) {
      console.error(e);
    }

    /* Social Sign In Method Provider */
    this.googleProvider = new app.auth.GoogleAuthProvider();

    return this;
  }

  // *** Auth API ***

  doCreateUserWithEmailAndPassword = (email, password) => this.auth.createUserWithEmailAndPassword(email, password);

  doSignInWithEmailAndPassword = (email, password) => this.auth.signInWithEmailAndPassword(email, password);

  doSignInWithGoogle = () => this.auth.signInWithPopup(this.googleProvider);

  doSignOut = () => this.auth.signOut();

  doPasswordReset = (email) => this.auth.sendPasswordResetEmail(email);

  doSendEmailVerification = () => this.auth.currentUser.sendEmailVerification({
    url: process.env.GATSBY_CONFIRMATION_EMAIL_REDIRECT,
  })

  doPasswordUpdate = (password) => this.auth.currentUser.updatePassword(password);

  // *** Messaging *** //
  doMessagingRequestPermission = () => this.messaging && this.messaging.requestPermission().then(() => {
    console.log('Notification permission granted.');
    // TODO(developer): Retrieve an Instance ID token for use with FCM.
    // ...
  }).catch((err) => {
    console.log('Unable to get permission to notify.', err);
  })

  sendTokenToServer = (token) => {
    this.messagingToken = token;
    if (token && this.auth.currentUser.email) {
      axios.get('/api/updateMessagingToken', {
        params: { email: this.auth.currentUser.email, token }
      });
    }
  }

  onMessagingRequestPermission = (next, fallback) => this.messaging && this.messaging.getToken().then((currentToken) => {
    if (currentToken) {
      console.log('Messaging token', currentToken);
      this.sendTokenToServer(currentToken);
      next(currentToken);
    } else {
      // Show permission request.
      console.log('No Instance ID token available. Request permission to generate one.');
      // Show permission UI.
      // updateUIForPushPermissionRequired();
      // setTokenSentToServer(false);
      this.sendTokenToServer(false);
      fallback();
      this.doMessagingRequestPermission();
    }
  }).catch((err) => {
    console.log('An error occurred while retrieving token. ', err);
    this.sendTokenToServer(false);
    fallback();
  })

  onMessagingTokenRefresh = (next, fallback) => this.messaging && this.messaging.onTokenRefresh(() => this.onMessagingRequestPermission(next, fallback))

  // *** Merge Auth and DB User API *** //
  onAuthUserListener = (next, fallback) => this.auth.onAuthStateChanged((authUser) => {
    if (authUser) {
      console.debug(authUser);
      next(authUser);
    } else {
      fallback();
    }
  });

  // *** User API ***

  user = (uid) => this.db.ref(`users/${uid}`);

  users = () => this.db.ref('users');

  // *** Message API ***

  message = (uid) => this.db.ref(`messages/${uid}`);

  messages = () => this.db.ref('messages');
}

let firebase;

function getFirebase(app) {
  try {
    firebase = new Firebase(app);
  } catch (e) {
    if (e.code !== 'app/duplicate-app') throw new Error(e);
  }

  return firebase;
}

export default getFirebase;