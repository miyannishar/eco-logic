# Eco-Logic Frontend

The Next.js frontend for the Eco-Logic sustainability platform.

## Deployment Instructions for Render

### Set up Environment Variables

When deploying to Render, make sure to add the following environment variables:

```
NEXT_PUBLIC_API_BASE_URL=https://eco-logic.onrender.com
MONGODB_URI=mongodb+srv://yourusername:yourpassword@yourcluster.mongodb.net/?retryWrites=true&w=majority
JWT_SECRET=your_secret_key
```

### Build Command

Use the following build command:

```
npm install && npm run build
```

### Start Command

Use the following start command:

```
npm start
```

### Node Version

Specify Node.js version 18 or higher.

## Known Issues and Solutions

### Module Not Found: Can't resolve '@/lib/mongodb'

If you encounter this error during deployment:

1. Make sure your jsconfig.json has the correct path aliases:
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./*"]
       }
     }
   }
   ```

2. Make sure your next.config.mjs includes webpack configuration for aliases:
   ```js
   webpack: (config) => {
     config.resolve.alias = {
       ...config.resolve.alias,
       '@': '.',
     };
     return config;
   },
   ```

3. Try touching or modifying the file that's not being found to ensure it's included in the build.

## Development

To run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `app/` - Application routes and API endpoints
- `components/` - Reusable UI components
- `lib/` - Utility functions and services
- `models/` - MongoDB models
- `public/` - Static assets

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm devU
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
