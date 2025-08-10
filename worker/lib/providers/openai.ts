import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { parseSSE } from '../utils';

export class OpenAIProvider {
  private client: OpenAI;
  public model: string;

  constructor(model = 'gpt-4o') {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    this.model = model;
  }

  /**
   * Stream chat completion
   * @param messages Array of message objects
   * @param onChunk Callback for each chunk of the stream
   */
  async streamChat(
    messages: ChatCompletionMessageParam[],
    onChunk: (chunk: any) => Promise<void>
  ): Promise<void> {
    try {
      const stream = await this.client.chat.completions.create({
        model: this.model,
        messages,
        stream: true,
        temperature: 0.7,
        max_tokens: 4000
      });

      let content = '';

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content || '';
        content += delta;

        await onChunk({
          content: delta,
          accumulated: content,
          done: false
        });
      }

      // Get token usage
      const tokenUsage = await this.countTokens(messages, content);

      // Send final chunk with full content and usage information
      await onChunk({
        content: '',
        accumulated: content,
        done: true,
        usage: {
          prompt_tokens: tokenUsage.prompt_tokens,
          completion_tokens: tokenUsage.completion_tokens,
          total_tokens: tokenUsage.total_tokens
        }
      });
    } catch (error) {
      console.error('OpenAI streaming error:', error);
      throw error;
    }
  }

  /**
   * Count tokens for messages and response
   * @param messages Array of message objects
   * @param responseText Response text
   * @returns Token usage object
   */
  private async countTokens(
    messages: ChatCompletionMessageParam[],
    responseText: string
  ): Promise<{ prompt_tokens: number; completion_tokens: number; total_tokens: number }> {
    try {
      // Use OpenAI's tokenizer endpoint
      const tokenResponse = await this.client.chat.completions.create({
        model: this.model,
        messages,
        temperature: 0,
        max_tokens: 0
      });

      const promptTokens = tokenResponse.usage?.prompt_tokens || 0;

      // For completion tokens, use the same API to estimate
      const completionResponse = await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: 'Count these tokens' }, { role: 'assistant', content: responseText }],
        temperature: 0,
        max_tokens: 0
      });

      // Subtract the tokens from the user message
      const completionTokens = (completionResponse.usage?.prompt_tokens || 0) - 9; // "Count these tokens" is approximately 4 tokens

      return {
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        total_tokens: promptTokens + completionTokens
      };
    } catch (error) {
      console.error('Token counting error:', error);

      // Fallback: use rough approximation
      // Approx 4 chars per token for English
      const promptString = messages.map(m => `${m.role}: ${m.content}`).join('\n');
      const promptTokens = Math.ceil(promptString.length / 4);
      const completionTokens = Math.ceil(responseText.length / 4);

      return {
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        total_tokens: promptTokens + completionTokens
      };
    }
  }

  /**
   * Generate embedding for text
   * @param text Text to embed
   * @returns Embedding vector
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.client.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
        encoding_format: 'float'
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('OpenAI embedding error:', error);
      throw error;
    }
  }
}
