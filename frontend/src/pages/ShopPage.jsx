import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PackageIcon,
  RefreshCwIcon,
  CloudDownloadIcon,
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
    syncProducts,
  } = useShopifyStore();

  useEffect(() => {
    fetchStatus();
    fetchProducts();
  }, [fetchStatus, fetchProducts]);

  return (
    <div className="mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <p className="text-sm uppercase tracking-widest text-secondary mb-1">Headless commerce</p>
          <h1 className="text-3xl font-bold">Shopify Storefront</h1>
          <p className="text-base-content/60 mt-1">
            Products and checkout powered by Shopify Storefront API
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/" className="btn btn-ghost btn-sm">
            Local inventory
          </Link>
          {status?.adminConfigured && (
            <button
              className="btn btn-outline btn-sm"
              onClick={syncProducts}
              disabled={loading}
              title="Pull products from Shopify Admin into Postgres"
            >
              <CloudDownloadIcon className="size-4 mr-1" />
              Sync to DB
            </button>
          )}
          <button className="btn btn-ghost btn-circle" onClick={fetchProducts}>
            <RefreshCwIcon className="size-5" />
          </button>
        </div>
      </div>

      {status && !status.storefrontConfigured && (
        <div className="alert alert-warning mb-8">
          <ShoppingBagIcon className="size-5" />
          <div>
            <p className="font-medium">Shopify credentials not configured</p>
            <p className="text-sm">
              Add <code>SHOPIFY_STORE_DOMAIN</code> and{' '}
              <code>SHOPIFY_STOREFRONT_ACCESS_TOKEN</code> to your <code>.env</code>. See{' '}
              <strong>SHOPIFY.md</strong> for setup steps.
            </p>
          </div>
        </div>
      )}

      {error && <div className="alert alert-error mb-8">{error}</div>}

      {products.length === 0 && !loading && !error && status?.storefrontConfigured && (
        <div className="flex flex-col justify-center items-center h-96 space-y-4">
          <div className="bg-base-100 rounded-full p-6">
            <PackageIcon className="size-12" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-semibold">No Shopify products yet</h3>
            <p className="text-base-content/60 max-w-sm">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ShopifyProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default ShopPage;
