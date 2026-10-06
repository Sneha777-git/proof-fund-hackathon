import { createFileRoute } from '@tanstack/react-router';
import { ManagePage } from '@/components/prooffund/workspace-pages';
import { pageHead } from '@/lib/page-head';
export const Route = createFileRoute('/campaign/$id/manage')({
 head: () => pageHead('Manage campaign | ProofFund', 'Manage evidence, milestones and protected allocations.'),
 component: Page,
});
function Page() { const { id }=Route.useParams(); return <ManagePage id={id}/>; }
