models = [
    {
      "source_name": "chatgpt",
      "children_models": [
        {
          "model_name": "gpt-4o",
          "model_id": "gpt-4o-2024-08-06",
          "model_capabilities": ["text-based", "image-based", "structured outputs"],
          "model_endpoint": "/v1/chat/completions"
        },
        {
          "model_name": "gpt-4o",
          "model_id": "gpt-4o-2024-11-20",
          "model_capabilities": ["text-based", "image-based", "structured outputs"],
          "model_endpoint": "/v1/chat/completions"
        },
        {
          "model_name": "gpt-4o",
          "model_id": "gpt-4o-2024-05-13",
          "model_capabilities": ["text-based", "image-based", "structured outputs"],
          "model_endpoint": "/v1/chat/completions"
        },
        # {
        #   "model_name": "chatgpt-4o-latest",
        #   "model_id": "dynamic",
        #   "model_capabilities": ["text-based", "image-based", "structured outputs"],
        #   "model_endpoint": "/v1/chat/completions"
        # },
        {
          "model_name": "gpt-4o-mini",
          "model_id": "gpt-4o-mini-2024-07-18",
          "model_capabilities": ["text-based", "image-based", "structured outputs"],
          "model_endpoint": "/v1/chat/completions"
        }
      ]
    },
    {
      "source_name": "gemini",
      "children_models": [
        {
          "model_name": "Gemini 2.0 Flash",
          "model_id": "gemini-2.0-flash-exp",
          "model_capabilities": ["audio-based", "image-based", "video-based", "text-based", "multimodal generation"],
          "model_endpoint": "/v1/gemini"
        },
        {
          "model_name": "Gemini 1.5 Flash",
          "model_id": "gemini-1.5-flash",
          "model_capabilities": ["audio-based", "image-based", "video-based", "text-based"],
          "model_endpoint": "/v1/gemini"
        },
        {
          "model_name": "Gemini 1.5 Flash-8B",
          "model_id": "gemini-1.5-flash-8b",
          "model_capabilities": ["audio-based", "image-based", "video-based", "text-based"],
          "model_endpoint": "/v1/gemini"
        },
        {
          "model_name": "Gemini 1.5 Pro",
          "model_id": "gemini-1.5-pro",
          "model_capabilities": ["audio-based", "image-based", "video-based", "text-based"],
          "model_endpoint": "/v1/gemini"
        }
      ]
    }
  ]


special_instructions = {
    'default': [
        {
            "role": "system",
            "content": "You are a helpful assistant."
        }
    ],
    'math-genius': [
        {
            'role': 'system',
            'content': 'You are an expert in mathematics, capable of solving complex equations and explaining mathematical concepts in a clear and concise manner. Your responses should be focused on helping users understand mathematical principles and solve problems effectively.'
        }
    ],
    'science-expert': [
        {
            'role': 'system',
            'content': 'You are a science educator with deep knowledge in various scientific disciplines, including physics, chemistry, and biology. Your goal is to provide educational content that helps users learn and understand scientific concepts, theories, and experiments.'
        }
    ],
    'language-tutor': [
        {
            'role': 'system',
            'content': 'You are a language tutor specializing in helping users improve their language skills. Whether it’s grammar, vocabulary, writing, or conversation, your responses should be educational and aimed at enhancing the user’s language proficiency.'
        }
    ],
    'history-scholar': [
        {
            'role': 'system',
            'content': 'You are a history scholar with extensive knowledge of global history. Your role is to provide accurate historical information, help users understand historical events, and discuss their significance in an educational context.'
        }
    ]
}
