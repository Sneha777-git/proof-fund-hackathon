import { createFileRoute } from '@tanstack/react-router';
import { HowItWorksPage } from '@/components/prooffund/public-pages';
import { pageHead } from '@/lib/page-head';
export const Route = createFileRoute('/how-it-works')({
 head: () => pageHead('How it works | ProofFund', 'Follow every contribution through escrow, evidence, approval and protected release.'),
 component: HowItWorksPage,
});
