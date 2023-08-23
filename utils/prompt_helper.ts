async function readPromptFromGithub(key: string) {
    const response = await fetch(`https://raw.githubusercontent.com/Match-Yang/gpt-prompt-test/main/prompts/${key}.txt`);
    const data = await response.text;
    return data;
}

export default { readPromptFromGithub };