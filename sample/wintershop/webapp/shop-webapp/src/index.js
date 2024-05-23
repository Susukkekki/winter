import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import Keycloak from 'keycloak-js';
import { ScaleLoader } from 'react-spinners'; 

const override = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};

function Woops() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%'
      }}>
        <h1>Woops! Something wrong.</h1>
      </div>
  )
}

const keycloak = new Keycloak({
  realm: 'wintershop',
  // url: 'http://localhost:8080/auth',
  url: 'http://wintershop.io/auth',
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

const root = ReactDOM.createRoot(document.getElementById('root'));

keycloak.init({ onLoad: 'login-required'})
  .then((authenticated)=> {
    if (authenticated) {
      console.log('User is authenticated');
      
      root.render(
        <React.StrictMode>
          <App keycloak={keycloak} />
        </React.StrictMode>
      );
    } else {
      console.log('User is not authenticated')

      root.render(
        <React.StrictMode>
          <Woops />
        </React.StrictMode>
      );
    }
  }).catch(() => {
    console.warn("auth timeout")

    root.render(
      <React.StrictMode>
        <Woops />
      </React.StrictMode>
    );
  })

root.render(
  <React.StrictMode>
    <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%'
    }}>
      <ScaleLoader loading="true" height="40px" width="10px"/>
      </div>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
