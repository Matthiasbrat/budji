import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { format, addMonths, subMonths, parseISO } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

// Types
export type Transaction = {
  id: string;
  date: string; // YYYY-MM-DD
  category: string; // Formerly 'nom'
  description: string;
  prevu: number;
  reel: number;
  type: 'revenus' | 'depenses';
  recurringId?: string;
};

export type Facture = {
  id: string;
  date: string;
  category: string;
  description: string;
  montant: number;
  isPaid: boolean;
  paidDate?: string;
  filePath?: string;
  echeance?: string;
  recurringId?: string;
  paidFromEnveloppeId?: string;
  paidFromEnveloppeName?: string;
};

export type RecurringTransaction = {
  id: string;
  name: string;
  category: string;
  type: 'revenus' | 'depenses' | 'factures';
  amount: number;
  filePath?: string;
};

export type EnvelopMouvement = {
  id: string;
  date: string;       // YYYY-MM-DD
  description: string;
  montant: number;    // positif = dépôt, négatif = retrait
};

export type Enveloppe = {
  id: string;
  nom: string;
  mouvements: EnvelopMouvement[];
};

export type MonthData = {
  revenus: Transaction[];
  depenses: Transaction[];
  factures: Facture[];
};

export type ThemeColors = {
  revenus: string;
  depenses: string;
  enveloppes: string;
  accent: string;
  resteAVivre: string;
};

export type KpiCardKey = 'revenus' | 'depenses' | 'factures' | 'resteAVivre' | 'epargne';

export type AppState = {
  mois_courant: string; // Format YYYY-MM
  objectif_epargne_mensuel: number;
  horizon_graph: number;
  categories: {
    revenus: string[];
    depenses: string[];
    factures: string[];
  };
  theme: ThemeColors;
  visibleKpiCards: KpiCardKey[];
  darkMode: boolean;
  currency: 'EUR' | 'CHF' | 'USD';
  backgroundGradient: string;
  donnees: Record<string, MonthData>;
  recurringTransactions: RecurringTransaction[];
  enveloppes: Enveloppe[];
  
  // Actions
  toggleDarkMode: () => void;
  setCurrency: (c: 'EUR' | 'CHF' | 'USD') => void;
  setBackgroundGradient: (id: string) => void;
  setMoisCourant: (mois: string) => void;
  nextMonth: () => void;
  prevMonth: () => void;
  setObjectifEpargne: (amount: number) => void;
  setThemeColor: (key: keyof ThemeColors, value: string) => void;
  setVisibleKpiCards: (cards: KpiCardKey[]) => void;
  addCategory: (type: 'revenus' | 'depenses' | 'factures', name: string) => void;
  deleteCategory: (type: 'revenus' | 'depenses' | 'factures', name: string) => void;
  reorderCategories: (type: 'revenus' | 'depenses' | 'factures', newOrder: string[]) => void;
  addTransaction: (mois: string, type: 'revenus' | 'depenses', transaction: Omit<Transaction, 'id' | 'type'>) => void;
  updateTransaction: (mois: string, type: 'revenus' | 'depenses', id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (mois: string, type: 'revenus' | 'depenses', id: string) => void;
  initMonth: (mois: string) => void;
  
  // Recurring Actions
  addRecurringTransaction: (transaction: Omit<RecurringTransaction, 'id'>) => void;
  updateRecurringTransaction: (id: string, updates: Partial<RecurringTransaction>) => void;
  deleteRecurringTransaction: (id: string) => void;
  applyRecurringTransactions: (mois: string) => void;

  // Envelopes Actions
  addEnveloppe: (nom: string) => void;
  deleteEnveloppe: (id: string) => void;
  addMouvement: (enveloppeId: string, mouvement: Omit<EnvelopMouvement, 'id'>) => void;
  deleteMouvement: (enveloppeId: string, mouvementId: string) => void;
  
  // Factures Actions
  addFacture: (mois: string, facture: Omit<Facture, 'id'>) => void;
  updateFacture: (mois: string, id: string, updates: Partial<Facture>) => void;
  deleteFacture: (mois: string, id: string) => void;
  toggleFacturePaid: (mois: string, id: string, enveloppeSource?: { id: string, nom: string }) => void;
};

// Initial State Helper
const getInitialMonthData = (): MonthData => ({
  revenus: [],
  depenses: [],
  factures: []
});

export const useBudgetStore = create<AppState>()(
  persist(
    (set, get) => ({
      mois_courant: format(new Date(), 'yyyy-MM'),
      objectif_epargne_mensuel: 0,
      horizon_graph: 12,
      categories: {
        revenus: ["Salaire principal", "Salaire secondaire", "Freelance"],
        depenses: ["Loyer", "Essence", "Assurance maladie", "Loisirs"],
        factures: ["Assurance", "Téléphone", "Internet", "Électricité"]
      },
      theme: {
        revenus: '#10B981',
        depenses: '#EF4444',
        enveloppes: '#8B5CF6',
        accent: '#3B82F6',
        resteAVivre: '#06B6D4',
      },
      visibleKpiCards: ['revenus', 'depenses', 'factures', 'resteAVivre', 'epargne'],
      darkMode: false,
      currency: 'CHF',
      backgroundGradient: 'none',
      donnees: {},
      recurringTransactions: [],
      enveloppes: [],

      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      setCurrency: (c) => set({ currency: c }),
      setBackgroundGradient: (id) => set({ backgroundGradient: id }),
      setMoisCourant: (mois) => set({ mois_courant: mois }),
      
      setThemeColor: (key, value) => set((state) => ({
        theme: { ...state.theme, [key]: value }
      })),

      setVisibleKpiCards: (cards) => set({ visibleKpiCards: cards }),

      nextMonth: () => {
        const current = parseISO(get().mois_courant + '-01');
        const next = addMonths(current, 1);
        const nextStr = format(next, 'yyyy-MM');
        get().initMonth(nextStr);
        set({ mois_courant: nextStr });
      },

      prevMonth: () => {
        const current = parseISO(get().mois_courant + '-01');
        const prev = subMonths(current, 1);
        const prevStr = format(prev, 'yyyy-MM');
        get().initMonth(prevStr);
        set({ mois_courant: prevStr });
      },

      setObjectifEpargne: (amount) => {
        set({ objectif_epargne_mensuel: amount });
        // Force a re-render of subscribers by creating a new object reference for donnees (optional but safe)
        set((state) => ({ donnees: { ...state.donnees } }));
      },

      addCategory: (type, name) => set((state) => ({
        categories: {
          ...state.categories,
          [type]: [name, ...state.categories[type]]
        }
      })),

      deleteCategory: (type, name) => set((state) => ({
        categories: {
          ...state.categories,
          [type]: state.categories[type].filter(c => c !== name)
        }
      })),

      reorderCategories: (type, newOrder) => set((state) => ({
        categories: {
          ...state.categories,
          [type]: newOrder
        }
      })),

      addTransaction: (mois, type, transaction) => set((state) => {
        const monthData = state.donnees[mois] || getInitialMonthData();
        return {
          donnees: {
            ...state.donnees,
            [mois]: {
              ...monthData,
              [type]: [...monthData[type], { ...transaction, id: uuidv4(), type }]
            }
          }
        };
      }),

      updateTransaction: (mois, type, id, updates) => set((state) => {
        const monthData = state.donnees[mois];
        if (!monthData) return state;

        return {
          donnees: {
            ...state.donnees,
            [mois]: {
              ...monthData,
              [type]: monthData[type].map(t => t.id === id ? { ...t, ...updates } : t)
            }
          }
        };
      }),

      deleteTransaction: (mois, type, id) => set((state) => {
        // Essayer dans le mois indiqué d'abord
        const monthData = state.donnees[mois];
        if (monthData && monthData[type].some(t => t.id === id)) {
          return {
            donnees: {
              ...state.donnees,
              [mois]: {
                ...monthData,
                [type]: monthData[type].filter(t => t.id !== id)
              }
            }
          };
        }

        // Fallback : chercher dans TOUS les mois
        const newDonnees = { ...state.donnees };
        for (const key of Object.keys(newDonnees)) {
          const md = newDonnees[key];
          if (md[type] && md[type].some(t => t.id === id)) {
            newDonnees[key] = {
              ...md,
              [type]: md[type].filter(t => t.id !== id)
            };
            return { donnees: newDonnees };
          }
        }

        return state;
      }),

      initMonth: (mois) => set((state) => {
        if (state.donnees[mois]) return state;
        return {
          donnees: {
            ...state.donnees,
            [mois]: getInitialMonthData()
          }
        };
      }),

      addRecurringTransaction: (transaction) => set((state) => ({
        recurringTransactions: [...state.recurringTransactions, { ...transaction, id: uuidv4() }]
      })),

      updateRecurringTransaction: (id, updates) => set((state) => ({
        recurringTransactions: state.recurringTransactions.map(t => t.id === id ? { ...t, ...updates } : t)
      })),

      deleteRecurringTransaction: (id) => set((state) => ({
        recurringTransactions: state.recurringTransactions.filter(t => t.id !== id)
      })),

      applyRecurringTransactions: (mois) => set((state) => {
        const monthData = state.donnees[mois] || getInitialMonthData();
        const existingRecurringIds = new Set([
          ...monthData.revenus.map(t => t.recurringId),
          ...monthData.depenses.map(t => t.recurringId),
          ...(monthData.factures || []).map(f => f.recurringId),
        ].filter(Boolean));

        const pending = state.recurringTransactions
          .filter(rt => !existingRecurringIds.has(rt.id));

        if (pending.length === 0) return state;

        const date = `${mois}-01`;

        const newRevenus = pending.filter(rt => rt.type === 'revenus').map(rt => ({
          id: uuidv4(), date, category: rt.category, description: rt.name,
          prevu: rt.amount, reel: rt.amount, type: 'revenus' as const, recurringId: rt.id
        }));

        const newDepenses = pending.filter(rt => rt.type === 'depenses').map(rt => ({
          id: uuidv4(), date, category: rt.category, description: rt.name,
          prevu: rt.amount, reel: rt.amount, type: 'depenses' as const, recurringId: rt.id
        }));

        const newFactures = pending.filter(rt => rt.type === 'factures').map(rt => ({
          id: uuidv4(), date, category: rt.category, description: rt.name,
          montant: rt.amount, isPaid: false, recurringId: rt.id,
          filePath: rt.filePath || undefined,
        }));

        return {
          donnees: {
            ...state.donnees,
            [mois]: {
              revenus: [...monthData.revenus, ...newRevenus],
              depenses: [...monthData.depenses, ...newDepenses],
              factures: [...(monthData.factures || []), ...newFactures],
            }
          }
        };
      }),

      addEnveloppe: (nom) => set((state) => ({
        enveloppes: [...state.enveloppes, { id: uuidv4(), nom, mouvements: [] }]
      })),

      deleteEnveloppe: (id) => set((state) => ({
        enveloppes: state.enveloppes.filter(e => e.id !== id)
      })),

      addMouvement: (enveloppeId, mouvement) => set((state) => ({
        enveloppes: state.enveloppes.map(e =>
          e.id === enveloppeId
            ? { ...e, mouvements: [...e.mouvements, { ...mouvement, id: uuidv4() }] }
            : e
        )
      })),

      deleteMouvement: (enveloppeId, mouvementId) => set((state) => ({
        enveloppes: state.enveloppes.map(e =>
          e.id === enveloppeId
            ? { ...e, mouvements: e.mouvements.filter(m => m.id !== mouvementId) }
            : e
        )
      })),

      addFacture: (mois, facture) => set((state) => {
        const monthData = state.donnees[mois] || getInitialMonthData();
        return {
          donnees: {
            ...state.donnees,
            [mois]: {
              ...monthData,
              factures: [...(monthData.factures || []), { ...facture, id: uuidv4() }]
            }
          }
        };
      }),

      updateFacture: (mois, id, updates) => set((state) => {
        const monthData = state.donnees[mois];
        if (!monthData) return state;
        return {
          donnees: {
            ...state.donnees,
            [mois]: {
              ...monthData,
              factures: (monthData.factures || []).map(f => f.id === id ? { ...f, ...updates } : f)
            }
          }
        };
      }),

      deleteFacture: (mois, id) => set((state) => {
        const monthData = state.donnees[mois];
        if (monthData && (monthData.factures || []).some(f => f.id === id)) {
          return {
            donnees: {
              ...state.donnees,
              [mois]: {
                ...monthData,
                factures: (monthData.factures || []).filter(f => f.id !== id)
              }
            }
          };
        }
        const newDonnees = { ...state.donnees };
        for (const key of Object.keys(newDonnees)) {
          const md = newDonnees[key];
          if ((md.factures || []).some(f => f.id === id)) {
            newDonnees[key] = { ...md, factures: (md.factures || []).filter(f => f.id !== id) };
            return { donnees: newDonnees };
          }
        }
        return state;
      }),

      toggleFacturePaid: (mois, id, enveloppeSource) => set((state) => {
        const monthData = state.donnees[mois];
        if (!monthData) return state;
        const facture = (monthData.factures || []).find(f => f.id === id);
        if (!facture) return state;
        let newEnveloppes = state.enveloppes;
        if (facture.isPaid && facture.paidFromEnveloppeId) {
          const envId = facture.paidFromEnveloppeId;
          newEnveloppes = state.enveloppes.map(env => {
            if (env.id !== envId) return env;
            return {
              ...env,
              mouvements: [
                ...env.mouvements,
                {
                  id: uuidv4(),
                  date: format(new Date(), 'yyyy-MM-dd'),
                  description: `Remboursement : ${facture.category}`,
                  montant: facture.montant,
                }
              ]
            };
          });
        }
        return {
          enveloppes: newEnveloppes,
          donnees: {
            ...state.donnees,
            [mois]: {
              ...monthData,
              factures: (monthData.factures || []).map(f => {
                if (f.id !== id) return f;
                if (f.isPaid) {
                  // Dépaiement : on supprime les champs liés à l'enveloppe
                  const { paidFromEnveloppeId, paidFromEnveloppeName, ...rest } = f;
                  return { ...rest, isPaid: false, paidDate: undefined };
                } else {
                  // Paiement
                  return {
                    ...f,
                    isPaid: true,
                    paidDate: format(new Date(), 'yyyy-MM-dd'),
                    ...(enveloppeSource ? {
                      paidFromEnveloppeId: enveloppeSource.id,
                      paidFromEnveloppeName: enveloppeSource.nom
                    } : {})
                  };
                }
              })
            }
          }
        };
      }),
    }),
    {
      name: 'budgetperso_v1',
      storage: createJSONStorage(() => localStorage),
      version: 4,
      migrate: (persistedState: any, version: number) => {
        if (version < 2 && persistedState.donnees) {
          Object.keys(persistedState.donnees).forEach(month => {
            const md = persistedState.donnees[month];
            if (md.revenus) md.revenus = md.revenus.filter((t: any) => t.id !== '1' && t.id !== '2');
            if (md.depenses) md.depenses = md.depenses.filter((t: any) => t.id !== '1' && t.id !== '2');
            if (md.revenus.length === 0 && md.depenses.length === 0) delete persistedState.donnees[month];
          });
        }
        if (version < 3) {
          if (persistedState.donnees) {
            Object.keys(persistedState.donnees).forEach(month => {
              if (!persistedState.donnees[month].factures) {
                persistedState.donnees[month].factures = [];
              }
            });
          }
          if (persistedState.categories && !persistedState.categories.factures) {
            persistedState.categories.factures = ["Assurance", "Téléphone", "Internet", "Électricité"];
          }
        }
        if (version < 4) {
          if (persistedState.theme && !persistedState.theme.resteAVivre) {
            persistedState.theme.resteAVivre = '#06B6D4';
          }
        }
        return persistedState;
      },
      onRehydrateStorage: () => (state) => {
        if (state && state.objectif_epargne_mensuel === 100000) {
          state.setObjectifEpargne(0);
        }
      }
    }
  )
);
