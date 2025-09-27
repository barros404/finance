import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import './index.css'
import App from './App.jsx'
import { initializeIntegration } from './config/apiIntegration.js'

// Inicializar integração com a API
initializeIntegration().then(success => {
  if (success) {
    console.log('🎉 Sistema integrado com sucesso!');
  } else {
    console.warn('⚠️ Problemas na integração, mas o sistema continuará funcionando');
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
