import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import NavBar from './components/NavBar';
import ShopPage from './pages/ShopPage';
import ShopProductPage from './pages/ShopProductPage';
import CartDrawer from './components/CartDrawer';
import { useThemeStore } from './store/useThemeStore';
import { Toaster } from 'react-hot-toast';

function App() {
  const { theme } = useThemeStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className="min-h-screen bg-base-200 transition-colors duration-300 pb-safe">
      <NavBar />
      <Routes>
        <Route path="/" element={<ShopPage />} />
        <Route path="/shop" element={<Navigate to="/" replace />} />
        <Route path="/shop/:handle" element={<ShopProductPage />} />
      </Routes>

      <CartDrawer />
      <Toaster
        position="bottom-center"
        containerStyle={{ bottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
        toastOptions={{ className: 'max-w-[90vw]' }}
      />
    </div>
  );
}

export default App;
