import type { User } from "@venega/types";
import { Search, Filter, Download } from "lucide-react";

export function UsersTable({ users }: { users: User[] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher un utilisateur..."
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50">
              <Filter className="w-4 h-4" />
              Filtrer
            </button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
            <Download className="w-4 h-4" />
            Exporter CSV
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-slate-500 border-b border-slate-200">
              <th className="px-6 py-3 font-medium">Utilisateur</th>
              <th className="px-6 py-3 font-medium">Téléphone</th>
              <th className="px-6 py-3 font-medium">KYC</th>
              <th className="px-6 py-3 font-medium">Réputation</th>
              <th className="px-6 py-3 font-medium">Inscrit le</th>
              <th className="px-6 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600">
                      {user.firstName?.[0]}
                      {user.lastName?.[0]}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-slate-500">{user.displayName}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {user.phoneNumber}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.kycStatus === "VERIFIED"
                      ? "bg-green-100 text-green-700"
                      : user.kycStatus === "PENDING"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                  }`}>
                    {user.kycStatus === "VERIFIED"
                      ? "Vérifié"
                      : user.kycStatus === "PENDING"
                        ? "En attente"
                        : "Non vérifié"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {user.reputationScore}/100
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                </td>
                <td className="px-6 py-4">
                  <button className="text-sm text-blue-600 hover:text-blue-700">
                    Voir détails
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
