FROM node:18 AS development

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

# Set node env to prod
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

# Copy all from development stage
COPY --from=development /usr/src/app/ .

EXPOSE 8080

# Run app
CMD [ "node","dist/main" ]

# Example Commands to buuild and run the dockerfile (without docker-compose)
# docker build -t 이름 .
# docker run 이름