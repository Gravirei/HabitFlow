# 🚀 Supabase Integration Setup Guide

## 📦 Step 1: Install Supabase Package

Run this command in your terminal:

```bash
npm install @supabase/supabase-js
```

## 🔑 Step 2: Get Your Supabase Keys

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project or select your existing project
3. Navigate to **Settings** → **API**
4. Copy the following values:
   - **Project URL** (e.g., `https://xxxxxxxxxxxxx.supabase.co`)
   - **Project API Key** - Use the **`anon`** `public` key

## ⚙️ Step 3: Configure Environment Variables

Open your `.env` file and add your keys:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ Important:** 
- Replace the placeholder values with your actual keys
- Never commit your `.env` file to Git (it's already in `.gitignore`)
- The anon key is safe to use in client-side code

## 📝 Step 4: Use Supabase in Your App

The Supabase client is already configured in `src/lib/supabase.ts`. Here's how to use it:

### Authentication Example

```typescript
import { supabase } from '@/lib/supabase'

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'secure-password',
})

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'secure-password',
})

// Sign out
await supabase.auth.signOut()

// Get current user
const { data: { user } } = await supabase.auth.getUser()

// Listen to auth changes
supabase.auth.onAuthStateChange((event, session) => {
  console.log(event, session)
})
```

### Database Operations Example

```typescript
import { supabase } from '@/lib/supabase'

// Insert data
const { data, error } = await supabase
  .from('timer_sessions')
  .insert({
    mode: 'Stopwatch',
    duration: 120,
    timestamp: Date.now(),
  })

// Query data
const { data, error } = await supabase
  .from('timer_sessions')
  .select('*')
  .eq('mode', 'Stopwatch')
  .order('timestamp', { ascending: false })
  .limit(10)

// Update data
const { data, error } = await supabase
  .from('timer_sessions')
  .update({ duration: 150 })
  .eq('id', sessionId)

// Delete data
const { data, error } = await supabase
  .from('timer_sessions')
  .delete()
  .eq('id', sessionId)
```

### Real-time Subscriptions Example

```typescript
import { supabase } from '@/lib/supabase'

// Subscribe to changes
const subscription = supabase
  .channel('timer-sessions')
  .on(
    'postgres_changes',
    {
      event: '*', // 'INSERT' | 'UPDATE' | 'DELETE' | '*'
      schema: 'public',
      table: 'timer_sessions',
    },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()

// Unsubscribe when done
subscription.unsubscribe()
```

### Storage (File Upload) Example

```typescript
import { supabase } from '@/lib/supabase'

// Upload file
const { data, error } = await supabase.storage
  .from('avatars')
  .upload('user-avatar.png', file)

// Get public URL
const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl('user-avatar.png')

console.log(data.publicUrl)
```

## 🗄️ Step 5: Set Up Your Database (Optional)

If you want to sync timer sessions to Supabase, create a table:

```sql
-- Create timer_sessions table
create table timer_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  mode text not null check (mode in ('Stopwatch', 'Countdown', 'Intervals')),
  duration integer not null,
  timestamp bigint not null,
  session_name text,
  completed boolean default true,
  -- Stopwatch specific
  lap_count integer,
  best_lap integer,
  laps jsonb,
  -- Countdown specific
  target_duration integer,
  -- Intervals specific
  interval_count integer,
  target_loop_count integer,
  work_duration integer,
  break_duration integer,
  completed_loops integer,
  -- Metadata
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table timer_sessions enable row level security;

-- Create policy: Users can only see their own sessions
create policy "Users can view own sessions"
  on timer_sessions for select
  using (auth.uid() = user_id);

-- Create policy: Users can insert their own sessions
create policy "Users can insert own sessions"
  on timer_sessions for insert
  with check (auth.uid() = user_id);

-- Create policy: Users can update their own sessions
create policy "Users can update own sessions"
  on timer_sessions for update
  using (auth.uid() = user_id);

-- Create policy: Users can delete their own sessions
create policy "Users can delete own sessions"
  on timer_sessions for delete
  using (auth.uid() = user_id);

-- Create index for faster queries
create index timer_sessions_user_id_idx on timer_sessions(user_id);
create index timer_sessions_timestamp_idx on timer_sessions(timestamp desc);
create index timer_sessions_mode_idx on timer_sessions(mode);
```

## 🎯 Step 6: Integrate with Existing Timer Persistence

You can modify `src/components/timer/utils/timerPersistence.ts` to sync with Supabase:

```typescript
import { supabase } from '@/lib/supabase'

export async function saveSessionToSupabase(session: TimerSession) {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    // User not logged in, save to localStorage only
    return saveToLocalStorage(session)
  }

  // Save to both Supabase and localStorage
  const { data, error } = await supabase
    .from('timer_sessions')
    .insert({
      user_id: user.id,
      ...session,
    })

  if (error) {
    console.error('Error saving to Supabase:', error)
    // Fallback to localStorage
    return saveToLocalStorage(session)
  }

  return data
}
```

## 🔐 Security Best Practices

1. **Never expose the `service_role` key** - Only use the `anon` key in your frontend
2. **Always use Row Level Security (RLS)** - Protect your data with proper policies
3. **Validate data on the server** - Don't trust client-side validation alone
4. **Use TypeScript types** - Generate types from your database schema
5. **Handle errors gracefully** - Always check for errors in responses

## 📚 Useful Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Database Types Generator](https://supabase.com/docs/guides/api/generating-types)

## 🎉 You're All Set!

After completing these steps, your app will be ready to use Supabase for:
- ✅ User authentication
- ✅ Database operations
- ✅ Real-time subscriptions
- ✅ File storage
- ✅ Cloud sync for timer sessions

---

**Need Help?** Check the [Supabase Discord](https://discord.supabase.com/) or documentation.
