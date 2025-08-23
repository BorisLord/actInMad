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
          class="shadow-2xl rounded-xl p-3 text-center transition transform hover:scale-105 flex flex-col h-[600px]"
        >
          <div class="flex-grow overflow-hidden rounded-xl">
            {article.images.length > 0 ? (
              <img
                src={`${PUBLIC_PB_URL}/api/files/${article.collectionId}/${article.id}/${article.images[0]}`}
                alt={article.imgDescription}
                class="w-full h-92 object-cover rounded-xl"
                loading="lazy"
              />
            ) : (
              <div class="w-full h-92 flex items-center justify-center rounded-xl bg-gray-200" />
            )}
          </div>

          <div class="flex flex-col justify-between flex-grow">
            <h2 class="text-xl font-bold">{article.title}</h2>
            <p class="text-sm text-justify">{article.subTitle} ...</p>
            <div class="flex justify-between items-center mt-2">
              <p class="text-sm flex items-center">
                <span class="text-yellow-500 mr-1 font-bold">NOUVEAU</span>
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
