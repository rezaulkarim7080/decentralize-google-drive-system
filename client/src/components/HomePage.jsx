import FileUpload from "./FileUpload";
import Display from "./Display";
import { useContext } from "react";
import { WalletContext } from "../context/wallet";

const HomePage = () => {
  const { isConnected, userAddress } = useContext(WalletContext);

  /////
  ///
  //
  return (
    <div className="text-center h-screen">
      {/* //// account informations  //// */}
      <div>
        <h1 className="text-xl mt-5">Account :{userAddress}</h1>
      </div>
      {/* ////END account informations  //// */}
      <FileUpload />

      <Display />
    </div>
  );
};

export default HomePage;
