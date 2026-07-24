import { Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import NavBar from './components/NavBar';
import ProductPage from './pages/ProductPage';
import ShopPage from './pages/ShopPage';
import ShopProductPage from './pages/ShopProductPage';
import CartDrawer from './components/CartDrawer';
import { useThemeStore } from './store/useThemeStore';
import { Toaster } from 'react-hot-toast';

function App() {
  const { theme } = useThemeStore();

  return (
    <div
      className="min-h-screen bg-base-200 transition-colors duration-300"
      data-theme={theme}
    >
      <NavBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/shop/:handle" element={<ShopProductPage />} />
      </Routes>

      <CartDrawer />
      <Toaster />
    </div>
  );
}

export default App;
