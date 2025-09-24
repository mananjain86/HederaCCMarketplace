import dotenv from "dotenv";
dotenv.config();

import {
  Client,
  AccountId,
  PrivateKey,
  TopicCreateTransaction,
  TopicMessageQuery,
  TopicMessageSubmitTransaction,
  TopicId,
} from "@hashgraph/sdk";

function parsePrivateKey(str) {
  try {
    return PrivateKey.fromStringECDSA(str);
  } catch {
    return PrivateKey.fromStringED25519(str);
  }
}

const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
const operatorKey = parsePrivateKey(process.env.OPERATOR_KEY);

// Build Hedera testnet and mirror node client
const client = Client.forTestnet().setOperator(operatorId, operatorKey);

// async function createTopic() {
//   try {
//     console.log("Creating topic...");
//     const txResponse = await new TopicCreateTransaction().execute(client);
//     const receipt = await txResponse.getReceipt(client);
//     const topicId = receipt.topicId;
//     console.log(`Your topic ID is: ${topicId}`);
    
//     // Return the topic ID as string - THIS WAS MISSING
//     return topicId.toString();
//   } catch (error) {
//     console.error("Error creating topic:", error);
//     throw error;
//   }
// }

async function submitMessage(topicId, message) {
  try {
    console.log(`Submitting message to topic ${topicId}: ${message}`);
    
    // Convert string to TopicId object if needed
    const topicIdObj = typeof topicId === 'string' ? TopicId.fromString(topicId) : topicId;
    
    // Send message to topic
    const sendResponse = await new TopicMessageSubmitTransaction()
      .setTopicId(topicIdObj)
      .setMessage(message)
      .execute(client);
      
    const getReceipt = await sendResponse.getReceipt(client);
  
    // Get the status of the transaction
    const transactionStatus = getReceipt.status;
    console.log("The message transaction status: " + transactionStatus.toString());
    
    return { success: true, status: transactionStatus.toString() };
  } catch (error) {
    console.error("Error submitting message:", error);
    throw error;
  }
}  

async function queryTopic(topicId) {
  try {
    // Add delay to ensure messages are available on mirror node
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const url = `https://testnet.mirrornode.hedera.com/api/v1/topics/${topicId}/messages`;
    console.log(`Querying topic: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Topic messages:", data);
    return data;
  } catch (error) {
    console.error("Error querying topic:", error);
    throw error;
  }
}

async function queryTopicWithSequenceNumber(topicId, sequenceNumber) {
  try {
    const url = `https://testnet.mirrornode.hedera.com/api/v1/topics/${topicId}/messages/${sequenceNumber}`;
    console.log(`Querying topic message: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Topic message by sequence:", data);
    return data;
  } catch (error) {
    console.error("Error querying topic with sequence number:", error);
    throw error;
  }
} 

// Optional: Subscribe to topic messages (for real-time listening)
async function subscribeToTopic(topicId, callback) {
  try {
    const topicIdObj = typeof topicId === 'string' ? TopicId.fromString(topicId) : topicId;
    
    new TopicMessageQuery()
      .setTopicId(topicIdObj)
      .setStartTime(0) // Start from beginning
      .subscribe(
        client,
        (error) => {
          console.error("Subscription error:", error);
        },
        (message) => {
          const messageAsString = Buffer.from(message.contents, "utf8").toString();
          console.log(`${message.consensusTimestamp.toDate()} Received: ${messageAsString}`);
          if (callback) callback(messageAsString, message);
        }
      );
  } catch (error) {
    console.error("Error subscribing to topic:", error);
    throw error;
  }
}

export { 
  queryTopic, 
  submitMessage, 
  createTopic, 
  queryTopicWithSequenceNumber,
  subscribeToTopic 
};