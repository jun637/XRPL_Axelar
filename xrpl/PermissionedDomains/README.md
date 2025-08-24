## PermissionedDomains

* Permissioned Domain은 **온체인 접근 정책(Access Policy)** 을 등록하는 기능입니다.  
* 자체로는 아무 동작을 하지 않지만, DEX·Lending Vault 등 다른 리소스에 **도메인 ID를 연결**하면 해당 리소스가 이 도메인의 규칙을 따라 접근을 허용하거나 거부합니다.  

- 규칙은 `AcceptedCredentials` 배열에 정의되며, 1~10개의 Credential(Issuer + CredentialType) 조합을 나열  
- 트랜잭션 발신자가 허용된 Credential을 보유(accepted 상태, 미만료)해야 접근 가능  

---

## 🎯 시나리오 실행 명령어 및 설명  

### 1. 도메인 생성
```bash
    npx ts-node xrpl/PermissionedDomains/createDomain.ts
```
* Admin 계정이 새로운 Permissioned Domain을 생성하고, 허용할 Credential(Issuer, CredentialType)을 등록  

### 2. 도메인 삭제
```bash
    npx ts-node xrpl/PermissionedDomains/deleteDomain.ts  
```
* 기존 DomainID를 지정하여 Permissioned Domain을 삭제  

### (옵션) 3. 도메인 조회
```bash
  npx ts-node xrpl/PermissionedDomains/AcceptedCredentials.ts  
```
* 특정 DomainID에 설정된 AcceptedCredentials 정보를 조회하여 콘솔에 출력  

---

## ✅ 예상 결과
성공 시:

* `createDomain.ts` 실행 → Explorer에서 `tesSUCCESS` 확인 및 콘솔에 `DomainID`(64자리 hex) 출력  
* `deleteDomain.ts` 실행 → 해당 DomainID가 원장에서 제거됨  
* (옵션) AcceptedCredentials 조회 → Domain에 등록된 허용 Credential 목록 확인 가능  

실패 시:

* 잘못된 DomainID → ledger_entry 조회/삭제 실패  
* .env 누락 → Admin 시드 불러오기 실패  
* 네트워크 연결 오류 → Devnet WS URL 확인 필요  

---

## 🔍 추가 참고
전체 코드 / 상세 실행 로그 / 필드 해석은 Notion 문서 참고 → [PermissionedDomains](https://catalyze-research.notion.site/PermissionedDomains-241898c680bf8003a61aee9d1f87244c?source=copy_link)
