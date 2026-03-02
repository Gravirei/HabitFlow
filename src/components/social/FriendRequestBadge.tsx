/**
 * FriendRequestBadge — Small notification count badge for pending friend requests.
 * Used in SocialBottomNav on the Friends tab.
 */

import { useSocialStore } from './socialStore'

export function FriendRequestBadge() {
  const count = useSocialStore((s) => s.getPendingRequestCount())

  if (count === 0) return null

  return (
    <span className="absolute -top-1 -right-1.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-[#0f1628]">
      {count > 9 ? '9+' : count}
    </span>
  )
}
