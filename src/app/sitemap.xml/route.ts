import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { sitemapConfig, seoConfig } from '@/lib/seo/config';

interface SitemapUrl {
  url: string;
  changefreq: string;
  priority: number;
  lastmod?: string;
}

export async function GET(request: NextRequest) {
  try {
    const urls: SitemapUrl[] = [];
    
    // Add static pages
    sitemapConfig.staticPages.forEach(page => {
      urls.push({
        url: `${seoConfig.siteUrl}${page.url}`,
        changefreq: page.changefreq,
        priority: page.priority,
        lastmod: new Date().toISOString().split('T')[0]
      });
    });
    
    // Add dynamic creator profile pages
    try {
      const creatorsQuery = query(
        collection(db, 'users'),
        where('role', '==', 'creator'),
        where('profileComplete', '==', true),
        where('status', '==', 'approved')
      );
      
      const creatorsSnapshot = await getDocs(creatorsQuery);
      
      creatorsSnapshot.docs.forEach(doc => {
        const creator = doc.data();
        urls.push({
          url: `${seoConfig.siteUrl}/profile/${doc.id}`,
          changefreq: 'weekly',
          priority: 0.8,
          lastmod: creator.updatedAt ? 
            new Date(creator.updatedAt.toDate()).toISOString().split('T')[0] :
            new Date().toISOString().split('T')[0]
        });
      });
    } catch (error) {
      console.error('Error fetching creators for sitemap:', error);
    }
    
    // Add category pages
    const categories = ['music', 'video', 'design', 'writing', 'development', 'consulting'];
    categories.forEach(category => {
      urls.push({
        url: `${seoConfig.siteUrl}/search?category=${category}`,
        changefreq: 'weekly',
        priority: 0.7,
        lastmod: new Date().toISOString().split('T')[0]
      });
    });
    
    // Generate XML sitemap
    const sitemap = generateSitemapXML(urls);
    
    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200' // 24 hours
      }
    });
    
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}

function generateSitemapXML(urls: SitemapUrl[]): string {
  const urlElements = urls.map(url => `
  <url>
    <loc>${url.url}</loc>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
  </url>`).join('');
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urlElements}
</urlset>`;
}

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic';