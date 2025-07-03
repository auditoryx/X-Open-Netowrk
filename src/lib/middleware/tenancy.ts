import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getToken } from 'next-auth/jwt';

export interface TenantContext {
  organizationId: string;
  organization: {
    id: string;
    name: string;
    slug: string;
    type: string;
    plan: string;
    customDomain?: string;
    branding?: any;
    settings?: any;
  };
  user: {
    id: string;
    role: string;
    permissions?: any;
  };
}

/**
 * Multi-tenant middleware for handling organization context
 */
export class TenancyMiddleware {
  private static instance: TenancyMiddleware;
  private prisma: PrismaClient;
  private tenantCache = new Map<string, any>();

  constructor() {
    this.prisma = new PrismaClient();
  }

  static getInstance(): TenancyMiddleware {
    if (!TenancyMiddleware.instance) {
      TenancyMiddleware.instance = new TenancyMiddleware();
    }
    return TenancyMiddleware.instance;
  }

  /**
   * Resolve tenant context from request
   */
  async resolveTenantContext(req: NextRequest): Promise<TenantContext | null> {
    try {
      // Try different methods to determine tenant
      const tenant = await this.getTenantFromDomain(req) ||
                    await this.getTenantFromSubdomain(req) ||
                    await this.getTenantFromUser(req) ||
                    await this.getTenantFromHeader(req);

      if (!tenant) {
        return null;
      }

      // Get user context
      const user = await this.getUserContext(req, tenant.id);
      if (!user) {
        return null;
      }

      return {
        organizationId: tenant.id,
        organization: tenant,
        user,
      };
    } catch (error) {
      console.error('Error resolving tenant context:', error);
      return null;
    }
  }

  /**
   * Get tenant from custom domain
   */
  private async getTenantFromDomain(req: NextRequest): Promise<any> {
    const host = req.headers.get('host');
    if (!host) return null;

    // Skip if it's the main domain
    if (host.includes('localhost') || host.includes('auditoryX.com')) {
      return null;
    }

    const cacheKey = `domain:${host}`;
    if (this.tenantCache.has(cacheKey)) {
      return this.tenantCache.get(cacheKey);
    }

    const organization = await this.prisma.organization.findFirst({
      where: { customDomain: host },
    });

    if (organization) {
      this.tenantCache.set(cacheKey, organization);
    }

    return organization;
  }

  /**
   * Get tenant from subdomain
   */
  private async getTenantFromSubdomain(req: NextRequest): Promise<any> {
    const host = req.headers.get('host');
    if (!host) return null;

    // Extract subdomain
    const parts = host.split('.');
    if (parts.length < 3) return null;

    const subdomain = parts[0];
    if (subdomain === 'www' || subdomain === 'api') return null;

    const cacheKey = `subdomain:${subdomain}`;
    if (this.tenantCache.has(cacheKey)) {
      return this.tenantCache.get(cacheKey);
    }

    const organization = await this.prisma.organization.findUnique({
      where: { slug: subdomain },
    });

    if (organization) {
      this.tenantCache.set(cacheKey, organization);
    }

    return organization;
  }

  /**
   * Get tenant from authenticated user
   */
  private async getTenantFromUser(req: NextRequest): Promise<any> {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.email) return null;

    const user = await this.prisma.user.findUnique({
      where: { email: token.email },
      include: { organization: true },
    });

    return user?.organization || null;
  }

  /**
   * Get tenant from request header
   */
  private async getTenantFromHeader(req: NextRequest): Promise<any> {
    const orgId = req.headers.get('x-organization-id');
    if (!orgId) return null;

    const cacheKey = `org:${orgId}`;
    if (this.tenantCache.has(cacheKey)) {
      return this.tenantCache.get(cacheKey);
    }

    const organization = await this.prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (organization) {
      this.tenantCache.set(cacheKey, organization);
    }

    return organization;
  }

  /**
   * Get user context for the tenant
   */
  private async getUserContext(req: NextRequest, organizationId: string): Promise<any> {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.email) return null;

    const user = await this.prisma.user.findFirst({
      where: {
        email: token.email,
        organizationId,
        isActive: true,
      },
    });

    return user;
  }

  /**
   * Middleware function for Next.js
   */
  async middleware(req: NextRequest): Promise<NextResponse> {
    // Skip middleware for certain paths
    if (this.shouldSkipMiddleware(req)) {
      return NextResponse.next();
    }

    const tenantContext = await this.resolveTenantContext(req);

    if (!tenantContext && this.requiresTenant(req)) {
      // Redirect to tenant selection or unauthorized
      return NextResponse.redirect(new URL('/select-organization', req.url));
    }

    // Add tenant context to headers for downstream use
    const response = NextResponse.next();
    if (tenantContext) {
      response.headers.set('x-tenant-context', JSON.stringify(tenantContext));
    }

    return response;
  }

  /**
   * Check if middleware should be skipped for this path
   */
  private shouldSkipMiddleware(req: NextRequest): boolean {
    const skipPaths = [
      '/api/auth',
      '/auth',
      '/login',
      '/register',
      '/public',
      '/_next',
      '/favicon.ico',
      '/robots.txt',
      '/sitemap.xml',
    ];

    return skipPaths.some(path => req.nextUrl.pathname.startsWith(path));
  }

  /**
   * Check if this path requires tenant context
   */
  private requiresTenant(req: NextRequest): boolean {
    const tenantRequiredPaths = [
      '/dashboard',
      '/api/enterprise',
      '/projects',
      '/bookings',
      '/artists',
    ];

    return tenantRequiredPaths.some(path => req.nextUrl.pathname.startsWith(path));
  }

  /**
   * Clear tenant cache (useful for cache invalidation)
   */
  clearCache(key?: string): void {
    if (key) {
      this.tenantCache.delete(key);
    } else {
      this.tenantCache.clear();
    }
  }
}

/**
 * Hook for accessing tenant context in React components
 */
export function useTenantContext(): TenantContext | null {
  // This would be implemented with React Context or similar
  // For now, return null as placeholder
  return null;
}

/**
 * Utility function to get tenant context from headers
 */
export function getTenantContextFromHeaders(headers: Headers): TenantContext | null {
  const contextHeader = headers.get('x-tenant-context');
  if (!contextHeader) return null;

  try {
    return JSON.parse(contextHeader);
  } catch {
    return null;
  }
}

/**
 * Database client with tenant context
 */
export class TenantAwarePrismaClient extends PrismaClient {
  private tenantId?: string;

  constructor(tenantId?: string) {
    super();
    this.tenantId = tenantId;

    // Add middleware to automatically filter by tenant
    this.$use(async (params, next) => {
      // Models that should be filtered by organizationId
      const tenantModels = [
        'User', 'Artist', 'Booking', 'Project', 'Analytics', 
        'Subscription', 'Contract', 'Invoice', 'ArtistAnalytics'
      ];

      if (this.tenantId && tenantModels.includes(params.model || '')) {
        if (params.action === 'create') {
          // Automatically add organizationId to create operations
          if (params.args.data && !params.args.data.organizationId) {
            params.args.data.organizationId = this.tenantId;
          }
        } else if (['findMany', 'findFirst', 'findUnique', 'update', 'delete', 'updateMany', 'deleteMany'].includes(params.action)) {
          // Automatically filter by organizationId for read/update/delete operations
          if (!params.args.where) {
            params.args.where = {};
          }
          if (!params.args.where.organizationId) {
            params.args.where.organizationId = this.tenantId;
          }
        }
      }

      return next(params);
    });
  }

  setTenantId(tenantId: string): void {
    this.tenantId = tenantId;
  }
}

export default TenancyMiddleware.getInstance();
