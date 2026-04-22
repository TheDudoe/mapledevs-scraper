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

- New jobs that are not already live land here with `status` set to `needs_review`.
- This is the tab you review manually.
- To publish a job, change its `status` to `approved`.
- To skip a job, change its `status` to `rejected`.

`jobs_live`

- The scraper copies approved review rows here.
- The website reads only this tab.
- The website hides rows where `status` is not `approved`, `live`, or `active`.
- The website also hides rows where `link_status` is `expired`, `dead`, `missing_from_source`, or `inactive`.

## Daily Use

1. Let the GitHub Action run the scraper.
2. Open the `jobs_review` tab.
3. Check any rows with `status = needs_review`.
4. Fix title, studio, location, salary, or description if needed.
5. Change `status` to `approved` for jobs you want public.
6. Run the workflow again, or wait for the next scheduled run.
7. Approved jobs will appear in `jobs_live`, then on the website.

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
