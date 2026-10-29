import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8080/api",
    headers: {
        "Content-Type": "application/json"
    }
});


// ==========================================
// ADD JWT ONLY TO PROTECTED REQUESTS
// ==========================================

api.interceptors.request.use(
    (config) => {

        const publicPaths = [
            "/restaurants",
            "/restaurants/",
            "/categories",
            "/reviews/restaurant"
        ];

        const requestUrl = config.url || "";

        const isPublicRequest =
            publicPaths.some((path) =>
                requestUrl.startsWith(path)
            );


        // Don't send JWT for public APIs

        if (!isPublicRequest) {

            const token =
                localStorage.getItem("token");

            if (token) {

                config.headers.Authorization =
                    `Bearer ${token}`;

            }
        }

        return config;
    },

    (error) => {

        return Promise.reject(error);

    }
);


export default api;