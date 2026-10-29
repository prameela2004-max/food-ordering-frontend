import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import OrderSuccess from "./pages/OrderSuccess";
import Checkout from "./pages/Checkout";
import Payment from "./pages/Payment";
import { useEffect, useState } from "react";
import {
    BrowserRouter,
    Routes,
    Route,
    Link,
    Navigate,
    useNavigate
} from "react-router-dom";


import Login from "./pages/Login";
import Restaurants from "./pages/Restaurants";
import Popular from "./pages/Popular";
import RestaurantDetails from "./pages/RestaurantDetails";

import RestaurantCard from "./components/RestaurantCard";

import api from "./services/api";

import "./App.css";
function Welcome() {
    const navigate = useNavigate();

    return (
        <div className="welcomePage">
            <div className="welcomeCard">
                <h1>🍴 Foodly</h1>

                <h2>Welcome to Foodly!</h2>

                <p>
                    Delicious food, delivered with love.
                </p>

                <button
                    onClick={() => navigate("/home")}
                    className="viewMenuButton"
                >
                    View Menu →
                </button>
            </div>
        </div>
    );
}

function Home() {

    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchRestaurants();
    }, []);

    const fetchRestaurants = async () => {

        try {

            const response = await api.get("/restaurants");

            setRestaurants(response.data);

            setError("");

        } catch (error) {

            console.error(error);

            setError("Unable to load restaurants");

        } finally {

            setLoading(false);
        }
    };


    return (

        <div className="homePage">

            {/* =========================================
                NAVBAR
            ========================================= */}

            <header className="homeNavbar">

                <Link
                    to="/"
                    className="homeLogo"
                >
                    🍔
                    <span>Foodly</span>
                </Link>


                <nav className="homeNav">

                    <Link
                        to="/"
                        className="homeNavActive"
                    >
                        Home
                    </Link>

                    <Link to="/restaurants">
                        Restaurants
                    </Link>

                    <Link to="/popular">
                        Popular
                    </Link>

                </nav>


                <div className="homeNavRight">

                    <Link
                        to="/cart"
                        className="cartButton"
                    >
                        🛒
                    </Link>

                    <Link
                        to="/login"
                        className="homeLogin"
                    >
                        Login
                    </Link>

                </div>

            </header>


            {/* =========================================
                HERO
            ========================================= */}

            <section className="homeHero">

                <div className="heroContent">

                    <div className="heroLeft">

                        <div className="heroBadge">
                            🔥 Delicious food delivered
                        </div>

                        <h1>
                            Good food.
                            <br />

                            <span>
                                Good mood.
                            </span>
                        </h1>

                        <p className="heroDescription">
                            Order delicious food from your
                            favorite restaurants and get it
                            delivered straight to your door.
                        </p>


                        {/* LOCATION */}

                        <div className="locationText">
                            📍 Hyderabad
                        </div>


                        {/* SEARCH */}

                        <div className="homeSearch">

                            <span className="searchIcon">
                                🔍
                            </span>

                            <input
                                type="text"
                                placeholder="Search for food or restaurant..."
                            />

                            <button>
                                Search
                            </button>

                        </div>


                        {/* QUICK INFO */}

                        <div className="heroFeatures">

                            <div>
                                <span>⚡</span>
                                <strong>Fast Delivery</strong>
                            </div>

                            <div>
                                <span>⭐</span>
                                <strong>Top Rated</strong>
                            </div>

                            <div>
                                <span>🛡️</span>
                                <strong>Safe & Fresh</strong>
                            </div>

                        </div>

                    </div>


                    {/* HERO FOOD */}

                    <div className="heroFoodArea">

                        <div className="heroOrangeCircle">

                            <div className="heroFoodEmoji">
                                🍛
                            </div>

                        </div>


                        <div className="heroRating">
                            ⭐ <strong>4.9</strong>
                            <small>Excellent</small>
                        </div>


                        <div className="heroDelivery">
                            🚴
                            <div>
                                <strong>
                                    30 min
                                </strong>
                                <small>
                                    Fast delivery
                                </small>
                            </div>
                        </div>


                        <div className="heroFavorite">
                            ❤️
                            <div>
                                <strong>
                                    10K+
                                </strong>
                                <small>
                                    Happy customers
                                </small>
                            </div>
                        </div>

                    </div>

                </div>

            </section>


            {/* =========================================
                CATEGORIES
            ========================================= */}

            <section className="homeCategories">

                <div className="homeSectionHeader">

                    <div>
                        <span className="homeSectionLabel">
                            EXPLORE
                        </span>

                        <h2>
                            What are you craving?
                        </h2>
                    </div>

                </div>


                <div className="homeCategoryGrid">

                    <div className="homeCategory">
    <span>🍛</span>
    <strong>Biryani</strong>
</div>

                    <div className="homeCategory">
                        <span>🍕</span>
                        <strong>Pizza</strong>
                    </div>

                    <div className="homeCategory">
                        <span>🍔</span>
                        <strong>Burgers</strong>
                    </div>

                    <div className="homeCategory">
                        <span>🍜</span>
                        <strong>Noodles</strong>
                    </div>

                    <div className="homeCategory">
                        <span>🍰</span>
                        <strong>Desserts</strong>
                    </div>

                    <div className="homeCategory">
                        <span>🥤</span>
                        <strong>Drinks</strong>
                    </div>

                </div>

            </section>


            {/* =========================================
                RESTAURANTS
            ========================================= */}

            <section className="homeRestaurants">

                <div className="homeSectionHeader">

                    <div>

                        <span className="homeSectionLabel">
                            TOP PICKS
                        </span>

                        <h2>
                            Popular Restaurants
                        </h2>

                    </div>


                    <Link
                        to="/restaurants"
                        className="homeViewAll"
                    >
                        View all →
                    </Link>

                </div>


                {loading && (

                    <div className="homeLoading">
                        Loading restaurants...
                    </div>

                )}


                {error && (

                    <div className="homeError">
                        {error}
                    </div>

                )}


                {!loading &&
                !error &&
                restaurants.length > 0 && (

                    <div className="homeRestaurantGrid">

                       {restaurants
    .slice(0, 6)
    .map((restaurant) => (

                                <RestaurantCard
                                    key={restaurant.id}
                                    restaurant={restaurant}
                                />

                            ))}

                    </div>

                )}

            </section>


            {/* =========================================
                POPULAR FOOD
            ========================================= */}

            <section className="homeFoodSection">

                <div className="homeSectionHeader">

                    <div>

                        <span className="homeSectionLabel">
                            BEST SELLERS
                        </span>

                        <h2>
                            Popular Food
                        </h2>

                    </div>


                    <Link
                        to="/popular"
                        className="homeViewAll"
                    >
                        View all →
                    </Link>

                </div>


                <div className="homeFoodGrid">

                    <HomeFood
                        emoji="🍛"
                        name="Chicken Biryani"
                        rating="5.0"
                        price="₹250"
                    />

                    <HomeFood
                        emoji="🍕"
                        name="Cheese Pizza"
                        rating="4.8"
                        price="₹299"
                    />

                    <HomeFood
                        emoji="🍔"
                        name="Classic Burger"
                        rating="4.7"
                        price="₹199"
                    />

                    <HomeFood
                        emoji="🍰"
                        name="Chocolate Cake"
                        rating="4.9"
                        price="₹180"
                    />

                </div>

            </section>


            {/* =========================================
                FOOTER
            ========================================= */}

            <footer className="homeFooter">
                <div className="homeFooterInner">
                    <div className="footerBrand">
                        <Link to="/" className="footerLogo" aria-label="Foodly home">
                            <span className="footerLogoIcon" aria-hidden="true">🍔</span>
                            <span>Foodly</span>
                        </Link>
                        <p>Your favorite food, delivered with love.</p>
                    </div>

                    <nav className="footerLinks" aria-label="Footer navigation">
                        <Link to="/">Home</Link>
                        <Link to="/restaurants">Restaurants</Link>
                        <Link to="/popular">Popular</Link>
                    </nav>

                    <div className="footerCopyright">
                        <span>© 2026 Foodly. All rights reserved.</span>
                        <span className="footerMadeWith">Made with <span aria-label="love">♥</span> for food lovers</span>
                    </div>
                </div>
            </footer>

        </div>
    );
}


/* FOOD ITEM */

function FoodItem({
    emoji,
    name,
    rating,
    price
}) {

    return (

        <div style={styles.foodCard}>

            <div style={styles.foodImage}>
                {emoji}
            </div>

            <div style={styles.foodContent}>

                <h3>
                    {name}
                </h3>

                <p style={styles.foodRating}>
                    ⭐ {rating}
                </p>

                <div style={styles.foodBottom}>

                    <strong>
                        {price}
                    </strong>

                    <button
                        style={styles.addButton}
                    >
                        +
                    </button>

                </div>

            </div>

        </div>
    );
}
function HomeFood({
    emoji,
    name,
    rating,
    price
}) {

    return (

        <div className="homeFoodCard">

            <div className="homeFoodImage">
                {emoji}

                <span>
                    ⭐ {rating}
                </span>
            </div>


            <div className="homeFoodContent">

                <h3>
                    {name}
                </h3>

                <p>
                    Freshly prepared and delicious
                </p>


                <div className="homeFoodBottom">

                    <strong>
                        {price}
                    </strong>

                    <button>
                        +
                    </button>

                </div>

            </div>

        </div>
    );
}

/* APP */

function App() {
    const isLoggedIn = Boolean(localStorage.getItem("token"));

    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={
                        isLoggedIn
                            ? <Welcome />
                            : <Navigate to="/login" replace />
                    }
                />

                {/* First page: Login */}
<Route
    path="/"
    element={<Navigate to="/login" replace />}
/>

<Route
    path="/login"
    element={<Login />}
/>

{/* After login: Welcome page */}
<Route
    path="/welcome"
    element={<Welcome />}
/>

{/* After clicking View Menu: Home page */}
<Route
    path="/home"
    element={<Home />}
/>

                <Route path="/home" element={<Home />} />

                <Route path="/cart" element={<Cart />} />
                <Route path="/orders" element={<Orders />} />
                <Route
                    path="/checkout"
                    element={<Checkout />}
                />
                <Route
                    path="/payment/:orderId"
                    element={<Payment />}
                />
                <Route
                    path="/order-success/:orderId"
                    element={<OrderSuccess />}
                />
                <Route
                    path="/restaurants"
                    element={<Restaurants />}
                />
                <Route
                    path="/popular"
                    element={<Popular />}
                />
                <Route
                    path="/restaurant/:id"
                    element={<RestaurantDetails />}
                />
            </Routes>
        </BrowserRouter>
    );
}


/* STYLES */

const styles = {

    page: {
        minHeight: "100vh",
        backgroundColor: "#fffaf5"
    },

    navbar: {
        height: "88px",
        backgroundColor: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 7%",
        boxShadow:
            "0 2px 10px rgba(0,0,0,0.06)",
        position: "sticky",
        top: "0",
        zIndex: "100"
    },

    logo: {
        textDecoration: "none",
        color: "#222",
        fontSize: "30px",
        fontWeight: "800"
    },

    nav: {
        display: "flex",
        gap: "45px"
    },

    navLink: {
        textDecoration: "none",
        color: "#555",
        fontSize: "20px"
    },

    rightSide: {
        display: "flex",
        alignItems: "center",
        gap: "20px"
    },

    cart: {
        backgroundColor: "#fff1eb",
        width: "55px",
        height: "55px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "25px"
    },

    loginButton: {
        textDecoration: "none",
        backgroundColor: "#ff5a1f",
        color: "white",
        padding: "15px 30px",
        borderRadius: "30px",
        fontSize: "18px",
        fontWeight: "700"
    },

    hero: {
        minHeight: "650px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "60px 9%",
        background:
            "linear-gradient(135deg,#fff3d8,#ffe5d9)"
    },

    heroLeft: {
        width: "58%"
    },

    badge: {
        display: "inline-block",
        backgroundColor: "white",
        padding: "16px 25px",
        borderRadius: "35px",
        color: "#ff5a1f",
        fontWeight: "700",
        fontSize: "18px"
    },

    heroTitle: {
        fontSize: "70px",
        lineHeight: "1.05",
        color: "#222",
        margin: "35px 0 20px"
    },

    heroTitleSpan: {
        color: "#ff5a1f"
    },

    heroText: {
        fontSize: "22px",
        color: "#666",
        lineHeight: "1.5",
        maxWidth: "650px"
    },

    searchBox: {
        marginTop: "40px",
        backgroundColor: "white",
        borderRadius: "40px",
        padding: "8px 10px 8px 25px",
        display: "flex",
        alignItems: "center",
        maxWidth: "700px",
        boxShadow:
            "0 10px 30px rgba(0,0,0,0.08)"
    },

    searchInput: {
        flex: "1",
        border: "none",
        outline: "none",
        fontSize: "18px",
        padding: "15px"
    },

    searchButton: {
        border: "none",
        backgroundColor: "#ff5a1f",
        color: "white",
        padding: "16px 30px",
        borderRadius: "30px",
        fontSize: "17px",
        fontWeight: "700"
    },

    heroRight: {
        position: "relative",
        width: "40%",
        height: "500px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },

    orangeCircle: {
        width: "400px",
        height: "400px",
        borderRadius: "50%",
        background:
            "linear-gradient(135deg,#ffad28,#ff641f)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "180px"
    },

    ratingBadge: {
        position: "absolute",
        top: "50px",
        right: "20px",
        backgroundColor: "white",
        padding: "20px 30px",
        borderRadius: "20px",
        fontSize: "20px",
        fontWeight: "700",
        boxShadow:
            "0 10px 30px rgba(0,0,0,0.08)"
    },

    deliveryBadge: {
        position: "absolute",
        bottom: "90px",
        left: "0",
        backgroundColor: "white",
        padding: "20px 30px",
        borderRadius: "20px",
        fontSize: "20px",
        fontWeight: "700",
        boxShadow:
            "0 10px 30px rgba(0,0,0,0.08)"
    },

    favoriteBadge: {
        position: "absolute",
        bottom: "20px",
        right: "0",
        backgroundColor: "white",
        padding: "20px 30px",
        borderRadius: "20px",
        fontSize: "20px",
        fontWeight: "700",
        boxShadow:
            "0 10px 30px rgba(0,0,0,0.08)"
    },

    categorySection: {
        padding: "80px 6%",
        backgroundColor: "white"
    },

    restaurantSection: {
        padding: "70px 6%",
        backgroundColor: "white"
    },

    foodSection: {
        padding: "70px 6%",
        backgroundColor: "#fffaf5"
    },

    sectionLabel: {
        color: "#ff5a1f",
        fontWeight: "800",
        letterSpacing: "3px",
        fontSize: "16px"
    },

    sectionTitle: {
        fontSize: "42px",
        color: "#222",
        marginTop: "5px"
    },

    
    sectionHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
    },

    viewAll: {
        color: "#ff5a1f",
        textDecoration: "none",
        fontSize: "18px",
        fontWeight: "700"
    },

    restaurantGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(auto-fit,minmax(300px,1fr))",
        gap: "35px",
        marginTop: "40px"
    },

    foodGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(4,1fr)",
        gap: "30px",
        marginTop: "40px"
    },

    foodCard: {
        backgroundColor: "white",
        borderRadius: "25px",
        overflow: "hidden",
        boxShadow:
            "0 10px 30px rgba(0,0,0,0.08)"
    },

    foodImage: {
        height: "220px",
        background:
            "linear-gradient(135deg,#fff0d2,#ffe0c7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "100px"
    },

    foodContent: {
        padding: "25px"
    },

    foodRating: {
        color: "#ff9800",
        fontSize: "18px"
    },

    foodBottom: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "20px",
        fontSize: "22px"
    },

    addButton: {
        width: "50px",
        height: "50px",
        border: "none",
        borderRadius: "50%",
        backgroundColor: "#ff5a1f",
        color: "white",
        fontSize: "30px"
    },

    errorBox: {
        textAlign: "center"
    },

    retryButton: {
        backgroundColor: "#222",
        color: "white",
        border: "none",
        padding: "12px 25px",
        borderRadius: "8px"
    },

    footer: {
        backgroundColor: "#222",
        color: "white",
        textAlign: "center",
        padding: "50px"
    }
};


export default App;