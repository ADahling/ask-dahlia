import Anthropic from '@anthropic-ai/sdk';

export class AnthropicProvider {
  private client: Anthropic;
  public model: string;

  constructor(model = 'claude-3-5-sonnet-20240620') {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
    this.model = model;
  }

  /**
   * Convert message format from OpenAI to Anthropic
   * @param messages Array of message objects in OpenAI format
   * @returns Array of messages in Anthropic format
   */
  private convertMessages(messages: any[]): any[] {
    return messages.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    }));
  }

  /**
   * Stream chat completion
   * @param messages Array of message objects
   * @param onChunk Callback for each chunk of the stream
   */
  async streamChat(
    messages: any[],
    onChunk: (chunk: any) => Promise<void>
  ): Promise<void> {
    try {
      const anthropicMessages = this.convertMessages(messages);

      const stream = await this.client.messages.create({
        model: this.model,
        messages: anthropicMessages,
        max_tokens: 4000,
        stream: true
      });

      let content = '';

      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta?.type === 'text_delta') {
          const delta = chunk.delta.text;
          content += delta;

          await onChunk({
            content: delta,
            accumulated: content,
            done: false
          });
        }
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
      console.error('Anthropic streaming error:', error);
      throw error;
    }
  }

  /**
   * Count tokens for messages and response (approximation)
   * @param messages Array of message objects
   * @param responseText Response text
   * @returns Token usage object
   */
  private async countTokens(
    messages: any[],
    responseText: string
  ): Promise<{ prompt_tokens: number; completion_tokens: number; total_tokens: number }> {
    // Use rough approximation - Anthropic doesn't provide token counting API
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
