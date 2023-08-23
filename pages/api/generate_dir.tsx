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

const SYSTEM_PROMPT = ``;
const USER_PROMPT = `
You are a professional documentation engineer, and your task is to create a documentation website. I will provide you with a brief description of the document's topic, its type, and the intended audience.
Please generate a directory tree suitable for this documentation website based on the given information. Generate the directory tree according to the specific details, providing as much detail as possible. The directory tree should have a minimum of two levels and a maximum of three levels, with the final level being the files. Please include at least three top-level directories. All names should be in English.
Return the result to me in JSON format. Here is an example of the JSON format:

Question:
The document's topic is [Payment SDK Introduction], the document type is [Development Documentation], and it is targeted towards [Beginner Developers].

Answer:
{{
    "title": "Introduction",
    "type": "folder",
    "key": "Introduction",
    "children": [
        {{
            "title": "Getting Started",
            "type": "file",
            "key": "Introduction/Getting Started",
            "children": [
            ]
        }}
    ]
}}

Question: 
The document's topic is [{doc_desc}], the document type is [{doc_type}], and it is targeted towards [{target_reader_type}].

Answer:
`

async function readPromptFromGithub(key: string) {
    const response = await fetch('https://raw.githubusercontent.com/Match-Yang/gpt-prompt-test/main/prompt.json');
    const data = await response.json();
    return data[key];
}

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

        const chatPrompt = new PromptTemplate({
            template: USER_PROMPT,
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