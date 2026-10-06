import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from '@/components/prooffund/home';
import { pageHead } from '@/lib/page-head';
export const Route = createFileRoute("/")({
  head: () => pageHead("ProofFund | Don't Just Trust. Verify.", "Fund ideas. Release money by proof. Discover transparent crowdfunding with protected escrow, measurable milestones and verifiable evidence."),
  component: HomePage,
});
