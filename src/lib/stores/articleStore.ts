import { atom } from "nanostores";

import type { Article } from "../../type";

export const $selectedArticle = atom<Article | null>(null);
