# Inventory Manager

A simple inventory management application designed to be self-hosted. The MariaDB database and backend Express api will be hosted on a server using docker, and the frontend React app will be used to interface with it. 

## Instructions for Build and Use

Steps to build and/or run the software:

1. First step here
2.
3.

Commands to run when updating the software:

`git pull`
`docker compose --env-file .env.production -f compose.production.yml pull`
`docker compose --env-file .env.production -f compose.production.yml up -d db`
`docker compose --env-file .env.production  -f compose.production.yml run --rm backend npm run migrate`
`docker compose --env-file .env.production -f compose.production.yml up -d backend frontend`

Or if the docker compose file is stored locally run these instead:

`docker compose build`
`docker compose up -d db`
`docker compose run --rm backend npm run migrate`
`docker compose up -d backend frontend`

Instructions for using the software:

1. Authenticate web interface with backend. Use the default admin account, username 'Admin', password 'password123', as well as the URL or IP address of your hosted backend. 
2. Once logged in as an admin, configure accounts as needed in the Manage/Accounts window. 
3. As any user, configure location and item records in the Manage/Locations and Manage/Items windows. 
4. Record stock levels using the 

## Development Environment

To recreate the development environment, you need the following software and/or libraries with the specified versions:

*NOTE: The project contains two separate projects created with npm. Running `npm install` in the project root directory will not install the needed dependencies, it must be run from both the 'frontend' and 'backend' directories. Running that command in the two directories will install all the needed dependencies, but they are listed here as well.*

#### Full Stack:
* npm 11.17.0
#### Backend:
* express 5.2.1
* prisma 7.10.0
* dotenv 17.4.2
* prisma adapter-mariadb 7.10.0
* bcryptjs 3.0.3
* cors 2.8.6
* cookie-parser 1.4.7
* jsonwebtoken 9.0.3
* zod 4.5.4
#### Frontend:
* axios 1.20.0
* react 19.2.8
* react-dom 19.2.8
* react-router 8.3.0
* vite 8.2.0

## Useful Websites to Learn More

I found these websites useful in developing this software:

* [Docker Reference](https://docs.docker.com/reference/)
* [Github Container Registry Docs](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)

## Future Work

The following items I plan to fix, improve, and/or add to this project in the future:

* [ ] Automated deployment of code changes to docker image
* [ ] Support for barcode scanners
* [ ] Mobile App

