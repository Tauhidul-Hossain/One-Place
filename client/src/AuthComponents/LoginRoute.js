import React, { useContext, useEffect } from 'react';
import { AuthLoginInfo } from './AuthLogin';
import { Navigate } from 'react-router-dom';
import './Styles/loadingPage.css';

function LoginRoute({ children }) {
  const user = useContext(AuthLoginInfo);
  if(user === undefined) {
    return (
      <div className="loading-page-wrapper">
        <div className="loading-page">
          <div className="spinner"></div>
        </div>
      </div>
    )
  }
  return user.id ? <Navigate to='../' /> : children;

}
export default LoginRoute
