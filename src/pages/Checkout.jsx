import { useEffect, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import api from "../services/api";

import "./Checkout.css";



function Checkout() {



    const navigate = useNavigate();



    const [cart, setCart] = useState(null);



    const getFoodImage = (item) => {
        const suppliedUrl =
            item?.imageUrl ||
            item?.imageURL ||
            item?.menuItemImageUrl ||
            item?.menuItem?.imageUrl ||
            item?.menuItem?.imageURL;

        if (
            typeof suppliedUrl === "string" &&
            suppliedUrl.trim() &&
            !/example\.com|default-food\.jpg/i.test(suppliedUrl)
        ) {
            return suppliedUrl.trim();
        }

        const name = String(
            item?.menuItemName || item?.name || item?.menuItem?.name || ""
        ).toLowerCase().replace(/\s+/g, " ").trim();

        const knownImages = {
            "chicken biryani": "/food/chicken-biryani.jpg",
            "paneer biryani": "/food/paneer-biryani.jpg",
            "vegetable biryani": "/food/vegetable-biryani.jpg",
            "veg biryani": "/food/veg-biryani.jpg",
            "mutton fry piece biryani": "/food/mutton-fry-piece-biryani.jpg",
            "mutton dum biryani": "/food/mutton-dum-biryani.jpg",
            "coke": "/food/coke.jpg",
            "cola": "/food/coke.jpg",
            "water bottle": "/food/water-bottle.jpg",
            "bottled water": "/food/water-bottle.jpg",
            "chilli mushroom": "/food/chilli-mushroom.jpg",
            "mushroom tikka": "/food/mushroom-tikka.jpg",
            "paneer 65": "/food/paneer-65.jpg",
            "gobi 65": "/food/gobi-65.jpg",
            "veg manchurian": "/food/veg-manchurian.jpg",
            "gobi manchurian": "/food/gobi-manchurian.jpg",
            "chicken majestic": "/food/chicken-majestic.jpg",
            "chilli chicken": "/food/chilli-chicken.jpg",
            "chicken tikka": "/food/chicken-tikka.jpg",
            "baby corn fry": "/food/baby-corn-fry.jpg",
            "veg spring rolls": "/food/veg-spring-rolls.jpg",
            "pepper chicken": "/food/pepper-chicken.jpg",
            "fish fry": "/food/fish-fry.jpg",
            "andhra chicken fry": "/food/andhra-chicken-fry.jpg",
            "gulab jamun": "/food/gulab-jamun.jpg",
            "rasmalai": "/food/rasmalai.jpg",
            "double ka meetha": "/food/double-ka-meetha.jpg",
            "qubani ka meetha": "/food/qubani-ka-meetha.jpg",
            "gajar ka halwa": "/food/gajar-ka-halwa.jpg",
            "kaju katli": "/food/kaju-katli.jpg",
            "vanilla ice cream": "/food/vanilla-ice-cream.jpg",
            "chocolate brownie": "/food/chocolate-brownie.jpg"
        };

        if (knownImages[name]) return knownImages[name];

        const slug = name
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
        return slug ? `/food/${slug}.jpg` : "";
    };

    const [addresses, setAddresses] = useState([]);



    const [selectedAddressId, setSelectedAddressId] = useState(null);



    const [loading, setLoading] = useState(true);

    const [savingAddress, setSavingAddress] = useState(false);

    const [placingOrder, setPlacingOrder] = useState(false);



    const [showAddressForm, setShowAddressForm] = useState(false);



    const [error, setError] = useState("");



    const [addressForm, setAddressForm] = useState({

        fullAddress: "",

        landmark: "",

        city: "",

        state: "",

        pincode: "",

        addressType: "HOME",

        defaultAddress: false

    });





    // ==========================================

    // LOAD CHECKOUT DATA

    // ==========================================



    useEffect(() => {

        loadCheckoutData();

    }, []);





    const loadCheckoutData = async () => {



        try {



            setLoading(true);

            setError("");



            const [cartResponse, addressResponse] =

                await Promise.all([

                    api.get("/cart"),

                    api.get("/addresses")

                ]);



            let cartData = cartResponse.data;

            const addressData = addressResponse.data || [];

            // Cart endpoints may omit imageUrl. Look up the restaurant menu
            // and merge image URLs into cart items when possible.
            if (cartData?.restaurantId && Array.isArray(cartData.items) && cartData.items.length) {
                try {
                    const categoriesResponse = await api.get(
                        `/restaurants/${cartData.restaurantId}/categories`
                    );
                    const categories = Array.isArray(categoriesResponse.data)
                        ? categoriesResponse.data
                        : [];

                    const itemResponses = await Promise.allSettled(
                        categories.map((category) =>
                            api.get(`/categories/${category.id}/items`)
                        )
                    );
                    const menuItems = itemResponses.flatMap((result) => {
                        if (result.status !== "fulfilled") return [];
                        return Array.isArray(result.value.data) ? result.value.data : [];
                    });

                    const usableUrl = (url) =>
                        typeof url === "string" &&
                        url.trim() &&
                        !/example\.com|default-food\.jpg/i.test(url);
                    const normalizeName = (value) =>
                        String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
                    const menuById = new Map(
                        menuItems
                            .filter((menuItem) => menuItem?.id != null)
                            .map((menuItem) => [String(menuItem.id), menuItem])
                    );
                    const menuByName = new Map(
                        menuItems
                            .filter((menuItem) => menuItem?.name)
                            .map((menuItem) => [normalizeName(menuItem.name), menuItem])
                    );

                    cartData = {
                        ...cartData,
                        items: cartData.items.map((cartItem) => {
                            const menuItemId = cartItem.menuItemId ?? cartItem.menuItem?.id;
                            const menuItemName = cartItem.menuItemName || cartItem.name || cartItem.menuItem?.name;
                            const menuItem =
                                (menuItemId != null && menuById.get(String(menuItemId))) ||
                                menuByName.get(normalizeName(menuItemName));
                            const existingUrl =
                                cartItem.imageUrl || cartItem.imageURL || cartItem.menuItemImageUrl ||
                                cartItem.menuItem?.imageUrl || cartItem.menuItem?.imageURL;
                            const menuUrl = menuItem?.imageUrl || menuItem?.imageURL;

                            return {
                                ...cartItem,
                                imageUrl: usableUrl(existingUrl)
                                    ? existingUrl
                                    : usableUrl(menuUrl)
                                        ? menuUrl
                                        : undefined,
                                name: cartItem.name || menuItemName || menuItem?.name
                            };
                        })
                    };
                } catch (imageLookupError) {
                    // Keep checkout usable even if optional image lookup fails.
                    console.warn("Unable to load menu image URLs:", imageLookupError);
                }
            }

            setCart(cartData);

            setAddresses(addressData);



            // Select default address

            const defaultAddress =

                addressData.find(

                    (address) => address.defaultAddress

                );



            if (defaultAddress) {



                setSelectedAddressId(

                    defaultAddress.id

                );



            } else if (addressData.length > 0) {



                setSelectedAddressId(

                    addressData[0].id

                );

            }



        } catch (error) {



            console.error(

                "Checkout loading error:",

                error

            );



            if (error.response?.status === 401) {



                setError(

                    "Please login before proceeding to checkout."

                );



            } else {



                setError(

                    error.response?.data?.message ||

                    "Unable to load checkout information."

                );

            }



        } finally {



            setLoading(false);

        }

    };





    // ==========================================

    // ADDRESS FORM CHANGE

    // ==========================================



    const handleAddressChange = (event) => {



        const { name, value, type, checked } =

            event.target;



        setAddressForm((previous) => ({

            ...previous,

            [name]:

                type === "checkbox"

                    ? checked

                    : value

        }));

    };





    // ==========================================

    // ADD ADDRESS

    // ==========================================



    const addAddress = async (event) => {



        event.preventDefault();



        try {



            setSavingAddress(true);



            const response = await api.post(

                "/addresses",

                addressForm

            );



            const newAddress = response.data;



            setAddresses((previous) => [

                ...previous,

                newAddress

            ]);



            setSelectedAddressId(newAddress.id);



            setShowAddressForm(false);



            setAddressForm({

                fullAddress: "",

                landmark: "",

                city: "",

                state: "",

                pincode: "",

                addressType: "HOME",

                defaultAddress: false

            });



        } catch (error) {



            console.error(

                "Add address error:",

                error

            );



            alert(

                error.response?.data?.message ||

                "Unable to add address."

            );



        } finally {



            setSavingAddress(false);

        }

    };





    // ==========================================

    // DELETE ADDRESS

    // ==========================================



    const deleteAddress = async (addressId) => {



        const confirmed =

            window.confirm(

                "Are you sure you want to delete this address?"

            );



        if (!confirmed) {

            return;

        }



        try {



            await api.delete(

                `/addresses/${addressId}`

            );



            const remainingAddresses =

                addresses.filter(

                    (address) =>

                        address.id !== addressId

                );



            setAddresses(remainingAddresses);



            if (selectedAddressId === addressId) {



                const nextAddress =

                    remainingAddresses.find(

                        (address) =>

                            address.defaultAddress

                    ) || remainingAddresses[0];



                setSelectedAddressId(

                    nextAddress

                        ? nextAddress.id

                        : null

                );

            }



        } catch (error) {



            console.error(

                "Delete address error:",

                error

            );



            alert(

                error.response?.data?.message ||

                "Unable to delete address."

            );

        }

    };





    // ==========================================

    // SET DEFAULT ADDRESS

    // ==========================================



    const setDefaultAddress = async (addressId) => {



        try {



            const response = await api.put(

                `/addresses/${addressId}/default`

            );



            const updatedAddress =

                response.data;



            setAddresses((previous) =>

                previous.map((address) =>

                    address.id === addressId

                        ? updatedAddress

                        : {

                            ...address,

                            defaultAddress: false

                        }

                )

            );



            setSelectedAddressId(addressId);



        } catch (error) {



            console.error(

                "Set default address error:",

                error

            );



            alert(

                error.response?.data?.message ||

                "Unable to set default address."

            );

        }

    };





    // ==========================================

    // PLACE ORDER

    // ==========================================



    const placeOrder = async () => {



        if (!cart || !cart.items?.length) {



            alert(

                "Your cart is empty."

            );



            return;

        }



        if (!selectedAddressId) {



            alert(

                "Please select a delivery address."

            );



            return;

        }



        try {



            setPlacingOrder(true);



            const orderItems =

                cart.items.map((item) => ({

                    menuItemId: item.menuItemId,

                    quantity: item.quantity

                }));





            const orderRequest = {



                restaurantId:

                    cart.restaurantId,



                addressId:

                    selectedAddressId,



                items:

                    orderItems

            };





            console.log(

                "Creating order:",

                orderRequest

            );





            const response =

                await api.post(

                    "/orders",

                    orderRequest

                );





            const order =

                response.data;





            // Go to order success page

         navigate(

    `/payment/${order.id}`,

    {

        state: {

            order: order

        }

    }

);



        } catch (error) {



            console.error(

                "Place order error:",

                error

            );



            alert(

                error.response?.data?.message ||

                "Unable to place order."

            );



        } finally {



            setPlacingOrder(false);

        }

    };





    // ==========================================

    // LOADING

    // ==========================================



    if (loading) {



        return (

            <div className="checkoutLoading">



                <div className="checkoutLoadingIcon">

                    🧾

                </div>



                <h2>

                    Preparing checkout...

                </h2>



            </div>

        );

    }





    // ==========================================

    // ERROR

    // ==========================================



    if (error) {



        return (

            <div className="checkoutPage">



                <nav className="checkoutNavbar">



                    <Link

                        to="/"

                        className="checkoutLogo"

                    >

                        🍴 Foodly

                    </Link>



                </nav>





                <div className="checkoutError">



                    <div>

                        🔒

                    </div>



                    <h2>

                        {error}

                    </h2>



                    <Link

                        to="/login"

                        className="checkoutPrimaryButton"

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

            <div className="checkoutPage">



                <nav className="checkoutNavbar">



                    <Link

                        to="/"

                        className="checkoutLogo"

                    >

                        🍴 Foodly

                    </Link>



                </nav>





                <div className="checkoutEmpty">



                    <div>

                        🛒

                    </div>



                    <h1>

                        Your cart is empty

                    </h1>



                    <p>

                        Add some delicious food before

                        checking out.

                    </p>



                    <Link

                        to="/restaurants"

                        className="checkoutPrimaryButton"

                    >

                        Browse Restaurants

                    </Link>



                </div>



            </div>

        );

    }





    // ==========================================

    // CHECKOUT PAGE

    // ==========================================



    return (



        <div className="checkoutPage">



            {/* =====================================

                NAVBAR

            ====================================== */}



            <nav className="checkoutNavbar">



                <Link

                    to="/"

                    className="checkoutLogo"

                >

                    🍴 Foodly

                </Link>





                <div className="checkoutNavRight">



                    <Link to="/restaurants">

                        Restaurants

                    </Link>



                   <Link to="/cart" className="cartNavLink">

    🛒 Cart

</Link>

                </div>



            </nav>





            {/* =====================================

                MAIN

            ====================================== */}



            <main className="checkoutContainer">



                <div className="checkoutHeader">



                    <span>

                        CHECKOUT

                    </span>



                    <h1>

                        Complete your order

                    </h1>



                    <p>

                        Choose your delivery address

                        and review your order.

                    </p>



                </div>





                <div className="checkoutLayout">



                    {/* =================================

                        LEFT

                    ================================== */}



                    <div className="checkoutLeft">



                        {/* ADDRESS SECTION */}



                        <section className="checkoutSection">



                            <div className="sectionTitle">



                                <div>

                                    <span>

                                        01

                                    </span>



                                    <div>

                                        <h2>

                                            Delivery Address

                                        </h2>



                                        <p>

                                            Where should we

                                            deliver your food?

                                        </p>

                                    </div>

                                </div>





                                <button

                                    className="addAddressButton"

                                    onClick={() =>

                                        setShowAddressForm(

                                            !showAddressForm

                                        )

                                    }

                                >

                                    {showAddressForm

                                        ? "Cancel"

                                        : "+ Add Address"}

                                </button>



                            </div>





                            {/* ADDRESS FORM */}



                            {showAddressForm && (



                                <form

                                    className="addressForm"

                                    onSubmit={addAddress}

                                >



                                    <div className="formGroup fullWidth">



                                        <label>

                                            Full Address \*

                                        </label>



                                        <textarea

                                            name="fullAddress"

                                            value={

                                                addressForm.fullAddress

                                            }

                                            onChange={

                                                handleAddressChange

                                            }

                                            placeholder="House / Flat / Street / Area"

                                            maxLength={500}

                                            required

                                        />



                                    </div>





                                    <div className="formGrid">



                                        <div className="formGroup">



                                            <label>

                                                Landmark

                                            </label>



                                            <input

                                                type="text"

                                                name="landmark"

                                                value={

                                                    addressForm.landmark

                                                }

                                                onChange={

                                                    handleAddressChange

                                                }

                                                placeholder="Near..."

                                                maxLength={200}

                                            />



                                        </div>





                                        <div className="formGroup">



                                            <label>

                                                City \*

                                            </label>



                                            <input

                                                type="text"

                                                name="city"

                                                value={

                                                    addressForm.city

                                                }

                                                onChange={

                                                    handleAddressChange

                                                }

                                                placeholder="Hyderabad"

                                                required

                                            />



                                        </div>





                                        <div className="formGroup">



                                            <label>

                                                State \*

                                            </label>



                                            <input

                                                type="text"

                                                name="state"

                                                value={

                                                    addressForm.state

                                                }

                                                onChange={

                                                    handleAddressChange

                                                }

                                                placeholder="Telangana"

                                                required

                                            />



                                        </div>





                                        <div className="formGroup">



                                            <label>

                                                Pincode \*

                                            </label>



                                            <input

                                                type="text"

                                                name="pincode"

                                                value={

                                                    addressForm.pincode

                                                }

                                                onChange={

                                                    handleAddressChange

                                                }

                                                placeholder="500001"

                                                maxLength={6}

                                                pattern="[0-9]{6}"

                                                inputMode="numeric"

                                                required

                                            />



                                        </div>



                                    </div>





                                    <div className="addressFormBottom">



                                        <div className="formGroup">



                                            <label>

                                                Address Type \*

                                            </label>



                                            <select

                                                name="addressType"

                                                value={

                                                    addressForm.addressType

                                                }

                                                onChange={

                                                    handleAddressChange

                                                }

                                                required

                                            >



                                                <option value="HOME">

                                                    🏠 Home

                                                </option>



                                                <option value="WORK">

                                                    💼 Work

                                                </option>



                                                <option value="OTHER">

                                                    📍 Other

                                                </option>



                                            </select>



                                        </div>





                                        <label className="defaultCheckbox">



                                            <input

                                                type="checkbox"

                                                name="defaultAddress"

                                                checked={

                                                    addressForm.defaultAddress

                                                }

                                                onChange={

                                                    handleAddressChange

                                                }

                                            />



                                            <span>

                                                Make this my default address

                                            </span>



                                        </label>





                                        <button

                                            type="submit"

                                            className="saveAddressButton"

                                            disabled={

                                                savingAddress

                                            }

                                        >

                                            {savingAddress

                                                ? "Saving..."

                                                : "Save Address"}

                                        </button>



                                    </div>



                                </form>

                            )}





                            {/* SAVED ADDRESSES */}



                            <div className="savedAddresses">



                                {addresses.length === 0 ? (



                                    <div className="noAddresses">



                                        <div>

                                            📍

                                        </div>



                                        <h3>

                                            No saved addresses

                                        </h3>



                                        <p>

                                            Add a delivery address

                                            to continue.

                                        </p>



                                    </div>



                                ) : (



                                    addresses.map(

                                        (address) => (



                                            <AddressCard

                                                key={address.id}

                                                address={address}

                                                selected={

                                                    selectedAddressId ===

                                                    address.id

                                                }

                                                onSelect={() =>

                                                    setSelectedAddressId(

                                                        address.id

                                                    )

                                                }

                                                onDelete={() =>

                                                    deleteAddress(

                                                        address.id

                                                    )

                                                }

                                                onSetDefault={() =>

                                                    setDefaultAddress(

                                                        address.id

                                                    )

                                                }

                                            />



                                        )

                                    )

                                )}



                            </div>



                        </section>





                        {/* ORDER REVIEW */}



                        <section className="checkoutSection">



                            <div className="sectionTitle">



                                <div>



                                    <span>

                                        02

                                    </span>



                                    <div>



                                        <h2>

                                            Review Order

                                        </h2>



                                        <p>

                                            {cart.items.length}{" "}

                                            {cart.items.length === 1

                                                ? "item"

                                                : "items"}{" "}

                                            from{" "}

                                            {cart.restaurantName}

                                        </p>



                                    </div>



                                </div>



                            </div>





                            <div className="checkoutItems">



                                {cart.items.map(

                                    (item) => (



                                        <div

                                            className="checkoutItem"

                                            key={item.id}

                                        >



                                            <div className="checkoutItemImage">
                                                <CheckoutFoodThumbnail item={item} getFoodImage={getFoodImage} />
                                            </div>





                                            <div className="checkoutItemInfo">



                                                <h3>

                                                    {item.menuItemName}

                                                </h3>



                                                <p>

                                                    ₹{Number(

                                                        item.price

                                                    ).toFixed(2)}{" "}

                                                    ×{" "}

                                                    {item.quantity}

                                                </p>



                                            </div>





                                            <strong>

                                                ₹{Number(

                                                    item.itemTotal

                                                ).toFixed(2)}

                                            </strong>



                                        </div>



                                    )

                                )}



                            </div>



                        </section>



                    </div>





                    {/* =================================

                        RIGHT SUMMARY

                    ================================== */}



                    <aside className="checkoutSummary">



                        <div className="summaryRestaurant">



                            <span>

                                ORDERING FROM

                            </span>



                            <h3>

                                {cart.restaurantName}

                            </h3>



                        </div>





                        <h2>

                            Order Summary

                        </h2>





                        <div className="checkoutSummaryRow">



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





                        <div className="checkoutSummaryRow">



                            <span>

                                Food total

                            </span>



                            <span>

                                ₹{Number(

                                    cart.totalAmount || 0

                                ).toFixed(2)}

                            </span>



                        </div>





                        <div className="checkoutSummaryRow">



                            <span>

                                Delivery

                            </span>



                            <span className="freeDelivery">

                                FREE

                            </span>



                        </div>





                        <div className="checkoutSummaryDivider">

                        </div>





                        <div className="checkoutTotal">



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

                            className="placeOrderButton"

                            onClick={placeOrder}

                            disabled={

                                placingOrder ||

                                !selectedAddressId

                            }

                        >



                            {placingOrder

                                ? "Placing Order..."

                                : "🛍️ Place Order"}



                        </button>





                        {!selectedAddressId && (



                            <p className="addressRequiredMessage">

                                Please select a delivery address

                                before placing your order.

                            </p>



                        )}





                        <Link

                            to="/cart"

                            className="backToCart"

                        >

                            ← Back to Cart

                        </Link>



                    </aside>



                </div>



            </main>



        </div>

    );

}





// ==========================================

// ADDRESS CARD

// ==========================================



// Small checkout thumbnail: use the requested image and show a friendly
// fallback instead of an empty box if the image file cannot be loaded.
function CheckoutFoodThumbnail({ item, getFoodImage }) {
    const [imageFailed, setImageFailed] = useState(false);
    const imageUrl = getFoodImage(item);
    const name = String(item?.menuItemName || item?.name || item?.menuItem?.name || "Food item");
    const normalizedName = name.toLowerCase();

    const emoji = normalizedName.includes("biryani") ? "🍛"
        : normalizedName.includes("mushroom") ? "🍄"
        : normalizedName.includes("coke") || normalizedName.includes("water") || normalizedName.includes("lassi") || normalizedName.includes("soda") ? "🥤"
        : normalizedName.includes("jamun") || normalizedName.includes("cake") || normalizedName.includes("ice cream") || normalizedName.includes("dessert") ? "🍨"
        : normalizedName.includes("chicken") || normalizedName.includes("mutton") || normalizedName.includes("fish") || normalizedName.includes("prawn") ? "🍗"
        : normalizedName.includes("paneer") || normalizedName.includes("gobi") || normalizedName.includes("manchurian") ? "🍢"
        : "🍽️";

    if (!imageUrl || imageFailed) {
        return (
            <div
                role="img"
                aria-label={`${name} image unavailable`}
                style={{
                    width: "100%",
                    height: "100%",
                    minHeight: "120px",
                    borderRadius: "16px",
                    background: "linear-gradient(135deg, #fff0df, #ffe0ca)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "8px",
                    color: "#8b5e45",
                    textAlign: "center",
                    padding: "10px",
                    boxSizing: "border-box"
                }}
            >
                <span style={{ fontSize: "42px", lineHeight: 1 }} aria-hidden="true">{emoji}</span>
                <span style={{ fontSize: "12px", fontWeight: 600 }}>Image unavailable</span>
            </div>
        );
    }

    return (
        <img
            src={imageUrl}
            alt={name}
            loading="lazy"
            style={{
                display: "block",
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "16px"
            }}
            onError={() => setImageFailed(true)}
        />
    );
}


// ==========================================
// ADDRESS CARD
// ==========================================

function AddressCard({

    address,

    selected,

    onSelect,

    onDelete,

    onSetDefault

}) {



    return (



        <div

            className={`addressCard ${

                selected

                    ? "selectedAddress"

                    : ""

            }`}

            onClick={onSelect}

        >



            <div className="addressRadio">



                <div

                    className={

                        selected

                            ? "radioSelected"

                            : ""

                    }

                >

                </div>



            </div>





            <div className="addressContent">



                <div className="addressTop">



                    <div className="addressType">



                        <span>

                            {address.addressType === "HOME"

                                ? "🏠"

                                : address.addressType === "WORK"

                                    ? "💼"

                                    : "📍"}

                        </span>



                        <strong>

                            {address.addressType}

                        </strong>



                        {address.defaultAddress && (



                            <small>

                                DEFAULT

                            </small>



                        )}



                    </div>





                    <div className="addressActions">



                        {!address.defaultAddress && (



                            <button

                                onClick={(event) => {

                                    event.stopPropagation();

                                    onSetDefault();

                                }}

                            >

                                Set Default

                            </button>



                        )}



                        <button

                            className="deleteAddress"

                            onClick={(event) => {

                                event.stopPropagation();

                                onDelete();

                            }}

                        >

                            Delete

                        </button>



                    </div>



                </div>





                <p className="fullAddress">

                    {address.fullAddress}

                </p>





                {address.landmark && (



                    <p className="addressLandmark">

                        Near {address.landmark}

                    </p>



                )}





                <p className="addressLocation">



                    {address.city},{" "}

                    {address.state} -{" "}

                    {address.pincode}



                </p>



            </div>



        </div>

    );

}





export default Checkout;
