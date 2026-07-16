import { useState, useEffect } from 'react';
import * as userService from '../services/user.service';

export function useMemberData() {
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const res = await userService.getUsers();
      if (res.success) setMembers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  return { members, fetchMembers, isLoading };
}
