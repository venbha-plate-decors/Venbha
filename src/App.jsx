import React, { Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import RosePetals from './components/RosePetals';
import Loading from './components/Loading';
import ScrollToTop from './components/ScrollToTop';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const Designs = lazy(() => import('./pages/Designs'));
const Gallery = lazy(() => import('./pages/Gallery'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Blogs = lazy(() => import('./pages/Blogs'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

const PublicLayout = () => {
  return (
    <div className="App">
      <RosePetals />
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};



function App() {
  return (
    <Router>
      <AuthProvider>
        <ScrollToTop />
        <Suspense fallback={<Loading />}>
          <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/collections" element={<Designs />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/blogs" element={<Blogs />} />
            </Route>

            {/* Admin Routes - No Header/Footer */}
            <Route path="/admin_login" element={<AdminLogin />} />
            <Route
              path="/admin_dashboard"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
}

export default App;
