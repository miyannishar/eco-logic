export default function sitemap() {
  const baseUrl = 'https://naksha.app';

  // Add all your static routes
  const routes = [
    '',
    '/map',
    '/camera',
    '/history',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
  }));

  return routes;
} 