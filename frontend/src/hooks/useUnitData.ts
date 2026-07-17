import { useState, useEffect } from 'react';
import { getUnits, getTrashCatalog } from '../services/catalog.service';

export function useUnitData(
  isTrashView: boolean,
  filters?: { search?: string; status?: string; approvalStatus?: string }
) {
  const [units, setUnits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUnits = async () => {
    setIsLoading(true);
    const apiParams: any = {};
    if (filters?.search) apiParams.search = filters.search;
    if (filters?.status && filters.status !== 'ALL') apiParams.status = filters.status;
    if (filters?.approvalStatus && filters.approvalStatus !== 'ALL') apiParams.approvalStatus = filters.approvalStatus;

    try {
      const res = isTrashView
        ? await getTrashCatalog('units', apiParams)
        : await getUnits(apiParams);
      if (res.success) setUnits(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTrashView, filters?.search, filters?.status, filters?.approvalStatus]);

  return { dbUnits: units, fetchUnits, isLoading };
}
