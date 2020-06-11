import { Client } from 'minio';
import { config } from 'dotenv';

config();

const minio = new Client({
  endPoint: process.env.MINIO_ENDPOINT!,
  port: +process.env.MINIO_PORT!,
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY!,
  secretKey: process.env.MINIO_SECRET_KEY!,
});

export default minio;
