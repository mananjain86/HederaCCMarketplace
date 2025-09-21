console.clear();
import dotenv from "dotenv";
dotenv.config();

import {
  Client,
  TopicCreateTransaction,
  TopicMessageQuery,
  TopicMessageSubmitTransaction,
} from "@hashgraph/sdk";

// Grab the OPERATOR_ID and OPERATOR_KEY from the .env file
const operatorId = process.env.OPERATOR_ID;
const operatorKey = process.env.OPERATOR_KEY;

// Build Hedera testnet and mirror node client
const client = Client.forTestnet().setOperator(operatorId, operatorKey);

async function submitFirstMessage() {
  // Create a new topic
  const txResponse = await new TopicCreateTransaction().execute(client);

  // Grab the newly generated topic ID
  const receipt = await txResponse.getReceipt(client);
  const topicId = receipt.topicId;
  console.log(`Your topic ID is: ${topicId}`);

  // Wait 5 seconds between consensus topic creation and subscription creation
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // Subscribe to the topic
  new TopicMessageQuery()
    .setTopicId(topicId)
    .subscribe(client, null, (message) => {
      const messageAsString = Buffer.from(message.contents, "utf8").toString();
      console.log(
        `${message.consensusTimestamp.toDate()} Received: ${messageAsString}`
      );

      // Close client right after the first received message
      client.close();
    });

  // Send message to topic
  const sendResponse = await new TopicMessageSubmitTransaction({
    topicId: topicId,
    message: "Hello, HCS!",
  }).execute(client);
  const getReceipt = await sendResponse.getReceipt(client);

  // Get the status of the transaction
  const transactionStatus = getReceipt.status;
  console.log(
    "The message transaction status: " + transactionStatus.toString()
  );
}

submitFirstMessage();

/* add function to query the data from the topic 
url to fetch from = // Replace <topicId>
https://testnet.mirrornode.hedera.com/api/v1/topics/<topicID>/messages

// Example
https://testnet.mirrornode.hedera.com/api/v1/topics/0.0.123456/messages
*/
