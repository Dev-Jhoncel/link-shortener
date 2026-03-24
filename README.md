# Link Shortener API

A sample URL shortener API built with **NestJS**, **Prisma**, and **MySQL**.

## Overview

This project is a demonstration of a modern backend application that provides URL shortening and redirection services. It features:

- **Short Code Generation**: Automatically generates unique, human-readable short codes for long URLs.
- **Redirection**: Seamlessly redirects users from short URLs to the original destination.
- **Prisma ORM**: Efficient database management and type-safe queries.
- **Clean Architecture**: Organized into modular services and controllers for scalability.

## Tech Stack

- **Framework**: [NestJS](https://nestjs.com/)
- **Database**: MySQL
- **ORM**: [Prisma](https://www.prisma.io/)
- **Language**: TypeScript

## Project Setup

### 1. Install Dependencies

```bash
$ npm install
```

### 2. Configure Environment

Create a `.env` file in the root directory and configure your database connection:

```env
DATABASE_URL="mysql://user:password@localhost:3306/link_shortener"
```

### 3. Database Migration

Run Prisma migrations to set up your database schema:

```bash
$ npx prisma migrate dev
```

## Running the Project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## API Features

### Redirect to Original URL
- **Endpoint**: `GET /:shortCode`
- **Description**: Redirects the user to the original URL associated with the provided short code.

### Manage Links
- **Module**: `UrlModule`
- **Endpoints**: Supports creating and managing shortened links (see `src/url/url.controller.ts` for details).

## Testing

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e
```

## License

This project is unlicensed (private).
