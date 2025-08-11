import Header from '@/components/header';
import CatalogClient from '@/components/catalog-client';
import { getProducts } from '@/lib/firestore';

export default async function Home({ searchParams }: { searchParams: { page?: string } }) {
  const page = searchParams.page ? parseInt(searchParams.page, 10) : 1;
  const { products, totalPages, currentPage, allProducts } = await getProducts(page);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <CatalogClient 
          products={allProducts} 
          paginatedProducts={products}
          totalPages={totalPages}
          currentPage={currentPage}
        />
      </main>
      <footer className="bg-card py-6 mt-16">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} FurnishAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
