import path from 'path';
import { createReadStream, promises as fs } from 'node:fs';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv } from 'vite';

import runtimeErrorOverlay from '@replit/vite-plugin-runtime-error-modal';

// Use defaults for build environments (Vercel, etc.) and development defaults
const rawPort = process.env.PORT || '5000';
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH || '/';
const workspaceRoot = path.resolve(import.meta.dirname, '../..');

function localAdminSessionApi() {
  return {
    name: 'nexhse-local-admin-session-api',
    configResolved(config: { command: string; mode: string }) {
      if (config.command !== 'serve') return;
      for (const [key, value] of Object.entries(loadEnv(config.mode, workspaceRoot, ''))) {
        if (process.env[key] === undefined) process.env[key] = value;
      }
    },
    configureServer(server: any) {
      server.middlewares.use('/api/admin-session', (req: any, res: any, next: () => void) => {
        if (!['GET', 'POST', 'DELETE'].includes(req.method ?? '')) return next();

        const invoke = async () => {
          try {
            const module = await server.ssrLoadModule(path.join(workspaceRoot, 'api/admin-session.ts'));
            const apiResponse = Object.create(res);
            apiResponse.setHeader = (name: string, value: string) => res.setHeader(name, value);
            apiResponse.status = (code: number) => { res.statusCode = code; return apiResponse; };
            apiResponse.json = (value: unknown) => {
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              res.end(JSON.stringify(value));
              return apiResponse;
            };
            apiResponse.end = (value?: string) => res.end(value);
            await module.default(req, apiResponse);
          } catch (error) {
            server.config.logger.error(error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ error: 'Local admin authentication failed' }));
          }
        };

        if (req.method !== 'POST') {
          void invoke();
          return;
        }

        const chunks: Buffer[] = [];
        let size = 0;
        req.on('data', (chunk: Buffer) => {
          size += chunk.length;
          if (size > 16_384) {
            res.statusCode = 413;
            res.end();
            req.destroy();
            return;
          }
          chunks.push(chunk);
        });
        req.on('end', () => {
          try {
            req.body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
            void invoke();
          } catch {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Invalid JSON body' }));
          }
        });
      });
    },
  };
}

function sharedCatalogAssets() {
  const assetRoot = path.resolve(workspaceRoot, 'public/assets');
  const contentTypes: Record<string, string> = {
    '.avif': 'image/avif',
    '.gif': 'image/gif',
    '.jpeg': 'image/jpeg',
    '.jpg': 'image/jpeg',
    '.mp4': 'video/mp4',
    '.png': 'image/png',
    '.webp': 'image/webp',
  };
  return {
    name: 'nexhse-shared-catalog-assets',
    configureServer(server: any) {
      server.middlewares.use('/assets', (req: any, res: any, next: () => void) => {
        if (!['GET', 'HEAD'].includes(req.method ?? '')) return next();
        let relativePath: string;
        try {
          relativePath = decodeURIComponent((req.url ?? '/').split('?')[0]).replace(/^\/+/, '');
        } catch {
          return next();
        }
        const assetPath = path.resolve(assetRoot, relativePath);
        if (assetPath !== assetRoot && !assetPath.startsWith(`${assetRoot}${path.sep}`)) return next();
        void fs.stat(assetPath).then(info => {
          if (!info.isFile()) return next();
          res.statusCode = 200;
          res.setHeader('Content-Type', contentTypes[path.extname(assetPath).toLowerCase()] ?? 'application/octet-stream');
          res.setHeader('Content-Length', info.size);
          res.setHeader('Cache-Control', 'public, max-age=3600');
          if (req.method === 'HEAD') return res.end();
          const stream = createReadStream(assetPath);
          stream.on('error', error => {
            server.config.logger.error(error);
            if (!res.headersSent) res.statusCode = 500;
            res.end();
          });
          stream.pipe(res);
        }).catch((error: NodeJS.ErrnoException) => {
          if (error.code === 'ENOENT' || error.code === 'ENOTDIR') return next();
          server.config.logger.error(error);
          res.statusCode = 500;
          res.end();
        });
      });
    },
  };
}

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    sharedCatalogAssets(),
    localAdminSessionApi(),
    ...(process.env.NODE_ENV !== 'production' &&
    process.env.REPL_ID !== undefined
      ? [
          await import('@replit/vite-plugin-cartographer').then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, '..'),
            }),
          ),
          await import('@replit/vite-plugin-dev-banner').then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      '@assets': path.resolve(
        import.meta.dirname,
        '..',
        '..',
        'attached_assets',
      ),
    },
    dedupe: ['react', 'react-dom'],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('/node_modules/')) return;
          if (/\/(react|react-dom|scheduler)\//.test(id)) return 'framework';
          if (id.includes('/@radix-ui/')) return 'radix-ui';
          if (id.includes('/lucide-react/')) return 'icons';
          if (id.includes('/react-icons/')) return 'social-icons';
          if (id.includes('/@tanstack/')) return 'query';
          if (id.includes('/wouter/')) return 'router';
        },
      },
    },
  },
  server: {
    port,
    strictPort: true,
    host: '0.0.0.0',
    allowedHosts: true,
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host: '0.0.0.0',
    allowedHosts: true,
  },
});
