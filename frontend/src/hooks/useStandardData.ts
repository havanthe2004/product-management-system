import { useState, useEffect } from 'react';
import { getQualityStandards, getTrashCatalog } from '../services/catalog.service';

export function useStandardData(
  isTrashView: boolean,
  filters?: { search?: string; status?: string; approvalStatus?: string }
) {
  const [standards, setStandards] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStandards = async () => {
    setIsLoading(true);
    const apiParams: any = {};
    if (filters?.search) apiParams.search = filters.search;
    if (filters?.status && filters.status !== 'ALL') apiParams.status = filters.status;
    if (filters?.approvalStatus && filters.approvalStatus !== 'ALL') apiParams.approvalStatus = filters.approvalStatus;

    try {
      const res = isTrashView
        ? await getTrashCatalog('quality-standards', apiParams)
        : await getQualityStandards(apiParams);
      if (res.success) setStandards(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStandards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTrashView, filters?.search, filters?.status, filters?.approvalStatus]);

  return { standards, fetchStandards, isLoading };
}
