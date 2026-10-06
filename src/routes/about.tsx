import { createFileRoute } from '@tanstack/react-router';
import { AboutPage } from '@/components/prooffund/public-pages';
import { pageHead } from '@/lib/page-head';
export const Route = createFileRoute('/about')({
 head: () => pageHead('About ProofFund | ProofFund', 'Transparent funding beyond the fundraising bar.'),
 component: AboutPage,
});
