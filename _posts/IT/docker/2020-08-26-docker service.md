---
title: docker service 파일 만들기
categories:
- docker
tags:
- docker
- service
---

# 1. service 파일 위치    
- /etc/systemd/system 에 위치한다
- [서비스이름].service 로 파일을 만든다.
- 서비스 실행파일은 절대경로로 하는 것이 좋으므로 docker 명령어의 절대경로를 이용한다.
- 추후에 서비스를 지우고 싶으면 비활성화 시킨 후 service파일을 지운다.
- 밑의 예시는 multi-user.target을 설정하여 system 디렉토리의 multi-user.target.wants 내에도 존재하게 된다.
- 여러개를 실행하고자 할 경우 bash 명령어에 직접 쓰는 형태로 한다. (아래 예시와 같이)

__서비스 파일 예시__    
```
[Unit]
Wants=docker.service
After=docker.service
 
[Service]
RemainAfterExit=yes
ExecStart=/bin/bash -c "/usr/bin/docker start [실행할 docker container 이름]; /usr/bin/docker start [실행할 docker container 이름]"
ExecStop=/usr/bin/docker stop [실행할 docker container 이름]
 
[Install]
WantedBy=multi-user.target
```

__서비스 시작 및 종료__
```
$ systemctl start [설정한 서비스] → 서비스를 시작

$ systemctl enable [설정한 서비스] → 부팅시 실행할 수 있도록 해당 서비스 활성화

$ systemctl disable [설정한 서비스] → 부팅시 실행안하도록 해당 서비스 비활성화

$ systemctl list-unit-files |grep docker →  도커 서비스들 확인가능
```
