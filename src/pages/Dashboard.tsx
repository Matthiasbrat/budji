import React, { useEffect, useState, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useBudgetStore, Transaction, Enveloppe, EnvelopMouvement, Facture, KpiCardKey } from '../store/useBudgetStore';
import { formatCurrency, cn } from '../lib/utils';
import { Menu, Plus, ArrowLeft, ArrowRight, Search, Filter, ChevronDown, ChevronRight, TrendingUp, TrendingDown, Wallet, Target, MoreHorizontal, Edit2, Trash2, X, Settings, ArrowUpCircle, ArrowDownCircle, Calendar, Repeat, FileText, Check, Download, Sun, Moon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { format, parseISO, subMonths, startOfMonth, endOfMonth, isSameMonth, addMonths, setYear, setMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';
import LogoPng from '../assets/logo.png';
import { useToastStore } from '../store/useToastStore';
import { GRADIENTS } from '../data/gradients';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

const COULEURS_CAT = [
  '#A8D8C8',  // vert menthe pastel
  '#A8C4E8',  // bleu ciel pastel
  '#F0A8A8',  // rose saumon pastel
  '#C8A8E8',  // lavande pastel
  '#F0D0A0',  // pêche pastel
  '#A8D8E8',  // turquoise pastel
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { 
    mois_courant, 
    donnees, 
    initMonth,
    nextMonth,
    prevMonth,
    setMoisCourant,
    categories,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    recurringTransactions,
    applyRecurringTransactions,
    enveloppes,
    addEnveloppe,
    deleteEnveloppe,
    addMouvement,
    deleteMouvement,
    addCategory,
    theme,
    setThemeColor,
    addFacture,
    updateFacture,
    deleteFacture,
    toggleFacturePaid,
    visibleKpiCards,
    setVisibleKpiCards,
    objectif_epargne_mensuel,
    setObjectifEpargne,
    darkMode,
    toggleDarkMode,
    backgroundGradient,
    setBackgroundGradient,
    currency,
    setCurrency,
  } = useBudgetStore();
  const { showToast } = useToastStore();

  // Dark mode color palette
  const dk = {
    // Page background
    pageBg: darkMode ? '#0F1117' : '#F0F2F5',
    // Cards & containers
    cardBg: darkMode ? 'rgba(30,32,45,.95)' : 'white',
    cardBgAlt: darkMode ? 'rgba(30,32,45,.80)' : 'rgba(255,255,255,.55)',
    cardBorder: darkMode ? '1px solid rgba(255,255,255,.08)' : '1px solid rgba(255,255,255,.75)',
    cardShadow: darkMode ? '0 8px 32px rgba(0,0,0,.30)' : '6px 6px 20px rgba(0,0,0,.07), -6px -6px 16px rgba(255,255,255,.90)',
    // Header
    headerBg: darkMode ? 'rgba(15,17,23,.90)' : 'rgba(255,255,255,.65)',
    headerBgDanger: darkMode ? 'rgba(60,20,20,.90)' : 'rgba(248,220,220,.45)',
    headerBorder: darkMode ? '1px solid rgba(255,255,255,.06)' : '1px solid rgba(255,255,255,.50)',
    headerBorderDanger: darkMode ? '1px solid rgba(255,100,100,.20)' : '1px solid rgba(255,200,200,.60)',
    // Text
    textPrimary: darkMode ? '#E8EAF0' : '#1A1F3C',
    textSecondary: darkMode ? '#8892A8' : '#5A6A8A',
    textMuted: darkMode ? '#5A6278' : '#8896A8',
    textLight: darkMode ? '#484E62' : '#AAAAAA',
    textTable: darkMode ? '#B0B8C8' : '#3D4A5C',
    textTableMuted: darkMode ? '#6B7590' : '#8896A8',
    // Input & toolbar
    inputBg: darkMode ? 'rgba(255,255,255,.06)' : 'rgba(255,255,255,.35)',
    inputBorder: darkMode ? '1px solid rgba(255,255,255,.10)' : '1px solid rgba(255,255,255,.50)',
    toolbarBg: darkMode ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.04)',
    activeTabBg: darkMode ? 'rgba(255,255,255,.12)' : 'white',
    activeTabColor: darkMode ? '#E8EAF0' : '#3D4A5C',
    activeTabShadow: darkMode ? '0 1px 4px rgba(0,0,0,.30)' : '0 1px 4px rgba(0,0,0,.08)',
    // Table
    tableBorderColor: darkMode ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.06)',
    tableHeaderBg: darkMode ? 'rgba(255,255,255,.04)' : undefined,
    tableHover: darkMode ? 'rgba(255,255,255,.04)' : 'rgba(0,0,0,.02)',
    tableStripeBg: darkMode ? 'rgba(255,255,255,.03)' : '#F9FAFB',
    // Sidebar
    sidebarCardBg: darkMode ? 'rgba(30,32,45,.90)' : 'rgba(220,238,248,.35)',
    sidebarBorder: darkMode ? '1px solid rgba(255,255,255,.08)' : '1px solid rgba(255,255,255,.80)',
    sidebarShadow: darkMode ? '0 8px 32px rgba(0,0,0,.30)' : '0 8px 32px rgba(100,150,200,.15), inset 0 1px 0 rgba(255,255,255,.60)',
    // Buttons
    btnBg: darkMode ? 'rgba(255,255,255,.08)' : 'rgba(255,255,255,.70)',
    btnColor: darkMode ? '#B0B8C8' : '#5A6A8A',
    btnBorder: darkMode ? '1px solid rgba(255,255,255,.10)' : '1px solid rgba(100,130,200,.20)',
    // Modal
    modalBg: darkMode ? '#1E2030' : 'white',
    modalOverlay: darkMode ? 'rgba(0,0,0,.70)' : 'rgba(0,0,0,.40)',
    // Dropdown / menu
    dropdownBg: darkMode ? '#1E2030' : 'white',
    dropdownBorder: darkMode ? '1px solid rgba(255,255,255,.10)' : '1px solid rgba(0,0,0,.08)',
    dropdownHover: darkMode ? 'rgba(255,255,255,.06)' : undefined,
    // Banner
    bannerBg: darkMode ? 'rgba(40,50,80,.50)' : 'rgba(180,200,230,.20)',
    bannerBorder: darkMode ? '1px solid rgba(100,130,200,.15)' : '1px solid rgba(180,200,230,.25)',
    // KPI card neumorphism override for dark
    kpiShadowSuffix: darkMode ? ', 0 0 0 rgba(255,255,255,0)' : ', -6px -6px 16px rgba(255,255,255,.90)',
    kpiBorderTop: darkMode ? '1px solid rgba(255,255,255,.08)' : '1px solid rgba(255,255,255,.75)',
    // Misc
    divider: darkMode ? 'rgba(255,255,255,.06)' : '#F4F6FA',
    positiveColor: darkMode ? '#34D399' : '#4A8C6A',
    negativeColor: darkMode ? '#F87171' : '#C0626A',
  };

  const currentGradient = GRADIENTS.find(g => g.id === backgroundGradient);
  const pageBgStyle = (currentGradient && currentGradient.gradient !== 'none')
    ? currentGradient.gradient
    : (dk.pageBg || '#F0F2F5');

  // Calcule automatiquement si le texte doit être blanc ou noir
  // selon la luminosité du fond — garantit la lisibilité quelle que soit la couleur choisie
  const getTextColor = (hexColor: string): string => {
    if (!hexColor) return '#FFFFFF';
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    // Formule luminance relative WCAG
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.55 ? '#111827' : '#FFFFFF';
  };

  // Génère les nuances de couleur pour une carte KPI à partir d'une couleur hex
  // Conserve le design dégradé/neumorphisme existant, seule la teinte change
  const generateCardColors = (hex: string) => {
    if (!hex) hex = '#06B6D4';
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    // Fond dégradé : versions claires de la couleur
    const bgStartR = Math.min(r + 110, 248);
    const bgStartG = Math.min(g + 110, 248);
    const bgStartB = Math.min(b + 110, 248);
    const bgEndR = Math.min(r + 70, 235);
    const bgEndG = Math.min(g + 70, 235);
    const bgEndB = Math.min(b + 70, 235);
    const bgStart = `rgb(${bgStartR}, ${bgStartG}, ${bgStartB})`;
    const bgEnd = `rgb(${bgEndR}, ${bgEndG}, ${bgEndB})`;
    // Luminance du FOND (moyenne des deux extrêmes du dégradé) pour décider noir ou blanc
    const avgR = (bgStartR + bgEndR) / 2;
    const avgG = (bgStartG + bgEndG) / 2;
    const avgB = (bgStartB + bgEndB) / 2;
    const bgLuminance = (0.299 * avgR + 0.587 * avgG + 0.114 * avgB) / 255;
    // Teinte subtile : 12% de la couleur choisie mélangée dans le noir ou blanc
    const tint = 0.28;
    const isDark = bgLuminance < 0.55;
    // Si fond sombre → texte blanc teinté ; si fond clair → texte noir teinté
    const textMain = isDark
      ? `rgb(${Math.round(240 + r * tint - 240 * tint)}, ${Math.round(240 + g * tint - 240 * tint)}, ${Math.round(240 + b * tint - 240 * tint)})`
      : `rgb(${Math.round(15 + r * tint)}, ${Math.round(15 + g * tint)}, ${Math.round(15 + b * tint)})`;
    const textLabel = isDark
      ? `rgb(${Math.round(200 + r * tint - 200 * tint)}, ${Math.round(200 + g * tint - 200 * tint)}, ${Math.round(200 + b * tint - 200 * tint)})`
      : `rgb(${Math.round(80 + r * tint)}, ${Math.round(80 + g * tint)}, ${Math.round(80 + b * tint)})`;
    // Ombre
    const shadow = `rgba(${r}, ${g}, ${b}, 0.25)`;
    const shadowHover = `rgba(${r}, ${g}, ${b}, 0.15)`;
    return { bgStart, bgEnd, textMain, textLabel, shadow, shadowHover };
  };

  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');
  const [payFactureModal, setPayFactureModal] = useState<{ factureId: string, mois: string } | null>(null);
  const [kpiPanelOpen, setKpiPanelOpen] = useState(false);
  const [isGhostHovered, setIsGhostHovered] = useState(false);
  const [epargneEditing, setEpargneEditing] = useState(false);
  const [epargneInput, setEpargneInput] = useState('');
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [gradientWheelOpen, setGradientWheelOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const [isRecurringImportOpen, setIsRecurringImportOpen] = useState(false);
  const [selectedRecurringIds, setSelectedRecurringIds] = useState<Set<string>>(new Set());

  // Date Picker Refs for Auto-Scroll
  const monthListRef = useRef<HTMLDivElement>(null);
  const yearListRef = useRef<HTMLDivElement>(null);


  // Ensure current month exists
  useEffect(() => {
    initMonth(mois_courant);
  }, [mois_courant, initMonth]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      if (e.key === 'ArrowLeft') prevMonth();
      if (e.key === 'ArrowRight') nextMonth();
      if (e.key === '+') setIsAddModalOpen(true);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevMonth, nextMonth]);

  // Data Preparation
  const currentYear = mois_courant.split('-')[0];
  
  const currentData = useMemo(() => {
    if (viewMode === 'month') {
      return donnees[mois_courant] || { revenus: [], depenses: [] };
    } else {
      // Aggregate all months of the year with deduplication by ID
      const uniqueRevenus = new Map<string, Transaction>();
      const uniqueDepenses = new Map<string, Transaction>();
      
      Object.keys(donnees).forEach(key => {
        // Strict format check YYYY-MM and year match
        if (/^\d{4}-\d{2}$/.test(key) && key.startsWith(currentYear)) {
          donnees[key].revenus.forEach(t => uniqueRevenus.set(t.id, t));
          donnees[key].depenses.forEach(t => uniqueDepenses.set(t.id, t));
        }
      });
      
      return { 
        revenus: Array.from(uniqueRevenus.values()), 
        depenses: Array.from(uniqueDepenses.values()) 
      };
    }
  }, [viewMode, mois_courant, donnees, currentYear]);



  // Merge and Sort Transactions
  const allTransactions = useMemo(() => {
    const revs = currentData.revenus.map(t => ({ 
      ...t, 
      category: t.category || (t as any).nom || 'Autre',
      description: t.description || '',
      prevu: t.prevu !== undefined ? t.prevu : t.reel,
      type: 'revenus' as const 
    }));
    const deps = currentData.depenses.map(t => ({ 
      ...t, 
      category: t.category || (t as any).nom || 'Autre',
      description: t.description || '',
      prevu: t.prevu !== undefined ? t.prevu : t.reel,
      type: 'depenses' as const 
    }));
    const facts = (currentData.factures || []).map(f => ({
      ...f,
      id: f.id,
      date: f.date,
      category: f.category || 'Autre',
      description: f.description || '',
      prevu: f.montant,
      reel: f.montant,
      type: 'factures' as const,
    }));
    return [...revs, ...deps, ...facts].sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });
  }, [currentData]);

  const totalRevenus = currentData.revenus.reduce((acc, curr) => acc + curr.reel, 0);
  const totalDepenses = currentData.depenses.reduce((acc, curr) => acc + curr.reel, 0);
  const totalFacturesPayees = (currentData.factures || [])
    .filter(f => f.isPaid && !f.paidFromEnveloppeId)
    .reduce((acc, f) => acc + f.montant, 0);
  const montantEpargne = objectif_epargne_mensuel;
  const resteAVivre = totalRevenus - totalDepenses - totalFacturesPayees - montantEpargne;
  const solde = resteAVivre; // solde utilisé pour le header rouge et santé financière
  
  const epargneAnnuelle = objectif_epargne_mensuel * 12;
  
  // Previous Period for Variation
  const prevData = useMemo(() => {
    if (viewMode === 'month') {
      const prevMonthStr = format(subMonths(parseISO(mois_courant + '-01'), 1), 'yyyy-MM');
      return donnees[prevMonthStr] || { revenus: [], depenses: [] };
    } else {
      // Previous Year
      const prevYear = (parseInt(currentYear) - 1).toString();
      const yearRevenus: Transaction[] = [];
      const yearDepenses: Transaction[] = [];
      Object.keys(donnees).forEach(key => {
        if (key.startsWith(prevYear)) {
          yearRevenus.push(...donnees[key].revenus);
          yearDepenses.push(...donnees[key].depenses);
        }
      });
      return { revenus: yearRevenus, depenses: yearDepenses };
    }
  }, [viewMode, mois_courant, donnees, currentYear]);

  const prevRevenus = prevData.revenus.reduce((acc, curr) => acc + curr.reel, 0);
  const prevDepenses = prevData.depenses.reduce((acc, curr) => acc + curr.reel, 0);
  const prevEpargne = prevRevenus - prevDepenses;

  // UI State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const datePickerButtonRef = useRef<HTMLButtonElement>(null);
  const [datePickerPos, setDatePickerPos] = useState({ top: 0, left: 0 });

  // Auto-scroll to selected date when picker opens
  useEffect(() => {
    if (isDatePickerOpen) {
      setTimeout(() => {
        monthListRef.current?.querySelector('[data-selected="true"]')?.scrollIntoView({ block: 'center', behavior: 'instant' });
        yearListRef.current?.querySelector('[data-selected="true"]')?.scrollIntoView({ block: 'center', behavior: 'instant' });
      }, 50);
    }
  }, [isDatePickerOpen]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'revenus' | 'depenses' | 'factures'>('all');
  const [factureFilter, setFactureFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [groupMode, setGroupMode] = useState<'list' | 'category'>('list');

  // Add Transaction Form State
  const [newTrans, setNewTrans] = useState({
    type: 'depenses' as 'revenus' | 'depenses' | 'factures',
    amount: '',
    category: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    filePath: '',
    isPaid: false,
  });
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [recurringOpen, setRecurringOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [inlineAddType, setInlineAddType] = useState<'revenus' | 'depenses' | null>(null);

  useEffect(() => {
    if (inlineAddType) {
      setNewTrans(prev => ({
        ...prev,
        type: inlineAddType
      }));
    }
  }, [inlineAddType]);

  const currentFactures = useMemo(() => {
    if (viewMode === 'month') {
      const md = donnees[mois_courant];
      return md?.factures || [];
    } else {
      const all: Facture[] = [];
      Object.keys(donnees).forEach(key => {
        if (/^\d{4}-\d{2}$/.test(key) && key.startsWith(currentYear)) {
          all.push(...(donnees[key].factures || []));
        }
      });
      return all;
    }
  }, [viewMode, mois_courant, donnees, currentYear]);

  const filteredFactures = useMemo(() => {
    let result = [...currentFactures];
    if (factureFilter === 'paid') result = result.filter(f => f.isPaid);
    if (factureFilter === 'unpaid') result = result.filter(f => !f.isPaid);
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      result = result.filter(f =>
        (f.category || '').toLowerCase().includes(s) ||
        (f.description || '').toLowerCase().includes(s)
      );
    }
    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [currentFactures, factureFilter, searchTerm]);



  const handleAddTransaction = () => {
    if (!newTrans.amount || !newTrans.category) {
      showToast('Montant et catégorie requis', 'error');
      return;
    }
    const montantReel = parseFloat(newTrans.amount);
    if (montantReel > 1000000) { showToast(`Montant maximum : 1 000 000 ${currency === 'CHF' ? 'CHF' : currency === 'USD' ? '$' : '€'}`, 'error'); return; }
    if (montantReel < 0) { showToast('Le montant doit être positif', 'error'); return; }

    if (newTrans.type === 'factures') {
      addFacture(mois_courant, {
        date: newTrans.date,
        category: newTrans.category,
        description: newTrans.description,
        montant: montantReel,
        isPaid: newTrans.isPaid,
        filePath: newTrans.filePath || undefined,
        echeance: (newTrans as any).echeance || undefined,
      });
      showToast('Facture ajoutée', 'success');
    } else {
      addTransaction(mois_courant, newTrans.type as 'revenus' | 'depenses', {
        date: newTrans.date,
        category: newTrans.category,
        description: newTrans.description,
        prevu: montantReel,
        reel: montantReel
      });
      showToast('Transaction ajoutée', 'success');
    }

    setIsAddModalOpen(false);
    setNewTrans({ type: 'depenses', amount: '', category: '', description: '', date: format(new Date(), 'yyyy-MM-dd'), filePath: '', isPaid: false });
  };

  // Filtered Transactions
  const filteredTransactions = allTransactions.filter(t => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        t.category.toLowerCase().includes(search) || 
        (t.description || '').toLowerCase().includes(search)
      );
    }
    return true;
  });

  const groupedByCategory = useMemo(() => {
    const map = new Map<string, { type: 'revenus' | 'depenses' | 'factures', totalPrevu: number, totalReel: number, transactions: typeof filteredTransactions }>();
    filteredTransactions.forEach(t => {
      const key = `${t.type}__${t.category}`;
      if (!map.has(key)) {
        map.set(key, { type: t.type as any, totalPrevu: 0, totalReel: 0, transactions: [] });
      }
      const entry = map.get(key)!;
      entry.totalPrevu += t.prevu || 0;
      entry.totalReel += t.reel;
      entry.transactions.push(t);
    });
    return Array.from(map.entries()).map(([key, val]) => ({
      key,
      category: key.split('__')[1],
      ...val
    }));
  }, [filteredTransactions]);

  // Chart Data (Expenses by Category) - REMOVED


  // Recurring Transactions Logic
  const pendingRecurring = useMemo(() => {
    if (viewMode === 'year') return [];
    const appliedIds = new Set([
      ...currentData.revenus.map(t => t.recurringId),
      ...currentData.depenses.map(t => t.recurringId),
      ...(currentFactures || []).map(f => f.recurringId),
    ].filter(Boolean));
    return recurringTransactions.filter(rt => !appliedIds.has(rt.id));
  }, [currentData, currentFactures, recurringTransactions, viewMode]);

  const pendingRecurringCount = pendingRecurring.length;
  const facturesAVenir = pendingRecurring
    .filter(rt => rt.type === 'factures')
    .reduce((acc, rt) => acc + rt.amount, 0);

  const facturesNonPayees = (currentFactures || []).filter(f => !f.isPaid);
  const totalFacturesNonPayees = facturesNonPayees.reduce((acc, f) => acc + f.montant, 0);

  const handleImportRecurring = () => {
    const toApply = pendingRecurring.filter(rt => selectedRecurringIds.has(rt.id));
    toApply.forEach(rt => {
      if (rt.type === 'factures') {
        addFacture(mois_courant, {
          date: `${mois_courant}-01`,
          category: rt.category,
          description: rt.name,
          montant: rt.amount,
          isPaid: false,
          recurringId: rt.id,
          filePath: rt.filePath || undefined,
        });
      } else {
        addTransaction(mois_courant, rt.type as 'revenus' | 'depenses', {
          date: `${mois_courant}-01`,
          category: rt.category,
          description: rt.name,
          prevu: rt.amount,
          reel: rt.amount,
          recurringId: rt.id
        } as any);
      }
    });
    showToast(`${toApply.length} élément(s) importé(s)`, 'success');
    setIsRecurringImportOpen(false);
  };

  const depensesParCategorie = useMemo(() => {
    const map = new Map<string, number>();
    currentData.depenses.forEach(t => {
      const cat = t.category || 'Autre';
      map.set(cat, (map.get(cat) || 0) + t.reel);
    });
    // Trier par montant décroissant, garder les 4 premières
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
  }, [currentData.depenses]);

  const exportPDF = async () => {
    setExportMenuOpen(false);
    // Helper : formate un nombre pour jsPDF (remplace les espaces insécables par des espaces normaux)
    const fmtPDF = (n: number, sign?: '+' | '-'): string => {
      const formatted = Math.abs(n).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/\s/g, ' ');
      const prefix = sign ? sign : '';
      const symbol = currency === 'CHF' ? 'CHF' : currency === 'USD' ? '$' : '€';
      return `${prefix}${formatted} ${symbol}`;
    };

    const period = viewMode === 'year' ? currentYear : format(parseISO(mois_courant + '-01'), 'MMMM yyyy', { locale: fr });

    // Construire toutes les transactions (revenus + dépenses + factures)
    const revenus = currentData.revenus;
    const depenses = currentData.depenses;
    const factures = currentFactures;

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let y = 20;

    // --- HEADER ---
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Bilan Budji', margin, y);
    y += 8;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 120, 120);
    const periodLabel = viewMode === 'year' ? `Année ${currentYear}` : `${period.charAt(0).toUpperCase() + period.slice(1)}`;
    doc.text(periodLabel, margin, y);
    doc.text(`Généré le ${format(new Date(), 'dd/MM/yyyy à HH:mm')}`, pageWidth - margin, y, { align: 'right' });
    y += 6;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    // --- KPI RÉSUMÉ ---
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text('Résumé', margin, y);
    y += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const kpiData = [
      ['Revenus', fmtPDF(totalRevenus)],
      ['Dépenses', fmtPDF(totalDepenses)],
      ['Factures payées', fmtPDF(totalFacturesPayees)],
      ['Épargne', fmtPDF(montantEpargne)],
      ['Reste à vivre', fmtPDF(resteAVivre)],
    ];

    kpiData.forEach(([label, value]) => {
      doc.setTextColor(100, 100, 100);
      doc.text(label, margin + 2, y);
      doc.setTextColor(30, 30, 30);
      doc.setFont('helvetica', 'bold');
      doc.text(value, pageWidth - margin, y, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      y += 6;
    });
    y += 6;

    // --- Helper pour dessiner un tableau ---
    const drawTable = (title: string, headers: string[], rows: string[][], colWidths: number[]) => {
      // Vérifier s'il faut une nouvelle page
      if (y > 250) { doc.addPage(); y = 20; }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(40, 40, 40);
      doc.text(title, margin, y);
      y += 7;

      // En-têtes
      doc.setFillColor(245, 245, 245);
      doc.rect(margin, y - 4, pageWidth - 2 * margin, 7, 'F');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 100, 100);
      let xPos = margin + 2;
      headers.forEach((h, i) => {
        if (i === headers.length - 1) {
          doc.text(h, pageWidth - margin - 2, y, { align: 'right' });
        } else {
          doc.text(h, xPos, y);
        }
        xPos += colWidths[i];
      });
      y += 5;

      // Lignes
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(9);
      rows.forEach((row) => {
        if (y > 275) { doc.addPage(); y = 20; }
        xPos = margin + 2;
        row.forEach((cell, i) => {
          if (i === row.length - 1) {
            doc.text(cell || '', pageWidth - margin - 2, y, { align: 'right' });
          } else {
            doc.text((cell || '').substring(0, 35), xPos, y);
          }
          xPos += colWidths[i];
        });
        y += 5;
      });
      y += 4;
    };

    // --- TABLEAU REVENUS ---
    if (revenus.length > 0) {
      const rows = revenus.map(t => [t.date, t.category, t.description || '–', fmtPDF(t.reel, '+')]);
      drawTable('Revenus', ['Date', 'Catégorie', 'Description', 'Montant'], rows, [30, 40, 60, 40]);
    }

    // --- TABLEAU DÉPENSES ---
    if (depenses.length > 0) {
      const rows = depenses.map(t => [t.date, t.category, t.description || '–', fmtPDF(t.reel, '-')]);
      drawTable('Dépenses', ['Date', 'Catégorie', 'Description', 'Montant'], rows, [30, 40, 60, 40]);
    }

    // --- TABLEAU FACTURES ---
    if (factures.length > 0) {
      const rows = factures.map(f => [f.date, f.category, f.description || '–', f.isPaid ? 'Payée' : 'Non payée', fmtPDF(f.montant)]);
      drawTable('Factures', ['Date', 'Catégorie', 'Description', 'Statut', 'Montant'], rows, [25, 35, 45, 25, 35]);
    }

    // --- FOOTER ---
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(180, 180, 180);
      doc.text(`Budji — Page ${i}/${pageCount}`, pageWidth / 2, 290, { align: 'center' });
    }

    const filename = viewMode === 'year' ? `bilan_${currentYear}.pdf` : `bilan_${mois_courant}.pdf`;
    doc.save(filename);
  };

  const exportXLSX = () => {
    setExportMenuOpen(false);
    const wb = XLSX.utils.book_new();

    // Feuille Résumé
    const summaryData = [
      ['Bilan Budji'],
      [viewMode === 'year' ? `Année ${currentYear}` : format(parseISO(mois_courant + '-01'), 'MMMM yyyy', { locale: fr })],
      [`Généré le ${format(new Date(), 'dd/MM/yyyy à HH:mm')}`],
      [],
      ['Indicateur', 'Montant'],
      ['Revenus', totalRevenus],
      ['Dépenses', totalDepenses],
      ['Factures payées', totalFacturesPayees],
      ['Épargne', montantEpargne],
      ['Reste à vivre', resteAVivre],
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    wsSummary['!cols'] = [{ wch: 20 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Résumé');

    // Feuille Revenus
    if (currentData.revenus.length > 0) {
      const revData = [
        ['Date', 'Catégorie', 'Description', 'Montant'],
        ...currentData.revenus.map(t => [t.date, t.category, t.description || '', t.reel])
      ];
      const wsRev = XLSX.utils.aoa_to_sheet(revData);
      wsRev['!cols'] = [{ wch: 12 }, { wch: 20 }, { wch: 30 }, { wch: 12 }];
      XLSX.utils.book_append_sheet(wb, wsRev, 'Revenus');
    }

    // Feuille Dépenses
    if (currentData.depenses.length > 0) {
      const depData = [
        ['Date', 'Catégorie', 'Description', 'Montant'],
        ...currentData.depenses.map(t => [t.date, t.category, t.description || '', t.reel])
      ];
      const wsDep = XLSX.utils.aoa_to_sheet(depData);
      wsDep['!cols'] = [{ wch: 12 }, { wch: 20 }, { wch: 30 }, { wch: 12 }];
      XLSX.utils.book_append_sheet(wb, wsDep, 'Dépenses');
    }

    // Feuille Factures
    if (currentFactures.length > 0) {
      const factData = [
        ['Date', 'Catégorie', 'Description', 'Montant', 'Statut', 'Échéance'],
        ...currentFactures.map(f => [f.date, f.category, f.description || '', f.montant, f.isPaid ? 'Payée' : 'Non payée', f.echeance || ''])
      ];
      const wsFact = XLSX.utils.aoa_to_sheet(factData);
      wsFact['!cols'] = [{ wch: 12 }, { wch: 20 }, { wch: 30 }, { wch: 12 }, { wch: 12 }, { wch: 12 }];
      XLSX.utils.book_append_sheet(wb, wsFact, 'Factures');
    }

    const filename = viewMode === 'year' ? `bilan_${currentYear}.xlsx` : `bilan_${mois_courant}.xlsx`;
    XLSX.writeFile(wb, filename);
  };

  return (
    <div
      className="min-h-screen font-sans pb-20"
      style={{
        '--color-revenus': theme.revenus,
        '--color-depenses': theme.depenses,
        '--color-enveloppes': theme.enveloppes,
        '--color-accent': theme.accent,
        backgroundImage: (pageBgStyle || '').startsWith('linear-gradient') ? pageBgStyle : 'none',
        backgroundColor: (pageBgStyle || '').startsWith('linear-gradient') ? 'transparent' : pageBgStyle,
        backgroundAttachment: 'fixed',
        color: dk.textPrimary,
        transition: 'background-image 0.3s ease, background-color 0.3s ease, color 0.3s ease',
      } as React.CSSProperties}
    >
      
      {/* RECURRING TRANSACTIONS BANNER */}
      <AnimatePresence>
        {pendingRecurringCount > 0 && viewMode === 'month' && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
            style={{
              background: dk.bannerBg,
              backdropFilter: 'blur(8px)',
              borderBottom: dk.bannerBorder,
            }}
          >
            <div className="max-w-[1600px] mx-auto px-3 sm:px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 font-medium text-sm" style={{ color: dk.textSecondary, fontWeight: 500 }}>
                <Repeat className="w-4 h-4" />
                <span>{pendingRecurringCount} transactions récurrentes <span className="hidden sm:inline">en attente pour {format(parseISO(mois_courant + '-01'), 'MMMM yyyy', { locale: fr })}</span></span>
              </div>
              <button 
                onClick={() => {
                  setSelectedRecurringIds(new Set(pendingRecurring.map(rt => rt.id)));
                  setIsRecurringImportOpen(true);
                }}
                className="px-4 py-1.5 rounded-lg text-xs font-bold transition-colors"
                style={{
                  background: dk.btnBg,
                  color: dk.btnColor,
                  border: dk.btnBorder,
                  backdropFilter: 'blur(4px)',
                }}
              >
                IMPORTER
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ZONE 1: TOP BAR */}
      <header style={{
        background: resteAVivre < 0 ? dk.headerBgDanger : dk.headerBg,
        backdropFilter: 'blur(12px)',
        borderBottom: resteAVivre < 0 ? dk.headerBorderDanger : dk.headerBorder,
        boxShadow: resteAVivre < 0 ? '0 8px 32px rgba(200,100,100,.12), inset 0 1px 0 rgba(255,255,255,.50)' : undefined,
        position: 'sticky',
        top: 0,
        zIndex: 10,
        transition: 'background 0.3s ease',
      }}>
        <div className="max-w-[1600px] mx-auto px-3 sm:px-6 py-4 flex items-center justify-between">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src={LogoPng} alt="Budji" style={{ height: 36, width: 'auto' }} />
            <span className="hidden sm:inline" style={{
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 800,
              fontSize: 18,
              color: dk.textPrimary,
              letterSpacing: '-0.02em'
            }}>Budji</span>
          </div>

          {/* Bouton Export */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Sélecteur de monnaie */}
            <div className="hidden sm:inline-flex relative">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as 'EUR' | 'CHF' | 'USD')}
                style={{
                  appearance: 'none',
                  padding: '8px 32px 8px 12px',
                  borderRadius: 10,
                  background: dk.btnBg,
                  color: dk.textPrimary,
                  fontSize: 13,
                  fontWeight: 700,
                  border: dk.btnBorder,
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value="CHF">CHF</option>
                <option value="EUR">EUR €</option>
                <option value="USD">USD $</option>
              </select>
              <svg
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={dk.textMuted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-xl transition-all"
              style={{
                background: dk.btnBg,
                border: dk.btnBorder,
                color: dk.btnColor,
                boxShadow: '0 2px 8px rgba(0,0,0,.06)',
              }}
              title={darkMode ? 'Mode clair' : 'Mode sombre'}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <div className="relative" ref={exportMenuRef}>
              <button
                onClick={() => setExportMenuOpen(!exportMenuOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                style={{
                  background: dk.btnBg,
                  color: dk.btnColor,
                  border: dk.btnBorder,
                  boxShadow: '0 2px 8px rgba(0,0,0,.06)',
                }}
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Exporter</span>
              </button>

              {exportMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-xl overflow-hidden z-50"
                  style={{
                    background: dk.dropdownBg,
                    boxShadow: '0 10px 40px rgba(0,0,0,.15)',
                    border: dk.dropdownBorder,
                  }}
                >
                  <div className="px-4 py-2.5" style={{ borderBottom: '1px solid rgba(0,0,0,.06)' }}>
                    <div className="text-xs font-bold uppercase tracking-wider" style={{ color: dk.textMuted }}>
                      {viewMode === 'year' ? `Bilan ${currentYear}` : `Bilan ${format(parseISO(mois_courant + '-01'), 'MMMM yyyy', { locale: fr })}`}
                    </div>
                  </div>
                  <button
                    onClick={exportPDF}
                    className="w-full px-4 py-3 text-left text-sm font-medium flex items-center gap-3 transition-colors"
                    style={{ color: dk.textTable }}
                  >
                    <FileText className="w-4 h-4" style={{ color: '#EF4444' }} />
                    Télécharger en PDF
                  </button>
                  <button
                    onClick={exportXLSX}
                    className="w-full px-4 py-3 text-left text-sm font-medium flex items-center gap-3 transition-colors"
                    style={{ color: dk.textTable }}
                  >
                    <FileText className="w-4 h-4" style={{ color: '#10B981' }} />
                    Télécharger en Excel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="p-3 sm:p-4 lg:p-6 max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 lg:gap-6">
        
        {/* BARRE DE NAVIGATION PÉRIODE */}
        <div className="lg:col-span-12 flex items-center justify-between rounded-2xl px-3 sm:px-5 py-3"
          style={{
            background: dk.cardBgAlt,
            backdropFilter: 'blur(20px)',
            border: dk.cardBorder,
            boxShadow: '0 4px 20px rgba(0,0,0,.06)',
          }}
        >
          {/* Toggle Mois / Année */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setViewMode('month')}
              className="text-xs sm:text-sm font-bold transition-all"
              style={viewMode === 'month' 
                ? { background: dk.activeTabBg, color: dk.activeTabColor, boxShadow: dk.activeTabShadow, borderRadius: 8, padding: '6px 10px' }
                : { color: dk.textMuted, background: 'none', padding: '6px 10px' }
              }
            >
              Mois
            </button>
            <button
              onClick={() => setViewMode('year')}
              className="text-xs sm:text-sm font-bold transition-all"
              style={viewMode === 'year'
                ? { background: dk.activeTabBg, color: dk.activeTabColor, boxShadow: dk.activeTabShadow, borderRadius: 8, padding: '6px 10px' }
                : { color: dk.textMuted, background: 'none', padding: '6px 10px' }
              }
            >
              Année
            </button>
          </div>

          {/* Navigation Date */}
          <div className="flex items-center gap-2 relative">
            <button
              onClick={() => {
                if (viewMode === 'month') prevMonth();
                else setMoisCourant(`${parseInt(currentYear) - 1}-${mois_courant.split('-')[1]}`);
              }}
              className="p-1.5 rounded-md transition-all"
              style={{ color: dk.textMuted }}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="relative">
              <button
                ref={datePickerButtonRef}
                onClick={() => {
                  if (!isDatePickerOpen && datePickerButtonRef.current) {
                    const rect = datePickerButtonRef.current.getBoundingClientRect();
                    setDatePickerPos({
                      top: rect.bottom + 8,
                      left: rect.left + rect.width / 2,
                    });
                  }
                  setIsDatePickerOpen(!isDatePickerOpen);
                }}
                className="px-5 py-1.5 min-w-[120px] sm:min-w-[160px] text-center capitalize flex items-center justify-center gap-2 rounded-md transition-all"
                style={{ color: dk.textPrimary, fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 15 }}
              >
                {viewMode === 'month'
                  ? format(parseISO(mois_courant + '-01'), 'MMMM yyyy', { locale: fr })
                  : currentYear
                }
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>

              {/* Date Picker Dropdown */}
              {isDatePickerOpen && createPortal(
                <>
                  <div 
                    className="fixed inset-0" 
                    style={{ zIndex: 9998 }} 
                    onClick={() => setIsDatePickerOpen(false)} 
                  />
                  <div
                    className={cn(
                      "rounded-xl p-4 flex gap-4",
                      viewMode === 'year' ? "w-[160px]" : "w-[320px]"
                    )}
                    style={{
                      position: 'fixed',
                      top: datePickerPos.top,
                      left: datePickerPos.left,
                      transform: 'translateX(-50%)',
                      zIndex: 9999,
                      background: dk.modalBg,
                      border: dk.cardBorder,
                      boxShadow: dk.cardShadow,
                    }}
                  >
                    {viewMode === 'month' && (
                      <div className="flex-1">
                        <div className="text-xs font-bold uppercase mb-2 px-2" style={{ color: dk.textMuted }}>Mois</div>
                        <div ref={monthListRef} className="grid grid-cols-1 gap-1 max-h-[200px] overflow-y-auto">
                          {Array.from({ length: 12 }).map((_, i) => {
                            const date = setMonth(new Date(), i);
                            const monthName = format(date, 'MMMM', { locale: fr });
                            const isSelected = parseInt(mois_courant.split('-')[1]) === i + 1;
                            return (
                              <button
                                key={i}
                                data-selected={isSelected || undefined}
                                onClick={() => {
                                  const newDate = setMonth(parseISO(mois_courant + '-01'), i);
                                  setMoisCourant(format(newDate, 'yyyy-MM'));
                                }}
                                className={cn(
                                  "text-left px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors",
                                  isSelected ? "bg-black text-white" : "hover:bg-gray-50/10"
                                )}
                                style={{ color: isSelected ? '#FFFFFF' : dk.textPrimary }}
                              >
                                {monthName}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    <div className={cn("flex-1", viewMode === 'month' && "border-l border-gray-100 pl-4")}>
                      <div className="text-xs font-bold text-gray-400 uppercase mb-2 px-2">Année</div>
                      <div ref={yearListRef} className="grid grid-cols-1 gap-1 max-h-[200px] overflow-y-auto">
                        {Array.from({ length: 81 }, (_, i) => 2020 + i).map((year) => {
                          const isSelected = parseInt(mois_courant.split('-')[0]) === year;
                          return (
                            <button
                              key={year}
                              data-selected={isSelected || undefined}
                              onClick={() => {
                                const newDate = setYear(parseISO(mois_courant + '-01'), year);
                                setMoisCourant(format(newDate, 'yyyy-MM'));
                                if (viewMode === 'year') setIsDatePickerOpen(false);
                              }}
                              className={cn(
                                "text-left px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                                isSelected ? "bg-black text-white" : "hover:bg-gray-50 text-gray-700"
                              )}
                            >
                              {year}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </>,
                document.body
              )}
            </div>

            <button
              onClick={() => {
                if (viewMode === 'month') nextMonth();
                else setMoisCourant(`${parseInt(currentYear) + 1}-${mois_courant.split('-')[1]}`);
              }}
              className="p-1.5 rounded-md transition-all"
              style={{ color: dk.textMuted }}
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Période affichée en clair */}
          <div className="hidden sm:block text-sm font-medium" style={{ color: dk.textMuted, fontSize: 13 }}>
            {viewMode === 'month'
              ? format(parseISO(mois_courant + '-01'), 'MMMM yyyy', { locale: fr })
              : `Année ${currentYear}`
            }
          </div>
        </div>

        {/* ZONE 2: KPI CARDS */}
        <div className="lg:col-span-12 flex flex-col sm:flex-row items-stretch gap-2 sm:gap-3 lg:gap-5 w-full">
          {/* Grille des cartes actives */}
          <div className={cn(
            "grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 lg:gap-5 flex-1 w-full",
            visibleKpiCards.length >= 4 && "sm:grid-cols-4 lg:grid-cols-4",
            visibleKpiCards.length === 5 && "sm:grid-cols-5 lg:grid-cols-5",
          )}>

            {/* Revenus */}
          {visibleKpiCards.includes('revenus') && (() => {
            const c = generateCardColors(theme.revenus);
            return (
            <div 
              className="sm:!p-6 lg:!p-8 sm:!flex-col sm:!justify-center sm:!items-center sm:!text-center sm:!min-h-[160px]"
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.02)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = 
                  `10px 10px 30px ${c.shadowHover}${darkMode ? '' : ', -6px -6px 16px rgba(255,255,255,.90)'}`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = 
                  `6px 6px 24px ${c.shadow}${darkMode ? '' : ', -6px -6px 16px rgba(255,255,255,.90)'}`;
              }}
              style={{
              background: `linear-gradient(135deg, ${c.bgStart} 0%, ${c.bgEnd} 100%)`,
              borderRadius: 20,
              padding: '16px',
              minHeight: 0,
              boxShadow: `6px 6px 24px ${c.shadow}${darkMode ? '' : ', -6px -6px 16px rgba(255,255,255,.90)'}`,
              borderTop: dk.kpiBorderTop,
              borderLeft: dk.kpiBorderTop,
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 10,
              textAlign: 'left',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              cursor: 'default'
            }}>
              <div className="sm:!text-[10px]" style={{
                fontSize: 8,
                fontWeight: 700, letterSpacing: '0.18em',
                textTransform: 'uppercase', color: c.textLabel,
              }}>Revenus</div>
              <div className="text-lg sm:text-2xl lg:text-3xl" style={{
                fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1,
                color: c.textMain, fontFamily: "'Nunito', sans-serif",
              }}>
                {formatCurrency(totalRevenus, currency)}
              </div>
            </div>
            );
          })()}

          {/* Dépenses */}
          {visibleKpiCards.includes('depenses') && (() => {
            const c = generateCardColors(theme.depenses);
            return (
            <div 
              className="sm:!p-6 lg:!p-8 sm:!flex-col sm:!justify-center sm:!items-center sm:!text-center sm:!min-h-[160px]"
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.02)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = 
                  `10px 10px 30px ${c.shadowHover}${darkMode ? '' : ', -6px -6px 16px rgba(255,255,255,.90)'}`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = 
                  `6px 6px 24px ${c.shadow}${darkMode ? '' : ', -6px -6px 16px rgba(255,255,255,.90)'}`;
              }}
              style={{
              background: `linear-gradient(135deg, ${c.bgStart} 0%, ${c.bgEnd} 100%)`,
              borderRadius: 20,
              padding: '16px',
              minHeight: 0,
              boxShadow: `6px 6px 24px ${c.shadow}${darkMode ? '' : ', -6px -6px 16px rgba(255,255,255,.90)'}`,
              borderTop: dk.kpiBorderTop,
              borderLeft: dk.kpiBorderTop,
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 10,
              textAlign: 'left',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              cursor: 'default'
            }}>
              <div className="sm:!text-[10px]" style={{
                fontSize: 8,
                fontWeight: 700, letterSpacing: '0.18em',
                textTransform: 'uppercase', color: c.textLabel,
              }}>Dépenses</div>
              <div className="text-lg sm:text-2xl lg:text-3xl" style={{
                fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1,
                color: c.textMain, fontFamily: "'Nunito', sans-serif",
              }}>
                {formatCurrency(totalDepenses, currency)}
              </div>
            </div>
            );
          })()}

          {/* Factures payées */}
          {visibleKpiCards.includes('factures') && (() => {
            const c = generateCardColors(theme.accent);
            return (
            <div 
              className="sm:!p-6 lg:!p-8 sm:!flex-col sm:!justify-center sm:!items-center sm:!text-center sm:!min-h-[160px]"
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.02)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = 
                  `10px 10px 30px ${c.shadowHover}${darkMode ? '' : ', -6px -6px 16px rgba(255,255,255,.90)'}`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = 
                  `6px 6px 24px ${c.shadow}${darkMode ? '' : ', -6px -6px 16px rgba(255,255,255,.90)'}`;
              }}
              style={{
              background: `linear-gradient(135deg, ${c.bgStart} 0%, ${c.bgEnd} 100%)`,
              borderRadius: 20,
              padding: '16px',
              minHeight: 0,
              boxShadow: `6px 6px 24px ${c.shadow}${darkMode ? '' : ', -6px -6px 16px rgba(255,255,255,.90)'}`,
              borderTop: dk.kpiBorderTop,
              borderLeft: dk.kpiBorderTop,
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 10,
              textAlign: 'left',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              cursor: 'default'
            }}>
              <div className="sm:!text-[10px]" style={{
                fontSize: 8,
                fontWeight: 700, letterSpacing: '0.18em',
                textTransform: 'uppercase', color: c.textLabel,
              }}>Factures payées</div>
              <div className="text-lg sm:text-2xl lg:text-3xl" style={{
                fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1,
                color: c.textMain, fontFamily: "'Nunito', sans-serif",
              }}>
                {formatCurrency(totalFacturesPayees, currency)}
              </div>
            </div>
            );
          })()}

          {/* Épargne */}
          {visibleKpiCards.includes('epargne') && (() => {
            const c = generateCardColors(theme.enveloppes);
            return (
            <div className="sm:!p-6 lg:!p-8 sm:!flex-col sm:!justify-center sm:!items-center sm:!text-center sm:!min-h-[160px]" style={{
              background: `linear-gradient(135deg, ${c.bgStart} 0%, ${c.bgEnd} 100%)`,
              borderRadius: 20,
              padding: '16px',
              minHeight: 0,
              position: 'relative',
              boxShadow: `6px 6px 24px ${c.shadow}${darkMode ? '' : ', -6px -6px 16px rgba(255,255,255,.90)'}`,
              borderTop: dk.kpiBorderTop,
              borderLeft: dk.kpiBorderTop,
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 10,
              textAlign: 'left',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              cursor: 'default',
            }}
            onMouseEnter={e => {
              if (epargneEditing) return;
              (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.02)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = `10px 10px 30px ${c.shadowHover}${darkMode ? '' : ', -6px -6px 16px rgba(255,255,255,.90)'}`;
            }}
            onMouseLeave={e => {
              if (epargneEditing) return;
              (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = `6px 6px 24px ${c.shadow}${darkMode ? '' : ', -6px -6px 16px rgba(255,255,255,.90)'}`;
            }}
            >
              <div className="sm:!text-[10px]" style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.18em',
                textTransform: 'uppercase', color: c.textLabel }}>Épargne</div>

              {epargneEditing ? (
                /* Mode édition — le contenu du formulaire d'édition reste IDENTIQUE */
                <div className="flex flex-col items-center gap-2 w-full px-4"
                  onClick={e => e.stopPropagation()}>
                  <div className="relative w-full">
                    <input
                      autoFocus
                      type="number"
                      min={0}
                      value={epargneInput}
                      onChange={e => setEpargneInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          const val = parseFloat(epargneInput);
                          if (!isNaN(val) && val >= 0) setObjectifEpargne(val);
                          setEpargneEditing(false);
                        }
                        if (e.key === 'Escape') setEpargneEditing(false);
                      }}
                      className="w-full text-center text-2xl font-black rounded-xl px-3 py-2 outline-none"
                      style={{
                        background: 'rgba(255,255,255,.50)',
                        border: `2px solid ${c.textMain}66`,
                        color: c.textMain,
                        fontFamily: "'Nunito', sans-serif",
                      }}
                      placeholder="0"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-black"
                      style={{ color: c.textLabel }}>{currency === 'CHF' ? 'CHF' : currency === 'USD' ? '$' : '€'}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const val = parseFloat(epargneInput);
                        if (!isNaN(val) && val >= 0) setObjectifEpargne(val);
                        setEpargneEditing(false);
                      }}
                      className="px-3 py-1 rounded-lg text-xs font-black text-white"
                      style={{ background: c.textMain }}>
                      ✓
                    </button>
                    <button
                      onClick={() => setEpargneEditing(false)}
                      className="px-3 py-1 rounded-lg text-xs font-black"
                      style={{ background: 'rgba(255,255,255,.50)', color: c.textLabel }}>
                      ✕
                    </button>
                  </div>
                </div>
              ) : (
                /* Mode affichage */
                <div className="flex items-center justify-end gap-2 sm:flex-col sm:items-center sm:gap-[10px] group/epargne cursor-pointer w-full"
                  onClick={() => {
                    setEpargneInput(String(objectif_epargne_mensuel));
                    setEpargneEditing(true);
                  }}>
                  {/* Crayon — visible uniquement sur mobile, à gauche du montant */}
                  <div className="sm:hidden opacity-50 text-[10px] font-bold"
                    style={{ color: c.textLabel }}>
                    ✎
                  </div>

                  {/* Montant — aligné à droite sur mobile */}
                  <div className="text-lg sm:text-2xl lg:text-3xl" style={{ fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1,
                    color: c.textMain, fontFamily: "'Nunito', sans-serif" }}>
                    {formatCurrency(viewMode === 'month' ? montantEpargne : montantEpargne * 12, currency)}
                  </div>

                  {/* Indication discrète au hover — desktop seulement */}
                  <div className="hidden sm:block opacity-0 group-hover/epargne:opacity-100 transition-opacity duration-200
                    text-[10px] font-bold uppercase tracking-wider absolute bottom-1"
                    style={{ color: c.textLabel }}>
                    ✎ Modifier
                  </div>
                </div>
              )}
            </div>
            );
          })()}

          {/* Reste à vivre */}
          {visibleKpiCards.includes('resteAVivre') && (() => {
            const c = generateCardColors(theme.resteAVivre);
            return (
              <div 
                className="sm:!p-6 lg:!p-8 sm:!flex-col sm:!justify-center sm:!items-center sm:!text-center sm:!min-h-[160px]"
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.02)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = 
                    `10px 10px 30px ${c.shadowHover}${darkMode ? '' : ', -6px -6px 16px rgba(255,255,255,.90)'}`;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = 
                    `6px 6px 24px ${c.shadow}${darkMode ? '' : ', -6px -6px 16px rgba(255,255,255,.90)'}`;
                }}
                style={{
                background: `linear-gradient(135deg, ${c.bgStart} 0%, ${c.bgEnd} 100%)`,
                borderRadius: 20,
                padding: '16px',
                minHeight: 0,
                boxShadow: `6px 6px 24px ${c.shadow}${darkMode ? '' : ', -6px -6px 16px rgba(255,255,255,.90)'}`,
                borderTop: dk.kpiBorderTop,
                borderLeft: dk.kpiBorderTop,
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 10,
                textAlign: 'left',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                cursor: 'default'
              }}>
                <div className="sm:!text-[10px]" style={{
                  fontSize: 8,
                  fontWeight: 700, letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: c.textLabel,
                }}>
                  {viewMode === 'year' ? 'Reste à vivre annuel' : 'Reste à vivre'}
                </div>
                <div className="text-lg sm:text-2xl lg:text-3xl" style={{
                  fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1,
                  color: c.textMain,
                  fontFamily: "'Nunito', sans-serif",
                }}>
                  {formatCurrency(resteAVivre, currency)}
                </div>

              </div>
            );
          })()}

          </div>

          {/* Carte fantôme */}
          <div className="relative flex-shrink-0 w-full sm:w-[80px]">
            <button
              onClick={() => setKpiPanelOpen(!kpiPanelOpen)}
              onMouseEnter={() => setIsGhostHovered(true)}
              onMouseLeave={() => setIsGhostHovered(false)}
              className="h-full flex items-center justify-center group w-full sm:w-[80px] sm:min-h-[160px]"
            >
              {/* Contour en tirets — repos (visible par défaut, disparaît au hover) */}
              <div
                className="absolute inset-0 sm:!rounded-r-2xl sm:!rounded-l-none rounded-2xl"
                style={{
                  border: '2px dashed rgba(180,190,210,.30)',
                  borderLeft: 'none',
                  borderRadius: 20,
                  WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 40%)',
                  maskImage: 'linear-gradient(to right, transparent 0%, black 40%)',
                  opacity: isGhostHovered ? 0 : 1,
                  transition: 'opacity 0.2s ease',
                }}
              />
              {/* Contour en tirets — hover (apparaît avec animation de déroulement) */}
              <div
                className="absolute inset-0 sm:!rounded-r-2xl sm:!rounded-l-none rounded-2xl"
                style={{
                  border: '2px dashed rgba(100,120,180,.55)',
                  borderLeft: 'none',
                  borderRadius: 20,
                  WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 40%)',
                  maskImage: 'linear-gradient(to right, transparent 0%, black 40%)',
                  clipPath: isGhostHovered ? 'inset(0 0% 0 0)' : 'inset(0 100% 0 0)',
                  transition: 'clip-path 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              />
              {/* Icône + et label */}
              <div className="relative flex flex-col items-center gap-1.5 opacity-30 group-hover:opacity-100 transition-all duration-200 sm:pl-4"
                style={{}}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ border: '1.5px dashed rgba(100,120,180,.70)', color: '#5B72B0' }}>
                  <Plus className="w-3.5 h-3.5" />
                </div>
                <span className="hidden sm:block text-[9px] font-black uppercase tracking-widest text-center"
                  style={{ color: '#5B72B0', lineHeight: 1.3 }}>
                  Cartes
                </span>
              </div>
            </button>

            {/* Panneau de personnalisation */}
            {kpiPanelOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setKpiPanelOpen(false)} />
                <div className="absolute right-0 top-full mt-2 rounded-2xl p-4 z-50 min-w-[200px]"
                  style={{ background: dk.modalBg, border: dk.cardBorder, boxShadow: dk.cardShadow }}>
                  <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: dk.textMuted }}>
                    Cartes visibles
                  </p>
                  {([
                    { key: 'revenus', label: 'Revenus' },
                    { key: 'depenses', label: 'Dépenses' },
                    { key: 'factures', label: 'Factures payées' },
                    { key: 'epargne', label: 'Épargne' },
                    { key: 'resteAVivre', label: 'Reste à vivre' },
                  ] as { key: KpiCardKey, label: string }[]).map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 py-1.5 cursor-pointer transition-colors" style={{ color: dk.textTable }}>
                      <input
                        type="checkbox"
                        checked={visibleKpiCards.includes(key)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setVisibleKpiCards([...visibleKpiCards, key]);
                          } else {
                            if (visibleKpiCards.length > 1) {
                              setVisibleKpiCards(visibleKpiCards.filter(k => k !== key));
                            }
                          }
                        }}
                        className="w-4 h-4 rounded accent-black"
                      />
                      <span className="text-sm font-medium" style={{ color: '#3D4A5C' }}>{label}</span>
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ZONE 3: MAIN TABLE (Central - 9 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-2xl overflow-hidden flex flex-col" style={{
            background: dk.cardBg,
            boxShadow: dk.cardShadow,
            border: dk.cardBorder,
            minHeight: 480,
          }}>
            {/* Table Toolbar */}
            <div className="px-3 sm:px-5 py-3 flex flex-wrap items-center gap-2 sm:gap-3" style={{borderBottom: '1px solid ' + (darkMode ? 'rgba(255,255,255,.06)' : '#F4F6FA')}}>
              <div className="flex items-center gap-2 rounded-xl px-4 py-2.5" style={{
                background: dk.inputBg,
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: dk.inputBorder,
                borderRadius: 12,
                boxShadow: '0 4px 16px rgba(0,0,0,.08), inset 0 1px 0 rgba(255,255,255,.60)',
                minWidth: 0, flex: 1, maxWidth: 220,
              }}>
                <Search className="w-4 h-4 flex-shrink-0" style={{color: dk.textMuted}} />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent text-sm outline-none w-full placeholder-gray-400"
                  style={{color: dk.textPrimary}}
                />
              </div>
              <div className="flex flex-wrap rounded-xl" style={{ background: dk.toolbarBg, borderRadius: 10, padding: '3px' }}>
                {['all', 'revenus', 'depenses', 'factures'].map(t => (
                  <button
                    key={t}
                    onClick={() => setFilterType(t as any)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                    style={filterType === t
                      ? { background: dk.activeTabBg, color: dk.activeTabColor, boxShadow: dk.activeTabShadow, borderRadius: 8 }
                      : { color: dk.textLight, background: 'none' }}
                  >
                    {t === 'all' ? 'Tout' : t === 'revenus' ? 'Revenus' : t === 'depenses' ? 'Dépenses' : 'Factures'}
                  </button>
                ))}
              </div>
              {filterType === 'factures' && (
                <div className="flex items-center gap-1.5">
                  <div className="flex rounded-lg" style={{ background: dk.toolbarBg, padding: '2px' }}>
                    {[
                      { key: 'all' as const, label: 'Toutes' },
                      { key: 'unpaid' as const, label: 'À payer' },
                      { key: 'paid' as const, label: 'Payées' },
                    ].map(({ key, label }) => (
                      <button
                        key={key}
                        onClick={() => setFactureFilter(key)}
                        className="px-2.5 py-1 rounded-md text-[11px] font-bold transition-all"
                        style={factureFilter === key
                          ? { background: dk.activeTabBg, color: dk.activeTabColor, boxShadow: dk.activeTabShadow }
                          : { color: dk.textLight, background: 'none' }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex rounded-xl" style={{ background: dk.toolbarBg, borderRadius: 10, padding: '3px' }}>
                <button onClick={() => setGroupMode('list')} className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all" style={groupMode === 'list' ? { background: dk.activeTabBg, color: dk.activeTabColor, boxShadow: dk.activeTabShadow, borderRadius: 8 } : { color: dk.textLight, background: 'none' }}>Liste</button>
                <button onClick={() => setGroupMode('category')} className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all" style={groupMode === 'category' ? { background: dk.activeTabBg, color: dk.activeTabColor, boxShadow: dk.activeTabShadow, borderRadius: 8 } : { color: dk.textLight, background: 'none' }}>Par catégorie</button>
              </div>
              <div className="ml-auto text-xs font-medium" style={{color:'#CCCCCC'}}>{filteredTransactions.length} transactions</div>
            </div>

            {/* Table Content */}
            <div className="flex-1 overflow-auto">
              <div>
                <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10" style={{ background: dk.cardBg }}>
                  <tr>
                    <th className="px-2 sm:px-5 py-3" style={{ color: dk.textTableMuted, fontSize: 12, fontWeight: 600, borderBottom: '1px solid ' + dk.tableBorderColor, textAlign: 'left' }}>Date</th>
                    <th className="px-2 sm:px-5 py-3" style={{ color: dk.textTableMuted, fontSize: 12, fontWeight: 600, borderBottom: '1px solid ' + dk.tableBorderColor, textAlign: 'left' }}>Catégorie</th>
                    <th className="hidden sm:table-cell px-2 sm:px-5 py-3" style={{ color: dk.textTableMuted, fontSize: 12, fontWeight: 600, borderBottom: '1px solid ' + dk.tableBorderColor, textAlign: 'left' }}>Description</th>
                    {filterType === 'factures' && (
                      <th className="px-2 sm:px-5 py-3 text-left text-[11px] font-bold uppercase" style={{ color: dk.textTableMuted, letterSpacing: '0.08em' }}>Échéance</th>
                    )}
                    <th className="hidden sm:table-cell px-2 sm:px-5 py-3" style={{ color: dk.textTableMuted, fontSize: 12, fontWeight: 600, borderBottom: '1px solid ' + dk.tableBorderColor, textAlign: 'center' }}>Type</th>
                    <th className="px-2 sm:px-5 py-3" style={{ color: dk.textTableMuted, fontSize: 12, fontWeight: 600, borderBottom: '1px solid ' + dk.tableBorderColor, textAlign: 'right' }}>Montant</th>
                    <th className="hidden sm:table-cell px-2 sm:px-5 py-3 w-10" style={{ borderBottom: '1px solid ' + dk.tableBorderColor }}></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filterType === 'factures' ? (
                    <>
                      {filteredFactures.map((f) => (
                        <tr key={f.id} style={{ borderBottom: '1px solid ' + dk.tableBorderColor }}>
                          <td className="px-2 sm:px-5 py-3.5 whitespace-nowrap" style={{ color: dk.textTableMuted, fontSize: 13 }}>
                            {f.date ? format(parseISO(f.date), 'dd MMM', { locale: fr }) : '–'}
                          </td>
                          <td className="px-2 sm:px-5 py-3.5 whitespace-nowrap">
                            <span style={{
                              display: 'inline-block',
                              padding: '4px 12px',
                              borderRadius: 8,
                              fontSize: 14,
                              fontWeight: 600,
                              color: dk.textTable,
                              background: `${theme.accent}55`,
                              backdropFilter: 'blur(8px)',
                              WebkitBackdropFilter: 'blur(8px)',
                              border: `1px solid ${theme.accent}70`,
                              boxShadow: `inset 0 1px 0 rgba(255,255,255,.40)`,
                            }}>
                              {f.category}
                            </span>
                          </td>
                          <td className="hidden sm:table-cell px-2 sm:px-5 py-3.5 whitespace-nowrap" style={{ color: dk.textTableMuted, fontSize: 13 }}>
                            {f.description || '–'}
                          </td>
                          <td className="px-2 sm:px-5 py-3.5 whitespace-nowrap" style={{ color: dk.textTableMuted, fontSize: 12 }}>
                            {f.echeance ? format(parseISO(f.echeance), 'dd/MM/yyyy') : '–'}
                          </td>
                          <td className="hidden sm:table-cell px-2 sm:px-5 py-3.5 whitespace-nowrap text-center">
                            <button
                              onClick={() => {
                                if (!f.isPaid) {
                                  setPayFactureModal({ factureId: f.id, mois: f.date ? f.date.substring(0, 7) : mois_courant });
                                } else {
                                  // Dépaiement direct sans modal
                                  toggleFacturePaid(f.date ? f.date.substring(0, 7) : mois_courant, f.id);
                                }
                              }}
                              className="px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all"
                              style={f.isPaid
                                ? { background: 'rgba(16,185,129,.12)', color: '#059669' }
                                : { background: 'rgba(239,68,68,.12)', color: '#DC2626' }
                              }
                              title={f.isPaid && f.paidDate ? `Payé le ${format(parseISO(f.paidDate), 'dd/MM/yyyy')}` : 'Cliquer pour marquer comme payé'}
                            >
                              {f.isPaid ? `PAYÉ${f.paidDate ? ` le ${format(parseISO(f.paidDate), 'dd/MM/yyyy')}` : ''}` : 'À PAYER'}
                            </button>
                          </td>
                          <td className="px-2 sm:px-5 py-3.5 whitespace-nowrap text-right" style={{ color: dk.negativeColor, fontWeight: 600, fontSize: 15 }}>
                            –{formatCurrency(f.montant, currency)}
                          </td>
                          <td className="hidden sm:table-cell px-2 sm:px-5 py-3.5 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-1">
                              {f.filePath && (
                                <button
                                  onClick={() => {
                                    const cleanPath = f.filePath!.replace(/^"|"$/g, '');
                                    navigator.clipboard.writeText(cleanPath).then(() => {
                                      showToast('Chemin copié : ' + cleanPath, 'success');
                                    }).catch(() => {
                                      showToast('Chemin : ' + cleanPath, 'success');
                                    });
                                  }}
                                  className="p-1.5 rounded-lg hover:bg-blue-50 transition-all"
                                  style={{ color: '#3B82F6', opacity: 0.6 }}
                                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.6'; }}
                                  title={'Copier le chemin : ' + f.filePath}
                                >
                                  <FileText className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => deleteFacture(f.date ? f.date.substring(0, 7) : mois_courant, f.id)}
                                className="p-1.5 rounded-lg hover:bg-red-50 transition-all"
                                style={{color:'#EF4444', opacity: 0.5}}
                                onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = '#DC2626'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.5'; e.currentTarget.style.color = '#EF4444'; }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredFactures.length === 0 && (
                        <tr><td colSpan={99} className="px-2 sm:px-6 py-12 text-center text-gray-400">Aucune facture</td></tr>
                      )}
                      {filteredFactures.length > 0 && (
                        <tr style={{ background: dk.tableHover }}>
                          <td colSpan={99} className="px-2 sm:px-5 py-3 text-right text-sm" style={{ color: dk.textTableMuted }}>Total :</td>
                          <td className="px-2 sm:px-5 py-3 text-right font-bold" style={{ color: dk.negativeColor, fontSize: 15 }}>
                            –{formatCurrency(filteredFactures.reduce((acc, f) => acc + f.montant, 0), currency)}
                          </td>
                          <td className="hidden sm:table-cell"></td>
                        </tr>
                      )}
                      <tr style={{borderTop: '1px dashed ' + dk.tableBorderColor}}>
                        <td colSpan={99} className="px-2 sm:px-5 py-3">
                          <button
                            onClick={() => { setNewTrans(prev => ({ ...prev, type: 'factures' })); setIsAddModalOpen(true); }}
                            className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-bold"
                            style={{
                              background: `${theme.accent}15`,
                              color: theme.accent,
                              border: `1.5px solid ${theme.accent}30`,
                              boxShadow: '0 2px 8px rgba(0,0,0,.06)',
                            }}
                          >
                            <Plus className="w-3.5 h-3.5" /> Ajouter facture
                          </button>
                        </td>
                      </tr>
                    </>
                  ) : (
                    <>
                      {groupMode === 'list' ? (
                        <>
                          {inlineAddType && (
                            <>
                              <tr className="sm:hidden">
                                <td colSpan={99}>
                                  <div className="p-3 space-y-2" style={{ background: 'rgba(59,130,246,.05)', borderBottom: '1px solid rgba(0,0,0,.05)' }}>
                                    <div className="flex gap-2">
                                      <input
                                        type="date"
                                        value={newTrans.date}
                                        onChange={(e) => setNewTrans({ ...newTrans, date: e.target.value })}
                                        className="flex-1 bg-white text-sm font-medium text-gray-900 outline-none rounded-lg px-2 py-2 border border-gray-200"
                                      />
                                      {!isNewCategory ? (
                                      <select
                                        value={newTrans.category}
                                        onChange={(e) => {
                                          if (e.target.value === 'new') {
                                            setIsNewCategory(true);
                                          } else {
                                            setNewTrans({ ...newTrans, category: e.target.value });
                                          }
                                        }}
                                        className="flex-1 bg-white text-sm font-medium text-gray-900 outline-none rounded-lg px-2 py-2 border border-gray-200"
                                      >
                                        <option value="" disabled>Catégorie</option>
                                        {categories[inlineAddType].map(c => <option key={c} value={c}>{c}</option>)}
                                        <option value="new">+ Nouvelle</option>
                                      </select>
                                      ) : (
                                      <div className="flex-1 flex items-center gap-1">
                                        <input
                                          autoFocus
                                          type="text"
                                          placeholder="Catégorie..."
                                          value={newCategoryInput}
                                          onChange={(e) => setNewCategoryInput(e.target.value)}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter' && newCategoryInput.trim()) {
                                              addCategory(inlineAddType, newCategoryInput.trim());
                                              setNewTrans(prev => ({ ...prev, category: newCategoryInput.trim() }));
                                              setNewCategoryInput('');
                                              setIsNewCategory(false);
                                            }
                                            if (e.key === 'Escape') { setNewCategoryInput(''); setIsNewCategory(false); }
                                          }}
                                          className="flex-1 bg-white text-sm rounded-lg px-2 py-2 border border-gray-200 outline-none"
                                        />
                                        <button onClick={() => { if (newCategoryInput.trim()) { addCategory(inlineAddType, newCategoryInput.trim()); setNewTrans(prev => ({ ...prev, category: newCategoryInput.trim() })); setNewCategoryInput(''); setIsNewCategory(false); }}} className="text-xs font-bold px-2 py-1 bg-black text-white rounded-md">OK</button>
                                      </div>
                                      )}
                                    </div>
                                    <div className="flex gap-2 items-center">
                                      <input
                                        type="number"
                                        placeholder="Montant"
                                        value={newTrans.amount}
                                        onChange={(e) => setNewTrans({ ...newTrans, amount: e.target.value })}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') { handleAddTransaction(); setInlineAddType(null); }
                                          if (e.key === 'Escape') { setInlineAddType(null); setNewTrans(prev => ({ ...prev, amount: '', category: '', description: '' })); }
                                        }}
                                        className="flex-1 bg-white text-sm font-bold text-gray-900 outline-none rounded-lg px-2 py-2 border border-gray-200"
                                      />
                                      <input
                                        type="text"
                                        placeholder="Description"
                                        value={newTrans.description}
                                        onChange={(e) => setNewTrans({ ...newTrans, description: e.target.value })}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') { handleAddTransaction(); setInlineAddType(null); }
                                        }}
                                        className="flex-1 bg-white text-sm text-gray-500 outline-none rounded-lg px-2 py-2 border border-gray-200 placeholder-gray-400"
                                      />
                                      <button
                                        onClick={() => { handleAddTransaction(); setInlineAddType(null); }}
                                        className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200"
                                      >
                                        <Check className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => { setInlineAddType(null); setNewTrans(prev => ({ ...prev, amount: '', category: '', description: '' })); }}
                                        className="p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                              <tr className="hidden sm:table-row bg-blue-50/50 animate-in fade-in slide-in-from-top-2 duration-200" style={{ borderBottom: '1px solid rgba(0,0,0,.05)' }}>
                              <td className="px-2 sm:px-5 py-3.5 whitespace-nowrap">
                                <input
                                  type="date"
                                  value={newTrans.date}
                                  onChange={(e) => setNewTrans({ ...newTrans, date: e.target.value })}
                                  className="bg-transparent text-sm font-medium text-gray-900 outline-none w-full"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') { handleAddTransaction(); setInlineAddType(null); }
                                    if (e.key === 'Escape') { setInlineAddType(null); setNewTrans(prev => ({ ...prev, amount: '', category: '', description: '' })); }
                                  }}
                                  autoFocus
                                />
                              </td>
                              <td className="px-2 sm:px-5 py-3.5 whitespace-nowrap">
                                {!isNewCategory ? (
                                <select
                                  value={newTrans.category}
                                  onChange={(e) => {
                                    if (e.target.value === 'new') {
                                      setIsNewCategory(true);
                                    } else {
                                      setNewTrans({ ...newTrans, category: e.target.value });
                                    }
                                  }}
                                  className="bg-transparent text-sm font-medium text-gray-900 outline-none w-full"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') { handleAddTransaction(); setInlineAddType(null); }
                                    if (e.key === 'Escape') { setInlineAddType(null); setNewTrans(prev => ({ ...prev, amount: '', category: '', description: '' })); }
                                  }}
                                >
                                  <option value="" disabled>Catégorie</option>
                                  {categories[inlineAddType].map(c => <option key={c} value={c}>{c}</option>)}
                                  <option value="new">+ Nouvelle catégorie</option>
                                </select>
                                ) : (
                                  <div className="flex items-center gap-1">
                                    <input
                                      autoFocus
                                      type="text"
                                      placeholder="Nom de la catégorie..."
                                      value={newCategoryInput}
                                      onChange={(e) => setNewCategoryInput(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter' && newCategoryInput.trim()) {
                                          addCategory(inlineAddType, newCategoryInput.trim());
                                          setNewTrans(prev => ({ ...prev, category: newCategoryInput.trim() }));
                                          setNewCategoryInput('');
                                          setIsNewCategory(false);
                                        }
                                        if (e.key === 'Escape') { setNewCategoryInput(''); setIsNewCategory(false); }
                                      }}
                                      className="bg-transparent text-sm font-medium text-gray-900 outline-none w-full border-b border-gray-300 pb-0.5"
                                    />
                                    <button
                                      onClick={() => {
                                        if (newCategoryInput.trim()) {
                                          addCategory(inlineAddType, newCategoryInput.trim());
                                          setNewTrans(prev => ({ ...prev, category: newCategoryInput.trim() }));
                                          setNewCategoryInput('');
                                          setIsNewCategory(false);
                                        }
                                      }}
                                      className="text-xs font-bold px-2 py-1 bg-black text-white rounded-md"
                                    >
                                      OK
                                    </button>
                                    <button
                                      onClick={() => { setNewCategoryInput(''); setIsNewCategory(false); }}
                                      className="text-xs text-gray-400 hover:text-gray-600 px-1"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                )}
                              </td>
                              <td className="hidden sm:table-cell px-2 sm:px-5 py-3.5 whitespace-nowrap">
                                <input
                                  type="text"
                                  placeholder="Description (optionnel)"
                                  value={newTrans.description}
                                  onChange={(e) => setNewTrans({ ...newTrans, description: e.target.value })}
                                  className="bg-transparent text-sm text-gray-500 outline-none w-full placeholder-gray-400"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') { handleAddTransaction(); setInlineAddType(null); }
                                    if (e.key === 'Escape') { setInlineAddType(null); setNewTrans(prev => ({ ...prev, amount: '', category: '', description: '' })); }
                                  }}
                                />
                              </td>
                              <td className="hidden sm:table-cell px-2 sm:px-5 py-3.5 whitespace-nowrap text-center">
                                <span style={{
                                  background: inlineAddType === 'revenus' ? 'rgba(74,140,106,.12)' : 'rgba(217,107,107,.12)',
                                  color: inlineAddType === 'revenus' ? theme.revenus : theme.depenses,
                                  borderRadius: 10, padding: '4px 10px',
                                  fontSize: 11, fontWeight: 700,
                                }}>
                                  {inlineAddType === 'revenus' ? 'REV' : 'DÉP'}
                                </span>
                              </td>
                              <td className="px-2 sm:px-5 py-3.5 whitespace-nowrap text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <input
                                    type="number"
                                    placeholder="0.00"
                                    value={newTrans.amount}
                                    onChange={(e) => setNewTrans({ ...newTrans, amount: e.target.value })}
                                    className="bg-transparent text-sm font-bold text-gray-900 outline-none w-24 text-right placeholder-gray-300"
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') { handleAddTransaction(); setInlineAddType(null); }
                                      if (e.key === 'Escape') { setInlineAddType(null); setNewTrans(prev => ({ ...prev, amount: '', category: '', description: '' })); }
                                    }}
                                  />
                                  <span className="text-sm text-gray-400">{currency === 'CHF' ? 'CHF' : currency === 'USD' ? '$' : '€'}</span>
                                </div>
                              </td>
                              <td className="px-2 sm:px-5 py-3.5 whitespace-nowrap text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => { handleAddTransaction(); setInlineAddType(null); }}
                                    className="p-1.5 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => { setInlineAddType(null); setNewTrans(prev => ({ ...prev, amount: '', category: '', description: '' })); }}
                                    className="p-1.5 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                            </>
                          )}
                          {filteredTransactions.map((t) => (
                        <TransactionRow 
                          key={t.id} 
                          transaction={t} 
                          onUpdate={(id, updates) => updateTransaction(t.date ? t.date.substring(0, 7) : mois_courant, t.type, id, updates)}
                          onDelete={(id) => deleteTransaction(t.date ? t.date.substring(0, 7) : mois_courant, t.type, id)}
                        />
                      ))}
                      {filteredTransactions.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-2 sm:px-6 py-12 text-center text-gray-400">
                            Aucune transaction trouvée
                          </td>
                        </tr>
                      )}
                      {/* TOTAL ROW */}
                      {filteredTransactions.length > 0 && (
                        <tr style={{ borderTop: '1px solid ' + dk.tableBorderColor }}>
                          <td colSpan={4} className="px-2 sm:px-6 py-4 text-right" style={{ color: dk.textTableMuted, fontSize: 13, fontWeight: 500 }}>Total :</td>
                          <td className="px-2 sm:px-6 py-4 text-right">
                            {(() => {
                              const totalNet = filteredTransactions.reduce((acc, t) => 
                                t.type === 'revenus' ? acc + t.reel : acc - t.reel, 0
                              );
                              return (
                                <span style={{ color: totalNet >= 0 ? dk.positiveColor : dk.negativeColor, fontWeight: 700, fontSize: 16, fontFamily: "'Nunito', sans-serif" }}>
                                  {totalNet >= 0 ? '+' : ''}{formatCurrency(totalNet, currency)}
                                </span>
                              );
                            })()}
                          </td>
                          <td colSpan={2}></td>
                        </tr>
                      )}
                    </>
                  ) : (
                    <>
                      {groupedByCategory.map(({ key, category, type, totalPrevu, totalReel, transactions: subTransactions }) => {
                        const colorBg = type === 'revenus' ? `${theme.revenus}0D` : type === 'factures' ? `${theme.accent}0D` : `${theme.depenses}0D`;
                        const colorBadgeBg = type === 'revenus' ? `${theme.revenus}1F` : type === 'factures' ? `${theme.accent}1F` : `${theme.depenses}1F`;
                        const colorBadgeText = type === 'revenus' ? theme.revenus : type === 'factures' ? theme.accent : theme.depenses;
                        const colorAmount = ''; // vider, on va utiliser style à la place
                        const badgeLabel = type === 'revenus' ? 'REV' : type === 'factures' ? 'FACT' : 'DEP';
                        return (
                          <React.Fragment key={key}>
                            {/* Ligne catégorie */}
                            <tr style={{ borderTop: '1px solid ' + dk.tableBorderColor, background: colorBg }}>
                              <td className="px-2 sm:px-5 py-3 text-sm" style={{ color: dk.textTableMuted }}>—</td>
                              <td className="px-2 sm:px-5 py-3">
                                <span style={{
                                  display: 'inline-block',
                                  padding: '4px 12px',
                                  borderRadius: 8,
                                  fontSize: 14,
                                  fontWeight: 700,
                                  color: dk.textTable,
                                  background: type === 'revenus'
                                    ? `${theme.revenus}55`
                                    : type === 'factures'
                                      ? `${theme.accent}55`
                                      : `${theme.depenses}55`,
                                  backdropFilter: 'blur(8px)',
                                  WebkitBackdropFilter: 'blur(8px)',
                                  border: `1px solid ${
                                    type === 'revenus'
                                      ? `${theme.revenus}70`
                                      : type === 'factures'
                                        ? `${theme.accent}70`
                                        : `${theme.depenses}70`
                                  }`,
                                  boxShadow: `inset 0 1px 0 rgba(255,255,255,.40)`,
                                }}>
                                  {category}
                                </span>
                              </td>
                              <td className="hidden sm:table-cell px-2 sm:px-5 py-3 text-sm italic" style={{ color: dk.textTableMuted }}>{subTransactions.length} transaction{subTransactions.length > 1 ? 's' : ''}</td>
                              <td className="hidden sm:table-cell px-2 sm:px-5 py-3 text-center">
                                <span style={{
                                  background: colorBadgeBg,
                                  color: colorBadgeText,
                                  borderRadius: 10, padding: '4px 10px',
                                  fontSize: 11, fontWeight: 700,
                                }}>
                                  {badgeLabel}
                                </span>
                              </td>
                              <td className={cn("px-2 sm:px-5 py-3 text-sm text-right font-bold", colorAmount)} style={{ color: type === 'revenus' ? theme.revenus : type === 'factures' ? theme.accent : theme.depenses }}>
                                {type === 'revenus' ? '+' : '-'}{formatCurrency(totalReel, currency)}
                              </td>
                              <td className="hidden sm:table-cell"></td>
                            </tr>
                            {/* Sous-lignes si plusieurs transactions */}
                            {subTransactions.length > 1 && subTransactions.map(t => (
                              <tr key={t.id} style={{ background: 'transparent' }}>
                                <td className="pl-4 sm:pl-10 pr-2 sm:pr-6 py-2 text-xs" style={{ color: dk.textTableMuted }}>
                                  {format(parseISO(t.date || '2024-01-01'), 'dd MMM', { locale: fr })}
                                </td>
                                <td className="px-2 sm:px-6 py-2 text-xs pl-4 sm:pl-10" style={{ color: dk.textTableMuted }}>↳ {t.description || category}</td>
                                <td className="hidden sm:table-cell px-2 sm:px-6 py-2 text-xs" style={{ color: dk.textTableMuted }}>—</td>
                                <td className="hidden sm:table-cell px-2 sm:px-6 py-2 text-xs text-gray-400"></td>
                                <td className={cn("px-2 sm:px-6 py-2 text-xs text-right", type === 'revenus' ? 'text-emerald-500' : type === 'factures' ? 'text-blue-400' : 'text-red-400')}>
                                  {formatCurrency(t.reel, currency)}
                                </td>
                                <td className="hidden sm:table-cell"></td>
                              </tr>
                            ))}
                          </React.Fragment>
                        );
                      })}
                      {groupedByCategory.length === 0 && (
                        <tr>
                          <td colSpan={99} className="px-2 sm:px-6 py-12 text-center text-gray-400">
                            Aucune transaction trouvée
                          </td>
                        </tr>
                      )}
                      {/* TOTAL GÉNÉRAL */}
                      {groupedByCategory.length > 0 && (
                        <tr style={{ borderTop: '1px solid ' + dk.tableBorderColor }}>
                          <td colSpan={99} className="px-2 sm:px-6 py-4 text-right" style={{ color: dk.textTableMuted, fontSize: 13, fontWeight: 500 }}>Total général :</td>
                          <td className="px-2 sm:px-6 py-4 text-right">
                            {(() => {
                              const totalNet = filteredTransactions.reduce((acc, t) => 
                                t.type === 'revenus' ? acc + t.reel : acc - t.reel, 0
                              );
                              return (
                                <span style={{ color: totalNet >= 0 ? dk.positiveColor : dk.negativeColor, fontWeight: 700, fontSize: 16, fontFamily: "'Nunito', sans-serif" }}>
                                  {totalNet >= 0 ? '+' : ''}{formatCurrency(totalNet, currency)}
                                </span>
                              );
                            })()}
                          </td>
                          <td className="hidden sm:table-cell"></td>
                        </tr>
                      )}
                    </>
                  )}
                  {/* ADD ROW */}
                  <tr style={{borderTop: '1px dashed ' + dk.tableBorderColor}}>
                    <td colSpan={99} className="px-2 sm:px-5 py-3">
                      <div className="flex flex-wrap gap-2">
                        {(filterType === 'all' || filterType === 'revenus') && (
                          <button
                            onClick={() => setInlineAddType('revenus')}
                            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-5 sm:py-2 rounded-xl text-sm font-bold"
                            style={{
                              background: `${theme.revenus}15`,
                              color: theme.revenus,
                              border: `1.5px solid ${theme.revenus}30`,
                              boxShadow: '0 2px 8px rgba(0,0,0,.06)',
                            }}
                          >
                            <Plus className="w-3.5 h-3.5" /> Ajouter revenu
                          </button>
                        )}
                        {(filterType === 'all' || filterType === 'depenses') && (
                          <button
                            onClick={() => setInlineAddType('depenses')}
                            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-5 sm:py-2 rounded-xl text-sm font-bold"
                            style={{
                              background: `${theme.depenses}15`,
                              color: theme.depenses,
                              border: `1.5px solid ${theme.depenses}30`,
                              boxShadow: '0 2px 8px rgba(0,0,0,.06)',
                            }}
                          >
                            <Plus className="w-3.5 h-3.5" /> Ajouter dépense
                          </button>
                        )}
                        {filterType === 'all' && (
                          <button
                            onClick={() => { setNewTrans(prev => ({ ...prev, type: 'factures' })); setIsAddModalOpen(true); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-5 sm:py-2 rounded-xl text-sm font-bold"
                            style={{
                              background: `${theme.accent}15`,
                              color: theme.accent,
                              border: `1.5px solid ${theme.accent}30`,
                              boxShadow: '0 2px 8px rgba(0,0,0,.06)',
                            }}
                          >
                            <Plus className="w-3.5 h-3.5" /> Ajouter facture
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

          {/* ZONE 5 : RÉCURRENTES + CATÉGORIES (sous le tableau, 9 cols) */}
          <div className="flex flex-col sm:flex-row gap-6 items-start">

            {/* Transactions Récurrentes */}
            <div className="flex-1 rounded-2xl p-5" style={{
              background: dk.cardBg,
              boxShadow: dk.cardShadow,
              border: dk.cardBorder,
              borderRadius: 20,
            }}>
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setRecurringOpen(!recurringOpen)}
              >
                <h3 className="text-xs font-black uppercase tracking-widest" style={{ color: dk.textMuted }}>Transactions récurrentes</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedRecurringIds(new Set(pendingRecurring.map(rt => rt.id)));
                      setIsRecurringImportOpen(true);
                    }}
                    className="text-xs font-bold hover:text-blue-500 transition-colors" style={{ color: dk.textMuted }}
                  >
                    Importer
                  </button>
                  {recurringOpen ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                </div>
              </div>
              <motion.div
                initial={false}
                animate={{ height: recurringOpen ? 'auto' : 0, opacity: recurringOpen ? 1 : 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4">
                  <RecurringManagerInline />
                </div>
              </motion.div>
            </div>

            {/* Catégories */}
            <div className="flex-1 rounded-2xl p-5" style={{
              background: dk.cardBg,
              boxShadow: dk.cardShadow,
              border: dk.cardBorder,
              borderRadius: 20,
            }}>
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setCategoriesOpen(!categoriesOpen)}
              >
                <h3 className="text-xs font-black uppercase tracking-widest" style={{ color: dk.textMuted }}>Catégories</h3>
                {categoriesOpen ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
              </div>
              <motion.div
                initial={false}
                animate={{ height: categoriesOpen ? 'auto' : 0, opacity: categoriesOpen ? 1 : 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4">
                  <CategoryManagerInline />
                </div>
              </motion.div>
            </div>

          </div>
        </div>

        {/* ZONE 4: RIGHT SIDEBAR (3 cols) */}
        <div className="lg:col-span-4 space-y-4 sm:space-y-6">
          {/* Enveloppes */}
          <div className="rounded-2xl p-3 sm:p-5" style={{
            background: dk.sidebarCardBg,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: dk.sidebarBorder,
            boxShadow: dk.sidebarShadow,
            borderRadius: 20,
          }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black uppercase tracking-widest" style={{ color: dk.textSecondary }}>Enveloppes</h3>
              <NewEnveloppeButton onAdd={(nom) => addEnveloppe(nom)} />
            </div>
            <div className="space-y-3">
              {enveloppes.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-2">
                  Crée une enveloppe pour commencer
                </p>
              )}
              {enveloppes.map((env) => (
                <EnveloppeCard
                  key={env.id}
                  enveloppe={env}
                  moisCourant={mois_courant}
                  viewMode={viewMode}
                  currentYear={currentYear}
                  onAddMouvement={(m) => addMouvement(env.id, m)}
                  onDeleteMouvement={(mid) => deleteMouvement(env.id, mid)}
                  onDelete={() => deleteEnveloppe(env.id)}
                  darkMode={darkMode}
                />
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="rounded-2xl p-3 sm:p-5" style={{
            background: dk.cardBg,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: dk.cardBorder,
            boxShadow: dk.cardShadow,
            borderRadius: 20,
          }}>
            <h3 className="text-xs font-black uppercase tracking-widest mb-4" 
              style={{ color: dk.textSecondary }}>
              Dépenses par catégorie
            </h3>
            
            {depensesParCategorie.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-2">Aucune dépense ce mois-ci</p>
            ) : (() => {
              const total = depensesParCategorie.reduce((acc, [, v]) => acc + v, 0);
              const rayon = 28;
              const circonference = 2 * Math.PI * rayon;
              let offsetCourant = 0;

              return (
                <div>
                  {/* Donut SVG — grand, anneau fin, aéré */}
                  <div className="hidden sm:flex justify-center mb-5">
                    <div className="relative">
                      <svg width="160" height="160" viewBox="0 0 160 160">
                        {/* Anneau de fond très léger */}
                        <circle cx="80" cy="80" r="60" fill="none"
                          stroke="rgba(0,0,0,.04)" strokeWidth="7"/>
                        {(() => {
                          const total = depensesParCategorie.reduce((acc, [, v]) => acc + v, 0);
                          const rayon = 60;
                          const circonference = 2 * Math.PI * rayon;
                          let offsetCourant = 0;
                          return depensesParCategorie.map(([cat, montant], i) => {
                            const pct = montant / total;
                            const dash = pct * circonference;
                            const gap = depensesParCategorie.length > 1 ? 3 : 0;
                            const segment = (
                              <circle
                                key={cat}
                                cx="80" cy="80" r={rayon}
                                fill="none"
                                stroke={COULEURS_CAT[i % COULEURS_CAT.length]}
                                strokeWidth="7"
                                strokeDasharray={`${Math.max(0, dash - gap)} ${circonference - Math.max(0, dash - gap)}`}
                                strokeDashoffset={-offsetCourant + circonference / 4}
                                strokeLinecap="round"
                                style={{ 
                                  transition: 'stroke-dasharray 0.6s ease',
                                  filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,.08))'
                                }}
                              />
                            );
                            offsetCourant += dash;
                            return segment;
                          });
                        })()}
                      </svg>
                      {/* Total centré — plus grand et aéré */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
                        <span className="text-[11px] font-semibold" style={{ color: dk.textMuted }}>Total</span>
                        <span className="text-lg font-black" 
                          style={{ fontFamily: "'Nunito',sans-serif", color: dk.textTable, lineHeight: 1 }}>
                          -{formatCurrency(depensesParCategorie.reduce((acc, [, v]) => acc + v, 0), currency)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Légende */}
                  <div className="space-y-1.5">
                    {depensesParCategorie.map(([cat, montant], i) => (
                      <div key={cat} className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: COULEURS_CAT[i % COULEURS_CAT.length] }}/>
                          <span className="text-xs font-medium capitalize truncate" 
                            style={{ color: dk.textTable }}>
                            {cat}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                          <span className="text-xs font-bold" style={{ color: dk.textMuted }}>
                            {Math.round((montant / total) * 100)}%
                          </span>
                          <span className="text-xs font-semibold" style={{ color: dk.textTable }}>
                            {formatCurrency(montant, currency)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Factures à venir */}
          <div className="rounded-2xl p-3 sm:p-5" style={{
            background: dk.cardBg,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: dk.cardBorder,
            boxShadow: dk.cardShadow,
            borderRadius: 20,
          }}>
            <h3 className="text-xs font-black uppercase tracking-widest mb-3" 
              style={{ color: dk.textSecondary }}>
              Factures à venir
            </h3>
            {facturesAVenir > 0 ? (
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-2xl font-black" 
                    style={{ fontFamily: "'Nunito',sans-serif", color: dk.negativeColor, fontWeight: 900 }}>
                    -{formatCurrency(facturesAVenir, currency)}
                  </div>
                  <div className="text-xs font-semibold mt-0.5" style={{ color: dk.textMuted }}>
                    {pendingRecurring.filter(rt => rt.type === 'factures').length} facture(s) récurrente(s) à importer
                  </div>
                </div>
              </div>
            ) : totalFacturesNonPayees > 0 ? (
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-2xl font-black" 
                    style={{ fontFamily: "'Nunito',sans-serif", color: '#F59E0B', fontWeight: 900 }}>
                    -{formatCurrency(totalFacturesNonPayees, currency)}
                  </div>
                  <div className="text-xs font-semibold mt-0.5" style={{ color: dk.textMuted }}>
                    {facturesNonPayees.length} facture(s) non payée(s) ce mois-ci
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-2">
                <Check className="w-5 h-5" style={{ color: '#4A8C6A' }} />
                <span className="text-xs font-semibold" style={{ color: '#4A8C6A' }}>
                  Toutes les factures ont été payées ce mois-ci 🎉
                </span>
              </div>
            )}
          </div>

          {/* Mes couleurs — horizontal dans sidebar */}
          <div className="rounded-2xl p-3 sm:p-5" style={{
            background: dk.cardBg,
            boxShadow: dk.cardShadow,
            border: dk.cardBorder,
            borderRadius: 20,
          }}>
            <h3 className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: dk.textMuted }}>Mes couleurs</h3>
            <div className="grid grid-cols-2 gap-3">
              {([
                { key: 'revenus' as const, label: 'Revenus' },
                { key: 'depenses' as const, label: 'Dépenses' },
                { key: 'enveloppes' as const, label: 'Épargne' },
                { key: 'accent' as const, label: 'Factures' },
                { key: 'resteAVivre' as const, label: 'Reste à vivre' },
              ]).map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <div
                    className="w-6 h-6 rounded-full flex-shrink-0"
                    style={{ backgroundColor: theme[key], boxShadow: '0 2px 8px rgba(0,0,0,.15)' }}
                  />
                  <span style={{ fontSize: 13, color: dk.textTable, fontWeight: 500 }}>{label}</span>
                  <input
                    type="color"
                    value={theme[key]}
                    onChange={(e) => setThemeColor(key, e.target.value)}
                    className="sr-only"
                  />
                </label>
              ))}
              {/* Pastille Fond de page */}
              <button
                onClick={() => setGradientWheelOpen(true)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <div
                  className="w-6 h-6 rounded-full flex-shrink-0"
                  style={{
                    background: backgroundGradient !== 'none'
                      ? (GRADIENTS.find(g => g.id === backgroundGradient)?.gradient || '#F0F2F5')
                      : (darkMode ? '#0F1117' : '#F0F2F5'),
                    boxShadow: '0 2px 8px rgba(0,0,0,.15)',
                    border: '1.5px solid ' + (darkMode ? 'rgba(255,255,255,.15)' : 'rgba(0,0,0,.10)'),
                  }}
                />
                <span style={{ fontSize: 13, color: dk.textTable, fontWeight: 500 }}>Fond</span>
              </button>
            </div>
            <p className="mt-3" style={{ fontSize: 11, color: dk.textLight }}>Clique sur un cercle pour changer</p>
          </div>
        </div>

        {payFactureModal && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-2 sm:p-4">
            <div className="absolute inset-0 backdrop-blur-sm"
              style={{ background: dk.modalOverlay }}
              onClick={() => setPayFactureModal(null)} />
            <div className="rounded-2xl shadow-2xl w-full max-w-sm relative z-10 p-6" style={{ background: dk.modalBg }}>
              <h3 className="text-base font-black mb-1" style={{ color: dk.textPrimary }}>
                Payer la facture
              </h3>
              <p className="text-xs mb-4" style={{ color: dk.textMuted }}>
                Comment souhaitez-vous régler cette facture ?
              </p>
              <div className="space-y-2">
                {/* Option 1 : paiement classique via revenus */}
                <button
                  className="w-full p-3 rounded-xl text-left font-bold text-sm transition-colors"
                  style={{ border: `1.5px solid ${darkMode ? 'rgba(255,255,255,.10)' : '#EEEEEE'}`, color: dk.textPrimary, background: 'transparent' }}
                  onClick={() => {
                    toggleFacturePaid(payFactureModal.mois, payFactureModal.factureId);
                    setPayFactureModal(null);
                  }}
                >
                  💳 Payer via mes revenus
                  <div className="text-xs font-normal mt-0.5" style={{ color: dk.textMuted }}>
                    Compte dans "Factures payées"
                  </div>
                </button>

                {/* Options enveloppes */}
                {enveloppes.map(env => {
                  const soldeEnv = env.mouvements.reduce((acc, m) => acc + m.montant, 0);
                  const montantFacture = currentFactures.find(f => f.id === payFactureModal.factureId)?.montant || 0;
                  const soldeInsuffisant = soldeEnv < montantFacture;
                  return (
                    <button
                      key={env.id}
                      disabled={soldeInsuffisant}
                      className={`w-full p-3 rounded-xl text-left font-bold text-sm transition-colors ${soldeInsuffisant ? 'cursor-not-allowed' : 'hover:bg-gray-50/10'}`}
                      style={{ 
                        border: `1.5px solid ${darkMode ? 'rgba(255,255,255,.10)' : '#EEEEEE'}`, 
                        color: dk.textPrimary,
                        opacity: soldeInsuffisant ? 0.4 : 1,
                        background: 'transparent',
                      }}
                      onClick={() => {
                        if (soldeInsuffisant) return;
                        toggleFacturePaid(payFactureModal.mois, payFactureModal.factureId, 
                          { id: env.id, nom: env.nom });
                        const facture = currentFactures.find(f => f.id === payFactureModal.factureId);
                        if (facture) {
                          addMouvement(env.id, {
                            date: format(new Date(), 'yyyy-MM-dd'),
                            description: `Facture : ${facture.category}`,
                            montant: -facture.montant,
                          });
                        }
                        setPayFactureModal(null);
                      }}
                    >
                      🪙 Payer via "{env.nom}"
                      <div className="text-xs font-normal mt-0.5" style={{ color: soldeInsuffisant ? '#EF4444' : dk.textMuted }}>
                        Solde actuel : {formatCurrency(soldeEnv, currency)}
                        {soldeInsuffisant && <span className="ml-1">(insuffisant)</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setPayFactureModal(null)}
                className="w-full mt-3 py-2 text-sm font-bold rounded-xl transition-colors"
                style={{ background: dk.btnBg, color: dk.btnColor }}
              >
                Annuler
              </button>
            </div>
          </div>
        )}

      </main>

      {/* ADD TRANSACTION MODAL */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div key="modal-container" className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsAddModalOpen(false);
                setIsNewCategory(false);
                setNewCategoryInput('');
              }}
              className="absolute inset-0 backdrop-blur-sm"
              style={{ background: dk.modalOverlay }}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden"
              style={{ background: dk.modalBg }}
            >
              <div className="p-6 flex justify-between items-center" style={{ borderBottom: `1px solid ${dk.divider}` }}>
                <h2 className="text-xl font-bold" style={{ color: dk.textPrimary }}>Nouvelle Transaction</h2>
                <button onClick={() => {
                  setIsAddModalOpen(false);
                  setIsNewCategory(false);
                  setNewCategoryInput('');
                }} className="p-2 rounded-full transition-colors" style={{ background: dk.btnBg, color: dk.btnColor }}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                {/* Type Switcher */}
                <div className="grid grid-cols-3 gap-1 p-1 rounded-xl" style={{ background: dk.toolbarBg }}>
                  <button 
                    onClick={() => setNewTrans(prev => ({ ...prev, type: 'revenus' }))}
                    className={cn("py-2 rounded-lg text-sm font-bold transition-all", newTrans.type === 'revenus' ? "shadow-sm text-emerald-600" : "text-gray-500")}
                    style={{ background: newTrans.type === 'revenus' ? dk.activeTabBg : 'transparent' }}
                  >
                    Revenu
                  </button>
                  <button 
                    onClick={() => setNewTrans(prev => ({ ...prev, type: 'depenses' }))}
                    className={cn("py-2 rounded-lg text-sm font-bold transition-all", newTrans.type === 'depenses' ? "shadow-sm text-red-500" : "text-gray-500")}
                    style={{ background: newTrans.type === 'depenses' ? dk.activeTabBg : 'transparent' }}
                  >
                    Dépense
                  </button>
                  <button 
                    onClick={() => setNewTrans(prev => ({ ...prev, type: 'factures' }))}
                    className={cn("flex-1 py-2 rounded-lg text-sm font-bold transition-all", newTrans.type === 'factures' ? "shadow-sm text-blue-500" : "text-gray-500")}
                    style={{ background: newTrans.type === 'factures' ? dk.activeTabBg : 'transparent' }}
                  >
                    Facture
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1" style={{ color: dk.textMuted }}>Montant Réel</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        autoFocus
                        value={newTrans.amount}
                        onChange={(e) => setNewTrans(prev => ({ ...prev, amount: e.target.value }))}
                        max={1000000}
                        min={0}
                        className="w-full text-2xl font-bold p-3 rounded-xl outline-none"
                        style={{ background: dk.inputBg, border: dk.inputBorder, color: dk.textPrimary }}
                        placeholder="0.00"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold" style={{ color: dk.textMuted }}>{currency === 'CHF' ? 'CHF' : currency === 'USD' ? '$' : '€'}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase mb-1" style={{ color: dk.textMuted }}>Catégorie</label>
                    {isNewCategory ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          autoFocus
                          value={newCategoryInput}
                          onChange={(e) => setNewCategoryInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && newCategoryInput.trim()) {
                              addCategory(newTrans.type, newCategoryInput.trim());
                              setNewTrans(prev => ({ ...prev, category: newCategoryInput.trim() }));
                              setNewCategoryInput('');
                              setIsNewCategory(false);
                            }
                            if (e.key === 'Escape') setIsNewCategory(false);
                          }}
                          placeholder="Nom de la catégorie..."
                          className="flex-1 p-3 rounded-xl outline-none font-medium"
                          style={{ background: dk.inputBg, border: dk.inputBorder, color: dk.textPrimary }}
                        />
                        <button
                          onClick={() => {
                            if (newCategoryInput.trim()) {
                              addCategory(newTrans.type, newCategoryInput.trim());
                              setNewTrans(prev => ({ ...prev, category: newCategoryInput.trim() }));
                              setNewCategoryInput('');
                              setIsNewCategory(false);
                            }
                          }}
                          className="px-4 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800"
                        >
                          OK
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <select
                          value={newTrans.category}
                          onChange={(e) => setNewTrans(prev => ({ ...prev, category: e.target.value }))}
                          className="flex-1 p-3 rounded-xl outline-none font-medium"
                          style={{ background: dk.inputBg, border: dk.inputBorder, color: dk.textPrimary }}
                        >
                          <option value="">Sélectionner...</option>
                          {(categories[newTrans.type as keyof typeof categories] || []).map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => setIsNewCategory(true)}
                          className="px-3 py-3 rounded-xl transition-colors"
                          style={{ background: dk.btnBg, color: dk.btnColor }}
                          title="Créer une nouvelle catégorie"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase mb-1" style={{ color: dk.textMuted }}>Description (Optionnel)</label>
                    <input 
                      type="text" 
                      value={newTrans.description}
                      onChange={(e) => setNewTrans(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full p-3 rounded-xl outline-none font-medium"
                      style={{ background: dk.inputBg, border: dk.inputBorder, color: dk.textPrimary }}
                      placeholder="Ex: Courses Leclerc"
                    />
                  </div>



                  <div>
                    <label className="block text-xs font-bold uppercase mb-1" style={{ color: dk.textMuted }}>Date</label>
                    <input 
                      type="date" 
                      value={newTrans.date}
                      onChange={(e) => setNewTrans(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full p-3 rounded-xl outline-none font-medium"
                      style={{ background: dk.inputBg, border: dk.inputBorder, color: dk.textPrimary }}
                    />
                  </div>

                  {newTrans.type === 'factures' && (
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1" style={{ color: dk.textMuted }}>Échéance (optionnel)</label>
                      <input 
                        type="date" 
                        value={(newTrans as any).echeance || ''}
                        onChange={(e) => setNewTrans(prev => ({ ...prev, echeance: e.target.value } as any))}
                        className="w-full p-3 rounded-xl outline-none font-medium"
                        style={{ background: dk.inputBg, border: dk.inputBorder, color: dk.textPrimary }}
                      />
                    </div>
                  )}

                  {newTrans.type === 'factures' && (
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1" style={{ color: dk.textMuted }}>Lien fichier (optionnel)</label>
                      <input 
                        type="text" 
                        value={newTrans.filePath}
                        onChange={(e) => setNewTrans(prev => ({ ...prev, filePath: e.target.value }))}
                        className="w-full p-3 rounded-xl outline-none font-medium text-sm"
                        style={{ background: dk.inputBg, border: dk.inputBorder, color: dk.textPrimary }}
                        placeholder="C:\Users\...\facture.pdf"
                      />
                    </div>
                  )}

                  {newTrans.type === 'factures' && (
                    <label className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors" style={{ background: dk.inputBg }}>
                      <input
                        type="checkbox"
                        checked={newTrans.isPaid}
                        onChange={(e) => setNewTrans(prev => ({ ...prev, isPaid: e.target.checked }))}
                        className="w-5 h-5 rounded accent-black"
                      />
                      <span className="font-bold text-sm" style={{ color: dk.textPrimary }}>Déjà payée ?</span>
                    </label>
                  )}
                </div>

                <button 
                  onClick={handleAddTransaction}
                  className="w-full py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors mt-4"
                >
                  AJOUTER
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* RECURRING IMPORT MODAL */}
      <AnimatePresence>
        {isRecurringImportOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsRecurringImportOpen(false)}
              className="absolute inset-0 backdrop-blur-sm"
              style={{ background: dk.modalOverlay }}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden"
              style={{ background: dk.modalBg }}
            >
              <div className="p-6 flex justify-between items-center" style={{ borderBottom: `1px solid ${dk.divider}` }}>
                <h2 className="text-xl font-bold" style={{ color: dk.textPrimary }}>Importer les récurrentes</h2>
                <button onClick={() => setIsRecurringImportOpen(false)} className="p-2 rounded-full transition-colors" style={{ background: dk.btnBg, color: dk.btnColor }}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-3">
                <p className="text-sm mb-4" style={{ color: dk.textMuted }}>
                  Sélectionne les transactions à importer pour {format(parseISO(mois_courant + '-01'), 'MMMM yyyy', { locale: fr })}
                </p>
                {pendingRecurring.map(rt => (
                  <label key={rt.id} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors" style={{ background: dk.inputBg }}>
                    <input
                      type="checkbox"
                      checked={selectedRecurringIds.has(rt.id)}
                      onChange={(e) => {
                        const next = new Set(selectedRecurringIds);
                        e.target.checked ? next.add(rt.id) : next.delete(rt.id);
                        setSelectedRecurringIds(next);
                      }}
                      className="w-4 h-4 rounded accent-black"
                    />
                    <div className="flex-1">
                      <span className="font-bold text-sm" style={{ color: dk.textPrimary }}>{rt.name}</span>
                      <span className="text-xs ml-2" style={{ color: dk.textMuted }}>{rt.category}</span>
                    </div>
                    <span className={cn("text-sm font-bold", rt.type === 'revenus' ? 'text-emerald-600' : rt.type === 'factures' ? 'text-blue-500' : 'text-red-500')}>
                      {rt.type === 'revenus' ? '+' : '-'}{formatCurrency(rt.amount, currency)}
                    </span>
                  </label>
                ))}
                <button
                  onClick={handleImportRecurring}
                  disabled={selectedRecurringIds.size === 0}
                  className="w-full py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors mt-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  IMPORTER ({selectedRecurringIds.size})
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Gradient Wheel Modal */}
      <AnimatePresence>
        {gradientWheelOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center p-2 sm:p-4"
          >
            <div
              className="absolute inset-0 backdrop-blur-sm"
              style={{ background: dk.modalOverlay }}
              onClick={() => setGradientWheelOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative z-10 rounded-3xl p-8 w-full"
              style={{
                background: dk.modalBg,
                boxShadow: '0 25px 80px rgba(0,0,0,.25)',
                maxWidth: 380,
              }}
            >
              <h3 className="text-lg font-black text-center mb-6" style={{ color: dk.textPrimary }}>
                Fond de Page
              </h3>

              {/* Roue */}
              <div style={{ position: 'relative', width: 260, height: 260, margin: '0 auto 24px' }}>
                <svg viewBox="0 0 260 260" width="260" height="260">
                  {GRADIENTS.filter(g => g.id !== 'none').map((g, i, arr) => {
                    const total = arr.length;
                    const angle = (360 / total);
                    const startAngle = i * angle - 90;
                    const endAngle = startAngle + angle;
                    const innerR = 60;
                    const outerR = 120;
                    const cx = 130;
                    const cy = 130;
                    const toRad = (deg: number) => (deg * Math.PI) / 180;
                    const x1 = cx + outerR * Math.cos(toRad(startAngle));
                    const y1 = cy + outerR * Math.sin(toRad(startAngle));
                    const x2 = cx + outerR * Math.cos(toRad(endAngle));
                    const y2 = cy + outerR * Math.sin(toRad(endAngle));
                    const x3 = cx + innerR * Math.cos(toRad(endAngle));
                    const y3 = cy + innerR * Math.sin(toRad(endAngle));
                    const x4 = cx + innerR * Math.cos(toRad(startAngle));
                    const y4 = cy + innerR * Math.sin(toRad(startAngle));
                    const largeArc = angle > 180 ? 1 : 0;
                    const isActive = backgroundGradient === g.id;
                    
                    // Extract first hex color from gradient for the slice fill
                    const colorMatch = g.gradient.match(/#[0-9a-fA-F]{6}/g);
                    const color1 = colorMatch?.[0] || '#ccc';
                    const color2 = colorMatch?.[1] || colorMatch?.[0] || '#eee';
                    const gradientId = `grad-${g.id}`;

                    return (
                      <g key={g.id}>
                        <defs>
                          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={color1} />
                            <stop offset="100%" stopColor={color2} />
                          </linearGradient>
                        </defs>
                        <path
                          d={`M ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4} Z`}
                          fill={`url(#${gradientId})`}
                          stroke={isActive ? (darkMode ? '#E8EAF0' : '#1A1F3C') : (darkMode ? 'rgba(255,255,255,.08)' : 'rgba(255,255,255,.80)')}
                          strokeWidth={isActive ? 3 : 1}
                          style={{ cursor: 'pointer', transition: 'stroke-width 0.2s ease' }}
                          onClick={() => setBackgroundGradient(g.id)}
                        />
                      </g>
                    );
                  })}
                  {/* Centre — bouton "Aucun" */}
                  <circle
                    cx="130"
                    cy="130"
                    r="55"
                    fill={darkMode ? '#1E2030' : '#F8F9FA'}
                    stroke={backgroundGradient === 'none' ? (darkMode ? '#E8EAF0' : '#1A1F3C') : (darkMode ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.06)')}
                    strokeWidth={backgroundGradient === 'none' ? 3 : 1}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setBackgroundGradient('none')}
                  />
                  <text
                    x="130"
                    y="133"
                    textAnchor="middle"
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      fill: dk.textMuted,
                      pointerEvents: 'none',
                    }}
                  >
                    Aucun
                  </text>
                </svg>
              </div>

              {/* Nom du gradient sélectionné */}
              <p className="text-center mb-6" style={{ fontSize: 13, fontWeight: 600, color: dk.textSecondary }}>
                {GRADIENTS.find(g => g.id === backgroundGradient)?.name || 'Aucun'}
              </p>

              {/* Boutons */}
              <div className="flex gap-3">
                <button
                  onClick={() => { setBackgroundGradient('none'); setGradientWheelOpen(false); }}
                  className="flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                  style={{
                    background: darkMode ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.04)',
                    color: dk.textMuted,
                    border: darkMode ? '1px solid rgba(255,255,255,.08)' : '1px solid rgba(0,0,0,.06)',
                  }}
                >
                  Réinitialiser
                </button>
                <button
                  onClick={() => setGradientWheelOpen(false)}
                  className="flex-1 py-3 rounded-xl text-sm font-bold transition-all"
                  style={{
                    background: theme.revenus,
                    color: 'white',
                    boxShadow: `0 4px 16px ${theme.revenus}40`,
                  }}
                >
                  Valider
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

function RecurringManagerInline() {
  const { recurringTransactions, categories, addRecurringTransaction, updateRecurringTransaction, deleteRecurringTransaction, theme, darkMode, currency } = useBudgetStore();
  const { showToast } = useToastStore();
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ name: '', category: '', type: 'depenses' as 'revenus' | 'depenses' | 'factures', amount: '', filePath: '' });

  const handleAdd = () => {
    if (!form.name || !form.category || !form.amount) return;
    const amount = parseFloat(form.amount);
    if (amount > 1000000) {
      showToast(`Montant maximum : 1 000 000 ${currency === 'CHF' ? 'CHF' : currency === 'USD' ? '$' : '€'}`, 'error');
      return;
    }
    if (amount <= 0) {
      showToast('Le montant doit être positif', 'error');
      return;
    }
    addRecurringTransaction({ name: form.name, category: form.category, type: form.type, amount, filePath: form.type === 'factures' ? form.filePath || undefined : undefined });
    showToast('Transaction récurrente ajoutée', 'success');
    setForm({ name: '', category: '', type: 'depenses', amount: '', filePath: '' });
    setIsAdding(false);
  };

  return (
    <div className="space-y-2">
      {recurringTransactions.map(rt => (
        <div key={rt.id} className="flex items-center justify-between py-2.5 group" style={{ borderBottom: '1px solid ' + (darkMode ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.05)') }}>
          <div>
            <span className="text-sm font-bold" style={{ color: darkMode ? '#E2E8F0' : '#3D4A5C', fontWeight: 700 }}>{rt.name}</span>
            <span className="text-xs ml-2" style={{ color: darkMode ? '#94A3B8' : '#8896A8', fontSize: 12 }}>{rt.category}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold" style={{ color: rt.type === 'revenus' ? theme.revenus : rt.type === 'factures' ? theme.accent : theme.depenses, fontWeight: 600 }}>
              {rt.type === 'revenus' ? '+' : '–'}{formatCurrency(rt.amount, currency)}
            </span>
            <button onClick={() => deleteRecurringTransaction(rt.id)} className={cn("p-1 rounded transition-all opacity-50 hover:opacity-100", darkMode ? "hover:bg-red-900/30" : "hover:bg-red-50")} style={{color:'#EF4444'}}>
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}

      {isAdding ? (
        <div className="space-y-2 pt-2">
          <div className={cn("flex p-0.5 rounded-lg", darkMode ? "bg-gray-800" : "bg-gray-100")}>
            <button onClick={() => setForm(p => ({ ...p, type: 'revenus' }))} className={cn("flex-1 py-1 rounded-md text-xs font-bold transition-all", form.type === 'revenus' ? (darkMode ? "bg-gray-700 text-emerald-400 shadow-sm" : "bg-white text-emerald-600 shadow-sm") : "text-gray-500")}>Rev.</button>
            <button onClick={() => setForm(p => ({ ...p, type: 'depenses' }))} className={cn("flex-1 py-1 rounded-md text-xs font-bold transition-all", form.type === 'depenses' ? (darkMode ? "bg-gray-700 text-red-400 shadow-sm" : "bg-white text-red-500 shadow-sm") : "text-gray-500")}>Dép.</button>
            <button onClick={() => setForm(p => ({ ...p, type: 'factures' }))} className={cn("flex-1 py-1 rounded-md text-xs font-bold transition-all", form.type === 'factures' ? (darkMode ? "bg-gray-700 text-blue-400 shadow-sm" : "bg-white text-blue-500 shadow-sm") : "text-gray-500")}>Fact.</button>
          </div>
          <input 
            type="text" 
            placeholder="Nom (ex: Loyer)" 
            value={form.name} 
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))} 
            className={cn("w-full px-3 py-2 text-sm rounded-lg outline-none focus:border-black", darkMode ? "bg-gray-900/50 border-gray-700 text-white" : "bg-gray-50 border-gray-200")} 
          />
          <select 
            value={form.category} 
            onChange={e => setForm(p => ({ ...p, category: e.target.value }))} 
            className={cn("w-full px-3 py-2 text-sm rounded-lg outline-none focus:border-black", darkMode ? "bg-gray-900/50 border-gray-700 text-white" : "bg-gray-50 border-gray-200")}
          >
            <option value="">Catégorie...</option>
            {(categories[form.type as keyof typeof categories] || categories.depenses).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input 
            type="number" 
            placeholder="Montant" 
            value={form.amount} 
            onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} 
            max={1000000} 
            min={0} 
            className={cn("w-full px-3 py-2 text-sm rounded-lg outline-none focus:border-black", darkMode ? "bg-gray-900/50 border-gray-700 text-white" : "bg-gray-50 border-gray-200")} 
          />
          {form.type === 'factures' && (
            <input 
              type="text" 
              placeholder="Chemin fichier (optionnel)" 
              value={form.filePath} 
              onChange={e => setForm(p => ({ ...p, filePath: e.target.value }))} 
              className={cn("w-full px-3 py-2 text-sm rounded-lg outline-none focus:border-black", darkMode ? "bg-gray-900/50 border-gray-700 text-white" : "bg-gray-50 border-gray-200")} 
            />
          )}
          <div className="flex gap-2">
            <button onClick={handleAdd} className="flex-1 py-2 bg-black text-white text-xs font-bold rounded-lg hover:bg-gray-800">AJOUTER</button>
            <button onClick={() => setIsAdding(false)} className={cn("px-3 py-2 text-xs font-bold rounded-lg transition-colors", darkMode ? "bg-gray-800 text-gray-400 hover:bg-gray-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>Annuler</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setIsAdding(true)} className="w-full py-2.5 rounded-xl text-xs font-bold mt-2 flex items-center justify-center gap-1" style={{border: '1.5px dashed ' + (darkMode ? 'rgba(255,255,255,.1)' : '#EEEEEE'), color: darkMode ? '#4B5563' : '#CCCCCC'}}>
          <Plus className="w-3 h-3" /> Nouvelle récurrence
        </button>
      )}
    </div>
  );
}

function CategoryManagerInline() {
  const { categories, addCategory, deleteCategory, theme, darkMode, currency } = useBudgetStore();
  const [newRev, setNewRev] = useState('');
  const [newDep, setNewDep] = useState('');
  const [newFact, setNewFact] = useState('');

  return (
    <div className="space-y-4">
      {/* Revenus */}
      <div>
        <div className="text-xs font-bold uppercase mb-2" style={{ color: theme.revenus, fontSize: 11, fontWeight: 800, letterSpacing: '0.12em' }}>Revenus</div>
        <div className="flex gap-1 mb-2">
          <input
            type="text" value={newRev} onChange={e => setNewRev(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && newRev.trim()) { addCategory('revenus', newRev.trim()); setNewRev(''); }}}
            placeholder="Nouvelle catégorie..."
            className={cn("flex-1 px-2 py-1.5 text-xs rounded-lg outline-none focus:border-black", darkMode ? "bg-gray-900/50 border-gray-700 text-white" : "bg-gray-50 border-gray-200")}
          />
          <button onClick={() => { if (newRev.trim()) { addCategory('revenus', newRev.trim()); setNewRev(''); }}} className={cn("px-2 py-1.5 rounded-lg transition-colors", darkMode ? "bg-gray-800 hover:bg-gray-700" : "bg-gray-100 hover:bg-gray-200")}>
            <Plus className={cn("w-3.5 h-3.5", darkMode ? "text-gray-400" : "text-gray-600")} />
          </button>
        </div>
        {categories.revenus.map(cat => (
          <div key={cat} className="flex items-center justify-between py-1.5 last:border-0" style={{ borderBottom: '1px solid ' + (darkMode ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.05)') }}>
            <span className="text-sm" style={{ color: darkMode ? '#E2E8F0' : '#3D4A5C' }}>{cat}</span>
            <button onClick={() => deleteCategory('revenus', cat)} className={cn("p-1 rounded transition-all opacity-50 hover:opacity-100", darkMode ? "hover:bg-red-900/30" : "hover:bg-red-50")} style={{color:'#EF4444'}}>
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Dépenses */}
      <div>
        <div className="text-xs font-bold uppercase mb-2" style={{ color: theme.depenses, fontSize: 11, fontWeight: 800, letterSpacing: '0.12em' }}>Dépenses</div>
        <div className="flex gap-1 mb-2">
          <input
            type="text" value={newDep} onChange={e => setNewDep(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && newDep.trim()) { addCategory('depenses', newDep.trim()); setNewDep(''); }}}
            placeholder="Nouvelle catégorie..."
            className={cn("flex-1 px-2 py-1.5 text-xs rounded-lg outline-none focus:border-black", darkMode ? "bg-gray-900/50 border-gray-700 text-white" : "bg-gray-50 border-gray-200")}
          />
          <button onClick={() => { if (newDep.trim()) { addCategory('depenses', newDep.trim()); setNewDep(''); }}} className={cn("px-2 py-1.5 rounded-lg transition-colors", darkMode ? "bg-gray-800 hover:bg-gray-700" : "bg-gray-100 hover:bg-gray-200")}>
            <Plus className={cn("w-3.5 h-3.5", darkMode ? "text-gray-400" : "text-gray-600")} />
          </button>
        </div>
        {categories.depenses.map(cat => (
          <div key={cat} className="flex items-center justify-between py-1.5 last:border-0" style={{ borderBottom: '1px solid ' + (darkMode ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.05)') }}>
            <span className="text-sm" style={{ color: darkMode ? '#E2E8F0' : '#3D4A5C' }}>{cat}</span>
            <button onClick={() => deleteCategory('depenses', cat)} className={cn("p-1 rounded transition-all opacity-50 hover:opacity-100", darkMode ? "hover:bg-red-900/30" : "hover:bg-red-50")} style={{color:'#EF4444'}}>
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Factures */}
      <div>
        <div className="text-xs font-bold uppercase mb-2" style={{ color: theme.accent, fontSize: 11, fontWeight: 800, letterSpacing: '0.12em' }}>Factures</div>
        <div className="flex gap-1 mb-2">
          <input
            type="text" value={newFact} onChange={e => setNewFact(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && newFact.trim()) { addCategory('factures', newFact.trim()); setNewFact(''); }}}
            placeholder="Nouvelle catégorie..."
            className={cn("flex-1 px-2 py-1.5 text-xs rounded-lg outline-none focus:border-black", darkMode ? "bg-gray-900/50 border-gray-700 text-white" : "bg-gray-50 border-gray-200")}
          />
          <button onClick={() => { if (newFact.trim()) { addCategory('factures', newFact.trim()); setNewFact(''); }}} className={cn("px-2 py-1.5 rounded-lg transition-colors", darkMode ? "bg-gray-800 hover:bg-gray-700" : "bg-gray-100 hover:bg-gray-200")}>
            <Plus className={cn("w-3.5 h-3.5", darkMode ? "text-gray-400" : "text-gray-600")} />
          </button>
        </div>
        {(categories.factures || []).map(cat => (
          <div key={cat} className="flex items-center justify-between py-1.5 last:border-0" style={{ borderBottom: '1px solid ' + (darkMode ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.05)') }}>
            <span className="text-sm" style={{ color: darkMode ? '#E2E8F0' : '#3D4A5C' }}>{cat}</span>
            <button onClick={() => deleteCategory('factures', cat)} className={cn("p-1 rounded transition-all opacity-50 hover:opacity-100", darkMode ? "hover:bg-red-900/30" : "hover:bg-red-50")} style={{color:'#EF4444'}}>
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Sub-components

function SummaryCard({ title, amount, prevAmount, icon, trendColor, inverseTrend, subtitle, noTrend, tooltip }: any) {
  const { currency } = useBudgetStore();
  const diff = amount - prevAmount;
  const percent = prevAmount ? Math.round((diff / prevAmount) * 100) : 0;
  const isPositive = diff >= 0;
  const isGood = inverseTrend ? !isPositive : isPositive;

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative group">
      {tooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-center">
          {tooltip}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
        </div>
      )}
      <div className="flex justify-between items-start mb-2">
        <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
        {!noTrend && (
          <div className={cn("text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1", isGood ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700")}>
            {isPositive ? '+' : ''}{percent}%
          </div>
        )}
      </div>
      <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</div>
      <div className={cn("text-2xl font-extrabold", trendColor)}>{formatCurrency(amount, currency)}</div>
      {subtitle && <div className="text-xs text-gray-400 mt-1 font-medium">{subtitle}</div>}
    </div>
  );
}

function TransactionRow({ transaction, onUpdate, onDelete }: { key?: any, transaction: any, onUpdate: (id: string, updates: any) => void, onDelete: (id: string) => void }) {
  const { showToast } = useToastStore();
  const { theme, darkMode, currency } = useBudgetStore();
  const [isHovered, setIsHovered] = useState(false);

  // Dark mode color palette
  const dk = {
    textTable: darkMode ? '#B0B8C8' : '#3D4A5C',
    textTableMuted: darkMode ? '#6B7590' : '#8896A8',
    tableBorderColor: darkMode ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.06)',
    tableHover: darkMode ? 'rgba(255,255,255,.04)' : 'rgba(0,0,0,.02)',
  };
  
  // Edit Reel
  const [isEditing, setIsEditing] = useState(false);
  const [editVal, setEditVal] = useState(transaction.reel.toString());

  const handleSave = () => {
    const val = parseFloat(editVal);
    if (isNaN(val) || val < 0) {
      showToast('Montant invalide', 'error');
      setEditVal(transaction.reel.toString());
      setIsEditing(false);
      return;
    }
    if (val > 1000000) {
      showToast(`Montant maximum : 1 000 000 ${currency === 'CHF' ? 'CHF' : currency === 'USD' ? '$' : '€'}`, 'error');
      setEditVal(transaction.reel.toString());
      setIsEditing(false);
      return;
    }
    onUpdate(transaction.id, { reel: val });
    setIsEditing(false);
  };

  return (
    <tr
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        borderBottom: '1px solid ' + dk.tableBorderColor,
        background: isHovered ? dk.tableHover : 'transparent',
        transition: 'background .15s',
      }}
    >
      <td className="px-2 sm:px-5 py-3.5 whitespace-nowrap" style={{ color: dk.textTableMuted, fontSize: 13, fontWeight: 400 }}>
        {format(parseISO(transaction.date || '2024-01-01'), 'dd MMM', { locale: fr })}
      </td>
      <td className="px-2 sm:px-5 py-3.5 whitespace-nowrap">
        <span style={{
          display: 'inline-block',
          padding: '4px 12px',
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 600,
          color: dk.textTable,
          background: transaction.type === 'revenus'
            ? `${theme.revenus}55`
            : transaction.type === 'factures'
              ? `${theme.accent}55`
              : `${theme.depenses}55`,
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: `1px solid ${
            transaction.type === 'revenus'
              ? `${theme.revenus}70`
              : transaction.type === 'factures'
                ? `${theme.accent}70`
                : `${theme.depenses}70`
          }`,
          boxShadow: `inset 0 1px 0 rgba(255,255,255,.40)`,
        }}>
          {transaction.category}
        </span>
      </td>
      <td className="hidden sm:table-cell px-2 sm:px-5 py-3.5 whitespace-nowrap" style={{ color: dk.textTableMuted, fontSize: 13 }}>
        {transaction.description || '–'}
      </td>
      <td className="hidden sm:table-cell px-2 sm:px-5 py-3.5 whitespace-nowrap text-center">
        <span style={{
          background: transaction.type === 'revenus' ? 'rgba(74,140,106,.12)' : transaction.type === 'factures' ? 'rgba(59,130,246,.12)' : 'rgba(217,107,107,.12)',
          color: transaction.type === 'revenus' ? theme.revenus : transaction.type === 'factures' ? theme.accent : theme.depenses,
          borderRadius: 10,
          padding: '4px 10px',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.04em',
        }}>
          {transaction.type === 'revenus' ? 'REV' : transaction.type === 'factures' ? 'FACT' : 'DÉP'}
        </span>
      </td>
      <td className="px-2 sm:px-5 py-3.5 whitespace-nowrap text-right" style={{ color: transaction.type === 'revenus' ? theme.revenus : transaction.type === 'factures' ? theme.accent : theme.depenses, fontWeight: 600, fontSize: 15 }}>
        {isEditing ? (
          <input autoFocus type="number" value={editVal}
            onChange={(e) => setEditVal(e.target.value)}
            onBlur={handleSave} onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            max={1000000}
            min={0}
            className="w-24 text-right p-1 rounded-lg outline-none"
            style={{border:'1.5px solid #28B980'}}
          />
        ) : (
          <span onClick={() => setIsEditing(true)} className="cursor-pointer">
            {transaction.type === 'revenus' ? '+' : '–'}{formatCurrency(transaction.reel, currency)}
          </span>
        )}
      </td>
      <td className="hidden sm:table-cell px-2 sm:px-5 py-3.5 whitespace-nowrap text-right">
        <button onClick={() => onDelete(transaction.id)}
          className="p-1.5 rounded-lg hover:bg-red-50 transition-all"
          style={{color:'#EF4444', opacity: 0.5, transition:'opacity .15s, color .15s'}}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = '#DC2626'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.5'; e.currentTarget.style.color = '#EF4444'; }}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
}

// --- Bouton création enveloppe ---
function NewEnveloppeButton({ onAdd }: { onAdd: (nom: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [val, setVal] = useState('');

  const handleAdd = () => {
    if (val.trim()) {
      onAdd(val.trim());
      setVal('');
      setIsOpen(false);
    }
  };

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} className="text-xs font-bold flex items-center gap-1" style={{color:'#AAAAAA'}}>
        <Plus className="w-3 h-3" /> Ajouter
      </button>
    );
  }

  return (
    <div className="flex gap-1">
      <input
        autoFocus
        type="text"
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setIsOpen(false); }}
        placeholder="Nom..."
        className="w-24 px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-black"
      />
      <button onClick={handleAdd} className="px-2 py-1 bg-black text-white text-xs rounded-lg">OK</button>
    </div>
  );
}

// --- Carte enveloppe avec mouvements ---
function EnveloppeCard({ enveloppe, moisCourant, viewMode, currentYear, onAddMouvement, onDeleteMouvement, onDelete, darkMode }: {
  key?: string;
  enveloppe: Enveloppe;
  moisCourant: string;
  viewMode: 'month' | 'year';
  currentYear: string;
  onAddMouvement: (m: Omit<EnvelopMouvement, 'id'>) => void;
  onDeleteMouvement: (id: string) => void;
  onDelete: () => void;
  darkMode: boolean;
}) {
  const { showToast } = useToastStore();
  const { currency } = useBudgetStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [addType, setAddType] = useState<'depot' | 'retrait'>('depot');
  const [addMontant, setAddMontant] = useState('');
  const [addDesc, setAddDesc] = useState('');
  const [envViewMode, setEnvViewMode] = useState<'month' | 'year'>('month');

  // Mouvements de la période affichée
  const mouvementsPeriode = enveloppe.mouvements.filter(m => {
    if (envViewMode === 'month') return m.date.startsWith(moisCourant);
    return m.date.startsWith(currentYear);
  });

  // Solde TOTAL cumulatif (tous les mouvements depuis le début)
  const solde = enveloppe.mouvements.reduce((acc, m) => acc + m.montant, 0);

  // Solde de la période (pour info)
  const soldePeriode = mouvementsPeriode.reduce((acc, m) => acc + m.montant, 0);

  const handleAdd = () => {
    const val = parseFloat(addMontant);
    if (!val || val <= 0) return;
    if (val > 1000000) {
      showToast(`Montant maximum : 1 000 000 ${currency === 'CHF' ? 'CHF' : currency === 'USD' ? '$' : '€'}`, 'error');
      return;
    }
    const montant = addType === 'retrait' ? -val : val;
    onAddMouvement({
      date: `${moisCourant}-01`,
      description: addDesc || (addType === 'depot' ? 'Dépôt' : 'Retrait'),
      montant,
    });
    setAddMontant('');
    setAddDesc('');
    setIsAdding(false);
  };

  return (
    <div style={{borderBottom: darkMode ? '1px solid rgba(255,255,255,.06)' : '1px solid #F4F6FA'}}>
      <div className="flex flex-wrap items-center justify-between py-3 gap-2">
        <button onClick={() => setIsExpanded(!isExpanded)} className="flex items-center gap-2 flex-1 text-left">
          <span className="font-bold text-sm" style={{color: darkMode ? '#E8EAF0' : '#1A1F3C'}}>{enveloppe.nom}</span>
          <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", isExpanded && "rotate-180")} style={{color: darkMode ? '#5A6278' : '#CCCCCC'}} />
        </button>

        <div className="flex items-center gap-1 mx-2">
          <button
            onClick={(e) => { e.stopPropagation(); setEnvViewMode('month'); }}
            className="text-[10px] font-black uppercase transition-colors"
            style={{ color: envViewMode === 'month' ? (darkMode ? '#E8EAF0' : '#1A1F3C') : (darkMode ? '#5A6278' : '#CCCCCC') }}
          >
            Mois
          </button>
          <span className="text-[10px]" style={{ color: darkMode ? '#5A6278' : '#E5E7EB' }}>/</span>
          <button
            onClick={(e) => { e.stopPropagation(); setEnvViewMode('year'); }}
            className="text-[10px] font-black uppercase transition-colors"
            style={{ color: envViewMode === 'year' ? (darkMode ? '#E8EAF0' : '#1A1F3C') : (darkMode ? '#5A6278' : '#CCCCCC') }}
          >
            Année
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-black" style={{color: solde >= 0 ? '#28B980' : '#E83A52'}}>
            {solde >= 0 ? '+' : ''}{formatCurrency(solde, currency)}
          </span>
          <button
            onClick={() => { setIsAdding(!isAdding); setIsExpanded(true); }}
            className="w-6 h-6 text-white rounded-full flex items-center justify-center"
            style={{backgroundColor: darkMode ? '#3B4565' : '#1A1F3C'}}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Formulaire ajout mouvement */}
      {isAdding && (
        <div className={cn("px-4 pb-3 space-y-2 border-t pt-3", darkMode ? "border-white/10" : "border-gray-100")}>
          {/* Toggle dépôt / retrait */}
          <div className={cn("flex p-0.5 rounded-lg", darkMode ? "bg-white/5" : "bg-gray-200")}>
            <button
              onClick={() => setAddType('depot')}
              className={cn("flex-1 py-1 rounded-md text-xs font-bold transition-all", addType === 'depot' ? (darkMode ? "bg-gray-700 text-emerald-400 shadow-sm" : "bg-white text-emerald-600 shadow-sm") : "text-gray-500")}
            >
              + Dépôt
            </button>
            <button
              onClick={() => setAddType('retrait')}
              className={cn("flex-1 py-1 rounded-md text-xs font-bold transition-all", addType === 'retrait' ? (darkMode ? "bg-gray-700 text-red-400 shadow-sm" : "bg-white text-red-500 shadow-sm") : "text-gray-500")}
            >
              − Retrait
            </button>
          </div>
          <input
            autoFocus
            type="number"
            placeholder="Montant"
            value={addMontant}
            onChange={e => setAddMontant(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            max={1000000}
            min={0}
            className={cn(
              "w-full px-3 py-2 text-sm border rounded-lg outline-none focus:border-black font-bold",
              darkMode ? "bg-white/5 border-white/10 text-[#E8EAF0]" : "bg-white border-gray-200 text-[#1A1F3C]"
            )}
          />
          <input
            type="text"
            placeholder="Description (ex: Bowling)"
            value={addDesc}
            onChange={e => setAddDesc(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            className={cn(
              "w-full px-3 py-2 text-xs border rounded-lg outline-none focus:border-black",
              darkMode ? "bg-white/5 border-white/10 text-[#E8EAF0]" : "bg-white border-gray-200 text-[#1A1F3C]"
            )}
          />
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className={cn("flex-1 py-2 text-xs font-bold rounded-lg transition-colors", darkMode ? "bg-white text-black hover:bg-gray-200" : "bg-black text-white hover:bg-gray-800")}
            >
              AJOUTER
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className={cn("px-3 py-2 text-xs font-bold rounded-lg transition-colors", darkMode ? "bg-white/10 text-gray-300 hover:bg-white/20" : "bg-gray-200 text-gray-600 hover:bg-gray-300")}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Historique des mouvements */}
      {isExpanded && mouvementsPeriode.length > 0 && (
        <div className={cn("border-t", darkMode ? "border-white/10" : "border-gray-100")}>
          <div className="max-h-48 overflow-y-auto">
            {[...mouvementsPeriode].reverse().map((m) => (
              <div key={m.id} className={cn("flex items-center justify-between px-4 py-2 group", darkMode ? "hover:bg-white/5" : "hover:bg-gray-100")}>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate" style={{ color: darkMode ? '#E8EAF0' : '#374151' }}>{m.description}</div>
                  <div className="text-[10px]" style={{ color: darkMode ? '#5A6278' : '#9CA3AF' }}>{m.date.substring(0, 7)}</div>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <span className={cn("text-xs font-bold", m.montant >= 0 ? "text-emerald-600" : "text-red-500")}>
                    {m.montant >= 0 ? '+' : ''}{formatCurrency(m.montant, currency)}
                  </span>
                  <button
                    onClick={() => onDeleteMouvement(m.id)}
                    className={cn("p-1 rounded transition-all", darkMode ? "hover:bg-red-500/20" : "hover:bg-red-50")}
                    style={{color:'#EF4444', opacity: 0.5}}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = '#DC2626'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.5'; e.currentTarget.style.color = '#EF4444'; }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {isExpanded && mouvementsPeriode.length === 0 && (
        <div className={cn("border-t px-4 py-3 text-xs text-center", darkMode ? "border-white/10 text-gray-500" : "border-gray-100 text-gray-400")}>
          Aucun mouvement sur cette période
        </div>
      )}

      {/* Footer : supprimer enveloppe */}
      {isExpanded && (
        <div className={cn("border-t px-4 py-2 flex justify-end", darkMode ? "border-white/10" : "border-gray-100")}>
          <button
            onClick={onDelete}
            className={cn("text-[10px] flex items-center gap-1 px-2 py-1 rounded transition-all", darkMode ? "hover:bg-red-500/20" : "hover:bg-red-50")}
            style={{color:'#EF4444', opacity: 0.6}}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = '#DC2626'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.6'; e.currentTarget.style.color = '#EF4444'; }}
          >
            <Trash2 className="w-3 h-3" /> Supprimer l'enveloppe
          </button>
        </div>
      )}
    </div>
  );
}
