import { useState, useEffect } from 'react';
import { getCountries, getTrashCatalog } from '../services/catalog.service';

export function useCountryData(
  isTrashView: boolean,
  filters?: { search?: string; status?: string; approvalStatus?: string }
) {
  const [countries, setCountries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCountries = async () => {
    setIsLoading(true);
    const apiParams: any = {};
    if (filters?.search) apiParams.search = filters.search;
    if (filters?.status && filters.status !== 'ALL') apiParams.status = filters.status;
    if (filters?.approvalStatus && filters.approvalStatus !== 'ALL') apiParams.approvalStatus = filters.approvalStatus;

    try {
      const res = isTrashView
        ? await getTrashCatalog('countries', apiParams)
        : await getCountries(apiParams);
      if (res.success) setCountries(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCountries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTrashView, filters?.search, filters?.status, filters?.approvalStatus]);

  return { countries, fetchCountries, isLoading };
}
