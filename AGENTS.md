<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Application architecture
- Use TanStack file routes with page-specific metadata and a shared ProofFund shell; keeps navigation type-safe and every page independently shareable.
- Keep isolated demo campaign data and local-only services outside page components; real wallet, storage and blockchain integrations can replace the services without redesigning the interface.
- Keep product views in domain-grouped ProofFund modules with semantic tokens in the global stylesheet; ensures consistent financial states, responsive layouts and accessible motion.
- Demo interactions are session-only and never create transaction hashes or claim live records; prevents confusing prototype activity with real fund movement.
