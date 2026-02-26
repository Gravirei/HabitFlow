import { useIntegrationStore } from './integrationStore';
import type { SlackSettings } from './types';

const SLACK_CLIENT_ID = import.meta.env.VITE_SLACK_CLIENT_ID || 'placeholder_client_id';
const SLACK_CLIENT_SECRET = import.meta.env.VITE_SLACK_CLIENT_SECRET || 'placeholder_client_secret';
const SLACK_REDIRECT_URI = import.meta.env.VITE_SLACK_REDIRECT_URI || 'http://localhost:5173/auth/slack/callback';

const SLACK_API_BASE = 'https://slack.com/api';
const SLACK_OAUTH_URL = 'https://slack.com/oauth/v2/authorize';

interface SlackOAuthResponse {
  ok: boolean;
  access_token?: string;
  token_type?: string;
  scope?: string;
  bot_user_id?: string;
  app_id?: string;
  team?: {
    id: string;
    name: string;
  };
  enterprise?: {
    id: string;
    name: string;
  };
  authed_user?: {
    id: string;
    scope?: string;
    token_type?: string;
  };
  incoming_webhook?: {
    channel: string;
    channel_id: string;
    configuration_url: string;
    url: string;
  };
  error?: string;
}

interface SlackChannel {
  id: string;
  name: string;
  is_member: boolean;
  is_private: boolean;
}

interface SlackConversationsListResponse {
  ok: boolean;
  channels?: SlackChannel[];
  error?: string;
}

interface SlackMessageResponse {
  ok: boolean;
  channel?: string;
  ts?: string;
  message?: {
    type: string;
    user: string;
    text: string;
    ts: string;
  };
  error?: string;
}

interface DailySummary {
  total: number;
  completed: number;
  streak: number;
  topHabit: string;
}

interface BlockKitBlock {
  type: string;
  [key: string]: unknown;
}

export const slackService = {
  /**
   * Initiates Slack OAuth flow by opening the authorization URL
   */
  initiateAuth(): void {
    const scopes = ['channels:read', 'chat:write', 'incoming-webhook'];
    const params = new URLSearchParams({
      client_id: SLACK_CLIENT_ID,
      redirect_uri: SLACK_REDIRECT_URI,
      scope: scopes.join(','),
      user_scope: 'chat:write',
    });

    const authUrl = `${SLACK_OAUTH_URL}?${params.toString()}`;
    window.location.href = authUrl;
  },

  /**
   * Exchanges authorization code for access token and webhook URL
   */
  async exchangeCode(code: string): Promise<SlackOAuthResponse> {
    try {
      const params = new URLSearchParams({
        client_id: SLACK_CLIENT_ID,
        client_secret: SLACK_CLIENT_SECRET,
        code,
        redirect_uri: SLACK_REDIRECT_URI,
      });

      const response = await fetch(`${SLACK_API_BASE}/oauth.v2.access`, {
        method: 'POST',
        body: params,
      });

      const data: SlackOAuthResponse = await response.json();

      if (!data.ok) {
        throw new Error(data.error || 'Failed to exchange authorization code');
      }

      return data;
    } catch (error) {
      console.error('Error exchanging Slack code:', error);
      throw error;
    }
  },

  /**
   * Returns authorization headers for Slack API requests
   */
  getHeaders(accessToken: string): Record<string, string> {
    return {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };
  },

  /**
   * Fetches list of channels the bot/user has access to
   */
  async listChannels(accessToken: string): Promise<SlackChannel[]> {
    try {
      const response = await fetch(`${SLACK_API_BASE}/conversations.list?exclude_archived=true`, {
        method: 'GET',
        headers: this.getHeaders(accessToken),
      });

      const data: SlackConversationsListResponse = await response.json();

      if (!data.ok) {
        throw new Error(data.error || 'Failed to fetch channels');
      }

      return data.channels || [];
    } catch (error) {
      console.error('Error fetching Slack channels:', error);
      throw error;
    }
  },

  /**
   * Sends a message to a Slack channel
   */
  async sendMessage(
    accessToken: string,
    channelId: string,
    text: string,
    blocks?: BlockKitBlock[]
  ): Promise<SlackMessageResponse> {
    try {
      const payload: Record<string, unknown> = {
        channel: channelId,
        text,
      };

      if (blocks && blocks.length > 0) {
        payload.blocks = blocks;
      }

      const response = await fetch(`${SLACK_API_BASE}/chat.postMessage`, {
        method: 'POST',
        headers: this.getHeaders(accessToken),
        body: JSON.stringify(payload),
      });

      const data: SlackMessageResponse = await response.json();

      if (!data.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      return data;
    } catch (error) {
      console.error('Error sending Slack message:', error);
      throw error;
    }
  },

  /**
   * Sends a formatted habit completion notification with Block Kit
   */
  async sendHabitCompletion(
    accessToken: string,
    channelId: string,
    habitName: string,
    streak: number
  ): Promise<SlackMessageResponse> {
    const emojiMap: Record<number, string> = {
      7: '🔥',
      14: '⚡',
      30: '🌟',
      60: '💎',
      100: '👑',
    };

    const emoji = Object.entries(emojiMap)
      .reverse()
      .find(([days]) => streak >= parseInt(days))?.[1] || '✅';

    const blocks: BlockKitBlock[] = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `${emoji} *Habit Completed!*\n_${habitName}_`,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Streak*\n${streak} days 🔥`,
          },
          {
            type: 'mrkdwn',
            text: `*Status*\n✨ On Track`,
          },
        ],
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `Great work keeping the streak alive! Keep it up 💪`,
          },
        ],
      },
    ];

    return this.sendMessage(
      accessToken,
      channelId,
      `Habit Completed: ${habitName}`,
      blocks
    );
  },

  /**
   * Sends a formatted daily habit summary with stats
   */
  async sendDailySummary(
    accessToken: string,
    channelId: string,
    summary: DailySummary
  ): Promise<SlackMessageResponse> {
    const completionRate = summary.total > 0 
      ? Math.round((summary.completed / summary.total) * 100) 
      : 0;

    const progressBar = this.generateProgressBar(completionRate);

    const blocks: BlockKitBlock[] = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `📊 *Daily Habit Summary*\n_${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}_`,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Completed*\n${summary.completed}/${summary.total} habits`,
          },
          {
            type: 'mrkdwn',
            text: `*Completion Rate*\n${completionRate}%`,
          },
          {
            type: 'mrkdwn',
            text: `*Current Streak*\n${summary.streak} days 🔥`,
          },
          {
            type: 'mrkdwn',
            text: `*Top Habit*\n${summary.topHabit}`,
          },
        ],
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `${progressBar}\n_Progress: ${completionRate}%_`,
        },
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: this.getDailyMotivation(completionRate),
          },
        ],
      },
    ];

    return this.sendMessage(
      accessToken,
      channelId,
      `Daily Summary: ${summary.completed}/${summary.total} habits completed`,
      blocks
    );
  },

  /**
   * Sends a celebration message for streak milestones
   */
  async sendStreakMilestone(
    accessToken: string,
    channelId: string,
    habitName: string,
    streak: number
  ): Promise<SlackMessageResponse> {
    const milestoneData: Record<number, { emoji: string; message: string }> = {
      7: { emoji: '🔥', message: 'You\'re on fire! 7-day streak achieved!' },
      14: { emoji: '⚡', message: 'Two weeks strong! You\'re unstoppable!' },
      30: { emoji: '🌟', message: 'One month of consistency! Amazing work!' },
      60: { emoji: '💎', message: 'Two months! You\'re a habit master!' },
      100: { emoji: '👑', message: 'One hundred days! You\'re a legend!' },
    };

    const milestone = milestoneData[streak] || { 
      emoji: '🎉', 
      message: `Milestone reached: ${streak} days!` 
    };

    const blocks: BlockKitBlock[] = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `${milestone.emoji} *Streak Milestone Unlocked!*`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `_${habitName}_\n\n${milestone.message}`,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Days*\n${streak}`,
          },
          {
            type: 'mrkdwn',
            text: `*Status*\n🏆 Champion`,
          },
        ],
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: 'Share your achievement and inspire others! 🎯',
          },
        ],
      },
    ];

    return this.sendMessage(
      accessToken,
      channelId,
      `Milestone: ${streak} days on ${habitName}!`,
      blocks
    );
  },

  /**
   * Sends a message via incoming webhook
   */
  async sendWebhookMessage(webhookUrl: string, message: Record<string, unknown>): Promise<Response> {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        throw new Error(`Webhook request failed with status ${response.status}`);
      }

      return response;
    } catch (error) {
      console.error('Error sending webhook message:', error);
      throw error;
    }
  },

  /**
   * Disconnects the Slack integration
   */
  disconnect(): void {
    const store = useIntegrationStore();
    store.disconnect('slack');
  },

  /**
   * Helper: Generate ASCII progress bar
   */
  generateProgressBar(percentage: number): string {
    const filled = Math.round(percentage / 10);
    const empty = 10 - filled;
    return `\`${'█'.repeat(filled)}${'░'.repeat(empty)}\``;
  },

  /**
   * Helper: Get motivational message based on completion rate
   */
  getDailyMotivation(completionRate: number): string {
    if (completionRate === 100) return '🌟 Perfect day! All habits completed!';
    if (completionRate >= 80) return '🔥 Excellent work! Keep pushing!';
    if (completionRate >= 60) return '💪 Good progress! Don\'t stop now!';
    if (completionRate >= 40) return '⚡ You\'re making progress! Keep going!';
    return '🎯 Get started! Every habit counts!';
  },
};
