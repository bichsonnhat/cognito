import replicate
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get API token from environment variables
REPLICATE_API_TOKEN = os.getenv("REPLICATE_API_TOKEN")

if not REPLICATE_API_TOKEN:
    raise ValueError("REPLICATE_API_TOKEN environment variable is not set. Please create a .env file with this variable.")

input = {
    "text": "Hạnh phúc luôn là niềm khao khát lớn nhất của con người. Tùy vào hiểu biết của mỗi người qua từng xã hội và từng thời đại, mà hạnh phúc được quan niệm một cách khác nhau. Những người cứ gặp phải xui rủi triền miên, nên họ quả quyết rằng trên đời này làm gì có hạnh phúc. Còn những người trẻ thì cứ mơ mộng hạnh phúc chắc hẳn rất tuyệt diệu và tin rằng nó chỉ nằm ở cuối con đường mình đang đi. Và hằng bao lớp người đã đi gần hết kiếp nhân sinh mà vẫn đuổi theo hạnh phúc như trò chơi cút bắt: có khi tóm được nó thì nó lại tan biến, có khi ngỡ mình tay trắng thì lại thấy nó chợt hiện về. Mặc dù ai cũng mong muốn có hạnh phúc, nhưng khi được hỏi hạnh phúc là gì thì phần lớn mọi người đều rất lúng túng. Họ định nghĩa một cách rất mơ hồ, hoặc chỉ mỉm cười trong mặc cảm.",
    "speaker": "https://replicate.delivery/pbxt/KibHoI1aA7kYweYgeSV2fFOY67QwEuZNe5l1tFX7Z6FkaEoi/samples_nu-luu-loat.wav"
}

output = replicate.run(
    "suminhthanh/vixtts:5222190b47dfb128cd588f07dadb78107aa489bdcd0af45814d7841d47f608c6",
    input=input,
    api_token=REPLICATE_API_TOKEN
)
print(output)