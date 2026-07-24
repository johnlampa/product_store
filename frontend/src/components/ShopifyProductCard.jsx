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
    <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300">
      <figure className="relative pt-[56.25%] bg-base-200">
        {product.image ? (
          <img
            src={product.image}
            alt={product.imageAlt || product.title}
            className="absolute top-0 left-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-base-content/40">
            <ShoppingBagIcon className="size-12" />
          </div>
        )}
        <div className="badge badge-secondary absolute top-3 left-3">Shopify</div>
      </figure>

      <div className="card-body">
        <h2 className="card-title text-lg font-semibold line-clamp-2">{product.title}</h2>
        <p className="text-2xl font-bold text-primary">
          {formatMoney(product.price, product.currencyCode)}
        </p>
        {!product.availableForSale && (
          <p className="text-sm text-error">Sold out</p>
        )}

        <div className="card-actions justify-between mt-4">
          <Link to={`/shop/${product.handle}`} className="btn btn-sm btn-ghost">
            View
          </Link>
          <button
            className="btn btn-sm btn-primary"
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
