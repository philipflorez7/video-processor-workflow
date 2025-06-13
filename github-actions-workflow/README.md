# Video Processor GitHub Actions Workflow

This repository contains the GitHub Actions workflow for processing videos using Supabase as the backend.

## Setup Instructions

1. **Fork this repository** to your GitHub account.

2. **Set up GitHub Secrets:**
   - Go to your repository's Settings > Secrets and Variables > Actions
   - Add the following secrets:
     - `SUPABASE_URL`: Your Supabase project URL
     - `SUPABASE_KEY`: Your Supabase anon/public key

3. **Enable GitHub Actions:**
   - Go to your repository's Actions tab
   - Enable GitHub Actions if not already enabled

4. **Test the Workflow:**
   - Go to the Actions tab
   - Select the "Process Video" workflow
   - Click "Run workflow" to test manually

## How It Works

1. The workflow runs every 5 minutes to check for pending jobs.
2. When a job is found, it:
   - Downloads the input video
   - Processes it (add your processing logic in `process-video.js`)
   - Uploads the processed video to Supabase storage
   - Updates the job status in the database

## File Structure

- `.github/workflows/process-video.yml`: GitHub Actions workflow configuration
- `process-video.js`: Main processing script
- `package.json`: Project dependencies

## Adding Your Processing Logic

To add your video processing logic:

1. Open `process-video.js`
2. Find the TODO comment: `// TODO: Add your video processing logic here`
3. Add your processing code in that section

## Troubleshooting

If the workflow fails:
1. Check the Actions tab for error messages
2. Verify your Supabase credentials
3. Ensure your input video URL is accessible 