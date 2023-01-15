import React from 'react';
import ReactDOM from 'react-dom';
import './Assets/Styles/index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import { AuthLogin } from './AuthComponents/AuthLogin';

// ReactDOM.render(
//   <AdminPanel>
//     <App />
//   </AdminPanel>,
//   document.getElementById('root'));
// registerServiceWorker();
ReactDOM.render(
  <AuthLogin>
    <App />
  </AuthLogin>,
  document.getElementById('root'));
registerServiceWorker();