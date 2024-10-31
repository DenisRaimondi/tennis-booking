import { firebaseConfig as testConfig } from './firebase.test';
import { firebaseConfig as prodConfig } from './firebase.prod';

export const firebaseConfig = process.env.REACT_APP_ENV === 'production' 
  ? prodConfig 
  : testConfig;