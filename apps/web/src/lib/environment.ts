const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

if (!apiBaseUrl) {
  throw new Error(
    'NEXT_PUBLIC_API_URL is not defined. Copy apps/web/.env.example to apps/web/.env.local.',
  );
}

export const environment = {
  apiBaseUrl,
} as const;
