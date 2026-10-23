import { StrictMode } from 'react' // helps find mistakes in the application and provides warnings for potential issues
import { createRoot } from 'react-dom/client' // creates a root for rendering the React application ( EG : Person who places the furniture inside the house)
import './index.css'
import App from './App.tsx'
import { Provider } from 'react-redux'
import { store } from './app/store'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
