import { Outlet, useLocation } from 'react-router';
import Navbar from './Navbar';
import Footer from './Footer';

export default function RootLayout() {
  const location = useLocation();
  
  // Check if current page is using StudentLayout, AdminLayout, or EncoderLayout
  // These layouts have their own navigation, so we skip the Navbar
  const isStudentPage = location.pathname.startsWith('/student/dashboard') ||
                        location.pathname.startsWith('/student/exams') ||
                        location.pathname.startsWith('/student/profile') ||
                        location.pathname.startsWith('/student/feedback') ||
                        location.pathname.startsWith('/student/testimony') ||
                        location.pathname.startsWith('/student/gaming');
  
  const isAdminPage = location.pathname.startsWith('/admin/');
  const isEncoderPage = location.pathname.startsWith('/encoder/');
  
  // Pages that use custom layouts
  const hasCustomLayout = isStudentPage || isAdminPage || isEncoderPage;
  
  // Determine if user is logged in and their role
  // In production, this would come from auth context
  const isLoggedIn = hasCustomLayout;
  const userRole = isAdminPage ? 'admin' : isEncoderPage ? 'encoder' : isStudentPage ? 'student' : undefined;
  
  return (
    <>
      {!hasCustomLayout && <Navbar isLoggedIn={isLoggedIn} userRole={userRole} />}
      <Outlet />
      {!hasCustomLayout && <Footer />}
    </>
  );
}