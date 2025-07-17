// sendStablecoin.ts - Admin에서 Girin Wallet으로 스테이블코인 발행

import dotenv from 'dotenv'
dotenv.config()

import { Client, Wallet, Payment } from 'xrpl'
import axios from 'axios'

// 트랜잭션 재시도 함수
async function submitWithRetry(client: Client, signedTx: any, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 트랜잭션 제출 시도 ${attempt}/${maxRetries}...`)
      const result = await client.submitAndWait(signedTx.tx_blob)
      return result
    } catch (error: any) {
      if (error.message.includes('LastLedgerSequence') && attempt < maxRetries) {
        console.log('⏳ LastLedgerSequence 오류, 재시도 중...')
        await new Promise(resolve => setTimeout(resolve, 2000)) // 2초 대기
        continue
      }
      throw error
    }
  }
}

async function main() {
  const client = new Client('wss://s.altnet.rippletest.net:51233')
  await client.connect()

  const adminWallet = Wallet.fromSeed(process.env.ADMIN_SEED!)
  const tokenCode = 'USD'  // 하드코딩
  const tokenAmount = '20' // 하드코딩

  try {
    // 1. Girin 주소 요청
    const { data } = await axios.get('http://localhost:4000/api/get-girin')
    const girinAddress = data.address
    if (!girinAddress) throw new Error('❌ Girin 주소가 설정되지 않았습니다.')

    console.log('📬 Girin 주소:', girinAddress)
    console.log('💰 전송할 토큰:', `${tokenAmount} ${tokenCode}`)

    // 2. Admin이 Girin Wallet으로 USD 토큰 전송
    const tokenPaymentTx: Payment = {
      TransactionType: 'Payment',
      Account: adminWallet.address,
      Destination: girinAddress,
      Amount: {
        currency: tokenCode,
        issuer: adminWallet.address,
        value: tokenAmount
      }
    }

    console.log('🚀 Girin Wallet으로 스테이블코인 전송 시작...')
    console.log('📝 트랜잭션 정보:')
    console.log('  - 수신자:', girinAddress)
    console.log('  - 토큰:', tokenCode)
    console.log('  - 수량:', tokenAmount)

    const prepared = await client.autofill(tokenPaymentTx)
    const signed = adminWallet.sign(prepared)
    const result = await submitWithRetry(client, signed)

    console.log('✅ 스테이블코인 전송 완료!')
    console.log('📊 전송 트랜잭션 해시:', result?.result?.hash || '알 수 없음')

    // 3. Girin Wallet 잔액 확인
    console.log('🔍 Girin Wallet 잔액 확인 중...')
    const girinAccountInfo = await client.request({
      command: 'account_lines',
      account: girinAddress,
      ledger_index: 'validated'
    })

    const usdBalance = girinAccountInfo.result.lines.find(
      (line: any) => line.currency === tokenCode && line.account === adminWallet.address
    )

    if (usdBalance) {
      console.log('💰 Girin Wallet USD 잔액:', usdBalance.balance, tokenCode)
    } else {
      console.log('⚠️ Girin Wallet에 USD 잔액이 없습니다.')
    }

    console.log('🎉 스테이블코인 전송이 성공적으로 완료되었습니다!')
    console.log('📋 다음 단계: Girin Wallet에서 Axelar로 전송 준비 완료')

  } catch (error) {
    console.error('❌ 스테이블코인 전송 실패:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('tecPATH_DRY')) {
        console.error('💡 해결 방법: TrustLine이 설정되지 않았거나 유동성이 부족합니다.')
      } else if (error.message.includes('tecNO_LINE')) {
        console.error('💡 해결 방법: TrustLine이 설정되지 않았습니다. Admin TrustLine 승인을 먼저 해주세요.')
      } else if (error.message.includes('tecPATH_PARTIAL')) {
        console.error('💡 해결 방법: 유동성이 부족합니다. 더 작은 금액으로 시도해보세요.')
      } else if (error.message.includes('LastLedgerSequence')) {
        console.error('💡 해결 방법: 네트워크 지연으로 인한 오류입니다. 다시 시도해주세요.')
      }
    }
  } finally {
    await client.disconnect()
  }
}

// 환경변수 확인
console.log('🔧 환경 설정:')
console.log('  - ADMIN_SEED:', process.env.ADMIN_SEED ? '설정됨' : '❌ 설정되지 않음')

if (!process.env.ADMIN_SEED) {
  console.error('❌ .env 파일에 ADMIN_SEED가 설정되지 않았습니다.')
  process.exit(1)
}

main().catch(console.error)
