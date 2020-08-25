---
title: jekyll blog 위한 도커
categories:
- docker
tags:
- docker
- jekyll
---

#### 1. 직접 command Line으로 실행하는 경우
docker run --name blog -v ${PWD}:/srv/jekyll -p 4000:4000 -it jekyll/jekyll bash

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
#### 2. Dockerfile로 만들 경우
