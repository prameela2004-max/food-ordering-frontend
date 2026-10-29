import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import "./Payment.css";

function Payment() {
    const { orderId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [order, setOrder] = useState(location.state?.order || null);
    const [payment, setPayment] = useState(location.state?.payment || null);
    const [paymentMethod, setPaymentMethod] = useState("CASH_ON_DELIVERY");
    const [loading, setLoading] = useState(!location.state?.order);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState("");
    const [menuImages, setMenuImages] = useState({ byId: {}, byName: {} });

    useEffect(() => {
        let active = true;

        async function loadData() {
            let loadedOrder = location.state?.order || null;

            try {
                setError("");

                if (!loadedOrder) {
                    setLoading(true);
                    const result = await api.get(`/orders/${orderId}`);
                    loadedOrder = result.data;
                    if (active) setOrder(loadedOrder);
                } else if (active) {
                    setOrder(loadedOrder);
                }

                if (!location.state?.payment) {
                    try {
                        const result = await api.get(`/payments/order/${orderId}`);
                        if (active) setPayment(result.data);
                    } catch (e) {
                        // No payment yet is normal for a new order.
                        if (e.response?.status !== 404) {
                            console.warn("Payment lookup failed", e);
                        }
                    }
                }

                // Order DTOs often omit imageUrl. Fetch the restaurant's menu and
                // use its canonical item image paths for the order summary.
                if (loadedOrder && active) {
                    try {
                        let restaurantId = loadedOrder.restaurantId || loadedOrder.restaurant?.id;
                        const orderRestaurantName = loadedOrder.restaurantName || loadedOrder.restaurant?.name;

                        // Some order responses only include the restaurant name.
                        if (!restaurantId && orderRestaurantName) {
                            try {
                                const restaurantsResponse = await api.get("/restaurants");
                                const restaurants = Array.isArray(restaurantsResponse.data)
                                    ? restaurantsResponse.data
                                    : (restaurantsResponse.data?.content || []);
                                const match = restaurants.find(
                                    restaurant => String(restaurant.name || "").trim().toLowerCase() ===
                                        String(orderRestaurantName).trim().toLowerCase()
                                );
                                restaurantId = match?.id;
                            } catch (restaurantLookupError) {
                                console.warn("Could not look up restaurant for menu images", restaurantLookupError);
                            }
                        }

                        if (restaurantId) {
                            const categoriesResponse = await api.get(`/restaurants/${restaurantId}/categories`);
                            const categories = Array.isArray(categoriesResponse.data)
                                ? categoriesResponse.data
                                : (categoriesResponse.data?.content || []);

                            const categoryResponses = await Promise.all(
                                categories.filter(category => category?.id).map(category =>
                                    api.get(`/categories/${category.id}/items`)
                                        .then(response => response.data)
                                        .catch(fetchError => {
                                            console.warn(`Could not load menu items for category ${category.id}`, fetchError);
                                            return [];
                                        })
                                )
                            );

                            const byId = {};
                            const byName = {};
                            categoryResponses.flatMap(data => Array.isArray(data) ? data : (data?.content || []))
                                .forEach(menuItem => {
                                    const image = normalizeImageUrl(
                                        menuItem.imageUrl || menuItem.imageURL || menuItem.image_url
                                    );
                                    if (!image) return;

                                    if (menuItem.id != null) byId[String(menuItem.id)] = image;
                                    const key = normalizeItemName(menuItem.name || menuItem.menuItemName);
                                    if (key && !byName[key]) byName[key] = image;
                                });

                            if (active) setMenuImages({ byId, byName });
                        }
                    } catch (imageLookupError) {
                        // Image lookup should never prevent a customer from paying.
                        console.warn("Could not load menu images for payment summary", imageLookupError);
                    }
                }
            } catch (e) {
                if (active) setError(e.response?.data?.message || "Unable to load this order. Please try again.");
            } finally {
                if (active) setLoading(false);
            }
        }

        loadData();
        return () => { active = false; };
    }, [orderId, location.state]);

    const items = useMemo(() => order?.items || order?.orderItems || [], [order]);
    const total = Number(order?.totalAmount ?? order?.amount ?? payment?.amount ?? 0);
    const restaurantName = order?.restaurantName || order?.restaurant?.name || "Your restaurant";
    const itemName = item => item.menuItemName || item.itemName || item.name || item.menuItem?.name || "Food item";
    const itemPrice = item => Number(item.price ?? item.unitPrice ?? item.menuItem?.price ?? 0);
    const itemImageCandidates = item => {
        const name = itemName(item);
        const menuItemId = item.menuItemId ?? item.menuItem?.id;
        const fromMenu = (menuItemId != null ? menuImages.byId[String(menuItemId)] : "") ||
            menuImages.byName[normalizeItemName(name)] || "";
        const fromOrder = item.imageUrl || item.menuItemImageUrl || item.menuItem?.imageUrl || item.menuItem?.image_url || "";
        const byNameFallback = localImageForName(name);
        return [...new Set([fromMenu, fromOrder, byNameFallback].map(normalizeImageUrl).filter(Boolean))];
    };

    const startPayment = async () => {
        try {
            setProcessing(true);
            setError("");
            const result = await api.post(`/payments/order/${orderId || order?.id}`, { paymentMethod });
            setPayment(result.data);
        } catch (e) {
            setError(e.response?.data?.message || "Unable to start payment. If payment already exists, refresh this page.");
        } finally {
            setProcessing(false);
        }
    };

    const confirmPayment = async () => {
        if (!payment?.id) return setError("Payment details are missing. Please refresh and try again.");
        try {
            setProcessing(true);
            setError("");
            const result = await api.put(`/payments/${payment.id}/confirm`);
            navigate(`/order-success/${orderId || order?.id}`, {
                state: { order, payment: result.data }, replace: true
            });
        } catch (e) {
            setError(e.response?.data?.message || "Unable to confirm payment. Please try again.");
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="paymentPage"><div className="paymentLoading"><span>💳</span><h2>Preparing your payment...</h2></div></div>;

    if (!order) return (
        <div className="paymentPage">
            <Navbar />
            <main className="paymentMessage"><h1>Payment page unavailable</h1><p>{error || "Order information could not be found."}</p><Link className="paymentSecondaryButton" to="/orders">Go to My Orders</Link></main>
        </div>
    );

    const pending = payment?.status === "PENDING";
    const successful = payment?.status === "SUCCESS";

    return (
        <div className="paymentPage">
            <Navbar />
            <main className="paymentContainer">
                <header className="paymentHeader">
                    <span className="paymentEyebrow">SECURE CHECKOUT</span>
                    <h1>Complete your payment</h1>
                    <p>Order <strong>#{order.id || orderId}</strong> · Review your order and choose how to pay.</p>
                </header>

                {error && <div className="paymentAlert" role="alert">⚠️ <span>{error}</span></div>}

                <div className="paymentLayout">
                    <section className="paymentPanel">
                        <div className="paymentSectionHeading">
                            <span className="paymentStepNumber">01</span>
                            <div><h2>Payment method</h2><p>Choose your preferred payment option.</p></div>
                        </div>

                        {successful ? (
                            <div className="paymentNotice successNotice"><span className="noticeIcon">✓</span><div><h3>Payment successful</h3><p>Your payment has been confirmed.</p>{payment.transactionId && <small>Transaction ID: {payment.transactionId}</small>}</div></div>
                        ) : pending ? (
                            <div className="paymentNotice pendingNotice"><span className="noticeIcon">💳</span><div><h3>Payment ready to confirm</h3><p>Method: {(payment.paymentMethod || paymentMethod).replaceAll("_", " ")}</p><p>This is a simulated payment flow; no real payment gateway is connected.</p></div></div>
                        ) : (
                            <div className="paymentMethods">
                                <button type="button" className={`paymentMethodCard ${paymentMethod === "CASH_ON_DELIVERY" ? "active" : ""}`} onClick={() => setPaymentMethod("CASH_ON_DELIVERY")} aria-pressed={paymentMethod === "CASH_ON_DELIVERY"}>
                                    <span className="methodIcon">💵</span><span className="methodText"><strong>Cash on Delivery</strong><small>Pay when your food arrives</small></span><span className="methodRadio">{paymentMethod === "CASH_ON_DELIVERY" ? "●" : "○"}</span>
                                </button>
                                <button type="button" className={`paymentMethodCard ${paymentMethod === "ONLINE" ? "active" : ""}`} onClick={() => setPaymentMethod("ONLINE")} aria-pressed={paymentMethod === "ONLINE"}>
                                    <span className="methodIcon">💳</span><span className="methodText"><strong>Online Payment</strong><small>Continue with online payment</small></span><span className="methodRadio">{paymentMethod === "ONLINE" ? "●" : "○"}</span>
                                </button>
                            </div>
                        )}
                        <div className="paymentSecurityNote"><span>🔒</span><p>Your order details are handled securely by Foodly.</p></div>
                    </section>

                    <aside className="paymentSummary">
                        <div className="paymentSummaryTop"><span className="summaryLabel">ORDER SUMMARY</span><h2>{restaurantName}</h2><p>{items.length} {items.length === 1 ? "item" : "items"} · Order #{order.id || orderId}</p></div>
                        <div className="paymentItems">
                            {items.length ? items.map((item, index) => {
                                const quantity = Number(item.quantity || 1);
                                const price = itemPrice(item);
                                const lineTotal = Number(item.itemTotal ?? price * quantity);
                                const imageCandidates = itemImageCandidates(item);
                                return <div className="paymentItem" key={item.id || item.menuItemId || index}>
                                    <div className="paymentItemImage">
                                        <PaymentItemImage candidates={imageCandidates} alt={itemName(item)} />
                                    </div>
                                    <div className="paymentItemInfo"><strong>{itemName(item)}</strong><span>₹{price.toFixed(2)} × {quantity}</span></div>
                                    <strong className="paymentItemTotal">₹{lineTotal.toFixed(2)}</strong>
                                </div>;
                            }) : <p className="paymentEmptyItems">Order items are not available to display.</p>}
                        </div>
                        <div className="paymentTotalRow"><span>Total to pay</span><strong>₹{total.toFixed(2)}</strong></div>
                        {successful ? <button className="paymentPrimaryButton" onClick={() => navigate(`/order-success/${order.id || orderId}`, { state: { order, payment } })}>View Order Confirmation →</button>
                            : pending ? <button className="paymentPrimaryButton" onClick={confirmPayment} disabled={processing}>{processing ? "Confirming..." : "Confirm Payment"}</button>
                            : <button className="paymentPrimaryButton" onClick={startPayment} disabled={processing}>{processing ? "Processing..." : "Continue to Payment"}</button>}
                        <Link to="/cart" className="paymentBackLink">← Back to Cart</Link>
                    </aside>
                </div>
            </main>
        </div>
    );
}


function normalizeItemName(value) {
    return String(value || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim()
        .replace(/\s+/g, " ");
}

function normalizeImageUrl(value) {
    const image = String(value || "").trim();
    if (!image || image.toLowerCase() === "null" || image.toLowerCase() === "undefined") return "";
    // Avoid URLs that were used as placeholders in seed data.
    if (/example\.com|placeholder|image[-_ ]?unavailable/i.test(image)) return "";
    if (/^(https?:)?\/\//i.test(image)) return image;
    return image.startsWith("/") ? image : `/${image}`;
}

function localImageForName(value) {
    const name = normalizeItemName(value);
    const mappings = [
        [/\bchilli mushroom\b|\bchili mushroom\b/, "/food/chilli-mushroom.jpg"],
        [/\bvegetable biryani\b|\bveg biryani\b/, "/food/vegetable-biryani.jpg"],
        [/\bchicken biryani\b/, "/food/chicken-biryani.jpg"],
        [/\bpaneer biryani\b/, "/food/paneer-biryani.jpg"],
        [/\bcoke\b|\bcola\b/, "/food/coke.jpg"],
        [/\bwater bottle\b|\bbottled water\b|\bwater\b/, "/food/water-bottle.jpg"],
        [/\bpaneer 65\b/, "/food/paneer-65.jpg"],
        [/\bgobi 65\b/, "/food/gobi-65.jpg"],
        [/\bmushroom tikka\b/, "/food/mushroom-tikka.jpg"],
        [/\bveg manchurian\b/, "/food/veg-manchurian.jpg"],
        [/\bchicken majestic\b/, "/food/chicken-majestic.jpg"],
        [/\bmutton fry piece biryani\b/, "/food/mutton-fry-piece-biryani.jpg"],
        [/\bmutton dum biryani\b/, "/food/mutton-dum-biryani.jpg"],
        [/\bgulab jamun\b/, "/food/gulab-jamun.jpg"],
        [/\brasmalai\b/, "/food/rasmalai.jpg"],
        [/\bdouble ka meetha\b/, "/food/double-ka-meetha.jpg"],
        [/\bqubani ka meetha\b/, "/food/qubani-ka-meetha.jpg"],
        [/\bgajar ka halwa\b/, "/food/gajar-ka-halwa.jpg"],
        [/\bkaju katli\b/, "/food/kaju-katli.jpg"],
        [/\bvanilla ice cream\b/, "/food/vanilla-ice-cream.jpg"],
        [/\bchocolate brownie\b/, "/food/chocolate-brownie.jpg"]
    ];
    return mappings.find(([pattern]) => pattern.test(name))?.[1] || "";
}

function PaymentItemImage({ candidates, alt }) {
    const [candidateIndex, setCandidateIndex] = useState(0);
    const candidateKey = candidates.join("|");
    const source = candidates[candidateIndex];

    useEffect(() => {
        setCandidateIndex(0);
    }, [candidateKey]);

    if (!source) {
        return <span className="paymentItemFallback" style={{ display: "grid" }}>🍽️</span>;
    }

    return (
        <>
            <img
                src={source}
                alt={alt}
                onError={() => setCandidateIndex(index => index + 1)}
            />
            {!candidates[candidateIndex + 1] && null}
        </>
    );
}

function Navbar() {
    return <nav className="paymentNavbar"><Link to="/" className="paymentLogo">🍴 Foodly</Link><div className="paymentNavLinks"><Link to="/restaurants">Restaurants</Link><Link to="/orders">My Orders</Link></div></nav>;
}

export default Payment;
