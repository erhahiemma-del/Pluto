import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { cardFontFaceCSS } from './services/cardFonts';

// Self-hosted card fonts (no Google Fonts dependency)
const fontStyle = document.createElement('style');
fontStyle.textContent = cardFontFaceCSS;
document.head.appendChild(fontStyle);

createRoot(document.getElementById('root')!).render(<App />);
