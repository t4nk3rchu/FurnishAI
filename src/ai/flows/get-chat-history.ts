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
  id: z.number(),
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

// export async function getChatHistory(input: GetChatHistoryInput): Promise<GetChatHistoryOutput> {
//   console.log("getChatHistory input", input);
//   return getChatHistoryFlow(input);
// }

export async function getChatHistory(input: GetChatHistoryInput): Promise<GetChatHistoryOutput> {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] getChatHistory input:`, JSON.stringify(input, null, 2));

  try {
    // Validate input first
    const validatedInput = GetChatHistoryInputSchema.parse(input);
    console.log(`[${timestamp}] Input validation passed`);

    // Use simple version first to debug
    const result = await getChatHistorySimple(validatedInput.document_id);
    console.log(`[${timestamp}] getChatHistory SUCCESS`);
    return result;

  } catch (error) {
    console.error(`[${timestamp}] getChatHistory ERROR:`, error);

    // Return more specific error information
    if (error instanceof z.ZodError) {
      console.error(`[${timestamp}] Validation error:`, error.errors);
      throw new Error(`Input validation failed: ${error.errors.map(e => e.message).join(', ')}`);
    }

    throw error;
  }
}

export async function getChatHistorySimple(document_id: string): Promise<GetChatHistoryOutput> {
  const timestamp = new Date().toISOString();
  try {
    // Kiểm tra Firebase connection
    if (!db) {
      console.error(`[${timestamp}] Firebase db is not initialized`);
      throw new Error('Firebase database is not initialized');
    }

    const docRef = doc(db, 'website_search', document_id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { conversation: [] };
    }

    const data = docSnap.data();

    const conversationData = data?.conversation || [];

    // Validate conversation data
    const conversation = conversationData.map((entry: any, index: number) => {
      try {
        console.log(`[${timestamp}] Parsing entry ${index}:`, JSON.stringify(entry, null, 2));
        return ConversationEntrySchema.parse(entry);
      } catch (parseError) {
        console.error(`[${timestamp}] Failed to parse entry ${index}:`, parseError);
        console.error(`[${timestamp}] Raw entry:`, JSON.stringify(entry, null, 2));
        throw new Error(`Invalid conversation entry at index ${index}: ${parseError}`);
      }
    });

    const result = { conversation };
    console.log(`[${timestamp}] getChatHistorySimple SUCCESS with ${conversation.length} entries`);
    return result;

  } catch (error) {
    console.error(`[${timestamp}] getChatHistorySimple ERROR:`, error);
    throw error;
  }
}
