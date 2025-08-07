import {db} from '@/lib/firebase';
import {collection, getDocs, doc, getDoc} from 'firebase/firestore';
import type {Product} from './types';

export async function getProducts(): Promise<Product[]> {
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
}

export async function getProduct(id: string): Promise<Product | null> {
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
}
