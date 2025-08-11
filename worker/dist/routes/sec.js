"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const db_1 = require("../lib/db");
const utils_1 = require("../lib/utils");
const router = express_1.default.Router();
const SEC_BASE_URL = 'https://data.sec.gov';
const USER_AGENT = 'Ask Dahlia Legal AI (support@askdahlia.com)';
router.post('/search', async (req, res) => {
    try {
        const { query, forms, limit = 20 } = req.body;
        if (!query) {
            return res.status(400).json({ error: 'Search query is required' });
        }
        const companySearchUrl = `${SEC_BASE_URL}/submissions/CIK${query.padStart(10, '0')}.json`;
        const response = await (0, node_fetch_1.default)(companySearchUrl, {
            headers: {
                'User-Agent': USER_AGENT,
                'Accept': 'application/json'
            }
        });
        if (!response.ok) {
            return res.status(404).json({ error: 'Company not found' });
        }
        const companyData = await response.json();
        const recentFilings = companyData.filings?.recent || {};
        const filings = [];
        const accessionNumbers = recentFilings.accessionNumber || [];
        const filingDates = recentFilings.filingDate || [];
        const formTypes = recentFilings.form || [];
        const reportDates = recentFilings.reportDate || [];
        for (let i = 0; i < Math.min(accessionNumbers.length, limit); i++) {
            const formType = formTypes[i];
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
    }
    catch (error) {
        console.error('SEC search error:', error);
        res.status(500).json({ error: error.message });
    }
});
router.get('/filing/:cik/:accessionNumber', async (req, res) => {
    try {
        const { cik, accessionNumber } = req.params;
        const filingUrl = `${SEC_BASE_URL}/Archives/edgar/data/${cik}/${accessionNumber.replace(/-/g, '')}/${accessionNumber}-index.html`;
        const response = await (0, node_fetch_1.default)(filingUrl, {
            headers: {
                'User-Agent': USER_AGENT
            }
        });
        if (!response.ok) {
            return res.status(404).json({ error: 'Filing not found' });
        }
        const html = await response.text();
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
    }
    catch (error) {
        console.error('SEC filing details error:', error);
        res.status(500).json({ error: error.message });
    }
});
router.post('/add-to-corpus', async (req, res) => {
    try {
        const { userId, cik, accessionNumber, documentUrl, metadata } = req.body;
        if (!userId || !cik || !accessionNumber || !documentUrl) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const response = await (0, node_fetch_1.default)(documentUrl, {
            headers: {
                'User-Agent': USER_AGENT
            }
        });
        if (!response.ok) {
            return res.status(400).json({ error: 'Could not fetch document' });
        }
        const content = await response.text();
        const filingId = (0, utils_1.uniqueId)();
        await db_1.db.insert(db_1.secFilings).values({
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
    }
    catch (error) {
        console.error('Add to corpus error:', error);
        res.status(500).json({ error: error.message });
    }
});
router.get('/ticker/:symbol', async (req, res) => {
    try {
        const { symbol } = req.params;
        const tickerUrl = `${SEC_BASE_URL}/files/company_tickers.json`;
        const response = await (0, node_fetch_1.default)(tickerUrl, {
            headers: {
                'User-Agent': USER_AGENT,
                'Accept': 'application/json'
            }
        });
        if (!response.ok) {
            return res.status(500).json({ error: 'Could not fetch ticker data' });
        }
        const tickerData = await response.json();
        const company = Object.values(tickerData).find((company) => company.ticker === symbol.toUpperCase());
        if (!company) {
            return res.status(404).json({ error: 'Ticker symbol not found' });
        }
        res.json({
            cik: company.cik_str.padStart(10, '0'),
            name: company.title,
            ticker: company.ticker
        });
    }
    catch (error) {
        console.error('Ticker lookup error:', error);
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
