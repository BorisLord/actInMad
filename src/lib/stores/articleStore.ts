import { atom } from "nanostores";

import type { Article } from "../../types/typesF";

export const $selectedArticle = atom<Article | null>(null);
