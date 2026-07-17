import { useState, useEffect } from 'react';
import { getCommodityTypes, getCommodityGroups, getTrashCatalog } from '../services/catalog.service';

export function useTypeData(
  isTrashView: boolean,
  filters?: { search?: string; status?: string; approvalStatus?: string; groupId?: string }
) {
  const [types, setTypes] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTypesAndGroups = async () => {
    setIsLoading(true);
    const apiParams: any = {};
    if (filters?.search) apiParams.search = filters.search;
    if (filters?.status && filters.status !== 'ALL') apiParams.status = filters.status;
    if (filters?.approvalStatus && filters.approvalStatus !== 'ALL') apiParams.approvalStatus = filters.approvalStatus;
    if (filters?.groupId && filters.groupId !== 'ALL') apiParams.groupId = filters.groupId;

    try {
      const [resTypes, resGroups] = await Promise.all([
        isTrashView ? getTrashCatalog('commodity-types', apiParams) : getCommodityTypes(apiParams),
        getCommodityGroups()
      ]);
      if (resTypes.success) setTypes(resTypes.data);
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
  }, [isTrashView, filters?.search, filters?.status, filters?.approvalStatus, filters?.groupId]);

  return { types, groups, fetchTypesAndGroups, isLoading };
}
