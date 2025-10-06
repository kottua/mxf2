export interface RealEstateObjectData {
    'Property type'?: string;
    'Premises ID'?: string | number;
    'Number of unit'?: string | number;
    Number?: string | number;
    Entrance?: string | number;
    Floor?: string | number;
    'Layout type'?: string;
    'Full price'?: number;
    'Total area, m2'?: number;
    'Estimated area, m2'?: number;
    'Price per meter'?: number;
    'Number of rooms'?: number;
    'Living area, m2'?: number;
    'Kitchen area, m2'?: number;
    'View from window'?: string;
    'Number of levels'?: number;
    'Number of loggias'?: number;
    'Number of balconies'?: number;
    'Number of bathrooms with toilets'?: number;
    'Number of separate bathrooms'?: number;
    'Number of terraces'?: number;
    Studio?: boolean | string;
    Status?: string;
    'Sales amount'?: number;
    custom_fields?: Record<string, unknown>;
}