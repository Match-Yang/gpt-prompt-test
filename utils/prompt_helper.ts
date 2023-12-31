export default async function readPromptFromGithub(key: string) {
    try {
        const response = await fetch(`https://raw.githubusercontent.com/Match-Yang/gpt-prompt-test/main/prompts/${key}.txt`);
        const data = await response.text();
        return data;
    } catch (e) {
        console.log("readPromptFromGithub: ",e);
        return '';
    }
}