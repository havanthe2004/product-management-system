import { useState, useEffect } from 'react';
import { getCountries, getTrashCatalog } from '../services/catalog.service';

export function useCountryData(isTrashView: boolean) {
  const [countries, setCountries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCountries = async () => {
    setIsLoading(true);
    try {
      const res = isTrashView
        ? await getTrashCatalog('countries')
        : await getCountries();
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
  }, [isTrashView]);

  return { countries, fetchCountries, isLoading };
}
