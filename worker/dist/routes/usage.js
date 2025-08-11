"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("../lib/db");
const router = express_1.default.Router();
router.get('/stats/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { period = 'month' } = req.query;
        const now = new Date();
        let startDate;
        switch (period) {
            case 'day':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
        }
        const usageLogs_result = await db_1.db.select().from(db_1.usageLogs).where((0, drizzle_orm_1.sql) `${db_1.usageLogs.userId} = ${userId} AND ${db_1.usageLogs.timestamp} >= ${startDate}`);
        const totalTokens = usageLogs_result.reduce((sum, log) => sum + log.totalTokens, 0);
        const totalCost = usageLogs_result.reduce((sum, log) => sum + Number(log.costUsd), 0);
        const requestCount = usageLogs_result.length;
        const userQuotaResults = await db_1.db.select().from(db_1.quotas).where((0, drizzle_orm_1.sql) `${db_1.quotas.userId} = ${userId}`).limit(1);
        const userQuota = userQuotaResults[0];
        const byProvider = usageLogs_result.reduce((acc, log) => {
            if (!acc[log.provider]) {
                acc[log.provider] = {
                    tokens: 0,
                    cost: 0,
                    requests: 0
                };
            }
            acc[log.provider].tokens += log.totalTokens;
            acc[log.provider].cost += Number(log.costUsd);
            acc[log.provider].requests += 1;
            return acc;
        }, {});
        res.json({
            period,
            startDate,
            endDate: now,
            totals: {
                tokens: totalTokens,
                cost: totalCost,
                requests: requestCount
            },
            byProvider,
            quota: userQuota ? {
                tokensLimit: userQuota.tokensLimit,
                tokensUsed: totalTokens,
                tokensRemaining: Math.max(0, userQuota.tokensLimit - totalTokens),
                costLimit: Number(userQuota.costLimit),
                costUsed: totalCost,
                costRemaining: Math.max(0, Number(userQuota.costLimit) - totalCost),
                requestsLimit: userQuota.requestsLimit,
                requestsUsed: requestCount,
                requestsRemaining: Math.max(0, userQuota.requestsLimit - requestCount)
            } : null
        });
    }
    catch (error) {
        console.error('Usage stats error:', error);
        res.status(500).json({ error: error.message });
    }
});
router.get('/check-quota/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthlyUsage = await db_1.db.select().from(db_1.usageLogs).where((0, drizzle_orm_1.sql) `${db_1.usageLogs.userId} = ${userId} AND ${db_1.usageLogs.timestamp} >= ${startOfMonth}`);
        const totalTokens = monthlyUsage.reduce((sum, log) => sum + log.totalTokens, 0);
        const totalCost = monthlyUsage.reduce((sum, log) => sum + Number(log.costUsd), 0);
        const requestCount = monthlyUsage.length;
        const userQuota = await db_1.db.select().from(db_1.quotas).where((0, drizzle_orm_1.sql) `${db_1.quotas.userId} = ${userId}`).limit(1).then(results => results[0]);
        if (!userQuota) {
            return res.json({
                hasQuota: false,
                tokensExceeded: false,
                costExceeded: false,
                requestsExceeded: false
            });
        }
        const tokensExceeded = totalTokens >= userQuota.tokensLimit;
        const costExceeded = totalCost >= Number(userQuota.costLimit);
        const requestsExceeded = requestCount >= userQuota.requestsLimit;
        res.json({
            hasQuota: true,
            tokensExceeded,
            costExceeded,
            requestsExceeded,
            anyExceeded: tokensExceeded || costExceeded || requestsExceeded,
            usage: {
                tokens: totalTokens,
                cost: totalCost,
                requests: requestCount
            },
            limits: {
                tokens: userQuota.tokensLimit,
                cost: Number(userQuota.costLimit),
                requests: userQuota.requestsLimit
            }
        });
    }
    catch (error) {
        console.error('Quota check error:', error);
        res.status(500).json({ error: error.message });
    }
});
router.get('/history/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 50, offset = 0 } = req.query;
        const logs = await db_1.db.select().from(db_1.usageLogs).where((0, drizzle_orm_1.sql) `${db_1.usageLogs.userId} = ${userId}`).orderBy((0, drizzle_orm_1.sql) `${db_1.usageLogs.timestamp} DESC`)
            .limit(Number(limit))
            .offset(Number(offset));
        res.json({
            logs,
            pagination: {
                limit: Number(limit),
                offset: Number(offset),
                hasMore: logs.length === Number(limit)
            }
        });
    }
    catch (error) {
        console.error('Usage history error:', error);
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
