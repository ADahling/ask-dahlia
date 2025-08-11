import express from 'express';
import { sql } from 'drizzle-orm';
import { db, usageLogs, usageSummaries, quotas } from '../lib/db';
import { calculateCost } from '../lib/usage';

const router = express.Router();

/**
 * Get user's current usage statistics
 */
router.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { period = 'month' } = req.query;

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;

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

    // Get usage logs for the period
    const usageLogs_result = await db.select().from(usageLogs).where(
      sql`${usageLogs.userId} = ${userId} AND ${usageLogs.timestamp} >= ${startDate}`
    );

    // Calculate totals
    const totalTokens = usageLogs_result.reduce((sum, log) => sum + log.totalTokens, 0);
    const totalCost = usageLogs_result.reduce((sum, log) => sum + Number(log.costUsd), 0);
    const requestCount = usageLogs_result.length;

    // Get quota information
    const userQuotaResults = await db.select().from(quotas).where(
      sql`${quotas.userId} = ${userId}`
    ).limit(1);
    const userQuota = userQuotaResults[0];

    // Group by provider
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
    }, {} as Record<string, { tokens: number; cost: number; requests: number }>);

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

  } catch (error: any) {
    console.error('Usage stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Check if user has exceeded quotas
 */
router.get('/check-quota/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get current month usage
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthlyUsage = await db.select().from(usageLogs).where(
      sql`${usageLogs.userId} = ${userId} AND ${usageLogs.timestamp} >= ${startOfMonth}`
    );

    const totalTokens = monthlyUsage.reduce((sum, log) => sum + log.totalTokens, 0);
    const totalCost = monthlyUsage.reduce((sum, log) => sum + Number(log.costUsd), 0);
    const requestCount = monthlyUsage.length;

    // Get user quota
    const userQuota = await db.select().from(quotas).where(
      sql`${quotas.userId} = ${userId}`
    ).limit(1).then(results => results[0]);

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

  } catch (error: any) {
    console.error('Quota check error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get detailed usage history
 */
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const logs = await db.select().from(usageLogs).where(
      sql`${usageLogs.userId} = ${userId}`
    ).orderBy(sql`${usageLogs.timestamp} DESC`)
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

  } catch (error: any) {
    console.error('Usage history error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
