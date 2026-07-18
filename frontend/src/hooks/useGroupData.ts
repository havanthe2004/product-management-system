import { useState, useEffect } from 'react';
import { getCommodityGroups, getTrashCatalog } from '../services/catalog.service';

export function useGroupData(
  isTrashView: boolean,
  filters?: { search?: string; status?: string; approvalStatus?: string; page?: number; limit?: number }
) {
  const [groups, setGroups] = useState<any[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchGroups = async () => {
    setIsLoading(true);
    const apiParams: any = {};
    if (filters?.search) apiParams.search = filters.search;
    if (filters?.status && filters.status !== 'ALL') apiParams.status = filters.status;
    if (filters?.approvalStatus && filters.approvalStatus !== 'ALL') apiParams.approvalStatus = filters.approvalStatus;
    if (filters?.page) apiParams.page = filters.page;
    if (filters?.limit) apiParams.limit = filters.limit;

    console.log(">>> Frontend useGroupData: fetching with apiParams =", apiParams);

    try {
      const res = isTrashView
        ? await getTrashCatalog('commodity-groups', apiParams)
        : await getCommodityGroups(apiParams);
      if (res.success) {
        const data = res.data as any;
        if (Array.isArray(data)) {
          setGroups(data);
          setTotalItems(data.length);
        } else {
          setGroups(data.items || []);
          setTotalItems(data.total ?? data.items?.length ?? 0);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTrashView, filters?.search, filters?.status, filters?.approvalStatus, filters?.page, filters?.limit]);

  return { groups, totalItems, fetchGroups, isLoading };
}
