# # 개발 배포
# FROM node:20-alpine
# WORKDIR /app
# COPY package*.json .
# COPY yarn*.lock .
# RUN yarn
# COPY . .
# ENTRYPOINT [ "yarn", "start"]

# 참고 : https://dev.to/ayesh_nipun/how-to-dockerize-a-react-application-kpa
# 아래는 multi stage buld 후 production 배포이지만 도메인등이 적용되어야 해서 보류
#Stage 1
FROM node:20-alpine as builder
WORKDIR /app
COPY package*.json .
COPY yarn*.lock .
RUN yarn install
COPY . .
ENV REACT_APP_AUTH_URL=http://wintershop.io/auth
RUN PUBLIC_URL=/cart/ yarn build

#Stage 2
FROM nginx:1.19.0
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=builder /app/build .
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
ENTRYPOINT ["nginx", "-g", "daemon off;"]