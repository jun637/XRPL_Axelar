import { Client } from "xrpl"

async function inspectDomain() {
  const client = new Client("wss://s.devnet.rippletest.net:51233")
  await client.connect()
  const DOMAIN_ID = "5771BD9BD9B9BC01816103C9E435E54630AFF83B607DC9BCB0005D249857677D"
  const r = await client.request({ command: "ledger_entry", index: DOMAIN_ID })
  console.log(JSON.stringify(r, null, 2))
  await client.disconnect()
}
inspectDomain().catch(console.error)