"use client";

import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/hooks/use-wishlist';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface WishlistButtonProps {
  productId: string;
}

export default function WishlistButton({ productId }: WishlistButtonProps) {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { toast } = useToast();
  const isWishlisted = isInWishlist(productId);

  const handleToggleWishlist = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWishlisted) {
      removeFromWishlist(productId);
      toast({
        description: "Removed from wishlist.",
      });
    } else {
      addToWishlist(productId);
      toast({
        description: "Added to wishlist!",
      });
    }
  };

  return (
    <Button
      variant="secondary"
      size="icon"
      className="rounded-full h-9 w-9 bg-background/70 hover:bg-background"
      onClick={handleToggleWishlist}
    >
      <Heart className={cn('h-5 w-5', isWishlisted ? 'text-red-500 fill-current' : 'text-foreground')} />
      <span className="sr-only">Toggle Wishlist</span>
    </Button>
  );
}
