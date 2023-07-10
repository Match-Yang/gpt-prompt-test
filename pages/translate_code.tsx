import { useRef, useState, useEffect } from 'react';
import styles from '@/styles/TranslateCode.module.css';
import LoadingDots from '@/components/ui/LoadingDots';
import Dropdown from '@/components/ui/DropDown';

const PROGRAMMING_LANGUAGES = [
    "Python",
    "JavaScript",
    "Java",
    "C++",
    "C#",
    "PHP",
    "TypeScript",
    "Swift",
    "Objective-C",
    "Go",
    "Kotlin",
    "Rust",
    "SQL",
    "Ruby",
    "Perl"
]

export default function TranslateCode() {
    const [query, setQuery] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [answer, setAnswer] = useState<string>('');
    const [targetLanguage, setTargetLanguage] = useState<string>('');

    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        textAreaRef.current?.focus();
    }, []);

    //handle form submission
    async function handleSubmit(e: any) {
        e.preventDefault();

        setError(null);

        if (!query) {
            alert('Please input a question');
            return;
        }

        const content = query.trim();

        setLoading(true);

        try {
            const response = await fetch('/api/enhanced_code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content
                }),
            });
            const data = await response.json();
            console.log('data', data);

            if (data.error) {
                setError(data.error);
            } else {
                setAnswer(data.text)
            }

            setLoading(false);
        } catch (error) {
            setLoading(false);
            setError('An error occurred while fetching the data. Please try again.');
            console.log('error', error);
        }
    }

    return (
        <>
            <div className="mx-auto flex flex-col gap-4">
                <h1 className="text-2xl font-bold leading-[1.1] tracking-tighter text-center">
                    Translate Code
                </h1>
                <main className={styles.main}>
                    <div className={styles.center}>
                        <div className={styles.cloudform}>
                            <form onSubmit={handleSubmit} className={styles.cloudform}>
                                <textarea
                                    disabled={loading}
                                    // onKeyDown={handleEnter}
                                    ref={textAreaRef}
                                    autoFocus={false}
                                    id="userInput"
                                    name="userInput"
                                    placeholder={
                                        loading
                                            ? 'Waiting for response...'
                                            : 'What is the code?'
                                    }
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className={styles.textarea}
                                />
                            </form>
                        </div>
                    </div>
                    <div className={styles.options_section}>
                        <Dropdown
                            className={styles.language_options}
                            options={PROGRAMMING_LANGUAGES}
                            onOptionChange={(option) => { setTargetLanguage(option) }} />

                        <button
                            type="submit"
                            disabled={loading}
                            className={styles.generatebutton}
                        >
                            {loading ? (
                                <div className={styles.loadingwheel}>
                                    <LoadingDots color="#000" />
                                </div>
                            ) : (
                                // Send icon SVG in input field
                                <svg
                                    viewBox="0 0 20 20"
                                    className={styles.svgicon}
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
                                </svg>
                            )}
                        </button>
                    </div>
                    <div className={styles.cloud}>
                        <textarea className={styles.answer} value={answer}></textarea>
                    </div>
                    {error && (
                        <div className="border border-red-400 rounded-md p-4">
                            <p className="text-red-500">{error}</p>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}
