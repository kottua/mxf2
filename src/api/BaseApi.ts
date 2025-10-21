import axios from "axios";

export const api = axios.create({
    baseURL: "https://mxf2-backend.onrender.com/api/v1",
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
});