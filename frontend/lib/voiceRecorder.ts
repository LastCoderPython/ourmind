let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];

export async function startRecording(): Promise<void> {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
    audioChunks = [];

    mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
            audioChunks.push(event.data);
        }
    };

    mediaRecorder.start();
}

export function stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
        if (!mediaRecorder) {
            reject(new Error('No active recording'));
            return;
        }

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            // Stop all tracks to release the microphone
            mediaRecorder?.stream.getTracks().forEach((track) => track.stop());
            mediaRecorder = null;
            audioChunks = [];
            resolve(audioBlob);
        };

        mediaRecorder.onerror = () => {
            reject(new Error('Recording failed'));
        };

        mediaRecorder.stop();
    });
}

export function isCurrentlyRecording(): boolean {
    return mediaRecorder !== null && mediaRecorder.state === 'recording';
}
