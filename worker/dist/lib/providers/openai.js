"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIProvider = void 0;
const openai_1 = __importDefault(require("openai"));
class OpenAIProvider {
    constructor(model = 'gpt-4o') {
        this.client = new openai_1.default({
            apiKey: process.env.OPENAI_API_KEY
        });
        this.model = model;
    }
    async streamChat(messages, onChunk) {
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
            console.error('OpenAI streaming error:', error);
            throw error;
        }
    }
    async countTokens(messages, responseText) {
        try {
            const tokenResponse = await this.client.chat.completions.create({
                model: this.model,
                messages,
                temperature: 0,
                max_tokens: 0
            });
            const promptTokens = tokenResponse.usage?.prompt_tokens || 0;
            const completionResponse = await this.client.chat.completions.create({
                model: this.model,
                messages: [{ role: 'user', content: 'Count these tokens' }, { role: 'assistant', content: responseText }],
                temperature: 0,
                max_tokens: 0
            });
            const completionTokens = (completionResponse.usage?.prompt_tokens || 0) - 9;
            return {
                prompt_tokens: promptTokens,
                completion_tokens: completionTokens,
                total_tokens: promptTokens + completionTokens
            };
        }
        catch (error) {
            console.error('Token counting error:', error);
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
    async generateEmbedding(text) {
        try {
            const response = await this.client.embeddings.create({
                model: 'text-embedding-3-small',
                input: text,
                encoding_format: 'float'
            });
            return response.data[0].embedding;
        }
        catch (error) {
            console.error('OpenAI embedding error:', error);
            throw error;
        }
    }
}
exports.OpenAIProvider = OpenAIProvider;
