'use server';

/**
 * @fileOverview Chat history retrieval flow.
 *
 * - getChatHistory - A function that retrieves chat history from Firestore.
 * - GetChatHistoryInput - The input type for the getChatHistory function.
 * - GetChatHistoryOutput - The return type for the getChatHistory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {doc, getDoc} from 'firebase/firestore';
import {db} from '@/lib/firebase';
import type {Product} from '@/lib/types';

const SnapshotSchema = z.object({
  categories: z.array(z.string()),
  description: z.string(),
  features: z.array(z.string()),
  id: z.string(),
  image: z.string(),
  price: z.number(),
  quantity: z.number(),
  title: z.string(),
});

const ResultSchema = z.object({
  id: z.string(),
  snapshot: SnapshotSchema,
});

const ConversationEntrySchema = z.object({
  author: z.string(),
  message: z.string(),
  results: z.array(ResultSchema).optional(),
});

const GetChatHistoryInputSchema = z.object({
  document_id: z.string().describe('The ID of the document to retrieve from the website_search collection.'),
});
export type GetChatHistoryInput = z.infer<typeof GetChatHistoryInputSchema>;

const GetChatHistoryOutputSchema = z.object({
  conversation: z.array(ConversationEntrySchema),
});
export type GetChatHistoryOutput = z.infer<typeof GetChatHistoryOutputSchema>;

export async function getChatHistory(input: GetChatHistoryInput): Promise<GetChatHistoryOutput> {
  return getChatHistoryFlow(input);
}

const getChatHistoryFlow = ai.defineFlow(
  {
    name: 'getChatHistoryFlow',
    inputSchema: GetChatHistoryInputSchema,
    outputSchema: GetChatHistoryOutputSchema,
  },
  async ({document_id}) => {
    try {
      const docRef = doc(db, 'website_search', document_id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('No such document!');
      }

      const data = docSnap.data();
      
      // The user specified that the document has a 'conversation' field which is an array.
      const conversationData = data.conversation || [];

      // Validate and structure the data using Zod schemas.
      const conversation = conversationData.map((entry: any) => ({
        author: entry.author,
        message: entry.message,
        results: (entry.results || []).map((result: any) => ({
          id: result.id,
          snapshot: {
            categories: result.snapshot.categories || [],
            description: result.snapshot.description,
            features: result.snapshot.features || [],
            id: result.snapshot.id,
            image: result.snapshot.image,
            price: result.snapshot.price,
            quantity: result.snapshot.quantity,
            title: result.snapshot.title,
          },
        })),
      }));

      return { conversation };
    } catch (error) {
      console.error('Error fetching chat history from Firestore:', error);
      // Return an empty conversation in case of an error.
      return { conversation: [] };
    }
  }
);
