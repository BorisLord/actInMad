import { Icon } from "@iconify/react";
import { PUBLIC_PB_URL } from "astro:env/client";
import { DateTime } from "luxon";
import { useEffect, useState } from "preact/hooks";

import { pb } from "../lib/pocketbase";

type Article = {
  id: string;
  collectionId: string;
  title: string;
  subTitle: string;
  slug: string;
  images: string[];
  imgDescription: string;
  releaseDate: string;
};

const NewArticles = ({
  staticArticleSlugs,
}: {
  staticArticleSlugs: string[];
}) => {
  const [newArticles, setNewArticles] = useState<Article[]>([]);

  useEffect(() => {
    const fetchNewArticles = async () => {
      try {
        const records = await pb.collection("articles").getFullList<Article>({
          filter: "isActive=true",
          sort: "-releaseDate",
        });

        const filteredArticles = records.filter(
          (article) => !staticArticleSlugs.includes(article.slug),
        );

        setNewArticles(filteredArticles);
      } catch (error) {
        console.error("Failed to fetch new articles:", error);
      }
    };

    fetchNewArticles();
  }, [staticArticleSlugs]);

  if (newArticles.length === 0) {
    return null;
  }

  return (
    <>
      {newArticles.map((article) => (
        <a
          key={article.id}
          href={`/articles/${article.slug}`}
          class="flex h-[600px] transform flex-col rounded-xl p-3 text-center shadow-2xl transition hover:scale-105"
        >
          <div class="flex-grow overflow-hidden rounded-xl">
            {article.images.length > 0 ? (
              <img
                src={`${PUBLIC_PB_URL}/api/files/${article.collectionId}/${article.id}/${article.images[0]}`}
                alt={article.imgDescription}
                class="h-92 w-full rounded-xl object-cover"
                loading="lazy"
              />
            ) : (
              <div class="h-92 flex w-full items-center justify-center rounded-xl bg-gray-200" />
            )}
          </div>

          <div class="flex flex-grow flex-col justify-between">
            <h2 class="text-xl font-bold">{article.title}</h2>
            <p class="text-justify text-sm">{article.subTitle} ...</p>
            <div class="mt-2 flex items-center justify-between">
              <p class="flex items-center text-sm">
                <span class="mr-1 font-bold text-yellow-500">NOUVEAU</span>
                <Icon name="lucide:circle-plus" size="24" class="mr-1" />
              </p>
              <p class="text-sm italic">
                {DateTime.fromISO(article.releaseDate)
                  .setLocale("fr")
                  .toFormat("dd MMMM yyyy")}
              </p>
            </div>
          </div>
        </a>
      ))}
    </>
  );
};

export default NewArticles;
