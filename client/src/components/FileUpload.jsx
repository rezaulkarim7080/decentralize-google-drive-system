import { useContext, useState } from "react";
import { WalletContext } from "./../context/wallet";
import { uploadFileToIPFS, uploadJSONToIPFS } from "./pinata";
import { ethers } from "ethers";
import upload from "../../upload.json";

const FileUpload = () => {
  const [fileURL, setFileURL] = useState();
  const [message, updateMessage] = useState("");
  const [btn, setBtn] = useState(false);
  const [btnContent, setBtnContent] = useState("Upload NFT");
  const [targetAddress, setTargetAddress] = useState(""); // For sharing access
  const { isConnected, signer, userAddress } = useContext(WalletContext);

  async function onFileChange(e) {
    try {
      const file = e.target.files[0];
      const data = new FormData();
      data.set("file", file);

      setBtn(false);
      updateMessage("Uploading image... Please don't click anything!");

      const response = await uploadFileToIPFS(data);

      if (response.success === true) {
        setBtn(true);
        updateMessage("");
        setFileURL(response.pinataURL);
      }
    } catch (e) {
      console.log("Error during file upload...", e);
      updateMessage("Error uploading image. Please try again.");
    }
  }

  async function uploadMetadataToIPFS() {
    if (!fileURL) {
      updateMessage("Please fill all the fields!");
      return -1;
    }

    const nftJSON = {
      image: fileURL,
    };

    try {
      const response = await uploadJSONToIPFS(nftJSON);
      if (response.success === true) {
        return response.pinataURL;
      }
    } catch (e) {
      console.error("Error uploading JSON metadata:", e);
      updateMessage("Error uploading metadata.");
      return -1;
    }
  }

  async function listNFT(e) {
    e.preventDefault();
    setBtnContent("Processing...");

    const metadataURL = await uploadMetadataToIPFS();

    if (metadataURL === -1) {
      setBtnContent("Upload NFT");
      return;
    }

    try {
      updateMessage("Uploading NFT...Please don't click anything!");

      if (!signer) {
        throw new Error("Signer is not available");
      }

      const contract = new ethers.Contract(upload.address, upload.abi, signer);
      const transaction = await contract.add(userAddress, metadataURL);
      await transaction.wait();

      setBtnContent("Upload NFT");
      setBtn(false);
      updateMessage("");
      alert("Successfully listed your NFT!");
    } catch (e) {
      console.error("Upload error:", e);
      updateMessage("Error listing NFT. Please try again.");
      setBtnContent("Upload NFT");
    }
  }

  async function shareNFT() {
    if (!targetAddress) {
      updateMessage("Please enter a valid address.");
      return;
    }

    try {
      const contract = new ethers.Contract(upload.address, upload.abi, signer);
      const transaction = await contract.allow(targetAddress);
      await transaction.wait();
      updateMessage(`NFT access shared with ${targetAddress}.`);
    } catch (err) {
      updateMessage("Error sharing NFT access.");
    }
  }

  return (
    <div>
      {isConnected ? (
        <div className="flex items-center mt-10">
          <div className="w-full">
            <div className="bg-white p-10 rounded-lg shadow-md md:w-3/4 mx-auto lg:w-1/2">
              <form onSubmit={listNFT}>
                <div className="mb-5">
                  <label
                    htmlFor="Price"
                    className="block mb-2 font-bold text-gray-600"
                  >
                    Upload NFT
                  </label>
                  <input
                    type="file"
                    name="file"
                    className="border border-gray-300 shadow p-3 w-full rounded"
                    onChange={onFileChange}
                  />
                </div>

                <div className="text-red-500 font-medium text-center mt-2">
                  {message}
                </div>

                <button
                  type="submit"
                  className={`w-full mt-4 text-lg font-bold py-3 px-6 flex items-center justify-center rounded-lg ${
                    btn
                      ? "bg-orange-500 text-white cursor-pointer hover:bg-orange-700"
                      : "bg-gray-400 text-gray-300 cursor-not-allowed opacity-50"
                  }`}
                >
                  {btnContent === "Processing..." && (
                    <span className="spinner inline-block border-4 border-gray-400 border-l-white rounded-full mr-2 w-6 h-6 animate-spin"></span>
                  )}
                  {btnContent}
                </button>
              </form>
            </div>

            <div className="mt-5">
              <input
                className="border border-gray-300 shadow p-3 w-full rounded"
                type="text"
                placeholder="Enter address to share with"
                value={targetAddress}
                onChange={(e) => setTargetAddress(e.target.value)}
              />
              <button
                className="mt-4 bg-emerald-500 text-white font-medium py-4 px-4 rounded-lg hover:shadow-lg hover:bg-emerald-700"
                onClick={shareNFT}
              >
                Share Access
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-xl font-semibold mt-10">
          Connect Your Wallet to Continue...
        </div>
      )}
    </div>
  );
};

export default FileUpload;
