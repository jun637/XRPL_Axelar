import { Client, Wallet, Transaction } from "xrpl"
import path from "path"
import dotenv from "dotenv"
dotenv.config({ path: path.join(__dirname, "..", ".env") })

const toHex = (s: string) => Buffer.from(s, "utf8").toString("hex")//hex 인코딩 함수

export async function createCredential() {

  // 하드코딩(필요 시 바꿔 쓰기)
  const CREDENTIAL_TYPE_HEX = toHex("KYC") // 예: "KYC"
  const CREDENTIAL_URI_HEX  = toHex("https://example.com/credentials/kyc/user")
  const EXPIRATION          = Math.floor(Date.now()/1000) + 3600 // 1시간 뒤

  const client = new Client("wss://s.devnet.rippletest.net:51233")
  await client.connect()
  
  const ADMIN_SEED = process.env.ADMIN_SEED
  const USER_SEED = process.env.USER_SEED
  if (!ADMIN_SEED || !USER_SEED) throw new Error("Missing env: ADMIN_SEED, USER_SEED")
  try {
    const issuer  = Wallet.fromSeed(ADMIN_SEED) // ✅ 서명자 = 발급자
    const subject = Wallet.fromSeed(USER_SEED)

    const tx: Transaction = {
      TransactionType: "CredentialCreate",
      Account: issuer.address,          // ✅ 발급자 서명/전송
      Subject: subject.address,         // 🎯 피발급자
      CredentialType: CREDENTIAL_TYPE_HEX,
      Expiration: EXPIRATION,
      URI: CREDENTIAL_URI_HEX
    }

    const prepared = await client.autofill(tx)
    const signed   = issuer.sign(prepared)       // ✅ 발급자 서명
    const res      = await client.submitAndWait(signed.tx_blob)

    console.log(JSON.stringify(res.result, null, 2))
    return res.result
  } finally {
    await client.disconnect()
  }
}

if (require.main === module) {
  createCredential().catch(e => { console.error(e); process.exit(1) })
}
