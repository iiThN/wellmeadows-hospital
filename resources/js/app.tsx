import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './app_router';
import { AuthProvider } from './contexts/AuthContext';
import { initializeTheme } from './hooks/use-appearance';

initializeTheme();

const el = document.getElementById('app')!;
createRoot(el).render(
    <BrowserRouter>
        <AuthProvider>
            <App />
        </AuthProvider>
    </BrowserRouter>
);
