import { createFileRoute } from '@tanstack/react-router';
import { DashboardPage } from '@/components/prooffund/workspace-pages';
import { pageHead } from '@/lib/page-head';
export const Route = createFileRoute('/dashboard/donor')({
 head: () => pageHead('Donor dashboard | ProofFund', 'Follow backed campaigns, protected balances and milestone decisions.'),
 component: () => <DashboardPage role="donor" />,
});
