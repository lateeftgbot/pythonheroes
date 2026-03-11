import os
import smtplib
from email.mime.text import MIMEText
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_email():
    server = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
    port = int(os.getenv('MAIL_PORT', 587))
    username = os.getenv('MAIL_USERNAME')
    password = os.getenv('MAIL_PASSWORD')
    
    print(f"Testing SMTP connection to {server}:{port} as {username}...")
    
    try:
        msg = MIMEText("This is a test email from the Lativectors diagnostic script.")
        msg['Subject'] = "Lativectors SMTP Test"
        msg['From'] = username
        msg['To'] = "lateefolayinka97@gmail.com"
        
        # Connect and send
        s = smtplib.SMTP(server, port, timeout=10)
        s.starttls()
        s.login(username, password)
        s.send_message(msg)
        s.quit()
        print("SUCCESS: Email sent successfully!")
        return True
    except Exception as e:
        print(f"FAILURE: Could not send email. Error: {e}")
        return False

if __name__ == "__main__":
    test_email()
