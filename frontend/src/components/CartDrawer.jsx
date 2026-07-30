import { useEffect } from 'react';
import { MinusIcon, PlusIcon, ShoppingBagIcon, Trash2Icon, XIcon } from 'lucide-react';
import { useShopifyStore } from '../store/useShopifyStore';

function formatMoney(amount, currencyCode = 'USD') {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currencyCode,
    }).format(amount);
  } catch {
    return `${currencyCode} ${Number(amount).toFixed(2)}`;
  }
}

function CartDrawer() {
  const {
    cart,
    cartOpen,
    cartLoading,
    setCartOpen,
    updateLineQuantity,
    removeLine,
    checkout,
  } = useShopifyStore();

  const lines = cart?.lines || [];
  const currency = cart?.cost?.currencyCode || 'USD';

  // The drawer covers the whole screen on phones, so the page behind it must not scroll
  useEffect(() => {
    if (!cartOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [cartOpen]);

  return (
    <>
      <div
        className={`fixed inset-0 z-[60] bg-black/40 transition-opacity ${
          cartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setCartOpen(false)}
      />

      <aside
        aria-hidden={!cartOpen}
        className={`fixed top-0 right-0 z-[70] h-full w-full max-w-md bg-base-100 shadow-2xl transition-transform duration-300 flex flex-col pt-safe pb-safe ${
          cartOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between gap-2 border-b border-base-content/10 px-4 py-3 sm:py-4">
          <div className="flex items-center gap-2 min-w-0">
            <ShoppingBagIcon className="size-5 shrink-0" />
            <h2 className="font-semibold text-lg">Cart</h2>
            {cart?.totalQuantity > 0 && (
              <span className="badge badge-primary">{cart.totalQuantity}</span>
            )}
          </div>
          <button
            className="btn btn-ghost btn-sm btn-circle shrink-0"
            onClick={() => setCartOpen(false)}
            aria-label="Close cart"
          >
            <XIcon className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-4">
          {cartLoading && lines.length === 0 && (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-md" />
            </div>
          )}

          {!cartLoading && lines.length === 0 && (
            <div className="text-center py-16 space-y-3 text-base-content/60">
              <ShoppingBagIcon className="size-12 mx-auto opacity-40" />
              <p>Your cart is empty</p>
            </div>
          )}

          {lines.map((line) => (
            <div key={line.id} className="flex gap-3 border-b border-base-content/10 pb-4">
              <div className="size-16 sm:size-20 rounded-lg overflow-hidden bg-base-200 shrink-0">
                {line.image ? (
                  <img
                    src={line.image}
                    alt={line.title}
                    loading="lazy"
                    className="w-full h-full object-contain p-1"
                  />
                ) : null}
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-sm sm:text-base line-clamp-2">{line.title}</p>
                    {line.variantTitle && line.variantTitle !== 'Default Title' && (
                      <p className="text-xs sm:text-sm text-base-content/60 truncate">
                        {line.variantTitle}
                      </p>
                    )}
                  </div>
                  <p className="font-semibold text-sm sm:text-base whitespace-nowrap">
                    {formatMoney(line.price * line.quantity, line.currencyCode || currency)}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="join">
                    <button
                      className="btn btn-sm join-item"
                      disabled={cartLoading}
                      onClick={() => updateLineQuantity(line.id, line.quantity - 1)}
                      aria-label={`Decrease quantity of ${line.title}`}
                    >
                      <MinusIcon className="size-4" />
                    </button>
                    <span className="btn btn-sm join-item pointer-events-none no-animation">
                      {line.quantity}
                    </span>
                    <button
                      className="btn btn-sm join-item"
                      disabled={cartLoading}
                      onClick={() => updateLineQuantity(line.id, line.quantity + 1)}
                      aria-label={`Increase quantity of ${line.title}`}
                    >
                      <PlusIcon className="size-4" />
                    </button>
                  </div>
                  <button
                    className="btn btn-ghost btn-sm text-error"
                    disabled={cartLoading}
                    onClick={() => removeLine(line.id)}
                    aria-label={`Remove ${line.title} from cart`}
                  >
                    <Trash2Icon className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-base-content/10 p-4 space-y-3 shrink-0">
          <div className="flex justify-between gap-2 text-base sm:text-lg font-semibold">
            <span>Subtotal</span>
            <span className="whitespace-nowrap">
              {formatMoney(cart?.cost?.subtotalAmount || 0, currency)}
            </span>
          </div>
          <p className="text-xs text-base-content/50">
            Taxes and shipping calculated at Shopify checkout.
          </p>
          <button
            className="btn btn-primary w-full"
            disabled={!lines.length || cartLoading}
            onClick={checkout}
          >
            Checkout with Shopify
          </button>
        </div>
      </aside>
    </>
  );
}

export default CartDrawer;
