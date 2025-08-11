"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateCost = calculateCost;
exports.logUsage = logUsage;
const db_1 = require("./db");
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
function calculateCost(provider, model, promptTokens, completionTokens) {
    const providerPricing = PRICING[provider] || PRICING.default;
    const modelPricing = providerPricing[model] || PRICING.default;
    const inputCost = (promptTokens / 1000) * modelPricing.input;
    const outputCost = (completionTokens / 1000) * modelPricing.output;
    return inputCost + outputCost;
}
async function logUsage(usageData) {
    try {
        const { userId, provider, model, promptTokens, completionTokens, totalTokens, ms, sessionId } = usageData;
        const costUsd = calculateCost(provider, model, promptTokens, completionTokens);
        await db_1.db.insert(db_1.usageLogs).values({
            userId,
            provider,
            model,
            promptTokens,
            completionTokens,
            totalTokens,
            ms,
            costUsd: costUsd.toString(),
            sessionId
        });
        console.log(`Logged usage for user ${userId}: ${totalTokens} tokens, $${costUsd.toFixed(6)}`);
    }
    catch (error) {
        console.error('Error logging usage:', error);
    }
}
