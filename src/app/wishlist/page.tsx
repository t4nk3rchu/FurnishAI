"use client";

import Link from 'next/link';
import { useWishlist } from '@/hooks/use-wishlist';
import { products } from '@/lib/data';
import Header from '@/components/header';
import ProductCard from '@/components/product-card';
import { Button } from '@/components/ui/button';

export default function WishlistPage() {
  const { wishlist } = useWishlist();
  const wishlistedProducts = products.filter(product => wishlist.includes(product.id));

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <section className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-primary">Your Wishlist</h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Your favorite items, all in one place.
            </p>
          </section>

          {wishlistedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
              <h2 className="text-2xl font-semibold">Your wishlist is empty</h2>
              <p className="text-muted-foreground mt-2 mb-6">
                Looks like you haven't added any items yet.
              </p>
              <Button asChild>
                <Link href="/">Start Shopping</Link>
              </Button>
            </div>
          )}
        </div>
      </main>
      <footer className="bg-card py-6 mt-16">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} FurnishAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
