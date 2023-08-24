import type { NextApiRequest, NextApiResponse } from 'next';
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "langchain/prompts";
import { LLMChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import readPromptFromGithub from "utils/prompt_helper"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { original_code, programming_language } = req.body;

  console.log('programming_language:', programming_language);
  console.log('original_code:', original_code);

  //only accept post requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!original_code) {
    return res.status(400).json({ message: 'No content in the request' });
  }

  try {
    const systemPrompt = await readPromptFromGithub('translate_code_system');
    const userPrompt = await readPromptFromGithub('translate_code_user');
    // We can also construct an LLMChain from a ChatPromptTemplate and a chat model.
    const chat = new ChatOpenAI({ temperature: 0 });
    const chatPrompt = ChatPromptTemplate.fromPromptMessages([
      SystemMessagePromptTemplate.fromTemplate(systemPrompt),
      HumanMessagePromptTemplate.fromTemplate(userPrompt),
    ]);
    const chainB = new LLMChain({
      prompt: chatPrompt,
      llm: chat,
    });

    const response = await chainB.call({
      original_code,
      programming_language,
    });

    console.log('response', response);
    res.status(200).json(response);
  } catch (error: any) {
    console.log('error', error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
}
