## 1. Permissioned DEX란?

Permissioned DEX는 **도메인 규칙이 적용된 탈중앙화 거래소(DEX) 환경**이다.

일반 오픈 DEX와 달리, 특정 도메인에 가입된 계정만 해당 오더북의 거래에 참여할 수 있다.

- **Permissioned Offer** = DomainID가 붙은 오퍼
- **Open Offer** = DomainID 없는 오퍼

거래 규칙은 **도메인의 AcceptedCredentials**에 따라 결정된다.

즉, 오퍼를 올리거나 체결하려면 해당 도메인에서 허용한 Credential을 보유해야 한다.

---

## 2. 왜 필요한가?

- **규제 준수**
    
    KYC/AML 요건이 있는 금융기관이 XRPL DEX를 활용할 수 있게 함.
    
- **접근 통제**
    
    허용된 Credential 보유자만 거래 가능 → 무허가 계정 접근 차단.
    
- **정책 분리**
    
    거래 제한 조건은 오퍼에 직접 쓰지 않고, 도메인 정책만 수정해서 일괄 반영 가능.
    
- **유연한 시장 형성**
    
    하나의 토큰이라도 오픈 DEX와 Permissioned DEX에서 다른 유동성 풀을 운영 가능.
    

---

## 3. 시나리오: `createPermissionedOffer` → `bookOffers` → `cancelOffer`

### Step 1. Permissioned Offer 생성

- **주체**: 도메인 멤버(트레이더)
- **행동**: `OfferCreate` 트랜잭션 전송
- **내용**:
    - `DomainID`: 참여할 도메인의 ID 지정
    - `TakerGets` / `TakerPays`: 매수·매도 자산 지정
    - 해당 도메인의 AcceptedCredentials 조건을 만족해야 전송 가능

```tsx
// PermissionedDomains/createDomain 스크립트에서 생성된 DomainID(64 hex)
const DOMAIN_ID = "2A65BCCE9715703A09460B44812BB65D41B9406A42D0CC66979E385C5788####"

const tx: Transaction = {
  TransactionType: "OfferCreate",
  Account: trader.address,
  DomainID: "도메인ID(hex)",
  TakerGets: { currency: "USD", issuer: usdIssuer, value: "11" },
  TakerPays: { currency: "EUR", issuer: eurIssuer, value: "10" }
}
```

- 추가로, 생성한 offer 취소를 위해 트랜잭션 전송 후 tx_json의 sequence를 저장,

```bash
# OfferCreate 트랜잭션의 sequence
"Sequence": 123456
```

---

### Step 2. 오더북 조회

- **주체**: 누구나
- **행동**: `book_offers` RPC 호출
- **내용**:
    - `domain` 파라미터 포함 → 해당 도메인 오더북만 표시
    - `domain` 파라미터 생략 → 오픈 오더북만 표시

```tsx

// PermissionedDomains/createDomain 스크립트에서 생성된 DomainID(64 hex)
const DOMAIN_ID = "2A65BCCE9715703A09460B44812BB65D41B9406A42D0CC66979E385C5788####"

const r = await client.request({
  command: "book_offers",
  taker_gets: { currency: "USD", issuer: usdIssuer },
  taker_pays: { currency: "EUR", issuer: eurIssuer },
  domain: "도메인ID(hex)" // 선택
})
```

---

### Step 3. Permissioned Offer 취소

- **주체**: 오퍼 생성자
- **행동**: `OfferCancel` 트랜잭션 전송
- **내용**: 취소할 오퍼 시퀀스 번호(`OfferSequence`) 지정

```tsx
const tx: Transaction = {
  TransactionType: "OfferCancel",
  Account: trader.address,
  OfferSequence: 123456 // offerCreate 트랜잭션의 sequence
}
```
