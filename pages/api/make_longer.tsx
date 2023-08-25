

import type { NextApiRequest, NextApiResponse } from 'next';
import {
    PromptTemplate
} from "langchain/prompts";
import { LLMChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { ConsoleCallbackHandler } from "langchain/callbacks";
import { NextResponse } from 'next/server';

const USER_PROMPT = `
As a professional tech writer, your task is to review the following text and revise it to be longer for more details without changing its meaning and tone. Please ensure that the character count of the result is approximately 1.5 times the length of the original content.

Content: 
{content}

Answer:
`;

export const config = {
    runtime: 'edge',
    regions: ['iad1', 'sfo1', 'hnd1'],
  };

export default async function handler(
    req: NextApiRequest,
) {
    const { content } = req.body;
    console.log(`make_longer: [content: ${req.body}]`)

    //only accept post requests
    if (req.method !== 'POST') {
        return NextResponse.json({error: 'Method not allowed'}, {status: 405});
    }

    try {
        // We can also construct an LLMChain from a ChatPromptTemplate and a chat model.
        const chat = new ChatOpenAI({ temperature: 0.5, modelName: 'gpt-3.5-turbo' });

        const chatPrompt = new PromptTemplate({
            template: USER_PROMPT,
            inputVariables: ["content"],
        });
        const handler = new ConsoleCallbackHandler();
        handler.handleChainError = async (error: Error, runID: string) => {
            console.log('LLMChain error:', error);
        }
        const chainB = new LLMChain({
            prompt: chatPrompt,
            llm: chat,
            callbacks: [handler]
        });


        const response = await chainB.call({
            content,
        });

        console.log('response', response);
        return NextResponse.json(response, {status: 200});
    } catch (error: any) {
        console.log('error', error);
        return NextResponse.json({error: error.message || 'Something went wrong'}, {status: 500});
    }
}
