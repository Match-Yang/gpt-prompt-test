import type { NextApiRequest, NextApiResponse } from 'next';
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "langchain/prompts";
import { LLMChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";

const SYSTEM_PROMPT = `
你是一个资深软件工程师，我会给你一段代码，请逐步分析代码的逻辑功能，在保证逻辑功能一致的前提下请按统一风格对代码命名和排版进行优化，同时基于code as doc原理尽可能将代码改得简单易理解。
如果所给的代码写得像个菜鸟，那你应该用高手的方式对其进行改写，让代码变得更简洁高效。下面是2个示例：
Question:
def func1(x1,x2):
    a=x1
    b=x2
    c=a+b
    d=c*10
    e=[]
    for i in range(d):
        e.append(i*2)
    return e

Answer:
def sum_and_multiply(x1, x2):
    # Rename variables to be more descriptive
    num1 = x1
    num2 = x2

    # Calculate the sum and multiply it by 10
    total_sum = num1 + num2
    multiplied_sum = total_sum * 10

    # Create an empty list to store the results
    result_list = []

    # Iterate through the range of the multiplied sum
    for i in range(multiplied_sum):
        # Append the double of each value to the list
        result_list.append(i * 2)

    return result_list

Question:
def reverse_string(input_str):
    reversed_str = ''
    for i in range(len(input_str)-1, -1, -1):
        reversed_str += input_str[i]
    return reversed_str
input_str = 'Hello, World!'
reversed_str = reverse_string(input_str)
print(reversed_str)

Answer:
def reverse_string(input_str):
    return input_str[::-1]
input_str = 'Hello, World!'
reversed_str = reverse_string(input_str)
print(reversed_str)
`;
const USER_PROMPT = `
Question:
{original_code}

Answer:
`

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { content } = req.body;

  console.log('content', content);

  //only accept post requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!content) {
    return res.status(400).json({ message: 'No content in the request' });
  }
  // OpenAI recommends replacing newlines with spaces for best results
  const sanitizedContent = content.trim().replaceAll('\n', ' ');

  try {
    // We can also construct an LLMChain from a ChatPromptTemplate and a chat model.
    const chat = new ChatOpenAI({ temperature: 0 });
    const chatPrompt = ChatPromptTemplate.fromPromptMessages([
      SystemMessagePromptTemplate.fromTemplate(SYSTEM_PROMPT),
      HumanMessagePromptTemplate.fromTemplate(USER_PROMPT),
    ]);
    const chainB = new LLMChain({
      prompt: chatPrompt,
      llm: chat,
    });

    const response = await chainB.call({
      original_code: sanitizedContent,
    });

    console.log('response', response);
    res.status(200).json(response);
  } catch (error: any) {
    console.log('error', error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
}
