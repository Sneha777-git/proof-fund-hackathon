import { createFileRoute } from '@tanstack/react-router';
import { RefundsPage } from '@/components/prooffund/action-pages';
import { pageHead } from '@/lib/page-head';
export const Route = createFileRoute('/refunds')({
 head: () => pageHead('Refund eligibility | ProofFund', 'Preview protection and refund eligibility when campaigns fail.'),
 component: RefundsPage,
});
