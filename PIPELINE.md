# MapleDevs Job Pipeline

This repo now uses a simple three-tab review pipeline:

```text
scraper -> jobs_raw -> jobs_review -> jobs_live -> website
```

## What Each Tab Does

`jobs_raw`

- Every unique job the scraper finds lands here.
- The scraper updates `last_seen_at` and `last_verified_at` each run.
- If a job disappears from the studio source, the scraper changes `status` to `expired` and `link_status` to `missing_from_source`.

`jobs_review`

- New jobs that are not already live land here.
- The scraper auto-triages each new row.
- High-confidence official ATS jobs can be auto-approved.
- Suspicious, generic, or incomplete rows stay as `needs_review`.
- This is the tab you review manually only when a row still says `needs_review`.
- To publish a job, change its `status` to `approved`.
- To skip a job, change its `status` to `rejected`.
- If a job is already live and you later mark its review row `rejected`, `inactive`, or `expired`, the next scraper run disables the matching row in `jobs_live`.

`jobs_live`

- The scraper copies approved review rows here.
- The website reads only this tab.
- The website hides rows where `status` is not `approved`, `live`, or `active`.
- The website also hides rows where `link_status` is `expired`, `dead`, `missing_from_source`, or `inactive`.

## Daily Use

1. Let the GitHub Action run the scraper.
2. Open the `jobs_review` tab.
3. Filter `status` to `needs_review`.
4. Only review those rows.
5. Fix title, studio, location, salary, or description if needed.
6. Change `status` to `approved` for jobs you want public.
7. Change `status` to `rejected` for general applications, stale roles, or non-job pages.
8. Run the workflow again, or wait for the next scheduled run.
9. Approved jobs will appear in `jobs_live`, then on the website.

## Auto-Triage

The scraper now scores each review row using simple safety checks:

- official ATS source id
- studio name exists
- job title exists
- application link exists
- Canadian or remote location is clear
- description has enough useful text
- extra useful fields such as salary, engine, student-friendly, or visa signal

Rows that pass the threshold are marked:

```text
status = approved
review_recommendation = auto_approve
```

Rows that need human attention stay:

```text
status = needs_review
review_recommendation = manual_review
```

Common reasons a row stays manual:

- general application / spontaneous application / talent pool
- missing application link
- unclear location
- missing title or studio
- expired/dead/missing link status

If you want to turn off auto-approval temporarily, set this GitHub Actions environment variable:

```text
AUTO_APPROVE_SAFE_JOBS=false
```

If you want stricter auto-approval, raise:

```text
AUTO_APPROVE_SCORE=90
```

The default score threshold is `80`.

## Featured Jobs

Use the `feature` column in `jobs_review` if your sheet uses lowercase headers.
The code also supports the older `(Featured)` column name.

- Set `feature` to `Yes` to feature a job.
- Set `feature` to `No` or leave it blank for a normal job.
- The scraper treats this as an owner-controlled field.
- If a featured job is already in `jobs_live`, the scraper will not expire/remove it just because it disappeared from the scraped source.

For paid/manual featured listings, create or edit the row in `jobs_review`, set `status` to `approved`, and set `feature` to `Yes`.

## Data-Only Helper Fields

These fields are for the pipeline and should not be shown as visible job details on the website:

- `job_id`
- `source_url`
- `last_verified_at`
- `status`
- `tags`
- `review_score`
- `review_recommendation`
- `review_reason`
- `auto_reviewed_at`
- `link_status`
- `first_seen_at`
- `last_seen_at`
- `scraped_at`
- `notes`
- `date_reviewed`

## Why This Prevents Duplicates

Each scraped job gets a stable `job_id`.

For ATS jobs, this comes from the source system:

- Greenhouse: `gh_studio_jobid`
- Lever: `lv_studio_jobid`
- SmartRecruiters: `sr_studio_jobid`
- Ashby: `as_studio_jobid`
- Workday: `wd_studio_jobid`

The scraper uses `job_id` to update existing rows instead of adding duplicates.

## Important

Do not delete old rows from `jobs_raw`. The history helps the scraper know whether a job is new, active, or expired.

If the public site shows no jobs, check:

1. `jobs_live` has approved rows.
2. The sheet is shared publicly enough for the static site to read it.
3. `status` is `approved`, `live`, or `active`.
4. `link_status` is empty or `active`.
