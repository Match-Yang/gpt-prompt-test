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
import readPromptFromGithub from "utils/prompt_helper"

const SYSTEM_PROMPT = ``;

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    const { doc_desc, doc_type, target_reader_type } = req.body;

    //only accept post requests
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        // We can also construct an LLMChain from a ChatPromptTemplate and a chat model.
        const chat = new ChatOpenAI({ temperature: 0.5 });

        const userPrompt = await readPromptFromGithub("generate_dir")
        const chatPrompt = new PromptTemplate({
            template: userPrompt,
            inputVariables: ["doc_desc", "doc_type", "target_reader_type"],
          });
        const chainB = new LLMChain({
            prompt: chatPrompt,
            llm: chat,
        });

        const systemMessage = new SystemChatMessage(SYSTEM_PROMPT);

        const response = await chainB.call({
            doc_desc,
            doc_type,
            target_reader_type,
            messages: [systemMessage]
        });

        console.log('response', response);
        res.status(200).json(response);
    } catch (error: any) {
        console.log('error', error);
        res.status(500).json({ error: error.message || 'Something went wrong' });
    }
}
