"use client";

import { useState, useRef, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { Bot, Search, Sparkles, User } from 'lucide-react';
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
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { cn } from '@/lib/utils';

type Inputs = {
  query: string;
};

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ShoppingAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, reset } = useForm<Inputs>();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);
  
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    if (messages.length === 0) {
      setIsOpen(true);
    }
    
    setIsLoading(true);
    setError(null);
    setMessages((prev) => [...prev, { role: 'user', content: data.query }]);
    
    try {
      const result = await productRecommendation({query: data.query});
      setMessages((prev) => [...prev, { role: 'assistant', content: result.recommendations }]);
    } catch (e) {
      setError('Sorry, I had trouble finding recommendations. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
      reset();
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setMessages([]);
      setError(null);
    }
  }

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
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[525px] flex flex-col h-[70vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="text-primary w-6 h-6" />
              AI Shopping Assistant
            </DialogTitle>
            <DialogDescription>
              Ask me for furniture recommendations, and I'll help you find the perfect pieces.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 -mx-6 px-6" ref={scrollAreaRef}>
            <div className="py-4 space-y-6 pr-4">
              {messages.map((message, index) => (
                <div key={index} className={cn("flex items-start gap-3", message.role === 'user' ? 'justify-end' : 'justify-start')}>
                  {message.role === 'assistant' && (
                     <Avatar className="h-8 w-8">
                       <AvatarFallback className="bg-primary text-primary-foreground">
                         <Bot className="h-5 w-5" />
                       </AvatarFallback>
                     </Avatar>
                  )}
                  <div className={cn("p-3 rounded-lg max-w-[80%]", message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary')}>
                    <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                  </div>
                   {message.role === 'user' && (
                     <Avatar className="h-8 w-8">
                       <AvatarFallback>
                         <User className="h-5 w-5" />
                       </AvatarFallback>
                     </Avatar>
                  )}
                </div>
              ))}
               {isLoading && (
                <div className="flex items-start gap-3 justify-start">
                   <Avatar className="h-8 w-8">
                     <AvatarFallback className="bg-primary text-primary-foreground">
                       <Bot className="h-5 w-5" />
                     </AvatarFallback>
                   </Avatar>
                  <div className="p-3 rounded-lg bg-secondary w-full">
                    <Skeleton className="h-4 w-[80%]" />
                    <Skeleton className="h-4 w-[60%] mt-2" />
                  </div>
                </div>
              )}
              {error && <p className="text-destructive text-sm">{error}</p>}
            </div>
          </ScrollArea>
          <DialogFooter className="mt-auto -mx-6 px-6 pt-4 border-t">
             <form onSubmit={handleSubmit(onSubmit)} className="relative w-full">
              <Input
                {...register('query', { required: true })}
                placeholder="Ask a follow-up question..."
                className="pr-12"
                disabled={isLoading}
              />
              <Button type="submit" size="icon" className="absolute right-1 top-1 h-8 w-8" disabled={isLoading}>
                 <Sparkles className="h-4 w-4" />
                 <span className="sr-only">Send</span>
              </Button>
            </form>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
