/* eslint-disable no-underscore-dangle */
import { PAGINATION_QUERY } from '../components/Pagination';

export default function paginationField() {
  return {
    keyArgs: false, // tells apollo we will take care of everything
    // First thing Apollo does - it asks the read function for requested (cached) items.
    // We can either do one of two things:
    // First things we can do is return the items because they are already in the cache
    // The other thing we can do is to return false from here, (network request)
    read(existing = [], { args, cache }) {
      // console.log({ existing, args, cache });
      const { skip, first } = args;
      // Read the number of items on the page from the cache
      const data = cache.readQuery({ query: PAGINATION_QUERY });
      const count = data?._allProductsMeta?.count;
      const page = skip / first + 1;
      const pages = Math.ceil(count / first);

      // Check if we have existing items
      const items = existing.slice(skip, skip + first).filter((x) => x);

      // If there are items
      // AND there aren't enough items to satisfy how many were requested
      // AND we are on the last page, THEN JUST SEND IT
      if (items.length && items.length !== first && page === pages) return items;

      // We don't have any items, we must go to the network to fetch them.
      // returning false triggers the network query refetch.
      if (items.length !== first) return false;

      // If there are items, just return them from the cache, and we don't need to go to the network
      if (items.length) return items;

      return false; // fallback to network
    },
    merge(existing, incoming, { args }) {
      // eslint-disable-next-line no-unused-vars
      const { skip, first } = args;
      // This runs when the Apollo client comes back from the network with our product
      // console.log(`Merging items from the network ${incoming.length}`);
      const merged = existing ? existing.slice(0) : [];

      for (let i = skip; i < skip + incoming.length; i + 1) {
        merged[i] = incoming[i - skip];
      }
      // console.log(merged);
      // Finally we return the merged items from the cache,
      return merged;
    },
  };
}
