import { api } from "./BaseApi.ts";
export async function fetchRealEstateObject(id) {
    const { data } = await api.get(`/real-estate-objects/${id}`);
    return data;
}
export async function fetchRealEstateObjects() {
    const { data } = await api.get("/real-estate-objects/");
    return data;
}
export async function createRealEstateObject(name) {
    const { data } = await api.post("/real-estate-objects/", {
        name,
        lat: 0,
        lon: 0,
        curr: "UAH",
        url: "",
        custom_fields: {},
    });
    return data;
}
export async function deleteRealEstateObject(id) {
    await api.delete(`/real-estate-objects/${id}`);
}
export async function changeRealEstateObject(id, name, lat, lon, status, curr, url, custom_fields) {
    const { data } = await api.put(`/real-estate-objects/${id}`, {
        name,
        lat,
        lon,
        curr,
        url,
        is_deleted: status,
        custom_fields,
    });
    return data;
}
