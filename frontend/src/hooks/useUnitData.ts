import { useState, useEffect } from 'react';
import { getUnits, getTrashCatalog } from '../services/catalog.service';

export function useUnitData(isTrashView: boolean) {
  const [dbUnits, setDbUnits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUnits = async () => {
    setIsLoading(true);
    try {
      const res = isTrashView
        ? await getTrashCatalog('units')
        : await getUnits();
      if (res.success) setDbUnits(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTrashView]);

  return { dbUnits, fetchUnits, isLoading };
}
