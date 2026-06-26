import type { Config } from "@react-router/dev/config";
import { vercelPreset } from "@vercel/react-router/vite";

export default {
  // Server-side rendering is required: the embedded admin authenticates each
  // request with Shopify on the server (loaders call authenticate.admin).
  ssr: true,
  // Bundles the app into Vercel Functions on deploy. No-op when running the
  // plain Node server locally (`npm run dev` / `npm run start`).
  presets: [vercelPreset()],
} satisfies Config;
