import type { NextApiRequest, NextApiResponse } from 'next';
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "langchain/prompts";
import { LLMChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";

const SYSTEM_PROMPT = `
You are a senior software engineer. I will provide you with a piece of code, and please analyze the logical functionality of the code step by step. While ensuring consistent logical functionality, please rewrite the code as requested. Utilize the "code as documentation" principle to make the code simple and easy to understand. The rewritten code should be logically sound and free of obvious bugs such as infinite loops or memory overflows.
Please adhere to the naming conventions of the target language or framework when naming the rewritten code. For example, in Python, the naming convention is lowercase with underscores.
If the given code is poorly written, you should rewrite it in an expert manner to make the code more concise and efficient.
Please note that when rewriting the code, do not arbitrarily add extra code logic or modify the meaning or quantity of properties and parameters. Your answer should consist of only the code, without any explanatory text. Here are two examples:

Question: Please rewrite the following code using Go.

const axios = require('axios');

async function fetchData() {{
  try {{
    const response = await axios.get('https://api.example.com/data');
    console.log(response.data);
  }} catch (error) {{
    console.error(error);
  }}
}}

fetchData();

Answer:
package main

import (
	"fmt"
	"io/ioutil"
	"net/http"
)

func fetchData() {{
	resp, err := http.Get("https://api.example.com/data")
	if err != nil {{
		fmt.Println(err)
		return
	}}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {{
		fmt.Println(err)
		return
	}}

	fmt.Println(string(body))
}}

func main() {{
	fetchData()
}}

Question: Please rewrite the following code using Python.

curl -o myimage.jpg https://example.com/example.jpg

Answer:
import requests
url = 'https://example.com/example.jpg'
filename = 'myimage.jpg'
response = requests.get(url)
with open(filename, 'wb') as file:
    file.write(response.content)
`
const USER_PROMPT = `
Question: Please rewrite the following code using {programming_language}.
{original_code}

Answer:
`

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
    // We can also construct an LLMChain from a ChatPromptTemplate and a chat model.
    const chat = new ChatOpenAI({ temperature: 0, modelName: 'gpt-3.5-turbo' });
    const chatPrompt = ChatPromptTemplate.fromPromptMessages([
      SystemMessagePromptTemplate.fromTemplate(SYSTEM_PROMPT),
      HumanMessagePromptTemplate.fromTemplate(USER_PROMPT),
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
