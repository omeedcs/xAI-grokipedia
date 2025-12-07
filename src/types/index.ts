export interface TopicNode {
  id: string;
  label: string;
  x: number;
  y: number;
  size: number;
  color: string;
  content?: string;
}

export interface TopicEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  color?: string;
  size?: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatCompletionRequest {
  messages: ChatMessage[];
  model: string;
  stream: boolean;
  temperature: number;
}

export interface ChatCompletionResponse {
  id: string;
  choices: {
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }[];
}

export interface RelatedTopic {
  topic: string;
  relationship: string;
}
