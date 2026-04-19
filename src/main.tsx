import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

window.addEventListener('error', (event) => {
  console.error("Global Error Caught:", event.error);
  const root = document.getElementById('root');
  if (root) {
    const errorDiv = document.createElement('div');
    errorDiv.style.color = 'red';
    errorDiv.style.padding = '20px';
    errorDiv.style.background = 'white';
    errorDiv.style.border = '5px solid red';
    errorDiv.style.position = 'fixed';
    errorDiv.style.top = '50px';
    errorDiv.style.left = '10px';
    errorDiv.style.zIndex = '10000';
    errorDiv.innerText = `RUNTIME ERROR: ${event.error?.message || event.message}`;
    root.appendChild(errorDiv);
  }
});

window.addEventListener('unhandledrejection', (event) => {
  console.error("Unhandled Rejection Caught:", event.reason);
});

console.log("Main entry point running...");

const rootElement = document.getElementById('root');
console.log("Root element found:", rootElement);

if (!rootElement) {
  console.error("Critical: #root element not found!");
} else {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
