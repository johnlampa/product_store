import { Link } from 'react-router-dom';
import { ShoppingBagIcon } from 'lucide-react';
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

function ShopifyProductCard({ product }) {
  const { addToCart, cartLoading } = useShopifyStore();
  const canAdd = product.availableForSale && product.variantId;

  return (
    <div className="card bg-base-100 shadow-lg sm:shadow-xl hover:shadow-2xl transition-shadow duration-300">
      <figure className="relative aspect-[4/3] bg-base-200">
        {product.image ? (
          <img
            src={product.image}
            alt={product.imageAlt || product.title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-contain p-3"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-base-content/40">
            <ShoppingBagIcon className="size-10 sm:size-12" />
          </div>
        )}
      </figure>

      <div className="card-body p-4 sm:p-6 gap-2">
        <h2 className="card-title text-base sm:text-lg font-semibold line-clamp-2">
          {product.title}
        </h2>
        <p className="text-xl sm:text-2xl font-bold text-primary">
          {formatMoney(product.price, product.currencyCode)}
        </p>
        {!product.availableForSale && (
          <p className="text-sm text-error">Sold out</p>
        )}

        <div className="card-actions mt-3 sm:mt-4 gap-2">
          <Link
            to={`/shop/${product.handle}`}
            className="btn btn-sm btn-outline flex-1"
          >
            View
          </Link>
          <button
            className="btn btn-sm btn-primary flex-1"
            disabled={!canAdd || cartLoading}
            onClick={() => addToCart(product.variantId)}
          >
            {cartLoading ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              'Add to cart'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ShopifyProductCard;
