# Code Review Findings

Baseline: `tsc` reports 1 error; 3 of 5 Jest suites fail (25 tests pass).
The `src/user` module is the best-built part. The URL module (the core feature) is broken.

## 🔴 Critical bugs

- [ ] **`UrlService.create` has an inverted check** (`src/url/url.service.ts`). `if (!isExist) return null` bails out when the code is free, so a link is only created when the code already exists (which then fails on the unique constraint).
- [ ] **Short-code collision returns nothing.** Retry generating a code and rely on the DB unique constraint to catch races.
- [ ] **`CreateUrlDto` has no validation.**
  - `ValidationPipe` uses `forbidNonWhitelisted`, so every field is rejected.
  - `userId` is typed `number`, but the schema uses a string UUID.
  - `isAActive` is a typo for `isActive`.
  - Clients can set their own `shortCode`.
  - `url` is not checked with `@IsUrl`. Restrict it to http/https, otherwise `javascript:` or `file:` targets can be redirected to.
- [ ] **Redirect ignores link state.** It does not check `isActive`, `expiresAt`, or `deletedAt`, and records no `Click` rows even though the model exists.
- [ ] **Catch-all `GET /:shortCode`** in `AppController` can swallow other routes. `AppService.findByShortCode` catches its own `NotFoundException` and logs with `console.error`, so real DB errors are reported as 404.
- [ ] **User endpoints are unauthenticated.** Anyone can list, update, or delete any user, and `GET /user` returns all users. There is no login or JWT, even though `validateCredentials` exists.
- [ ] **Soft delete is not enforced.** `findOne`, `findAll`, and `findByEmail` return deleted users, and a deleted user's email cannot register again.
- [ ] **Registration race.** Check-then-create can hit the unique constraint and return 500. Catch Prisma `P2002` and map it to 409.

## 🟠 Config and architecture

- [ ] Non-relative `src/...` imports. Jest has no `moduleNameMapper` for them, which is why the Url and User specs fail, and it risks breaking `dist` at runtime.
- [ ] `nanoid` v5 is ESM-only and Jest cannot load it. Mock it, use `crypto.randomBytes`, or configure Jest.
- [ ] `src/generated/prisma` is committed. Gitignore it and generate it in the build. Remove the stale `@types/nanoid` package.
- [ ] The `PrismaService` wrapper (`.client`) is non-idiomatic. Extend `PrismaClient` or use the Prisma 7 driver adapter.
- [ ] `AppService` injects `PrismaService` without using it. `UrlModule` does not export `UrlService` and `AppModule` does not import it, so DI likely fails at boot.
- [ ] No config module, env validation, or `.env.example`.
- [ ] Missing production pieces: rate limiting (`@nestjs/throttler`), `helmet`, CORS, Swagger, health endpoint, graceful shutdown, structured logging, global exception filter.
- [ ] Schema issues:
  - `@@index([shortCode])` is redundant with `@unique`.
  - `Link.user` has no `onDelete` rule.
  - `Click` has no index on `createdAt`.
  - Two migrations are both named `init`.
- [ ] Code cleanliness:
  - Unused `UseFilters` import in `UserController`.
  - `sanitizeUser(user: any)` loses type safety. Use `Omit<User, ...>` or `@Exclude`.
  - `User` and `UserResponse` entities are duplicates.
  - `url.entity.ts` is an empty class.

## 🟡 Tests and docs

- [ ] `test/app.e2e-spec.ts` and `app.controller.spec.ts` are stale scaffold (expect "Hello World", call a non-existent `getHello`: the `tsc` error).
- [ ] Url specs have no mocks, so `PrismaService` cannot be resolved. The Url logic has no real tests.
- [ ] `IMPLEMENTATION_SUMMARY.md` and `REGISTRATION.md` read like generated notes. Fold them into the README or delete them.
- [ ] Inconsistent formatting. Run `npm run format`.

## Suggested order of work

1. Fix `UrlService.create`: collision retry, validated DTO, 201 responses.
2. Fix DI and imports, make Jest work, repair the tests.
3. Harden the redirect: check active/expiry, record clicks, proper 404.
4. Add auth (JWT), protect user and link management routes, enforce soft delete.
5. Add config validation, throttling, helmet, and clean up `generated/`.
