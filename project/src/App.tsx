import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './components/LoginPage';
import Navigation from './components/Navigation';
import BookViewPage from './components/BookViewPage';
import BookImportPage from './components/BookImportPage';
import BookSelectorPage from './components/BookSelectorPage';
import QuestionGeneratorPage from './components/QuestionGeneratorPage';

function PrivateRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) {
  const { user } = useAuth();
  
  console.log('PrivateRoute check:', { 
    user, 
    allowedRoles,
    userRole: user?.role,
    hasAccess: user && allowedRoles.includes(user.role.toUpperCase())
  });
  
  if (!user) {
    console.log('No user found, redirecting to login');
    return <Navigate to="/login" />;
  }

  const userRole = user.role.toUpperCase();
  const allowedUpperRoles = allowedRoles.map(role => role.toUpperCase());

  if (!allowedUpperRoles.includes(userRole)) {
    console.log('User role not allowed:', userRole);
    return <Navigate to="/books" />;
  }

  return (
    <>
      <Navigation />
      <div className="p-4">
        {children}
      </div>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-100">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            
            {/* View Books - accessible by all roles */}
            <Route path="/books" element={
              <PrivateRoute allowedRoles={['ADMIN', 'VIEWER', 'SELECTOR', 'IMPORTER']}>
                <BookViewPage />
              </PrivateRoute>
            } />
            
            {/* Import Books - accessible by ADMIN and IMPORTER */}
            <Route path="/import" element={
              <PrivateRoute allowedRoles={['ADMIN', 'IMPORTER']}>
                <BookImportPage />
              </PrivateRoute>
            } />
            
            {/* Select Books - accessible by ADMIN and SELECTOR */}
            <Route path="/select-books" element={
              <PrivateRoute allowedRoles={['ADMIN', 'SELECTOR']}>
                <BookSelectorPage />
              </PrivateRoute>
            } />
            
            {/* Generate Questions - accessible by ADMIN and SELECTOR */}
            <Route path="/generate-questions" element={
              <PrivateRoute allowedRoles={['ADMIN', 'SELECTOR']}>
                <QuestionGeneratorPage />
              </PrivateRoute>
            } />
            
            <Route path="/" element={<Navigate to="/books" />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;