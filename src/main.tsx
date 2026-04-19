import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

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
