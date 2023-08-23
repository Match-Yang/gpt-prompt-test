const PROMPT_GENERATE_DIR = `
You are a professional documentation engineer, and your task is to create a documentation website. I will provide you with a brief description of the document's topic, its type, and the intended audience.
Please generate a directory tree suitable for this documentation website based on the given information. Generate the directory tree according to the specific details, providing as much detail as possible. The directory tree should have a minimum of two levels and a maximum of three levels, with the final level being the files. Please include at least three top-level directories. All names should be in English.
Return the result to me in JSON format. Here is an example of the JSON format:

Question:
The document's topic is [Payment SDK Introduction], the document type is [Development Documentation], and it is targeted towards [Beginner Developers].

Answer:
{{
    "title": "Introduction",
    "type": "folder",
    "key": "Introduction",
    "children": [
        {{
            "title": "Getting Started",
            "type": "file",
            "key": "Introduction/Getting Started",
            "children": [
            ]
        }}
    ]
}}

Question: 
The document's topic is [{doc_desc}], the document type is [{doc_type}], and it is targeted towards [{target_reader_type}].

Answer:
`

export default {
    PROMPT_GENERATE_DIR
}