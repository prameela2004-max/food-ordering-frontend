import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Login.css";

function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await api.post("/auth/login", {
                email: email.trim(),
                password,
            });

            const token = response.data?.token;
            if (!token) {
                setError("The login response did not include an authentication token. Please check your backend login response.");
                return;
            }

            // Store credentials only after confirming a token was returned.
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(response.data));
            navigate("/");
        } catch (loginError) {
            console.error("Login failed:", loginError);
            if (loginError.response) {
                setError(
                    loginError.response.data?.message ||
                    loginError.response.data?.error ||
                    "Invalid email or password. Please try again."
                );
            } else {
                setError("Unable to connect to the server. Please check that the backend is running.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="loginPage">
            <section className="loginCard" aria-labelledby="loginTitle">
                <div className="loginBrandMark" aria-hidden="true">
                    <span>🍔</span>
                </div>

                <div className="loginHeading">
                    <p className="loginEyebrow">WELCOME BACK</p>
                    <h1 id="loginTitle">Sign in to Foodly</h1>
                    <p className="loginSubtitle">Your next favourite meal is just a moment away.</p>
                </div>

                {error && (
                    <div className="loginError" role="alert">
                        <span aria-hidden="true">!</span>
                        <p>{error}</p>
                    </div>
                )}

                <form className="loginForm" onSubmit={handleLogin}>
                    <div className="loginField">
                        <label htmlFor="loginEmail">Email address</label>
                        <input
                            id="loginEmail"
                            name="email"
                            type="email"
                            autoComplete="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                        />
                    </div>

                    <div className="loginField">
                        <label htmlFor="loginPassword">Password</label>
                        <input
                            id="loginPassword"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required
                        />
                    </div>

                    <button className="loginSubmit" type="submit" disabled={loading}>
                        {loading ? (
                            <>
                                <span className="loginSpinner" aria-hidden="true" />
                                Signing in…
                            </>
                        ) : (
                            <>Sign in <span aria-hidden="true">→</span></>
                        )}
                    </button>
                </form>

                <p className="loginBottomNote">Fresh food. Smooth ordering. A little more happiness.</p>
            </section>
        </main>
    );
}

export default Login;
