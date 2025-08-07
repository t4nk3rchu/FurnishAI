"use client";

import Link from 'next/link';
import { Heart, Sofa } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ShoppingAssistant from './shopping-assistant';
import { useWishlist } from '@/hooks/use-wishlist';

export default function Header() {
  const { wishlist } = useWishlist();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <Sofa className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">FurnishAI</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <ShoppingAssistant />
          </div>
          <nav className="flex items-center">
            <Link href="/wishlist" passHref>
              <Button variant="ghost" size="icon" aria-label="Wishlist">
                <Heart className="h-5 w-5" />
                {wishlist.length > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 justify-center p-0 text-xs"
                  >
                    {wishlist.length}
                  </Badge>
                )}
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
