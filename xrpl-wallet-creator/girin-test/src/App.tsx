// src/App.tsx

import { WalletConnectModalSign } from '@walletconnect/modal-sign-react'
import { getAppMetadata } from '@walletconnect/utils'
import { useSession } from '@walletconnect/modal-sign-react'
import { Connect } from './walletconnect/Connect'
import { TrustSet } from './walletconnect/TrustSet'
import { useState, useEffect } from 'react'
const projectId = import.meta.env.VITE_PROJECT_ID!

function App() {
  const session = useSession()
  const [girinAddress, setGirinAddress] = useState<string>()
  const [adminAddress, setAdminAddress] = useState<string>()

  // Admin 지갑 주소 가져오기 (TrustSet에서 issuer로 사용)
  useEffect(() => {
    async function fetchAdminAddress() {
      try {
        const response = await fetch('http://localhost:4000/api/get-admin')
        const data = await response.json()
        setAdminAddress(data.address)
      } catch (err) {
        console.error('Admin 주소 가져오기 실패:', err)
      }
    }
    fetchAdminAddress()
  }, [])

  // Girin 주소 가져오기
  useEffect(() => {
    async function fetchGirinAddress() {
      try {
        const response = await fetch('http://localhost:4000/api/get-girin')
        const data = await response.json()
        setGirinAddress(data.address)
      } catch (err) {
        console.error('Girin 주소 가져오기 실패:', err)
      }
    }
    fetchGirinAddress()
  }, [])

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>XRPL - Girin Wallet 연결</h1>

      {/* QR 모달 연결 */}
      <WalletConnectModalSign
        projectId={projectId}
        metadata={getAppMetadata()}
      />

      {/* 지갑 연결 버튼 */}
      <Connect />

      {/* 연결 상태 표시 */}
      {session && session.topic && (
        <div style={{ 
          marginTop: 20,
          padding: 15,
          background: '#f3f3f3',
          borderRadius: '8px'
        }}>
          <h3>연결된 지갑 정보</h3>
          <p><strong>Girin 주소:</strong> {girinAddress || '연결되지 않음'}</p>
          <p><strong>세션 ID:</strong> {session.topic}</p>
        </div>
      )}

      {/* TrustSet 트랜잭션 */}
      {session && session.topic && girinAddress && adminAddress && (
        <div style={{ marginTop: '20px' }}>
          <h3>TrustLine 설정</h3>
          <TrustSet
            topic={session.topic}
            account={girinAddress}
            tokenCode="USD"
            issuerAddress={adminAddress}
          />
        </div>
      )}
    </div>
  )
}

export default App
