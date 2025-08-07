'use server';

/**
 * @fileOverview Product information retrieval flow.
 *
 * - getProductInformation - A function that retrieves product information based on a query.
 * - ProductInformationInput - The input type for the getProductInformation function.
 * - ProductInformationOutput - The return type for the getProductInformation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProductInformationInputSchema = z.object({
  productName: z.string().describe('The name of the product to get information about.'),
  query: z
    .string()
    .describe(
      'The question about the product. This could be about dimensions, materials, or care instructions.'
    ),
});
export type ProductInformationInput = z.infer<typeof ProductInformationInputSchema>;

const ProductInformationOutputSchema = z.object({
  answer: z.string().describe('The answer to the question about the product.'),
});
export type ProductInformationOutput = z.infer<typeof ProductInformationOutputSchema>;

export async function getProductInformation(input: ProductInformationInput): Promise<ProductInformationOutput> {
  return productInformationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'productInformationPrompt',
  input: {schema: ProductInformationInputSchema},
  output: {schema: ProductInformationOutputSchema},
  prompt: `You are a customer service agent who specializes in answering questions about products.

  Product Name: {{{productName}}}
  Question: {{{query}}}

  Answer the question using your knowledge of the product. Be specific and provide as much detail as possible.
  Keep your answer concise and to the point.
  `,
});

const productInformationFlow = ai.defineFlow(
  {
    name: 'productInformationFlow',
    inputSchema: ProductInformationInputSchema,
    outputSchema: ProductInformationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
