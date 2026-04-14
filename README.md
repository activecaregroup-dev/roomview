# RoomView — ACG Room Management

Tablet-first room management dashboard for Active Care Group. Real-time patient admit/discharge, TV screen view with PIN entry, site broadcast, and Snowflake backend.

## Setup

### 1. Snowflake Schema

Run `schema.sql` in your Snowflake worksheet to create the `DATAOPS_PROD.ROOMVIEW` schema and tables.

### 2. Add your first site

Run this SQL directly in Snowflake. Generate the bcrypt hash using the node command below.

```sql
INSERT INTO DATAOPS_PROD.ROOMVIEW.SITES (name, slug, email, password_hash)
VALUES ('ACG Northside', 'acg-northside', 'admin@acgnorthside.com', '$2b$10$...');
```

**To generate a bcrypt hash:**
```bash
node -e "const b=require('bcryptjs'); b.hash('yourpassword', 10).then(h => console.log(h))"
```

### 3. Environment variables

Fill in `.env.local`:

```env
SNOWFLAKE_ACCOUNT=ik70694.uk-south.azure
SNOWFLAKE_USER=DATAOPS_SOLE_ADMIN
SNOWFLAKE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
...your key contents...
-----END PRIVATE KEY-----"
SNOWFLAKE_WAREHOUSE=COMPUTE_WH
SNOWFLAKE_DATABASE=DATAOPS_PROD
SNOWFLAKE_SCHEMA=ROOMVIEW
SESSION_SECRET=your-long-random-secret-here
```

`SNOWFLAKE_PRIVATE_KEY` = full PEM key contents (not the path). On Vercel, paste the full key as a multi-line env var.

### 4. Dev server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
