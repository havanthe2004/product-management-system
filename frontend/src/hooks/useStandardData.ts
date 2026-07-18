import { useState, useEffect } from 'react';
import { getQualityStandards, getTrashCatalog } from '../services/catalog.service';

export function useStandardData(
  isTrashView: boolean,
  filters?: { search?: string; status?: string; approvalStatus?: string; page?: number; limit?: number }
) {
  const [standards, setStandards] = useState<any[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStandards = async () => {
    setIsLoading(true);
    const apiParams: any = {};
    if (filters?.search) apiParams.search = filters.search;
    if (filters?.status && filters.status !== 'ALL') apiParams.status = filters.status;
    if (filters?.approvalStatus && filters.approvalStatus !== 'ALL') apiParams.approvalStatus = filters.approvalStatus;
    if (filters?.page) apiParams.page = filters.page;
    if (filters?.limit) apiParams.limit = filters.limit;

    try {
      const res = isTrashView
        ? await getTrashCatalog('quality-standards', apiParams)
        : await getQualityStandards(apiParams);
      if (res.success) {
        const data = res.data as any;
        if (Array.isArray(data)) {
          setStandards(data);
          setTotalItems(data.length);
        } else {
          setStandards(data.items || []);
          setTotalItems(data.total || 0);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStandards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTrashView, filters?.search, filters?.status, filters?.approvalStatus, filters?.page, filters?.limit]);

  return { standards, totalItems, fetchStandards, isLoading };
}
