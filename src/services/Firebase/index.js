import firebase from 'firebase';
import 'firebase/auth'

const firebaseConfig = {
	apiKey: process.env.REACT_APP_FIREBASE_APIKEY,
	authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
	projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
	storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: process.env.REACT_APP_FIREBASE_SENDER_ID,
	appId: process.env.REACT_APP_FIREBASE_APP_ID,
	measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

firebase.initializeApp(firebaseConfig);

export const FirebaseAuth = firebase.auth();
export const FirebaseMessaging = firebase.messaging();
export const Firestore = firebase.firestore();

export const FirebasePersistence = firebase.auth.Auth.Persistence;

export const EmailProvider = new firebase.auth.EmailAuthProvider();
export const GoogleProvider = new firebase.auth.GoogleAuthProvider();
export const FacebookProvider = new firebase.auth.FacebookAuthProvider();

export const getProviderById = (id) => {
	switch (id) {
		case 'password': {
			return new firebase.auth.EmailAuthProvider();
		}
		case 'phone': {
			return new firebase.auth.PhoneAuthProvider();
		}
		case 'google.com': {
			return new firebase.auth.GoogleAuthProvider();
		}
		case 'facebook.com': {
			return new firebase.auth.FacebookAuthProvider();
		}
		case 'twitter.com': {
			return new firebase.auth.TwitterAuthProvider();
		}
		case 'github.com': {
			return new firebase.auth.GithubAuthProvider();
		}
		default: {
			return null;
		}
	}
};

export const getEmailCredential = (email, password) => {
	return new firebase.auth.EmailAuthProvider.credential(email, password);
}
