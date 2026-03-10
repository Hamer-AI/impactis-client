import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { captcha, jwt } from "better-auth/plugins";
import { Pool } from "pg";
import { sendEmail } from "./email";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      if (!user.email) return;
      void sendEmail({
        to: user.email,
        subject: "Reset your Impactis password",
        text: `You requested a password reset.\n\nClick the link below to reset your password:\n\n${url}\n\nIf you did not request this, you can safely ignore this email.`,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      if (!user.email) return;
      void sendEmail({
        to: user.email,
        subject: "Confirm your Impactis email",
        text: `Welcome to Impactis!\n\nPlease confirm your email address by clicking the link below:\n\n${url}\n\nIf you did not create this account, you can ignore this email.`,
      });
    },
  },
  database: pool,
  plugins: [
    nextCookies(),
    jwt(),
    captcha({
      provider: "cloudflare-turnstile",
      secretKey: process.env.TURNSTILE_SECRET_KEY!,
    }),
  ],
  advanced: {
    database: {
      generateId: (options) => {
        if (options.model === "user") {
          return crypto.randomUUID();
        }
        return crypto.randomUUID();
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await pool.query(
            `insert into auth.users (id, email, raw_user_meta_data, created_at, updated_at)
             values ($1::uuid, $2, $3::jsonb, $4::timestamptz, $5::timestamptz)
             on conflict (id) do nothing`,
            [
              user.id,
              user.email ?? null,
              JSON.stringify({
                full_name: user.name ?? null,
                avatar_url: user.image ?? null,
              }),
              user.createdAt ?? new Date(),
              user.updatedAt ?? new Date(),
            ]
          );
        },
      },
    },
  },
});

