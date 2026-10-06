import { createFileRoute } from '@tanstack/react-router';
import { TransactionsPage } from '@/components/prooffund/workspace-pages';
import { pageHead } from '@/lib/page-head';
export const Route = createFileRoute('/transactions')({
 head: () => pageHead('Transaction activity | ProofFund', 'Preview contribution, stake and release activity without real transactions.'),
 component: TransactionsPage,
});
