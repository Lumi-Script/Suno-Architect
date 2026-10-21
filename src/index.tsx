import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { RouterProvider } from './router/Router';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

if (window.location.pathname === '/GoogleOAuth') {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  const accessToken = params.get('access_token');
  
  if (accessToken) {
    localStorage.setItem('google_access_token', accessToken);
    localStorage.removeItem('vertex_project_id');
    window.location.href = '/lyrics';
  } else {
    root.render(
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <p>Authentication failed or no token found.</p>
        <button onClick={() => window.location.href = '/'} className="ml-4 px-4 py-2 bg-blue-600 rounded">Go Back</button>
      </div>
    );
  }
} else {
  root.render(
    <React.StrictMode>
      <RouterProvider>
        <App />
      </RouterProvider>
    </React.StrictMode>
  );
}
