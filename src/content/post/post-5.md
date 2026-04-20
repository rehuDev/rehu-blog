---
title: "셀프호스팅 입문"
slug: "selfhosting-gogo"
description: "셀프호스팅 입문 임시"
image: "https://docs.astro.build/assets/arc.webp"
pubDate: 2026-04-15T21:36
updDate: 2026-04-20T02:42
categories:
  - "Dev"
  - "IT"
mcategories:
  - "셀프호스팅"
---

- 콘텐츠 관리용으로 헤드리스 CMS를 Docker 컨테이너에 설치한다. 내부 IP 로만 접속 가능하도록 설정할 것이다. 여기서 글을 작성하고, 이미지/영상/파일을 업로드한다. (Strapi 또는 Directus)
- 블로그 프론트엔드로 정적 사이트 생성기 SSG 선택. 헤드리스 CMS 에 API 를 통해 접속하여 콘텐츠를 가져와, 정적인 웹사이트 파일들 (HTML 등) 을 생성 (Build) 한다. 생성된 정적 파일들만 웹서버를 통해 외부 사용자에게 보여준다. (Astro)
- 웹서버는 빌드된 정적 파일들을 서비스하는 용도로만 사용되어 보안 위협이 적다. (Nginx)

홈서버를 외부 인터넷에 안전하게 노출시키기 위해서는 **리버스 프록시**를 사용해야 한다.
