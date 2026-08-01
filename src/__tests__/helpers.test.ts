import { describe, it, expect } from 'vitest'
import {
  isPlainObject,
  detailsToText,
  textToDetails,
  TIMELINE_MONTH_NAMES,
  TIMELINE_MONTH_INDEXES,
  formatTimelineDateForDisplay,
  parseTimelineDateForInput,
  normalizeTimelineDateForStorage,
  parseImportantDateForInput,
  normalizeImportantDateForStorage
} from '../utils/helpers'

// ─── isPlainObject ───

describe('isPlainObject', () => {
  it('returns true for plain objects', () => {
    expect(isPlainObject({})).toBe(true)
    expect(isPlainObject({ a: 1 })).toBe(true)
    expect(isPlainObject(Object.create(null))).toBe(true)
  })

  it('returns false for arrays', () => {
    expect(isPlainObject([])).toBe(false)
    expect(isPlainObject([1, 2, 3])).toBe(false)
  })

  it('returns false for null and undefined', () => {
    expect(isPlainObject(null)).toBe(false)
    expect(isPlainObject(undefined)).toBe(false)
  })

  it('returns false for primitives', () => {
    expect(isPlainObject('hello')).toBe(false)
    expect(isPlainObject(42)).toBe(false)
    expect(isPlainObject(true)).toBe(false)
  })

  it('returns true for Date instances (they are objects)', () => {
    // Date is typeof 'object' and not an array — isPlainObject doesn't exclude built-ins
    expect(isPlainObject(new Date())).toBe(true)
  })
})

// ─── detailsToText / textToDetails ───

describe('detailsToText', () => {
  it('converts array to newline-separated string', () => {
    expect(detailsToText(['a', 'b', 'c'])).toBe('a\nb\nc')
  })

  it('returns empty string for non-array', () => {
    expect(detailsToText('not an array')).toBe('')
    expect(detailsToText(null)).toBe('')
    expect(detailsToText(undefined)).toBe('')
  })

  it('returns empty string for empty array', () => {
    expect(detailsToText([])).toBe('')
  })
})

describe('textToDetails', () => {
  it('splits newline-separated text into array', () => {
    expect(textToDetails('a\nb\nc')).toEqual(['a', 'b', 'c'])
  })

  it('trims whitespace from each line', () => {
    expect(textToDetails('  a  \n  b  \n  c  ')).toEqual(['a', 'b', 'c'])
  })

  it('filters out empty lines', () => {
    expect(textToDetails('a\n\nb\n\n\nc')).toEqual(['a', 'b', 'c'])
  })

  it('round-trips with detailsToText', () => {
    const original = ['hola', 'mundo', 'test']
    expect(textToDetails(detailsToText(original))).toEqual(original)
  })
})

// ─── Month constants ───

describe('TIMELINE_MONTH_NAMES', () => {
  it('has 12 months', () => {
    expect(TIMELINE_MONTH_NAMES).toHaveLength(12)
  })

  it('starts with enero and ends with diciembre', () => {
    expect(TIMELINE_MONTH_NAMES[0]).toBe('enero')
    expect(TIMELINE_MONTH_NAMES[11]).toBe('diciembre')
  })
})

describe('TIMELINE_MONTH_INDEXES', () => {
  it('maps enero to 0 and diciembre to 11', () => {
    expect(TIMELINE_MONTH_INDEXES['enero']).toBe(0)
    expect(TIMELINE_MONTH_INDEXES['diciembre']).toBe(11)
  })

  it('supports setiembre as alias for septiembre', () => {
    expect(TIMELINE_MONTH_INDEXES['septiembre']).toBe(8)
    expect(TIMELINE_MONTH_INDEXES['setiembre']).toBe(8)
  })
})

// ─── Date formatting / parsing ───

describe('formatTimelineDateForDisplay', () => {
  it('formats YYYY-MM-DD to Spanish', () => {
    expect(formatTimelineDateForDisplay('2026-01-15')).toBe('15 de enero de 2026')
    expect(formatTimelineDateForDisplay('2025-12-25')).toBe('25 de diciembre de 2025')
  })

  it('returns original string if not a valid date', () => {
    expect(formatTimelineDateForDisplay('some text')).toBe('some text')
  })

  it('handles empty/undefined values', () => {
    expect(formatTimelineDateForDisplay('')).toBe('')
    expect(formatTimelineDateForDisplay(undefined)).toBe('')
    expect(formatTimelineDateForDisplay(null)).toBe('')
  })
})

describe('parseTimelineDateForInput', () => {
  it('returns YYYY-MM-DD unchanged', () => {
    expect(parseTimelineDateForInput('2026-05-20')).toBe('2026-05-20')
  })

  it('parses Spanish date format', () => {
    const result = parseTimelineDateForInput('15 de enero de 2026')
    expect(result).toBe('2026-01-15')
  })

  it('parses Spanish date without year', () => {
    expect(parseTimelineDateForInput('15 de enero')).toBe('')
  })

  it('returns empty string for unrecognized format', () => {
    expect(parseTimelineDateForInput('not a date')).toBe('')
  })
})

describe('normalizeTimelineDateForStorage', () => {
  it('returns YYYY-MM-DD unchanged', () => {
    expect(normalizeTimelineDateForStorage('2026-03-10')).toBe('2026-03-10')
  })

  it('attempts to parse Spanish dates', () => {
    const result = normalizeTimelineDateForStorage('10 de marzo de 2026')
    expect(result).toBe('2026-03-10')
  })

  it('returns original value if unable to parse', () => {
    expect(normalizeTimelineDateForStorage('texto libre')).toBe('texto libre')
  })
})

describe('parseImportantDateForInput', () => {
  it('returns YYYY-MM-DD unchanged', () => {
    expect(parseImportantDateForInput('2026-07-01')).toBe('2026-07-01')
  })

  it('parses Spanish date via parseTimelineDateForInput', () => {
    const result = parseImportantDateForInput('1 de julio de 2026')
    expect(result).toBe('2026-07-01')
  })
})

describe('normalizeImportantDateForStorage', () => {
  it('returns YYYY-MM-DD unchanged', () => {
    expect(normalizeImportantDateForStorage('2026-08-15')).toBe('2026-08-15')
  })

  it('attempts to parse Spanish dates', () => {
    expect(normalizeImportantDateForStorage('15 de agosto de 2026')).toBe('2026-08-15')
  })
})
