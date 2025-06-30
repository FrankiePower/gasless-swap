import { useEffect, useState } from "react";
import { apiUrl } from "~~/config/apiUrl";

export interface SwapHistoryItem {
  from: string;
  to: string;
  amount: number;
  time: string;
  status: string;
  transactionHash: string;
  userAddress: string;
}

export const useSwapHistory = (limit: number = 10) => {
  const [recentSwaps, setRecentSwaps] = useState<SwapHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecentSwaps = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${apiUrl}/api/history/recent?limit=${limit}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setRecentSwaps(data.data);
      } else {
        throw new Error(data.error || "Failed to fetch recent swaps");
      }
    } catch (err) {
      console.error("Error fetching recent swaps:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch recent swaps");
      // Fallback to empty array instead of throwing
      setRecentSwaps([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserSwaps = async (userAddress: string, userLimit: number = 20) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${apiUrl}/api/history/user/${userAddress}?limit=${userLimit}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setRecentSwaps(data.data);
      } else {
        throw new Error(data.error || "Failed to fetch user swaps");
      }
    } catch (err) {
      console.error("Error fetching user swaps:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch user swaps");
      setRecentSwaps([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-refresh recent swaps every 30 seconds
  useEffect(() => {
    fetchRecentSwaps();

    const interval = setInterval(() => {
      fetchRecentSwaps();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [limit]);

  return {
    recentSwaps,
    isLoading,
    error,
    refetch: fetchRecentSwaps,
    fetchUserSwaps,
  };
};
