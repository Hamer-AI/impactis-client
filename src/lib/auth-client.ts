import { createAuthClient } from "better-auth/react";
import { jwtClient, emailOTPClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  // Same origin as Next app; API route mounted at /api/auth/[...all]
  plugins: [jwtClient(), emailOTPClient()],
});

