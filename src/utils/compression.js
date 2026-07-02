/**
 * Manual Spatial Downscaling Algorithm (Lossy Compression)
 * @param {File} file 
 * @param {number} quality (1-100)
 * @returns {Promise<File>}
 */
export const compressImage = (file, quality) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          const scale = Math.max(0.1, quality / 100);
          const sourceWidth = img.width;
          const sourceHeight = img.height;
          const targetWidth = Math.floor(sourceWidth * scale);
          const targetHeight = Math.floor(sourceHeight * scale);

          if (targetWidth === 0 || targetHeight === 0) {
             reject(new Error('Image is too small to be compressed further.'));
             return;
          }

          const sourceCanvas = document.createElement('canvas');
          sourceCanvas.width = sourceWidth;
          sourceCanvas.height = sourceHeight;
          const sourceCtx = sourceCanvas.getContext('2d');
          sourceCtx.drawImage(img, 0, 0, sourceWidth, sourceHeight);
          
          const sourceImgData = sourceCtx.getImageData(0, 0, sourceWidth, sourceHeight);
          const sourceData = sourceImgData.data;

          const targetCanvas = document.createElement('canvas');
          targetCanvas.width = targetWidth;
          targetCanvas.height = targetHeight;
          const targetCtx = targetCanvas.getContext('2d');
          const targetImgData = targetCtx.createImageData(targetWidth, targetHeight);
          const targetData = targetImgData.data;

          const xRatio = sourceWidth / targetWidth;
          const yRatio = sourceHeight / targetHeight;

          // Manual Nearest Neighbor interpolation
          for (let i = 0; i < targetHeight; i++) {
            for (let j = 0; j < targetWidth; j++) {
              const px = Math.floor(j * xRatio);
              const py = Math.floor(i * yRatio);
              const targetIndex = (i * targetWidth + j) * 4;
              const sourceIndex = (py * sourceWidth + px) * 4;

              targetData[targetIndex] = sourceData[sourceIndex];
              targetData[targetIndex + 1] = sourceData[sourceIndex + 1];
              targetData[targetIndex + 2] = sourceData[sourceIndex + 2];
              targetData[targetIndex + 3] = sourceData[sourceIndex + 3];
            }
          }
          
          targetCtx.putImageData(targetImgData, 0, 0);
          
          targetCanvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to create file from raw pixels.'));
                return;
              }
              const newName = file.name.replace(/\.[^/.]+$/, "") + '-compressed.jpg';
              const compressedFile = new File([blob], newName, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            },
            'image/jpeg',
            0.8
          );
        } catch (err) {
          reject(err);
        }
      };
      
      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.src = event.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};
