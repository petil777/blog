---
title: Docker를 이용한 tensorflow gpu 환경 세팅 및 실행(feat. vscode)
categories:
- docker
- tensorflow
tags:
- tensorflow
---

- python 에디터들 중 pycharm이 제일 인기가 좋으나 도커 환경을 에디터에서 사용하고자 할 경우 professional 버전을 사용해야 한다.
- 이에 따라, 무료 에디터인 vscode 의 플러그인을 활용하여 python환경 및 tensorflow gpu환경, jupyter notebook을 활용하는 법을 정리한다

## 1. 확장 플러그인 설치 및 실행
- Python을 vscode에서 실행할 것이므로 우선적으로 Python 플러그인을 설치한다.
- Remote Development 를 검색하여 설치하면 remote-containers, remote-ssh를 비롯하여 도커에 접속하는 기능을 포함한 원격 접속 플러그인까지 한번에 설치해준다.
- Docker, Docker-Explorer 도 검색하여 vscode내에서 도커를 이용하기 위한 플러그인을 설치한다
- vscode 실행 후 Ctrl+Shift+p 버튼을 눌러 커멘드 라인 창을 열고 remote- 를 입력한다.
- Remote-Containers: Attach to Running Container... 를 선택하고 실행시켜준 도커 컨테이너를 선택한다.
- 또는 도커 플러그인을 설치하면  vscode 좌측에 고래 모양의 아이콘이 있는데 그것을 클릭하면 본인의 images, containers 목록들이 뜬다. 거기서 미리 조건에 맞게 실행시켜둔(mount, port 등) 컨테이너를 우클릭하고 Attach visual studio code 를 선택하면 도커 환경이 연결된 새 창의 vscode가 열린다

- vscode 하단의 컨테이너, 파이썬 버전들을 확인한다

## 2. 환경 세팅
- 도커 컨테이너와 연결된 vscode의 python 위치는 하단의 python을 클릭해보면 위치가 /usr/local/bin/python으로 나올텐데 이는 로컬의 위치가 아닌 도커 컨테이너 내부의 위치이다.
- 따라서 바깥에 구성해둔 가상환경과 동일한 환경을 구축하기 위해선 컨테이너 내에서 다시 pip install을 해줄 필요가 있다. (컨테이너 자체가 격리 환경이므로 이 안에서 다시 가상환경을 만드는 것은 무의미하다)
- 로컬에서 가상환경 activate후에 pip freeze > requirements.txt로 모듈 및 그 버전 리스트를 저장하고 컨테이너 내에서 그 파일을 이용해 pip install -r requirements.txt를 진행한다.
- __이때, 컨테이너 자체가 가진 <u>모듈 버전 중 중요한 것들(특히 tensorflow-gpu)은 미리 파악하여 requirements.txt에서 제외한 후 </u>install을 진행해야 한다. ( gpu 모듈은 그에 맞게 cuda, cudnn이 컨테이너내에 이미 구성되 있기 때문에 이를 바꾸는 것은 오동작을 불러일으킬 수 있다)__
- 추천하는 바로는 먼저 도커 컨테이너 내에 설치된 pip모듈 리스트를 로컬로 가져와 설치하고 그 종합된 리스트를 다시 도커 컨테이너 내로 가져가서 한번 더 pip install해주는 것이 좋다


## 3. 실행
- vscode 에서 실행을 하면 정상적으로 gpu 환경에서 코드를 실행할 수 있다. 
- vscode 내에서 jupyter notebook과 같이 cell 단위로 실행하고자 할 경우 #@@  를 치면 Cell 모드가 활성화되고 Shift+Enter를 쳐서 jupyter 처럼 활용할 수 있다
- Cell모드로 실행한 주피터 노트북 안에서 !jupyter notebook list 를 치면 토큰을 확인할 수 있다. (또는 도커 컨테이너 실행시에 확인해두자)
- jupyter notebook을 원할 경우 tensorflow/tensorflow:latest-gpu-jupyter 를 8888포트를 바인딩 했다면 접속할 수 있다.


## 4. 컨테이너 실행
- 명령어로 이용할 경우 아래와 같이 입력한다.
```
$ docker run --gpus all -it --name mytf -v ${PWD}:/tf -p 8888:8888 --network mynetwork tensorflow/tensorflow:latest-gpu-jupyter
```
- docker-compose.yml을 이용할 경우 아래 파일을 이용한다. (docker network create mynetwork 로 먼저 네트워크 만들기!)

```
version: '2.3'

services:
  mytensorflow:
    container_name: tfgpu
    image: tensorflow/tensorflow:latest-gpu-jupyter
    restart: always
    environment:
      - NVIDIA_VISIBLE_DEVICES=all
    volumes:
      - ${PWD}:/tf
    runtime: nvidia
    ports:
      - 8888:8888
    networks:
      - mynetwork

networks:
  mynetwork:
    external: true
```

```
$ docker-compose -f <yml파일이름> config  # 문법 확인
$ docker-compose -f <yml파일이름> up 
$ docker-compose -f <yml파일이름> down   #묶인 컨테이너들 전부 내림(network는 따로 만들었기 때문에 유지됨)
$ docker-compose -f <yml파일이름> stop    #묶인 컨테이너들 전부 삭제(network는 따로 만들었기 때문에 유지됨)
```
## 기타 vscode 실행 팁
- Ctrl + \`  : 터미널 열기
- Ctrl + \\ : 화면 분할
