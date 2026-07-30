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
    <div className="bg-base-100/80 backdrop-blur-lg border-b border-base-content/10 sticky top-0 z-50 pt-safe">
      <div className="max-w-7xl mx-auto">
        <div className="navbar gap-2 px-3 sm:px-4 min-h-[3.5rem] sm:min-h-[4rem] justify-between">
          <div className="flex-1 min-w-0 lg:flex-none">
            <Link to="/" className="hover:opacity-80 transition-opacity">
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <ShoppingCartIcon className="size-7 sm:size-9 text-primary shrink-0" />
                <span
                  className="font-semibold font-mono tracking-wide sm:tracking-widest text-xl sm:text-2xl
                    bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary truncate"
                >
                  JKL Shop
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
            <ThemeSelector />

            <div className="indicator">
              {cartCount > 0 && (
                <span className="badge badge-sm badge-secondary indicator-item">
                  {cartCount}
                </span>
              )}
              <button
                type="button"
                className="btn btn-ghost btn-circle"
                onClick={() => setCartOpen(true)}
                title="Cart"
                aria-label="Open cart"
              >
                <ShoppingBagIcon className="size-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NavBar;
