import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useProductStore } from '../store/useProductStore'
import { PackageIcon, PlusCircleIcon, RefreshCwIcon, StoreIcon } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import AddProductModal from '../components/AddProductModal'

function HomePage() {
  const {products, loading, error, fetchProducts} = useProductStore()

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  return (
    <>
      <div className='mx-auto px-4 py-8 max-w-6xl'>
        <div className='flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8'>
          <div>
            <p className="text-sm uppercase tracking-widest text-secondary mb-1">Postgres + Express</p>
            <h1 className="text-3xl font-bold">Local Inventory</h1>
            <p className="text-base-content/60 mt-1">
              CRUD catalog stored in Postgres, separate from Shopify checkout
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <Link to="/shop" className="btn btn-secondary btn-outline">
              <StoreIcon className="size-4 mr-2" />
              Open Shopify shop
            </Link>
            <button 
              className='btn btn-primary' 
              onClick={() => document.getElementById('add_product_modal').showModal()}>
              <PlusCircleIcon className='size-5 mr-2'></PlusCircleIcon>
              Add Product
            </button>
            <button className='btn btn-ghost btn-circle' onClick={fetchProducts}>
              <RefreshCwIcon className='size-5'></RefreshCwIcon>
            </button>
          </div>
        </div>

        <AddProductModal></AddProductModal>

        {error && <div className='alert alert-error mb-8'>{error}</div>}

        {products.length === 0 && !loading && (
          <div className="flex flex-col justify-center items-center h-96 space-y-4">
            <div className="bg-base-100 rounded-full p-6">
              <PackageIcon className="size-12" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-semibold ">No products found</h3>
              <p className="text-gray-500 max-w-sm">
                Get started by adding your first product to the inventory
              </p>
            </div>
          </div>
        )}

        {loading ? (
          <div className='flex justify-center items-center h-64'>
            <div className='loading loading-spinner loading-lg'></div>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

    </>
  )
}

export default HomePage