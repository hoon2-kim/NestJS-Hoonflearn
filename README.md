# Hoonflearn [![Hits](https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2Fgithub.com%2Fhoon2-kim%2FNestJS-Hoonflearn&count_bg=%2379C83D&title_bg=%23555555&icon=&icon_color=%23E7E7E7&title=hits&edge_flat=false)](https://hits.seeyoufarm.com)

---

## 프로젝트 소개

부트캠프에서 NestJS + GraphQL로 팀 프로젝트를 했는데 REST-API를 학습하고자 개인 프로젝트를 진행하게 되었습니다.

인터넷강의 사이트인 인프런을 이용하면서 내가 만약 강의 사이트를 만든다면 어떻게 만들까라는 호기심에서 시작하게 되었습니다.

---

## 배포 주소

> **개인 프로젝트 백엔드 Swagger** : [http://hoonflearn.shop/api-docs](http://hoonflearn.shop/api-docs)<br>
>
> 스웨거 아이디 : hoon / 비밀번호 : 1234

---

## Stacks 🐈

- NestJS
- TypeScript
- PostgreSQL
- TypeORM
- Docker
- AWS EC2, RDS, S3, Route 53, ECR
- Github Actions

---

## 주요 기능 📦

- 회원가입 시 선택적으로 프로필 이미지를 업로드 할 수 있습니다.
- 로그인 한 후 지식공유자 프로필을 등록하면 지식공유자가 됩니다.
- 지식공유자는 강의 생성, 강의 썸네일 업로드, 강의의 커리큘럼(섹션,수업) 등록, 수업에 영상 업로드, 강의 수정, 강의 삭제가 가능합니다.
- 유료 강의의 경우 구매검증을 통해 구매가 완료되며, 무료 강의는 바로 신청 가능합니다.
- 강의를 구매한 유저는 리뷰,질문글을 작성할 수 있습니다.
- 질문글을 작성한 작성자는 질문글의 상태(해결,미해결)를 바꿀 수 있습니다.
- 질문글에 추천,비추천을 줄 수 있습니다.

---

## 시작 가이드

```bash
# FFmpeg가 로컬에 설치되어 있지않다면 설치해주세요.
$ brew install ffmpeg

$ yarn install  / npm install

$ yarn start:dev / npm run start:dev
```

---

## 아키텍쳐

![아키텍처](https://github.com/hoon2-kim/nestjs-postgresql-graphql-survey/assets/107983013/c5419509-8457-4ce4-8858-990b310786b7)

---

### ERD

![erd](https://github.com/hoon2-kim/nestjs-postgresql-graphql-survey/assets/107983013/d574ebde-dda7-4f0f-95f0-5882be723958)

---

### 폴더 구조

<details>
  <summary><b>Back-end (NestJS)</b></summary>

```
📦hoonflearn-server
 ┃ 📂.github
 ┃ ┣ 📂workflows
 ┃ ┃   ┗ 📜deploy.yml
 ┣ 📂src
 ┃ ┣ 📂auth
 ┃ ┃ ┣ 📂__tests__
 ┃ ┃ ┃ ┣ 📜auth.controller.spec.ts
 ┃ ┃ ┃ ┗ 📜auth.service.spec.ts
 ┃ ┃ ┣ 📂decorators
 ┃ ┃ ┃ ┣ 📜current-optionalUser.decorator.ts
 ┃ ┃ ┃ ┣ 📜current-user.decorator.ts
 ┃ ┃ ┃ ┗ 📜role-protected.decorator.ts
 ┃ ┃ ┣ 📂dtos
 ┃ ┃ ┃ ┗ 📂request
 ┃ ┃ ┃ ┃ ┗ 📜login-user.dto.ts
 ┃ ┃ ┣ 📂guards
 ┃ ┃ ┃ ┣ 📜at.guard.ts
 ┃ ┃ ┃ ┣ 📜public.guard.ts
 ┃ ┃ ┃ ┣ 📜role.guard.ts
 ┃ ┃ ┃ ┗ 📜rt.guard.ts
 ┃ ┃ ┣ 📂interfaces
 ┃ ┃ ┃ ┣ 📜auth.interface.ts
 ┃ ┃ ┃ ┗ 📜jwt-payload.interface.ts
 ┃ ┃ ┣ 📂strategies
 ┃ ┃ ┃ ┣ 📜jwt-at.strategy.ts
 ┃ ┃ ┃ ┗ 📜jwt-rt.strategy.ts
 ┃ ┃ ┣ 📂types
 ┃ ┃ ┃ ┗ 📜tokens.type.ts
 ┃ ┃ ┣ 📜auth.controller.ts
 ┃ ┃ ┣ 📜auth.module.ts
 ┃ ┃ ┣ 📜auth.service.ts
 ┃ ┃ ┗ 📜auth.swagger.ts
 ┃ ┣ 📂aws-s3
 ┃ ┃ ┣ 📜aws-s3.module.ts
 ┃ ┃ ┗ 📜aws-s3.service.ts
 ┃ ┣ 📂cart
 ┃ ┃ ┣ 📂__tests__
 ┃ ┃ ┃ ┣ 📜cart.controller.spec.ts
 ┃ ┃ ┃ ┗ 📜cart.service.spec.ts
 ┃ ┃ ┣ 📂dtos
 ┃ ┃ ┃ ┣ 📂request
 ┃ ┃ ┃ ┃ ┗ 📜create-cart.dto.ts
 ┃ ┃ ┃ ┗ 📂response
 ┃ ┃ ┃ ┃ ┗ 📜cart.response.dto.ts
 ┃ ┃ ┣ 📂entities
 ┃ ┃ ┃ ┗ 📜cart.entity.ts
 ┃ ┃ ┣ 📂interfaces
 ┃ ┃ ┃ ┗ 📜cart.interface.ts
 ┃ ┃ ┣ 📜cart.controller.ts
 ┃ ┃ ┣ 📜cart.module.ts
 ┃ ┃ ┣ 📜cart.service.ts
 ┃ ┃ ┗ 📜cart.swagger.ts
 ┃ ┣ 📂cart_course
 ┃ ┃ ┣ 📂__tests__
 ┃ ┃ ┃ ┗ 📜cart_course.service.spec.ts
 ┃ ┃ ┣ 📂entities
 ┃ ┃ ┃ ┗ 📜cart-course.entity.ts
 ┃ ┃ ┣ 📜cart_course.module.ts
 ┃ ┃ ┗ 📜cart_course.service.ts
 ┃ ┣ 📂category
 ┃ ┃ ┣ 📂__tests__
 ┃ ┃ ┃ ┣ 📜category.controller.spec.ts
 ┃ ┃ ┃ ┗ 📜category.service.spec.ts
 ┃ ┃ ┣ 📂dtos
 ┃ ┃ ┃ ┣ 📂request
 ┃ ┃ ┃ ┃ ┣ 📜create-category.dto.ts
 ┃ ┃ ┃ ┃ ┗ 📜update-category.dto.ts
 ┃ ┃ ┃ ┗ 📂response
 ┃ ┃ ┃ ┃ ┗ 📜category.response.dto.ts
 ┃ ┃ ┣ 📂entities
 ┃ ┃ ┃ ┗ 📜category.entity.ts
 ┃ ┃ ┣ 📂interfaces
 ┃ ┃ ┃ ┗ 📜category.interface.ts
 ┃ ┃ ┣ 📜category.controller.ts
 ┃ ┃ ┣ 📜category.module.ts
 ┃ ┃ ┣ 📜category.service.ts
 ┃ ┃ ┗ 📜category.swagger.ts
 ┃ ┣ 📂category_course
 ┃ ┃ ┣ 📂__tests__
 ┃ ┃ ┃ ┗ 📜category_course.service.spec.ts
 ┃ ┃ ┣ 📂dtos
 ┃ ┃ ┃ ┗ 📂response
 ┃ ┃ ┃ ┃ ┗ 📜category-course.response.dto.ts
 ┃ ┃ ┣ 📂entities
 ┃ ┃ ┃ ┗ 📜category-course.entitiy.ts
 ┃ ┃ ┣ 📂interfaces
 ┃ ┃ ┃ ┗ 📜category-course.interface.ts
 ┃ ┃ ┣ 📜category_course.module.ts
 ┃ ┃ ┗ 📜category_course.service.ts
 ┃ ┣ 📂common
 ┃ ┃ ┣ 📂dtos
 ┃ ┃ ┃ ┣ 📜page-meta.dto.ts
 ┃ ┃ ┃ ┣ 📜page-option.dto.ts
 ┃ ┃ ┃ ┗ 📜page.dto.ts
 ┃ ┃ ┣ 📂filters
 ┃ ┃ ┃ ┗ 📜http-api-exception.filter.ts
 ┃ ┃ ┣ 📂helpers
 ┃ ┃ ┃ ┣ 📜fileFilter.helper.ts
 ┃ ┃ ┃ ┗ 📜getVideoDuration.helper.ts
 ┃ ┃ ┗ 📂pipes
 ┃ ┃ ┃ ┗ 📜course-price.pipe.ts
 ┃ ┣ 📂config
 ┃ ┃ ┗ 📜database.ts
 ┃ ┣ 📂course
 ┃ ┃ ┣ 📂__tests__
 ┃ ┃ ┃ ┣ 📜course.controller.spec.ts
 ┃ ┃ ┃ ┗ 📜course.service.spec.ts
 ┃ ┃ ┣ 📂dtos
 ┃ ┃ ┃ ┣ 📂query
 ┃ ┃ ┃ ┃ ┗ 📜course-list.query.dto.ts
 ┃ ┃ ┃ ┣ 📂request
 ┃ ┃ ┃ ┃ ┣ 📜create-course.dto.ts
 ┃ ┃ ┃ ┃ ┗ 📜update-course.dto.ts
 ┃ ┃ ┃ ┗ 📂response
 ┃ ┃ ┃ ┃ ┗ 📜course.response.ts
 ┃ ┃ ┣ 📂entities
 ┃ ┃ ┃ ┗ 📜course.entity.ts
 ┃ ┃ ┣ 📂enums
 ┃ ┃ ┃ ┗ 📜course.enum.ts
 ┃ ┃ ┣ 📂interfaces
 ┃ ┃ ┃ ┗ 📜course.interface.ts
 ┃ ┃ ┣ 📜.DS_Store
 ┃ ┃ ┣ 📜course.controller.ts
 ┃ ┃ ┣ 📜course.module.ts
 ┃ ┃ ┣ 📜course.service.ts
 ┃ ┃ ┗ 📜course.swagger.ts
 ┃ ┣ 📂course_user
 ┃ ┃ ┣ 📂__tests__
 ┃ ┃ ┃ ┗ 📜course_user.service.spec.ts
 ┃ ┃ ┣ 📂dtos
 ┃ ┃ ┃ ┗ 📂response
 ┃ ┃ ┃ ┃ ┗ 📜course-user.response.dto.ts
 ┃ ┃ ┣ 📂entities
 ┃ ┃ ┃ ┗ 📜course-user.entity.ts
 ┃ ┃ ┣ 📂enums
 ┃ ┃ ┃ ┗ 📜course-user.enum.ts
 ┃ ┃ ┣ 📂interfaces
 ┃ ┃ ┃ ┗ 📜course-user.interface.ts
 ┃ ┃ ┣ 📜course-user.module.ts
 ┃ ┃ ┗ 📜course-user.service.ts
 ┃ ┣ 📂course_wish
 ┃ ┃ ┣ 📂__tests__
 ┃ ┃ ┃ ┗ 📜course_wish.service.spec.ts
 ┃ ┃ ┣ 📂dtos
 ┃ ┃ ┃ ┗ 📂response
 ┃ ┃ ┃ ┃ ┗ 📜course-wish.reponse.dto.ts
 ┃ ┃ ┣ 📂entities
 ┃ ┃ ┃ ┗ 📜course-wish.entity.ts
 ┃ ┃ ┣ 📂interfaces
 ┃ ┃ ┃ ┗ 📜course-wish.interface.ts
 ┃ ┃ ┣ 📜course_wish.module.ts
 ┃ ┃ ┗ 📜course_wish.service.ts
 ┃ ┣ 📂instructor
 ┃ ┃ ┣ 📂__tests__
 ┃ ┃ ┃ ┣ 📜instructor.controller.spec.ts
 ┃ ┃ ┃ ┗ 📜instructor.service.spec.ts
 ┃ ┃ ┣ 📂dtos
 ┃ ┃ ┃ ┣ 📂query
 ┃ ┃ ┃ ┃ ┗ 📜instructor.query.dto.ts
 ┃ ┃ ┃ ┗ 📂request
 ┃ ┃ ┃ ┃ ┣ 📜create-instructor.dto.ts
 ┃ ┃ ┃ ┃ ┗ 📜update-instructor.dto.ts
 ┃ ┃ ┣ 📂entities
 ┃ ┃ ┃ ┗ 📜instructor-profile.entity.ts
 ┃ ┃ ┣ 📂enums
 ┃ ┃ ┃ ┗ 📜instructor.enum.ts
 ┃ ┃ ┣ 📂interfaces
 ┃ ┃ ┃ ┗ 📜instructor.interface.ts
 ┃ ┃ ┣ 📜instructor.controller.ts
 ┃ ┃ ┣ 📜instructor.module.ts
 ┃ ┃ ┣ 📜instructor.service.ts
 ┃ ┃ ┗ 📜instructor.swagger.ts
 ┃ ┣ 📂lesson
 ┃ ┃ ┣ 📂__tests__
 ┃ ┃ ┃ ┣ 📜lesson.controller.spec.ts
 ┃ ┃ ┃ ┗ 📜lesson.service.spec.ts
 ┃ ┃ ┣ 📂dtos
 ┃ ┃ ┃ ┣ 📂request
 ┃ ┃ ┃ ┃ ┣ 📜create-lesson.dto.ts
 ┃ ┃ ┃ ┃ ┗ 📜update-lesson.dto.ts
 ┃ ┃ ┃ ┗ 📂response
 ┃ ┃ ┃ ┃ ┗ 📜lesson.response.dto.ts
 ┃ ┃ ┣ 📂entities
 ┃ ┃ ┃ ┗ 📜lesson.entity.ts
 ┃ ┃ ┣ 📂enums
 ┃ ┃ ┃ ┗ 📜lesson.enum.ts
 ┃ ┃ ┣ 📂interfaces
 ┃ ┃ ┃ ┗ 📜lesson.interface.ts
 ┃ ┃ ┣ 📜lesson.controller.ts
 ┃ ┃ ┣ 📜lesson.module.ts
 ┃ ┃ ┣ 📜lesson.service.ts
 ┃ ┃ ┗ 📜lesson.swagger.ts
 ┃ ┣ 📂order
 ┃ ┃ ┣ 📂__tests__
 ┃ ┃ ┃ ┣ 📜order.controller.spec.ts
 ┃ ┃ ┃ ┗ 📜order.service.spec.ts
 ┃ ┃ ┣ 📂dtos
 ┃ ┃ ┃ ┣ 📂query
 ┃ ┃ ┃ ┃ ┗ 📜order-list.query.dto.ts
 ┃ ┃ ┃ ┣ 📂request
 ┃ ┃ ┃ ┃ ┗ 📜create-order.dto.ts
 ┃ ┃ ┃ ┗ 📂response
 ┃ ┃ ┃ ┃ ┗ 📜order.response.dto.ts
 ┃ ┃ ┣ 📂entities
 ┃ ┃ ┃ ┗ 📜order.entity.ts
 ┃ ┃ ┣ 📂enums
 ┃ ┃ ┃ ┗ 📜order.enum.ts
 ┃ ┃ ┣ 📂interfaces
 ┃ ┃ ┃ ┗ 📜order.interface.ts
 ┃ ┃ ┣ 📜iamport.service.ts
 ┃ ┃ ┣ 📜order.controller.ts
 ┃ ┃ ┣ 📜order.module.ts
 ┃ ┃ ┣ 📜order.service.ts
 ┃ ┃ ┗ 📜order.swagger.ts
 ┃ ┣ 📂order_course
 ┃ ┃ ┣ 📂__tests__
 ┃ ┃ ┃ ┗ 📜order_course.service.spec.ts
 ┃ ┃ ┣ 📂dtos
 ┃ ┃ ┃ ┗ 📂response
 ┃ ┃ ┃ ┃ ┗ 📜order-course.response.dto.ts
 ┃ ┃ ┣ 📂entities
 ┃ ┃ ┃ ┗ 📜order-course.entity.ts
 ┃ ┃ ┣ 📂interfaces
 ┃ ┃ ┃ ┗ 📜order-course.interface.ts
 ┃ ┃ ┣ 📜order-course.module.ts
 ┃ ┃ ┗ 📜order-course.service.ts
 ┃ ┣ 📂question
 ┃ ┃ ┣ 📂__tests__
 ┃ ┃ ┃ ┣ 📜question.controller.spec.ts
 ┃ ┃ ┃ ┗ 📜question.service.spec.ts
 ┃ ┃ ┣ 📂dtos
 ┃ ┃ ┃ ┣ 📂query
 ┃ ┃ ┃ ┃ ┗ 📜question-list.query.dto.ts
 ┃ ┃ ┃ ┣ 📂request
 ┃ ┃ ┃ ┃ ┣ 📜create-question.dto.ts
 ┃ ┃ ┃ ┃ ┣ 📜question-status.dto.ts
 ┃ ┃ ┃ ┃ ┣ 📜question-vote.dto.ts
 ┃ ┃ ┃ ┃ ┗ 📜update-question.dto.ts
 ┃ ┃ ┃ ┗ 📂response
 ┃ ┃ ┃ ┃ ┗ 📜question.response.dto.ts
 ┃ ┃ ┣ 📂entities
 ┃ ┃ ┃ ┗ 📜question.entity.ts
 ┃ ┃ ┣ 📂enums
 ┃ ┃ ┃ ┗ 📜question.enum.ts
 ┃ ┃ ┣ 📂events
 ┃ ┃ ┃ ┗ 📜question-hit.event.ts
 ┃ ┃ ┣ 📂interfaces
 ┃ ┃ ┃ ┗ 📜question.interface.ts
 ┃ ┃ ┣ 📂listeners
 ┃ ┃ ┃ ┗ 📜question-hit.listener.ts
 ┃ ┃ ┣ 📜question.controller.ts
 ┃ ┃ ┣ 📜question.module.ts
 ┃ ┃ ┣ 📜question.service.ts
 ┃ ┃ ┗ 📜question.swagger.ts
 ┃ ┣ 📂question-comment
 ┃ ┃ ┣ 📂__tests__
 ┃ ┃ ┃ ┣ 📜question-comment.controller.spec.ts
 ┃ ┃ ┃ ┣ 📜question-comment.service.spec.ts
 ┃ ┃ ┃ ┣ 📜question-recomment.controller.spec.ts
 ┃ ┃ ┃ ┗ 📜question-recomment.service.spec.ts
 ┃ ┃ ┣ 📂dtos
 ┃ ┃ ┃ ┣ 📂request
 ┃ ┃ ┃ ┃ ┣ 📜create-question-comment.dto.ts
 ┃ ┃ ┃ ┃ ┗ 📜update-question-comment.dto.ts
 ┃ ┃ ┃ ┗ 📂response
 ┃ ┃ ┃ ┃ ┗ 📜question-comment.response.dto.ts
 ┃ ┃ ┣ 📂entities
 ┃ ┃ ┃ ┗ 📜question-comment.entity.ts
 ┃ ┃ ┣ 📂interfaces
 ┃ ┃ ┃ ┗ 📜question-comment.interface.ts
 ┃ ┃ ┣ 📂question-reComment
 ┃ ┃ ┃ ┣ 📂dtos
 ┃ ┃ ┃ ┃ ┗ 📂request
 ┃ ┃ ┃ ┃ ┃ ┣ 📜create-question-recomment.dto.ts
 ┃ ┃ ┃ ┃ ┃ ┗ 📜update-question-recomment.dto.ts
 ┃ ┃ ┃ ┣ 📜question-recomment.controller.ts
 ┃ ┃ ┃ ┗ 📜question-recomment.service.ts
 ┃ ┃ ┣ 📜question-comment.controller.ts
 ┃ ┃ ┣ 📜question-comment.module.ts
 ┃ ┃ ┣ 📜question-comment.service.ts
 ┃ ┃ ┗ 📜question-comment.swagger.ts
 ┃ ┣ 📂question-vote
 ┃ ┃ ┣ 📂__tests__
 ┃ ┃ ┃ ┗ 📜question-vote.service.spec.ts
 ┃ ┃ ┣ 📂entities
 ┃ ┃ ┃ ┗ 📜question-vote.entity.ts
 ┃ ┃ ┣ 📂enums
 ┃ ┃ ┃ ┗ 📜question-vote.enum.ts
 ┃ ┃ ┣ 📜question-vote.module.ts
 ┃ ┃ ┗ 📜question-vote.service.ts
 ┃ ┣ 📂review
 ┃ ┃ ┣ 📂__tests__
 ┃ ┃ ┃ ┣ 📜review.controller.spec.ts
 ┃ ┃ ┃ ┗ 📜review.service.spec.ts
 ┃ ┃ ┣ 📂dtos
 ┃ ┃ ┃ ┣ 📂query
 ┃ ┃ ┃ ┃ ┗ 📜review-list.query.dto.ts
 ┃ ┃ ┃ ┣ 📂request
 ┃ ┃ ┃ ┃ ┣ 📜create-review.dto.ts
 ┃ ┃ ┃ ┃ ┗ 📜update-review.dto.ts
 ┃ ┃ ┃ ┗ 📂response
 ┃ ┃ ┃ ┃ ┗ 📜review.response.dto.ts
 ┃ ┃ ┣ 📂entities
 ┃ ┃ ┃ ┗ 📜review.entity.ts
 ┃ ┃ ┣ 📂enums
 ┃ ┃ ┃ ┗ 📜review.enum.ts
 ┃ ┃ ┣ 📂interfaces
 ┃ ┃ ┃ ┗ 📜review.interface.ts
 ┃ ┃ ┣ 📜review.controller.ts
 ┃ ┃ ┣ 📜review.module.ts
 ┃ ┃ ┣ 📜review.service.ts
 ┃ ┃ ┗ 📜review.swagger.ts
 ┃ ┣ 📂review-comment
 ┃ ┃ ┣ 📂__tests__
 ┃ ┃ ┃ ┣ 📜review-comment.controller.spec.ts
 ┃ ┃ ┃ ┗ 📜review-comment.service.spec.ts
 ┃ ┃ ┣ 📂dtos
 ┃ ┃ ┃ ┣ 📂request
 ┃ ┃ ┃ ┃ ┣ 📜create-review-comment.dto.ts
 ┃ ┃ ┃ ┃ ┗ 📜update-review-comment.dto.ts
 ┃ ┃ ┃ ┗ 📂response
 ┃ ┃ ┃ ┃ ┗ 📜review-comment.response.dto.ts
 ┃ ┃ ┣ 📂entities
 ┃ ┃ ┃ ┗ 📜review-comment.entity.ts
 ┃ ┃ ┣ 📂interfaces
 ┃ ┃ ┃ ┗ 📜review-comment.interface.ts
 ┃ ┃ ┣ 📜review-comment.controller.ts
 ┃ ┃ ┣ 📜review-comment.module.ts
 ┃ ┃ ┣ 📜review-comment.service.ts
 ┃ ┃ ┗ 📜review-comment.swagger.ts
 ┃ ┣ 📂review-like
 ┃ ┃ ┣ 📂__tests__
 ┃ ┃ ┃ ┗ 📜review-like.service.spec.ts
 ┃ ┃ ┣ 📂entities
 ┃ ┃ ┃ ┗ 📜review-like.entity.ts
 ┃ ┃ ┣ 📜review-like.module.ts
 ┃ ┃ ┗ 📜review-like.service.ts
 ┃ ┣ 📂section
 ┃ ┃ ┣ 📂__tests__
 ┃ ┃ ┃ ┣ 📜section.controller.spec.ts
 ┃ ┃ ┃ ┗ 📜section.service.spec.ts
 ┃ ┃ ┣ 📂dtos
 ┃ ┃ ┃ ┣ 📂request
 ┃ ┃ ┃ ┃ ┣ 📜create-section.dto.ts
 ┃ ┃ ┃ ┃ ┗ 📜update-section.dto.ts
 ┃ ┃ ┃ ┗ 📂response
 ┃ ┃ ┃ ┃ ┗ 📜section.response.dto.ts
 ┃ ┃ ┣ 📂entities
 ┃ ┃ ┃ ┗ 📜section.entity.ts
 ┃ ┃ ┣ 📂interfaces
 ┃ ┃ ┃ ┗ 📜section.interface.ts
 ┃ ┃ ┣ 📜section.controller.ts
 ┃ ┃ ┣ 📜section.module.ts
 ┃ ┃ ┣ 📜section.service.ts
 ┃ ┃ ┗ 📜section.swagger.ts
 ┃ ┣ 📂user
 ┃ ┃ ┣ 📂__tests__
 ┃ ┃ ┃ ┣ 📜user.controller.spec.ts
 ┃ ┃ ┃ ┗ 📜user.service.spec.ts
 ┃ ┃ ┣ 📂dtos
 ┃ ┃ ┃ ┣ 📂query
 ┃ ┃ ┃ ┃ ┗ 📜user.query.dto.ts
 ┃ ┃ ┃ ┣ 📂request
 ┃ ┃ ┃ ┃ ┣ 📜create-user.dto.ts
 ┃ ┃ ┃ ┃ ┗ 📜update-user.dto.ts
 ┃ ┃ ┃ ┗ 📂response
 ┃ ┃ ┃ ┃ ┗ 📜user.response.ts
 ┃ ┃ ┣ 📂entities
 ┃ ┃ ┃ ┗ 📜user.entity.ts
 ┃ ┃ ┣ 📂enums
 ┃ ┃ ┃ ┗ 📜user.enum.ts
 ┃ ┃ ┣ 📂interfaces
 ┃ ┃ ┃ ┗ 📜user.interface.ts
 ┃ ┃ ┣ 📜user.controller.ts
 ┃ ┃ ┣ 📜user.module.ts
 ┃ ┃ ┣ 📜user.service.ts
 ┃ ┃ ┗ 📜user.swagger.ts
 ┃ ┣ 📂video
 ┃ ┃ ┣ 📂__tests__
 ┃ ┃ ┃ ┣ 📜video.controller.spec.ts
 ┃ ┃ ┃ ┗ 📜video.service.spec.ts
 ┃ ┃ ┣ 📂dtos
 ┃ ┃ ┃ ┗ 📂response
 ┃ ┃ ┃ ┃ ┗ 📜video.response.dto.ts
 ┃ ┃ ┣ 📂entities
 ┃ ┃ ┃ ┗ 📜video.entity.ts
 ┃ ┃ ┣ 📂interfaces
 ┃ ┃ ┃ ┗ 📜video.interface.ts
 ┃ ┃ ┣ 📜video.controller.ts
 ┃ ┃ ┣ 📜video.module.ts
 ┃ ┃ ┣ 📜video.service.ts
 ┃ ┃ ┗ 📜video.swagger.ts
 ┃ ┣ 📂voucher
 ┃ ┃ ┣ 📂__tests__
 ┃ ┃ ┃ ┣ 📜voucher.controller.spec.ts
 ┃ ┃ ┃ ┗ 📜voucher.service.spec.ts
 ┃ ┃ ┣ 📂dtos
 ┃ ┃ ┃ ┗ 📜create-voucher.dto.ts
 ┃ ┃ ┣ 📜voucher.controller.ts
 ┃ ┃ ┣ 📜voucher.module.ts
 ┃ ┃ ┣ 📜voucher.service.ts
 ┃ ┃ ┗ 📜voucher.swagger.ts
 ┃ ┣ 📜api-docs.swagger.ts
 ┃ ┣ 📜app.controller.ts
 ┃ ┣ 📜app.module.ts
 ┃ ┗ 📜main.ts
 ┣ 📂test
 ┃ ┣ 📜app.e2e-spec.ts
 ┃ ┗ 📜jest-e2e.json
 ┣ 📂views
 ┃ ┗ 📜order.html
 ┣ 📜.dockerignore
 ┣ 📜.env
 ┣ 📜.env.example
 ┣ 📜.env.prod
 ┣ 📜.eslintrc.js
 ┣ 📜.gitignore
 ┣ 📜.prettierrc
 ┣ 📜Dockerfile
 ┣ 📜README.md
 ┣ 📜nest-cli.json
 ┣ 📜package.json
 ┣ 📜tsconfig.build.json
 ┣ 📜tsconfig.json
 ┗ 📜yarn.lock
```

</details>
