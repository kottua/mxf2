import axios from "axios";
export const api = axios.create({
    baseURL: "https://calc-api-bqq7.onrender.com/api/v1",
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
});
