import { API_URL } from "astro:env/client";

import PocketBase from "pocketbase";

export const pb = new PocketBase(API_URL);
