// main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import './overflow-fix.css';   // ✅ يجب أن يكون آخر سطر استيراد CSS
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);