import { Toaster } from 'sonner';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AuthProvider } from './context/AuthContext';

const routerFallback = (
  <div className="min-h-screen flex items-center justify-center text-sm text-slate-500 dark:text-slate-400">
    Loading app...
  </div>
);

export default function App() {
  return (
    <div className="font-sans antialiased text-slate-900 bg-white dark:bg-slate-950 dark:text-slate-50 min-h-screen">
      <AuthProvider>
        <RouterProvider router={router} fallbackElement={routerFallback} />
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </div>
  );
}