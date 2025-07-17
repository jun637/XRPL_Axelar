// server.ts : Girin Wallet 연결 후 연결된 지갑 주소를 프론트 -> 백으로 가져오기 위한 API 서버입니다.
import express from 'express'
import cors from 'cors'

const app = express()
const PORT = 4000

// 메모리 저장소로 지갑 주소 관리
let girinAddress: string | null = null

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

app.listen(PORT, () => {
  console.log(`✅ API 서버 실행됨: http://localhost:${PORT}`)
})
