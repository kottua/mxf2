import { useState, useRef, ChangeEvent, useEffect } from "react";
import styles from './UploadImages.module.css';
import { useNotification } from "../hooks/useNotification.ts";

interface UploadImagesProps {
    reoId: number;
    selectedImages: File[];
    onImagesChange: (images: File[]) => void;
}

function UploadImages({ reoId, selectedImages, onImagesChange }: UploadImagesProps) {
    const { showError } = useNotification();
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sync previews when selectedImages is cleared externally or length changes
    useEffect(() => {
        if (selectedImages.length === 0) {
            if (imagePreviews.length > 0) {
                setImagePreviews([]);
            }
            return;
        }

        // Only regenerate if arrays are out of sync
        if (imagePreviews.length !== selectedImages.length) {
            const previewPromises = selectedImages.map((file) => {
                return new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        resolve(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                });
            });

            Promise.all(previewPromises).then((newPreviews) => {
                setImagePreviews(newPreviews);
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedImages.length]);

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const validFiles: File[] = [];

        // Validate files first
        Array.from(files).forEach((file) => {
            if (!file.type.startsWith('image/')) {
                showError(`Файл ${file.name} не є зображенням`);
                return;
            }
            validFiles.push(file);
        });

        if (validFiles.length === 0) return;

        // Create previews for all valid files
        const previewPromises = validFiles.map((file) => {
            return new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    resolve(reader.result as string);
                };
                reader.readAsDataURL(file);
            });
        });

        const newPreviews = await Promise.all(previewPromises);

        // Update state with new images and previews
        onImagesChange([...selectedImages, ...validFiles]);
        setImagePreviews((prev) => [...prev, ...newPreviews]);
        
        // Reset input to allow selecting the same files again
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeImage = (index: number) => {
        const newImages = selectedImages.filter((_, i) => i !== index);
        onImagesChange(newImages);
        setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <section className={styles.section}>
            <h2>Завантаження зображень</h2>

            <div className={styles.uploadArea}>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    id="images_file"
                    onChange={handleFileChange}
                    className={styles.fileInput}
                    multiple
                />
                <label htmlFor="images_file" className={styles.fileLabel}>
                    Обрати зображення
                </label>
                <p className={styles.fileInfo}>
                    Підтримуються файли формату .png, .jpg, .jpeg, .gif, .webp
                </p>
            </div>

            {selectedImages.length > 0 && (
                <div className={styles.imagesList}>
                    <h3 className={styles.imagesListTitle}>
                        Вибрані зображення ({selectedImages.length})
                    </h3>
                    <div className={styles.imagesGrid}>
                        {selectedImages.map((file, index) => (
                            <div key={index} className={styles.imageItem}>
                                <div className={styles.imagePreview}>
                                    {imagePreviews[index] ? (
                                        <img
                                            src={imagePreviews[index]}
                                            alt={file.name}
                                            className={styles.previewImage}
                                        />
                                    ) : (
                                        <div className={styles.imagePlaceholder}>
                                            Завантаження...
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className={styles.removeButton}
                                        aria-label="Видалити зображення"
                                    >
                                        ×
                                    </button>
                                </div>
                                <p className={styles.imageName} title={file.name}>
                                    {file.name}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}

export default UploadImages;

