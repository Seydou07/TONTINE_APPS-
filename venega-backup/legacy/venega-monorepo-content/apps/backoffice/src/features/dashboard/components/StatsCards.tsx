import type { AdminStats } from "../../../../packages/types/src";

const statConfig = [
  { label: "Utilisateurs", key: "totalUsers" as const, color: "bg-blue-500" },
  { label: "Cercles", key: "totalCircles" as const, color: "bg-green-500" },
  { label: "Volume total", key: "totalVolumeXOF" as const, color: "bg-purple-500", format: "currency" as const },
  { label: "En attente KYC", key: "pendingKyc" as const, color: "bg-yellow-500" },
];

export function StatsCards({ stats }: { stats: AdminStats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statConfig.map((stat) => (
        <div
          key={stat.key}
          className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-800">
                {stat.format === "currency"
                  ? `${stats[stat.key].toLocaleString("fr-FR")} XOF`
                  : stats[stat.key].toLocaleString("fr-FR")}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${stat.color}`}>
              {stat.key === "totalUsers" && "👥"}
              {stat.key === "totalCircles" && "🔄"}
              {stat.key === "totalVolumeXOF" && "💰"}
              {stat.key === "pendingKyc" && "⏳"}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
