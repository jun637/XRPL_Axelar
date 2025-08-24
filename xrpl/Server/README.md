## Server

* Devnet 노드의 서버 상태 및 활성화된 기능(Amendment) 목록을 확인하는 유틸리티 스크립트입니다.  
* 디버깅 및 기능 지원 여부 확인용으로 활용됩니다.  

---

## 🎯 시나리오 실행 명령어 및 설명  

### 1. 서버 정보 확인
```bash
    npx ts-node xrpl/Server/serverInfo.ts  
```
* XRPL Devnet 노드에 연결하여 rippled 버전과 활성화된 amendment 목록을 조회  

---

## ✅ 예상 결과
성공 시:

* rippled 버전(예: 2.5.0)과 현재 활성화된 amendment 목록이 콘솔에 출력  
* WebSocket 연결 성공 및 응답에 `status: success` 확인 가능  

실패 시:

* 네트워크 연결 실패 → Devnet WS URL 확인 필요  
* 응답 지연/타임아웃 발생 → 네트워크 상태 확인  
* .env 설정 문제는 없음 (환경변수 사용하지 않음)  

---

## 🔍 추가 참고
전체 코드 / 상세 실행 로그 / 필드 해석은 Notion 문서 참고 → [Server](https://catalyze-research.notion.site/Server-253898c680bf80259eabef87cd247923?source=copy_link)
