import { useRef, useState, useEffect, SetStateAction } from 'react';
import styles from '@/styles/TranslateCode.module.css';
import LoadingDots from '@/components/ui/LoadingDots';
import Dropdown from '@/components/ui/Dropdown';

const DOCTYPES = [
    "Overview",
    "Quick Start",
    "User guide",
    "Tutorials",
    "API Doc",
]

const TARGET_READER_TYPES = [
    "Developers",
    "Sales",
]

export default function GenerateDir() {
    const [targetReaderType, setTargetReaderType] = useState<string>('Developers');
    const [moreInfo, setMoreInfo] = useState<string>('payment SDK');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [answer, setAnswer] = useState<string>('');
    const [docType, setDocType] = useState<string>('Overview');

    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        textAreaRef.current?.focus();
    }, []);

    //handle form submission
    async function handleSubmit() {

        setError(null);

        setLoading(true);

        try {
            const response = await fetch('/api/call_openai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    function_type: 'generate_dir',
                    parameters: {
                        doc_type: docType,
                        target_reader_type: targetReaderType.trim(),
                        more_info: moreInfo.trim(),
                    }
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
                <main className={styles.main}>
                    <div className={styles.center}>
                        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', }}>
                            <Dropdown
                                className={styles.language_options}
                                options={DOCTYPES}
                                onOptionChange={(option: string) => { setDocType(option) }} />
                            <Dropdown
                                className={styles.language_options}
                                options={TARGET_READER_TYPES}
                                onOptionChange={(option: string) => { setTargetReaderType(option) }} />
                            <textarea
                                // disabled={loading}
                                // ref={textAreaRef}
                                autoFocus={false}
                                id="targetReaderType"
                                name="targetReaderType"
                                placeholder={
                                    loading
                                        ? 'Waiting for response...'
                                        : 'Doc Des'
                                }
                                defaultValue={moreInfo}
                                onChange={(e) => setMoreInfo(e.target.value)}
                                style={{ width: '100%', height: '100px' }}
                            />
                        </div>

                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            style={{ width: '50px', height: '50px' }}
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
