import { useEffect, useState } from "react";

export const useAuth = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      setUser({ name: "Abhijeet", role: "user" });
      setLoading(false);
    }, 1000);
  }, []);
  return { user, loading };
};
