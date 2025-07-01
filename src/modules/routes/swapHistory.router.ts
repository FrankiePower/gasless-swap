import { Router } from "express";
import { getRecentSwaps, getUserSwaps, formatSwapForDisplay } from "../services/swapHistory.service";

const router = Router();

// Get recent swaps (public endpoint)
router.get("/recent", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const swaps = await getRecentSwaps(limit);
    
    const formattedSwaps = swaps.map(formatSwapForDisplay);
    
    res.json({
      success: true,
      data: formattedSwaps,
    });
  } catch (error) {
    console.error("Error fetching recent swaps:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch recent swaps",
    });
  }
});

// Get user-specific swaps
router.get("/user/:address", async (req, res) => {
  try {
    const { address } = req.params;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const swaps = await getUserSwaps(address, limit);
    const formattedSwaps = swaps.map(formatSwapForDisplay);
    
    res.json({
      success: true,
      data: formattedSwaps,
    });
  } catch (error) {
    console.error("Error fetching user swaps:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch user swaps",
    });
  }
});

export default router; 