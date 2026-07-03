/**
 * MediaShrink Video Codec (Manual Spatio-Temporal Subsampling & WebM Packaging)
 * @param {File} file - Original video file
 * @param {number} quality - 1 to 100 (determines spatial resolution and frame rate dropping)
 * @param {function} onProgress - Callback for processing progress
 * @returns {Promise<File>} - Standard .webm file
 */
export const compressVideo = (file, quality, onProgress) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.src = URL.createObjectURL(file);
    video.muted = true;

    video.onloadedmetadata = () => {
      try {
        // --- 1. Spatial Downscaling Setup ---
        const scale = Math.max(0.1, quality / 100);
        const targetWidth = Math.floor(video.videoWidth * scale);
        const targetHeight = Math.floor(video.videoHeight * scale);
        
        if (targetWidth === 0 || targetHeight === 0) {
          throw new Error('Video dimensions too small after scaling.');
        }

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        // --- 2. Temporal Compression Setup ---
        // Quality 100 = 30 FPS, Quality 1 = 5 FPS
        const targetFPS = Math.floor(5 + (25 * (quality / 100)));
        const frameInterval = 1 / targetFPS; // seconds per frame
        
        // --- 3. WebM Packaging Setup ---
        // Use MediaRecorder to capture the manually processed canvas frames
        const stream = canvas.captureStream(targetFPS);
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'video/webm;codecs=vp8'
        });
        
        const chunks = [];
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };
        
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          const newName = file.name.replace(/\.[^/.]+$/, "") + '-compressed.webm';
          const compressedFile = new File([blob], newName, {
            type: 'video/webm',
            lastModified: Date.now()
          });
          URL.revokeObjectURL(video.src);
          resolve(compressedFile);
        };

        mediaRecorder.start();

        // --- 4. Manual Frame Extraction Loop ---
        let currentTime = 0;
        
        const processNextFrame = () => {
          if (currentTime >= video.duration) {
            mediaRecorder.stop();
            return;
          }

          video.currentTime = currentTime;
        };

        video.onseeked = () => {
          // Frame has loaded at currentTime, draw to canvas (Spatial Scaling)
          ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
          
          // Note: Here we could manipulate `ctx.getImageData()` manually if we wanted 
          // to add grayscale or custom filters, but spatial resizing is already done.
          
          if (onProgress) {
            onProgress(Math.min(100, Math.round((currentTime / video.duration) * 100)));
          }

          // Advance time (Temporal Compression: skipping intermediate frames)
          currentTime += frameInterval;
          
          // Use requestAnimationFrame to yield to the main thread
          requestAnimationFrame(processNextFrame);
        };

        video.onerror = () => {
          reject(new Error("Error playing video for extraction."));
        };

        // Start processing
        processNextFrame();
        
      } catch (err) {
        URL.revokeObjectURL(video.src);
        reject(err);
      }
    };

    video.onerror = () => reject(new Error('Failed to load video file.'));
  });
};
