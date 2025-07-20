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