import {TokenAssociateTransaction} from "@hashgraph/sdk";

async function connectWallet(tokenIds) {
    if (!window.hedera) {
        throw new Error("Hedera wallet extension (e.g., HashPack or Blade) not found. Please install and unlock your wallet.");
    }

    // Request account connection from the wallet (e.g., HashPack/Blade/MetaMask Snap for Hedera)
    const accounts = await window.hedera.request({ method: "hedera_requestAccounts" });
    if (!accounts || accounts.length === 0) {
        throw new Error("No Hedera account found in wallet.");
    }
    const userAccountId = accounts[0];

    // Prepare the associate transaction (using @hashgraph/sdk)
    const associateTx = new TokenAssociateTransaction()
        .setAccountId(userAccountId)
        .setTokenIds(tokenIds);

    // Ask the wallet to sign and submit the transaction
    // (Assumes the wallet supports the 'hedera_signAndSendTransaction' method)
    const txBytes = associateTx.freezeWith(client).toBytes();
    const txResponse = await window.hedera.request({
        method: "hedera_signAndSendTransaction",
        params: {
            accountId: userAccountId,
            transaction: Buffer.from(txBytes).toString("base64")
        }
    });

    if (!txResponse || !txResponse.receipt) {
        throw new Error("Failed to associate tokens: No receipt returned from wallet.");
    }

    // Confirm the transaction was successful
    console.log(`NFT association with user's account: ${txResponse.receipt.status} ✅`);
    return {
        success: txResponse.receipt.status === "SUCCESS",
        status: txResponse.receipt.status,
        accountId: userAccountId
    };
}