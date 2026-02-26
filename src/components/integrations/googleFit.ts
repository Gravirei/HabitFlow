import { useIntegrationStore } from './integrationStore';

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

interface StepsData {
  steps: number;
  date: string;
}

interface Workout {
  id: string;
  name: string;
  startTime: number;
  endTime: number;
  calories?: number;
  distance?: number;
}

interface SleepData {
  startTime: number;
  endTime: number;
  duration: number;
}

interface SyncResult {
  steps: number;
  workouts: Workout[];
  activeMinutes: number;
  sleep: SleepData[];
}

const CLIENT_ID = import.meta.env.VITE_GOOGLE_FIT_CLIENT_ID || import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_CLIENT_ID';
const REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI || 'http://localhost:5173/auth/callback';

const FITNESS_SCOPES = [
  'https://www.googleapis.com/auth/fitness.activity.read',
  'https://www.googleapis.com/auth/fitness.body.read',
  'https://www.googleapis.com/auth/fitness.sleep.read',
];

export const googleFitService = {
  initiateAuth: () => {
    const scopes = FITNESS_SCOPES.join(' ');
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    
    authUrl.searchParams.append('client_id', CLIENT_ID);
    authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('scope', scopes);
    authUrl.searchParams.append('access_type', 'offline');
    authUrl.searchParams.append('prompt', 'consent');
    
    window.location.href = authUrl.toString();
  },

  exchangeCode: async (code: string): Promise<TokenResponse> => {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: CLIENT_ID,
          redirect_uri: REDIRECT_URI,
          grant_type: 'authorization_code',
        }).toString(),
      });

      if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error exchanging code:', error);
      throw error;
    }
  },

  refreshAccessToken: async (refreshToken: string): Promise<TokenResponse> => {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          refresh_token: refreshToken,
          client_id: CLIENT_ID,
          grant_type: 'refresh_token',
        }).toString(),
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  },

  getHeaders: (accessToken: string) => ({
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  }),

  getSteps: async (accessToken: string, date: string): Promise<number> => {
    try {
      const dateMs = new Date(date).getTime();
      const nextDateMs = dateMs + 86400000; // 24 hours later

      const response = await fetch(
        'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate',
        {
          method: 'POST',
          headers: googleFitService.getHeaders(accessToken),
          body: JSON.stringify({
            aggregateBy: [
              {
                dataTypeName: 'com.google.step_count.delta',
              },
            ],
            bucketByTime: { durationMillis: 86400000 },
            startTimeMillis: dateMs,
            endTimeMillis: nextDateMs,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch steps: ${response.statusText}`);
      }

      const data = await response.json();
      const buckets = data.bucket || [];
      
      if (buckets.length === 0) {
        return 0;
      }

      const dataset = buckets[0].dataset || [];
      const stepsDataset = dataset.find(
        (d: any) => d.dataSourceId && d.dataSourceId.includes('com.google.step_count.delta')
      );

      if (!stepsDataset || stepsDataset.point.length === 0) {
        return 0;
      }

      return stepsDataset.point[0].value[0].intVal || 0;
    } catch (error) {
      console.error('Error fetching steps:', error);
      throw error;
    }
  },

  getWorkouts: async (accessToken: string, startDate: string, endDate: string): Promise<Workout[]> => {
    try {
      const startMs = new Date(startDate).getTime();
      const endMs = new Date(endDate).getTime();

      const response = await fetch(
        'https://www.googleapis.com/fitness/v1/users/me/sessions?startTime=' +
        new Date(startMs).toISOString() +
        '&endTime=' +
        new Date(endMs).toISOString(),
        {
          headers: googleFitService.getHeaders(accessToken),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch workouts: ${response.statusText}`);
      }

      const data = await response.json();
      const sessions = data.session || [];

      return sessions.map((session: any) => ({
        id: session.id,
        name: session.name || 'Workout',
        startTime: parseInt(session.startTimeMillis),
        endTime: parseInt(session.endTimeMillis),
        calories: session.application?.details?.calorie || undefined,
        distance: session.application?.details?.distance || undefined,
      }));
    } catch (error) {
      console.error('Error fetching workouts:', error);
      throw error;
    }
  },

  getActiveMinutes: async (accessToken: string, date: string): Promise<number> => {
    try {
      const dateMs = new Date(date).getTime();
      const nextDateMs = dateMs + 86400000;

      const response = await fetch(
        'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate',
        {
          method: 'POST',
          headers: googleFitService.getHeaders(accessToken),
          body: JSON.stringify({
            aggregateBy: [
              {
                dataTypeName: 'com.google.active_minutes',
              },
            ],
            bucketByTime: { durationMillis: 86400000 },
            startTimeMillis: dateMs,
            endTimeMillis: nextDateMs,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch active minutes: ${response.statusText}`);
      }

      const data = await response.json();
      const buckets = data.bucket || [];

      if (buckets.length === 0) {
        return 0;
      }

      const dataset = buckets[0].dataset || [];
      const activeDataset = dataset.find(
        (d: any) => d.dataSourceId && d.dataSourceId.includes('com.google.active_minutes')
      );

      if (!activeDataset || activeDataset.point.length === 0) {
        return 0;
      }

      return activeDataset.point[0].value[0].intVal || 0;
    } catch (error) {
      console.error('Error fetching active minutes:', error);
      throw error;
    }
  },

  getSleepData: async (accessToken: string, date: string): Promise<SleepData[]> => {
    try {
      const dateMs = new Date(date).getTime();
      const nextDateMs = dateMs + 86400000;

      const response = await fetch(
        'https://www.googleapis.com/fitness/v1/users/me/sessions?startTime=' +
        new Date(dateMs).toISOString() +
        '&endTime=' +
        new Date(nextDateMs).toISOString() +
        '&activityType=72',
        {
          headers: googleFitService.getHeaders(accessToken),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch sleep data: ${response.statusText}`);
      }

      const data = await response.json();
      const sessions = data.session || [];

      return sessions
        .filter((session: any) => session.activityType === 72) // Sleep activity type
        .map((session: any) => ({
          startTime: parseInt(session.startTimeMillis),
          endTime: parseInt(session.endTimeMillis),
          duration: (parseInt(session.endTimeMillis) - parseInt(session.startTimeMillis)) / 3600000, // hours
        }));
    } catch (error) {
      console.error('Error fetching sleep data:', error);
      throw error;
    }
  },

  syncFitnessData: async (accessToken: string): Promise<SyncResult> => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      const [steps, workouts, activeMinutes, sleep] = await Promise.all([
        googleFitService.getSteps(accessToken, today),
        googleFitService.getWorkouts(accessToken, sevenDaysAgo, today),
        googleFitService.getActiveMinutes(accessToken, today),
        googleFitService.getSleepData(accessToken, today),
      ]);

      return {
        steps,
        workouts,
        activeMinutes,
        sleep,
      };
    } catch (error) {
      console.error('Error syncing fitness data:', error);
      throw error;
    }
  },

  disconnect: async () => {
    try {
      const store = useIntegrationStore.getState();
      const connection = store.connections['google-fit'];

      if (connection?.accessToken) {
        // Revoke token
        await fetch('https://oauth2.googleapis.com/revoke', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            token: connection.accessToken,
          }).toString(),
        }).catch((error) => {
          console.warn('Token revocation failed:', error);
          // Continue with disconnect even if revocation fails
        });
      }

      store.disconnect('google-fit');
    } catch (error) {
      console.error('Error disconnecting:', error);
      throw error;
    }
  },
};
