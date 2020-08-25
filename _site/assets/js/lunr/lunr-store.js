var store = [{
        "title": "도커 설치 및 기본 사용가이드",
        "excerpt":"1. 도커 설치 https://docs.docker.com/engine/install/ubuntu/ 2020년 8월 기준으로 위의 공식문서대로 도커를 설치하면 된다. Old version remove하고자 할 때 $ sudo apt-get remove docker docker-engine docker.io containerd runc Set up repository $ sudo apt-get update $ sudo apt-get install \\ apt-transport-https \\ ca-certificates \\ curl \\ gnupg-agent \\ software-properties-common Add Docker’s official...","categories": ["docker"],
        "tags": ["docker"],
        "url": "http://0.0.0.0:4000/docker/%EB%8F%84%EC%BB%A4-%EC%84%A4%EC%B9%98-%EB%B0%8F-%EA%B8%B0%EB%B3%B8-%EC%82%AC%EC%9A%A9-%EA%B0%80%EC%9D%B4%EB%93%9C/",
        "teaser": null
      },{
        "title": "jekyll blog 위한 도커",
        "excerpt":"1. 직접 command Line으로 실행하는 경우 docker run –name blog -v ${PWD}:/srv/jekyll -p 4000:4000 -it jekyll/jekyll bash 진입하여 jekyll serve하면 된다. /admin 페이지를 위해 다음을 Gemfile에 입력한다. source \"https://rubygems.org\" gemspec gem 'jekyll-admin', group: :jekyll_plugins #gem 'jekyll-sitemap' _config.yml파일의 변경을 가져올 경우 매번 다시 jekyll serve를 해줘야 한다. (또는 bundle exec) gemfile의...","categories": ["docker"],
        "tags": ["docker","jekyll"],
        "url": "http://0.0.0.0:4000/docker/jekyll-blog%EB%A5%BC-%EC%9C%84%ED%95%9C-docker/",
        "teaser": null
      },{
        "title": "Markdown 문법",
        "excerpt":"1. 제목 제목 크기는 #과 공백 한 칸으로 한다. #개수가 많아질수록 헤더의 크기가 작아진다. (1개부터 6개까지) 제일 큰 제목 두번째 큰 제목 2. 수평선 --- 또는 *** 등으로 구분 3. 글씨 및 인용 -또는 * 를 이용해 마커가 표시된 들여쓰기를 할 수 있다. &gt; 를 사용하면인용 표시가 된 들여쓰기를 할...","categories": ["markdown"],
        "tags": ["markdown"],
        "url": "http://0.0.0.0:4000/markdown/Markdown%EB%AC%B8%EB%B2%95/",
        "teaser": null
      }]
