import dotenv from "dotenv";
dotenv.config();

import {
  Client,
  TopicCreateTransaction,
  TopicMessageQuery,
  TopicMessageSubmitTransaction,
} from "@hashgraph/sdk";

const operatorId = process.env.OPERATOR_ID;
const operatorKey = process.env.OPERATOR_KEY;

// Build Hedera testnet and mirror node client
const client = Client.forTestnet().setOperator(operatorId, operatorKey);

async function createTopic() {
  const txResponse = await new TopicCreateTransaction().execute(client);
  const receipt = await txResponse.getReceipt(client);
  const topicId = receipt.topicId;
  console.log(`Your topic ID is: ${topicId}`);

  await new Promise((resolve) => setTimeout(resolve, 5000));
  new TopicMessageQuery()
    .setTopicId(topicId)
    .subscribe(client, null, (message) => {
      const messageAsString = Buffer.from(message.contents, "utf8").toString();
      console.log(
        `${message.consensusTimestamp.toDate()} Received: ${messageAsString}`
      );

      client.close();
    });
}

async function submitMessage(topicId, message) {
    // Send message to topic
    const sendResponse = await new TopicMessageSubmitTransaction({
      topicId: topicId,
      message: message,
    }).execute(client);
    const getReceipt = await sendResponse.getReceipt(client);
  
    // Get the status of the transaction
    const transactionStatus = getReceipt.status;
    console.log(
      "The message transaction status: " + transactionStatus.toString()
    );
}  

async function queryTopic(topicId) {
  const url = `https://testnet.mirrornode.hedera.com/api/v1/topics/${topicId}/messages`;
  const response = await fetch(url);
  const data = await response.json();
  console.log(data);
}

async function queryTopicWithSequenceNumber(topicId, sequenceNumber) {
  const url = `https://testnet.mirrornode.hedera.com/api/v1/topics/${topicId}/messages?sequenceNumber=${sequenceNumber}`;
  const response = await fetch(url);
  const data = await response.json();
  console.log(data);
} 

export { queryTopic, submitMessage, createTopic, queryTopicWithSequenceNumber };