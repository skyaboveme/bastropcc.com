import type { D1Database, KVNamespace } from '@cloudflare/workers-types';

export type Bindings = {
  DB: D1Database;
  SESSIONS: KVNamespace;
  CORS_ORIGIN: string;
  ENVIRONMENT: string;
  JWT_SECRET: string;
};

export type User = {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor';
  is_active: number;
};

export type Variables = {
  user: User;
};

export type AppEnvironment = {
  Bindings: Bindings;
  Variables: Variables;
};
