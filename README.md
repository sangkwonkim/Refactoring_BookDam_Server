# 리팩토링 계획
### 1. 쿠키 모듈 만들기
#### 쿠키에 담긴 jwt를 이용해 올바른 접근인지, 만료되었는지 확인하는 모듈을 만들어 코드의 간결하게 만들 예정
### 2. try/catch 문을 이용해 예외 처리하기
#### async/await문에서 try/catch 예외처리 적용하기
### 테스트 코드 실행 방법
#### package.json에서 "test": "NODE_ENV=test mocha test/followSpec.js -w --timeout 5000",
#### test/ 다음 파일명을 user || follow || article 로 변경 후 npm test 진행
