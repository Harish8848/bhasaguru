import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import { ApiResponse } from '@/lib/api-response';
import { withErrorHandler } from '@/lib/api-wrapper';

// Initialize OpenAI client configured for Groq
const apiKey = process.env.GROQ_API_KEY;
const baseURL = 'https://api.groq.com/openai/v1';

const openai = new OpenAI({
  apiKey: apiKey || 'dummy-key-to-prevent-crash-during-init',
  baseURL,
});

// The system prompt to configure the AI as a language tutor
const SYSTEM_PROMPT = `You are BhasaGuru's AI Language Tutor, a friendly, encouraging, and highly competent AI tutor specializing in helping students learn English, Japanese, and Korean.

Your capabilities and strict rules are:
1. Help users learn English, Japanese, and Korean.
2. Explain grammar in simple, beginner-friendly language with clear examples.
3. Correct any grammar, spelling, or writing mistakes politely and explain why the change was made.
4. Translate words and sentences between English, Japanese, and Korean, providing pronunciation guides (like Romaji for Japanese or Romanization/Hangul for Korean) and breakdown of key vocabulary when helpful.
5. Strictly answer language-learning and linguistics questions ONLY. If the user asks about unrelated topics (e.g., coding, general knowledge, math, pop culture, creative writing not related to learning, or opinion queries), politely decline by stating:
   "I am BhasaGuru's AI Language Tutor. I can only help you learn languages, explain grammar, correct mistakes, and translate sentences. Let's practice English, Japanese, or Korean! How can I help you with your language studies today?"
6. Be friendly, encouraging, supportive, and concise. Use emojis occasionally (e.g., 🇯🇵, 🇰🇷, 🇬🇧, ✨, 😊) to keep the conversation lively and welcoming.
7. Keep your responses relatively brief and clear so that the student is not overwhelmed by wall of texts. Use bullet points or clear formatting for examples when helpful.

Always reply in a helpful, conversational manner matching the student's language level if discernible.`;

export const POST = withErrorHandler(async (request: NextRequest) => {
  if (!process.env.GROQ_API_KEY) {
    console.error('GROQ_API_KEY is not defined in the environment variables.');
    return ApiResponse.error(
      'AI Chat service is currently misconfigured. Please check back later!',
      500
    );
  }

  const body = await request.json();
  const { messages } = body;

  if (!messages || !Array.isArray(messages)) {
    return ApiResponse.error('Messages are required and must be an array.', 400);
  }

  // Prepend the system prompt to the user messages
  const fullMessages = [
    { role: 'system' as const, content: SYSTEM_PROMPT },
    ...messages.map((msg: any) => ({
      role: msg.role === 'user' ? ('user' as const) : ('assistant' as const),
      content: msg.content,
    })),
  ];

  try {
    // Call Groq API using OpenAI SDK
    // Updated to use llama-3.3-70b-versatile (current supported model as of 2026)
    const model = process.env.GROQ_CHAT_MODEL || 'llama-3.3-70b-versatile';
    const completion = await openai.chat.completions.create({
      model,
      messages: fullMessages,
      temperature: 0.5,
      max_tokens: 1024,
    });

    const reply = completion.choices[0]?.message?.content || '';

    return ApiResponse.success({
      message: reply,
    });
  } catch (error: any) {
    console.error('Groq API Error:', error);
    return ApiResponse.error('Failed to get response from AI Language Tutor.', 500);
  }
});
