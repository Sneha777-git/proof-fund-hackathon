import { createFileRoute } from '@tanstack/react-router';
import { DashboardPage } from '@/components/prooffund/workspace-pages';
import { pageHead } from '@/lib/page-head';
export const Route = createFileRoute('/dashboard/organization')({
 head: () => pageHead('Organization dashboard | ProofFund', 'Track portfolio utilization, compliance and transparent outcomes.'),
 component: () => <DashboardPage role="organization" />,
});
