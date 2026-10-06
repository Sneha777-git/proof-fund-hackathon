import { createFileRoute } from '@tanstack/react-router';
import { DisputePage } from '@/components/prooffund/action-pages';
import { pageHead } from '@/lib/page-head';
export const Route = createFileRoute('/campaign/$id/dispute/$milestoneId')({
 head: () => pageHead('Dispute protection | ProofFund', 'Keep funds protected while milestone concerns are reviewed.'),
 component: Page,
});
function Page() { const { id, milestoneId }=Route.useParams(); return <DisputePage id={id} milestoneId={milestoneId}/>; }
