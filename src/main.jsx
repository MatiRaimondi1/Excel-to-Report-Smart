/**
 * @file main.jsx
 * @description Punto de entrada principal de la aplicación Excel to Report Smart.
 * Inicializa el árbol de React mediante `createRoot` y renderiza el componente raíz `<App />`
 * en modo estricto (`<StrictMode>`).
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

/**
 * Montaje del componente raíz en el elemento contenedor del DOM con ID 'root'.
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
