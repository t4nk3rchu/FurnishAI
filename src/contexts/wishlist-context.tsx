"use client";

import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Product } from '@/lib/types';

interface WishlistContextType {
  wishlist: string[];
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}

export const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    try {
      const storedWishlist = localStorage.getItem('wishlist');
      if (storedWishlist) {
        setWishlist(JSON.parse(storedWishlist));
      }
    } catch (error) {
      console.error("Failed to parse wishlist from localStorage", error);
    }
  }, []);

  const updateLocalStorage = (updatedWishlist: string[]) => {
    try {
      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
    } catch (error) {
      console.error("Failed to save wishlist to localStorage", error);
    }
  };

  const addToWishlist = useCallback((productId: string) => {
    setWishlist(prevWishlist => {
      if (prevWishlist.includes(productId)) {
        return prevWishlist;
      }
      const updatedWishlist = [...prevWishlist, productId];
      updateLocalStorage(updatedWishlist);
      return updatedWishlist;
    });
  }, []);

  const removeFromWishlist = useCallback((productId: string) => {
    setWishlist(prevWishlist => {
      const updatedWishlist = prevWishlist.filter(id => id !== productId);
      updateLocalStorage(updatedWishlist);
      return updatedWishlist;
    });
  }, []);

  const isInWishlist = useCallback((productId: string) => {
    return wishlist.includes(productId);
  }, [wishlist]);

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};
