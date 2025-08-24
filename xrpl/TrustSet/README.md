## TrustSet

* XRPL에서 **IOU 신뢰선(TrustLine)을 생성/수정**하기 위한 스크립트 모음입니다.  
* 특정 통화에 대해 **수신 한도(limit)** 를 설정하고, 발행자 정책(RequireAuth 등)에 따라 **승인 흐름**을 거칠 수 있습니다.  

- **수신자(User)**: 발행자 IOU를 받기 위해 자신의 계정에 신뢰선 생성 (limit 설정)  
- **발행자(Admin)**: `RequireAuth`를 켠 경우, 승인(allow)을 통해 수신자 사용 허가  

---

## 🎯 시나리오 실행 명령어 및 설명  

## 1. User 신뢰선 생성
```bash
npx ts-node xrpl/TrustSet/TrustSet.ts
```
* User 계정이 특정 통화(IOU)를 수신하기 위해 신뢰선(limit)을 생성 (LimitAmount 지정)

2. 발행자 승인 (RequireAuth 켜진 경우)
```bash
npx ts-node xrpl/TrustSet/authorizeTrustLine.ts
```
* Admin 계정이 RequireAuth 플래그가 켜진 상태에서 User 신뢰선을 승인 (tfSetAuth 플래그 사용)

---
## ✅ 예상 결과
성공 시:

* User 계정에 지정한 IOU 신뢰선이 생성됨 (LimitAmount 반영)

* Admin이 승인하면 User가 해당 IOU를 정상 수신 가능

* Explorer에서 TransactionResult: tesSUCCESS 확인 가능

실패 시:

* RequireAuth 설정된 발행자 계정이 승인하지 않으면 User는 IOU를 받을 수 없음

* .env 누락 → User/Admin 시드 확인 필요

* 노드 연결 실패 → Devnet WS URL 확인

---

## 🔍 추가 참고
전체 코드 / 상세 실행 로그 / 필드 해석은 Notion 문서 참고 → [TrustSet](https://catalyze-research.notion.site/TrustSet-241898c680bf8004a0efe89986fb6060?source=copy_link)

