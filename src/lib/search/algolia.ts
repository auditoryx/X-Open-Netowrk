import algoliasearch from 'algoliasearch';

if (!process.env.ALGOLIA_APP_ID || !process.env.ALGOLIA_API_KEY || !process.env.ALGOLIA_INDEX_NAME) {
  throw new Error('Missing Algolia environment variables');
}

export const algoliaClient = algoliasearch(
  process.env.ALGOLIA_APP_ID,
  process.env.ALGOLIA_API_KEY
);

export const algoliaIndex = algoliaClient.initIndex(process.env.ALGOLIA_INDEX_NAME);
