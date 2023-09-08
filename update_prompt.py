import re
import requests

# 打开文件并读取内容
with open('pages/api/call_openai.tsx', 'r') as file:
    content = file.read()

# 定义要提取的变量名称列表
variable_names = [
    'PROMPT_CODE_TO_DOC_CLASS',
    'PROMPT_CODE_TO_DOC_FUNCTION',
    'PROMPT_CODE_TO_DOC_GENERAL',
    'PROMPT_ENHANCE_CODE',
    'PROMPT_EXPLAIN_CODE',
    'PROMPT_GENERATE_DIR',
    'PROMPT_GENERATE_OUTLINE',
    'PROMPT_GENERATE_OUTLINE_WITHOUT_MORE_INFO',
    'PROMPT_IMPROVE_WRITING',
    'PROMPT_MAKE_SHORTER',
    'PROMPT_MAKE_LONGER',
    'PROMPT_FIX_SPELLING_AND_GRAMMAR',
    'PROMPT_TRANSLATE_CODE',
    'PROMPT_TRANSLATE'
]

# 初始化变量值的字典
variable_values = {}

# 遍历变量名称列表，提取对应的变量值
for variable_name in variable_names:
    pattern = r'const {}\s*=\s*`([\s\S]*?)`'.format(variable_name)
    match = re.search(pattern, content)
    if match:
        v = match.group(1)
        v = re.sub(r'{([a-zA-Z_]+)}', r'$$.\g<1>$$', v)
        v = v.replace("{{", "{").replace("}}", "}")
        variable_values[variable_name] = v
    else:
        variable_values[variable_name] = ""

code_to_doc_prompt = """
$$if ne .doc_type "API explanation"$$
{general}
$$else$$
$$if eq .code_type "class/interface"$$
{interface}
$$else$$
{func}
$$end$$
$$end$$
""".format(general=variable_values["PROMPT_CODE_TO_DOC_GENERAL"], interface=variable_values["PROMPT_CODE_TO_DOC_CLASS"], func=variable_values["PROMPT_CODE_TO_DOC_FUNCTION"])
# 定义一个Object列表

outline_prompt = """
$$if eq .more_info ""$$
{without_more_info}
$$else$$
{with_more_info}
$$end$$
""".format(without_more_info=variable_values["PROMPT_GENERATE_OUTLINE_WITHOUT_MORE_INFO"], with_more_info=variable_values["PROMPT_GENERATE_OUTLINE"])
prompt_objects = [
    {
        "prompt_id": 1,
        "prompt": code_to_doc_prompt,
        "temperature": 0,
        "status": 1
    },
    {
        "prompt_id": 2,
        "prompt": variable_values["PROMPT_ENHANCE_CODE"],
        "temperature": 0,
        "status": 1
    },
    {
        "prompt_id": 3,
        "prompt": variable_values["PROMPT_EXPLAIN_CODE"],
        "temperature": 0,
        "status": 1
    },
    {
        "prompt_id": 4,
        "prompt": variable_values["PROMPT_TRANSLATE_CODE"],
        "temperature": 0,
        "status": 1
    },
    {
        "prompt_id": 5,
        "prompt": variable_values["PROMPT_FIX_SPELLING_AND_GRAMMAR"],
        "temperature": 0.5,
        "status": 1
    },
    {
        "prompt_id": 6,
        "prompt": variable_values["PROMPT_GENERATE_DIR"],
        "temperature": 0.5,
        "status": 1
    },
    {
        "prompt_id": 7,
        "prompt": outline_prompt,
        "temperature": 0.5,
        "status": 1
    },
    {
        "prompt_id": 8,
        "prompt": variable_values["PROMPT_IMPROVE_WRITING"],
        "temperature": 0.5,
        "status": 1
    },
    {
        "prompt_id": 9,
        "prompt": variable_values["PROMPT_MAKE_SHORTER"],
        "temperature": 0.5,
        "status": 1
    },
    {
        "prompt_id": 10,
        "prompt": variable_values["PROMPT_MAKE_LONGER"],
        "temperature": 0.5,
        "status": 1
    },
    {
        "prompt_id": 11,
        "prompt": variable_values["PROMPT_TRANSLATE"],
        "temperature": 0.5,
        "status": 1
    }
]
    
def execute_curl_command(data):
    url = ''
    headers = {
        'Content-Type': 'application/json'
    }

    response = requests.post(url, headers=headers, json=data)

    # 输出响应结果
    print("Response Status Code:", response.status_code)
    print("Response Body:", response.text)

# for循环读取prompt_objects用作参数执行指令
for prompt_object in prompt_objects:
    # 打印prompt_object中的prompt_id
    print("Updating: ", prompt_object["prompt_id"])
    execute_curl_command(prompt_object)