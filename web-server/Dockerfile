# 가벼운 Alpine Linux 기반 nginx 웹 서버 이미지를 사용합니다.
FROM nginx:alpine

# 직접 만든 웹페이지를 nginx의 기본 웹페이지 위치에 복사합니다.
COPY index.html /usr/share/nginx/html/index.html

# 컨테이너가 사용하는 HTTP 포트입니다. 호스트 연결에는 별도 포트 매핑이 필요합니다.
EXPOSE 80
