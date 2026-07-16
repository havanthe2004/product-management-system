import { useState, useEffect } from 'react';
import { getCommodityGroups, getTrashCatalog } from '../services/catalog.service';

export function useGroupData(isTrashView: boolean) {
  const [groups, setGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchGroups = async () => {
    setIsLoading(true);
    try {
      const res = isTrashView
        ? await getTrashCatalog('commodity-groups')
        : await getCommodityGroups();
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
  }, [isTrashView]);

  return { groups, fetchGroups, isLoading };
}
