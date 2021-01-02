---
title: Docker를 이용한 guacamole
categories:
- docker
tags:
- docker
- guacamole
---

사이버지식 정보방등에서 유용한(?) guacamole를 compose.yml파일로 관리하면 도커 이미지 하나로 쿠아카몰을 바로 실행할 수 있다.
우선 command Line by Line 부터 정리해보면 다음과 같다.

## 1. guacd 컨테이너 및 db 컨테이너 실행

```
$ sudo docker run -d --name mysql_db -e MYSQL_ROOT_PASSWORD='MY_PASSWORD' mysql/mysql-server

DB 초기화를 위한 sql파일 로컬 호스트에 생성
$ sudo docker run --rm guacamole/guacamole /opt/guacamole/bin/initdb.sh --mysql > initdb.sql

생성한 sql파일을 컨테이너 안으로 넣기
$	sudo docker cp ./initdb.sql mysql_db:/tmp/initdb.sql

$ sudo docker exec -it mysql_db bash # 컨테이너 안으로 접속
$	mysql -u root -p # 컨테이너 생성시 만든 비밀번호 입력
$	CREATE DATABASE guacamole_db;
$	CREATE USER 'guacamole_user'@'%' IDENTIFIED BY 'MY_PASSWORD';
$	GRANT SELECT,INSERT,UPDATE,DELETE ON guacamole_db.* TO 'guacamole_user'@'%';
$	FLUSH PRIVILEGES;
$	quit

sql파일 실행해서 설정 완료(컨테이너 안에서 아래 명령어 실행)
$	cat /tmp/initdb.sql | mysql -u root -p guacamole_db

$ docker run --restart always --name guacd -d guacamole/guacd
```

## 2. 실행

```
# --link 옵션은 사라질(?) 예정이라 network생성해주고 
# 각 guacd, mysql컨테이너를 해당 네트워크에 연결한 후 --net 옵션으로 같은 네트워크를 사용하도록 바꾼다
# 하지만 --link 하는게 편하면 일단 그냥 아래와 같이 한다
$ sudo docker run -d --name guacamole \
 --link guacd:guacd \
 --link mysql_db:mysql \
--restart always \
-e MYSQL_DATABASE=guacamole_db \
-e MYSQL_USER=guacamole_user \
-e MYSQL_PASSWORD='MY_PASSWORD' \
-p 8080:8080 guacamole/guacamole
```

## 3. guacamole compose 작성
- 1번에서 마지막 명령줄 이외에 모두 완료했다면(sql파일 cat하는것까지 했다면) 이 하위의 compose 파일 하나로 구아카몰을 실행할 수 있다.
- compose파일은 link옵션이 사라져도 동작하도록 network를 이용하도록 한다.
- 아래 compose파일을 실행하기전 먼저 다음과 같이 실행한다
- ``` docker network create guacamole_network ```
- ``` docker network connect guacamole_network mysql_db ```

```
version: '2.4'

services:
  guacd:
    hostname: guacd
    container_name: guacd
    image: guacamole/guacd
    restart: always
    networks: 
      - guac_net

  guacamole:
    container_name: guacamole
    image : guacamole/guacamole
    environment:
      GUACD_HOSTNAME: guacd
      MYSQL_HOSTNAME: mysql_db
      MYSQL_DATABASE: guacamole_db
      MYSQL_USER: guacamole_user
      MYSQL_PASSWORD: MY_PASSWORD
    restart: always
    ports:
      - 8080:8080
    depends_on:
      - guacd
#    links:
#      - guacd:guacd
#    external_links:
#      - mysql_db:mysql
      # container_name:alias
    networks:
      - guac_net

networks:
  guac_net:
    external: true
    name: guacamole_network

```

- docker-compose up -d 하면 끝. 만약 파일 이름이 docker-compose.yml이 아니면 docker-compose -f <파일이름> up -d 하면 된다.
- -f 옵션 썼다면 down, stop시에도 똑같이 해줘야 한다...  docker-compose -f <파일이름> down   docker-compose -f <파일이름> stop
- 항상 실행 전 문법 검사 docker-compose -f <파일이름> config  를 해주는 것이 좋다.
- 만약 접속이 제대로 안되거나 하면 docker-compose logs -f <파일이름> 으로 확인해본다.
- guacamole_network는 따로 만들어주고 db와 연결했기 때문에 yml파일을 내려도 자동으로 지워지지 않는다. 따라서 아래와 같이 연결된 모든 컨테이너와의 연결을 해제 후 지운다.

```
$ for i in ` docker network inspect -f '{{range .Containers}}{{.Name}} {{end}}' guacamole_network`;do docker network disconnect guacamole_network $i; done;
$ docker network rm guacamole_network
```

## 4. 접속 확인
- http://<서버ip>:8080/guacamole/#/ 으로 접속한다. 초기 아이디/비밀번호는 guacadmin 이다. 반드시 settings > preference에서 비밀번호를 바꿔주자.
- settings > connections 탭에서 New connection 을 만든다
## 5. vnc 설정

- 먼저 원격 연결 대상 리눅스 컴퓨터에 메뉴 검색창에서 "데스크톱 공유" 를 찾는다. 반드시 한글로 입력해야 나온다(영어로 desktop 치면 안나옴). __리미너 원격데스크탑 클라이언트 아님!!__
- 공유를 체크하고 보안 항목에서 "사용자가 이 암호를 입력" 에 자신이 사용할 암호를 입력한다. 알림 영역 아이콘도 체크해줌.

- guacamole New connection에서 아래의 항목만 체크해주면 된다. (Username을 비워놔도 되는게 신기)

```
Edit Connection
Name : 아무거나
Location : ROOT
Protocal : VNC

Concurrency Limits
Maximum_number_of_connections : 1 (또는 그 이상)
Maximum_number_of_connections per user : 1 (또는 그 이상)

Network
Hostname : vnc 접속하고자 하는 대상 ip
Port : 5900 (5901, 5902등 다 된다. 다만, 현재 리눅스 컴퓨터가 모니터 한대를 쓰고 있다면 5901이 점유중일 것이다. 두대쓰면 아마 5901,5902. 이 포트를 피해서 쓰면 된다.5900~5910)

Authentication
Username:
Password: <사용자가 이 암호를 입력> 에서 입력했던 비밀번호를 입력. 만약 안되면 접속 대상 pc의 root 번호를 입력해보자
```

## 6. RDP 설정
- 위와 마찬가지로 하되 Protocal은 RDP로, Port는 3389로 바꿔준다.  역시 마찬가지로 접속 대상컴퓨터의 원격 연결 허용을 먼저 해놓아야 한다.
- VNC와 달리 실제 테스트는 해보지 않았기에 실제로 해보기 바람
