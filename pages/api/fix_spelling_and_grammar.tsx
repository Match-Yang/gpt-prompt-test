import type { NextApiRequest, NextApiResponse } from 'next';
import {
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    SystemMessagePromptTemplate,
    PromptTemplate
} from "langchain/prompts";
import { LLMChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";

const USER_PROMPT = `
As a professional tech writer, your task is to review the following text for any spelling and grammar errors, and provide revised text if errors are found. If no errors are found, please respond with "The provided text is free of spelling and grammar errors."
Please ensure that your revisions are clear, concise, and accurately address any identified spelling and grammar errors in the original text.

Text to review: 
{content}

Answer:
`;

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    const { content } = req.body;

    //only accept post requests
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        // We can also construct an LLMChain from a ChatPromptTemplate and a chat model.
        const chat = new ChatOpenAI({ temperature: 0.5, modelName: 'gpt-3.5-turbo' });

        const chatPrompt = new PromptTemplate({
            template: USER_PROMPT,
            inputVariables: ["content"],
          });
        const chainB = new LLMChain({
            prompt: chatPrompt,
            llm: chat,
        });


        const response = await chainB.call({
            content,
        });

        console.log('response', response);
        res.status(200).json(response);
    } catch (error: any) {
        console.log('error', error);
        res.status(500).json({ error: error.message || 'Something went wrong' });
    }
}
