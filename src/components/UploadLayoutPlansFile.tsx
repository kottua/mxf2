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
    existingAttachment: LayoutTypeAttachmentResponse | null;
}

interface UploadLayoutPlansFileProps {
    previewSpecData: RealEstateObjectData[];
    reoId: number;
    layoutAttachments?: LayoutTypeAttachmentResponse[];
    onAttachmentUploaded?: (attachment: LayoutTypeAttachmentResponse) => void;
    onAttachmentDeleted?: (layoutType: string) => void;
}

function UploadLayoutPlansFile({
    previewSpecData,
    reoId,
    layoutAttachments = [],
    onAttachmentUploaded,
    onAttachmentDeleted,
}: UploadLayoutPlansFileProps) {
    const { showError, showSuccess } = useNotification();
    const [layoutPlans, setLayoutPlans] = useState<LayoutPlanItem[]>([]);
    const [deletingLayoutTypes, setDeletingLayoutTypes] = useState<Set<string>>(new Set());

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
                    existingAttachment,
                };
            });
            setLayoutPlans(initialPlans);
        } else {
            setLayoutPlans([]);
        }
    }, [uniqueLayoutTypes, layoutAttachments]);

    const handleFileChange = (layoutType: string, e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Проверяем, что это изображение
        if (!file.type.startsWith('image/')) {
            showError('Будь ласка, виберіть файл зображення');
            return;
        }

        // Создаем preview URL
        const previewUrl = URL.createObjectURL(file);

        // Обновляем состояние
        setLayoutPlans((prev) =>
            prev.map((item) =>
                item.layoutType === layoutType
                    ? { ...item, file, previewUrl, isUploaded: false }
                    : item
            )
        );
    };

    const handleUpload = async (layoutType: string) => {
        const planItem = layoutPlans.find((item) => item.layoutType === layoutType);
        if (!planItem || !planItem.file) {
            showError('Будь ласка, виберіть файл для завантаження');
            return;
        }

        // Устанавливаем состояние загрузки
        setLayoutPlans((prev) =>
            prev.map((item) =>
                item.layoutType === layoutType ? { ...item, isUploading: true } : item
            )
        );

        try {
            const response = await uploadLayoutTypeAttachment(reoId, layoutType, planItem.file);
            showSuccess(`План приміщення для "${layoutType}" успішно завантажено`);
            
            // Уведомляем родительский компонент о загрузке нового attachment
            if (onAttachmentUploaded) {
                onAttachmentUploaded(response);
            }
            
            // Обновляем состояние после успешной загрузки
            setLayoutPlans((prev) =>
                prev.map((item) => {
                    if (item.layoutType === layoutType) {
                        // Создаем preview URL из base64 ответа
                        const previewUrl = `data:${response.content_type};base64,${response.base64_file}`;
                        return {
                            ...item,
                            isUploading: false,
                            isUploaded: true,
                            existingAttachment: response,
                            previewUrl,
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
                prev.map((item) =>
                    item.layoutType === layoutType ? { ...item, isUploading: false } : item
                )
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

    const handleDeleteAttachment = async (layoutType: string) => {
        if (!confirm(`Ви впевнені, що хочете видалити зображення для "${layoutType}"?`)) {
            return;
        }

        setDeletingLayoutTypes((prev) => new Set(prev).add(layoutType));

        try {
            await deleteLayoutTypeAttachment(reoId, layoutType);
            showSuccess(`Зображення для "${layoutType}" успішно видалено`);
            
            // Уведомляем родительский компонент об удалении
            if (onAttachmentDeleted) {
                onAttachmentDeleted(layoutType);
            }
            
            // Обновляем состояние - удаляем preview и attachment
            setLayoutPlans((prev) =>
                prev.map((item) => {
                    if (item.layoutType === layoutType) {
                        return {
                            ...item,
                            file: null,
                            previewUrl: null,
                            isUploaded: false,
                            existingAttachment: null,
                        };
                    }
                    return item;
                })
            );
        } catch (error: any) {
            console.error('Помилка видалення зображення:', error);
            showError(`Не вдалося видалити зображення: ${error.message || 'Невідома помилка'}`);
        } finally {
            setDeletingLayoutTypes((prev) => {
                const newSet = new Set(prev);
                newSet.delete(layoutType);
                return newSet;
            });
        }
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
                                            <img
                                                src={item.previewUrl}
                                                alt={`План ${item.layoutType}`}
                                                className={styles.previewImage}
                                            />
                                            <button
                                                onClick={() => handleRemoveFile(item.layoutType)}
                                                className={styles.removeButton}
                                                disabled={item.isUploading}
                                                title="Видалити зображення"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ) : (
                                        <div className={styles.uploadArea}>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                id={`layout_file_${item.layoutType}`}
                                                onChange={(e) => handleFileChange(item.layoutType, e)}
                                                className={styles.fileInput}
                                                disabled={item.isUploading}
                                            />
                                            <label
                                                htmlFor={`layout_file_${item.layoutType}`}
                                                className={styles.fileLabel}
                                            >
                                                Обрати зображення
                                            </label>
                                        </div>
                                    )}
                                </td>
                                <td className={styles.actionsCell}>
                                    {item.isUploaded && !item.file ? (
                                        <div className={styles.actionsGroup}>
                                            <span className={styles.uploadedLabel}>Завантажено</span>
                                            <button
                                                onClick={() => handleDeleteAttachment(item.layoutType)}
                                                disabled={deletingLayoutTypes.has(item.layoutType)}
                                                className={styles.deleteButton}
                                                title="Видалити зображення з сервера"
                                            >
                                                {deletingLayoutTypes.has(item.layoutType) ? '...' : 'Видалити'}
                                            </button>
                                        </div>
                                    ) : item.file ? (
                                        <button
                                            onClick={() => handleUpload(item.layoutType)}
                                            disabled={item.isUploading || item.isUploaded}
                                            className={styles.uploadButton}
                                        >
                                            {item.isUploading
                                                ? 'Завантаження...'
                                                : item.isUploaded
                                                ? 'Завантажено'
                                                : 'Завантажити'}
                                        </button>
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

