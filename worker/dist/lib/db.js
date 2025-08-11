"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.quotas = exports.usageSummaries = exports.usageLogs = exports.savedDocuments = exports.citations = exports.messages = exports.chatSessions = exports.secFilings = exports.riskAssessments = exports.riskTemplates = exports.clauses = exports.terms = exports.chunks = exports.documents = exports.accessRequests = exports.users = exports.db = void 0;
const serverless_1 = require("@neondatabase/serverless");
const neon_http_1 = require("drizzle-orm/neon-http");
const schema = __importStar(require("./schema"));
const sql = (0, serverless_1.neon)(process.env.DATABASE_URL);
exports.db = (0, neon_http_1.drizzle)(sql, { schema });
exports.users = schema.users, exports.accessRequests = schema.accessRequests, exports.documents = schema.documents, exports.chunks = schema.chunks, exports.terms = schema.terms, exports.clauses = schema.clauses, exports.riskTemplates = schema.riskTemplates, exports.riskAssessments = schema.riskAssessments, exports.secFilings = schema.secFilings, exports.chatSessions = schema.chatSessions, exports.messages = schema.messages, exports.citations = schema.citations, exports.savedDocuments = schema.savedDocuments, exports.usageLogs = schema.usageLogs, exports.usageSummaries = schema.usageSummaries, exports.quotas = schema.quotas;
