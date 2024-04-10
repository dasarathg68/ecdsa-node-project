import server from "./server";
import * as secp from "ethereum-cryptography/secp256k1";
import { toHex } from "ethereum-cryptography/utils";

/*
  send tx, a signed tx, to server, then server recovers pub key from
  that sig, and only goes through if that public key has those funds
*/

function Wallet({
  address,
  setAddress,
  balance,
  setBalance,
  privateKey,
  setPrivateKey,
}) {
  async function onChange(evt) {
    const privateKey1 = evt.target.value;
    setPrivateKey(privateKey1);
    const address = toHex(
      secp.secp256k1.getPublicKey(BigInt("0x" + privateKey1))
    );
    setAddress(address);
    if (address) {
      const {
        data: { balance, privateKey1 },
      } = await server.get(`balance/${address}`);
      setBalance(balance);
      setPrivateKey(privateKey1);

      console.log(privateKey1);
    } else {
      setBalance(0);
    }
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        Private Key
        <input
          placeholder="Type private key"
          value={privateKey}
          onChange={onChange}
        ></input>
      </label>

      <div>Address: {address.slice(0, 10) + "..."}</div>

      <div className="balance">Balance: {balance}</div>
    </div>
  );
}

export default Wallet;
