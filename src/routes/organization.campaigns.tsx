import { createFileRoute } from '@tanstack/react-router';
import { OrganizationPage } from '@/components/prooffund/workspace-pages';
import { pageHead } from '@/lib/page-head';
export const Route = createFileRoute('/organization/campaigns')({
 head: () => pageHead('Organization campaigns | ProofFund', 'Review the organization campaign portfolio and accountable impact.'),
 component: OrganizationPage,
});
