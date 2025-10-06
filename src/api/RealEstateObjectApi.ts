import type {RealEstateObject} from "../interfaces/RealEstateObject.ts";
import {api} from "./BaseApi.ts";

export async function fetchRealEstateObject(id: number) : Promise<RealEstateObject> {
    const {data} = await api.get<RealEstateObject>(`/real-estate-objects/${id}`);
    return data;
}

export async function fetchRealEstateObjects(): Promise<RealEstateObject[]> {
    const { data } = await api.get<RealEstateObject[]>("/real-estate-objects/");
    return data;
}

export async function createRealEstateObject(name: string): Promise<RealEstateObject> {
    const { data } = await api.post<RealEstateObject>("/real-estate-objects/", {
        name,
        lat: 0,
        lon: 0,
        curr: "UAH",
        url: "",
        custom_fields: {},
    });
    return data;
}

export async function deleteRealEstateObject(id: number): Promise<void> {
    await api.delete(`/real-estate-objects/${id}`);
}

export async function changeRealEstateObject(
    id: number,
    name: string,
    lat: number,
    lon: number,
    status: boolean,
    curr: string,
    url: string,
    custom_fields: Record<string, unknown>
): Promise<RealEstateObject> {
    const { data } = await api.put<RealEstateObject>(`/real-estate-objects/${id}`, {
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