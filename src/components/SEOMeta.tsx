import Head from 'next/head';

interface SEOMetaProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  siteName?: string;
  twitterHandle?: string;
  children?: React.ReactNode;
}

const defaultMeta = {
  title: 'AuditoryX - Creator Collaboration Platform',
  description: 'Connect with audio creators, engineers, and music professionals. Book talent, manage collaborations, and grow your creative network.',
  image: '/images/og-image.jpg',
  url: 'https://auditoryx.com',
  type: 'website' as const,
  siteName: 'AuditoryX',
  twitterHandle: '@auditoryx'
};

export default function SEOMeta({
  title = defaultMeta.title,
  description = defaultMeta.description,
  image = defaultMeta.image,
  url = defaultMeta.url,
  type = defaultMeta.type,
  siteName = defaultMeta.siteName,
  twitterHandle = defaultMeta.twitterHandle,
  children
}: SEOMetaProps) {
  const fullTitle = title === defaultMeta.title ? title : `${title} | ${defaultMeta.siteName}`;
  const fullImageUrl = image.startsWith('http') ? image : `${url}${image}`;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:creator" content={twitterHandle} />

      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content="AuditoryX" />
      <meta name="keywords" content="audio, music, creators, collaboration, booking, platform, engineers, producers" />

      {/* Favicons */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/manifest.json" />

      {/* Additional children */}
      {children}
    </Head>
  );
}
