"use client";

import { createContext, useEffect, useState } from "react";
import { BrowserProvider } from "ethers";

export const WalletContext = createContext();

export const WalletContextProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState(null);
  const [signer, setSigner] = useState(null);

  //////////////
  /////////////
  useEffect(() => {
    const savedAddress = window.localStorage.getItem("userAddress");
    if (savedAddress) {
      setIsConnected(true);
      setUserAddress(savedAddress);

      const reconnectWallet = async () => {
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        setSigner(signer);
      };
      reconnectWallet();
    }

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setUserAddress(accounts[0]);
          window.localStorage.setItem("userAddress", accounts[0]);
        }
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", () => {});
      }
    };
  }, []);

  /////////////////////////// CONNECT WALLET ////////////////

  const connectWalltet = async () => {
    if (!window.ethereum) {
      throw new Error("Metamask is not installed");
    }

    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      setSigner(signer);

      const accounts = await provider.send("eth_requestAccounts", []);
      setIsConnected(true);
      setUserAddress(accounts[0]);

      // Save the connected address in localStorage
      window.localStorage.setItem("userAddress", accounts[0]);

      const network = await provider.getNetwork();
      const chainId = network.chainId;
      const sepoliaNetworkId = "11155111";

      if (chainId != sepoliaNetworkId) {
        alert("Please switch your Metamask to sepolia network");
        return;
      }
    } catch (error) {
      console.log(error);
    }
  };

  /////

  const disconnectWallet = async () => {
    setIsConnected(false);
    setUserAddress(null);
    setSigner(null); // Clears signer on disconnect
    window.localStorage.removeItem("userAddress");
  };

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        setIsConnected,
        userAddress,
        setUserAddress,
        signer, // Ensures signer is passed down
        setSigner,
        connectWalltet,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
