# XRPL Axelar 테스트 프로젝트

## 프로젝트 개요

이 프로젝트는 XRPL(XRP Ledger)에서 스테이블코인을 발행하고 관리하기 위한 개발 환경입니다. Admin 지갑 생성과 Girin Wallet 연결 기능을 포함합니다.

## 프로젝트 구조

```
XRPL_Axelar_test/
├── xrpl-wallet-creator/          # 메인 프로젝트 디렉토리
│   ├── girin-test/              # Girin Wallet 연결 프론트엔드
│   │   ├── src/
│   │   │   ├── lib/
│   │   │   │   └── network.ts   # 네트워크 설정 유틸리티
│   │   │   ├── walletconnect/   # WalletConnect 관련 컴포넌트
│   │   │   └── App.tsx          # 메인 앱 컴포넌트
│   │   └── package.json
│   ├── server.ts                # Express API 서버 (지갑 주소 관리)
│   ├── index.ts                 # XRPL Admin 지갑 생성 스크립트
│   └── package.json
└── README.md                    # 이 파일
```

## 주요 기능

### 1. XRPL Admin 지갑 생성 (`index.ts`)
- BIP39 니모닉을 사용한 XRPL 지갑 생성
- 스테이블코인 발행 및 관리를 위한 Admin 지갑
- XRPL Testnet 연결 및 자동 XRP 지급
- 환경변수(`ADMIN_MNEMONIC`)를 통한 안전한 키 관리

### 2. Girin Wallet 연결 (`girin-test/`)
- WalletConnect 프로토콜을 통한 지갑 연결
- 연결된 지갑 주소를 백엔드로 전송
- 네트워크 설정 유틸리티 (XRPL, TRN Mainnet/Testnet)

### 3. API 서버 (`server.ts`)
- **POST /api/set-girin**: 지갑 주소 저장
- **GET /api/get-girin**: 저장된 지갑 주소 조회
- CORS 지원으로 프론트엔드와 통신
- 메모리 기반 주소 저장 (txt 파일 대신)

## 기술 스택

### 프론트엔드
- **React 18** + **TypeScript**
- **Vite** (빌드 도구)
- **WalletConnect** (지갑 연결)

### 백엔드
- **Node.js** + **Express**
- **TypeScript**
- **CORS** (Cross-Origin Resource Sharing)
- **XRPL.js** (XRP Ledger 클라이언트)
- **BIP39** (니모닉 생성)
- **ed25519-hd-key** (키 도출)

## 설치 및 실행

### 1. 환경 설정

```bash
# .env 파일 생성 (xrpl-wallet-creator 디렉토리에)
ADMIN_MNEMONIC="your 12 or 24 word mnemonic phrase here"
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
# XRPL Admin 지갑 생성 (한 번만 실행)
cd xrpl-wallet-creator
npm run start  # 또는 node index.ts

# API 서버 실행 (포트 4000)
npm run dev

# Girin Wallet 프론트엔드 실행 (포트 5173)
cd girin-test
npm run dev
```

### 4. 프로덕션 빌드

```bash
# Girin Wallet 프론트엔드 빌드
cd xrpl-wallet-creator/girin-test
npm run build
```

## API 문서

### 지갑 주소 저장
```http
POST /api/set-girin
Content-Type: application/json

{
  "address": "지갑_주소_문자열"
}
```

**응답:**
- 성공: `200 OK` + `"OK"`
- 실패: `400 Bad Request` + `"Address is required"`

### 지갑 주소 조회
```http
GET /api/get-girin
```

**응답:**
```json
{
  "address": "저장된_지갑_주소" // 또는 null
}
```

## XRPL Admin 지갑 생성

### 환경 설정
`.env` 파일에 Admin 지갑의 니모닉을 설정해야 합니다:

```env
ADMIN_MNEMONIC="your 12 or 24 word mnemonic phrase here"
```

### 실행 방법
```bash
cd xrpl-wallet-creator
npm run start
# 또는
node index.ts
```

### 기능
- BIP39 니모닉으로 XRPL 지갑 복원
- XRPL Testnet 연결
- 자동 XRP 지급 (새 지갑인 경우)
- 스테이블코인 발행을 위한 Admin 권한 설정

## 개발 가이드

### 코드 스타일
- TypeScript 사용
- 함수형 컴포넌트 (React)
- ES6+ 문법
- 한국어 주석 사용

### 파일 저장 방식
- txt 파일 대신 메모리 저장소 사용
- 서버 재시작 시 데이터 초기화됨
- 영구 저장이 필요한 경우 데이터베이스 도입 고려

### 네트워크 설정
- XRPL Mainnet/Testnet 지원
- TRN Mainnet/Testnet 지원
- `src/lib/network.ts`에서 네트워크 설정 관리

## 문제 해결

### 일반적인 문제들

1. **포트 충돌**
   - API 서버: 4000번 포트
   - 프론트엔드: 5173번 포트
   - 다른 프로세스가 사용 중인 경우 포트 변경

2. **CORS 오류**
   - 서버의 CORS 설정 확인
   - 프론트엔드 URL이 허용 목록에 포함되어 있는지 확인

3. **지갑 연결 실패**
   - WalletConnect 설정 확인
   - 네트워크 연결 상태 확인

## 향후 개발 계획

- [ ] 스테이블코인 발행 기능 구현
- [ ] 스테이블코인 관리 (발행량 조절, 소각 등)
- [ ] Axelar 브리지 기능 구현
- [ ] XRPL 트랜잭션 처리
- [ ] 데이터베이스 연동 (영구 저장)
- [ ] UI/UX 개선
- [ ] 에러 핸들링 강화
- [ ] 테스트 코드 작성

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 