from flask_mail import Mail, Message
from flask import Flask
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False

mail = Mail(app)

print(f'Testing email with: {app.config["MAIL_USERNAME"]}')

try:
    with app.app_context():
        msg = Message('Test Email', sender=app.config['MAIL_USERNAME'], recipients=['test@example.com'])
        msg.body = 'This is a test email'
        mail.send(msg)
        print('Email sent successfully!')
except Exception as e:
    print(f'Email failed: {e}')
    import traceback
    traceback.print_exc()
