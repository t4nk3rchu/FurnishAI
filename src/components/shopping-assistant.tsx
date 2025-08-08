"use client";

import { useState, useRef, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { Bot, Search, Sparkles, User, ShoppingCart } from 'lucide-react';
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
import { Skeleton } from './ui/skeleton';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { cn } from '@/lib/utils';
import { getChatHistory, type GetChatHistoryOutput } from '@/ai/flows/get-chat-history';
import ProductCard from './product-card';
import type { Product } from '@/lib/types';

type Inputs = {
  query: string;
};

interface Message {
  author: string;
  message: string;
  results?: GetChatHistoryOutput['conversation'][0]['results'];
}

export default function ShoppingAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchDocId, setSearchDocId] = useState<string | null>(null);

  const { register, handleSubmit, reset } = useForm<Inputs>();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isLoading]);

  const pollForChatHistory = async (document_id: string, retries = 10, delay = 5000): Promise<GetChatHistoryOutput> => {
    for (let i = 0; i < retries; i++) {
      try {
        const result = await getChatHistory({ document_id });
        if (result && result.conversation.length > 0) {
          const lastMessage = result.conversation[result.conversation.length - 1];
          // Check if the last message is from the assistant, which means a response has been added.
          if (lastMessage.author !== 'user') {
            return result;
          }
        }
      } catch (e) {
        console.log(`Polling attempt ${i + 1} failed. Retrying in ${delay}ms...`);
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    throw new Error('Failed to retrieve chat history after several attempts.');
  }

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    if (!isOpen) {
      setIsOpen(true);
      setMessages([]);
      setSearchDocId(null);
    }

    const currentMessages = [...messages, { author: 'user', message: data.query }];
    setMessages(currentMessages);
    setIsLoading(true);
    setError(null);
    reset();

    try {
      let docId = searchDocId;
      // If we don't have a docId, this is a new conversation
      if (!docId) {
        const apiResponse = await fetch('https://aaf30a66f73f.ngrok-free.app/p1/initiate-vertexai-search', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            visitor_id: "string",
            query: data.query,
            image: "",
            search_doc_id: "",
            user_id: "1"
          })
        });

        if (!apiResponse.ok) {
          throw new Error('Network response from search API was not ok');
        }
        const result = await apiResponse.json();
        docId = result.document_id;
        if (!docId) {
          throw new Error('API did not return a document_id');
        }
        setSearchDocId(docId);
      } else {
        // This is a follow-up, so we need to send the existing docId
        await fetch('https://aaf30a66f73f.ngrok-free.app/p1/initiate-vertexai-search', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            visitor_id: "string",
            query: data.query,
            image: "",
            search_doc_id: docId,
            user_id: "1"
          })
        });
      }

      setIsPolling(true);
      const chatHistory = await pollForChatHistory(docId);

      const newMessages = chatHistory.conversation.map(c => ({
          author: c.author,
          message: c.message,
          results: c.results,
      }));

      setMessages(newMessages);

    } catch (e) {
      setError('Sorry, I had trouble getting a response. Please try again.');
      console.error(e);
      setMessages((prev) => [...prev.slice(0, -1), { author: 'assistant', message: 'Sorry, I had trouble getting a response. Please try again.' }]);
    } finally {
      setIsLoading(false);
      setIsPolling(false);
    }
  };


  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setMessages([]);
      setError(null);
      setSearchDocId(null);
    }
  }

  const transformToProduct = (result: GetChatHistoryOutput['conversation'][0]['results'][0]): Product => {
    return {
      id: result.id,
      name: result.snapshot.title,
      price: result.snapshot.price,
      description: result.snapshot.description,
      category: result.snapshot.categories[0] as Product['category'] || 'Tables',
      imageUrl: result.snapshot.image,
      reviews: [],
    };
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
                <div key={index}>
                  <div className={cn("flex items-start gap-3", message.author === 'user' ? 'justify-end' : 'justify-start')}>
                    {message.author !== 'user' && (
                       <Avatar className="h-8 w-8">
                         <AvatarFallback className="bg-primary text-primary-foreground">
                           <Bot className="h-5 w-5" />
                         </AvatarFallback>
                       </Avatar>
                    )}
                    {message.message && (
                        <div className={cn("p-3 rounded-lg max-w-[80%]", message.author === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary')}>
                        <p className="whitespace-pre-wrap text-sm">{message.message}</p>
                        </div>
                    )}
                     {message.author === 'user' && (
                       <Avatar className="h-8 w-8">
                         <AvatarFallback>
                           <User className="h-5 w-5" />
                         </AvatarFallback>
                       </Avatar>
                    )}
                  </div>
                  {message.results && message.results.length > 0 && (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {message.results.map(result => (
                         <ProductCard key={result.id} product={transformToProduct(result)} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
               {(isLoading || isPolling) && !error && (
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
            </div>
          </ScrollArea>
          <DialogFooter className="mt-auto -mx-6 px-6 pt-4 border-t">
             <form onSubmit={handleSubmit(onSubmit)} className="relative w-full">
              <Input
                {...register('query', { required: true })}
                placeholder="Ask a follow-up question..."
                className="pr-12"
                disabled={isLoading || isPolling}
              />
              <Button type="submit" size="icon" className="absolute right-1 top-1 h-8 w-8" disabled={isLoading || isPolling}>
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
