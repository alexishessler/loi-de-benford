/**
 * Benford's Law analysis engine.
 *
 * Expected first-digit distribution: P(d) = log₁₀(1 + 1/d) for d = 1..9
 * Uses chi-squared goodness-of-fit test + MAD (Mean Absolute Deviation).
 */

export interface DataWarning {
  type: 'too-few' | 'low-diversity' | 'narrow-range' | 'dominant-digit';
  message: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface BenfordResult {
  expected: number[];       // 9 percentages (d=1..9)
  observed: number[];       // 9 percentages
  digitCounts: number[];    // raw counts per digit
  chiSquared: number;
  pValue: number;
  mad: number;
  verdict: 'conforming' | 'questionable' | 'non-conforming';
  confidence: number;       // 0-100
  totalNumbers: number;
  excludedCount: number;
  warnings: DataWarning[];
}

/** Benford's expected distribution as percentages */
export function expectedBenford(): number[] {
  return Array.from({ length: 9 }, (_, i) =>
    Math.log10(1 + 1 / (i + 1)) * 100
  );
}

/** Extract the first significant digit (1-9) from a number, or null if invalid */
export function firstSignificantDigit(n: number): number | null {
  if (!Number.isFinite(n) || n === 0) return null;
  const abs = Math.abs(n);
  const str = abs.toExponential();
  const first = parseInt(str[0], 10);
  return first >= 1 && first <= 9 ? first : null;
}

/** Count occurrences of each first digit (index 0 = digit 1, etc.) */
function countDigits(numbers: number[]): { counts: number[]; valid: number; excluded: number } {
  const counts = new Array(9).fill(0);
  let valid = 0;
  let excluded = 0;

  for (const n of numbers) {
    const d = firstSignificantDigit(n);
    if (d !== null) {
      counts[d - 1]++;
      valid++;
    } else {
      excluded++;
    }
  }

  return { counts, valid, excluded };
}

/** Observed distribution as percentages */
function observedDistribution(counts: number[], total: number): number[] {
  if (total === 0) return new Array(9).fill(0);
  return counts.map(c => (c / total) * 100);
}

/**
 * Chi-squared test against Benford's distribution.
 * Returns chi² statistic and approximate p-value.
 */
function chiSquaredTest(
  observed: number[],
  expected: number[],
  n: number
): { chiSquared: number; pValue: number } {
  let chi2 = 0;
  for (let i = 0; i < 9; i++) {
    const exp = (expected[i] / 100) * n;
    const obs = (observed[i] / 100) * n;
    if (exp > 0) {
      chi2 += ((obs - exp) ** 2) / exp;
    }
  }

  // Approximate p-value using regularized incomplete gamma function
  // Degrees of freedom = 8 (9 categories - 1)
  const pValue = 1 - gammaCDF(chi2 / 2, 4); // gamma(df/2, chi2/2)

  return { chiSquared: Math.round(chi2 * 100) / 100, pValue };
}

/** Mean Absolute Deviation between observed and expected */
function meanAbsoluteDeviation(observed: number[], expected: number[]): number {
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += Math.abs(observed[i] - expected[i]);
  }
  return Math.round((sum / 9) * 1000) / 1000;
}

/** Check data quality for Benford analysis */
function checkDataQuality(numbers: number[], counts: number[], valid: number): DataWarning[] {
  const warnings: DataWarning[] = [];

  // 1. Too few values for statistical significance
  if (valid < 50) {
    warnings.push({
      type: 'too-few',
      message: `Seulement ${valid} valeurs valides. Un minimum de 50\u2013100 est recommand\u00e9 pour une analyse fiable.`,
      severity: valid < 20 ? 'critical' : 'warning',
    });
  }

  // 2. Dominant digit (>80% start with the same digit)
  if (valid > 0) {
    const maxCount = Math.max(...counts);
    const maxDigit = counts.indexOf(maxCount) + 1;
    const dominantPct = (maxCount / valid) * 100;
    if (dominantPct > 80) {
      warnings.push({
        type: 'dominant-digit',
        message: `${Math.round(dominantPct)}% des valeurs commencent par ${maxDigit}. Les donn\u00e9es manquent de diversit\u00e9 dans les premiers chiffres.`,
        severity: 'critical',
      });
    } else if (dominantPct > 60) {
      warnings.push({
        type: 'dominant-digit',
        message: `${Math.round(dominantPct)}% des valeurs commencent par ${maxDigit}. La distribution est tr\u00e8s concentr\u00e9e.`,
        severity: 'warning',
      });
    }
  }

  // 3. Low diversity (fewer than 5 distinct first digits used)
  const distinctDigits = counts.filter(c => c > 0).length;
  if (distinctDigits < 5 && valid >= 20) {
    warnings.push({
      type: 'low-diversity',
      message: `Seulement ${distinctDigits} chiffres diff\u00e9rents sur 9. Les donn\u00e9es ne couvrent peut-\u00eatre pas assez d\u2019ordres de grandeur.`,
      severity: distinctDigits < 3 ? 'critical' : 'warning',
    });
  }

  // 4. Narrow range (max/min ratio < 10 = less than 1 order of magnitude)
  const positives = numbers.filter(n => Number.isFinite(n) && n > 0);
  if (positives.length >= 10) {
    const min = Math.min(...positives);
    const max = Math.max(...positives);
    const ratio = max / min;
    if (ratio < 10) {
      warnings.push({
        type: 'narrow-range',
        message: `L\u2019\u00e9cart entre la plus petite (${min.toLocaleString('fr-FR')}) et la plus grande valeur (${max.toLocaleString('fr-FR')}) est inf\u00e9rieur \u00e0 1 ordre de grandeur. Benford s\u2019applique mieux aux donn\u00e9es couvrant plusieurs ordres de grandeur.`,
        severity: 'warning',
      });
    }
  }

  return warnings;
}

/** Main analysis function */
export function analyzeBenford(numbers: number[]): BenfordResult {
  const expected = expectedBenford();
  const { counts, valid, excluded } = countDigits(numbers);
  const observed = observedDistribution(counts, valid);
  const { chiSquared, pValue } = chiSquaredTest(observed, expected, valid);
  const mad = meanAbsoluteDeviation(observed, expected);
  const warnings = checkDataQuality(numbers, counts, valid);

  // Verdict based on MAD thresholds (Nigrini, 2012)
  // Close conformity: MAD < 0.6, Acceptable: MAD < 1.2, Marginal: MAD < 1.5
  let verdict: BenfordResult['verdict'];
  let confidence: number;

  if (pValue > 0.05 && mad < 1.2) {
    verdict = 'conforming';
    confidence = Math.min(99, Math.round(pValue * 100 + (1.2 - mad) * 30));
  } else if (pValue > 0.01 || mad < 1.5) {
    verdict = 'questionable';
    confidence = Math.round(50 + pValue * 200);
  } else {
    verdict = 'non-conforming';
    confidence = Math.max(1, Math.round(pValue * 1000));
  }

  confidence = Math.max(1, Math.min(99, confidence));

  return {
    expected: expected.map(v => Math.round(v * 100) / 100),
    observed: observed.map(v => Math.round(v * 100) / 100),
    digitCounts: counts,
    chiSquared,
    pValue: Math.round(pValue * 10000) / 10000,
    mad,
    verdict,
    confidence,
    totalNumbers: valid,
    excludedCount: excluded,
    warnings,
  };
}

// ─── Gamma CDF approximation (for chi-squared p-value) ───

/** Lower regularized incomplete gamma function P(a, x) */
function gammaCDF(x: number, a: number): number {
  if (x <= 0) return 0;
  if (x < a + 1) {
    return gammaSeriesP(a, x);
  }
  return 1 - gammaCFQ(a, x);
}

/** Series expansion for P(a, x) */
function gammaSeriesP(a: number, x: number): number {
  const lnGammaA = lnGamma(a);
  let sum = 1 / a;
  let term = 1 / a;
  for (let n = 1; n < 200; n++) {
    term *= x / (a + n);
    sum += term;
    if (Math.abs(term) < Math.abs(sum) * 1e-14) break;
  }
  return sum * Math.exp(-x + a * Math.log(x) - lnGammaA);
}

/** Continued fraction for Q(a, x) = 1 - P(a, x) */
function gammaCFQ(a: number, x: number): number {
  const lnGammaA = lnGamma(a);
  let f = x + 1 - a;
  let c = 1e30;
  let d = 1 / f;
  let h = d;

  for (let i = 1; i < 200; i++) {
    const an = -i * (i - a);
    const bn = x + 2 * i + 1 - a;
    d = bn + an * d;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    c = bn + an / c;
    if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d;
    const delta = c * d;
    h *= delta;
    if (Math.abs(delta - 1) < 1e-14) break;
  }

  return Math.exp(-x + a * Math.log(x) - lnGammaA) * h;
}

/** Lanczos approximation for ln(Gamma(z)) */
function lnGamma(z: number): number {
  const g = 7;
  const coefs = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ];

  if (z < 0.5) {
    return Math.log(Math.PI / Math.sin(Math.PI * z)) - lnGamma(1 - z);
  }

  z -= 1;
  let x = coefs[0];
  for (let i = 1; i < g + 2; i++) {
    x += coefs[i] / (z + i);
  }
  const t = z + g + 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}
