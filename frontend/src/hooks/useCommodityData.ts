import { useState, useEffect } from 'react';
import { getCommodities, getTrashCatalog } from '../services/catalog.service';
import type { Commodity } from '../types';

export function useCommodityData(isTrashView: boolean) {
  const [dbProducts, setDbProducts] = useState<Commodity[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCommodities = async () => {
    setIsLoading(true);
    try {
      const res = isTrashView
        ? await getTrashCatalog('commodities')
        : await getCommodities();
      if (res.success) {
        setDbProducts(res.data);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách mặt hàng:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCommodities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTrashView]);

  return { dbProducts, fetchCommodities, isLoading };
}
