import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Orders() {

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {

        try {

            setLoading(true);

            const response =
                await api.get("/orders/my-orders");

            setOrders(response.data || []);

        } catch (error) {

            console.error(
                "Orders loading error:",
                error
            );

            if (error.response?.status === 401) {
                setError("Please login to view your orders.");
            } else {
                setError(
                    error.response?.data?.message ||
                    "Unable to load your orders."
                );
            }

        } finally {

            setLoading(false);
        }
    };


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (
            <div className="ordersLoading">

                <div className="ordersLoadingIcon">
                    📦
                </div>

                <h2>
                    Loading your orders...
                </h2>

            </div>
        );
    }


    // ==========================================
    // ERROR
    // ==========================================

    if (error) {

        return (
            <div className="ordersPage">

                <nav className="ordersNavbar">

                    <Link
                        to="/"
                        className="ordersLogo"
                    >
                        🍴 Foodly
                    </Link>

                </nav>

                <div className="ordersError">

                    <div>
                        🔒
                    </div>

                    <h2>
                        {error}
                    </h2>

                    <Link
                        to="/login"
                        className="ordersPrimaryButton"
                    >
                        Login
                    </Link>

                </div>

            </div>
        );
    }


    // ==========================================
    // EMPTY
    // ==========================================

    if (orders.length === 0) {

        return (
            <div className="ordersPage">

                <nav className="ordersNavbar">

                    <Link
                        to="/"
                        className="ordersLogo"
                    >
                        🍴 Foodly
                    </Link>

                    <div className="ordersNavLinks">

                        <Link to="/restaurants">
                            Restaurants
                        </Link>

                        <Link to="/cart">
                            🛒 Cart
                        </Link>

                    </div>

                </nav>


                <div className="emptyOrders">

                    <div className="emptyOrdersIcon">
                        📦
                    </div>

                    <h1>
                        No orders yet
                    </h1>

                    <p>
                        Your delicious orders will
                        appear here.
                    </p>

                    <Link
                        to="/restaurants"
                        className="ordersPrimaryButton"
                    >
                        Start Ordering
                    </Link>

                </div>

            </div>
        );
    }


    // ==========================================
    // ORDERS PAGE
    // ==========================================

    return (

        <div className="ordersPage">

            {/* NAVBAR */}

            <nav className="ordersNavbar">

                <Link
                    to="/"
                    className="ordersLogo"
                >
                    🍴 Foodly
                </Link>


                <div className="ordersNavLinks">

                    <Link to="/restaurants">
                        Restaurants
                    </Link>

                    <Link to="/cart">
                        🛒 Cart
                    </Link>

                </div>

            </nav>


            {/* MAIN */}

            <main className="ordersContainer">

                <div className="ordersHeader">

                    <span>
                        YOUR ORDERS
                    </span>

                    <h1>
                        My Orders
                    </h1>

                    <p>
                        Track your recent and previous orders.
                    </p>

                </div>


                <div className="ordersList">

                    {orders.map((order) => (

                        <OrderCard
                            key={order.id}
                            order={order}
                        />

                    ))}

                </div>

            </main>

        </div>
    );
}


// ==========================================
// ORDER CARD
// ==========================================

function OrderCard({ order }) {

    const statusClass =
        String(order.status || "PLACED")
            .toLowerCase();


    const formattedDate =
        order.createdAt
            ? new Date(
                order.createdAt
            ).toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short"
            })
            : "Date unavailable";


    return (

        <div className="orderCard">

            {/* HEADER */}

            <div className="orderCardHeader">

                <div>

                    <span className="orderIdLabel">
                        ORDER ID
                    </span>

                    <h2>
                        #{order.id}
                    </h2>

                </div>


                <span
                    className={`orderStatusBadge ${statusClass}`}
                >
                    {order.status}
                </span>

            </div>


            {/* RESTAURANT */}

            <div className="orderRestaurant">

                <div className="orderRestaurantIcon">
                    🍴
                </div>

                <div>

                    <h3>
                        {order.restaurantName}
                    </h3>

                    {order.restaurantRating != null && (

                        <span>
                            ⭐ {order.restaurantRating}
                        </span>

                    )}

                </div>

            </div>


            {/* ITEMS */}

            <div className="orderItems">

                {order.items?.map(
                    (item, index) => (

                        <div
                            className="orderItem"
                            key={
                                item.id ||
                                item.menuItemId ||
                                index
                            }
                        >

                            <div>

                                <strong>
                                    {item.menuItemName ||
                                        item.name ||
                                        "Food Item"}
                                </strong>

                                <span>
                                    Qty: {item.quantity}
                                </span>

                            </div>


                            <strong>
                                ₹
                                {Number(
                                    item.itemTotal ||
                                    item.price ||
                                    0
                                ).toFixed(2)}
                            </strong>

                        </div>

                    )
                )}

            </div>


            {/* DELIVERY */}

            <div className="orderDelivery">

                <span>
                    📍 DELIVERY ADDRESS
                </span>

                <p>
                    {order.deliveryAddress ||
                        "Address unavailable"}
                </p>

            </div>


            {/* FOOTER */}

            <div className="orderCardFooter">

                <div>

                    <span>
                        {formattedDate}
                    </span>

                    <strong>
                        ₹
                        {Number(
                            order.totalAmount || 0
                        ).toFixed(2)}
                    </strong>

                </div>


                <Link
                    to={`/order-success/${order.id}`}
                    state={{
                        order: order
                    }}
                    className="viewOrderButton"
                >
                    View Order
                </Link>

            </div>

        </div>
    );
}


export default Orders;