
import { Link } from "react-router-dom";

const restaurantImages = {
  "Biryani House Premium": "/restaurants/biryani-house.jpg",
  "Paradise Biryani": "/restaurants/paradise.jpg",
  "Absolute Barbecues": "/restaurants/absolute-barbecues.jpg",
  "Shah Ghouse": "/restaurants/shah-ghouse.png",
  "Kritunga Restaurant": "/restaurants/kritunga.png",
  "Chutneys": "/restaurants/chutneys.png",
  "Olive Bistro": "/restaurants/olive-bistro.png",
  "Pizza Palace": "/restaurants/pizza-palace.png",
};

function RestaurantCard({ restaurant }) {
  const imageUrl =
    restaurant.imageUrl ||
    restaurant.image ||
    restaurantImages[restaurant.name];

  return (
    <Link
      to={`/restaurant/${restaurant.id}`}
      className="restaurantCardLink"
      aria-label={`Open ${restaurant.name} menu`}
    >
      <article className="restaurantCard">
        <div className="restaurantCardImage">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={restaurant.name}
              onError={(event) => {
                console.error("Restaurant image failed:", imageUrl);
                event.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="restaurantImageFallback">
              🍽️
            </div>
          )}

          <span className="restaurantImageBadge">
            ⭐ {restaurant.rating ?? "New"}
          </span>
        </div>

        <div className="restaurantCardContent">
          <h3>{restaurant.name}</h3>

          <p className="restaurantDescription">
            {restaurant.description ||
              "Delicious food, freshly prepared."}
          </p>

          <div className="restaurantLocation">
            📍 {restaurant.address || "Hyderabad"}
          </div>

          <span
            className={`restaurantStatus ${
              restaurant.active ? "isOpen" : "isClosed"
            }`}
          >
            {restaurant.active ? "Open" : "Closed"}
          </span>
        </div>
      </article>
    </Link>
  );
}

export default RestaurantCard;
