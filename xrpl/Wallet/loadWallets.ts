import dotenv from 'dotenv'
import path from 'path'
import { Client, Wallet } from 'xrpl'

// xrpl-wallet-creator 폴더의 .env 파일 로드
dotenv.config({ path: path.join(__dirname, '..', '.env') })

export async function loadWallets() {
  const client = new Client('wss://s.devnet.rippletest.net:51233')
  await client.connect()
  try {
    // 1. 환경변수에서 Admin Seed 로드
    console.log('환경변수 확인:', {
      ADMIN_SEED: process.env.ADMIN_SEED,
      USER_SEED: process.env.USER_SEED
    })
    const adminSeed = process.env.ADMIN_SEED
    if (!adminSeed) {
      throw new Error('ADMIN_SEED 환경변수가 설정되지 않았습니다.')
    }
    // 2. Admin 지갑 생성
    const adminWallet = Wallet.fromSeed(adminSeed.trim())
    // 3. User 지갑은 새로 생성
    const userWallet = Wallet.generate()
    await client.fundWallet(userWallet)
    console.log(`Admin: ${adminWallet.address} | Seed: ${adminWallet.seed}`)
    console.log(`User: ${userWallet.address} | Seed: ${userWallet.seed}`)
    console.log(`User PublicKey: ${userWallet.publicKey}`)
    return { admin: adminWallet, user: userWallet }
  } catch (error) {
    console.error('❌ 지갑 로드 실패:', error)
    throw new Error(`지갑 로드 실패: ${error}`)
  } finally {
    await client.disconnect()
    console.log('🔄 연결 종료')
  }
}

if (require.main === module) {
  loadWallets()
} 