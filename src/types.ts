export interface ColorEvent {
  time: number;
  activeColor: string;
  inactiveColor: string;
}

export interface ParsedSunoOutput {
  style: string;
  title: string;
  excludeStyles: string;
  advancedParams: string;
  vocalGender: string;
  weirdness: number;
  styleInfluence: number;
  lyricsWithTags: string;
  lyricsAlone: string;
  fullResponse: string;
}

export interface GenerationState {
  isLoading: boolean;
  error: string | null;
  result: ParsedSunoOutput[] | null;
}

export interface SunoClip {
  id: string;
  title: string;
  created_at: string;
  model_name: string;
  imageUrl?: string;
  imageLargeUrl?: string;
  explicit?: boolean;
  metadata: {
    tags: string;
    prompt: string;
    negative_tags?: string;
    duration?: number;
    max_bpm?: number;
    min_bpm?: number;
    avg_bpm?: number;
    key?: string;
  };
  originalData?: ParsedSunoOutput;
  alignmentData?: AlignedWord[];
  lrcContent?: string;
  srtContent?: string;
}

export interface AlignedWord {
  word: string;
  start_s: number;
  end_s: number;
  success: boolean;
  p_align: number;
}

export interface LyricAlignmentResponse {
  aligned_words: AlignedWord[];
}

export interface SunoLibrary {
  genres: string[];
  structures: string[];
  vocalStyles: string[];
  production: string[];
  theory: string[];
}

export interface LyricalConstraints {
  forbidden: string[];
  forbiddenAdjectives: string[];
  forbiddenPhrases: string[];
  forbiddenRhymes: string; // Keep as string for simple editing
}

export interface PromptSettings {
  version: 'v1' | 'v2' | 'v3' | 'v4' | 'custom';
  customSystemPrompt: string;
  library: SunoLibrary;
  constraints: LyricalConstraints;
}

export interface FileContext {
  mimeType: string;
  data: string; // Base64 data URL
  name: string;
}

export type ViewMode = 'generator' | 'history' | 'visualizer';

export type Qt6Style = 'wave' | 'bars' | 'circle' | 'circular-wave';