import { useIntegrationStore } from './integrationStore';

/**
 * Validates Zapier webhook URL format
 */
function isValidWebhookUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return (
      (urlObj.protocol === 'https:' || urlObj.protocol === 'http:') &&
      url.length > 0
    );
  } catch {
    return false;
  }
}

/**
 * Gets headers for webhook requests
 */
function getWebhookHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
  };
}

export const zapierService = {
  /**
   * Validates Zapier webhook URL format
   * @param url - The webhook URL to validate
   * @returns true if URL is valid, false otherwise
   */
  validateWebhookUrl(url: string): boolean {
    if (!url || typeof url !== 'string') {
      return false;
    }
    return isValidWebhookUrl(url);
  },

  /**
   * Tests the webhook connection by sending a test payload
   * @param webhookUrl - The webhook URL to test
   * @returns Promise resolving to success/failure
   */
  async testWebhook(webhookUrl: string): Promise<boolean> {
    try {
      if (!this.validateWebhookUrl(webhookUrl)) {
        console.error('Invalid webhook URL format');
        return false;
      }

      const testPayload = {
        event: 'test',
        timestamp: new Date().toISOString(),
        message: 'HabitFlow test event',
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: getWebhookHeaders(),
        body: JSON.stringify(testPayload),
      });

      return response.ok;
    } catch (error) {
      console.error('Error testing webhook:', error);
      return false;
    }
  },

  /**
   * Sends a habit completion event to the webhook
   */
  async sendHabitCompleted(
    webhookUrl: string,
    data: {
      habitName: string;
      habitId: string;
      category: string;
      streak: number;
      completedAt: string;
    }
  ): Promise<boolean> {
    try {
      if (!this.validateWebhookUrl(webhookUrl)) {
        console.error('Invalid webhook URL');
        return false;
      }

      const payload = {
        event: 'habit_completed',
        timestamp: new Date().toISOString(),
        data,
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: getWebhookHeaders(),
        body: JSON.stringify(payload),
      });

      return response.ok;
    } catch (error) {
      console.error('Error sending habit completed event:', error);
      return false;
    }
  },

  /**
   * Sends a habit created event to the webhook
   */
  async sendHabitCreated(
    webhookUrl: string,
    data: {
      habitName: string;
      habitId: string;
      category: string;
      frequency: string;
    }
  ): Promise<boolean> {
    try {
      if (!this.validateWebhookUrl(webhookUrl)) {
        console.error('Invalid webhook URL');
        return false;
      }

      const payload = {
        event: 'habit_created',
        timestamp: new Date().toISOString(),
        data,
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: getWebhookHeaders(),
        body: JSON.stringify(payload),
      });

      return response.ok;
    } catch (error) {
      console.error('Error sending habit created event:', error);
      return false;
    }
  },

  /**
   * Sends a streak milestone event to the webhook
   */
  async sendStreakMilestone(
    webhookUrl: string,
    data: {
      habitName: string;
      streak: number;
      milestone: number;
    }
  ): Promise<boolean> {
    try {
      if (!this.validateWebhookUrl(webhookUrl)) {
        console.error('Invalid webhook URL');
        return false;
      }

      const payload = {
        event: 'streak_milestone',
        timestamp: new Date().toISOString(),
        data,
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: getWebhookHeaders(),
        body: JSON.stringify(payload),
      });

      return response.ok;
    } catch (error) {
      console.error('Error sending streak milestone event:', error);
      return false;
    }
  },

  /**
   * Sends a daily summary event to the webhook
   */
  async sendDailySummary(
    webhookUrl: string,
    data: {
      date: string;
      totalHabits: number;
      completedHabits: number;
      topStreak: number;
      completionRate: number;
    }
  ): Promise<boolean> {
    try {
      if (!this.validateWebhookUrl(webhookUrl)) {
        console.error('Invalid webhook URL');
        return false;
      }

      const payload = {
        event: 'daily_summary',
        timestamp: new Date().toISOString(),
        data,
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: getWebhookHeaders(),
        body: JSON.stringify(payload),
      });

      return response.ok;
    } catch (error) {
      console.error('Error sending daily summary event:', error);
      return false;
    }
  },

  /**
   * Sends a custom event to the webhook
   */
  async sendCustomEvent(
    webhookUrl: string,
    eventType: string,
    data: Record<string, unknown>
  ): Promise<boolean> {
    try {
      if (!this.validateWebhookUrl(webhookUrl)) {
        console.error('Invalid webhook URL');
        return false;
      }

      const payload = {
        event: eventType,
        timestamp: new Date().toISOString(),
        data,
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: getWebhookHeaders(),
        body: JSON.stringify(payload),
      });

      return response.ok;
    } catch (error) {
      console.error('Error sending custom event:', error);
      return false;
    }
  },

  /**
   * Disconnects the Zapier integration
   */
  disconnect(): void {
    const store = useIntegrationStore();
    store.disconnect('zapier');
  },
};
