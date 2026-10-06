import { createFileRoute } from '@tanstack/react-router';
import { VotePage } from '@/components/prooffund/action-pages';
import { pageHead } from '@/lib/page-head';
export const Route = createFileRoute('/campaign/$id/vote/$milestoneId')({
 head: () => pageHead('Milestone voting | ProofFund', 'Review evidence and preview contribution-snapshot voting.'),
 component: Page,
});
function Page() { const { id, milestoneId }=Route.useParams(); return <VotePage id={id} milestoneId={milestoneId}/>; }
