import {api} from "./BaseApi.ts";

export interface LayoutTypeAttachmentResponse {
    id: number;
    reo_id: number;
    layout_type: string;
    file_name: string;
    file_size: number;
    content_type: string;
    base64_file: string;
    created_at: string;
    updated_at: string;
}

export async function uploadLayoutTypeAttachment(
    reoId: number,
    layoutType: string,
    file: File
): Promise<LayoutTypeAttachmentResponse> {
    const formData = new FormData();
    formData.append('file', file);

    // Кодируем layout_type для безопасной передачи в URL
    const encodedLayoutType = encodeURIComponent(layoutType);

    const { data } = await api.post<LayoutTypeAttachmentResponse>(
        `/premises/layout-attachments/${reoId}/${encodedLayoutType}`,
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        }
    );

    return data;
}

export async function deleteLayoutTypeAttachment(
    reoId: number,
    layoutType: string
): Promise<void> {
    // Кодируем layout_type для безопасной передачи в URL
    const encodedLayoutType = encodeURIComponent(layoutType);

    await api.delete(`/premises/layout-attachments/${reoId}/${encodedLayoutType}`);
}

