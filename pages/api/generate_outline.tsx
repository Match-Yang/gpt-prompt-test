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
As a professional tech writer, your task is to create an outline for an English documentation about {more_info}. The documentation should be concise and suitable for beginners to read, while also targeting {target_reader_type} as the primary audience.

The output should only include the title without anything else. Please format the outline using the following structure:
#Heading 1
##Heading 2

Your outline should provide a clear and logical structure for the documentation, organizing the content in a way that makes it easy for beginners to follow and understand. It should cover the necessary topics and provide a comprehensive {doc_type}, and how {target_reader_type} can use it effectively in their projects.

Please note that your outline should be flexible enough to allow for various relevant and creative headings and subheadings.
`;

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    const { more_info, doc_type, target_reader_type } = req.body;

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
            inputVariables: ["more_info", "doc_type", "target_reader_type"],
          });
        const chainB = new LLMChain({
            prompt: chatPrompt,
            llm: chat,
        });

        const systemMessage = new SystemChatMessage("");

        const response = await chainB.call({
            more_info,
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
