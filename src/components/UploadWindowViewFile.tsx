import { useState, useEffect, useMemo } from "react";
import type { RealEstateObjectData } from "../interfaces/RealEstateObjectData.ts";
import type { ChangeEvent } from "react";
import { uploadWindowViewAttachment, deleteWindowViewAttachment, type WindowViewAttachmentResponse } from "../api/WindowViewAttachmentApi.ts";
import styles from './UploadWindowViewFile.module.css';
import { useNotification } from "../hooks/useNotification.ts";

interface WindowViewItem {
    viewFromWindow: string;
    file: File | null;
    previewUrl: string | null;
    isUploading: boolean;
    isUploaded: boolean;
    isDeleting: boolean;
    existingAttachment: WindowViewAttachmentResponse | null;
}

interface UploadWindowViewFileProps {
    previewSpecData: RealEstateObjectData[];
    reoId: number;
    windowViewAttachments?: WindowViewAttachmentResponse[];
    onAttachmentUploaded?: (attachment: WindowViewAttachmentResponse) => void;
    onAttachmentDeleted?: (viewFromWindow: string) => void;
}

function UploadWindowViewFile({
    previewSpecData,
    reoId,
    windowViewAttachments = [],
    onAttachmentUploaded,
    onAttachmentDeleted,
}: UploadWindowViewFileProps) {
    const { showError, showSuccess } = useNotification();
    const [windowViews, setWindowViews] = useState<WindowViewItem[]>([]);

    // Получаем уникальные view_from_window из загруженных данных спецификации
    const uniqueWindowViews = useMemo(() => {
        if (!previewSpecData || previewSpecData.length === 0) {
            return [];
        }

        const windowViews = new Set<string>();
        previewSpecData.forEach((item) => {
            const viewFromWindow = item['View from window'];
            if (viewFromWindow && typeof viewFromWindow === 'string' && viewFromWindow.trim() !== '') {
                windowViews.add(viewFromWindow.trim());
            }
        });

        return Array.from(windowViews).sort();
    }, [previewSpecData]);

    // Инициализируем состояние для каждого view_from_window
    useEffect(() => {
        if (uniqueWindowViews.length > 0) {
            const initialViews: WindowViewItem[] = uniqueWindowViews.map((viewFromWindow) => {
                // Ищем существующий attachment для этого view_from_window
                // Нормализуем строки для сравнения (убираем пробелы, приводим к одному регистру)
                const normalizedViewFromWindow = viewFromWindow.trim();
                const existingAttachment = windowViewAttachments.find(
                    (att) => att.view_from_window?.trim() === normalizedViewFromWindow
                ) || null;

                // Используем URL с S3 для превью (изображение по ссылке)
                let previewUrl: string | null = null;
                if (existingAttachment?.url) {
                    previewUrl = existingAttachment.url;
                }

                return {
                    viewFromWindow,
                    file: null,
                    previewUrl,
                    isUploading: false,
                    isUploaded: !!existingAttachment,
                    isDeleting: false,
                    existingAttachment,
                };
            });
            setWindowViews(initialViews);
        } else {
            setWindowViews([]);
        }
    }, [uniqueWindowViews, windowViewAttachments]);

    const handleFileChange = async (viewFromWindow: string, e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const isImage = file.type.startsWith('image/');
        const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

        if (!isImage && !isPdf) {
            showError('Будь ласка, виберіть файл зображення або PDF');
            return;
        }

        const previewUrl = URL.createObjectURL(file);

        // Обновляем состояние и сразу начинаем загрузку
        setWindowViews((prev) =>
            prev.map((item) =>
                item.viewFromWindow === viewFromWindow
                    ? { ...item, file, previewUrl, isUploaded: false, isUploading: true, isDeleting: false }
                    : item
            )
        );

        // Автоматически загружаем файл
        try {
            const response = await uploadWindowViewAttachment(reoId, viewFromWindow, file);
            showSuccess(`Зображення для виду "${viewFromWindow}" успішно завантажено`);
            
            // Уведомляем родительский компонент о загрузке нового attachment
            if (onAttachmentUploaded) {
                onAttachmentUploaded(response);
            }
            
            // Обновляем состояние после успешной загрузки
            setWindowViews((prev) =>
                prev.map((item) => {
                    if (item.viewFromWindow === viewFromWindow) {
                        // Освобождаем старый preview URL
                        if (previewUrl) {
                            URL.revokeObjectURL(previewUrl);
                        }
                        // Используем URL с S3 для превью
                        const newPreviewUrl = response.url;
                        return {
                            ...item,
                            isUploading: false,
                            isUploaded: true,
                            isDeleting: false,
                            existingAttachment: response,
                            previewUrl: newPreviewUrl,
                        };
                    }
                    return item;
                })
            );
        } catch (error: any) {
            console.error('Помилка завантаження зображення виду з вікна:', error);
            showError(`Не вдалося завантажити зображення: ${error.message || 'Невідома помилка'}`);
            
            // Сбрасываем состояние загрузки при ошибке
            setWindowViews((prev) =>
                prev.map((item) => {
                    if (item.viewFromWindow === viewFromWindow) {
                        // Освобождаем preview URL при ошибке
                        if (previewUrl) {
                            URL.revokeObjectURL(previewUrl);
                        }
                        return { ...item, isUploading: false, isDeleting: false, file: null, previewUrl: null };
                    }
                    return item;
                })
            );
        }
    };

    const handleRemoveFile = (viewFromWindow: string) => {
        setWindowViews((prev) =>
            prev.map((item) => {
                if (item.viewFromWindow === viewFromWindow) {
                    // Если это новый файл (не загруженный), освобождаем URL preview
                    if (item.file && item.previewUrl && !item.existingAttachment) {
                        URL.revokeObjectURL(item.previewUrl);
                    }
                    
                    // Если есть существующее изображение, восстанавливаем его preview по URL
                    if (item.existingAttachment?.url) {
                        const previewUrl = item.existingAttachment.url;
                        return {
                            ...item,
                            file: null,
                            previewUrl,
                            isUploaded: true,
                        };
                    }
                    
                    // Если нет существующего изображения, очищаем все
                    return {
                        ...item,
                        file: null,
                        previewUrl: null,
                        isUploaded: false,
                    };
                }
                return item;
            })
        );
    };

    const handleDelete = async (viewFromWindow: string) => {
        const viewItem = windowViews.find((item) => item.viewFromWindow === viewFromWindow);
        if (!viewItem || !viewItem.existingAttachment) {
            showError('Немає завантаженого файлу для видалення');
            return;
        }

        // Устанавливаем состояние удаления
        setWindowViews((prev) =>
            prev.map((item) =>
                item.viewFromWindow === viewFromWindow ? { ...item, isDeleting: true } : item
            )
        );

        try {
            await deleteWindowViewAttachment(reoId, viewFromWindow);
            showSuccess(`Зображення для виду "${viewFromWindow}" успішно видалено`);
            
            // Уведомляем родительский компонент об удалении
            if (onAttachmentDeleted) {
                onAttachmentDeleted(viewFromWindow);
            }
            
            // Обновляем состояние после успешного удаления
            setWindowViews((prev) =>
                prev.map((item) => {
                    if (item.viewFromWindow === viewFromWindow) {
                        return {
                            ...item,
                            isDeleting: false,
                            isUploaded: false,
                            existingAttachment: null,
                            previewUrl: null,
                            file: null,
                        };
                    }
                    return item;
                })
            );
        } catch (error: any) {
            console.error('Помилка видалення зображення виду з вікна:', error);
            showError(`Не вдалося видалити зображення: ${error.message || 'Невідома помилка'}`);
            
            // Сбрасываем состояние удаления при ошибке
            setWindowViews((prev) =>
                prev.map((item) =>
                    item.viewFromWindow === viewFromWindow ? { ...item, isDeleting: false } : item
                )
            );
        }
    };

    // Функция для определения типа файла (PDF или изображение)
    const isPdfFile = (previewUrl: string | null, existingAttachment: WindowViewAttachmentResponse | null): boolean => {
        if (existingAttachment?.content_type === 'application/pdf') {
            return true;
        }
        if (previewUrl?.startsWith('data:application/pdf')) {
            return true;
        }
        if (previewUrl?.startsWith('https://') && existingAttachment?.file_name?.toLowerCase().endsWith('.pdf')) {
            return true;
        }
        return false;
    };

    // Очищаем preview URLs при размонтировании
    useEffect(() => {
        return () => {
            windowViews.forEach((item) => {
                if (item.previewUrl) {
                    URL.revokeObjectURL(item.previewUrl);
                }
            });
        };
    }, [windowViews]);

    if (uniqueWindowViews.length === 0) {
        return (
            <section className={styles.section}>
                <h2>Завантаження зображень видів з вікна</h2>
                <p className={styles.noData}>
                    Спочатку завантажте специфікацію, щоб отримати список видів з вікна
                </p>
            </section>
        );
    }

    return (
        <section className={styles.section}>
            <h2>Завантаження зображень видів з вікна</h2>
            
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Вид з вікна</th>
                            <th>Зображення</th>
                            <th>Дії</th>
                        </tr>
                    </thead>
                    <tbody>
                        {windowViews.map((item) => (
                            <tr key={item.viewFromWindow}>
                                <td className={styles.viewFromWindowCell}>
                                    <strong>{item.viewFromWindow}</strong>
                                </td>
                                <td className={styles.imageCell}>
                                    {item.previewUrl ? (
                                        <div className={styles.imagePreview}>
                                            {isPdfFile(item.previewUrl, item.existingAttachment) ? (
                                                <iframe
                                                    src={item.previewUrl}
                                                    title={`Вид з вікна ${item.viewFromWindow}`}
                                                    className={styles.previewImage}
                                                    style={{ width: '100%', height: '300px', border: 'none' }}
                                                />
                                            ) : (
                                                <img
                                                    src={item.previewUrl}
                                                    alt={`Вид з вікна ${item.viewFromWindow}`}
                                                    className={styles.previewImage}
                                                />
                                            )}
                                            <button
                                                onClick={() => handleRemoveFile(item.viewFromWindow)}
                                                className={styles.removeButton}
                                                disabled={item.isUploading}
                                                title="Видалити файл"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ) : (
                                        <div className={styles.uploadArea}>
                                            <input
                                                type="file"
                                                accept="image/*,.pdf"
                                                id={`window_view_file_${item.viewFromWindow}`}
                                                onChange={(e) => handleFileChange(item.viewFromWindow, e)}
                                                className={styles.fileInput}
                                                disabled={item.isUploading}
                                            />
                                            <label
                                                htmlFor={`window_view_file_${item.viewFromWindow}`}
                                                className={styles.fileLabel}
                                            >
                                                Обрати файл
                                            </label>
                                        </div>
                                    )}
                                </td>
                                <td className={styles.actionsCell}>
                                    {item.isUploaded ? (
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <span className={styles.uploadedLabel}>Завантажено</span>
                                            <button
                                                onClick={() => handleDelete(item.viewFromWindow)}
                                                disabled={item.isDeleting || item.isUploading}
                                                className={styles.deleteButton}
                                                title="Видалити з сервера"
                                            >
                                                {item.isDeleting ? 'Видалення...' : 'Видалити'}
                                            </button>
                                        </div>
                                    ) : item.isUploading ? (
                                        <span className={styles.uploadedLabel}>Завантаження...</span>
                                    ) : null}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

export default UploadWindowViewFile;

