from flask import Blueprint, render_template, send_file, redirect
from time import time
from os import urandom

website_bp = Blueprint('website', __name__)

class Website:
    def __init__(self, app):
        self.app = app
        self.routes = {
            '/': {
                'function': self.home,
                'methods': ['GET'],
            },
            '/chat/': {
                'function': self.chat_index,
                'methods': ['GET'],
            },
            '/chat/<conversation_id>': {
                'function': self.chat,
                'methods': ['GET'],
            },
            '/assets/<folder>/<file>': {
                'function': self.assets,
                'methods': ['GET'],
            },
        }

    def home(self):
        return redirect('/chat')

    def chat_index(self):
        return render_template('index.html', chat_id=f'{urandom(4).hex()}-{urandom(2).hex()}-{urandom(2).hex()}-{urandom(2).hex()}-{hex(int(time() * 1000))[2:]}')

    def chat(self, conversation_id):
        if not '-' in conversation_id:
            return redirect('/chat')
        return render_template('index.html', chat_id=conversation_id)

    def assets(self, folder: str, file: str):
        try:
            return send_file(f"./../client/{folder}/{file}", as_attachment=False)
        except:
            return "File not found", 404
