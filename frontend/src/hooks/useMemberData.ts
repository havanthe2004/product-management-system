import { useState, useEffect } from 'react';
import * as userService from '../services/user.service';

export function useMemberData(filters?: { search?: string; status?: string; role?: string }) {
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMembers = async () => {
    setIsLoading(true);
    const apiParams: any = {};
    if (filters?.search) apiParams.search = filters.search;
    if (filters?.status && filters.status !== 'ALL') apiParams.status = filters.status;
    if (filters?.role && filters.role !== 'ALL') apiParams.role = filters.role;

    try {
      const res = await userService.getUsers(apiParams);
      if (res.success) setMembers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.search, filters?.status, filters?.role]);

  return { members, fetchMembers, isLoading };
}
