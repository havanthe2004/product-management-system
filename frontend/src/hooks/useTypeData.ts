import { useState, useEffect } from 'react';
import { getCommodityTypes, getCommodityGroups, getTrashCatalog } from '../services/catalog.service';

export function useTypeData(isTrashView: boolean) {
  const [types, setTypes] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTypesAndGroups = async () => {
    setIsLoading(true);
    try {
      const [resTypes, resGroups] = await Promise.all([
        isTrashView ? getTrashCatalog('commodity-types') : getCommodityTypes(),
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
  }, [isTrashView]);

  return { types, groups, fetchTypesAndGroups, isLoading };
}
