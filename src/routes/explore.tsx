import { createFileRoute } from '@tanstack/react-router';
import { ExplorePage } from '@/components/prooffund/campaign-pages';
import { pageHead } from '@/lib/page-head';
export const Route = createFileRoute('/explore')({
 head: () => pageHead('Explore campaigns | ProofFund', 'Discover accountable campaigns with protected funding and verified milestones.'),
 component: ExplorePage,
});
