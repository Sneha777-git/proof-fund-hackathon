import { createFileRoute } from '@tanstack/react-router';
import { SettingsPage } from '@/components/prooffund/workspace-pages';
import { pageHead } from '@/lib/page-head';
export const Route = createFileRoute('/settings')({
 head: () => pageHead('Account settings | ProofFund', 'Manage milestone updates and governance notification preferences.'),
 component: SettingsPage,
});
