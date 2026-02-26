import { useIntegrationStore } from './integrationStore';

export const iftttService = {
  /**
   * Validates IFTTT webhook key format
   */
  validateKey(key: string): boolean {
    return typeof key === 'string' && key.trim().length > 0;
  },

  /**
   * Constructs the full IFTTT webhook URL
   */
  buildWebhookUrl(eventName: string, key: string): string {
    return `https://maker.ifttt.com/trigger/${eventName}/with/key/${key}`;
  },

  /**
   * Tests connection by sending a test trigger to habitflow_test event
   */
  async testConnection(key: string): Promise<boolean> {
    try {
      if (!this.validateKey(key)) {
        return false;
      }

      const url = this.buildWebhookUrl('habitflow_test', key);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      return response.ok;
    } catch (error) {
      console.error('IFTTT test connection failed:', error);
      return false;
    }
  },

  /**
   * Triggers an event with up to 3 values
   */
  async triggerEvent(
    key: string,
    eventName: string,
    value1?: string,
    value2?: string,
    value3?: string
  ): Promise<boolean> {
    try {
      if (!this.validateKey(key)) {
        return false;
      }

      const url = this.buildWebhookUrl(eventName, key);
      const payload: Record<string, string> = {};

      if (value1) payload.value1 = value1;
      if (value2) payload.value2 = value2;
      if (value3) payload.value3 = value3;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      return response.ok;
    } catch (error) {
      console.error('IFTTT trigger event failed:', error);
      return false;
    }
  },

  /**
   * Triggers habitflow_completed event when a habit is completed
   */
  async triggerHabitCompleted(
    key: string,
    habitName: string,
    streak: number,
    category: string
  ): Promise<boolean> {
    return this.triggerEvent(
      key,
      'habitflow_completed',
      habitName,
      `${streak} day streak`,
      category
    );
  },

  /**
   * Triggers habitflow_created event when a new habit is created
   */
  async triggerHabitCreated(
    key: string,
    habitName: string,
    frequency: string,
    category: string
  ): Promise<boolean> {
    return this.triggerEvent(
      key,
      'habitflow_created',
      habitName,
      frequency,
      category
    );
  },

  /**
   * Triggers habitflow_streak event when a streak milestone is hit
   */
  async triggerStreakMilestone(
    key: string,
    habitName: string,
    streak: number,
    milestone: number
  ): Promise<boolean> {
    return this.triggerEvent(
      key,
      'habitflow_streak',
      habitName,
      `${streak} days`,
      `${milestone} day milestone`
    );
  },

  /**
   * Triggers habitflow_summary event with daily habit summary
   */
  async triggerDailySummary(
    key: string,
    completed: number,
    total: number,
    topStreak: number
  ): Promise<boolean> {
    return this.triggerEvent(
      key,
      'habitflow_summary',
      `${completed}/${total} completed`,
      `Top streak: ${topStreak}`,
      new Date().toLocaleDateString()
    );
  },

  /**
   * Disconnects IFTTT integration via store
   */
  disconnect(): void {
    const { disconnect } = useIntegrationStore.getState();
    disconnect('ifttt');
  },
};
