import { useState, useEffect } from 'react';
import { getCountries, getTrashCatalog } from '../services/catalog.service';

export function useCountryData(
  isTrashView: boolean,
  filters?: { search?: string; status?: string; approvalStatus?: string; page?: number; limit?: number }
) {
  const [countries, setCountries] = useState<any[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCountries = async () => {
    setIsLoading(true);
    const apiParams: any = {};
    if (filters?.search) apiParams.search = filters.search;
    if (filters?.status && filters.status !== 'ALL') apiParams.status = filters.status;
    if (filters?.approvalStatus && filters.approvalStatus !== 'ALL') apiParams.approvalStatus = filters.approvalStatus;
    if (filters?.page) apiParams.page = filters.page;
    if (filters?.limit) apiParams.limit = filters.limit;

    try {
      const res = isTrashView
        ? await getTrashCatalog('countries', apiParams)
        : await getCountries(apiParams);
      if (res.success) {
        const data = res.data as any;
        if (Array.isArray(data)) {
          setCountries(data);
          setTotalItems(data.length);
        } else {
          setCountries(data.items || []);
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
    fetchCountries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTrashView, filters?.search, filters?.status, filters?.approvalStatus, filters?.page, filters?.limit]);

  return { countries, totalItems, fetchCountries, isLoading };
}
