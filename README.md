# Inventory Manager

A simple inventory management application designed to be self-hosted. The MariaDB database and backend Express api will be hosted on a server using docker, and the frontend React app will be used to interface with it. 

## Instructions for Build and Use

Steps to build and/or run the software:

1. Download the .env.example file and the compose.production.yml file from the Github repository.
2. Edit the .env.example file so that it contains real values for your installation.
3. Open a terminal at the project location
    * NOTE: Currently the Docker images are stored privately in the GHCR, so your terminal will need to authenticate as a Github user with access to the images using the `docker login ghcr.io` command, followed by the Github username of the account and a valid access token with access to read container images. 
4. Run the following commands
     * `docker compose --env-file .env.production -f compose.production.yml pull`
     * `docker compose --env-file .env.production -f compose.production.yml up -d db`
     * `docker compose --env-file .env.production  -f compose.production.yml run --rm backend npm run migrate`
     * `docker compose --env-file .env.production -f compose.production.yml up -d backend frontend`
     * NOTE: After running the second command you will need to wait approximately 20 seconds for the database container to fully spin up and report a 'healthy' status before the third command will execute properly. 
   These commands will pull the docker images from the Github Container Repository, Initialize the database, populate the database with the correct initial data, and then spin up the front and back ends. 
5. To facilitate access to the application you will also need to setup a reverse proxy or another way of exposing the correct ports to the internet. This will vary greatly by implementation, so details are not provided here. The frontend app will be listening on localhost port 8080 and the backend API will be listening on port 5001 by default. This can be modified in the docker compose file if needed. 

Commands to run when updating the software:

 * `docker compose --env-file .env.production -f compose.production.yml down` 
 * `docker compose --env-file .env.production -f compose.production.yml pull`
 * `docker compose --env-file .env.production -f compose.production.yml up -d db` (Pause briefly after running to allow the database to spin back up)
 * `docker compose --env-file .env.production  -f compose.production.yml run --rm backend npm run migrate`
 * `docker compose --env-file .env.production -f compose.production.yml up -d backend frontend`

Instructions for using the software:

1. Authenticate the web interface with backend. Use the default admin account, username 'Admin', password 'password123', as well as the URL or IP address of your hosted backend. 
2. Once logged in as an admin, configure accounts as needed in the Manage/Accounts window. 
3. As any user, configure location and item records in the Manage/Locations and Manage/Items windows. 
4. Record and monitor stock levels using the Stock Ledger and Move Stock windows. 

## Development Environment

To recreate the development environment, you need the following software and/or libraries with the specified versions:

*NOTE: The project contains two separate projects created with npm. Running `npm install` in the project root directory will not install the needed dependencies, it must be run from both the 'frontend' and 'backend' directories. Running that command in the two directories will install all the needed dependencies, but the primary modules that were used are listed here as well.*

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

