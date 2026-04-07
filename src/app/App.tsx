import { Toaster } from 'sonner';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <div className="font-sans antialiased text-slate-900 bg-white dark:bg-slate-950 dark:text-slate-50 min-h-screen">
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </div>
  );
}