'use client'

import { useConnect } from '@walletconnect/modal-sign-react'

export function Connect() {
  const { connect, loading: isConnecting } = useConnect({
    requiredNamespaces: {
      xrpl: {
        chains: ['xrpl:0', 'xrpl:1'],
        methods: ['xrpl_signTransaction'],
        events: ['chainChanged', 'accountsChanged'],
      },
      eip155: {
        chains: ['eip155:7668', 'eip155:7672'],
        methods: ['eth_sendTransaction', 'personal_sign'],
        events: ['chainChanged', 'accountsChanged'],
      },
    },
  })

  // 📡 Girin 주소를 서버로 전송하는 함수
  async function postAddressToServer(address: string) {
    try {
      const res = await fetch('http://localhost:4000/api/set-girin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      })
      const result = await res.text()
      console.log('📡 서버 응답:', result)
    } catch (err) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'message' in err &&
        typeof (err as { message: unknown }).message === 'string'
      ) {
        console.error('❌ 서버 전송 실패:', (err as { message: string }).message)
      } else {
        console.error('❌ 서버 전송 실패:', err)
      }
    }
  }

  // 🪪 연결 버튼 클릭 시
  async function onConnect() {
    try {
      const session = await connect()
      console.info('✅ Wallet 연결 성공!', session)

      const xrplAccounts = session.namespaces.xrpl?.accounts || []

      if (xrplAccounts.length > 0) {
        const fullAddress = xrplAccounts[0] // ex: "xrpl:0:raBC..."
        const classicAddress = fullAddress.split(':').pop() || ''
        console.log('🏦 Girin Wallet 주소:', classicAddress)

        await postAddressToServer(classicAddress)
      } else {
        console.warn('❗ 연결된 XRPL 계정 없음')
      }
    } catch (err) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'message' in err &&
        typeof (err as { message: unknown }).message === 'string'
      ) {
        console.error('❌ Wallet 연결 실패:', (err as { message: string }).message)
      } else {
        console.error('❌ Wallet 연결 실패:', err)
      }
    }
  }

  return (
    <div>
      <button
        onClick={onConnect}
        disabled={isConnecting}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          background: '#4f46e5',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          cursor: isConnecting ? 'not-allowed' : 'pointer',
        }}
      >
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
    </div>
  )
}
