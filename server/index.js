const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const secp = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");

app.use(cors());
app.use(express.json());

// public keys
const balances = {
  "03bf5f70c3459791bea2ed1e87b86219944c2ac69ea88a988837d9d48efcc99794": 100,
  "02a74ba42827676b3418457e5c76929a2aefe27ebe6d049772475a7e2d61285399": 50,
  "030035031b3390f640302dc5bda70ce063c1f44c0783a16748ca74acfc7b5ef94c": 75,
};
const privateKeys = {
  "03bf5f70c3459791bea2ed1e87b86219944c2ac69ea88a988837d9d48efcc99794":
    "8f2da78c5303191ebe2f4900e89cff5d42ef7c6e4a8ec8baa5f62164d9439600",
  "02a74ba42827676b3418457e5c76929a2aefe27ebe6d049772475a7e2d61285399":
    "5d79963910bcba6eb064fced874885fef469a62c50656f0e329e1513605a3118",
  "030035031b3390f640302dc5bda70ce063c1f44c0783a16748ca74acfc7b5ef94c":
    "682c14e864efc661f127e342321416c6876cd44ba56a09a9b94b7ec10e051d61",
};
app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  const privateKey1 = privateKeys[address];
  res.send({ balance, privateKey1 });
});

app.post("/send", (req, res) => {
  const { sender, sig: sigStringed, msg } = req.body;
  const { recipient, amount } = msg;

  // convert stringified bigints back to bigints
  const sig = {
    ...sigStringed,
    r: BigInt(sigStringed.r),
    s: BigInt(sigStringed.s),
  };

  const hashMessage = (message) => keccak256(Uint8Array.from(message));

  const isValid = secp.secp256k1.verify(sig, hashMessage(msg), sender) === true;

  if (!isValid) res.status(400).send({ message: "Bad signature!" });

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
