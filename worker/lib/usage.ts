import { db, usageLogs } from './db';

// Provider pricing per 1000 tokens
const PRICING = {
  openai: {
    'gpt-4o': {
      input: 0.01,
      output: 0.03
    },
    'gpt-4-1106-preview': {
      input: 0.01,
      output: 0.03
    },
    'gpt-4-0613': {
      input: 0.03,
      output: 0.06
    },
    'gpt-3.5-turbo': {
      input: 0.001,
      output: 0.002
    }
  },
  anthropic: {
    'claude-3-5-sonnet-20240620': {
      input: 0.003,
      output: 0.015
    },
    'claude-3-opus-20240229': {
      input: 0.015,
      output: 0.075
    },
    'claude-3-sonnet-20240229': {
      input: 0.003,
      output: 0.015
    },
    'claude-3-haiku-20240307': {
      input: 0.00025,
      output: 0.00125
    }
  },
  default: {
    input: 0.01,
    output: 0.03
  }
};

interface UsageData {
  userId: string;
  provider: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  ms: number;
  sessionId?: string;
}

/**
 * Calculate cost in USD for token usage
 * @param provider Provider name
 * @param model Model name
 * @param promptTokens Number of prompt tokens
 * @param completionTokens Number of completion tokens
 * @returns Cost in USD
 */
export function calculateCost(
  provider: string,
  model: string,
  promptTokens: number,
  completionTokens: number
): number {
  const providerPricing = PRICING[provider as keyof typeof PRICING] || PRICING.default;
  const modelPricing = providerPricing[model as keyof typeof providerPricing] || PRICING.default;

  const inputCost = (promptTokens / 1000) * modelPricing.input;
  const outputCost = (completionTokens / 1000) * modelPricing.output;

  return inputCost + outputCost;
}

/**
 * Log usage data to database
 * @param usageData Usage data object
 */
export async function logUsage(usageData: UsageData): Promise<void> {
  try {
    const {
      userId,
      provider,
      model,
      promptTokens,
      completionTokens,
      totalTokens,
      ms,
      sessionId
    } = usageData;

    // Calculate cost
    const costUsd = calculateCost(provider, model, promptTokens, completionTokens);

    // Insert usage log
    await db.insert(usageLogs).values({
      userId,
      provider,
      model,
      promptTokens,
      completionTokens,
      totalTokens,
      ms,
      costUsd,
      sessionId
    });

    console.log(`Logged usage for user ${userId}: ${totalTokens} tokens, $${costUsd.toFixed(6)}`);
  } catch (error) {
    console.error('Error logging usage:', error);
  }
}
