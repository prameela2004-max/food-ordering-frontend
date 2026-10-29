import { useEffect, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import api from "../services/api";

function Cart() {

    const navigate = useNavigate();

    const [cart, setCart] = useState(null);

    const [loading, setLoading] = useState(true);

    const [updatingItem, setUpdatingItem] = useState(null);

    const [removingItem, setRemovingItem] = useState(null);

    const [clearing, setClearing] = useState(false);

    const [error, setError] = useState("");

    // ==========================================

    // LOAD CART

    // ==========================================

    useEffect(() => {

        loadCart();

    }, []);

    const loadCart = async () => {

        try {

            setLoading(true);

            setError("");

            const response = await api.get("/cart");

            setCart(response.data);

        } catch (error) {

            console.error("Cart loading error:", error);

            if (error.response?.status === 401) {

                setError("Please login to view your cart.");

            } else {

                setError(

                    error.response?.data?.message ||

                    "Unable to load cart."

                );

            }

        } finally {

            setLoading(false);

        }

    };

    // ==========================================

    // INCREASE QUANTITY

    // ==========================================

    const increaseQuantity = async (item) => {

        try {

            setUpdatingItem(item.menuItemId);

            const response = await api.put(

                `/cart/items/${item.menuItemId}`,

                {

                    quantity: item.quantity + 1

                }

            );

            setCart(response.data);

        } catch (error) {

            console.error(

                "Increase quantity error:",

                error

            );

            alert(

                error.response?.data?.message ||

                "Unable to update quantity."

            );

        } finally {

            setUpdatingItem(null);

        }

    };

    // ==========================================

    // DECREASE QUANTITY

    // ==========================================

    const decreaseQuantity = async (item) => {

        if (item.quantity <= 1) {

            return;

        }

        try {

            setUpdatingItem(item.menuItemId);

            const response = await api.put(

                `/cart/items/${item.menuItemId}`,

                {

                    quantity: item.quantity - 1

                }

            );

            setCart(response.data);

        } catch (error) {

            console.error(

                "Decrease quantity error:",

                error

            );

            alert(

                error.response?.data?.message ||

                "Unable to update quantity."

            );

        } finally {

            setUpdatingItem(null);

        }

    };

    // ==========================================

    // REMOVE ITEM

    // ==========================================

    const removeItem = async (menuItemId) => {

        try {

            setRemovingItem(menuItemId);

            const response = await api.delete(

                `/cart/items/${menuItemId}`

            );

            setCart(response.data);

        } catch (error) {

            console.error(

                "Remove item error:",

                error

            );

            alert(

                error.response?.data?.message ||

                "Unable to remove item."

            );

        } finally {

            setRemovingItem(null);

        }

    };

    // ==========================================

    // CLEAR CART

    // ==========================================

    const clearCart = async () => {

        const confirmed =

            window.confirm(

                "Are you sure you want to clear your cart?"

            );

        if (!confirmed) {

            return;

        }

        try {

            setClearing(true);

            await api.delete("/cart");

            setCart(null);

        } catch (error) {

            console.error(

                "Clear cart error:",

                error

            );

            alert(

                error.response?.data?.message ||

                "Unable to clear cart."

            );

        } finally {

            setClearing(false);

        }

    };

    // ==========================================

    // LOADING

    // ==========================================

    if (loading) {

        return (

            <div className="cartLoading">

                <div className="cartLoadingIcon">

                    🛒

                </div>

                <h2>

                    Loading your cart...

                </h2>

            </div>

        );

    }

    // ==========================================

    // ERROR

    // ==========================================

    if (error) {

        return (

            <div className="cartPage">

                <nav className="cartNavbar">

                    <Link

                        to="/"

                        className="cartLogo"

                    >

                        🍴 Foodly

                    </Link>

                    <Link to="/restaurants">

                        Restaurants

                    </Link>

                </nav>

                <div className="cartError">

                    <div className="cartErrorIcon">

                        🔒

                    </div>

                    <h2>

                        {error}

                    </h2>

                    <Link

                        to="/login"

                        className="cartPrimaryButton"

                    >

                        Login

                    </Link>

                </div>

            </div>

        );

    }

    // ==========================================

    // EMPTY CART

    // ==========================================

    if (

        !cart ||

        !cart.items ||

        cart.items.length === 0

    ) {

        return (

            <div className="cartPage">

                <nav className="cartNavbar">

                    <Link

                        to="/"

                        className="cartLogo"

                    >

                        🍴 Foodly

                    </Link>

                    <div className="cartNavLinks">

                        <Link to="/restaurants">

                            Restaurants

                        </Link>

                        <Link to="/cart">

                            🛒 Cart

                        </Link>

                    </div>

                </nav>

                <div className="emptyCart">

                    <div className="emptyCartIcon">

                        🛒

                    </div>

                    <h1>

                        Your cart is empty

                    </h1>

                    <p>

                        Looks like you haven't added

                        anything to your cart yet.

                    </p>

                    <Link

                        to="/restaurants"

                        className="cartPrimaryButton"

                    >

                        Browse Restaurants

                    </Link>

                </div>

            </div>

        );

    }

    // ==========================================

    // CART PAGE

    // ==========================================

    return (

        <div className="cartPage">

            {/* =====================================

                NAVBAR

            ====================================== */}

            <nav className="cartNavbar">

                <Link

                    to="/"

                    className="cartLogo"

                >

                    🍴 Foodly

                </Link>

                <div className="cartNavLinks">

                    <Link to="/restaurants">

                        Restaurants

                    </Link>

                    <Link

                        to="/cart"

                        className="activeCartLink"

                    >

                        🛒 Cart

                    </Link>

                </div>

            </nav>

            {/* =====================================

                MAIN

            ====================================== */}

            <main className="cartContainer">

                {/* PAGE HEADER */}

                <div className="cartHeader">

                    <div>

                        <span className="cartSmallTitle">

                            YOUR CART

                        </span>

                        <h1>

                            Your Order

                        </h1>

                        <p>

                            {cart.items.length}{" "}

                            {cart.items.length === 1

                                ? "item"

                                : "items"}{" "}

                            from {cart.restaurantName}

                        </p>

                    </div>

                    <button

                        className="clearCartButton"

                        onClick={clearCart}

                        disabled={clearing}

                    >

                        {clearing

                            ? "Clearing..."

                            : "🗑 Clear Cart"}

                    </button>

                </div>

                {/* RESTAURANT INFO */}

                <div className="cartRestaurant">

                    <div className="restaurantCartIcon">

                        🍴

                    </div>

                    <div>

                        <span>

                            ORDERING FROM

                        </span>

                        <h3>

                            {cart.restaurantName}

                        </h3>

                    </div>

                </div>

                {/* CART CONTENT */}

                <div className="cartLayout">

                    {/* =================================

                        ITEMS

                    ================================== */}

                    <section className="cartItems">

                        {cart.items.map((item) => (

                            <CartItem

                                key={item.id}

                                item={item}

                                updatingItem={updatingItem}

                                removingItem={removingItem}

                                onIncrease={increaseQuantity}

                                onDecrease={decreaseQuantity}

                                onRemove={removeItem}

                            />

                        ))}

                    </section>

                    {/* =================================

                        SUMMARY

                    ================================== */}

                    <aside className="cartSummary">

                        <h2>

                            Order Summary

                        </h2>

                        <div className="summaryRow">

                            <span>

                                Items

                            </span>

                            <span>

                                {cart.items.reduce(

                                    (total, item) =>

                                        total + item.quantity,

                                    0

                                )}

                            </span>

                        </div>

                        <div className="summaryRow">

                            <span>

                                Item total

                            </span>

                            <span>

                                ₹{Number(

                                    cart.totalAmount || 0

                                ).toFixed(2)}

                            </span>

                        </div>

                        <div className="summaryDivider">

                        </div>

                        <div className="summaryTotal">

                            <span>

                                Total

                            </span>

                            <strong>

                                ₹{Number(

                                    cart.totalAmount || 0

                                ).toFixed(2)}

                            </strong>

                        </div>

                        <button

                            className="checkoutButton"

                            onClick={() =>

                                navigate("/checkout")

                            }

                        >

                            Proceed to Checkout →

                        </button>

                        <Link

                            to="/restaurants"

                            className="continueShopping"

                        >

                            ← Continue Shopping

                        </Link>

                    </aside>

                </div>

            </main>

        </div>

    );
}

const getFoodImage = (item) => {
    // Use the known local image for these items first. This avoids stale or
    // incorrect imageUrl values saved in the database/cart response.
    const name = (item?.menuItemName || item?.name || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim();

    const imageByName = [
        [["paneer biryani"], "/food/paneer-biryani.jpg"],
        [["chicken biryani"], "/food/chicken-biryani.jpg"],
        [["vegetable biryani", "veg biryani"], "/food/vegetable-biryani.jpg"],
        [["chicken 65"], "/food/chicken-65.jpg"],
        [["gobi manchurian"], "/food/gobi-manchurian.jpg"],
        [["baby corn fry"], "/food/baby-corn-fry.jpg"],
        [["veg spring rolls", "vegetable spring rolls"], "/food/veg-spring-rolls.jpg"],
        [["paneer tikka pizza"], "/food/paneer-tikka-pizza.jpg"],
        [["double cheese pizza"], "/food/double-cheese-pizza.jpg"],
        [["mexican green wave pizza"], "/food/mexican-green-wave-pizza.jpg"],
        [["spicy chicken pizza"], "/food/spicy-chicken-pizza.jpg"],
        [["margherita pizza", "margherita"], "/food/margherita-pizza.jpg"],
        [["farmhouse pizza"], "/food/farmhouse-pizza.jpg"],
        [["chicken tikka pizza"], "/food/chicken-tikka-pizza.jpg"],
        [["pepperoni pizza"], "/food/pepperoni-pizza.jpg"],
        [["coke", "coca cola"], "/food/coke.jpg"],
    ];

    for (const [names, path] of imageByName) {
        if (names.some((foodName) => name.includes(foodName))) {
            return path;
        }
    }

    // For items without a name mapping, use the image URL from the API.
    const imageUrl = item?.imageUrl || item?.imageURL || item?.image_url;
    if (typeof imageUrl === "string" && imageUrl.trim()) {
        return imageUrl.trim();
    }

    return "/food/default-food.jpg";
};

// ==========================================

// CART ITEM

// ==========================================

function CartItem({

    item,

    updatingItem,

    removingItem,

    onIncrease,

    onDecrease,

    onRemove

}) {

    return (

        <div className="cartItem">

            {/* IMAGE */}

           <div className="cartItemImage">
                <img
                    src={getFoodImage(item)}
                    alt={item.menuItemName || item.name || "Food item"}
                    onError={(event) => {
                        console.error("Failed to load cart image:", event.currentTarget.src);
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = "/food/default-food.jpg";
                    }}
                />
            </div>

            {/* CONTENT */}

            <div className="cartItemContent">

                <div className="cartItemTop">

                    <div>

                        <h3>

                            {item.menuItemName}

                        </h3>

                        <p>

                            ₹{Number(

                                item.price || 0

                            ).toFixed(2)} each

                        </p>

                    </div>

                    <strong className="cartItemTotal">

                        ₹{Number(

                            item.itemTotal || 0

                        ).toFixed(2)}

                    </strong>

                </div>

                <div className="cartItemBottom">

                    {/* QUANTITY */}

                    <div className="quantityControl">

                        <button

                            onClick={() =>

                                onDecrease(item)

                            }

                            disabled={

                                item.quantity <= 1 ||

                                updatingItem === item.menuItemId

                            }

                        >

                            −

                        </button>

                        <span>

                            {updatingItem === item.menuItemId

                                ? "..."

                                : item.quantity}

                        </span>

                        <button

                            onClick={() =>

                                onIncrease(item)

                            }

                            disabled={

                                updatingItem === item.menuItemId

                            }

                        >

                            +

                        </button>

                    </div>

                    {/* REMOVE */}

                    <button

                        className="removeItemButton"

                        onClick={() =>

                            onRemove(item.menuItemId)

                        }

                        disabled={

                            removingItem === item.menuItemId

                        }

                    >

                        {removingItem === item.menuItemId

                            ? "Removing..."

                            : "🗑 Remove"}

                    </button>

                </div>

            </div>

        </div>

    );

}

export default Cart;
