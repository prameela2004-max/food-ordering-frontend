import { Link, useLocation, useParams } from "react-router-dom";

function OrderSuccess() {

    const { orderId } = useParams();
    const location = useLocation();

    const order = location.state?.order;

    return (
        <div className="orderSuccessPage">

            {/* NAVBAR */}

            <nav className="orderSuccessNavbar">

                <Link
                    to="/"
                    className="orderSuccessLogo"
                >
                    🍴 Foodly
                </Link>

                <div className="orderSuccessNavLinks">

                    <Link to="/restaurants">
                        Restaurants
                    </Link>

                    <Link to="/cart">
                        🛒 Cart
                    </Link>

                </div>

            </nav>


            {/* SUCCESS */}

            <main className="orderSuccessContainer">

                <div className="successIcon">
                    ✓
                </div>

                <span className="successLabel">
                    ORDER CONFIRMED
                </span>

                <h1>
                    Your order is on the way! 🎉
                </h1>

                <p className="successMessage">
                    Thank you for ordering with Foodly.
                    Your restaurant has received your order.
                </p>


                {/* ORDER CARD */}

                <div className="orderSuccessCard">

                    <div className="orderSuccessHeader">

                        <div>

                            <span>
                                ORDER ID
                            </span>

                            <h2>
                                #{order?.id || orderId}
                            </h2>

                        </div>

                        <div className="orderStatus">
                            {order?.status || "PLACED"}
                        </div>

                    </div>


                    {/* RESTAURANT */}

                    <div className="successRestaurant">

                        <div className="successRestaurantIcon">
                            🍴
                        </div>

                        <div>

                            <span>
                                RESTAURANT
                            </span>

                            <h3>
                                {order?.restaurantName ||
                                    "Restaurant"}
                            </h3>

                        </div>

                    </div>


                    {/* ITEMS */}

                    {order?.items &&
                        order.items.length > 0 && (

                            <div className="successItems">

                                <h3>
                                    Order Items
                                </h3>

                                {order.items.map(
                                    (item, index) => (

                                        <div
                                            className="successItem"
                                            key={
                                                item.id ||
                                                index
                                            }
                                        >

                                            <div>

                                                <strong>
                                                    {item.menuItemName ||
                                                        item.name ||
                                                        `Item ${index + 1}`}
                                                </strong>

                                                <span>
                                                    Qty:{" "}
                                                    {item.quantity}
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
                        )}


                    {/* DELIVERY */}

                    <div className="successDelivery">

                        <span>
                            📍 DELIVERY ADDRESS
                        </span>

                        <p>
                            {order?.deliveryAddress ||
                                "Delivery address confirmed"}
                        </p>

                    </div>


                    {/* TOTAL */}

                    <div className="successTotal">

                        <span>
                            Total Amount
                        </span>

                        <strong>
                            ₹
                            {Number(
                                order?.totalAmount || 0
                            ).toFixed(2)}
                        </strong>

                    </div>

                </div>


                {/* ACTIONS */}

                <div className="orderSuccessActions">

                    <Link
                        to="/restaurants"
                        className="successPrimaryButton"
                    >
                        🍽️ Continue Shopping
                    </Link>

                    <Link
                        to="/orders"
                        className="successSecondaryButton"
                    >
                        View My Orders
                    </Link>

                </div>

            </main>

        </div>
    );
}

export default OrderSuccess;