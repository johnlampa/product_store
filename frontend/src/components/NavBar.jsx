import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBagIcon, ShoppingCartIcon } from 'lucide-react';
import ThemeSelector from './ThemeSelector';
import { useShopifyStore } from '../store/useShopifyStore';

function NavBar() {
  const { cart, setCartOpen, loadCart, fetchStatus } = useShopifyStore();

  useEffect(() => {
    fetchStatus();
    loadCart();
  }, [fetchStatus, loadCart]);

  const cartCount = cart?.totalQuantity || 0;

  return (
    <div className="bg-base-100/80 backdrop-blur-lg border-b border-base-content/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto">
        <div className="navbar px-4 min-h-[4rem] justify-between">
          <div className="flex-1 lg:flex-none">
            <Link to="/" className="hover:opacity-80 transition-opacity">
              <div className="flex items-center gap-2">
                <ShoppingCartIcon className="size-9 text-primary" />
                <span
                  className="font-semibold font-mono tracking-widest text-2xl
                    bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary"
                >
                  JKL Shop
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeSelector />

            <button
              type="button"
              className="indicator btn btn-ghost btn-circle"
              onClick={() => setCartOpen(true)}
              title="Cart"
            >
              <ShoppingBagIcon className="size-5" />
              {cartCount > 0 && (
                <span className="badge badge-sm badge-secondary indicator-item">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NavBar;
