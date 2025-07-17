// src/App.tsx

import { WalletConnectModalSign } from '@walletconnect/modal-sign-react'
import { getAppMetadata } from '@walletconnect/utils'
import { Connect } from './walletconnect/Connect'

const projectId = import.meta.env.VITE_PROJECT_ID!

function App() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Girin Wallet 연결 테스트</h1>

      {/* QR 모달 연결 */}
      <WalletConnectModalSign
        projectId={projectId}
        metadata={getAppMetadata()}
      />

      {/* 지갑 연결 버튼 */}
      <Connect />
    </div>
  )
}

export default App
