import { useEffect, useState } from "react";

import { useParams, Link } from "react-router-dom";

import api from "../services/api";

import "./RestaurantDetails.css";




// Protect the UI from incorrectly assigned or mixed menu data returned by the API.
// The backend category/restaurant relationships should still be corrected as well.
// Normalize food-type values returned by different backend/API versions.
// Accepted examples: NON_VEG, NON-VEG, "Non Veg", and NONVEG.
const normalizeFoodType = (value) => {
  const type = String(value || "").trim().toUpperCase().replace(/[\s-]+/g, "_");
  if (["NON_VEG", "NONVEG", "NON_VEGETARIAN", "NONVEGETARIAN"].includes(type)) return "NON_VEG";
  if (["VEG", "VEGETARIAN"].includes(type)) return "VEG";
  return "";
};

const inferFoodType = (item) => {
  const explicitType = normalizeFoodType(item.foodType ?? item.food_type ?? item.type);
  if (explicitType) return explicitType;
  const categoryName = String(item.__sourceCategoryName || "").toLowerCase();
  if (/non[\s_-]*veg/.test(categoryName)) return "NON_VEG";
  if (/\bveg(etarian)?\b/.test(categoryName) && !/non[\s_-]*veg/.test(categoryName)) return "VEG";
  // Fallback for older records; save foodType explicitly in the backend whenever possible.
  const name = `${item.name || ""} ${item.description || ""}`.toLowerCase();
  if (/\b(chicken|mutton|lamb|fish|prawn|prawns|shrimp|crab|seafood|keema|meat|beef|pork)\b/.test(name)) return "NON_VEG";
  return "";
};



// Explicitly recognize drinks even when they were accidentally saved under
// the Desserts category in the database. These items should render in Drinks.
const isDrinkItem = (item) => {
  const name = String(item?.name || '').toLowerCase().trim();
  const description = String(item?.description || '').toLowerCase();
  const text = `${name} ${description}`;
  return /\b(coke|coca[-\s]?cola|cola|pepsi|sprite|fanta|maaza|thums?\s?up|limca|7\s?up|water bottle|bottled water|water|soft drinks?|beverages?|drinks?|lassi|soda|coffee|juice|mojito|lemonade|tea|milkshake|badam milk)\b/.test(text);
};

const itemBelongsToGroup = (item, groupKey, restaurantId) => {
  if (item.restaurantId != null && String(item.restaurantId) !== String(restaurantId)) return false;
  const text = `${item.name || ""} ${item.description || ""}`.toLowerCase();
  const patterns = {
    biryanis: /biryani/,
    drinks: /drink|beverage|lassi|soda|coffee|juice|mojito|lemonade|tea|milkshake|water/,
    desserts: /dessert|sweet|gulab jamun|double ka meetha|brownie|ice cream|kheer|rasmalai|payasam|cake|pudding|kulfi/,
    starters: /starter|tikka|spring roll|manchurian|fry|kebab|kabab|\b65\b|pakora|pakoda|cutlet|gobi|baby corn|chilli chicken|chili chicken|pepper chicken|fish fry|mushroom/,
    pizzas: /pizza/
  };
  if (patterns[groupKey]) return patterns[groupKey].test(text);
  return true;
};

function RestaurantDetails() {
  

  const { id } = useParams();



  const [restaurant, setRestaurant] = useState(null);

  const [categories, setCategories] = useState([]);
  const [foodItems, setFoodItems] = useState({});

  // Food type filters: ALL, VEG, or NON_VEG
  const [starterFilter, setStarterFilter] = useState("ALL");
  const [pizzaFilter, setPizzaFilter] = useState("ALL");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");



  // Cart states

  const [addingItem, setAddingItem] = useState(null);

  const [cartCount, setCartCount] = useState(0);



  // Biryani filter: ALL, VEG, or NON_VEG

  const [selectedBiryaniType, setSelectedBiryaniType] = useState("ALL");



  useEffect(() => {

    loadRestaurant();

    loadCartCount();

    setSelectedBiryaniType("ALL");
    setStarterFilter("ALL");
    setPizzaFilter("ALL");

    // eslint-disable-next-line react-hooks/exhaustive-deps

  }, [id]);



  const loadRestaurant = async () => {

    try {

      setLoading(true);

      setError("");



      // Get restaurant details

      const restaurantResponse = await api.get(`/restaurants/${id}`);

      setRestaurant(restaurantResponse.data);



      // Get restaurant categories

      const categoryResponse = await api.get(`/restaurants/${id}/categories`);

      const categoryList = categoryResponse.data || [];

      setCategories(categoryList);



      // Get menu items for each category

      const itemsData = {};

      for (const category of categoryList) {

        const itemResponse = await api.get(`/categories/${category.id}/items`);

        itemsData[category.id] = itemResponse.data || [];

      }



      setFoodItems(itemsData);

    } catch (loadError) {

      console.error("Restaurant loading error:", loadError);

      setError(

        loadError.response?.data?.message ||

          "Unable to load restaurant details."

      );

    } finally {

      setLoading(false);

    }

  };



  const loadCartCount = async () => {

    try {

      const response = await api.get("/cart");

      const cart = response.data || {};

      const totalQuantity =

        cart.items?.reduce((total, item) => total + item.quantity, 0) || 0;

      setCartCount(totalQuantity);

    } catch (cartError) {

      // A customer may not be logged in; do not block the restaurant page.

      console.log("Cart count unavailable.", cartError);

      setCartCount(0);

    }

  };



  const addToCart = async (menuItemId) => {

    try {

      setAddingItem(menuItemId);



      const response = await api.post("/cart/items", {

        menuItemId,

        quantity: 1,

      });



      const cart = response.data || {};

      const totalQuantity =

        cart.items?.reduce((total, item) => total + item.quantity, 0) || 0;

      setCartCount(totalQuantity);

      alert("Item added to cart successfully!");

    } catch (cartError) {

      console.error("Add to cart error:", cartError);



      if (cartError.response?.status === 401) {

        alert("Please login before adding items to cart.");

      } else if (cartError.response?.status === 403) {

        alert(

          cartError.response?.data?.message ||

            "You cannot add items from another restaurant."

        );

      } else {

        alert(

          cartError.response?.data?.message || "Failed to add item to cart."

        );

      }

    } finally {

      setAddingItem(null);

    }

  };



  // Group similar backend categories into one menu section. For example,
  // "Veg Biryani" and "Non-Veg Biryani" become one "Biryanis" section.
  const getCategoryGroup = (name = "") => {
    const normalized = name.trim().toLowerCase();
    if (normalized.includes("biryani")) return "biryanis";
    if (normalized.includes("starter")) return "starters";
    if (normalized.includes("drink") || normalized.includes("beverage")) return "drinks";
    if (normalized.includes("dessert") || normalized.includes("sweet")) return "desserts";
    if (normalized.includes("pizza")) return "pizzas";
    return normalized;
  };

  const groupDetails = {
    biryanis: { name: "Biryanis", description: "Veg and non-veg biryani varieties" },
    starters: { name: "Starters", description: "Delicious veg and non-veg starters" },
    drinks: { name: "Drinks", description: "Refreshing drinks and beverages" },
    desserts: { name: "Desserts", description: "Sweet treats to finish your meal" },
    pizzas: { name: "Pizzas", description: "Veg and non-veg pizzas" },
  };

  const displayCategories = categories
    .filter((category, index, allCategories) => {
      const group = getCategoryGroup(category.name || "");
      return allCategories.findIndex(
        (candidate) => getCategoryGroup(candidate.name || "") === group
      ) === index;
    })
    .map((category) => {
      const group = getCategoryGroup(category.name || "");
      return groupDetails[group]
        ? { ...category, ...groupDetails[group], groupKey: group }
        : { ...category, groupKey: group };
    });

  if (loading) {

    return (

      <div className="restaurantLoading">

        <div className="loadingEmoji">🍽️</div>

        <h2>Loading restaurant...</h2>

      </div>

    );

  }



  if (error) {

    return (

      <div className="restaurantError">

        <h2>😕 {error}</h2>

        <Link to="/restaurants">← Back to Restaurants</Link>

      </div>

    );

  }



  if (!restaurant) {

    return (

      <div className="restaurantError">

        <h2>Restaurant not found</h2>

        <Link to="/restaurants">← Back to Restaurants</Link>

      </div>

    );

  }



  return (

    <div className="restaurantPage">

      {/* NAVBAR */}

      <nav className="restaurantNavbar">

        <Link to="/" className="restaurantLogo">

          🍴 Foodly

        </Link>



        <div className="restaurantNavRight">

          <Link to="/restaurants">Restaurants</Link>

          <Link to="/cart" className="cartNavLink">

            🛒 Cart

            {cartCount > 0 && <span className="cartBadge">{cartCount}</span>}

          </Link>

        </div>

      </nav>



      {/* RESTAURANT HERO */}

      <section className="restaurantHero">

        <div className="restaurantHeroImage">🍛</div>



        <div className="restaurantHeroContent">

          <span className="restaurantBadge">

            {restaurant.active ? "OPEN NOW" : "CLOSED"}

          </span>

          <h1>{restaurant.name}</h1>

          <p>{restaurant.description}</p>

          <div className="restaurantMeta">

            <span>⭐ {restaurant.rating ?? "New"}</span>

            <span>📍 {restaurant.address}</span>

          </div>

        </div>

      </section>



      {/* CATEGORY NAVIGATION */}

      <div className="categoryNavigation">

        {displayCategories.map((category) => (

          <a key={category.id} href={`#category-${category.groupKey || category.id}`}>

            {category.name}

          </a>

        ))}

      </div>



      {/* MENU */}

      <main className="restaurantMenu">

        <div className="menuHeading">

          <span>OUR MENU</span>

          <h2>Delicious food for you</h2>

        </div>



        {displayCategories.map((category) => {

          const categoryName = (category.name || "").trim().toLowerCase();
          const categoryGroup = category.groupKey || getCategoryGroup(categoryName);
          const matchingCategories = categories.filter(
            (candidate) => getCategoryGroup(candidate.name || "") === categoryGroup
          );
          // Read items only from categories that belong to this menu group.
          // Biryani-related backend categories (for example, Veg Biryani and
          // Non-Veg Biryani) are combined, but unrelated categories are not.
          // Read items from every category belonging to this restaurant, then
          // place each item in the section that matches its name/type. This also
          // protects the UI when an item was accidentally saved under the wrong
          // category in the backend (for example, Gulab Jamun under Biryani).
          const allRestaurantItems = categories.flatMap((sourceCategory) =>
            (foodItems[sourceCategory.id] || []).map((item) => ({
              ...item,
              __sourceCategoryName: sourceCategory.name || "",
            }))
          );

          const getItemGroup = (item) => {
            // Check the item name first. Biryani must take precedence over terms
            // such as "baby corn" or descriptions that may contain "sweet".
            const name = String(item.name || "").toLowerCase().trim();
            const description = String(item.description || "").toLowerCase();
            const text = `${name} ${description}`;
            const sourceGroup = getCategoryGroup(item.__sourceCategoryName || "");

            // Always identify biryanis first, so names such as "Baby Corn Biryani"
            // remain in the Biryani section. Then recognize drinks before desserts.
            if (/biryani|biriyani|biriani/.test(name) || /biryani|biriyani|biriani/.test(description)) return "biryanis";
            if (isDrinkItem(item)) return "drinks";
            if (/\bpizza\b/.test(name)) return "pizzas";
            if (/gulab jamun|double ka meetha|brownie|ice cream|kheer|rasmalai|payasam|kulfi|qubani ka meetha|gajar ka halwa|kaju katli|cheesecake|fruit salad|\bdessert\b|\bsweet\b|\bcake\b|pudding/.test(name)) return "desserts";
            if (/tikka|spring rolls?|manchurian|kebab|kabab|\b65\b|pakora|pakoda|cutlet|gobi|baby corn|chilli chicken|chili chicken|pepper chicken|fish fry|mushroom|starter|\bfry\b/.test(name)) return "starters";

            // Fall back to descriptions only after checking decisive words in the
            // name, then use the source category for less-specific menu names.
            if (isDrinkItem({ name: "", description })) return "drinks";
            if (/gulab jamun|double ka meetha|brownie|ice cream|kheer|rasmalai|payasam|kulfi|qubani ka meetha|gajar ka halwa|kaju katli|cheesecake|fruit salad|\bdessert\b|\bsweet\b|\bcake\b|pudding/.test(description)) return "desserts";
            if (/pizza/.test(text)) return "pizzas";
            if (/tikka|spring rolls?|manchurian|kebab|kabab|\b65\b|pakora|pakoda|cutlet|gobi|baby corn|chilli chicken|chili chicken|pepper chicken|fish fry|mushroom|starter|\bfry\b/.test(description)) return "starters";
            return sourceGroup;
          };

          const isBiryaniCategory = categoryGroup === "biryanis";
          // The API/database may contain repeated records with different IDs.
          // Keep one visible card per normalized name + food type, preferring a
          // record that has an image URL or description when duplicates exist.
          const candidateItems = allRestaurantItems.filter((item) => {
            // Never show clearly identified drinks (for example Coke or Water Bottle)
            // in Desserts, even if the database category is wrong.
            if (categoryGroup === "desserts" && isDrinkItem(item)) return false;
            return itemBelongsToGroup(item, categoryGroup, id) && getItemGroup(item) === categoryGroup;
          });
          const uniqueItemsByName = new Map();
          candidateItems.forEach((item) => {
            const normalizedName = String(item.name || "").trim().toLowerCase().replace(/\s+/g, " ");
            const key = normalizedName;
            const existing = uniqueItemsByName.get(key);
            const hasImage = Boolean(item.imageUrl || item.image_url);
            const existingHasImage = Boolean(existing && (existing.imageUrl || existing.image_url));
            const hasDescription = Boolean(String(item.description || "").trim());
            const existingHasDescription = Boolean(existing && String(existing.description || "").trim());
            if (!existing || (hasImage && !existingHasImage) || (hasDescription && !existingHasDescription)) {
              uniqueItemsByName.set(key, item);
            }
          });
          const items = Array.from(uniqueItemsByName.values());
          const isStarterCategory = categoryGroup === "starters";
          const isPizzaCategory = categoryGroup === "pizzas";

          const activeFoodFilter = isBiryaniCategory
            ? selectedBiryaniType
            : isStarterCategory
              ? starterFilter
              : isPizzaCategory
                ? pizzaFilter
                : "ALL";

          const visibleItems = activeFoodFilter === "ALL"
            ? items
            : items.filter((item) => inferFoodType(item) === activeFoodFilter);

          return (

            <section

              key={category.id}

              id={`category-${category.groupKey || category.id}`}

              className="menuCategory"

            >

             <div className="menuCategoryHeading">

  <div>

    <h2>{category.name}</h2>

    <p>{category.description}</p>

  </div>



  <span>{visibleItems.length} items</span>

</div>



              {isBiryaniCategory && (

                <div className="biryaniTypeFilters" aria-label="Filter biryani type">

                  <button

                    type="button"

                    className={selectedBiryaniType === "ALL" ? "active" : ""}

                    aria-pressed={selectedBiryaniType === "ALL"}

                    onClick={() => setSelectedBiryaniType("ALL")}

                  >

                    All Biryanis

                  </button>

                  <button

                    type="button"

                    className={selectedBiryaniType === "VEG" ? "active" : ""}

                    aria-pressed={selectedBiryaniType === "VEG"}

                    onClick={() => setSelectedBiryaniType("VEG")}

                  >

                    🟢 Veg Biryani

                  </button>

                  <button

                    type="button"

                    className={

                      selectedBiryaniType === "NON_VEG" ? "active" : ""

                    }

                    aria-pressed={selectedBiryaniType === "NON_VEG"}

                    onClick={() => setSelectedBiryaniType("NON_VEG")}

                  >

                    🔴 Non-Veg Biryani

                  </button>

                </div>

              )}



              {isPizzaCategory && (
                <div className="biryaniTypeFilters pizzaTypeFilters" aria-label="Filter pizza type">
                  <button
                    type="button"
                    className={pizzaFilter === "ALL" ? "active" : ""}
                    aria-pressed={pizzaFilter === "ALL"}
                    onClick={() => setPizzaFilter("ALL")}
                  >
                    All Pizzas
                  </button>
                  <button
                    type="button"
                    className={pizzaFilter === "VEG" ? "active" : ""}
                    aria-pressed={pizzaFilter === "VEG"}
                    onClick={() => setPizzaFilter("VEG")}
                  >
                    🟢 Veg Pizzas
                  </button>
                  <button
                    type="button"
                    className={pizzaFilter === "NON_VEG" ? "active" : ""}
                    aria-pressed={pizzaFilter === "NON_VEG"}
                    onClick={() => setPizzaFilter("NON_VEG")}
                  >
                    🔴 Non-Veg Pizzas
                  </button>
                </div>
              )}

              {isStarterCategory && (
                <div className="biryaniTypeFilters starterTypeFilters" aria-label="Filter starter type">
                  <button
                    type="button"
                    className={starterFilter === "ALL" ? "active" : ""}
                    aria-pressed={starterFilter === "ALL"}
                    onClick={() => setStarterFilter("ALL")}
                  >
                    All Starters
                  </button>
                  <button
                    type="button"
                    className={starterFilter === "VEG" ? "active" : ""}
                    aria-pressed={starterFilter === "VEG"}
                    onClick={() => setStarterFilter("VEG")}
                  >
                    🟢 Veg Starters
                  </button>
                  <button
                    type="button"
                    className={starterFilter === "NON_VEG" ? "active" : ""}
                    aria-pressed={starterFilter === "NON_VEG"}
                    onClick={() => setStarterFilter("NON_VEG")}
                  >
                    🔴 Non-Veg Starters
                  </button>
                </div>
              )}

              <div className="foodItemsGrid">

                {visibleItems.length === 0 ? (

                  <p className="noItems">

                    {activeFoodFilter !== "ALL"
                      ? `No ${activeFoodFilter === "VEG" ? "vegetarian" : "non-vegetarian"} ${isBiryaniCategory ? "biryanis" : isStarterCategory ? "starters" : isPizzaCategory ? "pizzas" : "items"} found. Check that each menu item has the correct foodType in the backend.`
                      : "No items available."}

                  </p>

                ) : (

                  visibleItems.map((item) => (

                    <FoodCard

                      key={item.id}

                      item={item}

                      onAddToCart={addToCart}

                      addingItem={addingItem}

                    />

                  ))

                )}

              </div>

            </section>

          );

        })}

      </main>

    </div>

  );

}



function FoodCard({ item, onAddToCart, addingItem }) {
  // The API may serialize this field as imageUrl or image_url.
  const itemImage = item.imageUrl || item.image_url;
  const [imageFailed, setImageFailed] = useState(false);
  const itemName = String(item.name || "").toLowerCase();
  const fallbackEmoji = /biryani|biriyani|biriani/.test(itemName)
    ? "🍛"
    : /lassi|soda|coffee|juice|mojito|lemonade|milkshake|tea|water|sprite|fanta|maaza|coke|cola/.test(itemName)
      ? "🥤"
      : /gulab jamun|double ka meetha|brownie|ice cream|kheer|rasmalai|payasam|kulfi|qubani|halwa|kaju katli|cheesecake|cake|dessert|sweet|pudding|fruit salad/.test(itemName)
        ? "🍰"
        : /pizza/.test(itemName)
          ? "🍕"
          : /chicken|mutton|fish|prawn|shrimp|kebab|kabab|tikka|65|meat|egg/.test(itemName)
            ? "🍗"
            : "🍽️";

  return (
    <div className="foodItemCard">
      <div className="foodItemImage">
        {itemImage && !imageFailed ? (
          <img
            src={itemImage}
            alt={item.name || "Food item"}
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="foodImageFallback" role="img" aria-label={`${item.name || "Food item"} image unavailable`}>
            <span aria-hidden="true">{fallbackEmoji}</span>
            <small>Image unavailable</small>
          </div>
        )}
        {!item.available && (
          <div className="foodUnavailable">Unavailable</div>
        )}
      </div>

      <div className="foodItemContent">
        <div className="foodItemTop">
          <h3>{item.name}</h3>
          <strong>₹{item.price}</strong>
        </div>

        <p>{item.description}</p>

        <div className="foodItemBottom">
          <span className={item.available ? "available" : "unavailable"}>
            {item.available ? "● Available" : "● Unavailable"}
          </span>
          <button
            disabled={!item.available || addingItem === item.id}
            onClick={() => onAddToCart(item.id)}
          >
            {addingItem === item.id ? "Adding..." : "+ Add"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RestaurantDetails;
