import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  realm: 'wintershop',
  url: 'http://localhost:8080/',
  clientId: 'shop'
});

keycloak.onTokenExpired = () => {
  console.log('token expired', keycloak.token);
  keycloak.updateToken(30).success(()=>{
    console.log('Successfully get a new token')
  }).error(()=>{
    console.log('Error when refreshing token')
  });
}

keycloak.init({ onLoad: 'login-required'})
  .then((authenticated)=> {
    if (authenticated) {
      console.log('User is authenticated');

      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(
        <React.StrictMode>
          <App keycloak={keycloak} />
        </React.StrictMode>
      );
    } else {
      console.log('User is not authenticated')
    }
  })


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
