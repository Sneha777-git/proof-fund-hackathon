import { createFileRoute, Outlet } from '@tanstack/react-router';
export const Route = createFileRoute('/campaign/$id')({ component: Outlet });
