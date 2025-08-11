"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseSSE = parseSSE;
exports.createSSE = createSSE;
exports.formatBytes = formatBytes;
exports.isQuotaExceeded = isQuotaExceeded;
exports.timestamp = timestamp;
exports.uniqueId = uniqueId;
function parseSSE(message) {
    const result = {};
    const lines = message.trim().split('\n');
    for (const line of lines) {
        const colonIndex = line.indexOf(':');
        if (colonIndex === -1)
            continue;
        const field = line.slice(0, colonIndex).trim();
        const value = line.slice(colonIndex + 1).trim();
        if (field && value) {
            result[field] = value;
        }
    }
    return result;
}
function createSSE(event, data) {
    let message = '';
    if (event) {
        message += `event: ${event}\n`;
    }
    message += `data: ${typeof data === 'string' ? data : JSON.stringify(data)}\n\n`;
    return message;
}
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0)
        return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
function isQuotaExceeded(used, limit) {
    return used >= limit;
}
function timestamp() {
    return new Date().toISOString();
}
function uniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}
