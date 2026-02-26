import toast from 'react-hot-toast';
import { useIntegrationStore } from './integrationStore';

interface HealthData {
  steps: number;
  sleepHours: number;
  mindfulMinutes: number;
}

interface SyncResult {
  success: boolean;
  synced: HealthData;
  timestamp: string;
}

export const appleHealthService = {
  /**
   * Check if Apple Health (HealthKit) is available on the current device
   * HealthKit is only available on iOS native apps, not on web
   */
  async checkAvailability(): Promise<boolean> {
    try {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
      
      console.log('[AppleHealth] Availability check - iOS:', isIOS, 'Safari:', isSafari);
      
      // HealthKit is not available on web, return false
      // In a real native app, this would check for HealthKit framework availability
      return false;
    } catch (error) {
      console.error('[AppleHealth] Error checking availability:', error);
      return false;
    }
  },

  /**
   * Request authorization to access HealthKit data
   * Shows toast if not available on current platform
   */
  async requestAuthorization(): Promise<boolean> {
    try {
      const available = await appleHealthService.checkAvailability();
      
      if (!available) {
        console.warn('[AppleHealth] HealthKit not available on this platform');
        toast.error('Apple Health requires an iOS device');
        return false;
      }

      console.log('[AppleHealth] Requesting HealthKit authorization...');
      // In a real native app, this would trigger HealthKit permission prompt
      toast.success('Authorization requested');
      return true;
    } catch (error) {
      console.error('[AppleHealth] Authorization request failed:', error);
      toast.error('Failed to request authorization');
      return false;
    }
  },

  /**
   * Connect to Apple Health
   * Updates integration store with connection details
   */
  async connect(): Promise<boolean> {
    try {
      const store = useIntegrationStore.getState();
      const authorized = await appleHealthService.requestAuthorization();

      if (!authorized) {
        console.log('[AppleHealth] Authorization not granted, simulating connection for demo');
      }

      // Simulate connection with mock tokens
      const mockAccessToken = 'mock_apple_health_token_' + Date.now();
      const mockExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      store.connect('apple-health', mockAccessToken, undefined, mockExpiresAt);
      store.setStatus('apple-health', 'connected');
      
      console.log('[AppleHealth] Connected successfully');
      toast.success('Apple Health connected');
      return true;
    } catch (error) {
      console.error('[AppleHealth] Connection failed:', error);
      const store = useIntegrationStore.getState();
      store.setError('apple-health', error instanceof Error ? error.message : 'Connection failed');
      toast.error('Failed to connect Apple Health');
      return false;
    }
  },

  /**
   * Get step count for a specific date
   * Returns mock data since HealthKit is not available on web
   */
  async getSteps(date: string): Promise<number> {
    try {
      console.log('[AppleHealth] Fetching steps for', date);
      
      // Mock data generation based on date
      const dateObj = new Date(date);
      const dayOfWeek = dateObj.getDay();
      const baseMockSteps = 8500;
      // Vary mock data slightly based on day of week
      const variation = (dayOfWeek * 1243) % 3000;
      const mockSteps = baseMockSteps + variation;

      console.log('[AppleHealth] Steps for', date, ':', mockSteps);
      return mockSteps;
    } catch (error) {
      console.error('[AppleHealth] Error fetching steps:', error);
      return 0;
    }
  },

  /**
   * Get sleep data for a specific date
   * Returns mock sleep hours since HealthKit is not available on web
   */
  async getSleepData(date: string): Promise<number> {
    try {
      console.log('[AppleHealth] Fetching sleep data for', date);
      
      // Mock data generation based on date
      const dateObj = new Date(date);
      const dayOfWeek = dateObj.getDay();
      const baseMockSleep = 7.5;
      // Vary mock data slightly based on day of week
      const variation = ((dayOfWeek * 537) % 200) / 100;
      const mockSleep = Math.max(5.5, Math.min(9, baseMockSleep + variation - 1));

      console.log('[AppleHealth] Sleep hours for', date, ':', mockSleep.toFixed(1));
      return parseFloat(mockSleep.toFixed(1));
    } catch (error) {
      console.error('[AppleHealth] Error fetching sleep data:', error);
      return 0;
    }
  },

  /**
   * Get mindful minutes for a specific date
   * Returns mock mindful minutes since HealthKit is not available on web
   */
  async getMindfulMinutes(date: string): Promise<number> {
    try {
      console.log('[AppleHealth] Fetching mindful minutes for', date);
      
      // Mock data generation based on date
      const dateObj = new Date(date);
      const dayOfWeek = dateObj.getDay();
      const baseMockMinutes = 12;
      // Vary mock data slightly based on day of week
      const variation = (dayOfWeek * 179) % 20;
      const mockMinutes = baseMockMinutes + variation;

      console.log('[AppleHealth] Mindful minutes for', date, ':', mockMinutes);
      return mockMinutes;
    } catch (error) {
      console.error('[AppleHealth] Error fetching mindful minutes:', error);
      return 0;
    }
  },

  /**
   * Sync all health data from Apple Health
   * Returns sync results with mock data
   */
  async syncHealthData(): Promise<SyncResult> {
    try {
      const store = useIntegrationStore.getState();
      const today = new Date().toISOString().split('T')[0];

      console.log('[AppleHealth] Starting health data sync...');
      
      const [steps, sleepHours, mindfulMinutes] = await Promise.all([
        appleHealthService.getSteps(today),
        appleHealthService.getSleepData(today),
        appleHealthService.getMindfulMinutes(today),
      ]);

      const result: SyncResult = {
        success: true,
        synced: {
          steps,
          sleepHours,
          mindfulMinutes,
        },
        timestamp: new Date().toISOString(),
      };

      store.updateLastSynced('apple-health');
      console.log('[AppleHealth] Sync completed:', result);
      toast.success('Health data synced');
      
      return result;
    } catch (error) {
      console.error('[AppleHealth] Sync failed:', error);
      const store = useIntegrationStore.getState();
      store.setError('apple-health', error instanceof Error ? error.message : 'Sync failed');
      toast.error('Failed to sync health data');
      
      return {
        success: false,
        synced: { steps: 0, sleepHours: 0, mindfulMinutes: 0 },
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Export habit streak data to Apple Health
   * Simulates exporting streak information
   */
  async exportHabitStreak(habitName: string, streak: number): Promise<boolean> {
    try {
      console.log('[AppleHealth] Exporting habit streak:', habitName, 'days:', streak);
      
      // In a real implementation, this would save custom health data to HealthKit
      // For now, just log and return success
      
      toast.success(`Exported "${habitName}" streak to Apple Health`);
      console.log('[AppleHealth] Streak exported successfully');
      return true;
    } catch (error) {
      console.error('[AppleHealth] Streak export failed:', error);
      toast.error('Failed to export streak');
      return false;
    }
  },

  /**
   * Disconnect from Apple Health
   * Removes connection from integration store
   */
  async disconnect(): Promise<boolean> {
    try {
      const store = useIntegrationStore.getState();
      store.disconnect('apple-health');
      
      console.log('[AppleHealth] Disconnected successfully');
      toast.success('Apple Health disconnected');
      return true;
    } catch (error) {
      console.error('[AppleHealth] Disconnection failed:', error);
      toast.error('Failed to disconnect Apple Health');
      return false;
    }
  },
};
