# XRPL Axelar 테스트 프로젝트

## 프로젝트 개요

이 프로젝트는 XRPL(XRP Ledger)에서 스테이블코인을 발행하고 관리하며, Girin Wallet과 WalletConnect를 통해 TrustLine(TrustSet) 설정 및 토큰 송금까지 실전 환경과 유사하게 실습할 수 있는 개발 환경입니다.

---

## 프로젝트 구조 및 주요 파일

```
XRPL_Axelar_test/
├── xrpl-wallet-creator/          # 메인 프로젝트 디렉토리 (백엔드/유틸)
│   ├── girin-test/              # Girin Wallet 연결 프론트엔드
│   │   ├── src/
│   │   │   ├── walletconnect/
│   │   │   │   ├── Connect.tsx         # WalletConnect 연결 컴포넌트
│   │   │   │   └── TrustSet.tsx        # TrustLine(TrustSet) 트랜잭션 서명 컴포넌트
│   │   │   └── App.tsx                 # 메인 앱 컴포넌트
│   │   └── ...
│   ├── server.ts                # Express API 서버 (지갑 주소 관리)
│   ├── sendStablecoin.ts        # Admin → Girin Wallet USD 전송 스크립트
│   ├── index.ts                 # Admin XRPL 지갑 생성/복원 스크립트
│   └── ...
└── README.md                    # 이 파일
```

---

## 주요 파일별 역할 및 구조

### 프론트엔드 (girin-test/src)

#### **App.tsx**
- 전체 앱의 진입점. WalletConnect 연결, Girin Wallet 주소 관리, TrustLine 설정 UI 제공.
- **불필요한 Admin 관련 UI/로직은 모두 제거**

#### **Connect.tsx**
- WalletConnect로 Girin Wallet 연결 및 주소 추출, 서버로 전송.

#### **TrustSet.tsx**
- Girin Wallet에서 TrustLine(TrustSet) 트랜잭션을 직접 서명 요청.
- useRequest 훅으로 WalletConnect 세션에 트랜잭션 전송 → Girin Wallet에서 서명 팝업 자동 표시.

### 백엔드 (xrpl-wallet-creator/)

#### **server.ts**
- Express API 서버. Girin Wallet/관리자 주소 관리, TrustLine 승인 등 API 제공.
- **불필요한 TrustLine 승인/Require Auth 관련 API는 제거**

#### **sendStablecoin.ts**
- Admin이 Girin Wallet로 USD 토큰을 전송하는 스크립트. (TrustLine 설정 후 실행)

#### **index.ts**
- Admin XRPL 지갑 생성 및 복원 스크립트. (니모닉 → seed → XRPL 지갑)

---

## 변경/제거/합침 이력

- **TrustSetWithSign.tsx**: TrustSet.tsx에 통합, 파일 삭제
- **checkTrustLines.ts**: 진단용, 필요시만 생성/삭제
- **App.tsx/TrustSet.tsx**: Admin 관련 UI/로직, 불필요 코드 모두 제거
- **server.ts**: TrustLine 승인/Require Auth 관련 API 제거
- **모든 주요 로직은 함수/컴포넌트 단위로 모듈화, 재활용 가능하게 유지**

---

## 주요 파일별 실무용 주석 예시

### App.tsx
```tsx
// App.tsx - XRPL 스테이블코인 TrustLine 설정 메인 컴포넌트
// ... (중략, 실제 파일 참고) ...
```

### Connect.tsx
```tsx
// Connect.tsx - Girin Wallet을 WalletConnect로 연결하는 컴포넌트
// ... (중략, 실제 파일 참고) ...
```

### TrustSet.tsx
```tsx
// TrustSet.tsx - Girin Wallet에서 TrustLine(TrustSet) 트랜잭션을 직접 서명 요청
// ... (중략, 실제 파일 참고) ...
```

### server.ts
```ts
// server.ts - Express API 서버, 지갑 주소 관리 및 TrustLine 승인 등 API 제공
// ... (중략, 실제 파일 참고) ...
```

### sendStablecoin.ts
```ts
// sendStablecoin.ts - Admin에서 Girin Wallet로 USD 토큰 전송 스크립트
// ... (중략, 실제 파일 참고) ...
```

### index.ts
```ts
// index.ts - Admin XRPL 지갑 생성 및 복원 스크립트
// ... (중략, 실제 파일 참고) ...
```

---

## 개발/실행 방법

### 1. 환경 설정

```bash
# .env 파일 생성 (xrpl-wallet-creator 디렉토리에)
ADMIN_MNEMONIC="your 12 or 24 word mnemonic phrase here"
ADMIN_SEED="your admin seed"
VITE_PROJECT_ID="your walletconnect project id"
```

### 2. 의존성 설치

```bash
# 메인 프로젝트 의존성 설치
cd xrpl-wallet-creator
npm install

# Girin Wallet 프론트엔드 의존성 설치
cd girin-test
npm install
```

### 3. 개발 서버 실행

```bash
# API 서버 실행 (포트 4000)
cd xrpl-wallet-creator
npm run dev

# Girin Wallet 프론트엔드 실행 (포트 5173)
cd girin-test
npm run dev
```

### 4. XRPL Admin 지갑 생성 (최초 1회)
```bash
cd xrpl-wallet-creator
node index.ts
```

### 5. TrustLine 설정 및 스테이블코인 전송
1. 브라우저에서 `http://localhost:5173` 접속
2. Girin Wallet 연결 (QR코드)
3. "TrustLine 설정" 버튼 클릭 → Girin Wallet에서 서명
4. TrustLine 설정 후, 아래 명령어로 USD 전송
```bash
cd xrpl-wallet-creator
npx ts-node sendStablecoin.ts
```

---

## 기타 참고/유의사항
- TrustLine 설정이 완료되어야만 USD 전송이 성공합니다.
- 프론트엔드와 백엔드 모두 포트 충돌에 주의하세요.
- 불필요한 파일/코드는 정리되어 있으니, 구조 참고해서 확장/유지보수 하세요.

---

## 문의/기여
- 코드 구조, 모듈화, 확장성 관련 문의는 언제든 환영합니다!
- PR/이슈 등록 시 변경/제거/합침 이력도 꼭 남겨주세요. 