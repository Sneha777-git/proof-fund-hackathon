import { createFileRoute } from '@tanstack/react-router';
import { DashboardPage } from '@/components/prooffund/workspace-pages';
import { pageHead } from '@/lib/page-head';
export const Route = createFileRoute('/dashboard/creator')({
 head: () => pageHead('Creator dashboard | ProofFund', 'Manage campaigns, funding, evidence and milestones.'),
 component: () => <DashboardPage role="creator" />,
});
