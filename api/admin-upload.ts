import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { getActiveAdminSession, isTrustedOrigin } from '../lib/api/admin-session.js';

const imageContentTypes = [
  'image/avif',
  'image/gif',
  'image/jpeg',
  'image/png',
  'image/webp',
  'video/mp4',
];
const maximumUploadSize = 20 * 1024 * 1024;

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = req.body as HandleUploadBody | undefined;
  if (!body || typeof body !== 'object' || !('type' in body)) {
    return res.status(400).json({ error: 'Invalid Blob upload request' });
  }

  if (body.type !== 'blob.upload-completed') {
    if (!isTrustedOrigin(req)) return res.status(403).json({ error: 'Untrusted origin' });
    const session = await getActiveAdminSession(req);
    if (!session || session.role !== 'owner') return res.status(403).json({ error: 'Owner admin access required' });
  }

  try {
    const result = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        if (!['products', 'services'].includes(clientPayload ?? '')) {
          throw new Error('Invalid media upload scope');
        }
        if (!pathname.startsWith(`nexhse/catalog/${clientPayload}/`) || pathname.includes('..')) {
          throw new Error('Invalid media upload path');
        }
        return {
          allowedContentTypes: imageContentTypes,
          maximumSizeInBytes: maximumUploadSize,
          addRandomSuffix: true,
          allowOverwrite: false,
          cacheControlMaxAge: 31536000,
          tokenPayload: clientPayload,
        };
      },
    });
    return res.status(200).json(result);
  } catch (error) {
    console.error('admin Blob upload failed', error);
    return res.status(500).json({ error: 'Unable to authorize media upload. Check Blob storage configuration and try again.' });
  }
}
