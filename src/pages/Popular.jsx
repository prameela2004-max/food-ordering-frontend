import { Link } from "react-router-dom";
import "./Popular.css";

function Popular() {
  const popularFoods = [
    {
      id: 1,
      name: "Chicken Biryani",
      rating: "5.0",
      price: "₹250",
      emoji: "🍛",
    },
    {
      id: 2,
      name: "Cheese Pizza",
      rating: "4.8",
      price: "₹299",
      emoji: "🍕",
    },
    {
      id: 3,
      name: "Classic Burger",
      rating: "4.7",
      price: "₹199",
      emoji: "🍔",
    },
    {
      id: 4,
      name: "Chocolate Cake",
      rating: "4.9",
      price: "₹180",
      emoji: "🍰",
    },
  ];

  return (
    <div className="popular-page">
      <header className="popular-navbar">
        <Link to="/" className="popular-logo">
          <span aria-hidden="true">🍔</span> Foodly
        </Link>

        <nav className="popular-nav" aria-label="Main navigation">
          <Link to="/" className="popular-nav-link">
            Home
          </Link>
          <Link to="/restaurants" className="popular-nav-link">
            Restaurants
          </Link>
          <Link to="/popular" className="popular-nav-link active" aria-current="page">
            Popular
          </Link>
        </nav>

        <div className="popular-login-wrap">
          <Link to="/login" className="popular-login-button">
            Login
          </Link>
        </div>
      </header>

      <section className="popular-hero">
        <p className="popular-eyebrow">🔥 BEST SELLERS</p>
        <h1 className="popular-title">Popular Food</h1>
        <p className="popular-subtitle">
          The most loved food items from our restaurants
        </p>
      </section>

      <main className="popular-main">
        <div className="popular-grid">
          {popularFoods.map((food) => (
            <article className="popular-card" key={food.id}>
              <div className="popular-card-image" aria-label={food.name}>
                <span aria-hidden="true">{food.emoji}</span>
              </div>

              <div className="popular-card-content">
                <h2 className="popular-food-name">{food.name}</h2>
                <p className="popular-rating">⭐ {food.rating}</p>

                <div className="popular-card-bottom">
                  <strong className="popular-price">{food.price}</strong>
                  <button
                    className="popular-add-button"
                    type="button"
                    aria-label={`Add ${food.name}`}
                    title="Add item"
                  >
                    +
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>

      <footer className="popular-footer">
        <h2>🍔 Foodly</h2>
        <p>Delicious food. Happy customers. ❤️</p>
        <p>© 2026 Foodly. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Popular;
