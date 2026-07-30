import { useEffect } from 'react';
import {
  PackageIcon,
  RefreshCwIcon,
  ShoppingBagIcon,
} from 'lucide-react';
import { useShopifyStore } from '../store/useShopifyStore';
import ShopifyProductCard from '../components/ShopifyProductCard';

function ShopPage() {
  const {
    products,
    loading,
    error,
    status,
    fetchProducts,
    fetchStatus,
  } = useShopifyStore();

  useEffect(() => {
    fetchStatus();
    fetchProducts();
  }, [fetchStatus, fetchProducts]);

  return (
    <div className="mx-auto px-4 py-6 sm:py-8 max-w-6xl">
      <div className="flex items-start justify-between gap-3 mb-6 sm:mb-8">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold">Shop</h1>
          <p className="text-sm sm:text-base text-base-content/60 mt-1">
            Browse products and checkout securely with Shopify
          </p>
        </div>

        <button
          className="btn btn-ghost btn-circle shrink-0"
          onClick={fetchProducts}
          title="Refresh products"
          aria-label="Refresh products"
        >
          <RefreshCwIcon className="size-5" />
        </button>
      </div>

      {status && !status.storefrontConfigured && (
        <div className="alert alert-warning items-start mb-6 sm:mb-8">
          <ShoppingBagIcon className="size-5 shrink-0" />
          <div className="min-w-0">
            <p className="font-medium">Shopify credentials not configured</p>
            <p className="text-sm">
              Add <code className="break-all">SHOPIFY_STORE_DOMAIN</code> and{' '}
              <code className="break-all">SHOPIFY_STOREFRONT_ACCESS_TOKEN</code> to your{' '}
              <code>.env</code>. See <strong>SHOPIFY.md</strong> for setup steps.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-error items-start mb-6 sm:mb-8">
          <span className="min-w-0 text-sm sm:text-base">{error}</span>
        </div>
      )}

      {products.length === 0 && !loading && !error && status?.storefrontConfigured && (
        <div className="flex flex-col justify-center items-center min-h-[50vh] py-12 space-y-4">
          <div className="bg-base-100 rounded-full p-5 sm:p-6">
            <PackageIcon className="size-10 sm:size-12" />
          </div>
          <div className="text-center space-y-2 px-4">
            <h3 className="text-xl sm:text-2xl font-semibold">No products yet</h3>
            <p className="text-sm sm:text-base text-base-content/60 max-w-sm">
              Add products in your Shopify Admin, then refresh this page.
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="loading loading-spinner loading-lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {products.map((product) => (
            <ShopifyProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default ShopPage;
