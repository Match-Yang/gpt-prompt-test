import type { NextApiRequest, NextApiResponse } from 'next';
import {
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    SystemMessagePromptTemplate,
    PromptTemplate
} from "langchain/prompts";
import { LLMChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { SystemChatMessage } from "langchain/schema";

const USER_PROMPT = `
As a professional tech writer, your task is to create a detailed explanation of the following code in Markdown format. The target audience for this documentation is beginner developers, so the explanation should be written in a {tone} tone.
The code provided is written in the {programming_language}. Please provide a clear explanation of the code's functionality and how to use it. Please explain any key concepts or techniques used in the code, and provide examples or additional information to help beginner developers understand the code better.
Your explanation should be structured and easy to follow, with step-by-step instructions and clear explanations of each part of the code. Consider using headings, bullet points, code snippets, and other Markdown formatting to make the documentation more readable and visually appealing for the target audience.

Question:
{code}

Answer:
`;

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    const { programming_language, tone, code } = req.body;

    //only accept post requests
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        // We can also construct an LLMChain from a ChatPromptTemplate and a chat model.
        const chat = new ChatOpenAI({ temperature: 0.5 });

        const chatPrompt = new PromptTemplate({
            template: USER_PROMPT,
            inputVariables: ["programming_language", "tone", "code"],
          });
        const chainB = new LLMChain({
            prompt: chatPrompt,
            llm: chat,
        });


        const response = await chainB.call({
            programming_language,
            tone,
            code
        });

        console.log('response', response);
        res.status(200).json(response);
    } catch (error: any) {
        console.log('error', error);
        res.status(500).json({ error: error.message || 'Something went wrong' });
    }
}
