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
你是一个资深文档工程师，请为这段代码写一篇接口文档。文档需要包含代码里涉及的所有类、接口、结构体、枚举、方法、属性等。
文档用Markdown格式来写，需要美观大方。所有标题必须以 # 号开头，比如 # MyClass；不要使用有序列表来列举平级的属性和方法名等。有必要的情况就使用表格来显示属性和参数等。
属性和方法按访问域（如public、private等）划分到不同章节中。
文档所有属性名都用两个backtick括起来，所有多行代码都用<zcode></zcode>标签括起来。
以下是一个示例：

Question: 请用英文为下面代码写一篇接口文档
class MyClass : public MyInterface {
  public:
   MyClass() : color_(Color::Red), direction_(Direction::Up), point_({0, 0}) {}
 
   void setColor(Color color) { color_ = color; }
   Color getColor() const { return color_; }
 
   void setPoint(Point point) { point_ = point; }
   Point getPoint() const { return point_; }
  private: 
   void doSomething() override {
     // ...
   }
 
   void doSomething(int value) {
     // ...
   }
 
   void doSomething(double value) {
     // ...
   }
 
  private:
   Color color_;
   Direction direction_;
   Point point_;
 };


Answer:
# MyClass

A class that implements the MyInterface interface.

## Constructors

- MyClass(): Constructs a MyClass object with the default color (Color::Red), direction (Direction::Up), and point coordinates ({0, 0}).

## Public Methods

- setColor(Color color): Sets the color of the MyClass object.
- getColor() const: Returns the color of the MyClass object.
- setPoint(Point point): Sets the point coordinates of the MyClass object.
- getPoint() const: Returns the point coordinates of the MyClass object.

## Private Methonds
- doSomething(): Overrides the doSomething() method from the MyInterface interface. Performs some operations specific to the MyClass object.
- doSomething(int value): Overloads the doSomething() method with an integer parameter. Performs some operations specific to the MyClass object using the provided integer value.
- doSomething(double value): Overloads the doSomething() method with a double parameter. Performs some operations specific to the MyClass object using the provided double value.

## Private Members

- color_: Represents the color of the MyClass object.
- direction_: Represents the direction of the MyClass object.
- point_: Represents the point coordinates of the MyClass object.
`;
const USER_PROMPT = `
你是一个资深文档工程师，请为这段代码写一篇接口文档。文档需要包含代码里涉及的所有类、接口、结构体、枚举、方法、属性等。
文档用Markdown格式来写，需要美观大方。所有标题必须以 # 号开头，比如 # MyClass；不要使用有序列表来列举平级的属性和方法名等。所有属性和参数的说明必须说明类型，必须用表格来说明。
属性和方法按访问域（如public、private等）划分到不同章节中。
如果给定的代码只是一个大的类或者接口的一个方法或者属性，那么也要按照类或者接口中的方法或者属性的文档格式来编写文档。
文档所有属性名都用两个backtick括起来。如果是多行代码则用三个backtick括起来。

Question: 这是一段 {programming_language} 代码，请用 {language} 为下面代码写一篇接口文档
{code}

Answer:
`

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    const { content, language, programmingLanguage } = req.body;

    console.log('language:', language);
    console.log('content:', content);

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
        // We can also construct an LLMChain from a ChatPromptTemplate and a chat model.
        const chat = new ChatOpenAI({ temperature: 0, modelName: 'gpt-3.5-turbo-16k'});

        const chatPrompt = new PromptTemplate({
            template: USER_PROMPT,
            inputVariables: ["language", "code", "programming_language"],
          });
        const chainB = new LLMChain({
            prompt: chatPrompt,
            llm: chat,
        });

        const systemMessage = new SystemChatMessage(SYSTEM_PROMPT);

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
