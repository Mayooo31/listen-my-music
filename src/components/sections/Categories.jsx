import React, { useEffect, useState } from "react";
import { useCtx } from "../../context/context";

import CategoriesItem from "../CategoriesItem";
import CategoryItem from "../CategoryItem";

import styles from "../../styles";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [categoryName, setCategoryName] = useState([]);
  const { userLoggedToken, setError, setSection } = useCtx();

  const fetchCategories = async () => {
    try {
      const res = await fetch(
        "https://api.spotify.com/v1/browse/categories?limit=50&offset=0",
        {
          method: "GET",
          headers: {
            Authorization: "Bearer " + userLoggedToken,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await res.json();
      if (data.error) throw data.error;

      setCategories(data.categories.items);
    } catch (err) {
      setError(err);
      setSection("error");
    }
  };

  const selectCategory = async (id, name) => {
    if (categoryName.find(catName => catName.id.toLowerCase() === id.toLowerCase())) {
      const filteredCategoryName = categoryName.filter(
        catName => catName.id.toLowerCase() !== id.toLowerCase()
      );
      setCategoryName(filteredCategoryName);

      const filteredCategory = selectedCategory.filter(cat => {
        const categoryId = cat.href.split("categories/")[1].split("/")[0];

        if (categoryId.toLowerCase() !== id.toLowerCase()) return cat;
      });

      setSelectedCategory(filteredCategory);
      return;
    }

    if (categoryName.length === 5) {
      setSelectedCategory(lastState => lastState.slice(0, -1));
      setCategoryName(lastState => lastState.slice(0, -1));
    }

    categoryName.length === 0 && setCategoryName([{ name, id }]);
    categoryName.length !== 0 &&
      setCategoryName(lastState => [{ name, id }, ...lastState]);

    try {
      const res = await fetch(
        `https://api.spotify.com/v1/browse/categories/${id}/playlists?limit=50&offset=0`,
        {
          method: "GET",
          headers: {
            Authorization: "Bearer " + userLoggedToken,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await res.json();
      if (data.error) throw data.error;

      if (selectedCategory.length === 0) return setSelectedCategory([data.playlists]);
      setSelectedCategory(lastState => [data.playlists, ...lastState]);
    } catch (err) {
      setError(err);
      setSection("error");
    }
  };

  useEffect(() => {
    fetchCategories();
    selectCategory("hiphop", "Hip Hop");
  }, []);

  return (
    <section className={styles.section}>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-medium">Categories</h1>
          <div className="flex gap-5 items-center">
            <button
              onClick={() => {
                setSelectedCategory([]);
                setCategoryName([]);
              }}
              className="text-xl hover:text-white"
            >
              Clear filter
            </button>
            <p className="text-xl">{categoryName.length}/5</p>
          </div>
        </div>
        <div className="flex justify-start gap-3 flex-wrap max-h-[200px] overflow-auto">
          {categories.map(category => (
            <CategoriesItem
              key={category.id}
              category={category}
              categoryName={categoryName}
              selectCategory={selectCategory}
            />
          ))}
        </div>
      </div>

      {/* if no selected category show this h1 */}
      {selectedCategory.length === 0 && (
        <h1 className="flex justify-center text-center pt-10 text-4xl">
          Select category 👌
        </h1>
      )}

      {/* .map() every selected category  */}
      {selectedCategory.map((cat, index) => (
        <CategoryItem
          key={cat.href}
          data={cat.items}
          name={categoryName[index].name}
          artist={false}
          type="playlist"
        />
      ))}

      {/* Showing number of selected categories */}
      {selectedCategory.length !== 0 && (
        <h1 className="flex justify-center text-center pt-5 pb-10 text-lg ss:text-2xl">
          - selected categories {categoryName.length} of 5 -
        </h1>
      )}
    </section>
  );
};

export default Categories;
