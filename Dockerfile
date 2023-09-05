FROM node:16-alpine AS dev

# 명령이 실행될 위치
WORKDIR /usr/src/app

# 위의 위치로 복사
COPY package*.json ./
COPY yarn.lock ./

RUN yarn install

COPY . .

RUN yarn build

EXPOSE 8080

CMD [ "yarn", "start:dev" ]

### 

# FROM node:16-alpine AS PROD

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