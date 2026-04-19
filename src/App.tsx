import { useState } from 'react';

export default function App() {
  console.log("App component executing...");
  return (
    <div style={{ padding: '100px', textAlign: 'center', background: 'yellow', minHeight: '100vh', color: 'black' }}>
      <h1 style={{ fontSize: '72px' }}>GRIHON IS ONLINE</h1>
      <p style={{ fontSize: '24px' }}>If you see this YELLOW screen, React is rendering!</p>
      <div style={{ marginTop: '20px', padding: '20px', background: 'white' }}>
        <p>Testing State: {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
}
