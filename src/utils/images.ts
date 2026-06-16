const cache = new Map();

export async function getImageFromCache(url: string): Promise<string> {
  if (cache.has(url)) {
    return cache.get(url);
  }

  try {
    const response = await fetch(url);
    const blob = await response.blob();

    const localBlobUrl = URL.createObjectURL(blob);

    cache.set(url, localBlobUrl);
    return localBlobUrl;
  } catch (error) {
    return url;
  }
}
