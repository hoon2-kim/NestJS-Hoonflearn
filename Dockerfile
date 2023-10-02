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

FROM node:18-alpine AS prod

# FFmpeg 설치
RUN apk add --no-cache ffmpeg

# 시간대 설정(alpine은 시간대 설정이 UTC밖에 없기 때문에 tzdata를 설치 뒤 설정 후 지워줌)
RUN apk --no-cache add tzdata && \
    cp /usr/share/zoneinfo/Asia/Seoul /etc/localtime && \
    echo "Asia/Seoul" > /etc/timezone \
    apk del tzdata

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist

# 8080 포트를 사용한다는 의미(문서화)
EXPOSE 8080

CMD ["node", "dist/main.js"]
