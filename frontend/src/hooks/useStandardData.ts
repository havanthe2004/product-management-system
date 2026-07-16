import { useState, useEffect } from 'react';
import { getQualityStandards, getTrashCatalog } from '../services/catalog.service';

export function useStandardData(isTrashView: boolean) {
  const [standards, setStandards] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStandards = async () => {
    setIsLoading(true);
    try {
      const res = isTrashView
        ? await getTrashCatalog('quality-standards')
        : await getQualityStandards();
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
  }, [isTrashView]);

  return { standards, fetchStandards, isLoading };
}
