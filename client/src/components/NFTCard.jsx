import { useContext, useEffect, useState } from "react";
import { WalletContext } from "../context/wallet";
import upload from "../../upload.json";
import { ethers } from "ethers";

const NFTCard = ({ item }) => {
  const { signer } = useContext(WalletContext);
  const [accessList, setAccessList] = useState([]);

  // Fetch access list for each NFT
  const fetchAccessList = async () => {
    if (!signer) return;

    try {
      const contract = new ethers.Contract(upload.address, upload.abi, signer);
      const access = await contract.shareAccess();
      setAccessList(access); // Save access list for the current NFT
    } catch (error) {
      console.error("Error fetching access list:", error);
    }
  };

  // Fetch access list when the component mounts
  useEffect(() => {
    fetchAccessList();
  }, []);

  return (
    <div className="">
      <img src={item.image} alt="NFT" height={300} width={300} />
      <ul>
        {accessList.length > 0 &&
          accessList.map((access, index) =>
            access.access ? (
              <li key={index}>{access.user}</li>
            ) : (
              <li key={index} style={{ color: "red" }}>
                {access.user} (revoked)
              </li>
            )
          )}
      </ul>
    </div>
  );
};

export default NFTCard;
