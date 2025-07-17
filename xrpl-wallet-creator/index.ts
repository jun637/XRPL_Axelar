import dotenv from 'dotenv';
dotenv.config();

import { Client, Wallet } from 'xrpl';
import * as bip39 from 'bip39';
import { derivePath } from 'ed25519-hd-key';

export async function createAdminWallet() {
  const client = new Client('wss://s.altnet.rippletest.net:51233');
  await client.connect();

  // ✅ 1. 고정된 니모닉 사용 (.env에서 불러오기)
  const mnemonic = process.env.ADMIN_MNEMONIC;
  if (!mnemonic) {
    throw new Error('❌ .env 파일에 ADMIN_MNEMONIC이 설정되어 있지 않습니다.');
  }
  console.log('🧠 Mnemonic:', mnemonic);

  // ✅ 2. 니모닉 → seed
  const seed = await bip39.mnemonicToSeed(mnemonic);

  // ✅ 3. XRPL용 BIP44 경로 → 키 도출
  const path = "m/44'/144'/0'";
  const { key } = derivePath(path, seed.toString('hex'));

  // ✅ 4. XRPL 지갑 복원
  const wallet = Wallet.fromEntropy(key);
  console.log('✅ Admin Wallet 복원 완료');
  console.log('Address:', wallet.classicAddress);
  console.log('Seed:', wallet.seed);

  // (선택) XRP 지급: 이미 존재하는 지갑이면 생략해도 됨
  const fundResult = await client.fundWallet(wallet);
  console.log('Balance:', fundResult.balance);

  await client.disconnect();
  return wallet;
}

createAdminWallet();
