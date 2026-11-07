# 조회 전용 시연 명령

Git·Compose 명령은 clone한 **실제 미션 저장소 루트**에서 실행합니다. 아래 명령은 기존 파일·컨테이너·커밋을 삭제하지 않습니다. Docker 조회에는 Docker Desktop·WSL 통합과 소켓 접근 권한이 필요합니다. 출력에 개인 경로·호스트명·이메일이 포함되면 화면 공유·캡처 전에 확인하세요. 전체 환경 변수·개인키·토큰·Labels 조회는 수록하지 않습니다.

## 기본 상태

```bash
docker --version
docker ps
docker ps -a
docker images
docker volume ls
git status
git log -1 --oneline
git remote -v
```

- `ps`와 `ps -a`: 실행 중 / 종료된 것까지 목록
- `images`: 기존 이미지 목록, `volume ls`: 데이터 저장 공간 목록
- `git status`: 변경 상태, `log`: 마지막 커밋, `remote -v`: 원격 주소
- 원격 주소에 인증정보를 넣어둔 환경에서는 `remote -v`를 화면 공유하지 마세요. 이 저장소의 origin은 인증정보 없는 HTTPS 주소입니다.

## Compose 설정과 상태

```bash
docker compose -f docker-compose.yml config --quiet
docker compose -f docker-compose.yml ps
```

`config --quiet`는 YAML을 검사하고 성공 시 출력 없이 종료합니다. 설정 전체를 출력해 개인 절대경로를 노출하는 일을 피합니다. 현재 보너스 2까지 함께 확인하려면:

```bash
docker compose -f docker-compose.yml -f docker-compose.bonus2.yml ps
```

## 웹 응답 조회

```bash
curl -I http://localhost:8090
```

웹 서버가 실행 중인 경우에만 정상 응답을 기대할 수 있습니다. 이 명령은 헤더를 조회하며 HTML 본문 전체를 검증하는 명령은 아닙니다. 요청은 서버 접근 로그를 남길 수 있지만 서비스 실행 설정·데이터·컨테이너를 삭제하거나 재시작하지 않습니다. 응답 실패 시 발표 중 임의로 서비스를 다시 만들지 말고 기존 증빙 로그를 확인합니다.

## GitHub 원격 main 조회

```bash
git ls-remote https://github.com/inyoung7-lab/ia-codyssey-allinone-test1-1.git refs/heads/main
```

네트워크 접근이 필요합니다. 이 조회는 원격 커밋 확인이며 SSH 인증·Push 권한 확인은 아닙니다. 연결 실패는 실패 그대로 구분합니다.

## 변경을 만드는 명령은 별도 실습으로 구분

`docker run hello-world`와 `docker compose up`은 컨테이너 등 새 실행 상태를 만들 수 있으므로 조회 전용이 아닙니다. 발표 화면의 재현 명령을 그대로 시연 실행하지 않습니다. `git add`, `commit`, `push`, `chmod`, `cp`, `mv`, `rm`도 상태를 변경합니다.

발표 시연에서는 `docker compose down`, `docker system prune`, `git reset --hard`, `git push --force`를 사용하지 않습니다. 발표 화면의 down은 과거 독립 프로젝트 실습 설명입니다.

파일·폴더 조작이 꼭 필요하면 `mktemp -d`로 별도의 새 임시 폴더를 만든 뒤 그 안에서만 수행하는 변경 실습으로 구분합니다. 기존 프로젝트 파일을 대상으로 하지 않습니다. 이번 웹페이지 제작에서는 해당 실습을 다시 실행하지 않았습니다.
