---
title: jekyll blog 위한 도커
categories:
- docker
tags:
- docker
- jekyll
---

#### 1. 직접 command Line으로 실행하는 경우
- $ docker run --name blog -v ${PWD}:/srv/jekyll -p 4000:4000 -it jekyll/jekyll bash

- 진입하여 jekyll serve하면 된다.
- /admin 페이지를 위해 다음을 Gemfile에 입력한다.

```
source "https://rubygems.org"
gemspec

gem 'jekyll-admin', group:  :jekyll_plugins
#gem 'jekyll-sitemap'

```

- _config.yml파일의 변경을 가져올 경우 매번 다시 jekyll serve를 해줘야 한다. (또는 bundle exec)
-  gemfile의 플러그인을 받을 때는 bundle install 명령어를 실행한다. 

#### 2. Docker-compose.yml로 만들 경우

- 마운트 옵션 및 컨테이너 이름등을 설정하여 쉽게 올리고 내릴 수 있다.
- 단, 글을 등록하거나 설정 변경 후엔 compose자체를 내렸다가 올려야 하는데
  이때 캐시의 도움을 받지 못하므로 추천하지는 않는다.
- compose 파일의 목적 답게 여러 컨테이너가 유기적으로 작동이 필요한 경우에만 쓰도록 하자.
- (jekyll serve가 컨테이너의 메인 프로세스라 kill할 수도, 다시 시작할 수도 없다)

- jekyll-docker-compose.yml

```
version: '2.4'

services:
  jekyll:
    container_name: jekyll
    image: jekyll/jekyll
    restart: always
    volumes:
      - /home/petil/DockerData/jekyll_data/blog:/srv/jekyll
    command: jekyll serve
    ports : 
      - 4000:4000


# _config.yml 파일의 변동이 있을 경우
# command 에 bundle install && jekyll serve
```

- 파일 이름이 docker-compose.yml이 아니므로 -f옵션으로 강제 하여야 한다.
- 이름이 표준이면 그냥 docker-compose up 으로 가능

```
yml 파일 문법 검사
$ docker-compose -f jekyll-docker-compose.yml ps 

컨테이너 올림 (네트워크 설정 안해서 [소유주_default] 이름으로 자동으로 만들어짐)
백그라운드로 실행. 좀 기다려야 한다.
$ docker-compose -f jekyll-docker-compose.yml up -d

컨테이너 내림 (네트워크 지워짐. 만약 이미 존재하는 네트워크를 사용했을 경우엔 그대로 내버려둠)
$ docker-compose -f jekyll-docker-compose.yml down 

문제 있을 경우
$ docker logs jekyll
```
