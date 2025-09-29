import { useUser } from "@clerk/nextjs";
import { useConvexAuth } from "convex/react";
import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

export function useStoreUser() {
  const { isAuthenticated, isLoading: isLoadingAuth } = useConvexAuth();
  const { user } = useUser();
  
  const [userId, setUserId] = useState(null);
  const storeUser = useMutation(api.users.store);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setUserId(null); 
      return;
    }
    
    if (userId !== null) {
      return;
    }

    async function createUser() {
      try {
        const id = await storeUser();
        setUserId(id);
      } catch (error) {
        console.error("Convex storeUser mutation failed:", error);
        setUserId('error'); 
      }
    }
    
    createUser();

    return () => setUserId(null);
    
  }, [isAuthenticated, storeUser, user?.id]);

  return {
    isLoading: isLoadingAuth || (isAuthenticated && userId === null),
    
    isAuthenticated: isAuthenticated && userId !== null,
  };
}