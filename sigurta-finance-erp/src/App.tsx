import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Ledger from "./pages/Ledger";
import Finance from "./pages/Finance";
import FinanceDistribution from "./pages/FinanceDistribution";
import Reports from "./pages/Reports";
import FinanceDashboard from "./pages/FinanceDashboard";
import JournalEntries from "./pages/JournalEntries";
import ChartOfAccounts from "./pages/ChartOfAccounts";
import FinancialReports from "./pages/FinancialReports";
import Expenses from "./pages/Expenses";
import TransactionsByDate from "./pages/TransactionsByDate";
import AccountBalancesReport from "./pages/AccountBalancesReport";
import DailyLedgerReport from "./pages/DailyLedgerReport";
import TransactionsSummaryReport from "./pages/TransactionsSummaryReport";
import AccountsListReport from "./pages/AccountsListReport";
import TrialBalanceReport from "./pages/TrialBalanceReport";
import YearlyTrialBalanceReport from "./pages/YearlyTrialBalanceReport";
import TransactionsSummaryByWeekReport from "./pages/TransactionsSummaryByWeekReport";
import CostCentersListReport from "./pages/CostCentersListReport";
import GeneralLedgerFullReport from "./pages/GeneralLedgerFullReport";
import GeneralLedgerByDealerReport from "./pages/GeneralLedgerByDealerReport";
import DepreciationReport from "./pages/DepreciationReport";
import FinalCostReport from "./pages/FinalCostReport";
import FinalProfitReport from "./pages/FinalProfitReport";
import QuickJournalEntry from "./pages/QuickJournalEntry";
import DealersManagement from "./pages/DealersManagement";
import UsersManagement from "./pages/UsersManagement";
import BanksManagement from "./pages/BanksManagement";
import CurrenciesManagement from "./pages/CurrenciesManagement";
import TransactionsByDateReport from "./pages/TransactionsByDateReport";
import TransactionsByNumberReport from "./pages/TransactionsByNumberReport";
import TransactionsByTypeReport from "./pages/TransactionsByTypeReport";
import UserPermissionsManagement from "./pages/UserPermissionsManagement";

function Protected({ children }: { children: React.ReactElement }) {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("auth_token");

  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <Protected>
            <Dashboard />
          </Protected>
        }
      />
      <Route
        path="/ledger"
        element={
          <Protected>
            <Ledger />
          </Protected>
        }
      />
      <Route
        path="/finance"
        element={
          <Protected>
            <Finance />
          </Protected>
        }
      />
      <Route
        path="/finance-distribution"
        element={
          <Protected>
            <FinanceDistribution />
          </Protected>
        }
      />
      <Route
        path="/reports"
        element={
          <Protected>
            <Reports />
          </Protected>
        }
      />
      <Route
        path="/finance-dashboard"
        element={
          <Protected>
            <FinanceDashboard />
          </Protected>
        }
      />
      <Route
        path="/journal-entries"
        element={
          <Protected>
            <JournalEntries />
          </Protected>
        }
      />
      <Route
        path="/chart-of-accounts"
        element={
          <Protected>
            <ChartOfAccounts />
          </Protected>
        }
      />
      <Route
        path="/financial-reports"
        element={
          <Protected>
            <FinancialReports />
          </Protected>
        }
      />
      <Route
        path="/expenses"
        element={
          <Protected>
            <Expenses />
          </Protected>
        }
      />
      <Route
        path="/transactions-by-date"
        element={
          <Protected>
            <TransactionsByDate />
          </Protected>
        }
      />
      <Route
        path="/account-balances-report"
        element={
          <Protected>
            <AccountBalancesReport />
          </Protected>
        }
      />
      <Route
        path="/daily-ledger-report"
        element={
          <Protected>
            <DailyLedgerReport />
          </Protected>
        }
      />
      <Route
        path="/transactions-summary-report"
        element={
          <Protected>
            <TransactionsSummaryReport />
          </Protected>
        }
      />
      <Route
        path="/accounts-list-report"
        element={
          <Protected>
            <AccountsListReport />
          </Protected>
        }
      />
      <Route
        path="/trial-balance-report"
        element={
          <Protected>
            <TrialBalanceReport />
          </Protected>
        }
      />
      <Route
        path="/yearly-trial-balance-report"
        element={
          <Protected>
            <YearlyTrialBalanceReport />
          </Protected>
        }
      />
      <Route
        path="/transactions-summary-by-week-report"
        element={
          <Protected>
            <TransactionsSummaryByWeekReport />
          </Protected>
        }
      />
      <Route
        path="/cost-centers-list-report"
        element={
          <Protected>
            <CostCentersListReport />
          </Protected>
        }
      />
      <Route
        path="/general-ledger-full-report"
        element={
          <Protected>
            <GeneralLedgerFullReport />
          </Protected>
        }
      />
      <Route
        path="/general-ledger-by-dealer-report"
        element={
          <Protected>
            <GeneralLedgerByDealerReport />
          </Protected>
        }
      />
      <Route
        path="/depreciation-report"
        element={
          <Protected>
            <DepreciationReport />
          </Protected>
        }
      />
      <Route
        path="/final-cost-report"
        element={
          <Protected>
            <FinalCostReport />
          </Protected>
        }
      />
      <Route
        path="/final-profit-report"
        element={
          <Protected>
            <FinalProfitReport />
          </Protected>
        }
      />
      <Route
        path="/quick-journal-entry"
        element={
          <Protected>
            <QuickJournalEntry />
          </Protected>
        }
      />
      <Route
        path="/dealers-management"
        element={
          <Protected>
            <DealersManagement />
          </Protected>
        }
      />
      <Route
        path="/users-management"
        element={
          <Protected>
            <UsersManagement />
          </Protected>
        }
      />
      <Route
        path="/banks-management"
        element={
          <Protected>
            <BanksManagement />
          </Protected>
        }
      />
      <Route
        path="/currencies-management"
        element={
          <Protected>
            <CurrenciesManagement />
          </Protected>
        }
      />
      <Route
        path="/transactions-by-date-report"
        element={
          <Protected>
            <TransactionsByDateReport />
          </Protected>
        }
      />
      <Route
        path="/transactions-by-number-report"
        element={
          <Protected>
            <TransactionsByNumberReport />
          </Protected>
        }
      />
      <Route
        path="/transactions-by-type-report"
        element={
          <Protected>
            <TransactionsByTypeReport />
          </Protected>
        }
      />
      <Route
        path="/user-permissions-management"
        element={
          <Protected>
            <UserPermissionsManagement />
          </Protected>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
