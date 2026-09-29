/**
 * passport.ts — Configures the Google OAuth 2.0 strategy for Passport.
 *
 * When a user signs in via Google, this strategy receives their profile.
 * It then does a "find or create" against the User table in Postgres:
 *   - If a row with the same googleId exists, return it.
 *   - Otherwise, create a new User from the Google profile fields.
 *
 * Passport serialization is not used because we issue our own JWT
 * instead of relying on Passport sessions.
 *
 * If GOOGLE_CLIENT_ID is not set, the strategy is skipped with a
 * warning — this lets the server boot in dev without OAuth configured.
 */

import passport from "passport";
import {
  Strategy as GoogleStrategy,
  Profile,
  VerifyCallback,
} from "passport-google-oauth20";
import { env } from "./env";
import { prisma } from "../db/prisma";

if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.GOOGLE_CALLBACK_URL,
      },
      async (
        _accessToken: string,
        _refreshToken: string,
        profile: Profile,
        done: VerifyCallback
      ) => {
        try {
          const email =
            profile.emails && profile.emails.length > 0
              ? profile.emails[0].value
              : "";

          const avatarUrl =
            profile.photos && profile.photos.length > 0
              ? profile.photos[0].value
              : null;

          // Find existing user or create a new one
          const user = await prisma.user.upsert({
            where: { googleId: profile.id },
            update: {
              name: profile.displayName,
              email,
              avatarUrl,
            },
            create: {
              googleId: profile.id,
              name: profile.displayName,
              email,
              avatarUrl,
            },
          });

          return done(null, user);
        } catch (error) {
          return done(error as Error);
        }
      }
    )
  );
} else {
  console.warn(
    "[tiffin-backend] ⚠ GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not set — Google OAuth disabled"
  );
}

export default passport;
