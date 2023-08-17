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

const CLASS_PROMPT = `
你是一个资深文档工程师，请为这段代码写一篇接口文档。文档需要包含代码里涉及的所有类、接口、结构体、枚举、方法、属性等。
文档用Markdown格式来写，需要美观大方。所有标题必须以 # 号开头，比如 # MyClass；不要使用有序列表来列举平级的属性和方法名等。

如果是C++、Java、Kotlin、OC、C#、TypeScript、Python这类面相对象语言，请按照下面大纲和要求生成文档
如果代码是完整的类或者接口，必须包含如下大纲：
Table of Contents（目录树，只包含大纲）
Introduction（对这个类或者接口的功能总结描述）
Public Methods（这个类或者接口的所有 public 访问域的方法）
Private Methods（这个类或者接口的所有 private 访问域的方法）
Deprecated Methods（这个类或者接口中被标志为弃用的方法）
Public Members（这个类或者接口所有对外能访问的属性）

所有属性和参数的说明必须说明类型，必须用表格来说明。
所有大纲标题用二级标题表示（##），所有方法名用三级标题表示（###）。
所有方法必须包含方法原型代码块。

如果代码只是一个类或者接口的其中一个方法，那么该方法的文档需要按以下要求编写：
文档只包含方法说明。方法说明按方法名、方法原型、方法描述、参数说明、返回值这样的顺序编写。方法名使用三级标题（###）表示，方法原型使用三个连续的backtick包裹起来。所有参数的说明必须说明类型，必须用表格来说明。

文档所有属性名都用两个backtick括起来。如果是多行代码则用三个backtick括起来。

Question: 这是一段 {programming_language} 代码，请用 {language} 为下面代码写一篇接口文档
{code}

Answer:
`
const METHOD_PROMPT = `
你是一个资深文档工程师，请为这段代码写一篇接口文档。
文档用Markdown格式来写，需要美观大方。方法名使用三级标题（###）表示，方法原型使用三个连续的backtick包裹起来。所有参数的说明必须说明类型，必须用表格来说明。
方法必须包含方法原型代码块。
方法说明按方法名、方法原型、方法描述、参数说明、返回值这样的顺序编写。

文档所有属性名都用两个backtick括起来。如果是多行代码则用三个backtick括起来。

Question: 这是一段 {programming_language} 代码，请用 {language} 为下面代码写一篇接口文档
{code}

Answer:
`

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { content, language, programmingLanguage, codeType } = req.body;

  console.log('language:', language);
  console.log('content:', content);
  console.log('codeType:', codeType);

  //only accept post requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!content) {
    return res.status(400).json({ message: 'No content in the request' });
  } else if (!language) {
    return res.status(400).json({ message: 'No language in the request' });
  };
  // OpenAI recommends replacing newlines with spaces for best results
  const sanitizedContent = content.trim().replaceAll('\n', ' ');

  try {
    const gptModelName = content.length > 2500 ? 'gpt-3.5-turbo-16k' : 'gpt-3.5-turbo'
    // We can also construct an LLMChain from a ChatPromptTemplate and a chat model.
    const chat = new ChatOpenAI({ temperature: 0, modelName: gptModelName });

    const promptStr = codeType === 'class/interface' ? CLASS_PROMPT : METHOD_PROMPT;
    const chatPrompt = new PromptTemplate({
      template: promptStr,
      inputVariables: ["language", "code", "programming_language"],
    });
    const chainB = new LLMChain({
      prompt: chatPrompt,
      llm: chat,
    });

    // const systemMessage = new SystemChatMessage(SYSTEM_PROMPT);

    const response = await chainB.call({
      language,
      programming_language: programmingLanguage,
      code: sanitizedContent,
      // messages: [systemMessage]
    });

    console.log('response', response);
    res.status(200).json(response);
  } catch (error: any) {
    console.log('error', error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
}
