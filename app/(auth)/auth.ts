import { compare } from "bcrypt-ts";
import NextAuth, { User, Session } from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { createUser, getUser } from "@/db/queries";

import { authConfig } from "./auth.config";
import { generateUUID, hashValue } from "@/lib/utils";

interface ExtendedSession extends Session {
  user: any;
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {},
      async authorize({ email, password }: any) {
        const hashedPassword = hashValue(password);

        try {
          const response = await fetch(
            "https://los.xgencredit.com/data-api/auth/sign-in",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                username: email,
                password: hashedPassword,
                language: "EN",
              }),
            }
          );

          const { data = {} } = await response.json();

          if (!response.ok) {
            throw new Error(data.message || "Login failed");
          }

          let userId = data.user.id;
          if (typeof userId !== "string") {
            userId = generateUUID();
          }

          let [user] = await getUser(email);

          if (user) {
            return {
              id: user.id,
              name: data.user.name,
              email: data.user.email,
              token: data.accessToken,
            };
          } else {
            const user = await createUser(email, password);
            await signIn("credentials", {
              email: email,
              password: password,
              redirect: false,
            });

            return {
              id: userId,
              name: data.user.name,
              email: data.user.email,
              token: data.accessToken,
            };

            return { status: "success" };
          }
        } catch (error) {
          console.error("Login error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.token = user.token;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id;
        session.user.token = token.token;
      }
      return session;
    },
  },
});
