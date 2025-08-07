import Header from '@/components/header';
import CatalogClient from '@/components/catalog-client';
import { products } from '@/lib/data';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <CatalogClient products={products} />
      </main>
      <footer className="bg-card py-6 mt-16">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} FurnishAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
