import { createFileRoute } from '@tanstack/react-router';
import { VerifyPage } from '@/components/prooffund/public-pages';
import { pageHead } from '@/lib/page-head';
export const Route = createFileRoute('/verify')({
 head: () => pageHead('Verify proof | ProofFund', 'Calculate document fingerprints locally and compare evidence integrity.'),
 component: VerifyPage,
});
