import { notFound } from 'next/navigation';
import { products } from '@/lib/data';
import Header from '@/components/header';
import ProductDetailClient from '@/components/product-detail-client';

interface ProductPageProps {
  params: {
    id: string;
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  const product = products.find(p => p.id === params.id);

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
  return products.map(product => ({
    id: product.id,
  }));
}
