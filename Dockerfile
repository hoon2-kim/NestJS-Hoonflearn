FROM node:16-alpine AS dev

# 명령이 실행될 위치
WORKDIR /usr/src/app

# 위의 위치로 package.json과 yarn.lock 파일을 복사
COPY package*.json ./
COPY yarn.lock ./

# 의존성 설치
RUN yarn install

# 나머지 복사
COPY . .

# 포트 노출(문서화가 목적)
EXPOSE 8080

CMD [ "yarn", "start:dev" ]

### 

# FROM node:16 AS PROD

# # 명령이 실행될 위치
# WORKDIR /usr/src/app

# # 위의 위치로 복사
# COPY package*.json ./s
# COPY yarn.lock ./

# RUN yarn install

# COPY . .

# RUN yarn build

# EXPOSE 8080

# CMD [ "node", "dist/main.js" ]