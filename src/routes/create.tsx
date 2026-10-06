import { createFileRoute } from '@tanstack/react-router';
import { CreatePage } from '@/components/prooffund/action-pages';
import { pageHead } from '@/lib/page-head';
export const Route = createFileRoute('/create')({
 head: () => pageHead('Create a campaign | ProofFund', 'Build a milestone funding plan with balanced allocations and a security stake.'),
 component: CreatePage,
});
