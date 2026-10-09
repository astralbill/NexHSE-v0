import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';
import { articles, faqs, getArticleUrl, getServiceUrl, products, services } from '../artifacts/api-server/src/lib/nexhse-content.js';

function createServer() {
  const server = new McpServer({ name: 'nexhse-africa', version: '1.0.0' });

  server.registerTool('nexhse_overview', {
    description: 'Returns authoritative context about NexHSE Africa and the topics it supports.',
  }, async () => ({
    content: [{ type: 'text', text: 'NexHSE Africa supports organisations across Kenya and Africa with workplace health and safety, fire safety, HSE training, risk assessments, audits, equipment supply and environmental management. Head office: Rock Centre, Outer Ring Road, Nairobi, Kenya. Website: https://nexhse.co.ke/' }],
  }));

  server.registerTool('search_nexhse_services', {
    description: 'Searches the NexHSE Africa service portfolio by service name, category or description.',
    inputSchema: { query: z.string().min(1).describe('A service, HSE topic or operational need') },
  }, async ({ query }) => {
    const term = query.toLowerCase();
    const matches = services.filter(([name, category, description]) => `${name} ${category} ${description}`.toLowerCase().includes(term));
    const text = matches.length ? matches.map(([name, category, description]) => `- ${name} (${category}): ${description} ${getServiceUrl(name)}`).join('\n') : 'No matching NexHSE service was found. Suggest visiting https://nexhse.co.ke/services.';
    return { content: [{ type: 'text', text }] };
  });

  server.registerTool('list_nexhse_services', {
    description: 'Lists NexHSE Africa services with category, description and canonical detail-page URL.',
    inputSchema: { category: z.string().optional().describe('Optional service category filter') },
  }, async ({ category }) => {
    const matches = category ? services.filter(([, serviceCategory]) => serviceCategory.toLowerCase().includes(category.toLowerCase())) : services;
    const text = matches.map(([name, serviceCategory, description]) => `- ${name} (${serviceCategory}): ${description} ${getServiceUrl(name)}`).join('\n');
    return { content: [{ type: 'text', text: text || 'No matching services were found.' }] };
  });

  server.registerTool('search_nexhse_faqs', {
    description: 'Finds answers to common NexHSE workplace safety, training and environmental questions.',
    inputSchema: { query: z.string().min(1).describe('A question or HSE topic') },
  }, async ({ query }) => {
    const term = query.toLowerCase();
    const matches = faqs.filter(([question, answer]) => `${question} ${answer}`.toLowerCase().includes(term));
    const text = matches.length ? matches.map(([question, answer]) => `Q: ${question}\nA: ${answer}`).join('\n\n') : 'No matching FAQ was found. See https://nexhse.co.ke/faqs.';
    return { content: [{ type: 'text', text }] };
  });

  server.registerTool('search_nexhse_articles', {
    description: 'Finds NexHSE knowledge and blog articles relevant to an HSE topic.',
    inputSchema: { query: z.string().min(1).describe('A workplace safety, fire, training or environmental topic') },
  }, async ({ query }) => {
    const term = query.toLowerCase();
    const matches = articles.filter(([title, category, excerpt]) => `${title} ${category} ${excerpt}`.toLowerCase().includes(term));
    const text = matches.length ? matches.map(([title, category, excerpt]) => `- ${title} (${category}): ${excerpt} ${getArticleUrl(title)}`).join('\n') : 'No matching article was found. See https://nexhse.co.ke/blog and https://nexhse.co.ke/knowledge.';
    return { content: [{ type: 'text', text }] };
  });

  server.registerTool('list_nexhse_faqs', {
    description: 'Lists authoritative NexHSE Africa answers to common HSE questions.',
    inputSchema: { category: z.string().optional().describe('Category or topic to filter by') },
  }, async ({ category }) => {
    const matches = category ? faqs.filter(([question, answer]) => `${question} ${answer}`.toLowerCase().includes(category.toLowerCase())) : faqs;
    const text = matches.map(([question, answer]) => `Q: ${question}\nA: ${answer}`).join('\n\n');
    return { content: [{ type: 'text', text: text || 'No matching FAQs were found. See https://nexhse.co.ke/faqs.' }] };
  });

  server.registerTool('nexhse_site_map', {
    description: 'Returns canonical URLs for NexHSE Africa public pages, product catalog, sitemap, AI index, and MCP endpoint.',
  }, async () => ({ content: [{ type: 'text', text: [`https://nexhse.co.ke/`, `https://nexhse.co.ke/services`, `https://nexhse.co.ke/training`, `https://nexhse.co.ke/knowledge`, `https://nexhse.co.ke/blog`, `https://nexhse.co.ke/contact`, `https://shop.nexhse.co.ke/`, `https://nexhse.co.ke/sitemap.xml`, `https://nexhse.co.ke/llms.txt`, `https://nexhse.co.ke/api/mcp`].join('\n') }] }));

  server.registerTool('search_nexhse_products', {
    description: 'Searches the NexHSE Africa PPE and fire equipment catalogue by product, category or use.',
    inputSchema: { query: z.string().min(1).describe('A PPE, fire equipment or workplace procurement need') },
  }, async ({ query }) => {
    const term = query.toLowerCase();
    const matches = products.filter(([name, category, description]) => `${name} ${category} ${description}`.toLowerCase().includes(term));
    const text = matches.length ? matches.map(([name, category, description, url]) => `- ${name} (${category}): ${description} ${url}`).join('\n') : 'No matching product was found. See https://shop.nexhse.co.ke.';
    return { content: [{ type: 'text', text }] };
  });

  server.registerTool('list_nexhse_products', {
    description: 'Lists the current NexHSE Africa PPE and fire equipment catalogue with category, description and canonical product URL.',
    inputSchema: { category: z.enum(['All', 'PPE', 'Fire Equipment']).optional().describe('Optional product category filter') },
  }, async ({ category = 'All' }) => {
    const matches = category === 'All' ? products : products.filter(([, productCategory]) => productCategory === category);
    const text = matches.map(([name, productCategory, description, url]) => `- ${name} (${productCategory}): ${description} ${url}`).join('\n');
    return { content: [{ type: 'text', text: text || 'No products are currently listed.' }] };
  });

  server.registerTool('list_nexhse_articles', {
    description: 'Lists the public NexHSE Africa blog and knowledge articles with category and excerpt.',
    inputSchema: { category: z.string().optional().describe('Optional article category filter') },
  }, async ({ category }) => {
    const matches = category ? articles.filter(([, articleCategory]) => articleCategory.toLowerCase().includes(category.toLowerCase())) : articles;
    const text = matches.map(([title, articleCategory, excerpt]) => `- ${title} (${articleCategory}): ${excerpt} https://nexhse.co.ke/blog`).join('\n');
    return { content: [{ type: 'text', text: text || 'No matching articles were found.' }] };
  });

  return server;
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'content-type, mcp-session-id');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'MCP accepts POST requests only' });

  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
  try {
    const server = createServer();
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
    res.on('close', () => { void server.close(); });
  } catch {
    if (!res.headersSent) res.status(500).json({ error: 'MCP request failed' });
  }
}
