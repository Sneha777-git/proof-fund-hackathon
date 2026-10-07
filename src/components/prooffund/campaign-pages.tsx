import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Search,
  ArrowUpRight,
  ArrowLeft,
  Share2,
  LockKeyhole,
  FileCheck2,
  Check,
  ArrowRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  campaigns,
  milestones,
  money,
  compactMoney,
} from "@/lib/demo-data";

import {
  getCampaignDetails,
  getMilestone,
  getMilestones,
} from "@/lib/blockchain/campaign";

import {
  Badge,
  CampaignCard,
  Empty,
  PageHeading,
  Progress,
  Row,
} from "./primitives";

import { Modal, useApp } from "./shell";

/* =========================================================
   EXPLORE
========================================================= */

export function ExplorePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All verification");
  const [funding, setFunding] = useState("All funding");
  const [sort, setSort] = useState("Featured");

  const filtered = campaigns
    .filter(
      (c) =>
        (category === "All" || category === c.category) &&
        (status === "All verification" || c.status === status) &&
        (funding === "All funding" ||
          (funding === "Over 75% funded"
            ? c.raised / c.goal >= 0.75
            : c.raised / c.goal < 0.75)) &&
        (c.title + " " + c.creator + " " + c.description)
          .toLowerCase()
          .includes(search.toLowerCase())
    )
    .sort((a, b) =>
      sort === "Funding progress"
        ? b.raised / b.goal - a.raised / a.goal
        : sort === "Deadline"
          ? a.days - b.days
          : sort === "Newest"
            ? b.id.localeCompare(a.id)
            : 0
    );

  return (
    <main className="container page">
      <PageHeading
        eyebrow="Discover meaningful impact"
        title="Ideas worth backing."
        description="Explore campaigns where every milestone comes with accountability."
        action={<Badge tone="muted">Demo campaigns</Badge>}
      />

      <div className="filters">
        <label className="search-field">
          <span className="sr-only">Search campaigns</span>
          <Search />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campaigns, creators, or causes…"
          />
        </label>

        <select
          aria-label="Verification status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option>All verification</option>
          <option>Verified</option>
          <option>In review</option>
        </select>

        <select
          aria-label="Funding status"
          value={funding}
          onChange={(e) => setFunding(e.target.value)}
        >
          <option>All funding</option>
          <option>Over 75% funded</option>
          <option>Under 75% funded</option>
        </select>

        <select
          aria-label="Sort campaigns"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          {[
            "Featured",
            "Newest",
            "Funding progress",
            "Deadline",
          ].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="filter-tabs">
        {["All", "Technology", "Community", "Climate"].map(
          (c) => (
            <Button
              variant={
                category === c ? "secondary" : "ghost"
              }
              size="sm"
              key={c}
              onClick={() => setCategory(c)}
            >
              {c}
            </Button>
          )
        )}
      </div>

      <div className="mb-5 text-xs text-muted-foreground">
        {filtered.length} campaigns · Demo data
      </div>

      <div className="campaign-grid">
        {filtered.map((c) => (
          <CampaignCard
            campaign={c}
            key={c.id}
          />
        ))}
      </div>

      {!filtered.length && (
        <Empty>
          No campaigns match your filters.
        </Empty>
      )}
    </main>
  );
}

/* =========================================================
   CAMPAIGN PAGE
========================================================= */

export function CampaignPage({
  id,
}: {
  id: string;
}) {
  const c = campaigns.find(
    (campaign) => campaign.id === id
  );

  const { notify } = useApp();

  const [donate, setDonate] = useState(false);

  const [chainMilestones, setChainMilestones] =
    useState<
      Awaited<ReturnType<typeof getMilestones>>
    >([]);

  const [loadingMilestones, setLoadingMilestones] =
    useState(true);

  const [milestoneError, setMilestoneError] =
    useState("");

  const [chainData, setChainData] =
    useState<
      Awaited<ReturnType<typeof getCampaignDetails>>
      | null
    >(null);

  const [loadingChainData, setLoadingChainData] =
    useState(true);

  const [chainError, setChainError] =
    useState("");

  /* ---------- Load milestones ---------- */

  useEffect(() => {
    getMilestones(3)
      .then(setChainMilestones)
      .catch((error: unknown) => {
        console.error(error);

        setMilestoneError(
          error instanceof Error
            ? error.message
            : "Failed to load milestones"
        );
      })
      .finally(() => {
        setLoadingMilestones(false);
      });
  }, []);

  /* ---------- Load campaign ---------- */

  useEffect(() => {
    let cancelled = false;

    async function loadCampaign() {
      try {
        setLoadingChainData(true);
        setChainError("");

        const data =
          await getCampaignDetails();

        if (!cancelled) {
          setChainData(data);
        }
      } catch (error: unknown) {
        console.error(
          "Failed to load ProofFund campaign:",
          error
        );

        if (!cancelled) {
          setChainError(
            error instanceof Error
              ? error.message
              : "Unable to read campaign from Sepolia."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingChainData(false);
        }
      }
    }

    loadCampaign();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!c) {
    return (
      <main className="container page">
        <PageHeading
          eyebrow="Campaign unavailable"
          title="This campaign wasn't found."
        />

        <Button asChild>
          <Link to="/explore">
            Explore campaigns
          </Link>
        </Button>
      </main>
    );
  }

  const goal = chainData
    ? Number(chainData.goal)
    : 0;

  const raised = chainData
    ? Number(chainData.totalRaised)
    : 0;

  const released = chainData
    ? Number(chainData.totalReleased)
    : 0;

  const pct =
    goal > 0
      ? Math.min(
          100,
          Math.round((raised / goal) * 100)
        )
      : 0;

  const deadlineText = chainData
    ? new Date(
        chainData.deadline * 1000
      ).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : c.deadline;

  const campaignState = chainData
    ? [
        "Funding",
        "Active",
        "Failed",
        "Completed",
      ][chainData.campaignState] ??
      "Unknown"
    : "Loading";

  return (
    <main className="container page">
      <div className="breadcrumb">
        <Link
          to="/explore"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="size-3" />
          Explore campaigns
        </Link>

        <span>/</span>

        {c.category}
      </div>

      <PageHeading
        eyebrow={c.category}
        title={c.title}
        description={`By ${c.creator} · Deadline ${deadlineText}`}
        action={
          <Button
            variant="outline"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(
                  location.href
                );

                notify("Campaign link copied.");
              } catch {
                notify(
                  "Sharing is unavailable in this browser."
                );
              }
            }}
          >
            <Share2 />
            Share
          </Button>
        }
      />

      <div className="two-col">
        <div>
          <img
            className="detail-image"
            src={c.image}
            alt={c.title}
            width={1024}
            height={640}
          />

          <div className="detail-summary">
            <h2>
              Turning ambition into accountable impact.
            </h2>

            <p className="section-description">
              {c.description} Every contribution
              supports a defined plan, and every release
              depends on evidence. Our team publishes
              progress, expenses and milestone results
              for community review.
            </p>
          </div>

          <div className="timeline">
            <div className="eyebrow">
              Where your money goes
            </div>

            {loadingMilestones ? (
              <div className="panel">
                <p className="text-sm text-muted-foreground">
                  Loading milestone data from Sepolia...
                </p>
              </div>
            ) : milestoneError ? (
              <div className="panel">
                <p className="text-sm text-destructive">
                  Failed to load milestones.
                </p>

                <p className="note">
                  {milestoneError}
                </p>
              </div>
            ) : (
              chainMilestones.map((m, i) => (
                <Link
                  key={i}
                  to="/campaign/$id/milestone/$milestoneId"
                  params={{
                    id: c.id,
                    milestoneId: String(i),
                  }}
                  className="milestone-row"
                >
                  <span className="milestone-number">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <div className="milestone-info">
                    <h3>{m.description}</h3>

                    <p>
                      Deadline{" "}
                      {new Date(
                        m.deadline * 1000
                      ).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  <div className="milestone-finance">
                    <strong>
                      {m.amount} ETH
                    </strong>

                    <Badge
                      tone={
                        m.stateLabel === "Released"
                          ? "success"
                          : m.stateLabel ===
                                "Rejected" ||
                              m.stateLabel === "Failed"
                            ? "warning"
                            : "muted"
                      }
                    >
                      {m.stateLabel}
                    </Badge>
                  </div>

                  <ArrowUpRight className="size-4 text-muted-foreground" />
                </Link>
              ))
            )}
          </div>
        </div>

        <aside className="stack">
          <div className="panel">
            <Badge tone="success">
              {loadingChainData
                ? "Reading Sepolia..."
                : chainError
                  ? "Blockchain unavailable"
                  : "Live on Sepolia"}
            </Badge>

            {chainError && (
              <p className="note mt-4">
                {chainError}
              </p>
            )}

            <div className="amount-large mt-6">
              {loadingChainData
                ? "..."
                : `${raised.toFixed(4)} ETH`}
            </div>

            <p>
              raised of{" "}
              {loadingChainData
                ? "..."
                : `${goal.toFixed(4)} ETH`}{" "}
              goal
            </p>

            <Progress value={pct} />

            <div className="flex justify-between text-xs mt-3">
              <span>
                {loadingChainData
                  ? "Loading..."
                  : `${pct}% funded`}
              </span>

              <span className="text-muted-foreground">
                {loadingChainData
                  ? "..."
                  : deadlineText}
              </span>
            </div>

            <Button
              className="w-full mt-7"
              size="lg"
              onClick={() => setDonate(true)}
            >
              Back this campaign
              <ArrowUpRight />
            </Button>

            <Row label="Campaign state">
              {campaignState}
            </Row>

            <Row label="Creator stake">
              {chainData
                ? `${chainData.securityStake} ETH`
                : "..."}
            </Row>

            <Row label="Released">
              {chainData
                ? `${released} ETH`
                : "..."}
            </Row>
          </div>

          <div className="panel">
            <h2>Fund flow</h2>

            <Row label="Total raised">
              {chainData
                ? `${raised} ETH`
                : "..."}
            </Row>

            <Row label="Released">
              {chainData
                ? `${released} ETH`
                : "..."}
            </Row>

            <Row label="Locked in escrow">
              {chainData
                ? `${Math.max(
                    raised - released,
                    0
                  )} ETH`
                : "..."}
            </Row>

            <p className="note">
              Approval is not a release. Funds remain
              locked throughout dispute protection.
            </p>
          </div>

          <div className="panel">
            <h2>Protocol status</h2>

            {[
              "Creator stake deposited",
              "Funds held in escrow",
              "Milestones defined",
              "Evidence submitted",
              "Governance enabled",
              "Dispute protection enabled",
            ].map((status) => (
              <div
                className="flex gap-2 items-center py-2 text-xs"
                key={status}
              >
                <Check className="size-3 text-success" />

                {status}

                <span className="text-muted-foreground ml-auto text-[9px]">
                  ON-CHAIN
                </span>
              </div>
            ))}

            <Row label="Network">
              Sepolia
            </Row>

            <Row label="Contract">
              Connected
            </Row>

            <Row label="IPFS records">
              Pinata integration
            </Row>

            <Row label="Campaign state">
              {campaignState}
            </Row>
          </div>
        </aside>
      </div>

      {donate && (
        <DonationModal
          title={c.title}
          close={() => setDonate(false)}
        />
      )}
    </main>
  );
}

/* =========================================================
   DONATION MODAL
========================================================= */

function DonationModal({
  title,
  close,
}: {
  title: string;
  close: () => void;
}) {
  const [amount, setAmount] = useState("0.001");
  const [state, setState] = useState<
    "amount" | "confirming" | "success" | "error"
  >("amount");

  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState("");

  const { wallet, connect } = useApp();

  const handleDonate = async () => {
    if (!wallet) {
      connect();
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setError("Enter a valid ETH amount.");
      return;
    }

    try {
      setError("");
      setState("confirming");

      const { donateToCampaign } =
        await import("@/lib/blockchain/campaign");

      const result =
        await donateToCampaign(amount);

      setTxHash(result.hash);
      setState("success");
    } catch (error: unknown) {
      console.error(
        "Donation failed:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Transaction failed."
      );

      setState("error");
    }
  };

  return (
    <Modal
      title="Back this campaign"
      onClose={close}
    >
      <p className="mb-5">
        {title} · Sepolia contribution
      </p>

      {state === "amount" && (
        <>
          <label>
            Contribution amount (ETH)

            <input
              type="number"
              min="0.0001"
              step="0.0001"
              value={amount}
              onChange={(e) =>
                setAmount(e.target.value)
              }
              placeholder="0.001"
            />
          </label>

          <div className="flex gap-2 mt-3">
            {[
              "0.001",
              "0.002",
              "0.005",
            ].map((value) => (
              <Button
                key={value}
                variant="outline"
                size="sm"
                onClick={() => setAmount(value)}
              >
                {value} ETH
              </Button>
            ))}
          </div>

          <p className="note">
            This is a real Sepolia transaction.
            You will be asked to confirm it in
            MetaMask.
          </p>

          {error && (
            <p className="note text-destructive">
              {error}
            </p>
          )}

          <Button
            className="w-full mt-5"
            disabled={
              !amount ||
              Number(amount) <= 0
            }
            onClick={handleDonate}
          >
            {wallet
              ? "Continue to MetaMask"
              : "Connect MetaMask"}

            <ArrowRight />
          </Button>
        </>
      )}

      {state === "confirming" && (
        <div>
          <Badge tone="warning">
            Transaction pending
          </Badge>

          <div className="amount-large mt-5">
            {amount} ETH
          </div>

          <p className="note mt-4">
            Confirm the transaction in MetaMask
            and wait for Sepolia confirmation.
          </p>

          <div className="row">
            Network
            <span>Sepolia</span>
          </div>

          <div className="row">
            Status
            <span>Waiting for confirmation...</span>
          </div>
        </div>
      )}

      {state === "success" && (
        <div>
          <Badge tone="success">
            Donation confirmed
          </Badge>

          <div className="amount-large mt-5">
            {amount} ETH
          </div>

          <p className="note mt-4">
            Your contribution has been recorded
            on the ProofFund smart contract.
          </p>

          {txHash && (
            <a
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-primary underline"
            >
              View transaction on Etherscan
            </a>
          )}

          <Button
            className="w-full mt-5"
            onClick={close}
          >
            Done
          </Button>
        </div>
      )}

      {state === "error" && (
        <div>
          <Badge tone="warning">
            Transaction failed
          </Badge>

          <p className="note mt-4">
            {error}
          </p>

          <Button
            className="w-full mt-5"
            onClick={() => {
              setError("");
              setState("amount");
            }}
          >
            Try again
          </Button>
        </div>
      )}
    </Modal>
  );
}
/* =========================================================
   REAL ON-CHAIN MILESTONE PAGE
========================================================= */

export function MilestonePage({
  id,
  milestoneId,
  manage = false,
}: {
  id: string;
  milestoneId: string;
  manage?: boolean;
}) {
  const c = campaigns.find(
    (campaign) => campaign.id === id
  );

  const milestoneIndex = Number(milestoneId);

  const [chainMilestone, setChainMilestone] =
    useState<
      Awaited<ReturnType<typeof getMilestone>>
      | null
    >(null);

  const [loadingMilestone, setLoadingMilestone] =
    useState(true);

  const [milestoneError, setMilestoneError] =
    useState("");

  useEffect(() => {
    if (
      !Number.isInteger(milestoneIndex) ||
      milestoneIndex < 0
    ) {
      setMilestoneError(
        "Invalid milestone number."
      );

      setLoadingMilestone(false);
      return;
    }

    getMilestone(milestoneIndex)
      .then(setChainMilestone)
      .catch((error: unknown) => {
        console.error(
          "Failed to load milestone:",
          error
        );

        setMilestoneError(
          error instanceof Error
            ? error.message
            : "Failed to load milestone from Sepolia."
        );
      })
      .finally(() => {
        setLoadingMilestone(false);
      });
  }, [milestoneIndex]);

  if (!c) {
    return (
      <main className="container page">
        <PageHeading
          eyebrow="Not found"
          title="Campaign unavailable"
        />

        <Button asChild>
          <Link to="/explore">
            Explore campaigns
          </Link>
        </Button>
      </main>
    );
  }

  if (loadingMilestone) {
    return (
      <main className="container page">
        <PageHeading
          eyebrow="Milestone accountability"
          title="Loading milestone..."
          description="Reading milestone data from Sepolia."
        />
      </main>
    );
  }

  if (milestoneError || !chainMilestone) {
    return (
      <main className="container page">
        <PageHeading
          eyebrow="Milestone unavailable"
          title="Could not load this milestone."
        />

        <p className="note">
          {milestoneError ||
            "No milestone data found."}
        </p>

        <Button asChild className="mt-4">
          <Link
            to="/campaign/$id"
            params={{ id }}
          >
            Back to campaign
          </Link>
        </Button>
      </main>
    );
  }

  const m = chainMilestone;

  const deadlineText =
    new Date(
      m.deadline * 1000
    ).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const voteStartText =
    m.voteStart > 0
      ? new Date(
          m.voteStart * 1000
        ).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "Not started";

  const disputeDeadlineText =
    m.disputeDeadline > 0
      ? new Date(
          m.disputeDeadline * 1000
        ).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "Not active";

  const hasProof =
    m.proofCID &&
    m.proofCID.length > 0;

  const hasHash =
    m.proofHash &&
    m.proofHash !==
      "0x0000000000000000000000000000000000000000000000000000000000000000";

  const isVoting =
    m.stateLabel === "Voting";

  const isReleased =
    m.stateLabel === "Released";

  const isRejected =
    m.stateLabel === "Rejected";

  const isFailed =
    m.stateLabel === "Failed";

  return (
    <main className="container page">
      <div className="breadcrumb">
        <Link
          to="/campaign/$id"
          params={{ id }}
        >
          {c.title}
        </Link>

        <span>/</span>

        Milestone {milestoneIndex + 1}
      </div>

      <PageHeading
        eyebrow="Milestone accountability"
        title={m.description}
        description={`Milestone ${milestoneIndex + 1} · Deadline ${deadlineText}`}
        action={
          <Badge
            tone={
              isReleased
                ? "success"
                : isRejected || isFailed
                  ? "warning"
                  : isVoting
                    ? "success"
                    : "muted"
            }
          >
            {m.stateLabel}
          </Badge>
        }
      />

      <div className="two-col">
        <div className="stack">
          {/* Evidence */}

          <div className="panel">
            <h2>
              Evidence & verification
            </h2>

            <div className="activity">
              <FileCheck2 />

              <div>
                <h3>
                  Milestone evidence package
                </h3>

                <p>
                  Evidence submitted by the creator
                  is recorded against this milestone
                  on-chain.
                </p>
              </div>
            </div>

            <Row label="Evidence status">
              {hasProof
                ? "Proof submitted"
                : "Not submitted"}
            </Row>

            <Row label="IPFS CID">
              {hasProof
                ? m.proofCID
                : "Not published"}
            </Row>

            <Row label="SHA-256">
              {hasHash
                ? m.proofHash
                : "No registered document hash"}
            </Row>

            <Row label="Blockchain">
              Sepolia
            </Row>

            <Button
              asChild
              variant="outline"
              className="mt-4"
            >
              <Link to="/verify">
                Verify document integrity
                <ArrowUpRight />
              </Link>
            </Button>
          </div>

          {/* State history */}

          <div className="panel">
            <h2>Milestone state</h2>

            <div className="flex flex-wrap gap-2">
              {[
                "Pending",
                "Voting",
                "ApprovedPendingDispute",
                "Disputed",
                "Released",
                "Rejected",
                "Failed",
              ].map((state) => (
                <Badge
                  key={state}
                  tone={
                    state === m.stateLabel
                      ? "success"
                      : "muted"
                  }
                >
                  {state}
                </Badge>
              ))}
            </div>

            <p className="note">
              The current state is read directly from
              the ProofFund smart contract.
            </p>
          </div>

          {/* Voting data */}

          <div className="panel">
            <h2>Governance</h2>

            <Row label="Voting status">
              {isVoting
                ? "Voting open"
                : m.stateLabel}
            </Row>

            <Row label="Vote started">
              {voteStartText}
            </Row>

            <Row label="Approval weight">
              {m.yesWeight} ETH
            </Row>

            <Row label="Rejection weight">
              {m.noWeight} ETH
            </Row>

            <Row label="Snapshot weight">
              {m.snapshotTotalWeight} ETH
            </Row>

            <Row label="Resubmissions">
              {m.resubmissionCount}
            </Row>

            <p className="note">
              Voting weight is recorded on-chain and
              cannot be altered by the frontend.
            </p>
          </div>
        </div>

        <aside className="stack">
          {/* Allocation */}

          <div className="panel">
            <h2>Allocation</h2>

            <div className="amount-large">
              {m.amount} ETH
            </div>

            <Row label="Milestone">
              {milestoneIndex + 1}
            </Row>

            <Row label="Deadline">
              {deadlineText}
            </Row>

            <Row label="Current state">
              {m.stateLabel}
            </Row>

            <Row label="Dispute deadline">
              {disputeDeadlineText}
            </Row>

            <Button
              asChild
              className="w-full mt-5"
            >
              <Link
                to="/campaign/$id/vote/$milestoneId"
                params={{
                  id,
                  milestoneId,
                }}
              >
                Review & vote
                <ArrowRight />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="w-full mt-3"
            >
              <Link
                to="/campaign/$id/dispute/$milestoneId"
                params={{
                  id,
                  milestoneId,
                }}
              >
                Dispute protection
                <LockKeyhole />
              </Link>
            </Button>

            {manage && (
              <Button
                asChild
                variant="outline"
                className="w-full mt-3"
              >
                <Link
                  to="/campaign/$id/submit-proof"
                  params={{ id }}
                >
                  Submit proof
                </Link>
              </Button>
            )}
          </div>

          {/* Proof status */}

          <div className="panel">
            <h2>Proof status</h2>

            <div className="flex gap-2 items-center py-2 text-xs">
              <Check className="size-3 text-success" />

              Proof record

              <span className="text-muted-foreground ml-auto text-[9px]">
                ON-CHAIN
              </span>
            </div>

            <div className="flex gap-2 items-center py-2 text-xs">
              <Check className="size-3 text-success" />

              SHA-256 integrity

              <span className="text-muted-foreground ml-auto text-[9px]">
                ON-CHAIN
              </span>
            </div>

            <div className="flex gap-2 items-center py-2 text-xs">
              <Check className="size-3 text-success" />

              IPFS reference

              <span className="text-muted-foreground ml-auto text-[9px]">
                {hasProof
                  ? "REGISTERED"
                  : "PENDING"}
              </span>
            </div>

            <p className="note">
              Proof metadata is stored by the smart
              contract as a CID and SHA-256 hash.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}