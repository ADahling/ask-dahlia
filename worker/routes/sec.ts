import express from 'express';
import fetch from 'node-fetch';
import { db, secFilings } from '../lib/db';
import { uniqueId } from '../lib/utils';

const router = express.Router();

// SEC EDGAR API base URL
const SEC_BASE_URL = 'https://data.sec.gov';

// User agent required by SEC
const USER_AGENT = 'Ask Dahlia Legal AI (support@askdahlia.com)';

/**
 * Search SEC filings by company
 */
router.post('/search', async (req, res) => {
  try {
    const { query, forms, limit = 20 } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // First, search for company CIK
    const companySearchUrl = `${SEC_BASE_URL}/submissions/CIK${query.padStart(10, '0')}.json`;

    const response = await fetch(companySearchUrl, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const companyData = await response.json() as any;

    // Filter filings by form types if specified
    const recentFilings = companyData.filings?.recent || {};
    const filings = [];

    const accessionNumbers = recentFilings.accessionNumber || [];
    const filingDates = recentFilings.filingDate || [];
    const formTypes = recentFilings.form || [];
    const reportDates = recentFilings.reportDate || [];

    for (let i = 0; i < Math.min(accessionNumbers.length, limit); i++) {
      const formType = formTypes[i];

      // Filter by form types if specified
      if (forms && forms.length > 0 && !forms.includes(formType)) {
        continue;
      }

      filings.push({
        accessionNumber: accessionNumbers[i],
        filingDate: filingDates[i],
        reportDate: reportDates[i],
        formType: formType,
        cik: companyData.cik,
        companyName: companyData.name,
        documentUrl: `${SEC_BASE_URL}/Archives/edgar/data/${companyData.cik}/${accessionNumbers[i].replace(/-/g, '')}/${accessionNumbers[i]}-index.html`
      });
    }

    res.json({
      company: {
        cik: companyData.cik,
        name: companyData.name,
        tickers: companyData.tickers || []
      },
      filings: filings.slice(0, limit)
    });

  } catch (error: any) {
    console.error('SEC search error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get specific filing details
 */
router.get('/filing/:cik/:accessionNumber', async (req, res) => {
  try {
    const { cik, accessionNumber } = req.params;

    // Get filing details from SEC
    const filingUrl = `${SEC_BASE_URL}/Archives/edgar/data/${cik}/${accessionNumber.replace(/-/g, '')}/${accessionNumber}-index.html`;

    const response = await fetch(filingUrl, {
      headers: {
        'User-Agent': USER_AGENT
      }
    });

    if (!response.ok) {
      return res.status(404).json({ error: 'Filing not found' });
    }

    const html = await response.text();

    // Parse filing documents from HTML
    const documents = [];
    const docRegex = /<tr><td scope="row">(\d+)<\/td><td scope="row"><a href="([^"]+)">([^<]+)<\/a><\/td><td scope="row">([^<]+)<\/td><td scope="row">([^<]+)<\/td><\/tr>/g;
    let match;

    while ((match = docRegex.exec(html)) !== null) {
      documents.push({
        sequence: match[1],
        url: `${SEC_BASE_URL}${match[2]}`,
        filename: match[3],
        type: match[4],
        size: match[5]
      });
    }

    res.json({
      accessionNumber,
      cik,
      filingUrl,
      documents
    });

  } catch (error: any) {
    console.error('SEC filing details error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Add SEC filing to corpus for RAG
 */
router.post('/add-to-corpus', async (req, res) => {
  try {
    const { userId, cik, accessionNumber, documentUrl, metadata } = req.body;

    if (!userId || !cik || !accessionNumber || !documentUrl) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Fetch document content
    const response = await fetch(documentUrl, {
      headers: {
        'User-Agent': USER_AGENT
      }
    });

    if (!response.ok) {
      return res.status(400).json({ error: 'Could not fetch document' });
    }

    const content = await response.text();

    // Save to database
    const filingId = uniqueId();

    await db.insert(secFilings).values({
      id: filingId,
      userId,
      cik,
      accessionNumber,
      formType: metadata?.formType || 'Unknown',
      filingDate: metadata?.filingDate ? new Date(metadata.filingDate) : new Date(),
      reportDate: metadata?.reportDate ? new Date(metadata.reportDate) : null,
      companyName: metadata?.companyName || 'Unknown',
      documentUrl,
      content,
      addedAt: new Date()
    });

    res.json({
      success: true,
      filingId,
      message: 'SEC filing added to corpus successfully'
    });

  } catch (error: any) {
    console.error('Add to corpus error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Search filings by ticker symbol
 */
router.get('/ticker/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;

    // Get company info by ticker
    const tickerUrl = `${SEC_BASE_URL}/files/company_tickers.json`;

    const response = await fetch(tickerUrl, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      return res.status(500).json({ error: 'Could not fetch ticker data' });
    }

    const tickerData = await response.json() as any;

    // Find company by ticker symbol
    const company = Object.values(tickerData).find((company: any) =>
      company.ticker === symbol.toUpperCase()
    ) as any;

    if (!company) {
      return res.status(404).json({ error: 'Ticker symbol not found' });
    }

    res.json({
      cik: company.cik_str.padStart(10, '0'),
      name: company.title,
      ticker: company.ticker
    });

  } catch (error: any) {
    console.error('Ticker lookup error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
