export const fieldTranslations: Record<string, string> = {
    'property_type': 'Тип нерухомості',
    'premises_id': 'ID приміщення',
    'number_of_unit': 'Номер блоку',
    'number': 'Номер квартири',
    'entrance': 'Під\'їзд',
    'floor': 'Поверх',
    'layout_type': 'Тип планування',
    'full_price': 'Повна ціна',
    'total_area_m2': 'Загальна площа (м²)',
    'estimated_area_m2': 'Розрахункова площа (м²)',
    'price_per_meter': 'Ціна за метр',
    'number_of_rooms': 'Кількість кімнат',
    'living_area_m2': 'Житлова площа (м²)',
    'kitchen_area_m2': 'Площа кухні (м²)',
    'view_from_window': 'Вид з вікна',
    'number_of_levels': 'Кількість рівнів',
    'number_of_loggias': 'Кількість лоджій',
    'number_of_balconies': 'Кількість балконів',
    'number_of_bathrooms_with_toilets': 'Кількість санвузлів',
    'number_of_separate_bathrooms': 'Кількість окремих ванних',
    'number_of_terraces': 'Кількість терас',
    'studio': 'Студія',
    'status': 'Статус',
    'sales_amount': 'Сума продажу',
    'created_at': 'Дата створення',
    'updated_at': 'Дата оновлення',
    'layout_score': 'Оцінка планування'
};

export function getFieldDisplayName(fieldName: string): string {
    return fieldTranslations[fieldName] || fieldName;
}
