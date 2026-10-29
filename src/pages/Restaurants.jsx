
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import RestaurantCard from "../components/RestaurantCard";
import "./Restaurants.css";

function Restaurants() {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadRestaurants = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get("/restaurants/sort/rating");

                setRestaurants(
                    Array.isArray(response.data) ? response.data : []
                );
            } catch (err) {
                console.error("Failed to load restaurants:", err);
                setError(
                    "Unable to load restaurants. Please try again."
                );
            } finally {
                setLoading(false);
            }
        };

        loadRestaurants();
    }, []);

    return (
        <div className="restaurantsPage">
            <header className="restaurantsNavbar">
                <Link to="/" className="restaurantsLogo">
                    <span className="logoIcon">🍴</span>
                    Foodly
                </Link>

                <nav className="restaurantsNavLinks">
                    <Link to="/">Home</Link>
                    <Link to="/restaurants" className="activeNavLink">
                        Restaurants
                    </Link>
                    <Link to="/popular">Popular</Link>
                </nav>

                <Link to="/login" className="restaurantsLoginButton">
                    Login <span>→</span>
                </Link>
            </header>

            <section className="restaurantsHero">
                <div className="heroContent">
                    <span className="restaurantsEyebrow">
                        ⭐ TOP RATED RESTAURANTS
                    </span>

                    <h1>
                        Discover your next
                        <br />
                        <span>favourite meal.</span>
                    </h1>

                    <p>
                        Explore amazing restaurants, delicious food,
                        and flavours worth coming back for.
                    </p>

                    <a href="#restaurant-list" className="heroButton">
                        Explore Restaurants <span>↓</span>
                    </a>
                </div>

                <div className="heroFoodDecoration" aria-hidden="true">
                    <span className="heroFoodEmoji">🍛</span>
                    <span className="floatingFood foodOne">🍕</span>
                    <span className="floatingFood foodTwo">🥘</span>
                    <span className="floatingFood foodThree">🍽️</span>
                </div>
            </section>

            <main className="restaurantsMain" id="restaurant-list">
                <div className="restaurantsSectionHeading">
                    <div>
                        <span className="sectionEyebrow">
                            HANDPICKED FOR YOU
                        </span>
                        <h2>Famous Restaurants</h2>
                        <p>
                            Discover the best places to eat around you.
                        </p>
                    </div>

                    {!loading && !error && (
                        <span className="restaurantCount">
                            {restaurants.length} restaurants
                        </span>
                    )}
                </div>

                {loading && (
                    <div className="restaurantsMessage">
                        <span className="loadingSpinner" />
                        <p>Finding delicious places for you...</p>
                    </div>
                )}

                {!loading && error && (
                    <div className="restaurantsMessage errorMessage">
                        <span>⚠️</span>
                        <p>{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="retryButton"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {!loading && !error && restaurants.length === 0 && (
                    <div className="restaurantsMessage">
                        <span>🍽️</span>
                        <p>No restaurants found right now.</p>
                    </div>
                )}

                {!loading && !error && restaurants.length > 0 && (
                    <div className="restaurantsGrid">
                        {restaurants.map((restaurant) => (
                            <RestaurantCard
                                key={restaurant.id}
                                restaurant={restaurant}
                            />
                        ))}
                    </div>
                )}
            </main>

            <footer className="restaurantsFooter">
                <Link to="/" className="footerLogo">
                    🍴 Foodly
                </Link>
                <p>Good food. Good mood.</p>
                <span>© {new Date().getFullYear()} Foodly</span>
            </footer>
        </div>
    );
}

export default Restaurants;
