import React from 'react';
import ReactDOM from 'react-dom';
import firebase from 'firebase';
import App from './App';
import './index.css';

// Initialize Firebase
var config = {
  apiKey: "AIzaSyCzb_isIE3Dovg4oMHGPZ1bVF_V22BEPuc",
  authDomain: "mygram-41b96.firebaseapp.com",
  databaseURL: "https://mygram-41b96.firebaseio.com",
  storageBucket: "mygram-41b96.appspot.com",
  messagingSenderId: "17969033864"
};
firebase.initializeApp(config);

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
