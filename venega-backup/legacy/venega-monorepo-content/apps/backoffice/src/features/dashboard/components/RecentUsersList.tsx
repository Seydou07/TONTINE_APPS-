import type { User } from "../../../../packages/types/src";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function RecentUsersList({ users }: { users: User[] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">
            Derniers Utilisateurs
          </h3>
          <Link
            href="/users"
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            Voir tout <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
      <div className="divide-y divide-slate-200">
        {users.slice(0, 5).map((user) => (
          <div
            key={user.id}
            className="px-6 py-4 flex items-center justify-between hover:bg-slate-50"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium text-slate-600">
                {user.firstName?.[0]}
                {user.lastName?.[0]}
              </div>
              <div>
                <p className="font-medium text-slate-800">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-sm text-slate-500">{user.phoneNumber}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                user.kycStatus === "VERIFIED"
                  ? "bg-green-100 text-green-700"
                  : user.kycStatus === "PENDING"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
              }`}>
                KYC {user.kycStatus === "VERIFIED" ? "Vérifié" : user.kycStatus === "PENDING" ? "En attente" : "Non vérifié"}
              </span>
              <span className="text-xs text-slate-400">
                Score: {user.reputationScore}/100
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
