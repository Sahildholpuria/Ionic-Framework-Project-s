export type UnitCategory = 
  | 'currency'
  | 'length' 
  | 'mass' 
  | 'temperature' 
  | 'area' 
  | 'volume' 
  | 'speed' 
  | 'storage' 
  | 'time';

export interface UnitDefinition {
  id: string;
  name: string;
  symbol: string;
  ratio: number; // Ratio relative to base unit (or conversion functions for temperature)
}

export interface UnitCategoryData {
  id: UnitCategory;
  name: string;
  icon: string;
  baseUnit: string;
  units: UnitDefinition[];
}

export const UNIT_CATEGORIES: UnitCategoryData[] = [
  {
    id: 'currency',
    name: 'Currency',
    icon: 'cash-outline',
    baseUnit: 'INR',
    units: [
      { id: 'INR', name: 'Indian Rupee', symbol: '₹', ratio: 1 },
      { id: 'USD', name: 'US Dollar', symbol: '$', ratio: 87.25 },
      { id: 'EUR', name: 'Euro', symbol: '€', ratio: 94.60 },
      { id: 'GBP', name: 'British Pound', symbol: '£', ratio: 112.40 },
      { id: 'AED', name: 'UAE Dirham', symbol: 'د.إ', ratio: 23.75 },
      { id: 'SAR', name: 'Saudi Riyal', symbol: '﷼', ratio: 23.26 },
      { id: 'CAD', name: 'Canadian Dollar', symbol: 'C$', ratio: 62.80 },
      { id: 'AUD', name: 'Australian Dollar', symbol: 'A$', ratio: 56.50 },
      { id: 'SGD', name: 'Singapore Dollar', symbol: 'S$', ratio: 66.30 },
      { id: 'JPY', name: 'Japanese Yen', symbol: '¥', ratio: 0.58 },
      { id: 'CNY', name: 'Chinese Yuan', symbol: '¥', ratio: 12.05 },
      { id: 'KWD', name: 'Kuwaiti Dinar', symbol: 'KD', ratio: 284.10 },
    ],
  },
  {
    id: 'length',
    name: 'Length',
    icon: 'resize-outline',
    baseUnit: 'm',
    units: [
      { id: 'km', name: 'Kilometer', symbol: 'km', ratio: 1000 },
      { id: 'm', name: 'Meter', symbol: 'm', ratio: 1 },
      { id: 'cm', name: 'Centimeter', symbol: 'cm', ratio: 0.01 },
      { id: 'mm', name: 'Millimeter', symbol: 'mm', ratio: 0.001 },
      { id: 'mi', name: 'Mile', symbol: 'mi', ratio: 1609.344 },
      { id: 'yd', name: 'Yard', symbol: 'yd', ratio: 0.9144 },
      { id: 'ft', name: 'Foot', symbol: 'ft', ratio: 0.3048 },
      { id: 'in', name: 'Inch', symbol: 'in', ratio: 0.0254 },
      { id: 'nmi', name: 'Nautical Mile', symbol: 'NM', ratio: 1852 },
    ],
  },
  {
    id: 'mass',
    name: 'Mass & Weight',
    icon: 'barbell-outline',
    baseUnit: 'kg',
    units: [
      { id: 't', name: 'Metric Ton', symbol: 't', ratio: 1000 },
      { id: 'kg', name: 'Kilogram', symbol: 'kg', ratio: 1 },
      { id: 'g', name: 'Gram', symbol: 'g', ratio: 0.001 },
      { id: 'mg', name: 'Milligram', symbol: 'mg', ratio: 0.000001 },
      { id: 'lb', name: 'Pound', symbol: 'lb', ratio: 0.45359237 },
      { id: 'oz', name: 'Ounce', symbol: 'oz', ratio: 0.02834952 },
      { id: 'st', name: 'Stone', symbol: 'st', ratio: 6.35029 },
    ],
  },
  {
    id: 'temperature',
    name: 'Temperature',
    icon: 'thermometer-outline',
    baseUnit: 'C',
    units: [
      { id: 'C', name: 'Celsius', symbol: '°C', ratio: 1 },
      { id: 'F', name: 'Fahrenheit', symbol: '°F', ratio: 1 },
      { id: 'K', name: 'Kelvin', symbol: 'K', ratio: 1 },
    ],
  },
  {
    id: 'area',
    name: 'Area',
    icon: 'grid-outline',
    baseUnit: 'sqm',
    units: [
      { id: 'sqkm', name: 'Sq. Kilometer', symbol: 'km²', ratio: 1000000 },
      { id: 'sqm', name: 'Sq. Meter', symbol: 'm²', ratio: 1 },
      { id: 'sqcm', name: 'Sq. Centimeter', symbol: 'cm²', ratio: 0.0001 },
      { id: 'ha', name: 'Hectare', symbol: 'ha', ratio: 10000 },
      { id: 'acre', name: 'Acre', symbol: 'ac', ratio: 4046.85642 },
      { id: 'sqmi', name: 'Sq. Mile', symbol: 'mi²', ratio: 2589988.11 },
      { id: 'sqft', name: 'Sq. Foot', symbol: 'ft²', ratio: 0.092903 },
    ],
  },
  {
    id: 'volume',
    name: 'Volume',
    icon: 'water-outline',
    baseUnit: 'l',
    units: [
      { id: 'cum', name: 'Cubic Meter', symbol: 'm³', ratio: 1000 },
      { id: 'l', name: 'Liter', symbol: 'L', ratio: 1 },
      { id: 'ml', name: 'Milliliter', symbol: 'mL', ratio: 0.001 },
      { id: 'gal_us', name: 'Gallon (US)', symbol: 'gal', ratio: 3.78541 },
      { id: 'qt_us', name: 'Quart (US)', symbol: 'qt', ratio: 0.946353 },
      { id: 'pt_us', name: 'Pint (US)', symbol: 'pt', ratio: 0.473176 },
      { id: 'cup_us', name: 'Cup (US)', symbol: 'cup', ratio: 0.236588 },
      { id: 'floz_us', name: 'Fluid Ounce (US)', symbol: 'fl oz', ratio: 0.0295735 },
    ],
  },
  {
    id: 'speed',
    name: 'Speed',
    icon: 'speedometer-outline',
    baseUnit: 'mps',
    units: [
      { id: 'mps', name: 'Meter/sec', symbol: 'm/s', ratio: 1 },
      { id: 'kmh', name: 'Km/hour', symbol: 'km/h', ratio: 0.277778 },
      { id: 'mph', name: 'Miles/hour', symbol: 'mph', ratio: 0.44704 },
      { id: 'knot', name: 'Knot', symbol: 'kn', ratio: 0.514444 },
      { id: 'fps', name: 'Feet/sec', symbol: 'ft/s', ratio: 0.3048 },
    ],
  },
  {
    id: 'storage',
    name: 'Digital Storage',
    icon: 'server-outline',
    baseUnit: 'b',
    units: [
      { id: 'tb', name: 'Terabyte', symbol: 'TB', ratio: 1099511627776 },
      { id: 'gb', name: 'Gigabyte', symbol: 'GB', ratio: 1073741824 },
      { id: 'mb', name: 'Megabyte', symbol: 'MB', ratio: 1048576 },
      { id: 'kb', name: 'Kilobyte', symbol: 'KB', ratio: 1024 },
      { id: 'byte', name: 'Byte', symbol: 'B', ratio: 1 },
      { id: 'bit', name: 'Bit', symbol: 'bit', ratio: 0.125 },
    ],
  },
  {
    id: 'time',
    name: 'Time',
    icon: 'time-outline',
    baseUnit: 's',
    units: [
      { id: 'yr', name: 'Year (365d)', symbol: 'yr', ratio: 31536000 },
      { id: 'mo', name: 'Month (30d)', symbol: 'mo', ratio: 2592000 },
      { id: 'wk', name: 'Week', symbol: 'wk', ratio: 604800 },
      { id: 'd', name: 'Day', symbol: 'd', ratio: 86400 },
      { id: 'h', name: 'Hour', symbol: 'hr', ratio: 3600 },
      { id: 'min', name: 'Minute', symbol: 'min', ratio: 60 },
      { id: 's', name: 'Second', symbol: 's', ratio: 1 },
      { id: 'ms', name: 'Millisecond', symbol: 'ms', ratio: 0.001 },
    ],
  },
];

export function convertUnits(
  value: number,
  category: UnitCategory,
  fromUnitId: string,
  toUnitId: string
): number {
  if (isNaN(value)) return 0;
  if (fromUnitId === toUnitId) return value;

  if (category === 'temperature') {
    let celsius = value;
    if (fromUnitId === 'F') {
      celsius = ((value - 32) * 5) / 9;
    } else if (fromUnitId === 'K') {
      celsius = value - 273.15;
    }

    if (toUnitId === 'C') return celsius;
    if (toUnitId === 'F') return (celsius * 9) / 5 + 32;
    if (toUnitId === 'K') return celsius + 273.15;
    return celsius;
  }

  const catData = UNIT_CATEGORIES.find((c) => c.id === category);
  if (!catData) return value;

  const fromUnit = catData.units.find((u) => u.id === fromUnitId);
  const toUnit = catData.units.find((u) => u.id === toUnitId);

  if (!fromUnit || !toUnit) return value;

  // Convert to base unit, then convert to target unit
  const baseValue = value * fromUnit.ratio;
  return baseValue / toUnit.ratio;
}
