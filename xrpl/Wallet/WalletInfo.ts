import dotenv from 'dotenv'
import path from 'path'
import { Client, Wallet } from 'xrpl'

// .env 파일 로드
dotenv.config({ path: path.join(__dirname, '..', '.env') })

export async function WalletInfo() {
  const client = new Client('wss://s.devnet.rippletest.net:51233')
  await client.connect()
  try {
    // 지갑 생성
    const adminSeed = process.env.ADMIN_SEED
    const userSeed = process.env.USER_SEED
    const adminWallet = Wallet.fromSeed(adminSeed!.trim())
    const userWallet = Wallet.fromSeed(userSeed!.trim())

    // XRP 잔액 조회
    const adminBalance = await client.getXrpBalance(adminWallet.address)
    const userBalance = await client.getXrpBalance(userWallet.address)
    // 계정 정보 조회
    const adminAccountInfo = await client.request({
      command: 'account_info',
      account: adminWallet.address
    })
    const userAccountInfo = await client.request({
      command: 'account_info',
      account: userWallet.address
    })
    // TrustLine 조회
    const adminTrustLines = await client.request({
      command: 'account_lines',
      account: adminWallet.address
    })
    const userTrustLines = await client.request({
      command: 'account_lines',
      account: userWallet.address
    })
    // 결과 출력
    console.log('지갑 정보:')
    console.log(
      `Admin: ${adminWallet.address} | Balance: ${adminBalance} XRP | Sequence: ${adminAccountInfo.result.account_data.Sequence} | Flags: ${adminAccountInfo.result.account_data.Flags} | RegularKey: ${adminAccountInfo.result.account_data.RegularKey ?? '없음'}`
    )
    console.log(
      `User: ${userWallet.address} | Balance: ${userBalance} XRP | Sequence: ${userAccountInfo.result.account_data.Sequence} | Flags: ${userAccountInfo.result.account_data.Flags} | RegularKey: ${userAccountInfo.result.account_data.RegularKey ?? '없음'}`
    )
    console.log(
      `TrustLines - Admin: ${adminTrustLines.result.lines.length}, User: ${userTrustLines.result.lines.length}`
    )
  } catch (error) {
    console.error('❌ 지갑 정보 조회 실패:', error)
  } finally {
    await client.disconnect()
    console.log('🔄 연결 종료')
  }
}

if (require.main === module) {
  WalletInfo()
} 