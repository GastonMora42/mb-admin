import { SendEmailCommand } from "@aws-sdk/client-ses";
import sesClient from "./ses-client";
import dotenv from 'dotenv';
dotenv.config();

export async function sendEmail(to: string, subject: string, html: string) {
  const params = {
    Destination: { ToAddresses: [to] },
    Message: {
      Body: { Html: { Charset: "UTF-8", Data: html } },
      Subject: { Charset: "UTF-8", Data: subject },
    },
    Source: process.env.SES_SENDER_EMAIL,
  };

  try {
    const command = new SendEmailCommand(params);
    const result = await sesClient.send(command);
    console.log("Email sent successfully:", result.MessageId);
    return result;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}