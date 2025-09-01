## Better Auth + Next.js + Prisma Boilerplate

A minimal boilerplate that wires up Next.js 15, Prisma (PostgreSQL), and Better Auth using the Prisma adapter.

### Prerequisites
- Node.js 18+ and npm
- A PostgreSQL database URL

### 1) Setup environment
Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DBNAME?schema=public"
```

Notes:
- Only `DATABASE_URL` is required for this setup. Add other envs as needed for your own providers/features.

### 2) Install dependencies

```bash
npm install
```

### 3) Generate Prisma Client (always do this after install or schema change)

```bash
npx prisma generate
```

### 4) Apply database schema
- Recommended for local dev (applies existing migrations and creates new when needed):

```bash
npx prisma migrate dev
```

- Alternatively, push schema without generating migrations (useful for quick prototyping):

```bash
npx prisma db push
```

- For production (applies existing migrations only):

```bash
npx prisma migrate deploy
```

Optional tools:

```bash
npx prisma studio
```

### 5) Seed the database (optional but recommended)

Create an admin user with default credentials:

```bash
npm run seed
```

This will create:
- Admin user: `admin@example.com` / `admin123`
- Admin role: `admin`
- Password account for authentication
- Session token for immediate access

**⚠️  Important:** Change these default credentials in production!

### 6) Run the app (development)

```bash
npm run dev
```

App will start with Next.js dev server. Ensure the database is reachable.

### Build and start (production)

```bash
npm run build
npm start
```

### Common workflow order (best practice)
1. Set `.env` with `DATABASE_URL`
2. `npm install`
3. `npx prisma generate`
4. `npx prisma migrate dev` (or `npx prisma db push` for quick protos)
5. `npm run seed` (creates admin user)
6. `npm run dev`

### Where things live
- Prisma schema: `prisma/schema.prisma`
- Database seeder: `prisma/seed.ts`
- Better Auth config: `src/lib/auth.ts`
- API routes: `src/app/api/**`
- App routes/pages: `src/app/**`

### Troubleshooting
- If Prisma types are missing after a schema change, re-run `npx prisma generate`.
- If migrations drift, reset locally with `npx prisma migrate reset` (dev only), then generate again.
- If you need to recreate the admin user, you can reset the database with `npx prisma migrate reset` and then run `npm run seed`.
- The seeding script is idempotent - it won't create duplicate users if run multiple times.


