// server.ts : Girin Wallet 연결 후 연결된 지갑 주소를 프론트 -> 백으로 가져오기 위한 API 서버입니다.
import express from 'express'
import cors from 'cors'
import { Wallet } from 'xrpl'
import dotenv from 'dotenv'
import { Client } from 'xrpl'

dotenv.config()

const app = express()
const PORT = 4000

// 메모리 저장소로 지갑 주소 관리
let girinAddress: string | null = null

// Admin 지갑 생성
const adminWallet = Wallet.fromSeed(process.env.ADMIN_SEED!)

app.use(cors())
app.use(express.json())

// POST /api/set-girin
app.post('/api/set-girin', (req, res) => {
  const { address } = req.body
  if (!address) return res.status(400).send('Address is required')

  girinAddress = address
  console.log('📩 Girin Wallet 주소 저장됨:', address)
  res.send('OK')
})

// GET /api/get-girin
app.get('/api/get-girin', (req, res) => {
  res.json({ address: girinAddress })
})

// GET /api/get-admin
app.get('/api/get-admin', (req, res) => {
  res.json({ address: adminWallet.address })
})

// GET /api/check-admin-auth
app.get('/api/check-admin-auth', async (req, res) => {
  try {
    const client = new Client('wss://s.altnet.rippletest.net:51233')
    await client.connect()

    const accountInfo = await client.request({
      command: 'account_info',
      account: adminWallet.address,
      ledger_index: 'validated'
    })

    await client.disconnect()

    const flags = accountInfo.result.account_data.Flags
    const requireAuth = (flags & 0x00020000) !== 0 // lsfRequireAuth flag (131072)
    
    // 실제로는 lsfDisableMaster가 설정되어 있으면 Require Auth가 활성화된 것으로 간주
    const disableMaster = (flags & 0x00040000) !== 0 // lsfDisableMaster flag (262144)
    const actualRequireAuth = requireAuth || disableMaster
    
    // 디버깅을 위한 플래그 정보 추가
    console.log('🔍 Admin 계정 플래그 분석:')
    console.log('  - 전체 플래그:', flags)
    console.log('  - 16진수:', flags.toString(16))
    console.log('  - lsfRequireAuth (0x00020000):', (flags & 0x00020000) !== 0)
    console.log('  - lsfDisableMaster (0x00100000):', (flags & 0x00100000) !== 0)
    console.log('  - lsfDisableMaster (0x00040000):', (flags & 0x00040000) !== 0) // 262144
    console.log('  - lsfGlobalFreeze (0x00400000):', (flags & 0x00400000) !== 0)
    console.log('  - lsfNoFreeze (0x00200000):', (flags & 0x00200000) !== 0)

    res.json({
      address: adminWallet.address,
      flags: flags,
      requireAuth: actualRequireAuth,
      message: actualRequireAuth ? 'Require Auth가 활성화되어 있습니다.' : 'Require Auth가 비활성화되어 있습니다.'
    })

  } catch (error) {
    console.error('Admin 계정 정보 조회 실패:', error)
    res.status(500).json({ error: 'Admin 계정 정보 조회 실패' })
  }
})

// POST /api/enable-require-auth
app.post('/api/enable-require-auth', async (req, res) => {
  try {
    const client = new Client('wss://s.altnet.rippletest.net:51233')
    await client.connect()

    // Require Auth를 활성화하는 AccountSet 트랜잭션
    const accountSetTx: any = {
      TransactionType: 'AccountSet',
      Account: adminWallet.address,
      SetFlag: 2 // asfRequireAuth 플래그 (2)
    }

    const prepared = await client.autofill(accountSetTx)
    const signed = adminWallet.sign(prepared)
    const result = await client.submitAndWait(signed.tx_blob)
    
    await client.disconnect()
    
    console.log('✅ Require Auth 활성화 완료:', result)
    res.json({ 
      success: true, 
      result: result,
      message: 'Admin 계정에서 Require Auth가 활성화되었습니다.'
    })
    
  } catch (error) {
    console.error('❌ Require Auth 활성화 실패:', error)
    res.status(500).json({ 
      error: 'Require Auth 활성화 실패',
      details: error instanceof Error ? error.message : String(error)
    })
  }
})

// POST /api/authorize-trustline
app.post('/api/authorize-trustline', async (req, res) => {
  try {
    const { girinAddress, tokenCode = 'USD' } = req.body
    
    if (!girinAddress) return res.status(400).json({ error: 'Girin address is required' })

    const client = new Client('wss://s.altnet.rippletest.net:51233')
    await client.connect()

    // Admin이 Girin Wallet의 TrustLine을 승인하는 TrustSet 트랜잭션
    const trustSetTx: any = {
      TransactionType: 'TrustSet',
      Account: adminWallet.address,
      LimitAmount: {
        currency: tokenCode,
        issuer: girinAddress, // Girin Wallet을 issuer로 설정
        value: '0' // 승인만 하고 한도는 0으로 설정
      },
      Flags: 65536 // tfSetfAuth 플래그 (승인 플래그)
    }

    const prepared = await client.autofill(trustSetTx)
    const signed = adminWallet.sign(prepared)
    const result = await client.submitAndWait(signed.tx_blob)
    
    await client.disconnect()
    
    console.log('✅ TrustLine 승인 완료:', result)
    res.json({ 
      success: true, 
      result: result,
      message: 'Girin Wallet의 TrustLine이 승인되었습니다.'
    })
    
  } catch (error) {
    console.error('❌ TrustLine 승인 실패:', error)
    res.status(500).json({ 
      error: 'TrustLine 승인 실패',
      details: error instanceof Error ? error.message : String(error)
    })
  }
})

app.listen(PORT, () => {
  console.log(`✅ API 서버 실행됨: http://localhost:${PORT}`)
  console.log(`🏦 Admin 지갑 주소: ${adminWallet.address}`)
})
