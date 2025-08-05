import { SessionOptions } from "iron-session";

export type SessionUser = {
  id: number;
  email: string;
  permissions: string[];
};

export interface IronSessionData {
    user?: SessionUser;
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET as string,
  cookieName: "session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

