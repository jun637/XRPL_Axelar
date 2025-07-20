# XRPL ↔ Axelar 크로스체인 전송 시스템

이 프로젝트는 XRPL(리플)과 Ethereum 간의 크로스체인 토큰 전송을 Axelar 네트워크를 통해 구현한 시스템입니다.

## 🚀 주요 기능

- **Admin → User XRP 발행**: 관리자가 사용자에게 XRP 발행
- **User → Axelar Gateway 전송**: 사용자가 Axelar Gateway로 XRP 전송
- **ITS(Interchain Token Service) 토큰화**: XRP를 이더리움 네트워크로 토큰화 전송
- **실시간 전송 상태 모니터링**
- **완전한 전송 검증 및 리포트 생성**

## 📋 시스템 요구사항

- Node.js 18.0 이상
- TypeScript 5.0 이상
- npm 또는 yarn

## 🛠️ 설치 및 설정

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 다음 정보를 설정하세요:

```env
# XRPL 설정
XRPL_TESTNET_URL=wss://s.altnet.rippletest.net:51233
XRPL_MAINNET_URL=wss://xrplcluster.com

# Ethereum 설정
ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
ETHEREUM_PRIVATE_KEY=your_private_key

# Axelar 설정
AXELAR_RPC_URL=https://axelar-testnet-rpc.axelar-dev.workers.dev
AXELAR_CHAIN_ID=axelar-testnet

# ITS 컨트랙트 주소
ITS_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890

# API 키들
INFURA_API_KEY=your_infura_key
ALCHEMY_API_KEY=your_alchemy_key
```

## 🎯 사용법

### 전체 크로스체인 전송 실행

모든 단계를 순차적으로 실행하려면:

```bash
npm run complete-transfer
```

### 개별 단계 실행

특정 단계만 실행하려면:

```bash
# Step 1: XRPL 연결
npm run step1

# Step 2: 잔액 확인
npm run step2

# Step 3: Admin → User XRP 발행
npm run step3

# Step 4: User → Axelar Gateway 전송
npm run step4

# Step 5: ITS 토큰 등록 확인 및 크로스체인 전송
npm run step5

# Step 6: GMP 메시지 전송
npm run step6

# Step 7: ITS 컨트랙트 실행
npm run step7

# Step 8: 최종 확인
npm run step8
```

## 📁 프로젝트 구조

```
xrpl-wallet-creator/
├── step1_xrpl_connection.ts          # XRPL 연결 및 지갑 로드
├── step2_balance_check.ts            # Admin/User 잔액 확인
├── step3_xrpl_to_axelar.ts           # Admin → User XRP 발행
├── step4_axelar_gateway_processing.ts # User → Axelar Gateway 전송
├── step5_its_cross_chain_transfer.ts # ITS 토큰 등록 확인 및 크로스체인 전송
├── step6_gmp_message_transmission.ts # GMP 메시지 전송
├── step7_its_contract_execution.ts   # ITS 컨트랙트 실행
├── step8_final_verification.ts       # 최종 확인
├── run-complete-transfer.ts          # 전체 실행 스크립트
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 기술 스택

- **Blockchain**: XRPL, Ethereum, Axelar
- **Language**: TypeScript
- **Libraries**: 
  - `xrpl`: XRPL 클라이언트
  - `ethers`: Ethereum 인터페이스
  - `@axelar-network/axelarjs-sdk`: Axelar SDK
  - `@axelar-network/interchain-token-service`: ITS 서비스

## 📊 전송 과정

1. **XRPL 연결**: XRPL 테스트넷에 연결하고 Admin/User 지갑 로드
2. **잔액 확인**: Admin과 User 계정의 XRP 잔액 확인
3. **Admin → User XRP 발행**: 관리자가 사용자에게 XRP 전송
4. **User → Axelar Gateway 전송**: 사용자가 Axelar Gateway로 XRP 전송 (크로스체인 정보 포함)
5. **ITS 토큰 등록 확인 및 크로스체인 전송**: ITS에서 XRP 토큰 등록 상태 확인 후 크로스체인 전송
6. **GMP 메시지 전송**: General Message Passing 메시지 전송
7. **ITS 컨트랙트 실행**: 목적지 체인에서 ITS 컨트랙트 실행
8. **최종 확인**: 전체 전송 과정 검증 및 완료

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
- 환경 변수 파일(.env)을 .gitignore에 추가하세요

## 🐛 문제 해결

### 일반적인 오류

1. **TypeScript 컴파일 오류**
   ```bash
   npm install @types/node
   ```

2. **XRPL 연결 실패**
   - 네트워크 연결 확인
   - XRPL 테스트넷 상태 확인

3. **Ethereum RPC 오류**
   - Infura/Alchemy API 키 확인
   - 네트워크 설정 확인

### 로그 확인

각 단계별로 상세한 로그가 출력됩니다. 오류 발생 시 해당 단계의 로그를 확인하세요.

## 📞 지원

문제가 발생하거나 질문이 있으시면:

1. GitHub Issues에 문제를 등록하세요
2. 로그 파일을 첨부해주세요
3. 사용한 명령어와 환경 정보를 포함해주세요

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

---

**⚠️**: 이 프로젝트는 테스트 목적으로 제작되었습니다. 