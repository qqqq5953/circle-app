const firebase = require('firebase')

const firebaseConfig = {
  apiKey: 'AIzaSyCfHLQEbHHdm487KpnB9Dhg_7V6F--mftc',
  authDomain: 'circle-app-f1d97.firebaseapp.com',
  databaseURL:
    'https://circle-app-f1d97-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'circle-app-f1d97',
  storageBucket: 'circle-app-f1d97.appspot.com',
  messagingSenderId: '957296046183',
  appId: '1:957296046183:web:4d92ece4384f6231d464c2'
}

firebase.initializeApp(firebaseConfig)
const db = firebase.database()
module.exports = db
