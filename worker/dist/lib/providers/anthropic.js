"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnthropicProvider = void 0;
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
class AnthropicProvider {
    constructor(model = 'claude-3-5-sonnet-20240620') {
        this.client = new sdk_1.default({
            apiKey: process.env.ANTHROPIC_API_KEY
        });
        this.model = model;
    }
    convertMessages(messages) {
        return messages.map(msg => ({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content
        }));
    }
    async streamChat(messages, onChunk) {
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
                if (chunk.type === 'content_block_delta' && chunk.delta && 'text' in chunk.delta) {
                    const delta = chunk.delta.text;
                    content += delta;
                    await onChunk({
                        content: delta,
                        accumulated: content,
                        done: false
                    });
                }
            }
            const tokenUsage = await this.countTokens(messages, content);
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
        }
        catch (error) {
            console.error('Anthropic streaming error:', error);
            throw error;
        }
    }
    async countTokens(messages, responseText) {
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
exports.AnthropicProvider = AnthropicProvider;
