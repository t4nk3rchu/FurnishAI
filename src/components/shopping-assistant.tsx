"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { Search, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { productRecommendation } from '@/ai/flows/product-recommendation';
import { Skeleton } from './ui/skeleton';

type Inputs = {
  query: string;
};

export default function ShoppingAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, reset } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setIsOpen(true);
    setIsLoading(true);
    setResponse(null);
    setError(null);
    try {
      const result = await productRecommendation(data);
      setResponse(result.recommendations);
    } catch (e) {
      setError('Sorry, I had trouble finding recommendations. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
      reset();
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          {...register('query', { required: true })}
          placeholder="Ask AI for recommendations..."
          className="pl-10"
        />
      </form>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="text-primary w-5 h-5" />
              AI Recommendations
            </DialogTitle>
            <DialogDescription>
              Here are some product ideas based on your request.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {isLoading && (
              <div className="space-y-2">
                <Skeleton className="h-4 w-[80%]" />
                <Skeleton className="h-4 w-[60%]" />
                <Skeleton className="h-4 w-[70%]" />
              </div>
            )}
            {error && <p className="text-destructive">{error}</p>}
            {response && <p className="whitespace-pre-wrap">{response}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
