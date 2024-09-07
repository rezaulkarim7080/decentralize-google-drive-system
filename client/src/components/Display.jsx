import { useContext, useEffect, useState } from "react";
import { WalletContext } from "../context/wallet";
import upload from "../../upload.json";
import { ethers } from "ethers";
import axios from "axios";
import NFTCard from "./NFTCard";

const Display = () => {
  const [items, setItems] = useState([]); // NFTs of the connected account
  const [sharedItems, setSharedItems] = useState([]); // NFTs shared with the connected account
  const [sharedAddresses, setSharedAddresses] = useState([]); // Addresses that have access
  const [inputAddress, setInputAddress] = useState(""); // Address to check for shared NFTs
  const { isConnected, userAddress, signer } = useContext(WalletContext);

  // Fetch NFTs owned by the connected account
  async function getNFTitems() {
    if (!signer) return;
    const contract = new ethers.Contract(upload.address, upload.abi, signer);

    try {
      const nftURLs = await contract.display(userAddress);
      const itemsArray = [];
      for (const url of nftURLs) {
        const meta = (await axios.get(url)).data;
        itemsArray.push({ image: meta.image });
      }
      setItems(itemsArray);
    } catch (error) {
      console.error("Error fetching NFTs:", error);
    }
  }

  // Fetch NFTs shared with the connected account
  async function getSharedNFTs() {
    if (!inputAddress || !signer) return;
    const contract = new ethers.Contract(upload.address, upload.abi, signer);

    try {
      const nftURLs = await contract.display(inputAddress);
      const sharedItemsArray = [];
      for (const url of nftURLs) {
        const meta = (await axios.get(url)).data;
        sharedItemsArray.push({ image: meta.image });
      }
      setSharedItems(sharedItemsArray);
    } catch (error) {
      console.error("Error fetching shared NFTs:", error);
    }
  }

  // Fetch the list of addresses the user has shared NFTs with
  async function getSharedAccessList() {
    if (!signer) return;
    const contract = new ethers.Contract(upload.address, upload.abi, signer);

    try {
      const accessList = await contract.shareAccess();
      setSharedAddresses(accessList);
    } catch (error) {
      console.error("Error fetching shared access list:", error);
    }
  }

  // Disallow access for a specific address
  async function disallowAccess(address) {
    if (!signer) return;
    const contract = new ethers.Contract(upload.address, upload.abi, signer);

    try {
      const transaction = await contract.disallow(address);
      await transaction.wait();
      getSharedAccessList(); // Update the shared list after disallowing
    } catch (error) {
      console.error("Error disallowing access:", error);
    }
  }

  useEffect(() => {
    if (isConnected) {
      getNFTitems();
      getSharedAccessList();
    }
  }, [isConnected]);

  return (
    <div>
      {isConnected ? (
        <>
          {/* Show the shared addresses */}
          <h2>Shared NFT Access List</h2>
          <div>
            {sharedAddresses.length > 0 ? (
              sharedAddresses.map((access, index) =>
                access.access ? (
                  <div key={index} className="mb-2">
                    <span>{access.user}</span>
                    <button
                      onClick={() => disallowAccess(access.user)}
                      className="ml-2 text-red-600"
                    >
                      Disallow Access
                    </button>
                  </div>
                ) : null
              )
            ) : (
              <div>No shared addresses.</div>
            )}
          </div>

          {/* Display own NFTs */}
          <h2>Your NFTs</h2>
          {items.length > 0 ? (
            <div>
              {items.map((nft, index) => (
                <NFTCard item={nft} key={index} />
              ))}
            </div>
          ) : (
            <div>You do not own any NFTs.</div>
          )}

          {/* Check NFTs shared by another account */}
          <div>
            <h2>Check NFTs Shared with You</h2>
            <input
              type="text"
              placeholder="Enter address to check shared NFTs"
              value={inputAddress}
              onChange={(e) => setInputAddress(e.target.value)}
              className="border border-gray-300 shadow p-3 w-full rounded mb-4"
            />
            <button
              className="mt-4 bg-emerald-500 text-white font-medium py-4 px-4 rounded-lg hover:shadow-lg hover:bg-emerald-700"
              onClick={getSharedNFTs}
            >
              Get Shared NFTs
            </button>

            {sharedItems.length > 0 ? (
              <div className="flex">
                {sharedItems.map((nft, index) => (
                  <NFTCard item={nft} key={index} />
                ))}
              </div>
            ) : (
              <div>No NFTs shared with this account.</div>
            )}
          </div>
        </>
      ) : (
        <div>Please connect your wallet to view your NFTs.</div>
      )}
    </div>
  );
};

export default Display;
