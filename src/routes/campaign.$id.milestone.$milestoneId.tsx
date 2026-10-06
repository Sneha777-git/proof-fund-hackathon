import { createFileRoute } from '@tanstack/react-router';
import { MilestonePage } from '@/components/prooffund/campaign-pages';
import { pageHead } from '@/lib/page-head';
export const Route = createFileRoute('/campaign/$id/milestone/$milestoneId')({
 head: () => pageHead('Milestone evidence | ProofFund', 'Inspect evidence, verification, governance and release state.'),
 component: Page,
});
function Page() { const { id, milestoneId }=Route.useParams(); return <MilestonePage id={id} milestoneId={milestoneId} manage/>; }
