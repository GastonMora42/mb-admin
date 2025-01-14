import { SESClient } from "@aws-sdk/client-ses";
import dotenv from 'dotenv';
dotenv.config();

const sesClient = new SESClient({
  region: process.env.REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY!,
  },
});

export default sesClient;