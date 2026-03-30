import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/'],
    },
    // Replace with your actual domain when deploying
    sitemap: 'https://ainews-app.vercel.app/sitemap.xml',
  };
}
