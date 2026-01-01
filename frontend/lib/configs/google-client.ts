import { OAuth2Client } from "google-auth-library";

// Ensure the env var is present or handle it gracefully if optional, strictly speaking simple import is fine.
export const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
