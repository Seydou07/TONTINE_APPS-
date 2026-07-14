interface Alert {
  id: string;
  type: "warning" | "success" | "error" | "info";
  title: string;
  message: string;
  timestamp: string;
}

export function AlertsSection({ alerts }: { alerts: Alert[] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">
        Alertes Récentes
      </h3>
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <p className="text-slate-500">Aucune alerte récente.</p>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-slate-50"
            >
              <div className={`w-2 h-2 rounded-full mt-2 ${
                alert.type === "warning" ? "bg-yellow-500" :
                alert.type === "success" ? "bg-green-500" :
                alert.type === "error" ? "bg-red-500" : "bg-blue-500"
              }`} />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-800">
                  {alert.title}
                </p>
                <p className="text-sm text-slate-600">{alert.message}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {new Date(alert.timestamp).toLocaleString("fr-FR")}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
