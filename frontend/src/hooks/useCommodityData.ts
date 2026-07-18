import { useState, useEffect } from 'react';
import { getCommodities, getTrashCatalog } from '../services/catalog.service';
import type { Commodity } from '../types';

export function useCommodityData(
  isTrashView: boolean,
  filters?: {
    search?: string;
    status?: string;
    approvalStatus?: string;
    groupId?: string;
    typeId?: string;
    countryIds?: number[];
    standardIds?: number[];
    page?: number;
    limit?: number;
  }
) {
  const [dbProducts, setDbProducts] = useState<Commodity[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCommodities = async () => {
    setIsLoading(true);
    const apiParams: any = {};
    if (filters?.search) apiParams.search = filters.search;
    if (filters?.status && filters.status !== 'ALL') apiParams.status = filters.status;
    if (filters?.approvalStatus && filters.approvalStatus !== 'ALL') apiParams.approvalStatus = filters.approvalStatus;
    if (filters?.groupId && filters.groupId !== 'ALL') apiParams.groupId = filters.groupId;
    if (filters?.typeId && filters.typeId !== 'ALL') apiParams.typeId = filters.typeId;
    if (filters?.countryIds && filters.countryIds.length > 0) {
      apiParams.countryIds = filters.countryIds.join(',');
    }
    if (filters?.standardIds && filters.standardIds.length > 0) {
      apiParams.standardIds = filters.standardIds.join(',');
    }
    if (filters?.page) apiParams.page = filters.page;
    if (filters?.limit) apiParams.limit = filters.limit;

    try {
      const res = isTrashView
        ? await getTrashCatalog('commodities', apiParams)
        : await getCommodities(apiParams);
      if (res.success) {
        const data = res.data as any;
        if (Array.isArray(data)) {
          setDbProducts(data);
          setTotalItems(data.length);
        } else {
          setDbProducts(data.items || []);
          setTotalItems(data.total || 0);
        }
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
  }, [
    isTrashView,
    filters?.search,
    filters?.status,
    filters?.approvalStatus,
    filters?.groupId,
    filters?.typeId,
    filters?.countryIds?.join(','),
    filters?.standardIds?.join(','),
    filters?.page,
    filters?.limit
  ]);

  return { dbProducts, totalItems, fetchCommodities, isLoading };
}
