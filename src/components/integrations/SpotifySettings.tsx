import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { spotifyService } from './spotify';
import { useIntegrationStore } from './integrationStore';

interface Playlist {
  id: string;
  name: string;
  images: Array<{ url: string }>;
  tracks: { total: number };
  uri: string;
}

interface CurrentTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: { images: Array<{ url: string }> };
  uri: string;
}

export function SpotifySettings() {
  const connection = useIntegrationStore((s) => s.connections['spotify']);
  const { updateSettings, disconnect: disconnectIntegration } = useIntegrationStore();

  const [isConnected, setIsConnected] = useState(connection.status === 'connected' && !!connection.accessToken);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<CurrentTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userPlaylists, setUserPlaylists] = useState<Playlist[]>([]);
  const [focusPlaylists, setFocusPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(
    (connection.settings?.selectedPlaylistId as string) || null
  );
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    connection.settings?.genres as string[] || []
  );
  const [volume, setVolume] = useState(50);
  const [activeTab, setActiveTab] = useState<'user' | 'focus'>('user');
  const [autoPlayOnTimer, setAutoPlayOnTimer] = useState(
    (connection.settings?.autoPlayOnTimer as boolean) ?? true
  );
  const [pauseOnTimerPause, setPauseOnTimerPause] = useState(
    (connection.settings?.pauseOnTimerPause as boolean) ?? true
  );

  const GENRES = ['Lo-fi', 'Classical', 'Ambient', 'Jazz', 'Electronic', 'Nature'];

  // Load playlists and current playback on connect
  useEffect(() => {
    if (isConnected && connection.accessToken) {
      loadPlaylists();
      loadCurrentPlayback();
    }
  }, [isConnected, connection.accessToken]);

  // Refresh playback every 5 seconds
  useEffect(() => {
    if (!isConnected || !connection.accessToken) return;

    const interval = setInterval(() => {
      loadCurrentPlayback();
    }, 5000);

    return () => clearInterval(interval);
  }, [isConnected, connection.accessToken]);

  const loadPlaylists = async () => {
    if (!connection.accessToken) return;

    try {
      setIsLoading(true);
      const [user, focus] = await Promise.all([
        spotifyService.getUserPlaylists(connection.accessToken),
        spotifyService.getFocusPlaylists(connection.accessToken),
      ]);
      setUserPlaylists(user);
      setFocusPlaylists(focus);
    } catch (error) {
      console.error('Error loading playlists:', error);
      toast.error('Failed to load playlists');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCurrentPlayback = async () => {
    if (!connection.accessToken) return;

    try {
      const playback = await spotifyService.getCurrentPlayback(connection.accessToken);
      if (playback) {
        setIsPlaying(playback.is_playing);
        if (playback.current_track) {
          setCurrentTrack(playback.current_track);
        }
        if (playback.device?.volume_percent !== undefined) {
          setVolume(playback.device.volume_percent);
        }
      }
    } catch (error) {
      console.error('Error loading playback:', error);
    }
  };

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      spotifyService.initiateAuth();
    } catch (error) {
      console.error('Error initiating auth:', error);
      toast.error('Failed to connect to Spotify');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    spotifyService.disconnect();
    setIsConnected(false);
    setCurrentTrack(null);
    setUserPlaylists([]);
    setFocusPlaylists([]);
    setSelectedPlaylistId(null);
    toast.success('Disconnected from Spotify');
  };

  const handlePlayPause = async () => {
    if (!connection.accessToken) return;

    try {
      if (isPlaying) {
        await spotifyService.pause(connection.accessToken);
        setIsPlaying(false);
      } else {
        await spotifyService.play(connection.accessToken);
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
      toast.error('Failed to toggle playback');
    }
  };

  const handleVolumeChange = async (newVolume: number) => {
    setVolume(newVolume);

    if (!connection.accessToken) return;

    try {
      await spotifyService.setVolume(connection.accessToken, newVolume);
    } catch (error) {
      console.error('Error setting volume:', error);
      toast.error('Failed to set volume');
    }
  };

  const handlePlaylistSelect = (playlistId: string) => {
    setSelectedPlaylistId(playlistId);
    updateSettings('spotify', {
      selectedPlaylistId,
    });
    toast.success('Playlist selected');
  };

  const handleGenreToggle = (genre: string) => {
    const updated = selectedGenres.includes(genre)
      ? selectedGenres.filter((g) => g !== genre)
      : [...selectedGenres, genre];
    setSelectedGenres(updated);
    updateSettings('spotify', {
      genres: updated,
    });
  };

  const handleAutoPlayToggle = () => {
    const newValue = !autoPlayOnTimer;
    setAutoPlayOnTimer(newValue);
    updateSettings('spotify', {
      autoPlayOnTimer: newValue,
    });
  };

  const handlePauseOnTimerToggle = () => {
    const newValue = !pauseOnTimerPause;
    setPauseOnTimerPause(newValue);
    updateSettings('spotify', {
      pauseOnTimerPause: newValue,
    });
  };

  const selectedPlaylist = [
    ...userPlaylists,
    ...focusPlaylists,
  ].find((p) => p.id === selectedPlaylistId);

  const displayPlaylists = activeTab === 'user' ? userPlaylists : focusPlaylists;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {!isConnected ? (
        // Disconnected UI
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-8 text-center"
        >
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-green-600/20 p-4">
              <svg
                className="h-12 w-12 text-green-500"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm5.5 17.5c-1.5 1.5-3.6 2.5-6 2.5s-4.5-1-6-2.5c-.5-.5-.5-1.5 0-2s1.5-.5 2 0c1 1 2.5 1.5 4 1.5s3-0.5 4-1.5c0.5-0.5 1.5-0.5 2 0s0.5 1.5 0 2zm-5.5-5c-0.8 0-1.5-0.7-1.5-1.5s0.7-1.5 1.5-1.5 1.5 0.7 1.5 1.5-0.7 1.5-1.5 1.5z" />
              </svg>
            </div>
          </div>

          <h3 className="mb-2 text-2xl font-bold text-white">Connect Spotify</h3>
          <p className="mb-8 text-slate-400">
            Integrate your favorite music to focus better with curated playlists
          </p>

          <ul className="mb-8 space-y-2 text-left">
            {[
              'Auto-play focus playlists on timer start',
              'Pause music when you pause the timer',
              'Control volume from HabitFlow',
              'Select from your playlists or discover focus playlists',
            ].map((feature, i) => (
              <li key={i} className="flex items-center text-slate-300">
                <span className="mr-3 flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white">
                  ✓
                </span>
                {feature}
              </li>
            ))}
          </ul>

          <button
            onClick={handleConnect}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition-all hover:bg-green-700 disabled:opacity-50"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0z" />
            </svg>
            {isLoading ? 'Connecting...' : 'Connect with Spotify'}
          </button>
        </motion.div>
      ) : (
        // Connected UI
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Connection Status */}
          <div className="flex items-center gap-3 rounded-2xl bg-slate-800/50 p-4">
            <div className="flex h-3 w-3 items-center justify-center rounded-full bg-green-500" />
            <span className="text-sm font-medium text-slate-300">
              Connected to Spotify
            </span>
          </div>

          {/* Current Playback Card */}
          <AnimatePresence mode="wait">
            {currentTrack && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-4"
              >
                <div className="flex gap-4">
                  <div className="relative h-20 w-20 flex-shrink-0 rounded-lg bg-slate-700">
                    {currentTrack.album?.images[0]?.url ? (
                      <img
                        src={currentTrack.album.images[0].url}
                        alt={currentTrack.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="material-symbols-outlined text-slate-500">
                          music_note
                        </span>
                      </div>
                    )}
                    {isPlaying && (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                        }}
                        className="absolute inset-0 rounded-lg border-2 border-green-500"
                      />
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="line-clamp-2 font-semibold text-white">
                      {currentTrack.name}
                    </p>
                    <p className="text-sm text-slate-400">
                      {currentTrack.artists[0]?.name}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={handlePlayPause}
                        className="inline-flex items-center gap-1 rounded-lg bg-green-600/20 px-3 py-1 text-sm font-medium text-green-400 transition-all hover:bg-green-600/30"
                      >
                        <span className="material-symbols-outlined text-base">
                          {isPlaying ? 'pause' : 'play_arrow'}
                        </span>
                        {isPlaying ? 'Pause' : 'Play'}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Playlist Selector */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl bg-slate-800/50 p-6"
          >
            <h4 className="mb-4 font-semibold text-white">Select Playlist</h4>

            {/* Tabs */}
            <div className="mb-4 flex gap-2 rounded-lg bg-slate-700/50 p-1">
              {['user', 'focus'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as 'user' | 'focus')}
                  className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                    activeTab === tab
                      ? 'bg-green-600 text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {tab === 'user' ? 'Your Playlists' : 'Focus Playlists'}
                </button>
              ))}
            </div>

            {/* Playlist Dropdown */}
            {displayPlaylists.length > 0 ? (
              <div className="space-y-2">
                <select
                  value={selectedPlaylistId || ''}
                  onChange={(e) => handlePlaylistSelect(e.target.value)}
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:border-green-600 focus:outline-none"
                >
                  <option value="">Choose a playlist...</option>
                  {displayPlaylists.map((playlist) => (
                    <option key={playlist.id} value={playlist.id}>
                      {playlist.name} ({playlist.tracks.total} tracks)
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <p className="text-sm text-slate-400">
                {isLoading ? 'Loading playlists...' : 'No playlists found'}
              </p>
            )}

            {/* Selected Playlist Display */}
            {selectedPlaylist && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 rounded-lg border border-green-600/30 bg-green-600/5 p-3"
              >
                <div className="flex items-center gap-3">
                  {selectedPlaylist.images[0]?.url && (
                    <img
                      src={selectedPlaylist.images[0].url}
                      alt={selectedPlaylist.name}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <p className="font-semibold text-white">{selectedPlaylist.name}</p>
                    <p className="text-sm text-slate-400">
                      {selectedPlaylist.tracks.total} tracks
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Genre Preferences */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl bg-slate-800/50 p-6"
          >
            <h4 className="mb-4 font-semibold text-white">Genre Preferences</h4>
            <div className="flex flex-wrap gap-2">
              {GENRES.map((genre) => (
                <motion.button
                  key={genre}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleGenreToggle(genre)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    selectedGenres.includes(genre)
                      ? 'bg-green-600 text-white'
                      : 'border border-slate-600 text-slate-300 hover:border-green-600 hover:text-white'
                  }`}
                >
                  {genre}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Volume Control */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl bg-slate-800/50 p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <h4 className="font-semibold text-white">Volume</h4>
              <span className="text-sm text-slate-400">{volume}%</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-slate-400">
                volume_mute
              </span>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="flex-1 cursor-pointer accent-green-600"
              />
              <span className="material-symbols-outlined text-slate-400">
                volume_up
              </span>
            </div>
          </motion.div>

          {/* Automation Toggles */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="space-y-3 rounded-2xl bg-slate-800/50 p-6"
          >
            <h4 className="font-semibold text-white">Automation</h4>

            {/* Auto-play toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-slate-400">
                  play_arrow
                </span>
                <label className="text-sm font-medium text-slate-300">
                  Auto-play on timer start
                </label>
              </div>
              <button
                onClick={handleAutoPlayToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  autoPlayOnTimer ? 'bg-green-600' : 'bg-slate-600'
                }`}
              >
                <motion.span
                  layout
                  className="inline-block h-5 w-5 rounded-full bg-white"
                  animate={{ x: autoPlayOnTimer ? 20 : 2 }}
                />
              </button>
            </div>

            {/* Pause on timer pause toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-slate-400">
                  pause
                </span>
                <label className="text-sm font-medium text-slate-300">
                  Pause on timer pause
                </label>
              </div>
              <button
                onClick={handlePauseOnTimerToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  pauseOnTimerPause ? 'bg-green-600' : 'bg-slate-600'
                }`}
              >
                <motion.span
                  layout
                  className="inline-block h-5 w-5 rounded-full bg-white"
                  animate={{ x: pauseOnTimerPause ? 20 : 2 }}
                />
              </button>
            </div>
          </motion.div>

          {/* Disconnect Button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={handleDisconnect}
            className="w-full rounded-lg border border-red-600/30 bg-red-600/10 px-4 py-2 font-medium text-red-400 transition-all hover:bg-red-600/20"
          >
            Disconnect Spotify
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
}
