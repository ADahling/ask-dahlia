import { trackUsage } from '../usage';

export interface PerplexityMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface PerplexityResponse {
  id: string;
  model: string;
  created: number;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  choices: {
    index: number;
    finish_reason: string;
    message: {
      role: string;
      content: string;
    };
    delta?: {
      role?: string;
      content?: string;
    };
  }[];
  citations?: string[];
}

export interface PerplexityStreamChunk {
  id: string;
  model: string;
  created: number;
  choices: {
    index: number;
    delta: {
      role?: string;
      content?: string;
    };
    finish_reason: string | null;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  citations?: string[];
}

export class PerplexityProvider {
  private apiKey: string;
  private baseURL = 'https://api.perplexity.ai';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async chat(
    messages: PerplexityMessage[],
    userId: string,
    model: 'sonar' | 'sonar-reasoning' | 'sonar-deep-research' = 'sonar-deep-research',
    stream = false
  ): Promise<PerplexityResponse | ReadableStream> {
    const requestBody = {
      model,
      messages,
      stream,
      max_tokens: model === 'sonar-deep-research' ? 4000 : 2000,
      temperature: 0.1,
      top_p: 0.9,
      search_domain_filter: ["perplexity.ai"], // Can be customized
      return_citations: true,
      search_recency_filter: "month",
      top_k: 0,
      stream: stream,
      presence_penalty: 0,
      frequency_penalty: 1
    };

    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': stream ? 'text/event-stream' : 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Perplexity API error: ${response.status} ${errorText}`);
    }

    if (stream) {
      return this.handleStreamResponse(response, userId, model);
    } else {
      const data = await response.json() as PerplexityResponse;

      // Track usage
      if (data.usage) {
        await trackUsage(userId, {
          provider: 'perplexity',
          model,
          tokens: data.usage.total_tokens,
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          cost: this.calculateCost(model, data.usage.total_tokens)
        });
      }

      return data;
    }
  }

  private async handleStreamResponse(
    response: Response,
    userId: string,
    model: string
  ): Promise<ReadableStream> {
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    let totalTokens = 0;
    let promptTokens = 0;
    let completionTokens = 0;

    return new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = new TextDecoder().decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const jsonStr = line.slice(6);
                if (jsonStr.trim() === '[DONE]') {
                  // Track final usage
                  if (totalTokens > 0) {
                    await trackUsage(userId, {
                      provider: 'perplexity',
                      model,
                      tokens: totalTokens,
                      promptTokens,
                      completionTokens,
                      cost: PerplexityProvider.calculateCost(model, totalTokens)
                    });
                  }
                  controller.close();
                  return;
                }

                try {
                  const data = JSON.parse(jsonStr) as PerplexityStreamChunk;

                  // Track usage from stream chunks
                  if (data.usage) {
                    totalTokens = data.usage.total_tokens;
                    promptTokens = data.usage.prompt_tokens;
                    completionTokens = data.usage.completion_tokens;
                  }

                  // Format the chunk for SSE
                  controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
                } catch (parseError) {
                  console.error('Failed to parse Perplexity stream chunk:', parseError);
                }
              }
            }
          }
        } catch (error) {
          console.error('Perplexity stream error:', error);
          controller.error(error);
        }
      }
    });
  }

  async research(
    query: string,
    userId: string,
    options: {
      domains?: string[];
      recencyFilter?: 'hour' | 'day' | 'week' | 'month' | 'year';
      maxResults?: number;
    } = {}
  ): Promise<PerplexityResponse> {
    const messages: PerplexityMessage[] = [
      {
        role: 'system',
        content: 'You are an expert legal research assistant. Provide comprehensive, accurate, and well-cited research results. Focus on authoritative legal sources, case law, statutes, and regulatory guidance.'
      },
      {
        role: 'user',
        content: `Conduct a comprehensive research analysis on: ${query}. Provide detailed findings with proper citations and source references.`
      }
    ];

    const requestBody = {
      model: 'sonar-deep-research',
      messages,
      max_tokens: 4000,
      temperature: 0.1,
      top_p: 0.9,
      search_domain_filter: options.domains || [],
      return_citations: true,
      search_recency_filter: options.recencyFilter || 'month',
      top_k: options.maxResults || 10,
      stream: false
    };

    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Perplexity research API error: ${response.status} ${errorText}`);
    }

    const data = await response.json() as PerplexityResponse;

    // Track usage
    if (data.usage) {
      await trackUsage(userId, {
        provider: 'perplexity',
        model: 'sonar-deep-research',
        tokens: data.usage.total_tokens,
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        cost: this.calculateCost('sonar-deep-research', data.usage.total_tokens)
      });
    }

    return data;
  }

  private static calculateCost(model: string, tokens: number): number {
    // Perplexity pricing (as of 2024)
    const pricing = {
      'sonar': 0.0015, // per 1K tokens
      'sonar-reasoning': 0.002, // per 1K tokens
      'sonar-deep-research': 0.005 // per 1K tokens (higher for comprehensive research)
    };

    const rate = pricing[model as keyof typeof pricing] || pricing['sonar'];
    return (tokens / 1000) * rate;
  }

  private calculateCost(model: string, tokens: number): number {
    return PerplexityProvider.calculateCost(model, tokens);
  }
}