# XRPL ↔ Axelar 크로스체인 전송 시스템

이 프로젝트는 XRPL(리플)과 Ethereum 간의 크로스체인 토큰 전송을 Axelar 네트워크를 통해 구현한 시스템입니다.

## 🚀 주요 기능

- **Admin → User XRP 발행**: 관리자가 사용자에게 XRP 발행
- **User → Axelar Gateway 전송**: 사용자가 Axelar Gateway로 XRP 전송
- **ITS(Interchain Token Service) 토큰화**: XRP를 이더리움 네트워크로 토큰화 전송
- **실시간 전송 상태 모니터링**
- **완전한 전송 검증 및 리포트 생성**

## 📁 프로젝트 구조

```
XRPL_Axelar_test/
├── xrpl-wallet-creator/          # 메인 프로젝트 디렉토리
│   ├── step1_xrpl_connection.ts          # XRPL 연결 및 지갑 로드
│   ├── step2_balance_check.ts            # Admin/User 잔액 확인
│   ├── step3_xrpl_to_axelar.ts           # Admin → User XRP 발행
│   ├── step4_axelar_gateway_processing.ts # User → Axelar Gateway 전송
│   ├── step5_its_cross_chain_transfer.ts # ITS 토큰 등록 확인 및 크로스체인 전송
│   ├── step6_gmp_message_transmission.ts # GMP 메시지 전송
│   ├── step7_its_contract_execution.ts   # ITS 컨트랙트 실행
│   ├── step8_final_verification.ts       # 최종 확인
│   ├── run-complete-transfer.ts          # 전체 실행 스크립트
│   └── README.md                         # 상세 사용법 및 설정 가이드
└── README.md                    # 이 파일
```

## 🎯 빠른 시작

```bash
# 프로젝트 클론
git clone <repository-url>
cd XRPL_Axelar_test/xrpl-wallet-creator

# 의존성 설치
npm install

# 전체 크로스체인 전송 실행
npm run complete-transfer
```

## 📖 상세 가이드

**설치, 설정, 사용법 등 상세한 내용은 [xrpl-wallet-creator/README.md](./xrpl-wallet-creator/README.md)를 참조하세요.**

## 🔧 기술 스택

- **Blockchain**: XRPL, Ethereum, Axelar
- **Language**: TypeScript
- **Libraries**: 
  - `xrpl`: XRPL 클라이언트
  - `ethers`: Ethereum 인터페이스
  - `@axelar-network/axelarjs-sdk`: Axelar SDK
  - `@axelar-network/interchain-token-service`: ITS 서비스

## 💻 XRPL 핵심 코드 예시

### 🔌 XRPL 연결 및 지갑 로드

```typescript
import { Client, Wallet } from 'xrpl'

class XRPLConnection {
  private client: Client
  private adminWallet!: Wallet
  private userWallet!: Wallet

  constructor() {
    // XRPL 클라이언트 초기화
    this.client = new Client('wss://s.altnet.rippletest.net:51233')
  }

  async connect(): Promise<void> {
    console.log('🔌 XRPL 테스트넷에 연결 중...')
    
    // 1. 클라이언트 연결
    await this.client.connect()
    
    // 2. 연결 상태 확인
    const serverInfo = await this.client.request({
      command: 'server_info'
    })
    
    console.log('✅ XRPL 서버 정보:', {
      complete_ledgers: serverInfo.result.info.complete_ledgers,
      server_state: serverInfo.result.info.server_state,
      validated_ledger: serverInfo.result.info.validated_ledger
    })
  }

  async loadWallets(): Promise<void> {
    // 1. 환경변수에서 시드 로드
    const adminSeed = process.env.ADMIN_SEED
    const userSeed = process.env.USER_SEED
    
    // 2. 지갑 생성 및 검증
    this.adminWallet = Wallet.fromSeed(adminSeed!)
    this.userWallet = Wallet.fromSeed(userSeed!)
    
    // 3. 지갑 주소 유효성 검사
    const adminAddress = this.adminWallet.address
    const userAddress = this.userWallet.address
    
    if (!adminAddress.startsWith('r') || !userAddress.startsWith('r')) {
      throw new Error('잘못된 XRPL 주소 형식입니다')
    }
  }
}
```

### 🆕 새 지갑 생성 및 계정 활성화

```typescript
async createNewWallet(): Promise<{wallet: Wallet, address: string, seed: string}> {
  // 1. 새 지갑 생성
  const newWallet = Wallet.generate()
  console.log(`📍 주소: ${newWallet.address}`)
  console.log(`🔑 시드: ${newWallet.seed}`)
  
  // 2. 계정 활성화 (20 XRP 펀딩)
  const fundTx = {
    TransactionType: 'Payment',
    Account: this.adminWallet.address, // Admin이 펀딩
    Destination: newWallet.address,
    Amount: '20000000', // 20 XRP in drops
    Fee: '12'
  }
  
  const prepared = await this.client.autofill(fundTx)
  const signed = this.adminWallet.sign(prepared)
  const result = await this.client.submitAndWait(signed.tx_blob)
  
  if (result.result.meta?.TransactionResult === 'tesSUCCESS') {
    console.log('✅ 계정 활성화 완료')
  }
  
  return {
    wallet: newWallet,
    address: newWallet.address,
    seed: newWallet.seed!
  }
}
```

### ⚙️ 계정 설정 트랜잭션

```typescript
async configureAccount(wallet: Wallet): Promise<void> {
  // 1. AccountSet 트랜잭션 (계정 속성 설정)
  const accountSetTx = {
    TransactionType: 'AccountSet',
    Account: wallet.address,
    Domain: '736F6D65646F6D61696E2E636F6D', // hex("somedomain.com")
    EmailHash: 'F939A06C3C4B3C4B3C4B3C4B3C4B3C4B3C4B3C4B', // 이메일 해시
    MessageKey: '03AB40A0490F9B7ED8DF29D246BF2D6269820A0EE7742ACDD457BEA7C7D0931EDB', // 메시지 키
    TransferRate: 0, // 전송 수수료율 (0 = 수수료 없음)
    TickSize: 5, // 가격 틱 크기
    Fee: '12'
  }
  
  const prepared = await this.client.autofill(accountSetTx)
  const signed = wallet.sign(prepared)
  const result = await this.client.submitAndWait(signed.tx_blob)
  
  if (result.result.meta?.TransactionResult === 'tesSUCCESS') {
    console.log('✅ AccountSet 설정 완료')
  }
}
```

### 🔐 멀티서명 설정

```typescript
async setupMultiSign(wallet: Wallet, signerAccounts: string[]): Promise<void> {
  // 1. SignerListSet 트랜잭션
  const signerListTx = {
    TransactionType: 'SignerListSet',
    Account: wallet.address,
    SignerQuorum: 2, // 서명자 중 2명이 서명해야 함
    SignerEntries: signerAccounts.map((account, index) => ({
      SignerEntry: {
        Account: account,
        SignerWeight: 1
      }
    })),
    Fee: '12'
  }
  
  const prepared = await this.client.autofill(signerListTx)
  const signed = wallet.sign(prepared)
  const result = await this.client.submitAndWait(signed.tx_blob)
  
  if (result.result.meta?.TransactionResult === 'tesSUCCESS') {
    console.log('✅ 멀티서명 설정 완료')
    console.log(`👥 서명자: ${signerAccounts.join(', ')}`)
    console.log(`📊 필요 서명 수: 2`)
  }
}
```

### 🧹 계정 삭제

```typescript
async deleteAccount(wallet: Wallet, destinationAddress: string): Promise<void> {
  // AccountDelete 트랜잭션 (XRP 2.0+)
  const deleteTx = {
    TransactionType: 'AccountDelete',
    Account: wallet.address,
    Destination: destinationAddress, // 남은 XRP를 받을 주소
    Fee: '5000000' // 5 XRP (계정 삭제 수수료)
  }
  
  const prepared = await this.client.autofill(deleteTx)
  const signed = wallet.sign(prepared)
  const result = await this.client.submitAndWait(signed.tx_blob)
  
  if (result.result.meta?.TransactionResult === 'tesSUCCESS') {
    console.log('✅ 계정 삭제 완료')
    console.log(`💰 남은 XRP가 ${destinationAddress}로 전송됨`)
  }
}
```

## 🔄 전송 흐름

```
Admin 지갑 → User 지갑 (XRP 발행)
     ↓
User 지갑 → Axelar Gateway (크로스체인 전송)
     ↓
Axelar Gateway → ITS (토큰화)
     ↓
ITS → Ethereum (토큰화된 XRP 전달)
```

## 🚨 주의사항

- 이 프로젝트는 **테스트넷**용으로 설계되었습니다
- 실제 자금을 사용하기 전에 충분한 테스트를 진행하세요
- 개인키는 절대 공개하지 마세요

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

---

**⚠️**: 이 프로젝트는 테스트 목적으로 제작되었습니다. 