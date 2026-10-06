import { createFileRoute } from '@tanstack/react-router';
import { CampaignPage } from '@/components/prooffund/campaign-pages';
import { pageHead } from '@/lib/page-head';
export const Route = createFileRoute('/campaign/$id/')({
 head: () => pageHead('Campaign accountability | ProofFund', 'Follow campaign allocations, funding and evidence-backed milestones.'),
 component: Page,
});
function Page() { const { id }=Route.useParams(); return <CampaignPage id={id}/>; }
