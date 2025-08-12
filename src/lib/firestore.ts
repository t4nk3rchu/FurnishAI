import {db} from '@/lib/firebase';
import {collection, getDocs, doc, getDoc} from 'firebase/firestore';
import type {Product, Review} from './types';
import { API_BASE_URL } from '@/lib/api';

interface ApiProduct {
  id: number;
  title: string;
  description: string;
  price: number;
  image: string;
  categories: string[];
  features: string[];
  reviews?: Review[];
}

interface ApiResponse {
    products: ApiProduct[];
    page: number;
    page_size: number;
    total: number;
}

const mapApiProductToProduct = (apiProduct: ApiProduct): Product => ({
  id: String(apiProduct.id),
  name: apiProduct.title,
  category: (apiProduct.categories[0] as Product['category']) || 'Tables',
  price: apiProduct.price,
  description: apiProduct.description,
  imageUrl: apiProduct.image,
  reviews: apiProduct.reviews || [],
});

let allProductsCache: Product[] | null = null;
let allProductsPromise: Promise<Product[]> | null = null;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchAllProducts(): Promise<Product[]> {
    if (allProductsCache) {
      return allProductsCache;
    }

    if (allProductsPromise) {
      return allProductsPromise;
    }

    const doFetch = async () => {
        let allProducts: Product[] = [];
        let currentPage = 1;
        let totalPages = 1;

        try {
            while (currentPage <= totalPages) {
                const response = await fetch(API_BASE_URL + `p1/get-all-products?page=${currentPage}&page_size=100`, {
                    headers: {
                        'ngrok-skip-browser-warning': 'true'
                    }
                });

                if (!response.ok) {
                    throw new Error(`API call failed with status: ${response.status}`);
                }

                const apiResponse: ApiResponse = await response.json();
                const productList = apiResponse.products.map(mapApiProductToProduct);
                allProducts = allProducts.concat(productList);

                if (currentPage === 1) {
                    totalPages = Math.ceil(apiResponse.total / apiResponse.page_size);
                }
                currentPage++;
                
                // Add a small delay to avoid overwhelming the API
                await sleep(200);
            }
            allProductsCache = allProducts;
            return allProducts;
        } catch (error) {
            console.error("Error fetching all products from API:", error);
            allProductsPromise = null; // Reset promise on error
            return [];
        }
    };
    
    allProductsPromise = doFetch();
    return allProductsPromise;
}


export async function getProducts(page = 1, pageSize = 10): Promise<{ products: Product[], totalPages: number, currentPage: number, allProducts: Product[] }> {
  try {
    const allProducts = await fetchAllProducts();
    const totalPages = Math.ceil(allProducts.length / pageSize);
    const startIndex = (page - 1) * pageSize;
    const paginatedProducts = allProducts.slice(startIndex, startIndex + pageSize);

    return {
      products: paginatedProducts,
      totalPages: totalPages,
      currentPage: page,
      allProducts: allProducts
    };
  } catch (error) {
    console.error("Error fetching products from API:", error);
    return { products: [], totalPages: 0, currentPage: 1, allProducts: [] };
  }
}

export async function getProduct(id: string): Promise<Product | null> {
  try {
    const allProducts = await fetchAllProducts();
    const product = allProducts.find(p => p.id === id);
    return product || null;
  } catch (error) {
    console.error(`Error fetching product with id ${id}:`, error);
    return null;
  }
}
