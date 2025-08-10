### 1. Permissioned Domain이란?

Permissioned Domain은 **접근 정책(Access Policy)을 온체인에 등록**하는 기능이다.

스스로는 아무 행동도 하지 않지만, 다른 리소스(예: Permissioned DEX, Lending Vault 등)에 **도메인 ID를 연결**하면

해당 리소스가 이 도메인의 규칙을 따라 트랜잭션을 허용하거나 거부할 수 있다.

- **도메인의 규칙** = `AcceptedCredentials`
    
    1~10개의 “허용 자격”을 나열한다.
    
    각 자격은 `발급자(Issuer)`와 `CredentialType(hex)`의 조합이다.
    
- **접근 허용 조건**
    
    트랜잭션을 보내는 계정이 이 도메인에서 허용한 Credential을 **최소 1개** 이상 가지고 있어야 한다.
    
    해당 Credential은 **수락됨(accepted) 상태**이며 **만료되지 않아야** 한다.
    

---

### 2. 왜 필요한가?

- **규제 준수**
    
    금융 서비스, KYC/AML 요구사항이 있는 프로젝트에서 필수.
    
- **정책 분리**
    
    정책 변경 시, 리소스 코드나 주소를 수정할 필요 없이 도메인 규칙만 업데이트하면 된다.
    
- **운영 유연성**
    
    발급/수락/만료를 통해 **실시간으로 접근자 목록이 변동**될 수 있다.
    
- **소유권 명확**
    
    도메인을 만든 계정(오너)만 규칙 변경·삭제 가능.
    

---

### 3. 시나리오: `createDomain` → `deleteDomain`

시나리오에서는 **도메인 생성과 삭제**만 다룬다.

Credential 발급/수락 시나리오와 조합하면, 도메인의 실제 접근제한 효과까지 확인할 수 있다.

### Step 1. 도메인 생성

- **주체**: ADMIN(도메인 오너)
- **행동**: `PermissionedDomainSet` 트랜잭션 전송
- **내용**:
    - `AcceptedCredentials`: `{Issuer: ADMIN, CredentialType: "KYC(hex)"}`
        
        → ADMIN이 발급한 KYC Credential을 가진 계정만 이 도메인에 접근 가능
        

```tsx
const tx: Transaction = {
   TransactionType: "PermissionedDomainSet",
   Account: admin.address,
   // 새로운 Domain 생성 시에는 DomainID 생략
   AcceptedCredentials: [
     {
       Credential: {
         Issuer: admin.address,
         CredentialType: toHex("KYC"),
       }
     }
   ]
 }
```

- 

```bash
DomainID(created): 2A65BCCE9715703A09460B44812BB65D41B9406A42D0CC66979E385C5788####

```

- **DomainID** : Permissioned Domain을 고유하게 식별하는 32바이트(256비트) 해시 값으로, 64자리 hex 문자열로 표시됨
- 콘솔에 생성된 도메인 ID 따로 복사해 도메인 삭제에 사용

---

### Step 2. 도메인 삭제

- **주체**: ADMIN
- **행동**: `PermissionedDomainDelete` 트랜잭션 전송
- **내용**: `DomainID` 지정 → 해당 도메인의 정책 자체가 사라짐

```tsx
//  createDomain 실행 로그에서 복붙한 DomainID
const DOMAIN_ID = "2A65BCCE9715703A09460B44812BB65D41B9406A42D0CC66979E385C5788####"

const tx: Transaction = {
    TransactionType: "PermissionedDomainDelete",
    Account: admin.address,
    DomainID: DOMAIN_ID
}
```

---

### (옵션)Step 3. 특정 도메인의 Accepted Credentials 정보 조회

```tsx
//  createDomain 실행 로그에서 복붙한 DomainID
const DOMAIN_ID = "2A65BCCE9715703A09460B44812BB65D41B9406A42D0CC66979E385C5788####"
const r = await client.request({ command: "ledger_entry", index: DOMAIN_ID })
console.log(JSON.stringify(r, null, 2))
```

- 해당 도메인의 AcceptedCredentials 정보를 콘솔에 출력
