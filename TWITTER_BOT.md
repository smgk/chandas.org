# Deferred X/Twitter Assistant

**Status:** Deferred — not on the active roadmap

**Recorded:** 2026-08-02

## Decision

Do not build an X/Twitter bot at this time. An autonomous bot would incur X API
charges, while the zero-API-cost alternative still requires the user to review
and publish each response manually. Neither trade-off currently justifies the
implementation and maintenance work.

This file preserves the idea for reconsideration without making it a product
commitment.

## Possible zero-cost version

A future **Chandas X assistant** could run entirely in `chandas.org`:

1. The user copies a verse from an X mention into the assistant.
2. The existing Chandas analyzer prepares a short, deterministic analysis.
3. The user reviews the suggested response.
4. **Reply on X** opens an X Web Intent with the response pre-filled.
5. The user, already logged in to X in a browser or app, presses **Post**.

This is usable from a phone or computer and requires no X API key. It does not
automatically place the response in X Drafts. Chandas could retain unfinished
responses in a device-local queue, but that queue would not synchronize across
devices.

An optional Synology-hosted queue could later synchronize pending responses
privately, but it would add deployment, access-control, backup, and maintenance
work. It is unnecessary for the first version.

## Autonomous version

An autonomous adapter should be reconsidered only if one of these conditions
is met:

- X provides a suitable free official API tier;
- sponsored API credits become available; or
- the project owner explicitly authorizes a fixed operating budget.

If implemented, it must:

- use only the official API, never browser-clicking automation;
- respond only to explicit mentions or another clear opt-in action;
- publish at most one response per interaction and support opt-out;
- use the same deterministic, versioned analysis engine as the website;
- distinguish exact verse, exact pāda, strong prefix, and uncertain matches;
- present multiple plausible meters when the result is ambiguous;
- keep credentials only on the private host and never in the website or repo;
- impose a hard spending limit that stops activity before unapproved charges;
- avoid retaining poem text unless that storage is explicitly enabled; and
- comply with the platform's current automation and automated-account rules.

The Synology NAS could host this adapter in a container and store minimal state
such as processed post IDs, opt-outs, and audit logs. Hosting it on the NAS
would remove hosting cost, but not X API usage charges.

## Cost and policy snapshot

As checked in August 2026, X documents pay-per-use API pricing rather than a
free tier. Its published prices include charges for reading owned mentions and
creating posts, with posts containing URLs costing considerably more. Pricing
and platform rules can change, so both must be reviewed again before any work
starts.

- [X API pricing](https://docs.x.com/x-api/getting-started/pricing)
- [X Web Intents](https://docs.x.com/x-for-websites/web-intents/overview)
- [X automation rules](https://help.x.com/en/rules-and-policies/x-automation?lang=browser)
- [X automated-account labels](https://help.x.com/en/using-x/automated-account-labels)

## Out of scope while deferred

- No bot account configuration.
- No X developer application or credentials.
- No Synology service or public endpoint.
- No reply queue in Chandas.
- No scheduled “meter of the day” posts.
- No changes to `requirements.md`, `ROADMAP.md`, or the application UI.
