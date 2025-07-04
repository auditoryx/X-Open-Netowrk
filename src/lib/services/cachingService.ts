/**
 * Advanced Caching Service for AuditoryX Platform
 * Implements multi-level caching with Redis, browser cache, and memory cache
 */

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Cache tags for invalidation
  compression?: boolean; // Enable compression for large data
  priority?: 'low' | 'normal' | 'high'; // Cache priority
  fallback?: () => Promise<any>; // Fallback function if cache miss
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  tags: string[];
  compressed: boolean;
  accessCount: number;
  lastAccess: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  totalEntries: number;
  memoryUsage: number;
  lastCleanup: Date;
}

export class CachingService {
  private memoryCache = new Map<string, CacheEntry<any>>();
  private compressionThreshold = 1024; // 1KB
  private maxMemoryEntries = 1000;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    hitRate: 0,
    totalEntries: 0,
    memoryUsage: 0,
    lastCleanup: new Date()
  };

  constructor() {
    this.startCleanupInterval();
    this.setupBrowserCacheAPI();
  }

  /**
   * Get data from cache
   */
  async get<T>(key: string, options?: CacheOptions): Promise<T | null> {
    const cacheKey = this.generateCacheKey(key);

    try {
      // Try memory cache first
      const memoryResult = this.getFromMemory<T>(cacheKey);
      if (memoryResult !== null) {
        this.stats.hits++;
        this.updateHitRate();
        return memoryResult;
      }

      // Try browser cache
      const browserResult = await this.getFromBrowserCache<T>(cacheKey);
      if (browserResult !== null) {
        // Store in memory for faster access
        this.setInMemory(cacheKey, browserResult, options);
        this.stats.hits++;
        this.updateHitRate();
        return browserResult;
      }

      // Try Redis cache (if available)
      const redisResult = await this.getFromRedis<T>(cacheKey);
      if (redisResult !== null) {
        // Store in memory and browser cache
        this.setInMemory(cacheKey, redisResult, options);
        await this.setInBrowserCache(cacheKey, redisResult, options);
        this.stats.hits++;
        this.updateHitRate();
        return redisResult;
      }

      // Cache miss - try fallback
      if (options?.fallback) {
        const fallbackResult = await options.fallback();
        if (fallbackResult !== null) {
          await this.set(cacheKey, fallbackResult, options);
          return fallbackResult;
        }
      }

      this.stats.misses++;
      this.updateHitRate();
      return null;

    } catch (error) {
      console.error('Cache get error:', error);
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }
  }

  /**
   * Set data in cache
   */
  async set<T>(key: string, data: T, options: CacheOptions = {}): Promise<void> {
    const cacheKey = this.generateCacheKey(key);
    const ttl = options.ttl || 300; // Default 5 minutes

    try {
      // Set in memory cache
      this.setInMemory(cacheKey, data, { ...options, ttl });

      // Set in browser cache
      await this.setInBrowserCache(cacheKey, data, { ...options, ttl });

      // Set in Redis cache (if available)
      await this.setInRedis(cacheKey, data, { ...options, ttl });

    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  /**
   * Delete from cache
   */
  async delete(key: string): Promise<void> {
    const cacheKey = this.generateCacheKey(key);

    try {
      // Delete from memory
      this.memoryCache.delete(cacheKey);

      // Delete from browser cache
      await this.deleteFromBrowserCache(cacheKey);

      // Delete from Redis
      await this.deleteFromRedis(cacheKey);

      this.updateStats();
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  /**
   * Invalidate cache by tags
   */
  async invalidateByTags(tags: string[]): Promise<void> {
    try {
      // Invalidate memory cache
      for (const [key, entry] of this.memoryCache.entries()) {
        if (entry.tags.some(tag => tags.includes(tag))) {
          this.memoryCache.delete(key);
        }
      }

      // Invalidate browser cache
      await this.invalidateBrowserCacheByTags(tags);

      // Invalidate Redis cache
      await this.invalidateRedisByTags(tags);

      this.updateStats();
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    try {
      // Clear memory cache
      this.memoryCache.clear();

      // Clear browser cache
      await this.clearBrowserCache();

      // Clear Redis cache
      await this.clearRedis();

      this.resetStats();
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Memory cache operations
   */
  private getFromMemory<T>(key: string): T | null {
    const entry = this.memoryCache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl * 1000) {
      this.memoryCache.delete(key);
      return null;
    }

    // Update access stats
    entry.accessCount++;
    entry.lastAccess = Date.now();

    // Decompress if needed
    if (entry.compressed) {
      return this.decompress(entry.data);
    }

    return entry.data;
  }

  private setInMemory<T>(key: string, data: T, options: CacheOptions = {}): void {
    const ttl = options.ttl || 300;
    const tags = options.tags || [];
    
    // Compress large data
    let finalData = data;
    let compressed = false;
    
    if (options.compression !== false) {
      const dataSize = this.getDataSize(data);
      if (dataSize > this.compressionThreshold) {
        finalData = this.compress(data);
        compressed = true;
      }
    }

    const entry: CacheEntry<T> = {
      data: finalData,
      timestamp: Date.now(),
      ttl,
      tags,
      compressed,
      accessCount: 0,
      lastAccess: Date.now()
    };

    // Check memory limits
    if (this.memoryCache.size >= this.maxMemoryEntries) {
      this.evictLeastRecentlyUsed();
    }

    this.memoryCache.set(key, entry);
    this.updateStats();
  }

  /**
   * Browser cache operations using Cache API
   */
  private async getFromBrowserCache<T>(key: string): Promise<T | null> {
    if (!('caches' in window)) {
      return null;
    }

    try {
      const cache = await caches.open('auditoryx-data-cache');
      const response = await cache.match(key);
      
      if (response) {
        const data = await response.json();
        
        // Check if expired
        if (Date.now() - data.timestamp > data.ttl * 1000) {
          await cache.delete(key);
          return null;
        }

        return data.value;
      }

      return null;
    } catch (error) {
      console.error('Browser cache get error:', error);
      return null;
    }
  }

  private async setInBrowserCache<T>(key: string, data: T, options: CacheOptions = {}): Promise<void> {
    if (!('caches' in window)) {
      return;
    }

    try {
      const cache = await caches.open('auditoryx-data-cache');
      const ttl = options.ttl || 300;
      
      const cacheData = {
        value: data,
        timestamp: Date.now(),
        ttl,
        tags: options.tags || []
      };

      const response = new Response(JSON.stringify(cacheData), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': `max-age=${ttl}`
        }
      });

      await cache.put(key, response);
    } catch (error) {
      console.error('Browser cache set error:', error);
    }
  }

  private async deleteFromBrowserCache(key: string): Promise<void> {
    if (!('caches' in window)) {
      return;
    }

    try {
      const cache = await caches.open('auditoryx-data-cache');
      await cache.delete(key);
    } catch (error) {
      console.error('Browser cache delete error:', error);
    }
  }

  private async invalidateBrowserCacheByTags(tags: string[]): Promise<void> {
    if (!('caches' in window)) {
      return;
    }

    try {
      const cache = await caches.open('auditoryx-data-cache');
      const keys = await cache.keys();

      for (const request of keys) {
        const response = await cache.match(request);
        if (response) {
          const data = await response.json();
          if (data.tags && data.tags.some((tag: string) => tags.includes(tag))) {
            await cache.delete(request);
          }
        }
      }
    } catch (error) {
      console.error('Browser cache tag invalidation error:', error);
    }
  }

  private async clearBrowserCache(): Promise<void> {
    if (!('caches' in window)) {
      return;
    }

    try {
      await caches.delete('auditoryx-data-cache');
    } catch (error) {
      console.error('Browser cache clear error:', error);
    }
  }

  /**
   * Redis cache operations (simulated - would integrate with actual Redis)
   */
  private async getFromRedis<T>(key: string): Promise<T | null> {
    try {
      const response = await fetch('/api/cache/get', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key })
      });

      if (response.ok) {
        const result = await response.json();
        return result.data || null;
      }

      return null;
    } catch (error) {
      console.error('Redis cache get error:', error);
      return null;
    }
  }

  private async setInRedis<T>(key: string, data: T, options: CacheOptions = {}): Promise<void> {
    try {
      await fetch('/api/cache/set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key,
          data,
          ttl: options.ttl || 300,
          tags: options.tags || []
        })
      });
    } catch (error) {
      console.error('Redis cache set error:', error);
    }
  }

  private async deleteFromRedis(key: string): Promise<void> {
    try {
      await fetch('/api/cache/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key })
      });
    } catch (error) {
      console.error('Redis cache delete error:', error);
    }
  }

  private async invalidateRedisByTags(tags: string[]): Promise<void> {
    try {
      await fetch('/api/cache/invalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags })
      });
    } catch (error) {
      console.error('Redis cache invalidation error:', error);
    }
  }

  private async clearRedis(): Promise<void> {
    try {
      await fetch('/api/cache/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
    } catch (error) {
      console.error('Redis cache clear error:', error);
    }
  }

  /**
   * Utility methods
   */
  private generateCacheKey(key: string): string {
    return `auditoryx:cache:${key}`;
  }

  private getDataSize(data: any): number {
    return new Blob([JSON.stringify(data)]).size;
  }

  private compress(data: any): string {
    // Simple compression simulation - in production, use proper compression
    return btoa(JSON.stringify(data));
  }

  private decompress(compressedData: string): any {
    return JSON.parse(atob(compressedData));
  }

  private evictLeastRecentlyUsed(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.lastAccess < oldestTime) {
        oldestTime = entry.lastAccess;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.memoryCache.delete(oldestKey);
    }
  }

  private updateStats(): void {
    this.stats.totalEntries = this.memoryCache.size;
    this.stats.memoryUsage = this.calculateMemoryUsage();
  }

  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
  }

  private resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      hitRate: 0,
      totalEntries: 0,
      memoryUsage: 0,
      lastCleanup: new Date()
    };
  }

  private calculateMemoryUsage(): number {
    let usage = 0;
    for (const entry of this.memoryCache.values()) {
      usage += this.getDataSize(entry);
    }
    return usage;
  }

  private startCleanupInterval(): void {
    setInterval(() => {
      this.cleanup();
    }, 60000); // Cleanup every minute
  }

  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.memoryCache.entries()) {
      if (now - entry.timestamp > entry.ttl * 1000) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.memoryCache.delete(key));
    
    this.stats.lastCleanup = new Date();
    this.updateStats();
  }

  private setupBrowserCacheAPI(): void {
    // Setup cache warming for critical data
    if ('caches' in window) {
      this.warmupCriticalData();
    }
  }

  private async warmupCriticalData(): Promise<void> {
    const criticalEndpoints = [
      '/api/creators/featured',
      '/api/genres/popular',
      '/api/user/preferences'
    ];

    for (const endpoint of criticalEndpoints) {
      try {
        const response = await fetch(endpoint);
        if (response.ok) {
          const data = await response.json();
          await this.set(endpoint, data, { ttl: 600, tags: ['critical'] });
        }
      } catch (error) {
        console.warn('Failed to warmup cache for:', endpoint);
      }
    }
  }

  /**
   * Cache decorators for common patterns
   */
  cached<T>(key: string, options?: CacheOptions) {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
      const originalMethod = descriptor.value;

      descriptor.value = async function (...args: any[]) {
        const cacheKey = `${key}:${JSON.stringify(args)}`;
        
        const cached = await this.get<T>(cacheKey, options);
        if (cached !== null) {
          return cached;
        }

        const result = await originalMethod.apply(this, args);
        await this.set(cacheKey, result, options);
        
        return result;
      };

      return descriptor;
    };
  }
}

// Singleton instance
export const cachingService = new CachingService();

// Export for manual initialization
export default CachingService;
