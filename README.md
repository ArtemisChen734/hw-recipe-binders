## Getting Started

1. Clone the repository:
   ```bash
   pnpm install

```
2. Copy the `.env.example` file and rename it to `.env`:  
   ```bash
   cp .env.example .env
    ```
3. Configure the `.env` file with your values:  
   Open the `.env` file and fill in the following variables:
   
   ```env
   # Create a Postgres database on Vercel: https://vercel.com/postgres
   POSTGRES_URL=your_postgresql_database_url

   # Generate one here: https://generate-secret.vercel.app/32 (only required for localhost)
   AUTH_SECRET=your_secret_key
   ```

4. Apply migrations (if applicable):
   ```bash
   pnpm db:push
   ```
5. Run the app:
   ```bash
   pnpm dev
    ```
