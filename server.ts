import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Trust proxy to get real IP if behind a reverse proxy
  app.set('trust proxy', true);

  app.use(express.json());

  // In-memory storage
  const links = new Map<string, { originalUrl: string, createdAt: number }>();
  const sessions = new Map<string, { shortId: string, createdAt: number, ip: string, code: string | null }>();
  const ipBlocks = new Map<string, { attempts: number, blockedUntil: number }>();

  // Helper to check if IP is blocked
  function checkBlocked(ip: string) {
    const block = ipBlocks.get(ip);
    if (block && block.blockedUntil > Date.now()) {
      return true;
    }
    return false;
  }

  // API Routes
  app.post('/api/shorten', (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });
    
    // Simple URL validation
    try {
      new URL(url);
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' });
    }
    
    const shortId = Math.random().toString(36).substring(2, 6); // Short 4 char ID
    links.set(shortId, { originalUrl: url, createdAt: Date.now() });
    
    res.json({ shortId });
  });

  app.get('/api/info/:shortId', (req, res) => {
    const { shortId } = req.params;
    const link = links.get(shortId);
    if (!link) return res.status(404).json({ error: 'Link not found' });
    
    res.json({ shortId, createdAt: link.createdAt });
  });

  app.post('/api/session/:shortId', (req, res) => {
    const { shortId } = req.params;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    
    if (checkBlocked(ip)) {
      return res.status(403).json({ error: 'IP is blocked for 24 hours due to too many failed attempts.' });
    }

    const link = links.get(shortId);
    if (!link) return res.status(404).json({ error: 'Link not found' });

    const sessionId = uuidv4();
    sessions.set(sessionId, { shortId, createdAt: Date.now(), ip, code: null });
    
    res.json({ sessionId });
  });

  app.post('/api/generate-code/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    const session = sessions.get(sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    // Generate a random code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    session.code = code;
    
    res.json({ code });
  });

  app.post('/api/verify', (req, res) => {
    const { shortId, sessionId, code } = req.body;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';

    if (checkBlocked(ip)) {
      return res.status(403).json({ error: 'IP is blocked for 24 hours.' });
    }

    const session = sessions.get(sessionId);
    if (!session || session.shortId !== shortId) {
      return res.status(400).json({ error: 'Invalid session' });
    }

    if (!session.code || session.code !== code) {
      const block = ipBlocks.get(ip) || { attempts: 0, blockedUntil: 0 };
      block.attempts += 1;
      if (block.attempts >= 3) {
        block.blockedUntil = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
        ipBlocks.set(ip, block);
        return res.status(403).json({ error: 'Too many failed attempts. IP blocked for 24 hours.' });
      }
      ipBlocks.set(ip, block);
      return res.status(400).json({ error: `Invalid code. ${3 - block.attempts} attempts remaining.` });
    }

    const link = links.get(shortId);
    if (!link) return res.status(404).json({ error: 'Link not found' });

    // Reset attempts on success
    ipBlocks.delete(ip);
    sessions.delete(sessionId);

    res.json({ originalUrl: link.originalUrl });
  });

  app.get('/api/stats', (req, res) => {
    res.json({
      totalLinks: links.size,
      totalSessions: sessions.size,
      blockedIps: ipBlocks.size
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
