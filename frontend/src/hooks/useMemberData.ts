import { useState, useEffect } from 'react';
import * as userService from '../services/user.service';

export function useMemberData(filters?: { search?: string; status?: string; role?: string; page?: number; limit?: number }) {
  const [members, setMembers] = useState<any[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMembers = async () => {
    setIsLoading(true);
    const apiParams: any = {};
    if (filters?.search) apiParams.search = filters.search;
    if (filters?.status && filters.status !== 'ALL') apiParams.status = filters.status;
    if (filters?.role && filters.role !== 'ALL') apiParams.role = filters.role;
    if (filters?.page) apiParams.page = filters.page;
    if (filters?.limit) apiParams.limit = filters.limit;

    try {
      const res = await userService.getUsers(apiParams);
      if (res.success) {
        const data = res.data as any;
        if (Array.isArray(data)) {
          setMembers(data);
          setTotalItems(data.length);
        } else {
          setMembers(data.items || []);
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
    fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.search, filters?.status, filters?.role, filters?.page, filters?.limit]);

  return { members, totalItems, fetchMembers, isLoading };
}
