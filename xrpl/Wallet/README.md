## 1. Wallet

**Wallet**은 XRPL 계정을 **생성/로드/펀딩/조회**하기 위한 도구(스크립트 모음)이다.

- **생성**: 새 주소/시드 발급
- **펀딩(Devnet)**: Faucet으로 활성화(기본 리저브 충족)
- **조회**: 잔액, 시퀀스, Flags, TrustLines 등

---

## 2. 왜 필요한가?

- **개발 초기 세팅**: 테스트 계정 빠르게 준비
- **자동화**: 반복 테스트에서 계정 생성/펀딩/조회 스크립트 표준화
- **디버깅**: 실패 원인 분석 시 계정 상태 쉽게 확인

---

## 3. 시나리오: `create` → `faucet` → `walletinfo`
* 새로운 지갑 생성 -> 지갑 활성화 -> 지갑정보 조회
### Step 1. 새 지갑 생성 (`createNewWallet.ts`)

- **주체**: 개발자
- **행동**: 새 시드/주소 생성
- **내용**: 콘솔에 `address/seed` 출력

```tsx
const newWallet = Wallet.generate()
```

---

### Step 2. Devnet 펀딩 (`faucet.ts`)

- **주체**: 개발자
- **행동**: Devnet Faucet으로 해당 시드 지갑 활성화
- **내용**: 리저브/수수료 지불 가능한 최소 잔액 확보

```tsx
const fundedWallet = await client.fundWallet(newWallet)
```

---

### Step 3. 지갑 정보 조회 (`WalletInfo.ts`)

- **주체**: 누구나
- **행동**: `account_info`, `account_lines` 등으로 상태 조회
- **내용**: XRP 잔액, Sequence, Flags, TrustLines, RegularKey 등

```tsx
 // XRP 잔액 조회
    const adminBalance = await client.getXrpBalance(adminWallet.address)
    const userBalance = await client.getXrpBalance(userWallet.address)
    // 계정 정보 조회
    const adminAccountInfo = await client.request({
      command: 'account_info',
      account: adminWallet.address
    })
    const userAccountInfo = await client.request({
      command: 'account_info',
      account: userWallet.address
    })
    // TrustLine 조회
    const adminTrustLines = await client.request({
      command: 'account_lines',
      account: adminWallet.address
    })
    const userTrustLines = await client.request({
      command: 'account_lines',
      account: userWallet.address
    })
```

