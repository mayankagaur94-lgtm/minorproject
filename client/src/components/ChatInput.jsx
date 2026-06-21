import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, Mic, Paperclip, Sparkles, Trash2, Square, X, FileSpreadsheet, Headphones } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatInput = ({ onSendMessage, disabled, injectedQuery, onInjectedQueryConsumed }) => {
  const [text, setText] = useState('');

  // Attachments State
  const [csvFile, setCsvFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  const csvInputRef = useRef(null);
  const imageInputRef = useRef(null);

  // Audio Recording Timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      setRecordingTime(0);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  // Auto-fill input when a saved query is injected from Saved Queries view
  useEffect(() => {
    if (injectedQuery) {
      setText(injectedQuery);
      if (onInjectedQueryConsumed) onInjectedQueryConsumed();
    }
  }, [injectedQuery]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // CSV File Handler
  const handleCsvClick = () => {
    csvInputRef.current?.click();
  };

  const handleCsvChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const csvText = event.target.result;
      const lines = csvText.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      const rows = lines.slice(1).filter(line => line.trim()).map(line => {
        const values = line.split(',');
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index] ? values[index].trim() : '';
        });
        return row;
      });

      setCsvFile({
        name: file.name,
        headers,
        rows,
        rawText: csvText
      });
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  // Image File Handler
  const handleImageClick = () => {
    imageInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target.result.split(',')[1];
      setImageFile({
        name: file.name,
        mimeType: file.type,
        base64: base64Data,
        previewUrl: event.target.result
      });
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset input
  };

  // Voice Recording Handlers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Data = reader.result.split(',')[1];
          setAudioFile({
            name: 'Voice Message.webm',
            mimeType: 'audio/webm',
            base64: base64Data,
            previewUrl: URL.createObjectURL(audioBlob)
          });
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access error:", err);
      alert("Could not access microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.onstop = null; // Ignore stop events
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if ((text.trim() || csvFile || imageFile || audioFile) && !disabled) {
      onSendMessage(text, { csvFile, imageFile, audioFile });
      setText('');
      setCsvFile(null);
      setImageFile(null);
      setAudioFile(null);
    }
  };

  return (
    <div className="p-6 pt-2 relative">
      <AnimatePresence>
        {text && !isRecording && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute -top-4 left-1/2 -translate-x-1/2"
          >
            <div className="flex items-center gap-2 px-3 py-1 rounded-full glass-celadon text-[10px] font-bold text-celadon shadow-lg">
              <Sparkles size={12} />
              AI Assistant is ready
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto flex flex-col gap-2">
        {/* Attachment Previews */}
        <AnimatePresence>
          {(csvFile || imageFile || audioFile) && (
            <motion.div
              initial={{ opacity: 0, y: 10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: 10, height: 0 }}
              className="flex flex-wrap gap-2 px-2 pb-2"
            >
              {csvFile && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-soft/10 border border-emerald-soft/20 text-emerald-soft text-xs font-medium animate-pulse">
                  <FileSpreadsheet size={14} />
                  <span>{csvFile.name} ({csvFile.rows.length} rows)</span>
                  <button type="button" onClick={() => setCsvFile(null)} className="hover:text-white ml-1">
                    <X size={14} />
                  </button>
                </div>
              )}

              {imageFile && (
                <div className="relative group rounded-xl overflow-hidden border border-white/10 h-16 w-16 bg-white/5">
                  <img src={imageFile.previewUrl} alt="Preview" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImageFile(null)}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {audioFile && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-celadon/10 border border-celadon/20 text-celadon text-xs font-medium">
                  <Headphones size={14} />
                  <span>Voice Message</span>
                  <audio src={audioFile.previewUrl} controls className="h-4 w-28 accent-celadon opacity-70" />
                  <button type="button" onClick={() => setAudioFile(null)} className="hover:text-white ml-1">
                    <X size={14} />
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hidden inputs */}
        <input type="file" ref={csvInputRef} onChange={handleCsvChange} accept=".csv" className="hidden" />
        <input type="file" ref={imageInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />

        <form
          onSubmit={handleSubmit}
          className="glass border border-white/10 rounded-[32px] p-2 flex items-center gap-2 shadow-2xl shadow-black/40 relative overflow-hidden"
        >
          {isRecording ? (
            // Voice Recording Mode UI
            <div className="flex-1 flex items-center justify-between px-4 py-2 text-white">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-sm font-semibold tracking-wider font-mono">{formatTime(recordingTime)}</span>

                {/* Micro waveform animation */}
                <div className="flex items-center gap-0.5 h-4 pl-2">
                  {[1, 2, 3, 4, 5, 4, 3, 2, 1].map((h, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: [4, h * 4, 4] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.08 }}
                      className="w-0.5 bg-celadon rounded-full"
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={cancelRecording}
                  className="p-2 rounded-full hover:bg-white/5 text-white/40 hover:text-red-400 transition-colors"
                  title="Cancel Recording"
                >
                  <Trash2 size={18} />
                </button>
                <button
                  type="button"
                  onClick={stopRecording}
                  className="p-2 rounded-full bg-celadon text-background hover:bg-celadon-dark transition-colors flex items-center justify-center"
                  title="Stop and Attach"
                >
                  <Square size={16} fill="currentColor" />
                </button>
              </div>
            </div>
          ) : (
            // Normal Typing Mode UI
            <>
              <div className="flex items-center gap-1 pl-2">
                <button
                  type="button"
                  onClick={handleCsvClick}
                  className={`p-2.5 rounded-full hover:bg-white/5 transition-colors ${csvFile ? 'text-celadon' : 'text-white/40 hover:text-white'}`}
                  title="Attach CSV"
                >
                  <Paperclip size={18} />
                </button>
                <button
                  type="button"
                  onClick={startRecording}
                  className="p-2.5 rounded-full hover:bg-white/5 text-white/40 hover:text-white transition-colors"
                  title="Record Voice Message"
                >
                  <Mic size={18} />
                </button>
              </div>

              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Ask about students, placements, or university data..."
                disabled={disabled}
                className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/20 text-sm py-3 px-2"
              />

              <div className="flex items-center gap-2 pr-2">
                <button
                  type="button"
                  onClick={handleImageClick}
                  className={`p-2.5 rounded-full hover:bg-white/5 transition-colors ${imageFile ? 'text-celadon' : 'text-white/40 hover:text-white'}`}
                  title="Attach Image"
                >
                  <ImageIcon size={18} />
                </button>

                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(172, 225, 175, 0.4)' }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={(!text.trim() && !csvFile && !imageFile && !audioFile) || disabled}
                  className="w-10 h-10 rounded-full bg-celadon text-background flex items-center justify-center disabled:opacity-30 disabled:hover:scale-100 disabled:shadow-none transition-all shadow-lg"
                >
                  <Send size={18} fill="currentColor" />
                </motion.button>
              </div>
            </>
          )}
        </form>
      </div>

      <p className="text-[10px] text-center text-white/20 mt-3 font-medium">
        Press Enter to send. Talk-to-your Database can make mistakes. Verify important info.
      </p>
    </div>
  );
};

export default ChatInput;
