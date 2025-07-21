# XRPL ↔ Axelar 크로스체인 전송 시스템

## 목적
XRPL(리플)에서 발행한 스테이블코인(XRP/IOU)을 Axelar Interchain Token Service(ITS)를 통해 이더리움 등 타 블록체인으로 안전하게 전송하는 과정을 실제 코드로 구현하고, 실전 개발에 참고할 수 있도록 문서화합니다.

## 목차
1. [기술 스택](#기술-스택)
2. [전체 흐름](#전체-흐름)
3. [설치 및 환경설정](#설치-및-환경설정)
4. [단계별 핵심 코드 및 설명](#단계별-핵심-코드-및-설명)
    - [XRPL 연결 및 지갑 생성](#xrpl-연결-및-지갑-생성)
    - [계정 활성화(Payment)](#계정-활성화payment)
    - [TrustSet(신뢰설정)](#trustset신뢰설정)
    - [XRP/IOU 전송(Payment)](#xrpiou-전송payment)
    - [크로스체인 전송(Memo)](#크로스체인-전송memo)
5. [참고 자료/공식 문서](#참고-자료공식-문서)
6. [주의사항](#주의사항)
7. [라이선스](#라이선스)

## 기술 스택
- **Blockchain**: XRPL, Ethereum, Axelar
- **Language**: TypeScript
- **Libraries**:
  - [`xrpl`](https://js.xrpl.org/): XRPL 공식 JS/TS 라이브러리
  - [`ethers`](https://docs.ethers.org/): Ethereum 인터페이스
  - [`@axelar-network/axelarjs-sdk`](https://docs.axelar.dev/dev/axelarjs-sdk): Axelar SDK
  - [`@axelar-network/interchain-token-service`](https://docs.axelar.dev/dev/interchain-token-service): ITS 서비스

## 전체 흐름
```
1. Admin이 XRPL에서 User에게 XRP(또는 IOU) 발행
2. User가 Axelar Gateway(multisig)로 Payment + Memo 전송
3. Axelar 네트워크가 Memo 해석, ITS를 통해 타 체인으로 토큰화
4. 목적지 체인(Ethereum 등)에서 User가 토큰 수령
```

## 설치 및 환경설정
```bash
npm install
cp .env.example .env # 환경변수 파일 생성 후 값 입력
```

## 단계별 핵심 코드 및 설명

### XRPL 연결 및 지갑 생성
- [XRPL 공식 문서: JS 라이브러리](https://js.xrpl.org/)
```typescript
import { Client, Wallet } from 'xrpl'
const client = new Client('wss://s.altnet.rippletest.net:51233')
await client.connect()
// 기존 지갑 로드(admin용)
const adminWallet = Wallet.fromSeed('sEdThoRiyqRs7jZaBvYoL2ePXfQc5A6')
// 1. 새 지갑 생성(user)
const newWallet = Wallet.generate()
console.log(`📍 주소: ${newWallet.address}`)
console.log(`🔑 시드: ${newWallet.seed}`)
```

### 계정 활성화(Payment)
- [XRPL 공식 Payment 트랜잭션](https://xrpl.org/payment.html)
```typescript
const fundTx = {
  TransactionType: 'Payment',
  Account: adminWallet.address, // Admin이 펀딩
  Destination: newWallet.address,
  Amount: '20000000', // 20 XRP in drops
  Fee: '12'
}
const prepared = await client.autofill(fundTx)
const signed = adminWallet.sign(prepared)
const result = await client.submitAndWait(signed.tx_blob)
if (result.result.meta?.TransactionResult === 'tesSUCCESS') {
  console.log('✅ 계정 활성화 완료')
}
```

### TrustSet(신뢰설정)
- [XRPL 공식 TrustSet 트랜잭션](https://xrpl.org/trustset.html)
```typescript
const trustSetTx = {
  TransactionType: 'TrustSet',
  Account: userWallet.address,
  LimitAmount: {
    currency: 'USD',
    issuer: 'rGatewayAddress',
    value: '10000'
  },
  Flags: 0,
  Fee: '12'
}
const prepared = await client.autofill(trustSetTx)
const signed = userWallet.sign(prepared)
const result = await client.submitAndWait(signed.tx_blob)
if (result.result.meta?.TransactionResult === 'tesSUCCESS') {
  console.log('✅ TrustLine 설정 완료')
}
```

### XRP/IOU 전송(Payment)
- [XRPL 공식 Payment 트랜잭션](https://xrpl.org/payment.html)
```typescript
// 기존 지갑 로드(user용)
const userWallet = Wallet.fromSeed('sEd7Su6LCR6xaA1aYd3cHrWi6U4nRWg')
// XRP 전송
const paymentTx = {
  TransactionType: 'Payment',
  Account: adminWallet.address,
  Destination: userWallet.address,
  Amount: '10000000', // 10 XRP in drops
  Fee: '12'
}
// IOU 전송
const iouPaymentTx = {
  TransactionType: 'Payment',
  Account: adminWallet.address,
  Destination: userWallet.address,
  Amount: {
    currency: 'USD',
    issuer: 'rGatewayAddress',
    value: '1000'
  },
  Fee: '12'
}
```

### 크로스체인 전송(Memo)
- [Axelar 공식 문서: XRPL ↔ EVM](https://docs.axelar.dev/dev/xrpl)
```json
{
  "TransactionType": "Payment",
  "Account": "user.address",
  "Amount": "1000000",
  "Destination": "multisig.address",
  "Memos": [
    { "Memo": { "MemoType": "74797065", "MemoData": "696e746572636861696e5f7472616e73666572" } },
    { "Memo": { "MemoType": "64657374696e6174696f6e5f61646472657373", "MemoData": "<hex-encoded EVM address>" } },
    { "Memo": { "MemoType": "64657374696E6174696F6E5F636861696E", "MemoData": "<hex-encoded chain name>" } },
    { "Memo": { "MemoType": "6761735f6665655f616d6f756e74", "MemoData": "<hex-encoded gas fee>" } }
  ]
}
```

## 참고 자료/공식 문서
- [XRPL 공식 JS 라이브러리](https://js.xrpl.org/)
- [XRPL Payment 트랜잭션](https://xrpl.org/payment.html)
- [XRPL TrustSet 트랜잭션](https://xrpl.org/trustset.html)
- [Axelar 공식 문서: XRPL ↔ EVM](https://docs.axelar.dev/dev/xrpl)

## 주의사항
- 이 프로젝트는 **테스트넷**용으로 설계되었습니다.
- 실제 자금을 사용하기 전에 충분한 테스트를 진행하세요.
- 개인키는 절대 공개하지 마세요.
- 환경 변수 파일(.env)을 .gitignore에 추가하세요.

## 라이선스
이 프로젝트는 MIT 라이선스 하에 배포됩니다. 
