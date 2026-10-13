export type UnitCategory =
  | 'length'
  | 'mass'
  | 'volume'
  | 'area'
  | 'speed'
  | 'temperature'
  | 'digital'
  | 'time'

interface LinearConv {
  kind: 'linear'
  /** Multiply a value in this unit by `factor` to get the base unit. */
  factor: number
}
interface TempConv {
  kind: 'temp'
  toC: (value: number) => number
  fromC: (value: number) => number
}

export interface Unit {
  id: string
  label: string
  conv: LinearConv | TempConv
}

export interface CategoryMeta {
  id: UnitCategory
  label: string
  defaultFrom: string
  defaultTo: string
}

export const CATEGORY_META: CategoryMeta[] = [
  { id: 'length', label: 'Length', defaultFrom: 'm', defaultTo: 'ft' },
  { id: 'mass', label: 'Mass', defaultFrom: 'kg', defaultTo: 'lb' },
  { id: 'volume', label: 'Volume', defaultFrom: 'l', defaultTo: 'gal' },
  { id: 'area', label: 'Area', defaultFrom: 'm2', defaultTo: 'ft2' },
  { id: 'speed', label: 'Speed', defaultFrom: 'kmh', defaultTo: 'mph' },
  { id: 'temperature', label: 'Temperature', defaultFrom: 'c', defaultTo: 'f' },
  { id: 'digital', label: 'Digital storage', defaultFrom: 'mb', defaultTo: 'gb' },
  { id: 'time', label: 'Time', defaultFrom: 'min', defaultTo: 'h' },
]

const linear = (id: string, label: string, factor: number): Unit => ({
  id,
  label,
  conv: { kind: 'linear', factor },
})

const temp = (
  id: string,
  label: string,
  toC: (v: number) => number,
  fromC: (v: number) => number,
): Unit => ({ id, label, conv: { kind: 'temp', toC, fromC } })

export const UNITS: Record<UnitCategory, Unit[]> = {
  length: [
    linear('mm', 'Millimetres', 0.001),
    linear('cm', 'Centimetres', 0.01),
    linear('m', 'Metres', 1),
    linear('km', 'Kilometres', 1000),
    linear('in', 'Inches', 0.0254),
    linear('ft', 'Feet', 0.3048),
    linear('yd', 'Yards', 0.9144),
    linear('mi', 'Miles', 1609.344),
  ],
  mass: [
    linear('mg', 'Milligrams', 1e-6),
    linear('g', 'Grams', 0.001),
    linear('kg', 'Kilograms', 1),
    linear('t', 'Metric tonnes', 1000),
    linear('oz', 'Ounces', 0.028349523125),
    linear('lb', 'Pounds', 0.45359237),
    linear('st', 'Stone', 6.35029318),
  ],
  volume: [
    linear('ml', 'Millilitres', 0.001),
    linear('l', 'Litres', 1),
    linear('m3', 'Cubic metres', 1000),
    linear('tsp', 'Teaspoons (US)', 0.00492892159375),
    linear('tbsp', 'Tablespoons (US)', 0.01478676478125),
    linear('cup', 'Cups (US)', 0.2365882365),
    linear('pt', 'Pints (US)', 0.473176473),
    linear('qt', 'Quarts (US)', 0.946352946),
    linear('gal', 'Gallons (US)', 3.785411784),
  ],
  area: [
    linear('cm2', 'Square centimetres', 0.0001),
    linear('m2', 'Square metres', 1),
    linear('km2', 'Square kilometres', 1e6),
    linear('ha', 'Hectares', 10000),
    linear('in2', 'Square inches', 0.00064516),
    linear('ft2', 'Square feet', 0.09290304),
    linear('yd2', 'Square yards', 0.83612736),
    linear('acre', 'Acres', 4046.8564224),
  ],
  speed: [
    linear('ms', 'Metres / second', 1),
    linear('kmh', 'Kilometres / hour', 0.2777777777777778),
    linear('mph', 'Miles / hour', 0.44704),
    linear('knot', 'Knots', 0.5144444444444445),
    linear('fts', 'Feet / second', 0.3048),
  ],
  temperature: [
    temp('c', 'Celsius', (v) => v, (v) => v),
    temp('f', 'Fahrenheit', (v) => ((v - 32) * 5) / 9, (v) => (v * 9) / 5 + 32),
    temp('k', 'Kelvin', (v) => v - 273.15, (v) => v + 273.15),
  ],
  digital: [
    linear('bit', 'Bits', 0.125),
    linear('b', 'Bytes', 1),
    linear('kb', 'Kilobytes', 1024),
    linear('mb', 'Megabytes', 1024 ** 2),
    linear('gb', 'Gigabytes', 1024 ** 3),
    linear('tb', 'Terabytes', 1024 ** 4),
  ],
  time: [
    linear('ms2', 'Milliseconds', 0.001),
    linear('s', 'Seconds', 1),
    linear('min', 'Minutes', 60),
    linear('h', 'Hours', 3600),
    linear('day', 'Days', 86400),
    linear('week', 'Weeks', 604800),
  ],
}

const findUnit = (category: UnitCategory, id: string): Unit | undefined =>
  UNITS[category].find((unit) => unit.id === id)

/** Convert `value` between two units in the same category. Returns NaN if unknown. */
export function convertUnit(
  category: UnitCategory,
  fromId: string,
  toId: string,
  value: number,
): number {
  const from = findUnit(category, fromId)
  const to = findUnit(category, toId)
  if (!from || !to) return NaN
  if (from.conv.kind === 'temp' && to.conv.kind === 'temp') {
    return to.conv.fromC(from.conv.toC(value))
  }
  if (from.conv.kind === 'linear' && to.conv.kind === 'linear') {
    return (value * from.conv.factor) / to.conv.factor
  }
  return NaN
}

/** Compact, sensible-precision formatting for converted values. */
export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return '—'
  if (value === 0) return '0'
  const abs = Math.abs(value)
  if (abs >= 1e15 || abs < 1e-6) return value.toExponential(4)
  const decimals = abs >= 100 ? 2 : abs >= 1 ? 4 : 6
  return Number(value.toFixed(decimals)).toString()
}
