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

  return (
    <>
      <div
        className={`fixed inset-0 z-[60] bg-black/40 transition-opacity ${
          cartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setCartOpen(false)}
      />

      <aside
        className={`fixed top-0 right-0 z-[70] h-full w-full max-w-md bg-base-100 shadow-2xl transition-transform duration-300 flex flex-col ${
          cartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-base-content/10 px-4 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBagIcon className="size-5" />
            <h2 className="font-semibold text-lg">Cart</h2>
            {cart?.totalQuantity > 0 && (
              <span className="badge badge-primary">{cart.totalQuantity}</span>
            )}
          </div>
          <button className="btn btn-ghost btn-sm btn-circle" onClick={() => setCartOpen(false)}>
            <XIcon className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-base-200 shrink-0">
                {line.image ? (
                  <img src={line.image} alt={line.title} className="w-full h-full object-cover" />
                ) : null}
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{line.title}</p>
                    {line.variantTitle && line.variantTitle !== 'Default Title' && (
                      <p className="text-sm text-base-content/60">{line.variantTitle}</p>
                    )}
                  </div>
                  <p className="font-semibold whitespace-nowrap">
                    {formatMoney(line.price * line.quantity, line.currencyCode || currency)}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="join">
                    <button
                      className="btn btn-xs join-item"
                      disabled={cartLoading}
                      onClick={() => updateLineQuantity(line.id, line.quantity - 1)}
                    >
                      <MinusIcon className="size-3" />
                    </button>
                    <span className="btn btn-xs join-item pointer-events-none no-animation">
                      {line.quantity}
                    </span>
                    <button
                      className="btn btn-xs join-item"
                      disabled={cartLoading}
                      onClick={() => updateLineQuantity(line.id, line.quantity + 1)}
                    >
                      <PlusIcon className="size-3" />
                    </button>
                  </div>
                  <button
                    className="btn btn-ghost btn-xs text-error"
                    disabled={cartLoading}
                    onClick={() => removeLine(line.id)}
                  >
                    <Trash2Icon className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-base-content/10 p-4 space-y-3">
          <div className="flex justify-between text-lg font-semibold">
            <span>Subtotal</span>
            <span>{formatMoney(cart?.cost?.subtotalAmount || 0, currency)}</span>
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
