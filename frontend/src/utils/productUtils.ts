const hostUrl = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL.replace('/api', '')
  : 'http://localhost:5000';

export const getProductImageUrl = (url: string | undefined | null) => {
  if (!url) return '/image.png';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  return `${hostUrl}${url}`;
};

export const truncateText = (text: string, maxLength: number = 30) => {
  if (!text) return '-';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
