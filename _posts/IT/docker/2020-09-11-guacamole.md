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
$ sudo docker run -d --name guacd guacamole/guacd

mysql 대신 mysql-server 로 받으면 용량을 좀 더 작게 쓸 수 있다. 참고..
$ sudo docker run -d --name mysql_db -e MYSQL_ROOT_PASSWORD='MY_PASSWORD' mysql

DB 초기화를 위한 sql파일 로컬 호스트에 생성
$ sudo docker run --rm guacamole/guacamole /opt/guacamole/bin/initdb.sh --mysql > initdb.sql

생성한 sql파일을 컨테이너 안으로 넣기
$	sudo docker cp ./initdb.sql mysql_db:/tmp/initdb.sql

$ sudo docker exec -it mysql_db bash # 컨테이너 안으로 접속
$	mysql -u root -p # 컨테이너 생성시 만든 비밀번호 입력
$	CREATE DATABASE guacamole_db;
$	CREATE USER 'guacamole_user'@'%' IDENTIFIED BY 'GUACAMOLE_PASSWORD';
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
- 1번에서 sql파일 실행해서 설정 완료하는 cat 명령어 까지 실행했다면 이 하위의 compose 파일 하나로 구아카몰을 실행할 수 있다.
- compose파일은 link대신 network를 이용해보았다

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
#      GUACD_HOSTNAME: guacd
      MYSQL_DATABASE: guacamole_db
      MYSQL_USER: guacamole_user
      MYSQL_PASSWORD: qwe098QQ!
    restart: always
    ports:
      - 8080:8080
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
- -f 옵션 썼다면 down, stop시에도 똑같이 해줘야 한다... 
- docker-compose -f <파일이름> down   docker-compose -f <파일이름> stop
