import { api } from "./BaseApi.ts";

/**
 * Uploads multiple images to the layout evaluator endpoint
 * @param files Array of image files to upload
 * @param reoId Real estate object ID
 */
export async function uploadLayoutImages(
    files: File[],
    reoId: number
): Promise<any> {
    const formData = new FormData();
    
    // Append all files with the 'files' field name (as per API requirement)
    files.forEach((file) => {
        formData.append('files', file);
    });

    const { data } = await api.post(
        `/agents/layout-evaluator/${reoId}`,
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        }
    );

    return data;
}

