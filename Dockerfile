FROM node:18 AS build

# 명령이 실행될 위치
WORKDIR /usr/src/app

# 위의 위치로 package.json, yarn.lock 파일을 복사
COPY package.json yarn.lock ./

# 의존성 설치
RUN yarn install

# 나머지 복사
COPY . .

RUN yarn build

### PRODUCTION

FROM node:18 as production

WORKDIR /usr/src/app

COPY --from=build /usr/src/app .

RUN yarn install --only=production

# 8080 포트를 사용한다는 의미(문서화)
EXPOSE 8080

CMD ["node", "dist/main"]

# Example Commands to buuild and run the dockerfile (without docker-compose)
# docker build -t 이름 .
# docker run 이름