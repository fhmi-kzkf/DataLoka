export type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

export interface CircuitBreakerOptions {
  name?: string;
  failureThreshold?: number;
  cooldownPeriodMs?: number;
  successThreshold?: number;
}

export class CircuitBreaker {
  private name: string;
  private state: CircuitState = "CLOSED";
  private failureCount: number = 0;
  private successCount: number = 0;
  private lastFailureTime: number = 0;
  private failureThreshold: number;
  private cooldownPeriodMs: number;
  private successThreshold: number;

  constructor(
    nameOrOptions: string | CircuitBreakerOptions = "DefaultCircuitBreaker",
    options: CircuitBreakerOptions = {}
  ) {
    if (typeof nameOrOptions === "object") {
      this.name = nameOrOptions.name || "DefaultCircuitBreaker";
      this.failureThreshold = nameOrOptions.failureThreshold ?? 3;
      this.cooldownPeriodMs = nameOrOptions.cooldownPeriodMs ?? 30000;
      this.successThreshold = nameOrOptions.successThreshold ?? 2;
    } else {
      this.name = nameOrOptions;
      this.failureThreshold = options.failureThreshold ?? 3;
      this.cooldownPeriodMs = options.cooldownPeriodMs ?? 30000;
      this.successThreshold = options.successThreshold ?? 2;
    }
  }

  getState(): CircuitState {
    const now = Date.now();
    if (this.state === "OPEN" && now - this.lastFailureTime > this.cooldownPeriodMs) {
      this.state = "HALF_OPEN";
      this.successCount = 0;
    }
    return this.state;
  }

  async execute<T>(action: () => Promise<T>, fallback?: () => Promise<T>): Promise<T> {
    const currentState = this.getState();

    if (currentState === "OPEN") {
      if (fallback) {
        return fallback();
      }
      throw new Error(`CircuitBreaker [${this.name}] is OPEN. Request rejected to protect upstream service.`);
    }

    try {
      const result = await action();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      if (fallback) {
        return fallback();
      }
      throw error;
    }
  }

  private onSuccess(): void {
    if (this.state === "HALF_OPEN") {
      this.successCount += 1;
      if (this.successCount >= this.successThreshold) {
        this.state = "CLOSED";
        this.failureCount = 0;
        this.successCount = 0;
      }
    } else if (this.state === "CLOSED") {
      this.failureCount = 0;
    }
  }

  private onFailure(): void {
    this.lastFailureTime = Date.now();
    this.failureCount += 1;

    if (this.state === "HALF_OPEN" || this.failureCount >= this.failureThreshold) {
      this.state = "OPEN";
    }
  }

  reset(): void {
    this.state = "CLOSED";
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = 0;
  }

  getMetrics() {
    return {
      name: this.name,
      state: this.getState(),
      failureCount: this.failureCount,
      successCount: this.successCount,
    };
  }
}

export const gsheetCircuitBreaker = new CircuitBreaker("GSheetAPI", {
  failureThreshold: 3,
  cooldownPeriodMs: 20000,
});

export const llmCircuitBreaker = new CircuitBreaker("LLMService", {
  failureThreshold: 3,
  cooldownPeriodMs: 15000,
});
