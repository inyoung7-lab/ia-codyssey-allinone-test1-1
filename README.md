# Codyssey 개발 입문 미션 1-1

내 컴퓨터에 개발자용 작업실을 구성하고 Linux CLI, 파일 권한, Docker, Git을 실습하는 프로젝트입니다. Dockerfile 기반 정적 웹 서버를 만들고 포트 매핑, Bind Mount, Named Volume의 동작을 확인하는 것을 목표로 합니다.

## 실행 환경 및 검증 기준

- 사용자 제공 환경: Windows 11 + WSL2 Ubuntu + Docker Desktop, VS Code + WSL 확장
- 작업 경로: `/path/to/mission-1-1`
- 기본 브랜치: `main` (사용자 제공 정보)
- Docker Desktop에서 WSL2 엔진과 해당 Ubuntu 배포판의 WSL 통합이 활성화되어 있어야 합니다.
- 아래 실행 명령어는 **재현 안내**이며, 문서 작성 과정에서 Docker 및 Git 명령어를 실행하지 않았습니다. 명령어 블록은 실제 실행 로그가 아닙니다.
- 사용자가 수행했다고 알려준 실습과 파일로 확인한 사실을 구분합니다. Docker 버전 전체와 GitHub 연동은 추가 검증이 필요하며, 현재 연결된 스크린샷의 확인 범위는 각 절에 표시합니다.

## 프로젝트 구성

```text
mission-1-1/
├── .gitignore
├── README.md
├── practice.txt
├── permission-test/
│   ├── hello.txt
│   └── hello-renamed.txt
├── bind-mount/
│   └── shared.txt
└── web-server/
    ├── Dockerfile
    ├── .dockerignore
    └── index.html
```

`evidence/`에는 PNG 증빙 이미지 19개가 있으며, 아래 관련 실습 절에서 각각 한 번씩 참조합니다. 이미지를 직접 확인하여 배치했으며, 재현 안내 명령어와 당시 실행 화면의 이름·입력값이 다른 경우 캡션으로 구분합니다.

## 1. Linux 명령어와 경로

사용자는 `pwd`, `ls`, `ls -la`, `cd`, `mkdir`, `touch`, `echo`, `cat`, `cp`, `mv`를 실습했다고 보고했습니다. 파일의 존재는 확인했지만 각 명령어의 실행 이력은 별도 증거가 필요합니다.

다음 명령어는 기존 파일과 구분한 `cli-replay/`에서 한 번씩 수행하는 재현 예시입니다. 같은 폴더가 이미 있다면 먼저 내용을 확인하고 다른 이름을 사용합니다.

```bash
cd /path/to/mission-1-1
pwd
ls
ls -la
mkdir cli-replay
cd cli-replay
touch practice.txt
echo 'Hello Codyssey' > hello.txt
cat hello.txt
cp hello.txt hello-copy.txt
mv hello-copy.txt hello-renamed.txt
cd ..
```

- 절대경로: `/path/to/mission-1-1`처럼 `/`에서 시작합니다.
- 상대경로: 현재 위치를 기준으로 하는 `cli-replay/hello.txt` 등입니다.
- `.`은 현재 디렉터리, `..`은 상위 디렉터리입니다.

**증빙:** VS Code 터미널의 출력 확인 화면입니다. CLI 전체 명령어 수행 이력을 증명하는 화면은 아닙니다.

![VS Code 터미널에서 TERMINAL_TEST_OK 출력 확인](evidence/terminal-output-restored.png)

## 2. 파일·디렉터리 권한

`r`은 읽기, `w`는 쓰기, `x`는 실행 권한입니다. 디렉터리에서는 `r`이 항목 목록 읽기, `w`가 항목 생성·삭제, `x`가 내부 접근을 뜻합니다. 항목 생성·삭제에는 일반적으로 디렉터리의 `w`와 `x`가 함께 필요합니다.

권한 숫자는 소유자·그룹·기타 사용자 순서이고, `r=4`, `w=2`, `x=1`을 더합니다.

| 권한 | 의미 |
| --- | --- |
| `644` | 소유자 읽기·쓰기, 그룹과 기타 사용자 읽기 |
| `755` | 소유자 읽기·쓰기·실행, 그룹과 기타 사용자 읽기·실행 |

사용자는 파일 `644 → 755 → 644`, 디렉터리 `755 → 644 → 755` 변경을 수행했다고 보고했습니다. 문서 작성 시 `practice.txt`와 두 hello 파일은 `644`, `permission-test/`는 `755`로 확인했습니다. 중간 변경 과정은 미검증입니다.

```bash
# 앞 절에서 만든 재현용 파일과 폴더 사용
chmod 644 cli-replay/hello.txt
ls -l cli-replay/hello.txt
chmod 755 cli-replay/hello.txt
ls -l cli-replay/hello.txt
chmod 644 cli-replay/hello.txt
chmod 644 cli-replay
ls -ld cli-replay
# 디렉터리의 x 권한을 없애면 내부 파일 접근이 제한됩니다.
chmod 755 cli-replay
ls -ld cli-replay
```

**증빙:** 파일의 최종 `644`와 디렉터리의 최종 `755` 상태입니다. 권한 변경 중간 과정과 접근 제한 결과는 이 두 이미지로 확인할 수 없습니다.

![practice.txt의 rw-r--r-- 권한 확인](evidence/linux-file-permission-644-confirmed.png)

![permission-test 디렉터리의 rwxr-xr-x 권한 확인](evidence/linux-directory-permission-755-confirmed.png)

## 3. Docker 준비 및 기본 컨테이너

Windows에서 Docker Desktop을 실행한 뒤 VS Code의 WSL Ubuntu 터미널에서 확인합니다.

```bash
docker --version
docker version
docker info
docker run --name codyssey-hello hello-world
docker ps -a
docker logs codyssey-hello
```

`docker --version`은 CLI 버전, `docker version`과 `docker info`는 서버 연결 상태도 확인합니다. 관련 실제 실행 화면은 이 절의 증빙 이미지에서 확인합니다. 버전 전체가 보이는 화면은 추가 확인이 필요합니다.

Ubuntu 대화형 컨테이너:

```bash
docker run -it --name codyssey-ubuntu ubuntu:24.04 bash
# 아래는 컨테이너 안에서 실행
cat /etc/os-release
pwd
ls -la
echo 'Hello from Ubuntu container'
exit
# 아래는 WSL 호스트에서 실행
docker ps -a
```

기본 이미지·컨테이너 운영 명령어:

```bash
docker images
docker ps
docker ps -a
docker inspect codyssey-ubuntu
docker start -ai codyssey-ubuntu
# 컨테이너 안에서 exit 후, 더 이상 필요 없을 때만 삭제
docker rm codyssey-ubuntu
```

정지에는 `docker stop <컨테이너이름>`, 불필요한 이미지 삭제에는 `docker rmi <이미지이름:태그>`를 사용합니다. 컨테이너 삭제는 컨테이너 내부 데이터를 잃을 수 있으므로 실습 증거를 먼저 보관합니다.

**증빙 위치:** Docker CLI·서버 버전, hello-world 실제 출력, Ubuntu 내부 명령어와 종료 후 상태.

아래는 실제 실행 화면입니다. hello-world는 재현 예시의 고정 이름 없이 실행된 기록입니다. 재시작 후 파일 확인은 같은 컨테이너의 파일 유지 증거이며, Named Volume 증거와 구분합니다. Docker 정보 이미지는 서버 정보의 하단 부분으로, CLI·서버 버전 전체를 보여주지는 않습니다.

![Docker Desktop 및 WSL2 커널을 포함한 서버 정보 하단](evidence/docker-info-success.png)

![hello-world 실행과 Hello from Docker 출력](evidence/docker-hello-world-success.png)

![Ubuntu 이미지 다운로드와 대화형 셸 진입](evidence/docker-ubuntu-interactive-success.png)

![컨테이너 내부 Ubuntu 버전 확인](evidence/docker-ubuntu-version-confirmed.png)

![Ubuntu 컨테이너 내부 파일 작성 및 읽기](evidence/docker-container-file-verified.png)

![동일 컨테이너 재시작 후 파일 읽기](evidence/docker-container-restart-file-persistence.png)

![종료된 Ubuntu 및 hello-world 컨테이너 상태](evidence/docker-ps-all-exited.png)

## 4. Dockerfile 기반 Nginx 웹 서버와 포트 매핑

확인된 `web-server/Dockerfile`의 주요 설정입니다.

```dockerfile
FROM nginx:alpine
COPY index.html /usr/share/nginx/html/index.html
EXPOSE 80
```

HTML에는 `Codyssey Docker Web Server` 제목과 `Dockerfile로 만든 첫 번째 웹 서버입니다.` 설명이 있습니다. `.dockerignore`는 HTML만 빌드 컨텍스트에 포함하도록 설정되어 있습니다.

```bash
cd /path/to/mission-1-1
docker build -t codyssey-web:1.0 ./web-server
docker run -d --name codyssey-web -p 127.0.0.1:8080:80 codyssey-web:1.0
docker ps
docker port codyssey-web
docker logs codyssey-web
curl -i http://localhost:8080
```

Windows 브라우저에서 `http://localhost:8080`에 접속합니다. `8080`은 호스트 포트, `80`은 컨테이너 Nginx 포트입니다. `EXPOSE 80`만으로 호스트에 포트가 공개되지는 않으며 `-p`가 연결을 만듭니다. 브라우저 주소창과 페이지 제목·설명이 함께 보이도록 촬영합니다.

**증빙 위치:** 빌드 성공 로그, 컨테이너 상태·포트, HTTP 응답, 주소창이 포함된 웹페이지.

실제 화면은 `codyssey-web:v1` 이미지와 `codyssey-web-server` 컨테이너를 사용합니다. 위 재현 예시의 `codyssey-web:1.0`, `codyssey-web`, 로컬 주소 바인딩과 이름·옵션이 다릅니다.

![nginx alpine 기반 이미지 빌드 및 HTML 복사 완료](evidence/docker-web-build-success.png)

![codyssey-web-server 컨테이너 실행과 ID 반환](evidence/docker-web-container-run.png)
![localhost 8080 주소창과 Codyssey 웹페이지 표시](evidence/docker-web-browser-success.png)

`nginx:alpine`은 변경 가능한 태그입니다. 정확한 환경 재현이 필요하면 실습 당시 `docker image inspect nginx:alpine`의 이미지 ID·RepoDigests를 추가 기록합니다.

## 5. Bind Mount 변경 전후 확인

`bind-mount/shared.txt` 파일의 존재는 확인했습니다. 아래 예시는 기존 파일을 덮어쓰지 않도록 별도의 `replay.txt`를 사용합니다. 해당 파일이 이미 있으면 다른 이름을 정합니다.

```bash
cd /path/to/mission-1-1
printf 'before\n' > bind-mount/replay.txt
docker run -d --name codyssey-bind --mount type=bind,source="$(pwd)/bind-mount",target=/data,readonly ubuntu:24.04 sleep infinity
cat bind-mount/replay.txt
docker exec codyssey-bind cat /data/replay.txt
printf 'after\n' > bind-mount/replay.txt
cat bind-mount/replay.txt
docker exec codyssey-bind cat /data/replay.txt
```

호스트의 파일 변경이 컨테이너에도 반영되는지 변경 전후의 실제 출력을 비교합니다.

**증빙:** 실제 화면은 `shared.txt`를 `/shared`에 읽기 전용으로 연결하여 변경 전후를 읽습니다. 위 `replay.txt`·`/data` 재현 예시와 경로가 다르며, 실제 화면에서는 변경 전후 각각 새 임시 컨테이너를 실행합니다.

![Bind Mount 파일의 최초 내용 읽기](evidence/docker-bind-mount-read-success.png)

![호스트 파일 변경 후 Bind Mount에서 변경 내용 읽기](evidence/docker-bind-mount-update-success.png)

## 6. Named Volume 데이터 영속성

```bash
docker volume create codyssey-data
docker run --name codyssey-volume-write --mount type=volume,source=codyssey-data,target=/data ubuntu:24.04 bash -c 'printf "persistent data\n" > /data/message.txt; cat /data/message.txt'
docker rm codyssey-volume-write
docker run --rm --name codyssey-volume-read --mount type=volume,source=codyssey-data,target=/data ubuntu:24.04 cat /data/message.txt
docker volume inspect codyssey-data
```

첫 컨테이너를 삭제한 뒤 새 컨테이너에서 같은 데이터가 읽히는지 확인합니다. 컨테이너가 없어져도 Named Volume은 별도로 남습니다. 증거를 확보하기 전에 `docker volume rm codyssey-data`를 실행하지 않습니다. 위 데이터 문자열은 명령어의 입력값이며 실제 관찰한 결과가 아닙니다.

**증빙 위치:** 쓰기 결과, 첫 컨테이너 삭제, 새 컨테이너 읽기 결과와 볼륨 정보.

실제 화면은 `--rm`으로 쓰기 컨테이너를 자동 삭제한 뒤 새 컨테이너에서 같은 볼륨을 읽는 기록입니다. 입력 문자열은 위 재현 예시와 다릅니다.

![codyssey-data 볼륨 생성 및 새 컨테이너에서 데이터 읽기](evidence/docker-named-volume-persistence.png)

## 7. 실제 발생한 문제 해결 기록

다음 두 사례는 사용자가 제공한 실제 수행 기록을 정리한 것입니다. 제공된 오류 문구와 확인 결과만 기록했으며, 아래에 관련 스크린샷을 연결했습니다. 스크린샷에 없는 해결 단계는 사용자 제공 기록입니다.

### 사례 1: Docker 소켓 권한 오류

- 증상: `docker info` 실행 시 `permission denied while trying to connect to the docker API at unix:///var/run/docker.sock` 오류가 발생했습니다.
- 원인 확인: `id` 출력에 `docker` 그룹이 없었고, `ls -l /var/run/docker.sock` 결과에서 `srw-rw---- 1 root docker`를 확인했습니다. 사용자가 소켓에 접근할 수 있는 `docker` 그룹에 속하지 않은 상태였습니다.
- 해결: WSL Ubuntu에서 다음 명령어로 현재 사용자를 `docker` 그룹에 추가했습니다.

```bash
sudo /usr/sbin/usermod -aG docker "$USER"
```

이후 Windows PowerShell에서 WSL을 종료하고 Ubuntu에 재접속했습니다.

```powershell
wsl --shutdown
wsl -d Ubuntu
```

- 재검증: 재접속 후 `id` 출력에 `1001(docker)` 그룹이 추가되었고, `docker info`의 Server 정보가 정상 출력되었습니다. `docker run hello-world`도 성공했습니다.
- 참고: `newgrp docker`는 명령어가 없어 사용하지 못했습니다.

![Docker API 접근 권한 오류 일부 화면](evidence/docker-api-permission-denied.png)

![docker 그룹 미포함과 root docker 소켓 권한 확인](evidence/docker-socket-permissions-before.png)

해결 후 서버 정보와 hello-world 성공 화면은 3절에 배치했습니다. 그룹 추가 명령어, WSL 재접속, 재접속 후 `id` 결과는 위 이미지에 포함되어 있지 않습니다.

### 사례 2: 동일한 컨테이너 이름 충돌

- 증상: 다음 명령어가 이미 성공한 뒤 같은 명령어를 다시 실행하여 이름 충돌 오류가 발생했습니다.

```bash
docker run -d --name codyssey-web-server -p 8080:80 codyssey-web:v1
```

제공된 오류 문구: `Conflict. The container name "/codyssey-web-server" is already in use`

- 확인: `docker ps -a --filter "name=codyssey-web-server"` 실행 결과에서 `STATUS`는 `Up 2 minutes`, `PORTS`는 `0.0.0.0:8080->80/tcp`로 확인했습니다.
- 해결: 기존 컨테이너가 실행 중이므로 삭제하거나 재생성하지 않고 그대로 사용했습니다.
- 재검증: Windows 브라우저에서 `localhost:8080`에 접속하여 `Codyssey Docker Web Server` 웹페이지가 표시되는 것을 확인했습니다.

![동일 컨테이너 이름 충돌과 Up 상태 및 8080 포트 매핑](evidence/docker-web-running-port-8080.png)

브라우저 접속 성공 화면은 4절에 배치했습니다.

## 8. Git과 GitHub 사용법

기본 브랜치는 사용자 제공 정보에 따라 `main`을 기준으로 설명합니다. 기존 저장소이므로 `git init`을 다시 실행하지 않습니다. 다음은 사용자가 직접 실행할 명령어입니다.

```bash
cd /path/to/mission-1-1
git status
git branch --show-current
git config --get user.name
git config --get user.email
git config --get init.defaultBranch
```

설정이 필요한 경우에만 아래 예시 값을 본인의 공개 가능한 정보로 바꿉니다. `init.defaultBranch`는 향후 생성할 저장소의 기본값이며 기존 브랜치를 변경하지 않습니다.

```bash
git config user.name "YOUR_NAME"
git config user.email "YOUR_PUBLIC_OR_NOREPLY_EMAIL"
git config --global init.defaultBranch main
```

스크린샷을 준비한 뒤 VS Code 소스 제어 화면에서 변경 파일을 검토하고, 사용자 터미널에서 제출합니다.

```bash
git diff
git status --short
git add .gitignore README.md web-server/ practice.txt permission-test/ bind-mount/
# evidence/를 실제로 생성하고 민감정보 점검을 마친 뒤에만 실행
git add evidence/
git diff --cached --stat
git diff --cached
git commit -m "docs: prepare Codyssey mission 1-1 submission"
# origin이 이미 있으면 추가하지 말고 연결 대상을 확인
git remote -v
# origin이 없을 때만 실제 URL로 교체하여 실행
git remote add origin https://github.com/YOUR_ACCOUNT/YOUR_REPOSITORY.git
git push -u origin main
```

GitHub 인증에는 비밀번호나 토큰을 저장소 URL·문서에 넣지 않습니다. VS Code의 GitHub 인증 흐름 등을 사용하고 GitHub 저장소에서 README와 증거가 표시되는지 확인합니다.

**제출 Repository URL:** 실제 URL 추가 필요.

**추가 증빙 필요:** VS Code와 GitHub 인증·원격 저장소 연동을 확인할 이미지는 현재 19개에 포함되어 있지 않습니다.

## 9. 실제 출력과 제출 전 확인

문서 작성 시 파일 조회로 확인한 결과:

```text
644 0 practice.txt
755 4096 permission-test
644 22 permission-test/hello.txt
644 22 permission-test/hello-renamed.txt
```

위 결과는 `stat -c '%a %s %n'` 출력이며 순서대로 권한·크기(바이트)·경로입니다. 디렉터리 크기는 환경에 따라 달라질 수 있습니다. Docker 실행 화면은 관련 실습 절의 증빙 이미지로 연결했습니다.

- [ ] Docker CLI·서버 실제 버전과 성공 출력 추가
- [ ] CLI 및 권한 변경 과정 증거 추가
- [ ] hello-world 및 Ubuntu 대화형 컨테이너 실행 증거 추가
- [ ] 이미지 빌드·포트 매핑·주소창 포함 브라우저 증거 추가
- [ ] Bind Mount 변경 전후 및 Named Volume 영속성 결과 추가
- [ ] 실제 오류 2건의 원문·해결 과정·해결 후 결과 추가
- [x] `evidence/`의 PNG 19개를 관련 절에 중복 없이 연결하고 상대경로 확인
- [ ] 명령어를 실행 환경에서 따라 하며 재현성 확인
- [ ] Git 사용자 설정·main 브랜치·VS Code 및 GitHub 연동 확인
- [ ] 스크린샷과 커밋 대상에 비밀번호·토큰·개인키·비공개 개인정보가 없는지 확인
- [ ] GitHub에서 파일·이미지·README 표시 및 제출 URL 확인

`.gitignore`는 아직 추적하지 않는 파일에 적용되며 이미 커밋된 비밀 정보를 제거하지 않습니다. `.env.example`과 `.env.sample`에는 실제 비밀값을 넣지 않습니다. 증거에는 주소창·실행 결과를 남기되 불필요한 개인정보를 가립니다.
