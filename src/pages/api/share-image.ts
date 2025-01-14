import { getS3Data } from '@/app/actions/s3';
import { S3 } from 'aws-sdk';
import type { NextApiRequest, NextApiResponse } from 'next';

const s3 = new S3();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { filename } = req.query;

    if (!filename || typeof filename !== 'string') {
        return res.status(400).json({ error: 'Invalid filename' });
    }

    try {
        const data = await getS3Data(filename);

        res.setHeader('Content-Type', data.ContentType || 'image/jpeg');
        res.send(data.Body);
    } catch (error) {
        console.error('Error fetching S3 object:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}