import dotenv from 'dotenv'
import path from 'path'
import { Client, Wallet } from 'xrpl'

dotenv.config({ path: path.join(__dirname, '..', '.env') })

export async function Faucet() {
  const client = new Client('wss://s.devnet.rippletest.net:51233')
  await client.connect()
  try {
    // 시드로 지갑 불러오기
    const newWalletSeed = process.env.USER2_SEED
    if (!newWalletSeed) {
      throw new Error('WALLET_SEED 환경변수가 설정되지 않았습니다.')
    }
    const newWallet = Wallet.fromSeed(newWalletSeed.trim())
    // 펀딩
    const fundedWallet = await client.fundWallet(newWallet)
    console.log(` ${fundedWallet.wallet.address} 계정 활성화 완료`)
  } catch (error) {
    console.error('❌ 계정 활성화 실패:', error)
  } finally {
    await client.disconnect()
    console.log('🔄 연결 종료')
  }
}

if (require.main === module) {
  Faucet()
}