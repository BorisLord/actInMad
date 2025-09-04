import { PUBLIC_PB_URL } from "astro:env/client";
import { DateTime } from "luxon";
import { useEffect, useState } from "preact/hooks";

import { $selectedArticle } from "../../lib/stores/articleStore";
import type { Article } from "../../type";

const ViewNewArticle = () => {
  const [article, setArticle] = useState<Article | null>(null);

  useEffect(() => {
    const articleData = $selectedArticle.get();
    setArticle(articleData);

    if (articleData) {
      document.title = articleData.title;
    }
  }, []);

  if (!article) {
    return <div class="text-center text-xl">Chargement de l'article...</div>;
  }

  return (
    <div className="mx-auto max-w-5xl p-6 pt-12">
      <div className="flex flex-col">
        <div className="flex flex-col items-center justify-between sm:flex-row sm:items-start">
          <h1 className="w-full text-center text-3xl font-bold sm:text-left">
            {article.title}
          </h1>
          <p className="mt-2 w-full whitespace-nowrap text-center text-xs text-gray-500 sm:mt-0 sm:w-auto sm:text-right">
            Publié le{" "}
            {DateTime.fromSQL(article.releaseDate)
              .setLocale("fr")
              .toFormat("dd MMMM yyyy")}
          </p>
        </div>
        <div className="mt-6">
          {article.images.length > 0 && (
            <img
              src={`${PUBLIC_PB_URL}/api/files/articles/${article.id}/${article.images[0]}`}
              alt={article.imgDescription}
              className="float-left mb-6 mr-6 w-full rounded-sm sm:w-1/3"
              loading="lazy"
            />
          )}
          <article
            className="prose max-w-none text-justify"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>
        {article.extra && (
          <div className="bg-madRed text-madBack md:mt-22 mt-10 rounded-xl p-4">
            <article dangerouslySetInnerHTML={{ __html: article.extra }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewNewArticle;
