export function mapStorefrontProduct(node) {
  if (!node) return null;

  const variant = node.variants?.edges?.[0]?.node;
  const price = variant?.price || node.priceRange?.minVariantPrice;

  return {
    id: node.id,
    handle: node.handle,
    title: node.title,
    description: node.description || '',
    descriptionHtml: node.descriptionHtml || '',
    image: node.featuredImage?.url || '',
    imageAlt: node.featuredImage?.altText || node.title,
    images:
      node.images?.edges?.map((edge) => ({
        url: edge.node.url,
        altText: edge.node.altText,
      })) || [],
    price: price ? Number(price.amount) : 0,
    currencyCode: price?.currencyCode || 'USD',
    variantId: variant?.id || null,
    availableForSale: Boolean(variant?.availableForSale),
    variants:
      node.variants?.edges?.map((edge) => ({
        id: edge.node.id,
        title: edge.node.title,
        availableForSale: edge.node.availableForSale,
        price: Number(edge.node.price.amount),
        currencyCode: edge.node.price.currencyCode,
        selectedOptions: edge.node.selectedOptions || [],
      })) || [],
  };
}

export function mapCart(cart) {
  if (!cart) return null;

  return {
    id: cart.id,
    checkoutUrl: cart.checkoutUrl,
    totalQuantity: cart.totalQuantity || 0,
    cost: {
      totalAmount: Number(cart.cost?.totalAmount?.amount || 0),
      subtotalAmount: Number(cart.cost?.subtotalAmount?.amount || 0),
      currencyCode:
        cart.cost?.totalAmount?.currencyCode ||
        cart.cost?.subtotalAmount?.currencyCode ||
        'USD',
    },
    lines:
      cart.lines?.edges?.map((edge) => {
        const line = edge.node;
        const merchandise = line.merchandise;

        return {
          id: line.id,
          quantity: line.quantity,
          variantId: merchandise?.id,
          title: merchandise?.product?.title || 'Product',
          variantTitle: merchandise?.title,
          handle: merchandise?.product?.handle,
          image: merchandise?.product?.featuredImage?.url || '',
          price: Number(merchandise?.price?.amount || 0),
          currencyCode: merchandise?.price?.currencyCode || 'USD',
        };
      }) || [],
  };
}

export function throwUserErrors(userErrors = []) {
  if (!userErrors.length) return;

  const error = new Error(userErrors.map((e) => e.message).join(', '));
  error.status = 400;
  error.details = userErrors;
  throw error;
}
