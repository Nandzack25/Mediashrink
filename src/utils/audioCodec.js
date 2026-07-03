/**
 * MediaShrink Audio Codec (Manual Decimation & WAV Header Construction)
 * @param {File} file - Original audio file
 * @param {number} quality - 1 to 100 (determines sample rate decimation)
 * @returns {Promise<File>} - Standard .wav file
 */
export const compressAudio = (file, quality) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const arrayBuffer = e.target.result;
        
        // Decode audio data using browser's built in decoder
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        // --- 1. Downmix to Mono (Aritmatika Manual) ---
        let channelData = audioBuffer.getChannelData(0);
        if (audioBuffer.numberOfChannels > 1) {
          const rightChannel = audioBuffer.getChannelData(1);
          const monoData = new Float32Array(channelData.length);
          for (let i = 0; i < channelData.length; i++) {
            monoData[i] = (channelData[i] + rightChannel[i]) / 2;
          }
          channelData = monoData;
        }

        // --- 2. Decimation (Penurunan Sample Rate Manual) ---
        // Quality 100 = Original Sample Rate, Quality 1 = 8000 Hz
        const minRate = 8000;
        const targetRate = Math.floor(minRate + ((audioBuffer.sampleRate - minRate) * (quality / 100)));
        
        const ratio = audioBuffer.sampleRate / targetRate;
        const newLength = Math.round(channelData.length / ratio);
        const decimatedData = new Float32Array(newLength);
        
        for (let i = 0; i < newLength; i++) {
          // Nearest neighbor decimation
          const sourceIndex = Math.round(i * ratio);
          decimatedData[i] = channelData[Math.min(sourceIndex, channelData.length - 1)];
        }

        // --- 3. Manual WAV Header Construction ---
        // Kami membuat header biner standar WAV 44-byte dari nol menggunakan DataView
        const blockAlign = 1 * 2; // 1 channel * 2 bytes (16-bit)
        const byteRate = targetRate * blockAlign;
        const dataSize = decimatedData.length * 2; // 16-bit = 2 bytes per sample
        const bufferSize = 44 + dataSize;
        const arrayBufferOut = new ArrayBuffer(bufferSize);
        const view = new DataView(arrayBufferOut);

        // RIFF chunk descriptor
        writeString(view, 0, 'RIFF');
        view.setUint32(4, 36 + dataSize, true); // File size
        writeString(view, 8, 'WAVE');

        // fmt sub-chunk
        writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
        view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
        view.setUint16(22, 1, true); // NumChannels (1 for Mono)
        view.setUint32(24, targetRate, true); // SampleRate
        view.setUint32(28, byteRate, true); // ByteRate
        view.setUint16(32, blockAlign, true); // BlockAlign
        view.setUint16(34, 16, true); // BitsPerSample (16-bit)

        // data sub-chunk
        writeString(view, 36, 'data');
        view.setUint32(40, dataSize, true);

        // --- 4. Bit-Depth Reduction (Float32 to Int16) ---
        // Mengonversi secara manual dari desimal menjadi bilangan bulat 16-bit
        let offset = 44;
        for (let i = 0; i < decimatedData.length; i++, offset += 2) {
          let s = Math.max(-1, Math.min(1, decimatedData[i]));
          // Kalikan dengan skala maksimum 16-bit signed integer
          view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        }

        const newName = file.name.replace(/\.[^/.]+$/, "") + '-compressed.wav';
        const compressedFile = new File([arrayBufferOut], newName, {
          type: 'audio/wav',
          lastModified: Date.now()
        });
        
        // Clean up
        audioContext.close();
        
        resolve(compressedFile);

      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read audio file'));
    reader.readAsArrayBuffer(file);
  });
};

function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
