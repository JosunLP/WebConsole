/**
 * VFS Performance Utilities
 */

export interface VFSMetrics {
  operationCounts: Map<string, number>;
  operationTimes: Map<string, number[]>;
  cacheHits: number;
  cacheMisses: number;
  totalOperations: number;
}

/**
 * Performance Monitor für VFS-Operationen
 */
export class VFSPerformanceMonitor {
  private metrics: VFSMetrics = {
    operationCounts: new Map(),
    operationTimes: new Map(),
    cacheHits: 0,
    cacheMisses: 0,
    totalOperations: 0,
  };

  private enabled = false;

  enable(): void {
    this.enabled = true;
  }

  disable(): void {
    this.enabled = false;
  }

  startOperation(operation: string): () => void {
    if (!this.enabled) {
      return () => {};
    }

    const startTime = performance.now();
    this.metrics.totalOperations++;

    const currentCount = this.metrics.operationCounts.get(operation) || 0;
    this.metrics.operationCounts.set(operation, currentCount + 1);

    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;

      const times = this.metrics.operationTimes.get(operation) || [];
      times.push(duration);
      this.metrics.operationTimes.set(operation, times);
    };
  }

  recordCacheHit(): void {
    if (this.enabled) {
      this.metrics.cacheHits++;
    }
  }

  recordCacheMiss(): void {
    if (this.enabled) {
      this.metrics.cacheMisses++;
    }
  }

  getMetrics(): VFSMetrics {
    return { ...this.metrics };
  }

  getReport(): string {
    const report: string[] = ['VFS Performance Report:', ''];

    // Operation counts
    report.push('Operation Counts:');
    for (const [op, count] of this.metrics.operationCounts) {
      report.push(`  ${op}: ${count}`);
    }
    report.push('');

    // Average times
    report.push('Average Operation Times (ms):');
    for (const [op, times] of this.metrics.operationTimes) {
      const avg = times.reduce((a, b) => a + b, 0) / times.length;
      report.push(`  ${op}: ${avg.toFixed(2)}`);
    }
    report.push('');

    // Cache statistics
    const totalCache = this.metrics.cacheHits + this.metrics.cacheMisses;
    const hitRate =
      totalCache > 0 ? (this.metrics.cacheHits / totalCache) * 100 : 0;

    report.push('Cache Statistics:');
    report.push(`  Hits: ${this.metrics.cacheHits}`);
    report.push(`  Misses: ${this.metrics.cacheMisses}`);
    report.push(`  Hit Rate: ${hitRate.toFixed(1)}%`);
    report.push('');

    report.push(`Total Operations: ${this.metrics.totalOperations}`);

    return report.join('\n');
  }

  reset(): void {
    this.metrics = {
      operationCounts: new Map(),
      operationTimes: new Map(),
      cacheHits: 0,
      cacheMisses: 0,
      totalOperations: 0,
    };
  }
}

/**
 * LRU Cache für VFS-Operationen
 */
export class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private readonly maxSize: number;

  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      // Update existing
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove least recently used (first item)
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, value);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}

// Global performance monitor instance
export const vfsPerformance = new VFSPerformanceMonitor();
