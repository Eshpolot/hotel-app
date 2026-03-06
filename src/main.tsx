import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const el = document.getElementById('root');
if (el) {
  ReactDOM.createRoot(el).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
