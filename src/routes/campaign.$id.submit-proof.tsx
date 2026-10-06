import { createFileRoute } from '@tanstack/react-router';
import { SubmitProofPage } from '@/components/prooffund/action-pages';
import { pageHead } from '@/lib/page-head';
export const Route = createFileRoute('/campaign/$id/submit-proof')({
 head: () => pageHead('Submit milestone proof | ProofFund', 'Prepare a local evidence fingerprint for milestone review.'),
 component: Page,
});
function Page() { const { id }=Route.useParams(); return <SubmitProofPage id={id}/>; }
