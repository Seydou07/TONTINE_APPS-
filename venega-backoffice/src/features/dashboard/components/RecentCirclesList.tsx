import type { Circle } from "@venega/types";
import { CircleType } from "@venega/types";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function RecentCirclesList({ circles }: { circles: Circle[] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">
            Derniers Cercles
          </h3>
          <Link
            href="/circles"
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            Voir tout <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
      <div className="divide-y divide-slate-200">
        {circles.slice(0, 5).map((circle) => (
          <div
            key={circle.id}
            className="px-6 py-4 flex items-center justify-between hover:bg-slate-50"
          >
            <div>
              <p className="font-medium text-slate-800">{circle.name}</p>
              <p className="text-sm text-slate-500">
                {circle.memberCount} membres • {circle.type === CircleType.TONTINE_ONLY ? "Tontine" : circle.type === CircleType.SOLIDARITY_ONLY ? "Solidarité" : "Hybride"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                Actif
              </span>
              <p className="font-medium text-slate-800">
                {circle.tontineAmount.toLocaleString("fr-FR")} XOF
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
