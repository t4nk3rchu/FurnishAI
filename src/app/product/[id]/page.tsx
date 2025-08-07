import { notFound } from 'next/navigation';
import { getProduct, getProducts } from '@/lib/firestore';
import Header from '@/components/header';
import ProductDetailClient from '@/components/product-detail-client';

interface ProductPageProps {
  params: {
    id: string;
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProduct(params.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <ProductDetailClient product={product} />
      </main>
      <footer className="bg-card py-6 mt-16">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} FurnishAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map(product => ({
    id: product.id,
  }));
}
