"use client";

const COLORS = [
  "from-indigo-500 to-violet-500",
  "from-sky-500 to-blue-500",
  "from-emerald-500 to-teal-500",
  "from-rose-500 to-pink-500",
  "from-amber-500 to-orange-500",
  "from-fuchsia-500 to-purple-500",
];

export default function Avatar({ user, size = 40, online = false }) {
  const initials = `${user?.first_name?.[0] || ""}${
    user?.last_name?.[0] || ""
  }`.toUpperCase();
  const colorIdx = (user?.id || initials.charCodeAt(0) || 0) % COLORS.length;
  const showOnline = online || user?.is_online;

  return (
    <div className="relative inline-block shrink-0" style={{ width: size, height: size }}>
      {user?.avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={user.avatar}
          alt={initials}
          style={{ width: size, height: size }}
          className="rounded-full object-cover ring-2 ring-white dark:ring-gray-900"
        />
      ) : (
        <div
          style={{ width: size, height: size, fontSize: size / 2.5 }}
          className={`flex items-center justify-center rounded-full bg-gradient-to-br ${COLORS[colorIdx]} font-semibold text-white ring-2 ring-white dark:ring-gray-900`}
        >
          {initials || "?"}
        </div>
      )}
      {showOnline && (
        <span
          className="absolute bottom-0 right-0 block rounded-full border-2 border-white bg-emerald-500 dark:border-gray-900"
          style={{ width: size / 3.5, height: size / 3.5 }}
        />
      )}
    </div>
  );
}
