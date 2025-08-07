import {db} from '@/lib/firebase';
import {collection, getDocs, doc, getDoc} from 'firebase/firestore';
import type {Product} from './types';

export async function getProducts(): Promise<Product[]> {
  try {
    const productsCol = collection(db, 'products');
    const productSnapshot = await getDocs(productsCol);
    const productList = productSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        category: data.category,
        price: data.price,
        description: data.description,
        imageUrl: data.imageUrl,
        reviews: data.reviews || [],
      } as Product;
    });
    return productList;
  } catch (error) {
    console.error("Error fetching products:", error);
    // In a real app, you'd want to handle this more gracefully.
    // For now, we'll return an empty array and log the error.
    if (error instanceof Error && error.message.includes('permission-denied')) {
        console.error("Firestore security rules are likely too restrictive. Make sure the 'products' collection is publicly readable.");
    }
    return [];
  }
}

export async function getProduct(id: string): Promise<Product | null> {
  try {
    const productRef = doc(db, 'products', id);
    const productSnap = await getDoc(productRef);

    if (productSnap.exists()) {
      const data = productSnap.data();
      return {
        id: productSnap.id,
        name: data.name,
        category: data.category,
        price: data.price,
        description: data.description,
        imageUrl: data.imageUrl,
        reviews: data.reviews || [],
      } as Product;
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error fetching product with id ${id}:`, error);
     if (error instanceof Error && error.message.includes('permission-denied')) {
        console.error("Firestore security rules are likely too restrictive. Make sure the 'products' collection is publicly readable.");
    }
    return null;
  }
}
