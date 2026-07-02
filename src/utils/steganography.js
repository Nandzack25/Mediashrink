/**
 * Manual BMP Encoder from scratch.
 * @param {number} width 
 * @param {number} height 
 * @param {Uint8ClampedArray} rgbaData 
 * @returns {Blob}
 */
export const encodeMessage = (imageFile, secretText) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        const textWithDelimiter = secretText + '$$$';
        const encoder = new TextEncoder();
        const textBytes = encoder.encode(textWithDelimiter);
        
        let binaryStr = '';
        for (let i = 0; i < textBytes.length; i++) {
          binaryStr += textBytes[i].toString(2).padStart(8, '0');
        }

        if (binaryStr.length > data.length / 4) {
          reject(new Error('Image is too small to hold this secret text.'));
          return;
        }

        let bitIndex = 0;
        for (let i = 0; i < data.length; i += 4) {
          if (bitIndex < binaryStr.length) {
            const bit = parseInt(binaryStr[bitIndex]);
            data[i] = (data[i] & ~1) | bit;
            bitIndex++;
          } else {
            break;
          }
        }

        ctx.putImageData(imgData, 0, 0);

        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/png');
      };
      img.onerror = () => reject(new Error('Failed to load image for encoding.'));
      img.src = event.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsDataURL(imageFile);
  });
};

export const decodeMessage = (imageFile) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        let binaryStr = '';
        for (let i = 0; i < data.length; i += 4) {
          binaryStr += (data[i] & 1).toString();
        }

        const bytes = [];
        for (let i = 0; i < binaryStr.length; i += 8) {
          const byteStr = binaryStr.slice(i, i + 8);
          if (byteStr.length === 8) {
            bytes.push(parseInt(byteStr, 2));
          }
        }

        const decoder = new TextDecoder();
        const decodedText = decoder.decode(new Uint8Array(bytes));
        
        const delimiterIndex = decodedText.indexOf('$$$');
        if (delimiterIndex !== -1) {
          resolve(decodedText.substring(0, delimiterIndex));
        } else {
          reject(new Error('No hidden message found in this image.'));
        }
      };
      img.onerror = () => reject(new Error('Failed to load image for decoding.'));
      img.src = event.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsDataURL(imageFile);
  });
};
