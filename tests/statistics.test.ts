// ===========================================
// DataInsight Mini — Statistics Tests
// ===========================================

import { describe, it, expect } from "vitest";
import {
  extractNumbers,
  sum,
  mean,
  median,
  min,
  max,
  stdDev,
  count,
  countNonNull,
  uniqueCount,
  describe as describeStats,
} from "@/features/analytics/statistics";

describe("extractNumbers", () => {
  it("extracts plain numbers", () => {
    expect(extractNumbers([1, 2, 3])).toEqual([1, 2, 3]);
  });

  it("extracts numeric strings", () => {
    expect(extractNumbers(["10", "20.5", "30"])).toEqual([10, 20.5, 30]);
  });

  it("handles Rupiah format", () => {
    expect(extractNumbers(["Rp 15.000", "Rp20.000"])).toEqual([15000, 20000]);
  });

  it("skips null, undefined, empty, NaN", () => {
    expect(extractNumbers([null, undefined, "", NaN, "abc", 5])).toEqual([5]);
  });

  it("handles negative numbers", () => {
    expect(extractNumbers([-10, "-5", 0])).toEqual([-10, -5, 0]);
  });

  it("returns empty for empty input", () => {
    expect(extractNumbers([])).toEqual([]);
  });
});

describe("sum", () => {
  it("sums numbers", () => {
    expect(sum([10, 20, 30])).toBe(60);
  });

  it("returns 0 for empty", () => {
    expect(sum([])).toBe(0);
  });

  it("handles mixed types", () => {
    expect(sum([10, "20", null, 30])).toBe(60);
  });

  it("handles negative revenue", () => {
    expect(sum([100, -20, 50])).toBe(130);
  });

  it("handles zero values", () => {
    expect(sum([0, 0, 0])).toBe(0);
  });
});

describe("mean", () => {
  it("computes mean", () => {
    expect(mean([10, 20, 30])).toBe(20);
  });

  it("returns 0 for empty", () => {
    expect(mean([])).toBe(0);
  });

  it("handles single value", () => {
    expect(mean([42])).toBe(42);
  });
});

describe("median", () => {
  it("computes median for odd count", () => {
    expect(median([3, 1, 2])).toBe(2);
  });

  it("computes median for even count", () => {
    expect(median([1, 2, 3, 4])).toBe(2.5);
  });

  it("returns 0 for empty", () => {
    expect(median([])).toBe(0);
  });
});

describe("min / max", () => {
  it("finds min", () => {
    expect(min([5, 3, 8, 1])).toBe(1);
  });

  it("finds max", () => {
    expect(max([5, 3, 8, 1])).toBe(8);
  });

  it("handles negative values", () => {
    expect(min([-10, -5, 0])).toBe(-10);
    expect(max([-10, -5, 0])).toBe(0);
  });

  it("returns 0 for empty", () => {
    expect(min([])).toBe(0);
    expect(max([])).toBe(0);
  });
});

describe("stdDev", () => {
  it("computes population stddev", () => {
    // Values: 2, 4, 4, 4, 5, 5, 7, 9
    // Mean = 5, Variance = 4, StdDev = 2
    expect(stdDev([2, 4, 4, 4, 5, 5, 7, 9])).toBe(2);
  });

  it("returns 0 for single value", () => {
    expect(stdDev([5])).toBe(0);
  });

  it("returns 0 for empty", () => {
    expect(stdDev([])).toBe(0);
  });
});

describe("count / countNonNull / uniqueCount", () => {
  it("counts all values", () => {
    expect(count([1, null, "", 4])).toBe(4);
  });

  it("counts non-null values", () => {
    expect(countNonNull([1, null, "", "  ", 4])).toBe(2);
  });

  it("counts unique values", () => {
    expect(uniqueCount(["a", "b", "a", "c", "b"])).toBe(3);
  });
});

describe("describe (full stats)", () => {
  it("computes full descriptive stats", () => {
    const result = describeStats([10, 20, 30, 40, 50]);
    expect(result.count).toBe(5);
    expect(result.sum).toBe(150);
    expect(result.mean).toBe(30);
    expect(result.median).toBe(30);
    expect(result.min).toBe(10);
    expect(result.max).toBe(50);
    expect(result.stdDev).toBeCloseTo(14.142, 2);
  });

  it("handles empty input", () => {
    const result = describeStats([]);
    expect(result.count).toBe(0);
    expect(result.sum).toBe(0);
  });

  it("handles large numeric values", () => {
    const result = describeStats([1_000_000_000, 2_000_000_000, 3_000_000_000]);
    expect(result.sum).toBe(6_000_000_000);
    expect(result.mean).toBe(2_000_000_000);
  });
});
