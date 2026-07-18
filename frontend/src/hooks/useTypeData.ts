import { useState, useEffect } from 'react';
import { getCommodityTypes, getCommodityGroups, getTrashCatalog } from '../services/catalog.service';

export function useTypeData(
  isTrashView: boolean,
  filters?: { search?: string; status?: string; approvalStatus?: string; groupId?: string; page?: number; limit?: number }
) {
  const [types, setTypes] = useState<any[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [groups, setGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTypesAndGroups = async () => {
    setIsLoading(true);
    const apiParams: any = {};
    if (filters?.search) apiParams.search = filters.search;
    if (filters?.status && filters.status !== 'ALL') apiParams.status = filters.status;
    if (filters?.approvalStatus && filters.approvalStatus !== 'ALL') apiParams.approvalStatus = filters.approvalStatus;
    if (filters?.groupId && filters.groupId !== 'ALL') apiParams.groupId = filters.groupId;
    if (filters?.page) apiParams.page = filters.page;
    if (filters?.limit) apiParams.limit = filters.limit;

    try {
      const [resTypes, resGroups] = await Promise.all([
        isTrashView ? getTrashCatalog('commodity-types', apiParams) : getCommodityTypes(apiParams),
        getCommodityGroups()
      ]);
      if (resTypes.success) {
        const data = resTypes.data as any;
        if (Array.isArray(data)) {
          setTypes(data);
          setTotalItems(data.length);
        } else {
          setTypes(data.items || []);
          setTotalItems(data.total || 0);
        }
      }
      if (resGroups.success) setGroups(resGroups.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTypesAndGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTrashView, filters?.search, filters?.status, filters?.approvalStatus, filters?.groupId, filters?.page, filters?.limit]);

  return { types, totalItems, groups, fetchTypesAndGroups, isLoading };
}
