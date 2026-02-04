import re

# Read the file
with open(r'c:\Users\Haryan\source\repos\Lativectors\src\pages\AdminDashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern to match the status indicator div
pattern = r'<div className=\{`absolute -top-0\.5 -right-0\.5.*?title=\{.*?\}>\s*</div>'

# Replacement
replacement = '<UserStatusIndicator is_active={u.is_active} is_verified={u.is_verified} is_online={u.is_online} />'

# Replace
content = re.sub(pattern, replacement, content, flags=re.DOTALL)

# Write back
with open(r'c:\Users\Haryan\source\repos\Lativectors\src\pages\AdminDashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("AdminDashboard.tsx updated successfully")
