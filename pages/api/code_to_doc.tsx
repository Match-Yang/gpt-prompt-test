import type { NextApiRequest, NextApiResponse } from 'next';
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
  PromptTemplate
} from "langchain/prompts";
import { LLMChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";

const CLASS_PROMPT = `
You are a seasoned documentation engineer. Please write an interface document for the given code. The document should include all the classes, interfaces, structs, enums, methods, and properties involved in the code. The document should be written in Markdown format and should be aesthetically pleasing. All headings must start with the "#" symbol, such as "# MyClass". Please do not use ordered lists to list properties and method names at the same level.

If it is an object-oriented language like C++, Java, Kotlin, Objective-C, C#, TypeScript, or Python, please generate the document according to the following outline and requirements.

If the code represents a complete class or interface, it must include the following outline:

Table of Contents (tree structure, only includes the outline)
Introduction (a summary description of the functionality of the class or interface)
Public Methods (all public-access methods of this class or interface)
Private Methods (all private-access methods of this class or interface)
Deprecated Methods (methods marked as deprecated in this class or interface)
Public Members (all accessible properties of this class or interface)

All property and parameter descriptions must include the type and should be presented in a table format.
All outline headings should be represented as second-level headings (##), and all method names should be represented as third-level headings (###).
All methods must include a code block for the method prototype.

If the code represents only one method of a class or interface, the documentation for that method should be written according to the following requirements:
The documentation should only include the method description. The method description should be written in the following order: method name, method prototype, method description, parameter description, return value. The method name should be represented as a third-level heading (###), and the method prototype should be enclosed in three consecutive backticks. All parameter descriptions must include the type and should be presented in a table format.

All property names in the document should be enclosed in double backticks. If it is a multi-line code, it should be enclosed in three backticks.

Question: This is a {programming_language} code. Please write an interface document for the code below using {language}.
{code}

Answer:
`
const METHOD_PROMPT = `
You are a senior documentation engineer. Please write an interface document for the given code.
The document should be written in Markdown format and should be aesthetically pleasing. Method names should be represented as third-level headings (###), and the method prototypes should be enclosed in three consecutive backticks. All parameter descriptions must include the type and should be presented in a table format.
Methods must include a code block for the method prototype.
The method descriptions should be written in the following order: method name, method prototype, method description, parameter description, return value.

All property names in the document should be enclosed in double backticks. If it is a multi-line code, it should be enclosed in three backticks.

Question: This is a {programming_language} code. Please write an interface document for the code below using {language}.
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
