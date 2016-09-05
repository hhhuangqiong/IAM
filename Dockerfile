FROM node:6-slim
MAINTAINER "Andy Hui" <andyhui@maaii.com>

# To configure the timezone to Asia/Hong_Kong
RUN echo "Asia/Hong_Kong" > /etc/timezone \
  && dpkg-reconfigure -f noninteractive tzdata

# This dockerfile is designed to run from the jenkins build server, i.e. please
# run 'npm install' and 'npm run build' to prepare all dependencies and build the project.
# The built/compiled/installed dependencies with be copied into the docker image
# using the COPY command instead.
COPY . /app/

WORKDIR /app

ENV NODE_ENV=production

# disable cache for babel register, avoid permission problem for babel-register with user no body
ENV BABEL_DISABLE_CACHE=1

# 1. application listen port
# 2. expose for debug purpose
EXPOSE 3000 5858

USER nobody

CMD ["node", "./build/index.js"]
