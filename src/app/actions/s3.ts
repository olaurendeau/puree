'use server'
import AWS from 'aws-sdk';
import { GetObjectOutput } from 'aws-sdk/clients/s3';

const s3 = new AWS.S3({
    endpoint: process.env.AWS_ENDPOINT,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  });
  
export const uploadToS3 = async (base64Data: string, filename: string): Promise<string> => {
  if (!process.env.AWS_S3_BUCKET_NAME) {
    throw new Error('AWS_S3_BUCKET_NAME is not set');
  }

  const buffer = Buffer.from(base64Data, 'base64');

  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: filename,
    Body: buffer,
    ContentType: 'image/jpeg',
    ACL: 'public-read',
  };

  const { Location } = await s3.upload(params).promise();
  
  return Location;
};

export const getS3Data = async (filename: string): Promise<GetObjectOutput> => {
    if (!process.env.AWS_S3_BUCKET_NAME) {
        throw new Error('AWS_S3_BUCKET_NAME is not set');
    }
    // Construct the S3 URL or fetch it from a database
    const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME, // Ensure this environment variable is set
        Key: filename,
    };

    const data = await s3.getObject(params).promise();

    if (!data.Body) {
       throw new Error('File not found');
    }

    return data;
};