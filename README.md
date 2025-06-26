This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

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

## Main Features and Usage Flows

- **Map and Diagram Management:**
  - Visualize, add, edit, and remove routes, boxes (CTO/CEO), fusion points, and splitters.
  - Use the global context to access and manipulate routes (`rotas`), boxes (`caixas`), fusion points (`pontosFusao`), splitters (`spliters`), clients (`clientes`), incidents (`incidentes`), and reports (`relatorios`).
  - Use the provided context functions to load (`carregar*`), add, and remove these entities.

- **Clients, Incidents, and Reports:**
  - Manage clients and their associations with ports and boxes.
  - Register and track incidents, linking them to network elements.
  - Generate and consult reports for maintenance, installation, performance, and incidents.

- **Permissions and Authentication:**
  - The system uses JWT authentication and role-based permissions (Técnico, Engenheiro, Gerente).
  - Only authorized users can access or modify certain resources.

- **API Documentation:**
  - See `api_doc.md` for detailed API endpoints, parameters, and responses for all resources.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
