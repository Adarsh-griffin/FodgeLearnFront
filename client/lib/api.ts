/**
 * API service for connecting React frontend with Flask backend
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export interface UploadResponse {
  message: string;
  filename: string;
  status: string;
  fileId?: string;
}

export interface ProcessingStatus {
  status: 'processing' | 'completed' | 'not_found';
  message: string;
  hasExplanation?: boolean;
}

export interface FileInfo {
  _id: string;
  originalName: string;
  uploadDate: string;
  size: number;
  folder?: string;
}

export interface QAResponse {
  answer: string;
  sources?: string[];
}

export interface AssessmentQuestion {
  question: string;
  fileName?: string;
}

export interface AssessmentFeedback {
  feedback: string;
}

export interface TTSResponse {
  audio_url: string;
}

export interface LearningTTSResult {
  audioUrl: string;
  audioId: string;
  s3Url?: string;
  localPath?: string;
  videoUrl?: string | null;
  videoFilename?: string | null;
  videoError?: string;
}

export interface LipsyncVideoResponse {
  video_url: string | null;
  folder?: string;
  video_filename?: string;
  audio_key?: string | null;
  audio_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

// /api/lipsync/generate now returns immediately (202) and runs the actual
// (slow, up to 5 minutes) generation in a background thread, instead of
// blocking the HTTP request for the whole duration - callers poll
// getLatestLipsyncVideo() for the result (see apiService.generateLipsyncVideo).
export interface LipsyncGenerateStartedResponse {
  status: "generating";
  folder: string;
  message: string;
  requested_at: string;
}

export interface ReferenceLink {
  title: string;
  url: string;
  description?: string;
}

export interface TutorChatResponse {
  response: string;
  citations?: string[];
  section?: string;
}

export interface TutorVoiceResponse {
  transcript: string;
  response: string;
  translated?: string | null;
}

// ---------------- AI Tutor types (see LearnBack's tutor build plan) ----------------
// Every /api/tutor/* call needs an auth header - either a Clerk Bearer
// token or an X-Anonymous-Id (see client/lib/identity.ts's
// getTutorAuthHeaders, which every caller below is expected to pass in).

export interface TutorTopic {
  id: string;
  title: string;
  page_range: [number | null, number | null];
  summary: string;
  prerequisites: string[];
}

export interface TutorTopicGraph {
  topics: TutorTopic[];
  generated_at: string;
}

export interface DiagnosticOption {
  key: string;
  text: string;
}

/** One question to answer - always has done:false. */
export interface DiagnosticQuestion {
  done: false;
  topic_id: string;
  topic_title: string;
  question: string;
  options: DiagnosticOption[];
  questions_asked: number;
  max_questions: number;
  // Feedback on the PREVIOUS answer - absent on the very first question from /start.
  correct?: boolean;
  correct_key?: string;
  misconception?: string | null;
  answered_topic_id?: string;
  answered_topic_title?: string;
}

/** The diagnostic has finished - always has done:true. */
export interface DiagnosticResult {
  done: true;
  mastery: Record<string, number>;
  weak_prerequisites: string[];
  confidence: number;
  questions_asked: number;
  notice?: string;
  correct?: boolean;
  correct_key?: string;
  misconception?: string | null;
  answered_topic_id?: string;
  answered_topic_title?: string;
}

export type DiagnosticStepResponse = DiagnosticQuestion | DiagnosticResult;

// This project builds with strictNullChecks: false, which weakens
// TypeScript's automatic discriminated-union narrowing on `if (res.done)` -
// explicit type-predicate functions narrow correctly regardless of that
// setting, so callers use these instead of relying on `res.done` alone.
export function isDiagnosticDone(res: DiagnosticStepResponse): res is DiagnosticResult {
  return res.done === true;
}

export type MasteryBand = 'teach' | 'practice' | 'apply' | 'review';
export type DeliveryMode = 'worked_example' | 'socratic' | 'direct_explanation' | 'review';

/**
 * Mirrors planner.py's mastery_band() thresholds - display-only (which
 * color/label bucket a mastery % falls into right after a checkpoint
 * update, before the next full plan/lesson fetch confirms it). The
 * backend's own band value in the next API response is always the source
 * of truth; this just avoids a stale-looking sidebar for a few seconds.
 */
export function masteryBandClient(score: number): MasteryBand {
  if (score < 0.6) return 'teach';
  if (score < 0.75) return 'practice';
  if (score < 0.9) return 'apply';
  return 'review';
}

export interface StudyPlanStep {
  topic_id: string;
  title: string;
  mastery: number;
  band: MasteryBand;
  estimated_minutes: number;
  delivery_mode: DeliveryMode;
  reason: string;
  prerequisites: string[];
}

export interface DeferredTopic {
  topic_id: string;
  title: string;
  band: MasteryBand;
}

export interface StudyPlan {
  goal: string;
  available_minutes: number;
  total_minutes: number;
  steps: StudyPlanStep[];
  deferred_topics: DeferredTopic[];
  generated_at: string;
}

/** What /api/tutor/progress says to resume to for (this user, this file). */
export interface TutorProgress {
  stage: "onboarding" | "roadmap" | "lesson";
  goal?: string;
  availableMinutes?: number;
  studyPlan?: StudyPlan;
}

/** One lesson to work through - always has done:false. */
export interface LessonStep {
  done: false;
  topic_id: string;
  topic_title: string;
  is_remediation: boolean;
  delivery_mode: DeliveryMode;
  mastery: number;
  band: MasteryBand;
  objective: string;
  explanation: string;
  example: string;
  checkpoint_question: string;
  images: string[];
  audio_url?: string;
  audioUrl?: string;
  step_index: number;
  total_steps: number;
}

/** No more planned topics left - always has done:true. */
export interface LessonComplete {
  done: true;
  message: string;
}

export type LessonNextResponse = LessonStep | LessonComplete;

export function isLessonComplete(res: LessonNextResponse): res is LessonComplete {
  return res.done === true;
}

export type NextAction = 'advance' | 'reteach_different_strategy' | 'remediate_prerequisite' | 'advance_forced';

export interface CheckpointResult {
  understood: boolean;
  feedback: string;
  misconception: string | null;
  topic_id: string;
  topic_title: string;
  mastery: number;
  next_action: NextAction;
  reason: string;
  done: boolean;
  step_index: number;
  total_steps: number;
}

class ApiService {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private toAbsoluteUrl(url?: string | null): string | null {
    if (!url) {
      return null;
    }
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    const normalizedBase = this.baseURL.replace(/\/$/, '');
    const normalizedPath = url.startsWith('/') ? url : `/${url}`;
    return `${normalizedBase}${normalizedPath}`;
  }

  // Upload file
  async uploadFile(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('pdf', file);

    const response = await fetch(`${this.baseURL}/api/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Upload failed');
    }

    return response.json();
  }

  // Get uploaded files
  async getFiles(): Promise<FileInfo[]> {
    const response = await fetch(`${this.baseURL}/api/files`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch files');
    }

    return response.json();
  }

  // Ask question
  async askQuestion(question: string): Promise<QAResponse> {
    const response = await fetch(`${this.baseURL}/api/qa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to get answer');
    }

    return response.json();
  }

  // Get text content - fileName pins this to one specific document,
  // matching how /api/qa and friends already resolve which document to use.
  // Omitting it falls back to "most recently uploaded" server-side.
  async getText(fileName?: string): Promise<{ text: string; images: string[]; fileName?: string; status: string }> {
    const query = fileName ? `?fileName=${encodeURIComponent(fileName)}` : '';
    const response = await fetch(`${this.baseURL}/api/get_text${query}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch text');
    }

    const data = await response.json();
    return {
      text: data.script_text || '',
      images: data.images || [],
      fileName: data.fileName,
      status: data.status || 'completed',
    };
  }

  // Get reference links - same fileName pinning as getText().
  async getLinks(fileName?: string): Promise<ReferenceLink[]> {
    const query = fileName ? `?fileName=${encodeURIComponent(fileName)}` : '';
    const response = await fetch(`${this.baseURL}/api/get_links${query}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch links');
    }

    const data = await response.json();
    const links = data.links || [];

    // Convert string links to ReferenceLink objects if needed
    return links.map((link: string | ReferenceLink) => {
      if (typeof link === 'string') {
        return {
          title: this.extractTitleFromUrl(link),
          url: link,
          description: undefined
        };
      }
      return link;
    });
  }

  private extractTitleFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.replace('www.', '');
      const pathname = urlObj.pathname.split('/').pop() || '';

      if (pathname) {
        return pathname.replace(/[-_]/g, ' ').replace(/\.[^/.]+$/, '');
      }
      return hostname;
    } catch {
      return url;
    }
  }

  // Generate assessment question - scoped to fileName so questions match
  // whichever document the student is actually viewing, not just whatever
  // was uploaded most recently.
  async generateAssessment(type: 'theoretical' | 'mcq' = 'theoretical', fileName?: string | null): Promise<AssessmentQuestion> {
    const params = new URLSearchParams({ type });
    if (fileName) params.set('fileName', fileName);
    const response = await fetch(`${this.baseURL}/api/assessment/generate?${params.toString()}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to generate assessment');
    }

    return response.json();
  }

  // Submit assessment answer
  async submitAssessment(question: string, answer: string, fileName?: string | null): Promise<AssessmentFeedback> {
    const response = await fetch(`${this.baseURL}/api/assessment/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
        answer,
        fileName
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to submit assessment');
    }

    return response.json();
  }

  // Text-to-Speech for learning
  async learningTTS(text?: string, fileName?: string): Promise<LearningTTSResult> {
    const requestBody: any = {};
    if (text) {
      requestBody.text = text;
    }
    if (fileName) {
      requestBody.fileName = fileName;
    }

    const response = await fetch(`${this.baseURL}/api/learning-tts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'TTS failed');
    }

    const data = await response.json();
    const rawAudioUrl: string | undefined = data.audio_url;
    const absoluteAudioUrl =
      rawAudioUrl && rawAudioUrl.startsWith('/')
        ? `${this.baseURL}${rawAudioUrl}`
        : rawAudioUrl || (data.audioId ? `${this.baseURL}/api/tts-audio/${data.audioId}` : undefined);

    if (!absoluteAudioUrl) {
      throw new Error('No audio URL or audioId in response');
    }

    const result: LearningTTSResult = {
      audioUrl: absoluteAudioUrl,
      audioId: data.audioId,
      s3Url: data.s3_url,
      localPath: data.local_path,
    };

    if (data.video) {
      const videoUrlRaw = data.video.video_url || data.video.videoUrl;
      result.videoUrl = this.toAbsoluteUrl(videoUrlRaw);
      result.videoFilename = data.video.video_filename || data.video.videoFilename;
      result.videoError = data.video.error;
    }

    return result;
  }

  // Text-to-Speech for Q&A
  async qaTTS(text: string): Promise<string> {
    const response = await fetch(`${this.baseURL}/api/qa-tts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'TTS failed');
    }

    const data: TTSResponse = await response.json();
    return data.audio_url;
  }

  // On-demand TTS for AI Tutor lesson
  async getTutorTTS(text: string, topicId: string, fileId: string, customHeaders: Record<string, string> = {}): Promise<string> {
    const response = await fetch(`${this.baseURL}/api/tutor/tts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...customHeaders,
      },
      body: JSON.stringify({ text, topicId, fileId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to synthesize tutor speech');
    }

    const data = await response.json();
    if (!data.audio_url) {
      throw new Error('No audio_url returned from server');
    }
    return data.audio_url;
  }

  // Voice input for Q&A
  async qaVoice(audioFile: File): Promise<QAResponse> {
    const formData = new FormData();
    formData.append('audio', audioFile);

    const response = await fetch(`${this.baseURL}/api/qa-voice`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Voice processing failed');
    }

    return response.json();
  }

  async getLatestLipsyncVideo(fileName?: string): Promise<LipsyncVideoResponse> {
    const params = new URLSearchParams();
    if (fileName) {
      params.append('fileName', fileName);
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await fetch(`${this.baseURL}/api/lipsync/latest${query}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || 'Failed to load lipsync video');
    }

    const data: LipsyncVideoResponse = await response.json();
    data.video_url = this.toAbsoluteUrl(data.video_url);
    return data;
  }

  async generateLipsyncVideo(fileName?: string): Promise<LipsyncGenerateStartedResponse> {
    const response = await fetch(`${this.baseURL}/api/lipsync/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fileName ? { fileName } : {}),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to generate lipsync video');
    }

    return response.json();
  }

  // Check processing status
  async checkProcessingStatus(filename: string): Promise<ProcessingStatus> {
    const response = await fetch(`${this.baseURL}/api/processing-status/${encodeURIComponent(filename)}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to check processing status');
    }

    return response.json();
  }

  // ---------------- AI Tutor ----------------
  // Every method below takes `authHeaders` last - build it once per call
  // site with getTutorAuthHeaders() from client/lib/identity.ts.

  /**
   * Whether this identity (Clerk user or anonymous id) has ANY saved AI
   * Tutor progress at all - used by Home/Navigation to decide "Continue
   * Learning" vs "Start Now"/"Get Started" against real backend state,
   * not just "is this browser identified" (see useReturningStatus).
   */
  async getHasTutorProfile(authHeaders: Record<string, string>): Promise<boolean> {
    const response = await fetch(`${this.baseURL}/api/tutor/has-profile`, {
      headers: authHeaders,
    });
    if (!response.ok) return false;
    const data = await response.json().catch(() => ({}));
    return !!data.hasProfile;
  }

  /** "Delete Profile" in the account menu - wipes all saved AI Tutor progress for this identity. */
  async deleteTutorProfile(authHeaders: Record<string, string>): Promise<void> {
    const response = await fetch(`${this.baseURL}/api/tutor/profile`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to delete profile');
    }
  }

  /**
   * Lets TutorTab resume wherever this student left off for this document
   * (roadmap or an in-progress lesson) instead of always restarting at
   * onboarding when the tab remounts - see test_groq.py's /api/tutor/progress
   * for what's actually persisted and why a mid-diagnostic isn't resumed.
   */
  async getTutorProgress(fileId: string, authHeaders: Record<string, string>): Promise<TutorProgress> {
    const response = await fetch(`${this.baseURL}/api/tutor/progress?fileId=${encodeURIComponent(fileId)}`, {
      headers: authHeaders,
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch tutor progress');
    }
    return response.json();
  }

  async getTutorTopics(fileId: string, authHeaders: Record<string, string>): Promise<TutorTopicGraph> {
    const response = await fetch(`${this.baseURL}/api/tutor/topics?fileId=${encodeURIComponent(fileId)}`, {
      headers: authHeaders,
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch topics');
    }
    return response.json();
  }

  async startDiagnostic(fileId: string, goal: string, authHeaders: Record<string, string>): Promise<DiagnosticStepResponse> {
    const response = await fetch(`${this.baseURL}/api/tutor/diagnostic/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({ fileId, goal }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to start the diagnostic');
    }
    return response.json();
  }

  async answerDiagnostic(fileId: string, selectedKey: string, authHeaders: Record<string, string>): Promise<DiagnosticStepResponse> {
    const response = await fetch(`${this.baseURL}/api/tutor/diagnostic/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({ fileId, selectedKey }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to submit the answer');
    }
    return response.json();
  }

  async generateStudyPlan(
    fileId: string,
    availableMinutes: number,
    goal: string | undefined,
    authHeaders: Record<string, string>,
  ): Promise<StudyPlan> {
    const response = await fetch(`${this.baseURL}/api/tutor/plan/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({ fileId, availableMinutes, goal }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to generate the study plan');
    }
    return response.json();
  }

  async getNextLesson(fileId: string, authHeaders: Record<string, string>): Promise<LessonNextResponse> {
    const response = await fetch(`${this.baseURL}/api/tutor/lesson/next`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({ fileId }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to load the next lesson');
    }
    return response.json();
  }

  async submitCheckpoint(fileId: string, answer: string, authHeaders: Record<string, string>): Promise<CheckpointResult> {
    const response = await fetch(`${this.baseURL}/api/tutor/lesson/checkpoint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({ fileId, answer }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to submit the checkpoint answer');
    }
    return response.json();
  }

  // ---------------- AI Tutor: "Ask Your Tutor" chat ----------------
  // Reuses the existing Q&A/voice/TTS endpoints already built for the
  // document summary page (Study.tsx) - not behind @require_auth, so no
  // auth headers needed here, unlike the /api/tutor/* methods above.

  async askTutorQuestion(question: string, fileName: string): Promise<TutorChatResponse> {
    const response = await fetch(`${this.baseURL}/api/qa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, fileName }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to get an answer');
    }
    return response.json();
  }

  async askTutorVoice(audioBlob: Blob, fileName: string): Promise<TutorVoiceResponse> {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'voice.webm');
    formData.append('fileName', fileName);
    const response = await fetch(`${this.baseURL}/api/qa-voice`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to process voice input');
    }
    return response.json();
  }

  /**
   * Synthesizes speech and returns a directly-playable URL. /api/qa-tts
   * only returns a GridFS `audioId` (unlike /api/qa-voice's `audioUrl`,
   * which is always null - that field is an unwired placeholder there) -
   * the actual playable URL is built from the separate streaming route.
   */
  async synthesizeTutorSpeech(text: string, fileName?: string): Promise<string> {
    const response = await fetch(`${this.baseURL}/api/qa-tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, fileName }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to synthesize speech');
    }
    const data = await response.json();
    return `${this.baseURL}/api/tts-audio/${data.audioId}`;
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/api/health`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      if (response.ok) {
        return true;
      }
      // Fallback check to getFiles
      await this.getFiles();
      return true;
    } catch (error) {
      console.warn('Backend connection test failed:', error);
      return false;
    }
  }
}

export const apiService = new ApiService();
