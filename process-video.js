const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function downloadVideo(url, outputPath) {
  const response = await axios({
    method: 'GET',
    url: url,
    responseType: 'stream'
  });

  const writer = fs.createWriteStream(outputPath);
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

async function uploadVideo(filePath, jobId) {
  const fileBuffer = fs.readFileSync(filePath);
  const fileName = `processed_${jobId}.mp4`;
  
  const { data, error } = await supabase.storage
    .from('processed-videos')
    .upload(fileName, fileBuffer, {
      contentType: 'video/mp4',
      upsert: true
    });

  if (error) throw error;
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('processed-videos')
    .getPublicUrl(fileName);

  return publicUrl;
}

async function processVideo() {
  try {
    // Poll for a pending job
    const { data: job, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', 'pending')
      .limit(1)
      .single();

    if (error || !job) {
      console.log('No pending jobs found.');
      return;
    }

    console.log(`Processing job ${job.id}...`);

    // Update job status to processing
    await supabase
      .from('jobs')
      .update({ status: 'processing' })
      .eq('id', job.id);

    // Create temp directory
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    // Download input video
    const inputPath = path.join(tempDir, `input_${job.id}.mp4`);
    await downloadVideo(job.input_url, inputPath);

    // TODO: Add your video processing logic here
    // For now, we'll just simulate processing
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Upload processed video
    const outputUrl = await uploadVideo(inputPath, job.id);

    // Update job status to completed
    await supabase
      .from('jobs')
      .update({
        status: 'completed',
        output_url: outputUrl
      })
      .eq('id', job.id);

    // Clean up temp files
    fs.unlinkSync(inputPath);

    console.log(`Job ${job.id} completed successfully.`);
  } catch (error) {
    console.error('Error processing video:', error);
    
    // Update job status to failed if we have a job ID
    if (job?.id) {
      await supabase
        .from('jobs')
        .update({ status: 'failed' })
        .eq('id', job.id);
    }
  }
}

// Run the processor
processVideo(); 