import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { formatCurrency, cn } from '../lib/utils';

// Reusing the logic from Dashboard but simplified for static rendering
export const ReportTemplate = ({ 
  data, 
  monthStr, 
  graphData, 
  totalRevenus, 
  totalDepenses, 
  epargne,
  currency = 'CHF'
}: any) => {
  const solde = totalRevenus - totalDepenses;

  return (
    <div id="pdf-report" className="bg-white p-8 w-[210mm] min-h-[297mm] mx-auto text-gray-900 space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rapport Mensuel</h1>
          <p className="text-gray-500 capitalize">{format(new Date(monthStr), 'MMMM yyyy', { locale: fr })}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400">Généré le</div>
          <div className="font-medium">{format(new Date(), 'dd/MM/yyyy HH:mm')}</div>
        </div>
      </div>

      {/* KPIS */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
          <div className="text-xs text-gray-500 uppercase font-bold mb-1">Revenus</div>
          <div className="text-xl font-bold text-[var(--vert-succes)]">{formatCurrency(totalRevenus, currency)}</div>
        </div>
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
          <div className="text-xs text-gray-500 uppercase font-bold mb-1">Dépenses</div>
          <div className="text-xl font-bold text-[var(--orange-depenses)]">{formatCurrency(totalDepenses, currency)}</div>
        </div>
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
          <div className="text-xs text-gray-500 uppercase font-bold mb-1">Solde</div>
          <div className={cn("text-xl font-bold", solde >= 0 ? "text-blue-600" : "text-red-500")}>
            {formatCurrency(solde, currency)}
          </div>
        </div>
      </div>

      {/* GRAPH */}
      <div className="h-64 w-full bg-white border rounded-xl p-4">
        <h3 className="text-sm font-bold mb-4">Évolution 12 Mois</h3>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={graphData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenusPDF" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorDepensesPDF" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
            <Area type="monotone" dataKey="revenus" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenusPDF)" isAnimationActive={false} />
            <Area type="monotone" dataKey="depenses" stroke="#F59E0B" strokeWidth={2} fillOpacity={1} fill="url(#colorDepensesPDF)" isAnimationActive={false} />
            <Area type="monotone" dataKey="epargne" stroke="#3B82F6" strokeWidth={2} fillOpacity={0} strokeDasharray="5 5" isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* TABLEAU REVENUS */}
      <div>
        <h3 className="text-lg font-bold mb-2 text-[var(--vert-succes)]">Revenus</h3>
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Catégorie</th>
              <th className="p-2 text-right">Prévu</th>
              <th className="p-2 text-right">Réel</th>
              <th className="p-2 text-right">Écart</th>
            </tr>
          </thead>
          <tbody>
            {data.revenus.map((t: any) => (
              <tr key={t.id} className="border-b border-gray-50">
                <td className="p-2">{t.nom}</td>
                <td className="p-2 text-right text-gray-500">{formatCurrency(t.prevu, currency)}</td>
                <td className="p-2 text-right font-bold">{formatCurrency(t.reel, currency)}</td>
                <td className="p-2 text-right">{formatCurrency(t.reel - t.prevu, currency)}</td>
              </tr>
            ))}
            <tr className="font-bold bg-gray-50">
              <td className="p-2">TOTAL</td>
              <td className="p-2 text-right">{formatCurrency(data.revenus.reduce((acc: number, t: any) => acc + t.prevu, 0), currency)}</td>
              <td className="p-2 text-right text-[var(--vert-succes)]">{formatCurrency(totalRevenus, currency)}</td>
              <td className="p-2 text-right">{formatCurrency(data.revenus.reduce((acc: number, t: any) => acc + (t.reel - t.prevu), 0), currency)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* TABLEAU DEPENSES */}
      <div>
        <h3 className="text-lg font-bold mb-2 text-[var(--orange-depenses)]">Dépenses</h3>
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Catégorie</th>
              <th className="p-2 text-right">Prévu</th>
              <th className="p-2 text-right">Réel</th>
              <th className="p-2 text-right">Écart</th>
            </tr>
          </thead>
          <tbody>
            {data.depenses.map((t: any) => (
              <tr key={t.id} className="border-b border-gray-50">
                <td className="p-2">{t.nom}</td>
                <td className="p-2 text-right text-gray-500">{formatCurrency(t.prevu, currency)}</td>
                <td className="p-2 text-right font-bold">{formatCurrency(t.reel, currency)}</td>
                <td className="p-2 text-right">{formatCurrency(t.reel - t.prevu, currency)}</td>
              </tr>
            ))}
            <tr className="font-bold bg-gray-50">
              <td className="p-2">TOTAL</td>
              <td className="p-2 text-right">{formatCurrency(data.depenses.reduce((acc: number, t: any) => acc + t.prevu, 0), currency)}</td>
              <td className="p-2 text-right text-[var(--orange-depenses)]">{formatCurrency(totalDepenses, currency)}</td>
              <td className="p-2 text-right">{formatCurrency(data.depenses.reduce((acc: number, t: any) => acc + (t.reel - t.prevu), 0), currency)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="text-center text-xs text-gray-400 mt-8">
        Généré par BudgetPerso App
      </div>
    </div>
  );
};
