import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  Upload,
  Check,
  LockKeyhole,
  FileCheck2,
  RotateCcw,
} from "lucide-react";
import { hexlify } from "ethers";

import { Button } from "@/components/ui/button";

import {
  campaigns,
  milestones,
  money,
  integrityNote,
} from "@/lib/demo-data";

import { hashDocument } from "@/lib/demo-service";

import {
  submitProofToCampaign,
} from "@/lib/blockchain/campaign";

import {
  Badge,
  PageHeading,
  Progress,
  Row,
} from "./primitives";

import {
  Workspace,
  useApp,
} from "./shell";

const wizardSteps = [
  "Details",
  "Funding goal",
  "Milestones",
  "Evidence",
  "Security stake",
  "Review",
  "Confirmation",
];

export function CreatePage() {
  const { notify } = useApp();

  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");
  const [category, setCategory] =
    useState("Technology");
  const [goal, setGoal] = useState(1000000);
  const [deadline, setDeadline] =
    useState("2026-12-15");

  const [allocations, setAllocations] =
    useState([
      {
        name: "Research & planning",
        amount: 150000,
      },
      {
        name: "Prototype development",
        amount: 200000,
      },
      {
        name: "Beta launch",
        amount: 180000,
      },
      {
        name: "Production rollout",
        amount: 210000,
      },
      {
        name: "Impact assessment",
        amount: 260000,
      },
    ]);

  const [evidence, setEvidence] =
    useState(
      "Completion report, expense receipts, independent evaluation and photographs."
    );

  const [accepted, setAccepted] =
    useState(false);

  const [done, setDone] =
    useState(false);

  const total = allocations.reduce(
    (sum, milestone) =>
      sum + milestone.amount,
    0
  );

  const balanced =
    goal > 0 && total === goal;

  const valid =
    step === 0
      ? title.trim().length > 2 &&
        description.trim().length > 10
      : step === 1
        ? goal > 0 &&
          deadline.length > 0
        : step === 2
          ? balanced &&
            allocations.every(
              (milestone) =>
                milestone.name.trim() &&
                milestone.amount > 0
            )
          : step === 3
            ? evidence.length > 5
            : step === 4
              ? accepted
              : balanced;

  return (
    <Workspace>
      <PageHeading
        eyebrow="Creator workspace · Campaign draft"
        title="Make your next idea accountable."
        description="A funding plan built around measurable milestones and verifiable evidence."
      />

      <div className="wizard-steps">
        {wizardSteps.map((stepName, index) => (
          <div
            className={`wizard-step ${
              index === step
                ? "active"
                : ""
            }`}
            key={stepName}
          >
            <span>
              0{index + 1}
            </span>{" "}
            {stepName}
          </div>
        ))}
      </div>

      <div className="two-col">
        <form
          className="panel form-stack"
          onSubmit={(event) => {
            event.preventDefault();

            if (valid) {
              setStep(
                Math.min(step + 1, 6)
              );
            }
          }}
        >
          <h2>
            {wizardSteps[step]}
          </h2>

          {step === 0 && (
            <>
              <label>
                Campaign title
                <input
                  required
                  minLength={3}
                  value={title}
                  onChange={(event) =>
                    setTitle(
                      event.target.value
                    )
                  }
                  placeholder="Give your idea a clear name"
                />
              </label>

              <label>
                Category
                <select
                  value={category}
                  onChange={(event) =>
                    setCategory(
                      event.target.value
                    )
                  }
                >
                  <option>
                    Technology
                  </option>
                  <option>
                    Community
                  </option>
                  <option>
                    Climate
                  </option>
                  <option>
                    Education
                  </option>
                  <option>
                    Health
                  </option>
                </select>
              </label>

              <label>
                Campaign description
                <textarea
                  required
                  minLength={11}
                  rows={5}
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }
                  placeholder="What are you building, and who will benefit?"
                />
              </label>
            </>
          )}

          {step === 1 && (
            <>
              <label>
                Funding goal (₹)
                <input
                  type="number"
                  required
                  min={1}
                  value={goal}
                  onChange={(event) =>
                    setGoal(
                      Number(
                        event.target.value
                      )
                    )
                  }
                />
              </label>

              <label>
                Campaign deadline
                <input
                  type="date"
                  required
                  min="2026-10-07"
                  value={deadline}
                  onChange={(event) =>
                    setDeadline(
                      event.target.value
                    )
                  }
                />
              </label>

              <p className="note">
                The campaign goal must
                be allocated fully across
                your milestones. A 10%
                creator security stake is
                calculated automatically.
              </p>
            </>
          )}

          {step === 2 && (
            <>
              {allocations.map(
                (milestone, index) => (
                  <div
                    className="flex items-end gap-3"
                    key={index}
                  >
                    <label className="flex-1">
                      Milestone {index + 1}

                      <input
                        required
                        value={
                          milestone.name
                        }
                        onChange={(event) =>
                          setAllocations(
                            allocations.map(
                              (
                                allocation,
                                allocationIndex
                              ) =>
                                index ===
                                allocationIndex
                                  ? {
                                      ...allocation,
                                      name: event
                                        .target
                                        .value,
                                    }
                                  : allocation
                            )
                          )
                        }
                      />
                    </label>

                    <label className="w-32">
                      Amount (₹)

                      <input
                        type="number"
                        required
                        min={1}
                        value={
                          milestone.amount
                        }
                        onChange={(event) =>
                          setAllocations(
                            allocations.map(
                              (
                                allocation,
                                allocationIndex
                              ) =>
                                index ===
                                allocationIndex
                                  ? {
                                      ...allocation,
                                      amount:
                                        Number(
                                          event
                                            .target
                                            .value
                                        ),
                                    }
                                  : allocation
                            )
                          )
                        }
                      />
                    </label>

                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      aria-label={`Remove milestone ${
                        index + 1
                      }`}
                      onClick={() =>
                        setAllocations(
                          allocations.filter(
                            (_, allocationIndex) =>
                              allocationIndex !==
                              index
                          )
                        )
                      }
                    >
                      <Trash2 />
                    </Button>
                  </div>
                )
              )}

              <Button
                type="button"
                variant="outline"
                className="justify-self-start"
                onClick={() =>
                  setAllocations([
                    ...allocations,
                    {
                      name: "",
                      amount: 0,
                    },
                  ])
                }
              >
                <Plus />
                Add milestone
              </Button>

              <div
                className={`text-sm ${
                  balanced
                    ? "text-success"
                    : "text-warning"
                }`}
                role="status"
              >
                {balanced
                  ? "✓ Milestone allocation balanced"
                  : "Milestone allocation must equal campaign goal."}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <label>
                Evidence requirements

                <textarea
                  required
                  rows={5}
                  value={evidence}
                  onChange={(event) =>
                    setEvidence(
                      event.target.value
                    )
                  }
                />
              </label>

              <p className="note">
                {integrityNote}
              </p>
            </>
          )}

          {step === 4 && (
            <>
              <div className="eyebrow">
                Required security stake ·
                10%
              </div>

              <div className="amount-large">
                {money(goal * 0.1)}
              </div>

              <p>
                A creator stake aligns
                incentives. Repeated
                milestone failure can lead
                to stake slashing and refund
                eligibility.
              </p>

              <label className="flex gap-3 items-start">
                <input
                  type="checkbox"
                  className="w-4 mt-1"
                  checked={accepted}
                  onChange={(event) =>
                    setAccepted(
                      event.target.checked
                    )
                  }
                />

                <span>
                  I understand the stake
                  and milestone
                  accountability
                  requirements. No real
                  deposit will be requested
                  in this demo.
                </span>
              </label>
            </>
          )}

          {step === 5 && (
            <>
              <h3>{title}</h3>

              <p>
                {description}
              </p>

              <Row label="Category">
                {category}
              </Row>

              <Row label="Goal">
                {money(goal)}
              </Row>

              <Row label="Deadline">
                {deadline}
              </Row>

              {allocations.map(
                (milestone, index) => (
                  <Row
                    label={milestone.name}
                    key={index}
                  >
                    {money(
                      milestone.amount
                    )}
                  </Row>
                )
              )}

              <Row label="Security stake (10%)">
                {money(goal * 0.1)}
              </Row>

              <p>
                {evidence}
              </p>

              {!balanced && (
                <p className="text-warning">
                  Milestone allocation must
                  equal campaign goal.
                </p>
              )}
            </>
          )}

          {step === 6 && (
            <>
              <Badge tone="muted">
                Blockchain integration not active
              </Badge>

              <h3>
                {done
                  ? "Demo draft prepared"
                  : "Ready for future confirmation"}
              </h3>

              <p>
                {done
                  ? "Your campaign draft is complete in this session. It has not been published or stored."
                  : "No wallet signature, stake deposit, contract deployment or transaction will be requested."}
              </p>

              <Row label="Wallet signature">
                Not requested
              </Row>

              <Row label="Security stake">
                Not deposited
              </Row>

              <Row label="Campaign contract">
                Not deployed
              </Row>

              <Row label="Transaction">
                Not submitted
              </Row>

              <Button
                type="button"
                disabled={
                  !balanced || done
                }
                onClick={() => {
                  setDone(true);

                  notify(
                    "Demo draft prepared. No campaign was published or transaction submitted."
                  );
                }}
              >
                <Check />
                Prepare demo draft
              </Button>

              {done && (
                <Button
                  asChild
                  variant="outline"
                >
                  <Link to="/dashboard/creator">
                    Creator dashboard
                    <ArrowRight />
                  </Link>
                </Button>
              )}
            </>
          )}

          <div className="flex justify-between mt-4">
            <Button
              type="button"
              variant="outline"
              disabled={step === 0}
              onClick={() =>
                setStep(
                  Math.max(step - 1, 0)
                )
              }
            >
              <ArrowLeft />
              Back
            </Button>

            {step < 6 && (
              <Button
                type="submit"
                disabled={!valid}
              >
                {step === 5
                  ? "Continue to confirmation"
                  : "Continue"}

                <ArrowRight />
              </Button>
            )}
          </div>
        </form>

        <aside className="panel">
          <h2>
            Live allocation
          </h2>

          <Row label="Campaign goal">
            {money(goal)}
          </Row>

          <Row label="Milestone total">
            {money(total)}
          </Row>

          <Row label="Difference">
            {money(goal - total)}
          </Row>

          <Row label="Required stake (10%)">
            {money(goal * 0.1)}
          </Row>

          <Progress
            value={
              goal > 0
                ? Math.min(
                    (total / goal) * 100,
                    100
                  )
                : 0
            }
          />

          <div className="mt-4">
            <Badge
              tone={
                balanced
                  ? "success"
                  : "warning"
              }
            >
              {balanced
                ? "Balanced"
                : "Allocation mismatch"}
            </Badge>
          </div>

          <p className="note">
            Final submission is blocked unless
            milestone amounts equal the campaign
            goal.
          </p>
        </aside>
      </div>
    </Workspace>
  );
}

export function VotePage({
  id,
  milestoneId,
}: {
  id: string;
  milestoneId: string;
}) {
  const c = campaigns.find(
    (campaign) => campaign.id === id
  );

  const m = milestones.find(
    (milestone) =>
      milestone.id === milestoneId
  );

  const [vote, setVote] =
    useState("");

  const {
    wallet,
    connect,
  } = useApp();

  if (!c || !m) {
    return (
      <main className="container page">
        <PageHeading
          eyebrow="Voting"
          title="Milestone unavailable"
        />
      </main>
    );
  }

  const open = m.id === "beta";

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

        Milestone governance
      </div>

      <PageHeading
        eyebrow="Community governance · Demo vote"
        title={m.name}
        description="Review the evidence. Have a say in how funds are released."
        action={
          <Badge
            tone={
              open
                ? "warning"
                : "muted"
            }
          >
            {open
              ? "Voting open (demo)"
              : "Voting not active"}
          </Badge>
        }
      />

      <div className="two-col">
        <div className="stack">
          <section className="panel">
            <div className="flex justify-between items-center">
              <h2>
                Milestone decision
              </h2>

              <span className="text-muted-foreground text-xs">
                Demo time remaining ·
                01:42:18
              </span>
            </div>

            <div className="flex justify-between">
              <div>
                <div className="amount-large text-success">
                  78%
                </div>

                <p>
                  Approve
                </p>
              </div>

              <div className="text-right">
                <div className="amount-large text-destructive">
                  22%
                </div>

                <p>
                  Reject
                </p>
              </div>
            </div>

            <div className="vote-bars">
              <span />
              <span />
            </div>

            <Row label="Quorum reached">
              71% / 30% required
            </Row>

            <Progress value={71} />

            <Row label="Required approval">
              60%
            </Row>

            <Row label="Your voting power">
              4.7% (demo)
            </Row>

            <Row label="Maximum weight per wallet">
              25%
            </Row>

            {vote ? (
              <div
                className="result mt-5"
                role="status"
              >
                <Check className="size-5 text-success" />

                <h3 className="mt-2">
                  {vote === "approve"
                    ? "Approval"
                    : "Rejection"}{" "}
                  recorded in demo
                </h3>

                <p className="mt-2">
                  No blockchain vote was
                  submitted. Voting totals
                  are illustrative.
                </p>
              </div>
            ) : (
              <div className="flex gap-3 mt-6">
                <Button
                  disabled={!open}
                  onClick={() =>
                    wallet
                      ? setVote(
                          "approve"
                        )
                      : connect()
                  }
                >
                  <Check />
                  Approve milestone
                </Button>

                <Button
                  disabled={!open}
                  variant="outline"
                  onClick={() =>
                    wallet
                      ? setVote(
                          "reject"
                        )
                      : connect()
                  }
                >
                  Reject milestone
                </Button>
              </div>
            )}
          </section>

          <p className="note">
            Voting power is determined using
            the contribution snapshot taken when
            voting begins. Contributions made
            afterward cannot influence this vote.
            The 25% wallet weight limit reduces
            whale dominance but does not fully
            prevent Sybil attacks.
          </p>
        </div>

        <aside className="panel">
          <h2>
            Evidence for review
          </h2>

          <FileCheck2 className="size-8 text-primary mb-4" />

          <h3>
            Beta evaluation package
          </h3>

          <p className="mt-3">
            Completion report, spending
            statement and independent test
            results. Evidence references are
            illustrative and not published to
            IPFS.
          </p>

          <Row label="Milestone amount">
            {money(
              (m.amount * c.goal) /
                1000000
            )}
          </Row>

          <Row label="Integrity verification">
            No registered document
          </Row>

          <Row label="Release state">
            Locked
          </Row>

          <Button
            asChild
            className="mt-5 w-full"
            variant="outline"
          >
            <Link
              to="/campaign/$id/milestone/$milestoneId"
              params={{
                id,
                milestoneId,
              }}
            >
              Review milestone
              <ArrowRight />
            </Link>
          </Button>

          <Button
            asChild
            className="mt-3 w-full"
            variant="ghost"
          >
            <Link to="/verify">
              Verify a document
            </Link>
          </Button>
        </aside>
      </div>
    </main>
  );
}

export function DisputePage({
  id,
  milestoneId,
}: {
  id: string;
  milestoneId: string;
}) {
  const c = campaigns.find(
    (campaign) => campaign.id === id
  );

  const m = milestones.find(
    (milestone) =>
      milestone.id === milestoneId
  );

  const [reason, setReason] =
    useState("");

  const [raised, setRaised] =
    useState(false);

  const {
    wallet,
    connect,
  } = useApp();

  if (!c || !m) {
    return (
      <main className="container page">
        <PageHeading
          eyebrow="Dispute protection"
          title="Milestone unavailable"
        />
      </main>
    );
  }

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

        Dispute protection
      </div>

      <PageHeading
        eyebrow="Protection window · Demo scenario"
        title={
          raised
            ? "Dispute raised. Funds stay protected."
            : "Approved does not mean released."
        }
        description={`${m.name} · Approval scenario preview`}
        action={
          <Badge tone="warning">
            {raised
              ? "Disputed (demo)"
              : "Approved (demo)"}
          </Badge>
        }
      />

      <div className="two-col">
        <section className="panel">
          <LockKeyhole className="size-9 text-primary mb-5" />

          <h2>
            {raised
              ? "Funds remain locked"
              : "Dispute protection"}
          </h2>

          <div className="amount-large">
            {raised
              ? money(
                  (m.amount * c.goal) /
                    1000000
                )
              : "23:41:09"}
          </div>

          <p className="mt-3">
            {raised
              ? "Demo dispute registered in this session. Funds cannot be released during a dispute."
              : "Illustrative time remaining. Funds become releasable after the protection period expires, provided no dispute is active."}
          </p>

          <Row label="Approval">
            Approved (demo scenario)
          </Row>

          <Row label="Release">
            Not released
          </Row>

          <Row label="Dispute">
            {raised
              ? "Raised (demo)"
              : "No dispute raised"}
          </Row>

          <p className="note">
            No live protection timer or
            on-chain approval is connected.
          </p>
        </section>

        <form
          className="panel form-stack"
          onSubmit={(event) => {
            event.preventDefault();

            if (wallet) {
              setRaised(true);
            } else {
              connect();
            }
          }}
        >
          <h2>
            {raised
              ? "Dispute details"
              : "Raise a dispute"}
          </h2>

          <label>
            Reason for dispute

            <textarea
              required
              minLength={20}
              rows={5}
              disabled={raised}
              value={reason}
              onChange={(event) =>
                setReason(
                  event.target.value
                )
              }
              placeholder="Describe the concern and the evidence supporting it (at least 20 characters)."
            />
          </label>

          <Row label="Protected allocation">
            {money(
              (m.amount * c.goal) /
                1000000
            )}
          </Row>

          <Badge tone="muted">
            Locked · Not released
          </Badge>

          <Button
            type="submit"
            disabled={
              raised ||
              reason.trim().length < 20
            }
          >
            {raised
              ? "Demo dispute recorded"
              : "Raise demo dispute"}
          </Button>

          {raised && (
            <p role="status">
              Your concern was recorded for this
              demo session only. No transaction was
              submitted.
            </p>
          )}
        </form>
      </div>
    </main>
  );
}

export function RefundsPage() {
  const [claimed, setClaimed] =
    useState(false);

  const {
    wallet,
    connect,
  } = useApp();

  return (
    <Workspace>
      <PageHeading
        eyebrow="Donor protection · Demo scenario"
        title="Refunds"
        description="Review eligibility when a campaign cannot fulfill its milestones."
      />

      <div className="two-col">
        <section className="panel">
          <Badge tone="warning">
            Campaign failed (demo scenario)
          </Badge>

          <h2 className="mt-5">
            Community Learning Hub
          </h2>

          <p>
            Two unsuccessful evidence reviews led
            to failure. Remaining escrow and stake
            allocation are reserved for eligible
            refunds.
          </p>

          <Row label="Remaining refund pool">
            ₹6,42,000
          </Row>

          <Row label="Your contribution">
            ₹7,500
          </Row>

          <Row label="Refund eligibility">
            Eligible (demo)
          </Row>

          <p className="note">
            The failure scenario is illustrative.
            No campaign funds or refund contract
            are connected.
          </p>
        </section>

        <section className="panel">
          <RotateCcw className="size-7 text-primary mb-5" />

          <div className="eyebrow">
            {claimed
              ? "Demo refund previewed"
              : "Your refundable amount"}
          </div>

          <div className="amount-large mt-4">
            ₹4,820
          </div>

          <Button
            className="w-full mt-6"
            disabled={claimed}
            onClick={() =>
              wallet
                ? setClaimed(true)
                : connect()
            }
          >
            {claimed
              ? "Refund preview complete"
              : "Preview refund claim"}

            <ArrowRight />
          </Button>

          {claimed && (
            <div
              className="mt-6"
              role="status"
            >
              <Badge>
                Demo claim recorded
              </Badge>

              <p className="mt-3">
                ₹4,820 would be returned in
                this scenario. No real funds have
                moved.
              </p>

              <Row label="Transaction">
                Not submitted
              </Row>

              <Row label="Explorer record">
                Unavailable
              </Row>
            </div>
          )}
        </section>
      </div>
    </Workspace>
  );
}

/*
=========================================================
REAL PROOFFUND SUBMIT PROOF PAGE
=========================================================
*/

export function SubmitProofPage({
  id,
}: {
  id: string;
}) {
  const c = campaigns.find(
    (campaign) => campaign.id === id
  );

  const fileInput =
    useRef<HTMLInputElement>(null);

  const [file, setFile] =
    useState<File | null>(null);

  const [hash, setHash] =
    useState("");

  const [milestone, setMilestone] =
    useState("0");

  const [description, setDescription] =
    useState("");

  const [cid, setCid] =
    useState("");

  const [txHash, setTxHash] =
    useState("");

  const [status, setStatus] =
    useState<
      | "idle"
      | "uploading"
      | "signing"
      | "success"
      | "error"
    >("idle");

  const [error, setError] =
    useState("");

  const choose = async (
    selectedFile: File | undefined
  ) => {
    if (!selectedFile) {
      return;
    }

    setFile(selectedFile);
    setError("");
    setCid("");
    setTxHash("");
    setStatus("idle");

    try {
      const digest =
        await hashDocument(
          selectedFile
        );

      setHash(digest);
    } catch {
      setHash("");

      setError(
        "Unable to calculate document fingerprint."
      );
    }
  };

  const handleSubmit = async () => {
    if (
      !file ||
      !hash ||
      description.trim().length < 10
    ) {
      return;
    }

    try {
      setError("");

      /*
       * STEP 1
       * Upload evidence:
       *
       * Browser
       *   ↓
       * ProofFund backend
       *   ↓
       * Pinata
       *   ↓
       * IPFS
       */
      setStatus("uploading");

      const formData =
        new FormData();

      formData.append(
        "file",
        file
      );

      const uploadResponse =
        await fetch(
          "https://YOUR-RENDER-URL.onrender.com/api/ipfs/upload",
          {
            method: "POST",
            body: formData,
          }
        );

      const uploadResult =
        await uploadResponse.json();

      if (
        !uploadResponse.ok ||
        !uploadResult.cid
      ) {
        throw new Error(
          uploadResult.error ||
            "Failed to upload evidence to IPFS."
        );
      }

      setCid(
        uploadResult.cid
      );

      /*
       * STEP 2
       * Convert the SHA-256 hex string
       * into Ethereum bytes32.
       */
      const proofHash =
        hexlify(
          `0x${hash}`
        );

      /*
       * STEP 3
       * Submit CID + hash to the
       * ProofFund smart contract.
       *
       * MetaMask will open here.
       */
      setStatus("signing");

      const result =
        await submitProofToCampaign(
          Number(milestone),
          uploadResult.cid,
          proofHash
        );

      setTxHash(
        result.hash
      );

      setStatus("success");
    } catch (
      submissionError: unknown
    ) {
      console.error(
        "Proof submission failed:",
        submissionError
      );

      setStatus("error");

      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Proof submission failed."
      );
    }
  };

  return (
    <Workspace>
      <PageHeading
        eyebrow="Creator workspace · On-chain submission"
        title="Let the evidence speak."
        description={`${c?.title ?? "Campaign unavailable"} · Submit milestone proof for review.`}
      />

      <div className="two-col">
        <form
          className="panel form-stack"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSubmit();
          }}
        >
          <h2>
            Milestone evidence
          </h2>

          <label>
            Milestone

            <select
              value={milestone}
              disabled={
                status === "uploading" ||
                status === "signing" ||
                status === "success"
              }
              onChange={(event) =>
                setMilestone(
                  event.target.value
                )
              }
            >
              {milestones.map(
                (milestoneData, index) => (
                  <option
                    value={String(index)}
                    key={milestoneData.id}
                  >
                    {milestoneData.name}
                  </option>
                )
              )}
            </select>
          </label>

          <label>
            Completion summary

            <textarea
              required
              minLength={10}
              rows={4}
              disabled={
                status === "success"
              }
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              placeholder="Describe the deliverables and evidence included."
            />
          </label>

          <input
            ref={fileInput}
            className="sr-only"
            type="file"
            aria-label="Select proof document"
            onChange={(event) =>
              void choose(
                event.target.files?.[0]
              )
            }
          />

          <div
            className="upload-zone"
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (
                event.key === "Enter"
              ) {
                fileInput.current?.click();
              }
            }}
            onClick={() =>
              fileInput.current?.click()
            }
            onDragOver={(event) =>
              event.preventDefault()
            }
            onDrop={(event) => {
              event.preventDefault();

              void choose(
                event.dataTransfer
                  .files[0]
              );
            }}
          >
            <Upload />

            <h3>
              {file?.name ??
                "Add supporting evidence"}
            </h3>

            <p>
              Drag & drop, or choose a
              document
            </p>
          </div>

          {error && (
            <p
              role="alert"
              className="text-destructive"
            >
              {error}
            </p>
          )}

          {hash && (
            <div>
              <div className="eyebrow mb-3">
                SHA-256
              </div>

              <p className="hash">
                {hash}
              </p>
            </div>
          )}

          <Button
            type="submit"
            disabled={
              !c ||
              !file ||
              !hash ||
              description.trim()
                .length < 10 ||
              status === "uploading" ||
              status === "signing" ||
              status === "success"
            }
          >
            {status === "uploading"
              ? "Uploading to IPFS..."
              : status === "signing"
                ? "Confirm in MetaMask..."
                : status === "success"
                  ? "Proof submitted"
                  : "Submit proof"}

            {status !==
              "success" && (
              <ArrowRight />
            )}
          </Button>
        </form>

        <aside className="stack">
          <div className="panel">
            <h2>
              Evidence record
            </h2>

            <Row label="IPFS CID">
              {cid ||
                "Not uploaded"}
            </Row>

            <Row label="SHA-256">
              {hash ||
                "Not calculated"}
            </Row>

            <Row label="Blockchain transaction">
              {txHash ||
                "Not submitted"}
            </Row>

            <Row label="Verification">
              {status === "success"
                ? "Proof recorded on Sepolia"
                : status ===
                    "uploading"
                  ? "Uploading evidence..."
                  : status ===
                      "signing"
                    ? "Awaiting wallet confirmation..."
                    : "Pending evidence"}
            </Row>

            {cid && (
              <a
                href={`https://ipfs.io/ipfs/${cid}`}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-primary underline"
              >
                View evidence on IPFS
              </a>
            )}

            {txHash && (
              <a
                href={`https://sepolia.etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-primary underline block mt-2"
              >
                View transaction on Etherscan
              </a>
            )}

            <p className="note">
              The evidence file is stored on
              IPFS. The CID and SHA-256
              fingerprint are recorded through
              the ProofFund smart contract.
            </p>
          </div>

          {status === "success" && (
            <div
              className="result"
              role="status"
            >
              <Badge>
                Proof submitted successfully
              </Badge>

              <p className="section-description">
                Your milestone evidence is
                now recorded on Sepolia and
                available for donor review.
              </p>

              <Button
                asChild
                variant="outline"
                className="mt-4"
              >
                <Link
                  to="/campaign/$id/manage"
                  params={{ id }}
                >
                  Campaign management
                  <ArrowRight />
                </Link>
              </Button>
            </div>
          )}

          <p className="note">
            {integrityNote}
          </p>
        </aside>
      </div>
    </Workspace>
  );
}
