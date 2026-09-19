export interface SanitizationResult<T> {
  sanitized: T;
  hasModifications: boolean;
  warnings: string[];
}

export class SecurityGuard {
  static readonly MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB
  static readonly MAX_JSON_PAYLOAD_BYTES = 5 * 1024 * 1024; // 5 MB

  /**
   * Sanitizes string values to prevent formula injection attacks (=, +, -, @, |)
   * in CSV and spreadsheet exports.
   */
  static sanitizeFormulaInjection(value: unknown): unknown {
    if (typeof value !== "string") return value;

    const trimmed = value.trim();
    // Formula triggers in Excel / Sheets
    if (/^[=+\-@|\t\r]/.test(trimmed)) {
      return `'${trimmed}`;
    }
    return value;
  }

  /**
   * Sanitizes dataset rows deeply against formula injection.
   */
  static sanitizeDatasetRows(rows: Array<Record<string, unknown>>): Array<Record<string, unknown>> {
    return rows.map((row) => {
      const sanitizedRow: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(row)) {
        const cleanKey = typeof key === "string" ? key.replace(/[^\w\s\-_.#]/gi, "").trim() : key;
        sanitizedRow[cleanKey] = this.sanitizeFormulaInjection(val);
      }
      return sanitizedRow;
    });
  }

  /**
   * Cleans string from XSS / script tags.
   */
  static sanitizeText(input: string): string {
    if (!input) return "";
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+=/gi, "");
  }

  static sanitizeXss(input: string): string {
    return this.sanitizeText(input);
  }

  /**
   * Validates payload byte length against ceiling.
   */
  static validatePayloadSize(byteLength: number, maxBytes: number = this.MAX_JSON_PAYLOAD_BYTES): boolean {
    return byteLength <= maxBytes;
  }

  /**
   * Returns recommended HTTP security headers.
   */
  static getSecurityHeaders(): Record<string, string> {
    return {
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "SAMEORIGIN",
      "X-XSS-Protection": "1; mode=block",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    };
  }
}
