import { useState, useEffect, useMemo } from "react";
import type { RealEstateObjectData } from "../interfaces/RealEstateObjectData.ts";
import type { ChangeEvent } from "react";
import { uploadLayoutTypeAttachment, deleteLayoutTypeAttachment, type LayoutTypeAttachmentResponse } from "../api/LayoutAttachmentApi.ts";
import styles from './UploadLayoutPlansFile.module.css';
import { useNotification } from "../hooks/useNotification.ts";

interface LayoutPlanItem {
    layoutType: string;
    file: File | null;
    previewUrl: string | null;
    isUploading: boolean;
    isUploaded: boolean;
    isDeleting: boolean;
    existingAttachment: LayoutTypeAttachmentResponse | null;
}

interface UploadLayoutPlansFileProps {
    previewSpecData: RealEstateObjectData[];
    reoId: number;
    layoutAttachments?: LayoutTypeAttachmentResponse[];
    onAttachmentUploaded?: (attachment: LayoutTypeAttachmentResponse) => void;
}

function UploadLayoutPlansFile({
    previewSpecData,
    reoId,
    layoutAttachments = [],
    onAttachmentUploaded,
}: UploadLayoutPlansFileProps) {
    const { showError, showSuccess } = useNotification();
    const [layoutPlans, setLayoutPlans] = useState<LayoutPlanItem[]>([]);

    // Получаем уникальные layout_type из загруженных данных спецификации
    const uniqueLayoutTypes = useMemo(() => {
        if (!previewSpecData || previewSpecData.length === 0) {
            return [];
        }

        const layoutTypes = new Set<string>();
        previewSpecData.forEach((item) => {
            const layoutType = item['Layout type'];
            if (layoutType && typeof layoutType === 'string' && layoutType.trim() !== '') {
                layoutTypes.add(layoutType.trim());
            }
        });

        return Array.from(layoutTypes).sort();
    }, [previewSpecData]);

    // Инициализируем состояние для каждого layout_type
    useEffect(() => {
        if (uniqueLayoutTypes.length > 0) {
            const initialPlans: LayoutPlanItem[] = uniqueLayoutTypes.map((layoutType) => {
                // Ищем существующий attachment для этого layout_type
                // Нормализуем строки для сравнения (убираем пробелы, приводим к одному регистру)
                const normalizedLayoutType = layoutType.trim();
                const existingAttachment = layoutAttachments.find(
                    (att) => att.layout_type?.trim() === normalizedLayoutType
                ) || null;

                // Создаем preview URL из base64, если есть существующее изображение
                let previewUrl: string | null = null;
                if (existingAttachment && existingAttachment.base64_file) {
                    // Проверяем, не содержит ли base64_file уже префикс data:
                    const base64Data = existingAttachment.base64_file.startsWith('data:')
                        ? existingAttachment.base64_file
                        : `data:${existingAttachment.content_type || 'image/png'};base64,${existingAttachment.base64_file}`;
                    previewUrl = base64Data;
                }

                return {
                    layoutType,
                    file: null,
                    previewUrl,
                    isUploading: false,
                    isUploaded: !!existingAttachment,
                    isDeleting: false,
                    existingAttachment,
                };
            });
            setLayoutPlans(initialPlans);
        } else {
            setLayoutPlans([]);
        }
    }, [uniqueLayoutTypes, layoutAttachments]);

    const handleFileChange = async (layoutType: string, e: ChangeEvent<HTMLInputElement>) => {
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
        setLayoutPlans((prev) =>
            prev.map((item) =>
                item.layoutType === layoutType
                    ? { ...item, file, previewUrl, isUploaded: false, isUploading: true, isDeleting: false }
                    : item
            )
        );

        // Автоматически загружаем файл
        try {
            const response = await uploadLayoutTypeAttachment(reoId, layoutType, file);
            showSuccess(`План приміщення для "${layoutType}" успішно завантажено`);
            
            // Уведомляем родительский компонент о загрузке нового attachment
            if (onAttachmentUploaded) {
                onAttachmentUploaded(response);
            }
            
            // Обновляем состояние после успешной загрузки
            setLayoutPlans((prev) =>
                prev.map((item) => {
                    if (item.layoutType === layoutType) {
                        // Освобождаем старый preview URL
                        if (previewUrl) {
                            URL.revokeObjectURL(previewUrl);
                        }
                        // Создаем preview URL из base64 ответа
                        const newPreviewUrl = `data:${response.content_type};base64,${response.base64_file}`;
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
            console.error('Помилка завантаження плану приміщення:', error);
            showError(`Не вдалося завантажити план приміщення: ${error.message || 'Невідома помилка'}`);
            
            // Сбрасываем состояние загрузки при ошибке
            setLayoutPlans((prev) =>
                prev.map((item) => {
                    if (item.layoutType === layoutType) {
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

    const handleRemoveFile = (layoutType: string) => {
        setLayoutPlans((prev) =>
            prev.map((item) => {
                if (item.layoutType === layoutType) {
                    // Если это новый файл (не загруженный), освобождаем URL preview
                    if (item.file && item.previewUrl && !item.existingAttachment) {
                        URL.revokeObjectURL(item.previewUrl);
                    }
                    
                    // Если есть существующее изображение, восстанавливаем его preview
                    if (item.existingAttachment && item.existingAttachment.base64_file) {
                        const previewUrl = `data:${item.existingAttachment.content_type};base64,${item.existingAttachment.base64_file}`;
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

    const handleDelete = async (layoutType: string) => {
        const planItem = layoutPlans.find((item) => item.layoutType === layoutType);
        if (!planItem || !planItem.existingAttachment) {
            showError('Немає завантаженого файлу для видалення');
            return;
        }

        // Устанавливаем состояние удаления
        setLayoutPlans((prev) =>
            prev.map((item) =>
                item.layoutType === layoutType ? { ...item, isDeleting: true } : item
            )
        );

        try {
            await deleteLayoutTypeAttachment(reoId, layoutType);
            showSuccess(`План приміщення для "${layoutType}" успішно видалено`);
            
            // Обновляем состояние после успешного удаления
            setLayoutPlans((prev) =>
                prev.map((item) => {
                    if (item.layoutType === layoutType) {
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
            console.error('Помилка видалення плану приміщення:', error);
            showError(`Не вдалося видалити план приміщення: ${error.message || 'Невідома помилка'}`);
            
            // Сбрасываем состояние удаления при ошибке
            setLayoutPlans((prev) =>
                prev.map((item) =>
                    item.layoutType === layoutType ? { ...item, isDeleting: false } : item
                )
            );
        }
    };

    // Функция для определения типа файла
    const isPdfFile = (previewUrl: string | null, existingAttachment: LayoutTypeAttachmentResponse | null): boolean => {
        if (existingAttachment?.content_type === 'application/pdf') {
            return true;
        }
        if (previewUrl?.startsWith('data:application/pdf')) {
            return true;
        }
        return false;
    };

    // Очищаем preview URLs при размонтировании
    useEffect(() => {
        return () => {
            layoutPlans.forEach((item) => {
                if (item.previewUrl) {
                    URL.revokeObjectURL(item.previewUrl);
                }
            });
        };
    }, [layoutPlans]);

    if (uniqueLayoutTypes.length === 0) {
        return (
            <section className={styles.section}>
                <h2>Завантаження планів приміщень</h2>
                <p className={styles.noData}>
                    Спочатку завантажте специфікацію, щоб отримати список типів планувань
                </p>
            </section>
        );
    }

    return (
        <section className={styles.section}>
            <h2>Завантаження планів приміщень</h2>
            
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Тип планування</th>
                            <th>Зображення</th>
                            <th>Дії</th>
                        </tr>
                    </thead>
                    <tbody>
                        {layoutPlans.map((item) => (
                            <tr key={item.layoutType}>
                                <td className={styles.layoutTypeCell}>
                                    <strong>{item.layoutType}</strong>
                                </td>
                                <td className={styles.imageCell}>
                                    {item.previewUrl ? (
                                        <div className={styles.imagePreview}>
                                            {isPdfFile(item.previewUrl, item.existingAttachment) ? (
                                                <iframe
                                                    src={item.previewUrl}
                                                    title={`План ${item.layoutType}`}
                                                    className={styles.previewImage}
                                                    style={{ width: '100%', height: '300px', border: 'none' }}
                                                />
                                            ) : (
                                                <img
                                                    src={item.previewUrl}
                                                    alt={`План ${item.layoutType}`}
                                                    className={styles.previewImage}
                                                />
                                            )}
                                            <button
                                                onClick={() => handleRemoveFile(item.layoutType)}
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
                                                id={`layout_file_${item.layoutType}`}
                                                onChange={(e) => handleFileChange(item.layoutType, e)}
                                                className={styles.fileInput}
                                                disabled={item.isUploading}
                                            />
                                            <label
                                                htmlFor={`layout_file_${item.layoutType}`}
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
                                                onClick={() => handleDelete(item.layoutType)}
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

export default UploadLayoutPlansFile;

