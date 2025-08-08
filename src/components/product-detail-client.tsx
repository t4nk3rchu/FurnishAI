"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Star } from 'lucide-react';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import WishlistButton from './wishlist-button';
import { Badge } from './ui/badge';

interface ProductDetailClientProps {
  product: Product;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const imageUrl = product.imageUrl || 'https://placehold.co/800x600.png';

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div>
          <Card className="overflow-hidden">
            <Image
              src={imageUrl}
              alt={product.name}
              width={800}
              height={600}
              className="w-full object-cover"
              data-ai-hint="furniture product"
            />
          </Card>
        </div>
        <div className="space-y-6">
          <Badge variant="secondary">{product.category}</Badge>
          <h1 className="text-4xl font-bold tracking-tight">{product.name}</h1>
          <p className="text-3xl font-semibold text-primary">${product.price.toFixed(2)}</p>
          <p className="text-muted-foreground text-lg">{product.description}</p>
          <div className="flex items-center gap-4">
            <Button size="lg" className="flex-1">Add to Cart</Button>
            <WishlistButton productId={product.id} />
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="reviews">
              <AccordionTrigger className="text-lg">Customer Reviews ({product.reviews.length})</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  {product.reviews.map(review => (
                    <div key={review.id} className="p-4 bg-secondary/50 rounded-lg">
                      <div className="flex items-center mb-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-5 w-5 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-muted-foreground'}`} />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">by {review.author}</p>
                      <p>{review.comment}</p>
                    </div>
                  ))}
                  {product.reviews.length === 0 && <p>No reviews yet.</p>}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}
