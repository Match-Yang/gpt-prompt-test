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

const SYSTEM_PROMPT = `
你是一个资深软件工程师，我会给你一段代码，请逐步分析代码的逻辑功能，在保证逻辑功能一致的前提下按要求改写代码。
请基于code as doc原理尽可能将代码改得简单易理解。你改写的代码在逻辑上是完全合理的，且不会出现死循环或者内存溢出这种明显的bug。
请按照目标语言或者框架的命名习惯对改写后的代码进行命名，比如Python的命名习惯是小写加下划线命名。
如果所给的代码写得像个菜鸟，那你应该用高手的方式对其进行改写，让代码变得更简洁高效。
注意改写时不要随意增加额外代码逻辑或者修改属性和参数意义或者数量。你的答案只有代码，没有任何的解释说明。下面是2个示例：

Question: 请用 go 改写以下代码

const axios = require('axios');

async function fetchData() {
  try {
    const response = await axios.get('https://api.example.com/data');
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
}

fetchData();

Answer:
package main

import (
	"fmt"
	"io/ioutil"
	"net/http"
)

func fetchData() {
	resp, err := http.Get("https://api.example.com/data")
	if err != nil {
		fmt.Println(err)
		return
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		fmt.Println(err)
		return
	}

	fmt.Println(string(body))
}

func main() {
	fetchData()
}

Question: 请用Python改写以下代码

curl -o myimage.jpg https://example.com/example.jpg

Answer:
import requests
url = 'https://example.com/example.jpg'
filename = 'myimage.jpg'
response = requests.get(url)
with open(filename, 'wb') as file:
    file.write(response.content)
`;
const USER_PROMPT = `
Question: 请用 {programming_language} 改写以下代码
{original_code}

Answer:
`

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    const { content, programming_language } = req.body;

    console.log('programming_language:', programming_language);
    console.log('content:', content);

    //only accept post requests
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    if (!content) {
        return res.status(400).json({ message: 'No content in the request' });
    } else if (!programming_language) {
        return res.status(400).json({ message: 'No programming language in the request' });
    };
    // OpenAI recommends replacing newlines with spaces for best results
    const sanitizedContent = content.trim().replaceAll('\n', ' ');

    try {
        // We can also construct an LLMChain from a ChatPromptTemplate and a chat model.
        const chat = new ChatOpenAI({ temperature: 0 });

        // const chatPrompt = ChatPromptTemplate.fromPromptMessages([
        //     SystemMessagePromptTemplate.fromTemplate(SYSTEM_PROMPT),
        //     HumanMessagePromptTemplate.fromTemplate(USER_PROMPT),
        //   ]);
        const chatPrompt = new PromptTemplate({
            template: USER_PROMPT,
            inputVariables: ["programming_language", "original_code"],
          });
        const chainB = new LLMChain({
            prompt: chatPrompt,
            llm: chat,
        });

        const systemMessage = new SystemChatMessage(SYSTEM_PROMPT);

        const response = await chainB.call({
            programming_language,
            original_code: sanitizedContent,
            messages: [systemMessage]
        });

        console.log('response', response);
        res.status(200).json(response);
    } catch (error: any) {
        console.log('error', error);
        res.status(500).json({ error: error.message || 'Something went wrong' });
    }
}
