import { createFileRoute } from '@tanstack/react-router';
import { OrganizationPage } from '@/components/prooffund/workspace-pages';
import { pageHead } from '@/lib/page-head';
export const Route = createFileRoute('/organization/reports')({
 head: () => pageHead('Verification reports | ProofFund', 'Review evidence, compliance and fund utilization reports.'),
 component: () => <OrganizationPage reports />,
});
