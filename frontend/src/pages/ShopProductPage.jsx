import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeftIcon, ShoppingBagIcon } from 'lucide-react';
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

function getDefaultVariantId(product) {
  if (!product?.variants?.length) return null;
  const available = product.variants.find((v) => v.availableForSale) || product.variants[0];
  return available?.id || null;
}

function ShopProductPage() {
  const { handle } = useParams();
  const {
    currentProduct,
    loading,
    error,
    cartLoading,
    fetchProduct,
    addToCart,
  } = useShopifyStore();
  const [variantByHandle, setVariantByHandle] = useState({});

  useEffect(() => {
    fetchProduct(handle);
  }, [handle, fetchProduct]);

  const activeVariantId =
    variantByHandle[handle] || getDefaultVariantId(currentProduct);
  const selectedVariant =
    currentProduct?.variants?.find((v) => v.id === activeVariantId) ||
    currentProduct?.variants?.[0];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (error || !currentProduct) {
    return (
      <div className="mx-auto px-4 py-6 sm:py-8 max-w-4xl space-y-4">
        <Link to="/" className="btn btn-ghost btn-sm sm:btn-md gap-2 -ml-2">
          <ArrowLeftIcon className="size-4" />
          Back to shop
        </Link>
        <div className="alert alert-error items-start">
          <span className="min-w-0">{error || 'Product not found'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 py-6 sm:py-8 max-w-5xl">
      <Link to="/" className="btn btn-ghost btn-sm sm:btn-md gap-2 -ml-2 mb-4 sm:mb-8">
        <ArrowLeftIcon className="size-4" />
        Back to shop
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        <div className="rounded-lg overflow-hidden shadow-lg bg-base-100">
          {currentProduct.image ? (
            <img
              src={currentProduct.image}
              alt={currentProduct.imageAlt || currentProduct.title}
              className="w-full aspect-square object-contain p-4"
            />
          ) : (
            <div className="aspect-square flex items-center justify-center bg-base-200">
              <ShoppingBagIcon className="size-16 opacity-30" />
            </div>
          )}
        </div>

        <div className="space-y-5 sm:space-y-6">
          <div>
            <span className="badge badge-secondary mb-2 sm:mb-3">Shopify</span>
            <h1 className="text-2xl sm:text-3xl font-bold">{currentProduct.title}</h1>
            <p className="text-2xl sm:text-3xl font-bold text-primary mt-2 sm:mt-3">
              {formatMoney(
                selectedVariant?.price ?? currentProduct.price,
                selectedVariant?.currencyCode || currentProduct.currencyCode
              )}
            </p>
          </div>

          {currentProduct.description && (
            <p className="text-sm sm:text-base text-base-content/70 leading-relaxed whitespace-pre-line">
              {currentProduct.description}
            </p>
          )}

          {currentProduct.variants?.length > 1 && (
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Variant</span>
              </label>
              {/* text-base keeps iOS Safari from zooming in on focus */}
              <select
                className="select select-bordered w-full text-base"
                value={activeVariantId || ''}
                onChange={(e) =>
                  setVariantByHandle((prev) => ({ ...prev, [handle]: e.target.value }))
                }
              >
                {currentProduct.variants.map((variant) => (
                  <option key={variant.id} value={variant.id} disabled={!variant.availableForSale}>
                    {variant.title}
                    {!variant.availableForSale ? ' (sold out)' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            className="btn btn-primary w-auto min-w-36"
            disabled={!selectedVariant?.availableForSale || cartLoading}
            onClick={() => addToCart(selectedVariant.id)}
          >
            {cartLoading ? (
              <span className="loading loading-spinner" />
            ) : selectedVariant?.availableForSale ? (
              'Add to cart'
            ) : (
              'Sold out'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ShopProductPage;
