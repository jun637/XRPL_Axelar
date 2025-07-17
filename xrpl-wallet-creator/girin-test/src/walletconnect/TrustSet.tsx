'use client'

import { useState } from 'react'
import { useRequest } from '@walletconnect/modal-sign-react'

interface Props {
  topic: string
  account: string
  tokenCode: string
  issuerAddress: string
}

type TrustSetResponse = unknown;

export function TrustSet({ topic, account, tokenCode, issuerAddress }: Props) {
  const [trustSetResult, setTrustSetResult] = useState<string>()
  const [isTrustSetLoading, setIsTrustSetLoading] = useState(false)

  // useRequest로 TrustSet 트랜잭션 서명 요청
  const { request: trustSetRequest } = useRequest<TrustSetResponse>({
    chainId: 'xrpl:1',
    topic,
    request: {
      method: 'xrpl_signTransaction',
      params: {
        tx_json: {
          TransactionType: 'TrustSet',
          Account: account,
          LimitAmount: {
            currency: tokenCode,
            issuer: issuerAddress,
            value: '100', // 기본 한도
          },
          Flags: 262144, // tfClearNoRipple
        },
      },
    },
  });

  // Girin Wallet에서 TrustSet 트랜잭션 서명 요청
  const onTrustSet = async () => {
    setIsTrustSetLoading(true)
    setTrustSetResult(undefined)
    try {
      const result = await trustSetRequest();
      setTrustSetResult('✅ TrustSet 트랜잭션 서명 요청 완료! 결과: ' + JSON.stringify(result))
    } catch (err: any) {
      setTrustSetResult('❌ 오류: ' + (err?.message || String(err)))
    }
    setIsTrustSetLoading(false)
  }

  return (
    <div style={{ margin: 20 }}>
      {/* Girin Wallet TrustSet 서명 버튼 */}
      <div style={{ padding: 15, background: '#e0f7fa', borderRadius: 8 }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#0288d1' }}>📝 TrustLine 설정</h4>
        <p style={{ margin: '0 0 10px 0', fontSize: 14, color: '#374151' }}>
          Girin Wallet에서 Admin USD에 대한 TrustLine을 설정합니다.<br />
          (한도: 100 USD)
        </p>
        <button
          onClick={onTrustSet}
          disabled={isTrustSetLoading}
          style={{
            padding: '10px 20px',
            fontSize: 16,
            background: '#0288d1',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: isTrustSetLoading ? 'not-allowed' : 'pointer',
            marginBottom: 10,
          }}
        >
          {isTrustSetLoading ? '서명 요청 중...' : 'TrustLine 설정'}
        </button>
        {trustSetResult && (
          <div style={{
            padding: 10,
            background: trustSetResult.includes('✅') ? '#d1fae5' : '#fee2e2',
            border: `1px solid ${trustSetResult.includes('✅') ? '#109814' : '#dc2626'}`,
            borderRadius: 6,
            color: trustSetResult.includes('✅') ? '#109814' : '#dc2626',
            fontSize: 14,
          }}>
            {trustSetResult}
          </div>
        )}
      </div>
      
      <div style={{ fontSize: 14, color: '#6b7280', marginTop: 10 }}>
        <strong>트랜잭션 정보:</strong><br />
        • 토큰: {tokenCode}<br />
        • 발행자: {issuerAddress}<br />
        • Girin 주소: {account}
      </div>
    </div>
  )
} 