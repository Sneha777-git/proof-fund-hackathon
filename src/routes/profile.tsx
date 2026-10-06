import { createFileRoute } from '@tanstack/react-router';
import { ProfilePage } from '@/components/prooffund/workspace-pages';
import { pageHead } from '@/lib/page-head';
export const Route = createFileRoute('/profile')({
 head: () => pageHead('Your profile | ProofFund', 'Manage your public ProofFund identity in this demo session.'),
 component: ProfilePage,
});
