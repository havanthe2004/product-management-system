import { useState, useEffect } from 'react';
import { getCommodityGroups, getTrashCatalog } from '../services/catalog.service';

export function useGroupData(
  isTrashView: boolean,
  filters?: { search?: string; status?: string; approvalStatus?: string }
) {
  const [groups, setGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchGroups = async () => {
    setIsLoading(true);
    const apiParams: any = {};
    if (filters?.search) apiParams.search = filters.search;
    if (filters?.status && filters.status !== 'ALL') apiParams.status = filters.status;
    if (filters?.approvalStatus && filters.approvalStatus !== 'ALL') apiParams.approvalStatus = filters.approvalStatus;

    try {
      const res = isTrashView
        ? await getTrashCatalog('commodity-groups', apiParams)
        : await getCommodityGroups(apiParams);
      if (res.success) setGroups(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTrashView, filters?.search, filters?.status, filters?.approvalStatus]);

  return { groups, fetchGroups, isLoading };
}
