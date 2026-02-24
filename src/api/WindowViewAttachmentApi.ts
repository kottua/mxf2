import {api} from "./BaseApi.ts";

export interface WindowViewAttachmentResponse {
    id: number;
    reo_id: number;
    s3_path?: string;
    url: string;
    content_type: string;
    file_name: string;
    file_size: number;
    created_at: string;
    updated_at: string;
    view_from_window: string;
}

export async function uploadWindowViewAttachment(
    reoId: number,
    viewFromWindow: string,
    file: File
): Promise<WindowViewAttachmentResponse> {
    const formData = new FormData();
    formData.append('file', file);

    // Кодируем view_from_window для безопасной передачи в URL
    const encodedViewFromWindow = encodeURIComponent(viewFromWindow);

    const { data } = await api.post<WindowViewAttachmentResponse>(
        `/premises/window-view-attachments/${reoId}/${encodedViewFromWindow}`,
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        }
    );

    return data;
}

export async function deleteWindowViewAttachment(
    reoId: number,
    viewFromWindow: string
): Promise<void> {
    const encodedViewFromWindow = encodeURIComponent(viewFromWindow);
    await api.delete(`/premises/window-view-attachments/${reoId}/${encodedViewFromWindow}`);
}

