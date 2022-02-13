# 리팩토링 계획
### 1. 쿠키 모듈 만들기
#### 쿠키에 담긴 jwt를 이용해 올바른 접근인지, 만료되었는지 확인하는 모듈을 만들어 코드의 간결하게 만들 예정
### 2. try/catch 문을 이용해 예외 처리하기
#### async/await문에서 try/catch 예외처리 적용하기
### 3. Refresh Token, Access Token 반영하기
#### Refresh Token과 Access Token을 db에 저장하고 Refresh Token을 이용한 Access Token 재발급 시 비교할 수 있도록 기능 구현
